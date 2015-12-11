
/*global
    msos: false,
    jQuery: false,
    mep: false
*/

msos.provide("mep.skipback");

mep.skipback.version = new msos.set_version(15, 12, 9);


mep.skipback.start = function (me_player) {
	"use strict";
	// skip back button

	// add extra default options 
    jQuery.extend(
		me_player.config,
		{
			skipBackInterval: 30
		}
	);

	jQuery.extend(me_player.controls, {

		buildskipback: function (ply_obj) {
			var cfg = ply_obj.config,
				backText = cfg.i18n.skip_back.replace('%1', cfg.skipBackInterval),
				button = jQuery('<button type="button" aria-controls="' + ply_obj.id + '" title="' + backText + '" aria-label="' + backText + '"><i class="fa fa-step-backward"></i></button>'),
				loop = jQuery('<div class="mejs-button mejs-skip-back"></div>');

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
