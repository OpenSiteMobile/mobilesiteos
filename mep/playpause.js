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

msos.provide("mep.playpause");

mep.playpause.version = new msos.set_version(15, 12, 8);


mep.playpause.start = function (me_player) {
	"use strict";

	// PLAY/pause BUTTON
	jQuery.extend(
		me_player.controls,
		{
			buildplaypause: function (ply_obj) {

				var cfg = ply_obj.config,
					button = jQuery('<button type="button" aria-controls="' + ply_obj.id + '" title="' + cfg.i18n.playpause + '" aria-label="' + cfg.i18n.playpause + '"><i class="fa fa-play"></i><i class="fa fa-pause"></i></button>'),
					play = jQuery('<div class="mejs-button mejs-play" ></div>');

				button.click(
					function (e) {
						msos.do_nothing(e);

						msos.console.debug('mep.playpause.start - buildplaypause - click -> play/pause fired.');
						if (ply_obj.media.paused)	{ ply_obj.media.play();  }
						else						{ ply_obj.media.pause(); }

						jQuery(this).blur();
					}
				);

				// Save a ref. to the button
				ply_obj.play_pause = button;

				play.append(button);
				play.appendTo(ply_obj.controls);

				function togglePlayPause(which) {
					if ('play' === which) {
						play.removeClass('mejs-play').addClass('mejs-pause');
					} else {
						play.removeClass('mejs-pause').addClass('mejs-play');
					}
				}

				// Set initially...
				togglePlayPause('pause');

				ply_obj.media.addEventListener(
					'play',
					function () {
						togglePlayPause('play');
					},
					false
				);
				ply_obj.media.addEventListener(
					'playing',
					function () {
						togglePlayPause('play');
					}, false
				);
				ply_obj.media.addEventListener(
					'pause',
					function () {
						togglePlayPause('pause');
					},
					false
				);
				ply_obj.media.addEventListener(
					'paused',
					function () {
						togglePlayPause('pause');
					},
					false
				);
			}
		}
	);
};
