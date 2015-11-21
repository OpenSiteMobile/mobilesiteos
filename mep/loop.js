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

msos.provide("mep.loop");

mep.loop.version = new msos.set_version(15, 11, 15);

mep.loop.start = function () {
	"use strict";

    jQuery.extend(

    mep.player.controls, {

		buildloop: function (ply_obj) {
			var button = jQuery('<button type="button" aria-controls="' + ply_obj.id + '" title="' + ply_obj.options.i18n.loop_toggle + '"><i class="fa fa-repeat"></i></button>'),
				loop = jQuery('<div class="mejs-button mejs-loop-button ' + ((ply_obj.options.loop) ? 'mejs-loop-on' : 'mejs-loop-off') + '"></div>');

			button.click(
				function (e) {
					msos.do_nothing(e);
					ply_obj.options.loop = !ply_obj.options.loop;

					if (ply_obj.options.loop) {
						ply_obj.loop.removeClass('mejs-loop-off').addClass('mejs-loop-on');
					} else {
						ply_obj.loop.removeClass('mejs-loop-on').addClass('mejs-loop-off');
					}

					jQuery(this).blur();
				}
			);

			loop.append(button);
			loop.appendTo(ply_obj.controls);
		}
	});
};

// Load early, but after 'mep.player' has loaded
msos.onload_func_start.push(mep.loop.start);