// Page specific js code

/*global
    msos: false,
    jQuery: false,
    apps: false,
    mep: false
*/

msos.provide("apps.mediaelement.player");
msos.require("mep.play.video");
msos.require("mep.play.audio");


msos.onload_func_start.push(
	function () {
		"use strict";

		msos.console.info('Content: player.html loaded!');

		var video_player = mep.play.video.init(jQuery('#player_video')),
			audio_player = mep.play.audio.init(jQuery('#player_audio'));

		video_player.config.success_function = function (plyr) {
			// For demo: show the current player mode
			jQuery('#player_mode_video').html('Mode: ' + plyr.node.pluginType);

			// For demmo: add external control
			jQuery('#player_pause_video').click(
				function () { plyr.pause(); }
			);
		}

		audio_player.config.success_function = function (plyr) {
			// For demo: show the current player mode
			jQuery('#player_mode_audio').html('Mode: ' + plyr.node.pluginType);

			// For demmo: add external control
			jQuery('#player_pause_audio').click(
				function () { plyr.pause(); }
			);
		}
	}
);
