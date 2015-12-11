
/*global
    msos: false,
    mep: false,
    jQuery: false,
    Modernizr: false,
    Backbone: false,
    _: false
*/

msos.provide("mep.play.video");
msos.require("mep.player");
msos.require("msos.i18n.player");

mep.play.video.version = new msos.set_version(15, 12, 7);


mep.play.video.defaults = function () {
	"use strict";

	this.config = {
		i18n: msos.i18n.player.bundle,
		// auto:	attempts to detect what the browser can do
		// native:	forces HTML5 playback
		// shim:	disallows HTML5, will attempt Flash
		mode: _.indexOf(['auto', 'native', 'shim'], msos.config.query.player_mode) > 0 ? msos.config.query.player_mode : 'auto',
		poster: '',
		// remove or reorder to change plugin priority and availability
		plugins: ['flash', 'youtube', 'vimeo'],
		// name of plugin specific required external file
		flash_uri: msos.resource_url('mep', 'shim/218/flashmediaelement.swf'),
		// streamer for RTMP streaming
		flashStreamer: '',
		// set to 'always' for CDN version
		flashScriptAccess: 'sameDomain',
		// turns on the smoothing filter in Flash
		enablePluginSmoothing: false,
		// enabled pseudo-streaming (seek) on .mp4 files
		enablePseudoStreaming: false,
		// start query parameter sent to server for pseudo-streaming
		pseudoStreamingStartQueryParam: 'start',
		// default amount to move back when back key is pressed		
		defaultSeekBackwardInterval: function (media) {
			return (media.duration * 0.05);
		},
		// default amount to move forward when forward key is pressed				
		defaultSeekForwardInterval: function (media) {
			return (media.duration * 0.05);
		},
		// additional plugin variables in 'key=value' form
		pluginVars: [],
		// rate in milliseconds for Flash to fire the timeupdate event
		// larger number is less accurate, but less strain on plugin->JavaScript bridge
		timerRate: 250,
		// initial volume for player
		startVolume: 0.8,
		// useful for <audio> player loops
		loop: false,
		// rewind to beginning when media ends
        autoRewind: true,
		// forces the hour marker (##:00:00)
		alwaysShowHours: false,
		// show framecount in timecode (##:00:00:00)
		showTimecodeFrameCount: false,
		// used when showTimecodeFrameCount is set to true
		framesPerSecond: 25,
		// Hide controls when playing and mouse is not over the video
		alwaysShowControls: false,
        // Enable click video element to toggle play/pause
        clickToPlayPause: true,
		// whenthis player starts, it will pause other players
		pauseOtherPlayers: true,

        plugin_capabilities: {
            flash: [
                {
                    version: [9, 0, 124],
					types: [
						'video/mp4', 'video/m4v', 'video/mov', 'video/flv', 'video/rtmp', 'video/x-flv',
						'video/youtube', 'video/x-youtube', 'video/dailymotion', 'video/x-dailymotion', 'application/x-mpegURL'
					]
                }
            ],
            youtube: [
                {
                    version: null,
                    types: ['video/youtube', 'video/x-youtube']
                }
            ],
            vimeo: [
                {
                    version: null,
                    types: ['video/vimeo', 'video/x-vimeo']
                }
            ]
        }
	};

    // Additional available: 'contextmenu', 'tracks', 'sourcechooser', 'postroll', 'loop', 'fullscreen', 'speedselect'
    this.features_by_size = {
		'desktop':	['poster', 'overlays', 'playpause', 'current', 'progress', 'duration', 'skipback', 'jumpforward', 'volume', 'stop', 'keyboard'],
        'large':	['poster', 'overlays', 'playpause', 'current', 'progress', 'duration', 'skipback', 'jumpforward', 'volume', 'stop', 'keyboard'],
        'medium':	['poster', 'overlays', 'playpause', 'current', 'progress', 'duration', 'volume', 'stop'],
        'small':	['poster', 'overlays', 'playpause', 'current', 'progress', 'duration', 'volume', 'stop'],
        'tablet':	['poster', 'overlays', 'playpause', 'current', 'progress', 'duration'],
        'phone':	['poster', 'overlays', 'playpause', 'current', 'progress', 'duration'],
		'custom':	['playpause', 'current', 'progress', 'duration']
    };

	this.size = msos.config.size || 'custom';	// default is the minimal version 'custom', which can be anything you want

    this.format = {
        m4v: {
            codec: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
            flash: true
        },
        ogv: {
            codec: 'video/ogg; codecs="theora, vorbis"',
            flash: false
        },
        webmv: {
            codec: 'video/webm; codecs="vp8, vorbis"',
            flash: false
        },
        flv: {
            codec: 'video/x-flv',
            flash: true
        },
        rtmpv: {
            codec: 'video/rtmp; codecs="rtmp"',
            flash: true
        }
    };

	this.html5 = {
		types: [
			'video/mp4', 'video/webm', 'video/ogg', 'video/flv', 'video/x-flv'
		]
	};

	return this;
};

