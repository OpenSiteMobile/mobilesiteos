/*!
* MediaElement.js
* HTML5 <video> and <audio> shim and player
* http://mediaelementjs.com/
*
* Copyright 2010-2012, John Dyer (http://j.hn)
* Dual licensed under the MIT or GPL Version 2 licenses.
*
*/

/*global
    msos: false,
    jQuery: false,
    mep: false
*/

msos.provide("mep.stop");

mep.stop.version = new msos.set_version(15, 12, 2);


mep.stop.start = function (me_player) {
	"use strict";

	// STOP BUTTON
	jQuery.extend(
		me_player.controls,
		{
			buildstop: function (ply_obj) {

				var button = jQuery('<button type="button" aria-controls="' + ply_obj.id + '" title="' + ply_obj.config.i18n.stop_text + '" aria-label="' + ply_obj.config.i18n.stop_text + '"><i class="fa fa-stop"></i></button>'),
					stop = jQuery('<div class="mejs-button mejs-stop-button mejs-stop"></div>');

				button.click(
					function (e) {

						msos.console.debug('mep.stop.start - click -> stop fired.');

						msos.do_nothing(e);

						if (!ply_obj.media.paused) {
							ply_obj.media.pause();
						}

						if (ply_obj.media.currentTime > 0) {
							ply_obj.media.setCurrentTime(0);
							ply_obj.current.width('0');
							ply_obj.handle.css('left', '0');
							ply_obj.tfltcur.html(mep.player.utils.secondsToTimeCode(0, ply_obj.config));
							ply_obj.currenttime.html(mep.player.utils.secondsToTimeCode(0, ply_obj.config));
							if (ply_obj.poster) { ply_obj.poster.show(); }
						}

						jQuery(this).blur();
					}
				);

				stop.append(button);
				stop.appendTo(ply_obj.controls);

				ply_obj.stop = stop;
			}
		}
	);
};
