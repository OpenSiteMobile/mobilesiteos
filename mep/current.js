
/*global
    msos: false,
    jQuery: false,
    mep: false
*/

msos.provide("mep.current");

mep.current.version = new msos.set_version(15, 11, 13);


mep.current.start = function () {
	"use strict";

	jQuery.extend(
		mep.player.controls,
		{
			buildcurrent: function (ply_obj) {

				var cfg = ply_obj.options;

				ply_obj.ct_container = jQuery('<div class="mejs-time">');
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

// Load early, but after 'mep.player' has loaded
msos.onload_func_start.push(mep.current.start);