mep.play.video.specific_features = function ($node) {
	"use strict";

	var temp_sf = 'mep.play.video.specific_features -> ',
		add_features = $node.data('addFeatures') || [];

    if ($node.find('track').length > 0) {
		add_features.push('tracks');
	}

	if ($node.find('script[type="text/postroll"]').length > 0) {
		add_features.push('postroll');
	}

	if (add_features.length && msos.config.verbose) {
		msos.console.debug(temp_sf + 'add:', add_features);
	}

	return add_features;
};

mep.play.video.onresize = function () {
	"use strict";

	var temp_or = 'mep.play.video.onresize -> ',
		players = mep.player.players,
		plyr,
		is_fullscreen_mode = false,
		trk,
		name_page_js = '';

	msos.console.debug(temp_or + 'start.');

	for (plyr in players) {
		if (players.hasOwnProperty(plyr)) {

			is_fullscreen_mode = players[plyr].config.fullscreenMode;

			if (is_fullscreen_mode) {
				// If any player has switched to fullscreen...then kill onresize
				msos.console.debug(temp_or + 'done, fullscreen switch => ignore resize.');
				return;
			}
		}
	}

	// If an msos.page app, do this
	if (msos.page && msos.page.track) {

		trk = msos.page.track;
		name_page_js = '#/page/' + (trk.base ? trk.base + '.' : '') + trk.group + '.' + trk.name;

		// Recall same page...so features get set and sized correctly
		Backbone.history.navigate(name_page_js, { trigger: true });

		msos.console.debug(temp_or + 'done, reload msos.page: ' + name_page_js);

	}  else {

		// Basic html page
		if (msos.config.verbose) {
			msos.console.debug(temp_or + 'done, reloading html page.');
			alert('Debug note: reloading html page.');
		}

		window.location.reload();
	}
};

mep.play.video.init = function ($node, video_spec, player_spec) {
    "use strict";

    var temp_vi = 'mep.play.video.init -> ',
		tag = $node.prop("tagName").toLowerCase(),
		id = $node.attr('id'),
		set_options = $node.data('setOptions') || {},
		video = video_spec || new mep.play.video.defaults(),
		player = player_spec || new mep.player.defaults(),
        features = video.features_by_size[video.size],
		features_specific = [];

    msos.console.debug(temp_vi + 'start, screen size: ' + msos.config.size + ', features size: ' + video.size);

	// If using msos.page, we need to update between content renderings
	if (msos.page && msos.page.track) { mep.player.players = {}; }

	if (tag !== 'video') {
		msos.console.error(temp_vi + 'not a video tag, ref.:' + tag);
		return undefined;
	}

	if (!id) {
		id = $node.attr('id', tag + '_' + player.id);
	}

	// Save ref. to jQuery and std. node
	player.$node	= $node;
	player.node		= $node[0];

	// HTML5 video is available?
	player.support.html5_media = Modernizr.video;

	// Check video tag for specific features
	features_specific = mep.play.video.specific_features($node);

	features = features.concat(features_specific);
	features = _.uniq(features, true);

    // Add needed modules, per 'features_by_size' and  'specific'
    player.load_features(features);

	jQuery.extend(
		true,
		player,
		video	// add video specifics to player object
	);

	if (!_.isEmpty(set_options)) {
		jQuery.extend(
			player,
			set_options
		);
	}

	mep.player.players[id] = player;

	// Let everything load...
	msos.onload_func_post.push(function () { player.init(); });

    msos.console.debug(temp_vi + 'done!');

	return player;
};

// Onresize function adjusts for different features
msos.onresize_functions.unshift(mep.play.video.onresize);

