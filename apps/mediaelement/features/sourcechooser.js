// Page specific js code

/*global
    msos: false,
    jQuery: false,
    _: false
*/

msos.provide("apps.mediaelement.features.sourcechooser");
msos.require("mep.play.video");


msos.onload_func_start.push(
	function () {
		"use strict";

		msos.console.info('Content: sourcechooser.html loaded!');

		// Grab a new video defaults object
		var video = new mep.play.video.defaults();

		// ...so we can override the video size to 'custom'
		video.size = 'custom';
		// ...and add 'speedselect' for demo'ing
		video.features_by_size.custom.push('sourcechooser');

		mep.play.video.init(
			jQuery('#sourcechooser_html'),
			video
		);
	}
);