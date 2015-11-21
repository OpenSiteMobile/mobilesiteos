
/*global
    msos: false,
    jQuery: false,
    mep: false
*/

msos.provide("mep.skipback");

mep.skipback.version = new msos.set_version(15, 11, 12);


mep.skipback.start = function () {
	"use strict";
	// skip back button

	// add extra default options 
    jQuery.extend(
		mep.player.config,
		{
			skipBackInterval: 30,
			skipBackText: 'Skip back %1 seconds'		// mejs.i18n.t('Skip back %1 seconds')
		}
	);

	jQuery.extend(mep.player.controls, {

		buildskipback: function (ply_obj) {
			var cfg = ply_obj.options,
				backText = cfg.skipBackText.replace('%1', cfg.skipBackInterval),
				button = jQuery('<button type="button" aria-controls="' + ply_obj.id + '" title="' + backText + '" aria-label="' + backText + '"><i class="fa fa-step-backward"></i></button>'),
				loop = jQuery('<div class="mejs-button mejs-skip-back-button"></div>');

			button.click(
				function (e) {
					msos.do_nothing(e);
					ply_obj.media.setCurrentTime(
						Math.max(ply_obj.media.currentTime - cfg.skipBackInterval, 0)
					);
					jQuery(this).blur();
				}
			);

			loop.append(button);
			loop.appendTo(ply_obj.controls);
		}
	});
};

// Load early, but after 'mep.player' has loaded
msos.onload_func_start.push(mep.skipback.start);
