
/*global
    msos: false,
    jQuery: false,
    Modernizr: false
*/

msos.provide("mep.play.video");
msos.require("mep.player");

mep.play.video = {

	version: new msos.set_version(14, 6, 9),

	config: {
		// auto:			attempts to detect what the browser can do
		// native:			forces HTML5 playback
		// shim:			disallows HTML5, will attempt Flash
		mode: 'shim',
		poster: '',
		// remove or reorder to change plugin priority and availability
		plugins: ['flash', 'youtube', 'vimeo'],
		// name of plugin specific required external file
		flashName: 'flashmediaelement.swf',
		// path to Flash plugin
		shim_path: msos.resource_url('mep', 'shim/'),
		// name of flash file
		// turns on the smoothing filter in Flash
		enablePluginSmoothing: false,
		// default amount to move back when back key is pressed		
		defaultSeekBackwardInterval: function (media) {
			"use strict";
			return (media.duration * 0.05);
		},
		// default amount to move forward when forward key is pressed				
		defaultSeekForwardInterval: function (media) {
			"use strict";
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
                        'video/youtube', 'video/x-youtube'
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
        },

		success_function: function (player_object) {
			"use strict";
            msos.console.info('mep.play.video.success_function -> called: ' + player_object.id);
		},

		error_function:	 function (player_object) {
			"use strict";
            msos.console.error('mep.play.video.error_function -> called: ' + player_object.id);
		}
	},

    // Additional available: 'contextmenu', 'tracks', 'sourcechooser', 'postroll', 'loop'
	// Needs work: 'fullscreen'
    features_by_size: {
		'desktop':	['poster', 'overlays', 'playpause', 'current', 'progress', 'duration', 'volume', 'stop', 'keyboard'],
        'large':	['poster', 'overlays', 'playpause', 'current', 'progress', 'duration', 'volume', 'stop', 'keyboard'],
        'medium':	['poster', 'overlays', 'playpause', 'current', 'progress', 'duration', 'volume', 'stop'],
        'small':	['poster', 'overlays', 'playpause', 'current', 'progress', 'duration', 'volume', 'stop'],
        'tablet':	['poster', 'overlays', 'playpause', 'current', 'progress', 'duration'],
        'phone':	['poster', 'overlays', 'playpause', 'current', 'progress', 'duration']
    },

    format: {
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
    },

	html5: {
		types: [
			'video/mp4', 'video/webm', 'video/ogg', 'video/flv', 'video/x-flv'
		]
	}
};


mep.play.video.fullscreen_tests = function () {
	"use strict";

	var vid = document.createElement('video') || null,
		r = {
			can_play_type: false,
			can_play_mp4: false,

			semi_native: false,
			webkit_native: false,
			moz_native: false,
			ms_native: false,
			true_native: false,

			native_fs: false,
			native_fs_enabled: false,

			event_name: '',

			is_fullscreen: function () { return false; }
		};

	if (!msos.var_is_null(vid)) {

		r.can_play_type = 	(vid.canPlayType !== undefined);
		r.can_play_mp4 =	(vid.canPlayType
						  && vid.canPlayType("video/mp4")	!== undefined);		// basic tests

		r.semi_native =		(vid.webkitEnterFullscreen		!== undefined);		// iOS
		r.webkit_native =	(vid.webkitRequestFullScreen	!== undefined);		// Webkit
		r.moz_native =		(vid.mozRequestFullScreen		!== undefined);		// firefox
		r.ms_native = 		(vid.msRequestFullscreen		!== undefined);		// MicroSoft

		r.true_native = (r.webkit_native || r.moz_native || r.ms_native);

		r.native_fs_wc3 =	(vid.requestFullscreen !== undefined);
		r.native_fs_enabled = r.true_native;

		if (r.moz_native) {
			r.native_fs_enabled = document.mozFullScreenEnabled;
		}
		if (r.ms_native) {
			r.native_fs_enabled = document.msFullscreenEnabled;
		}

		if (r.true_native) {

			if		(r.webkit_native)	{ r.event_name = 'webkitfullscreenchange'; }
			else if (r.moz_native)		{ r.event_name = 'mozfullscreenchange'; }
			else if (r.ms_native)		{ r.event_name = 'MSFullscreenChange'; }

			// Is already Full-screen?
			if			(vid.mozRequestFullScreen) {
				r.is_fullscreen = function () {
					return document.mozFullScreen;
				};
			} else if	(vid.webkitRequestFullScreen) {
				r.is_fullscreen = function () {
					return document.webkitIsFullScreen;
				};
			} else if (vid.hasMsNativeFullScreen) {
				r.is_fullscreen = function () {
					return document.msFullscreenElement !== null;
				}
			}
		}
	}

	// clean up
	vid = null;

	if (msos.config.verbose) {
		msos.console.debug('mep.play.video.fullscreen_tests -> called, results: ', r);
	}
	return r;
};


mep.play.video.init = function () {
    "use strict";

    var temp_vi = 'mep.play.video.init -> ',
        vid_feat = mep.play.video.features_by_size,
        features = vid_feat[msos.config.size] || vid_feat.pda_sml,
        v_cfg = mep.play.video.config;

    msos.console.debug(temp_vi + 'start, screen size: ' + msos.config.size);

    // Check browser/device fullscreen capabilities
    mep.player.support.fs = mep.play.video.fullscreen_tests();

    // Check browser/device HTML5 Media capabilities
    mep.player.support.html5_media = Modernizr.video;

    // No HTML5 Media or we want plugin detection, so check for available Video plugins
    if (!mep.player.support.html5_media || !(v_cfg.mode === 'auto' || v_cfg.mode === 'native')) {
        msos.require("mep.plugins");
    }

    // Add needed modules, per 'features_by_size' and  logic
    mep.player.load_modules(features);

    jQuery.fn.html5video = function (options) {

        return this.each(
            function () {
                var $this = jQuery(this),
                    mep_obj = new mep.player.build($this, v_cfg, mep.player.config, options);

                // Start up
                mep_obj.init();
                // Store each player
                mep.player.players.push(mep_obj);
            }
        );
    };

    msos.console.debug(temp_vi + 'done!');
};

mep.play.video.start = function () {
    "use strict";

    jQuery('video').html5video();
};


msos.onload_func_start.push(mep.play.video.init);
msos.onload_func_done.push(mep.play.video.start);