
/*global
    msos: false,
    jQuery: false,
    mep: false
*/

msos.provide("mep.jumpforward");

mep.jumpforward.version = new msos.set_version(15, 12, 3);

mep.jumpforward.start = function (me_player) {
	"use strict";
	// Jump forward button

	// add extra default options 
    jQuery.extend(
		me_player.config,
		{
			jumpForwardInterval: 30
		}
	);

	jQuery.extend(me_player.controls, {

		buildjumpforward: function (ply_obj) {

			var cfg = ply_obj.config,
				forwardText = cfg.i18n.jump_forward.replace('%1', cfg.jumpForwardInterval),
				button = jQuery('<button type="button" aria-controls="' + ply_obj.id + '" title="' + forwardText + '" aria-label="' + forwardText + '"><i class="fa fa-step-forward"></i></button>'),
				loop = jQuery('<div class="mejs-button mejs-jump-forward"></div>');

			button.click(
				function (e) {
					msos.do_nothing(e);
                    if (ply_obj.media.duration) {
                        ply_obj.media.setCurrentTime(
							Math.min(ply_obj.media.currentTime + cfg.jumpForwardInterval, ply_obj.media.duration)
						);
                        jQuery(this).blur();
                    }
				}
			);

			loop.append(button);
			loop.appendTo(ply_obj.controls);
		}
	});
};
