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

mep.loop.version = new msos.set_version(15, 12, 8);


mep.loop.start = function (me_player) {
	"use strict";
	// add extra default options 
    jQuery.extend(
		me_player.config,
		{
			loop_tf: false
		}
	);

    jQuery.extend(me_player.controls, {

		buildloop: function (ply_obj) {
			var temp_bl = 'mep.loop.start - buildloop - ',
				button = jQuery('<button type="button" aria-controls="' + ply_obj.id + '" title="' + ply_obj.config.i18n.loop_toggle + '" aria-label="' + ply_obj.config.i18n.loop_toggle + '"><i class="fa fa-repeat ' + ((ply_obj.config.loop_tf) ? 'fa-spin' : '') + '"></i></button>');

			ply_obj.loop_icon = button.find('i');

			button.click(
				function (e) {
					msos.do_nothing(e);
					ply_obj.config.loop_tf = !ply_obj.config.loop_tf;

					msos.console.debug(temp_bl + 'click -> fired, for: ' + ply_obj.config.loop_tf);

					if (ply_obj.config.loop_tf) {
						ply_obj.loop_icon.addClass('fa-spin');
					} else {
						ply_obj.loop_icon.removeClass('fa-spin');
					}

					jQuery(this).blur();
				}
			);

			ply_obj.loop = jQuery('<div class="mejs-button mejs-loop"></div>');

			ply_obj.loop.append(button);
			ply_obj.loop.appendTo(ply_obj.controls);

			ply_obj.container.on(
				'controlsshown',
				function () {
					msos.console.debug(temp_bl + 'controlsshown -> fired, for: ' + ply_obj.config.loop_tf);

					if (ply_obj.config.loop_tf) {
						ply_obj.loop_icon.removeClass('fa-spin');
						setTimeout(function () { ply_obj.loop_icon.addClass('fa-spin'); }, 100);
					}
				}
			);
		}
	});
};
