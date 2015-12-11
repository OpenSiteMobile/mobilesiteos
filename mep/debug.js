
/*global
    msos: false,
    mep: false,
    jQuery: false
*/

msos.provide("mep.debug");

mep.debug.version = new msos.set_version(15, 12, 8);


mep.debug.start = function (me_player) {
	"use strict";

	var temp_ds = 'mep.debug.start @@@@@> ';

	jQuery.extend(
		me_player.controls,
		{
			builddebug: function (ply_obj) {
				var events = [
						'loadstart', 'loadeddata',
						'play', 'playing',
						'seeking', 'seeked',
						'pause', 'waiting',
						'ended', 'canplay', 'error'
					],
					i = 0;

				if (ply_obj.media) {
					for (i = 0; i < events.length; i += 1) {
						ply_obj.media.addEventListener(
							events[i],
							function (e) {
								msos.console.debug(temp_ds + 'fired event: ' + e.type);
							}
						);
					}
				} else {
					msos.console.warn(temp_ds + 'media object is not ready, ref.:', ply_obj);
				}
			}
		}
	);
};
