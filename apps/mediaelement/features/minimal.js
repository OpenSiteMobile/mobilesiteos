// Page specific js code

/*global
    msos: false,
    jQuery: false,
    apps: false,
    mep: false
*/

msos.provide("apps.mediaelement.features.minimal");
msos.require("mep.play.video");


msos.onload_func_start.push(
	function () {
		"use strict";

		msos.console.info('Content: minimal.html loaded!');

		// Grab a new video defaults object
		var video = new mep.play.video.defaults();

		// ...so we can override the video size to 'custom'
		video.size = 'custom';

		mep.play.video.init(
			jQuery('#minimal_html'),
			video
		);
	}
);