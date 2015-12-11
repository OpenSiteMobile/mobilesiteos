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
    mep: false,
    _: false
*/

msos.provide("mep.sourcechooser");

mep.sourcechooser.version = new msos.set_version(15, 12, 4);


// Start by loading our stylesheet
mep.sourcechooser.css = new msos.loader();
mep.sourcechooser.css.load('mep_sourcechooser_css', msos.resource_url('mep', 'css/sourcechooser.css'));

mep.sourcechooser.start = function (me_player) {
	"use strict";

    jQuery.extend(
		me_player.controls, {

			buildsourcechooser: function (ply_obj) {

				var temp_sc = 'mep.sourcechooser.start - buildsourcechooser',
					radio_select = 'input[type=radio][name=' + ply_obj.id + '_sourcechooser]',
					selectedSrc = '',
					button = null,
					sourceObject = {},
					sourceKey = '',
					sourceCnt = 0,
					currentTime,
					src,
					inp = '';

				ply_obj.sourcechooserSelect =
					jQuery('<div class="mejs-sourcechooser-selector"><ul></ul></div>');
				ply_obj.sourcechooserButton =
					jQuery('<div class="mejs-button mejs-sourcechooser"></div>');

				button = jQuery('<button aria-controls="' + ply_obj.id + '" title="' + ply_obj.config.i18n.sourcechooser + '" aria-label="' + ply_obj.config.i18n.sourcechooser + '"><i class="fa fa-file-video-o"></i></button>');

				ply_obj.sourcechooserButton.append(button);
				ply_obj.sourcechooserSelect.appendTo(ply_obj.sourcechooserButton);
				ply_obj.sourcechooserButton.appendTo(ply_obj.controls);

				button.click(
					function () {
						ply_obj.sourcechooserSelect.css('visibility', 'visible');
						ply_obj.sourcechooserSelect.find(radio_select + '[value=' + selectedSrc + ']').prop('checked', true);
					}
				);

				ply_obj.sourcechooserButton.on(
					'mouseenter focusin',
					function () {
						ply_obj.sourcechooserSelect.css('visibility', 'visible');
						ply_obj.sourcechooserSelect.find(radio_select + '[value=' + selectedSrc + ']').prop('checked', true);
					}
				);
				ply_obj.sourcechooserButton.on(
					'mouseleave focusout',
					function () {
						ply_obj.sourcechooserSelect.css('visibility', 'hidden');
					}
				);

				ply_obj.addSourceButton = function (src, label, type, src_key) {

					type = type.split('/')[1];
					type = type.split(';')[0];

					if (label === '' || label === undefined) { label = _.last(src.split('/')); }

					var $li = jQuery(
							'<li>' +
								'<input type="radio" name="' + ply_obj.id + '_sourcechooser" id="' + ply_obj.id + '_sourcechooser_' + type + '" value="' + src_key + '" />' +
								'<label for="' + ply_obj.id + '_sourcechooser_' + type + '">' + label + ' (' + type + ')</label>' +
							'</li>'
						);

					ply_obj.sourcechooserSelect.find('ul').append($li);
				};

				// add to list
				for (inp in ply_obj.media.children) {
					if (ply_obj.media.children.hasOwnProperty(inp)) {

						src = ply_obj.media.children[inp];

						if (src.nodeName === 'SOURCE'
						&& (ply_obj.media.canPlayType(src.type) === 'probably'
						 || ply_obj.media.canPlayType(src.type) === 'maybe')) {

							sourceKey = 'src_' + (sourceCnt += 1);

							sourceObject[sourceKey] = src.src;

							ply_obj.addSourceButton(
								src.src,
								src.title,
								src.type,
								sourceKey
							);

							if (ply_obj.media.src === src.src) {
								selectedSrc = sourceKey;
							}
						}
					}
				}

				// Calc. the height needed
				ply_obj.sourcechooserSelect.height(ply_obj.sourcechooserSelect.find('ul').outerHeight(true));

				ply_obj.sourcechooserSelect.on(
					'click',	// change doesn't work in FF
					radio_select,
					function () {
						var key = jQuery(this).val(),
							new_src = sourceObject[key] || '',
							paused;

						msos.console.debug(temp_sc + ' - on.change -> fired, key: ' + key);

						this.blur();

						if (new_src && ply_obj.media.currentSrc !== new_src) {

							currentTime = ply_obj.media.currentTime;
							paused = ply_obj.media.paused;
							ply_obj.media.setSrc(new_src);
							ply_obj.media.load();

							ply_obj.media.addEventListener(
								'loadedmetadata',
								function () {
									this.currentTime = currentTime;
								},
								true
							);

							ply_obj.media.addEventListener(
								'canplay',
								function () {
									if (!paused) { this.play(); }
								},
								true
							);

							selectedSrc = key;

							msos.console.debug(temp_sc + ' - on.change -> new source: ' + new_src);
						}

						ply_obj.sourcechooserSelect.css('visibility', 'hidden');
					}
				);
			}
		}
	);
};
