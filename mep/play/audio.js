
/*global
    msos: false,
    mep: false,
    jQuery: false,
    Modernizr: false,
    Backbone: false,
    _: false
*/

msos.provide("mep.play.audio");
msos.require("mep.player");
msos.require("msos.i18n.player");

mep.play.audio.version = new msos.set_version(15, 12, 9);


mep.play.audio.defaults = function () {
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
                        'audio/flv', 'audio/x-flv', 'audio/mp3', 'audio/m4a', 'audio/mpeg'
                    ]
                }
            ]
        }
	};

    this.features_by_size = {
		'desktop':	['playpause', 'current', 'progress', 'duration', 'volume', 'stop', 'keyboard'],
        'large':	['playpause', 'current', 'progress', 'duration', 'volume', 'stop', 'keyboard'],
        'medium':	['playpause', 'current', 'progress', 'duration', 'volume', 'stop'],
        'small':	['playpause', 'current', 'progress', 'duration', 'volume', 'stop'],
        'tablet':	['playpause', 'current', 'progress', 'duration'],
        'phone':	['playpause', 'current', 'progress', 'duration'],
		'custom':	['playpause', 'duration']
    };

	this.size = msos.config.size || 'custom';	// default is minimal version

    this.format = {
        mp3: {
            codec: 'audio/mpeg; codecs="mp3"',
            flash: true
        },
        m4a: {
            codec: 'audio/mp4; codecs="mp4a.40.2"',
            flash: true
        },
        oga: {
            codec: 'audio/ogg; codecs="vorbis"',
            flash: false
        },
        wav: {
            codec: 'audio/wav; codecs="1"',
            flash: false
        },
        webma: {
            codec: 'audio/webm; codecs="vorbis"',
            flash: false
        },
        fla: {
            codec: 'audio/x-flv',
            flash: true
        },
        rtmpa: {
            codec: 'audio/rtmp; codecs="rtmp"',
            flash: true
        }
    };

	this.html5 = {
		types: [
			'audio/mp4', 'audio/ogg', 'audio/mpeg', 'audio/wav'
		]
	};

	return this;
};

mep.play.audio.onresize = function () {
	"use strict";

	var temp_or = 'mep.play.audio.onresize -> ',
		trk,
		name_page_js = '';

	msos.console.debug(temp_or + 'start.');

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

mep.play.audio.init = function ($node, audio_spec, player_spec) {
    "use strict";

    var temp_ai = 'mep.play.audio.init -> ',
		tag = $node.prop("tagName").toLowerCase(),
		id = $node.attr('id'),
		set_options = $node.data('setOptions') || {},
		audio = audio_spec || new mep.play.audio.defaults(),
		player = player_spec || new mep.player.defaults(),
        features = audio.features_by_size[audio.size];

    msos.console.debug(temp_ai + 'start, screen size: ' + msos.config.size + ', features size: ' + audio.size);

	// If using msos.page, we need to update between content renderings
	if (msos.page && msos.page.track) { mep.player.players = {}; }

	if (tag !== 'audio') {
		msos.console.error(temp_ai + 'not an audio tag, ref.:' + tag);
		return undefined;
	}

	if (!id) {
		id = $node.attr('id', tag + '_' + player.id);
	}

	// Save ref. to jQuery and std. node
	player.$node	= $node;
	player.node		= $node[0];

    // HTML5 audio is available?
    player.support.html5_media = Modernizr.audio;

    // Add needed modules, per 'features_by_size' and  logic
    player.load_features(features);

	jQuery.extend(
		true,
		player,
		audio	// add video specifics to player object
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

    msos.console.debug(temp_ai + 'done!');

	return player;
};

// Onresize function adjusts for different features
msos.onresize_functions.unshift(mep.play.audio.onresize);
