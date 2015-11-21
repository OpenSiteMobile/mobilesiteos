
/*global
    msos: false,
    jQuery: false,
    mep: false
*/

msos.provide("mep.jumpforward");

mep.jumpforward.version = new msos.set_version(15, 11, 12);

mep.jumpforward.start = function () {
	"use strict";
	// Jump forward button

	// add extra default options 
    jQuery.extend(
		mep.player.config,
		{
			jumpForwardInterval: 30,
			// %1 will be replaced with jumpForwardInterval in this string
			jumpForwardText: 'Jump forward %1 seconds'		// mejs.i18n.t('Jump forward %1 seconds')
		}
	);

	jQuery.extend(mep.player.controls, {

		buildjumpforward: function (ply_obj) {

			var cfg = ply_obj.options,
				forwardText = cfg.jumpForwardText.replace('%1', cfg.jumpForwardInterval),
				button = jQuery('<button type="button" aria-controls="' + ply_obj.id + '" title="' + forwardText + '" aria-label="' + forwardText + '"><i class="fa fa-step-forward"></i></button>'),
				loop = jQuery('<div class="mejs-button mejs-jump-forward-button"></div>');

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

// Load early, but after 'mep.player' has loaded
msos.onload_func_start.push(mep.jumpforward.start);
