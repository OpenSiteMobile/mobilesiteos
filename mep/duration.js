
/*global
    msos: false,
    jQuery: false,
    mep: false
*/

msos.provide("mep.duration");

mep.duration.version = new msos.set_version(15, 11, 13);


mep.duration.start = function () {
	"use strict";

	// options
	jQuery.extend(
		mep.player.config,
		{
			duration: -1
		}
	);

	jQuery.extend(
		mep.player.controls,
		{
			buildduration: function (ply_obj) {

				var cfg = ply_obj.options;

				ply_obj.dr_container = jQuery('<div class="mejs-time mejs-duration-container">');
				ply_obj.durationD =	jQuery('<span class="mejs-duration">' + mep.player.utils.secondsToTimeCode(cfg.duration, cfg) + '</span>');

				ply_obj.dr_container.append(ply_obj.durationD);
				ply_obj.dr_container.appendTo(ply_obj.controls);

				ply_obj.updateDuration = function () {
					//Toggle the long video class if the video is longer than an hour.
					ply_obj.container.toggleClass("mejs-long-video", ply_obj.media.duration > 3600);

					if (ply_obj.media.duration && ply_obj.durationD) {
						ply_obj.durationD.html(
							mep.player.utils.secondsToTimeCode(
								cfg.duration > 0 ? cfg.duration : ply_obj.media.duration,
								cfg
							)
						);
					}
				};

				ply_obj.media.addEventListener(
					'timeupdate',
					ply_obj.updateDuration,
					false
				);
			}
		}
	);
};

// Load early, but after 'mep.player' has loaded
msos.onload_func_start.push(mep.duration.start);