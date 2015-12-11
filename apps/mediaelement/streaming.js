// Page specific js code

/*global
    msos: false,
    jQuery: false,
    apps: false,
    mep: false
*/

msos.provide('apps.mediaelement.streaming');
msos.require("mep.play.video");


msos.onload_func_start.push(
	function () {
		"use strict";

		msos.console.info('Content: streaming.html loaded!');

		var player = mep.play.video.init(jQuery('#streaming_html'));

		player.config.success_function = function (plyr) {
			// For demo: show the current player mode
			jQuery('#streaming_mode').html('Mode: ' + plyr.node.pluginType);

			// For demmo: add external control
			jQuery('#streaming_pause_play').click(
				function () { plyr.pause(); }
			);
		}
	}
);
