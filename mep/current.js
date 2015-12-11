
/*global
    msos: false,
    jQuery: false,
    mep: false
*/

msos.provide("mep.current");

mep.current.version = new msos.set_version(15, 12, 8);


mep.current.start = function (me_player) {
	"use strict";

	jQuery.extend(
		me_player.controls,
		{
			buildcurrent: function (ply_obj) {

				var cfg = ply_obj.config;

				ply_obj.ct_container = jQuery('<div class="mejs-time" role="timer" aria-live="off" title="' + cfg.i18n.elapsed_time + '">');
				ply_obj.currenttime = jQuery('<span>' + mep.player.utils.secondsToTimeCode(0, cfg) + '</span>');

				ply_obj.ct_container.append(ply_obj.currenttime);
				ply_obj.ct_container.appendTo(ply_obj.controls);

				ply_obj.updateCurrent = function () {
					if (ply_obj.currenttime) {
						ply_obj.currenttime.html(
							mep.player.utils.secondsToTimeCode(
								ply_obj.media.currentTime,
								cfg
							)
						);
					}
				};

				ply_obj.media.addEventListener(
					'timeupdate',
					ply_obj.updateCurrent,
					false
				);
			}
		}
	);
};
