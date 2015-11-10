
msos.provide('apps.mediaelement.youtube');
msos.require("mep.play.video");


apps.mediaelement.youtube.notify_loading = null;

msos.onload_func_pre.push(
	function () {
		"use strict";

		msos.console.info('Content: youtube.html loaded!');

		apps.mediaelement.youtube.notify_loading = msos.notify.loading('Loading page and video player...', jQuery('title').text());
	}
);

msos.onload_func_done.push(
	function () {
		"use strict";

		jQuery('video').html5video(
			{
				success_function: function (plyr) {
					// For demo...show the current player mode
					jQuery('#' + plyr.node.id + '-mode').html('Mode: ' + plyr.node.pluginType);

					// For demmo...add external control
					jQuery('#pause_play').click(
						function () { plyr.pause(); }
					);

					apps.mediaelement.youtube.notify_loading.fade_out();
				}
			}
		);
	}
);