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

msos.provide("mep.volume");

mep.volume.version = new msos.set_version(17, 5, 21);


// Start by loading our volume.css stylesheet
mep.volume.css = new msos.loader();
mep.volume.css.load(msos.resource_url('mep', 'css/volume.css'));

mep.volume.start = function (me_player) {
	"use strict";

	jQuery.extend(
		me_player.config,
		{
			audioVolume: 'horizontal',
			videoVolume: 'vertical'
		}
	);

	jQuery.extend(
		me_player.controls,
		{
			buildvolume: function (ply_obj) {

				// Skip volume control for mobile touch devices
				if (msos.config.browser.mobile
				 && msos.config.browser.touch) { return; }

				var cfg = ply_obj.config,
					mode = (ply_obj.isVideo) ? cfg.videoVolume : cfg.audioVolume,
					button,
					mute,
					volumeAria = jQuery('<span class="visually_hidden">' + cfg.i18n.volume_up_down + '</span>'),
					volumeSlider =	(mode === 'horizontal') ? jQuery('<div class="mejs-horizontal-volume-slider">')  : jQuery('<div class="mejs-volume-slider">'),
					volumeTotal =	(mode === 'horizontal') ? jQuery('<div class="mejs-horizontal-volume-total">')   : jQuery('<div class="mejs-volume-total">'),
					volumeCurrent =	(mode === 'horizontal') ? jQuery('<div class="mejs-horizontal-volume-current">') : jQuery('<div class="mejs-volume-current">'),
					volumeHandle =	(mode === 'horizontal') ? jQuery('<div class="mejs-horizontal-volume-handle">')  : jQuery('<div class="mejs-volume-handle">'),
					positionVolumeHandle,
					handleVolumeMove,
					mouseIsDown = false,
					mouseIsOver = false;

				volumeSlider.attr({
					'aria-label': ply_obj.config.i18n.volume_slide_control,
					'aria-valuemin': 0,
					'aria-valuemax': 100,
					'role': 'slider',
					'tabindex': 0
				});

				volumeSlider.append(volumeAria, volumeTotal, volumeCurrent, volumeHandle);

				button = jQuery('<button type="button" aria-controls="' + ply_obj.id + '" title="' + cfg.i18n.mute_toggle + '" aria-label="' + cfg.i18n.mute_toggle + '"><i class="fa fa-volume-up"></i><i class="fa fa-volume-off"></button>');
				mute =	jQuery('<div class="mejs-button mejs-volume-button mejs-mute"></div>');

				mute.append(button);

				if (mode === 'horizontal') {
					mute.appendTo(ply_obj.controls);
					volumeSlider.appendTo(ply_obj.controls);
				} else {
					mute.append(volumeSlider);
					mute.appendTo(ply_obj.controls);
				}

				positionVolumeHandle = function (volume, secondTry) {

					if (!volumeSlider.is(':visible') && secondTry === undefined) {
						volumeSlider.show();
						positionVolumeHandle(volume, true);
						volumeSlider.hide();
						return;
					}

					// correct to 0-1
					volume = Math.max(0, volume);
					volume = Math.min(volume, 1);

					// ajust mute button style
					if (volume === 0) {
						mute.removeClass('mejs-mute').addClass('mejs-unmute');
					} else {
						mute.removeClass('mejs-unmute').addClass('mejs-mute');
					}

					var totalWidth,
						totalHeight,
						totalPosition,
						newTop,
						newLeft;

					// position slider
					if (mode === 'vertical') {
						// height of the full size volume slider background
						totalHeight = volumeTotal.height();

						// top/left of full size volume slider background
						totalPosition = volumeTotal.position();

						// the new top position based on the current volume
						// 70% volume on 100px height == top:30px
						newTop = totalHeight - (totalHeight * volume);

						// handle
						volumeHandle.css('top', Math.round(totalPosition.top + newTop - (volumeHandle.height() / 2)));

						// show the current visibility
						volumeCurrent.height(totalHeight - newTop);
						volumeCurrent.css('top', totalPosition.top + newTop);

					} else {

						// height of the full size volume slider background
						totalWidth = volumeTotal.width();

						// top/left of full size volume slider background
						totalPosition = volumeTotal.position();

						// the new left position based on the current volume
						newLeft = totalWidth * volume;

						// handle
						volumeHandle.css('left', Math.round(totalPosition.left + newLeft - (volumeHandle.width() / 2)));

						// rezize the current part of the volume bar
						volumeCurrent.width(Math.round(newLeft));
					}
				};

				handleVolumeMove = function (e) {

					var volume = null,
						totalOffset = volumeTotal.offset(),
						railHeight,
						railWidth,
						totalTop,
						newY,
						newX;

					// calculate the new volume based on the moust position
					if (mode === 'vertical') {

						railHeight = volumeTotal.height();
						totalTop = parseInt(volumeTotal.css('top').replace(/px/, ''), 10);
						newY = e.pageY - totalOffset.top;

						volume = (railHeight - newY) / railHeight;

						// the controls just hide themselves (usually when mouse moves too far up)
						if (totalOffset.top === 0 || totalOffset.left === 0) { return; }

					} else {
						railWidth = volumeTotal.width();
						newX = e.pageX - totalOffset.left;

						volume = newX / railWidth;
					}

					// ensure the volume isn't outside 0-1
					volume = Math.max(0, volume);
					volume = Math.min(volume, 1);

					// position the slider and handle			
					positionVolumeHandle(volume);

					// set the media object (this will trigger the volumechanged event)
					if (volume === 0) {
						ply_obj.media.setMuted(true);
					} else {
						ply_obj.media.setMuted(false);
					}

					ply_obj.media.setVolume(volume);
				};

				// SLIDER
				mute.hover(
					function () {
						volumeSlider.show();
						mouseIsOver = true;
					},
					function () {
						mouseIsOver = false;
						if (!mouseIsDown && mode === 'vertical') {
							volumeSlider.hide();
						}
					}
				);

				volumeSlider.bind(
					'mouseover',
					function () {
						mouseIsOver = true;
					}
				).bind(
					'mousedown',
					function (e) {
						handleVolumeMove(e);
						jQuery(document).bind(
							'mousemove.vol',
							function (e) {
								handleVolumeMove(e);
							}
						).bind(
							'mouseup.vol',
							function () {
								mouseIsDown = false;
								jQuery(document).unbind('.vol');

								if (!mouseIsOver && mode === 'vertical') {
									volumeSlider.hide();
								}
							}
						);
						mouseIsDown = true;
						return false;
					}
				).bind(
					'keydown',
					function (e) {
						var keyCode = e.keyCode,
							volume = ply_obj.media.volume;

						switch (keyCode) {
							case 38: // Up
								volume += 0.1;
								break;
							case 40: // Down
								volume -= 0.1;
								break;
							default:
								return true;
						}

						mouseIsDown = false;
						positionVolumeHandle(volume);
						ply_obj.media.setVolume(volume);

						return false;
					}
				);

				// MUTE button
				button.click(
					function (e) {
						msos.do_nothing(e);
						ply_obj.media.setMuted(!ply_obj.media.muted);
						jQuery(this).blur();
					}
				);

				// Keyboard input
				button.bind(
					'focus',
					function () {
						volumeSlider.show();
					}
				);

				function updateVolumeSlider() {
					var volume = Math.floor(ply_obj.media.volume * 100);

					volumeSlider.attr({
						'aria-valuenow': volume,
						'aria-valuetext': volume + '%'
					});
				}

				// listen for volume change events from other sources
				ply_obj.media.addEventListener(
					'volumechange',
					function (e) {
						if (!mouseIsDown) {
							if (ply_obj.media.muted) {
								positionVolumeHandle(0);
								mute.removeClass('mejs-mute').addClass('mejs-unmute');
							} else {
								positionVolumeHandle(ply_obj.media.volume);
								mute.removeClass('mejs-unmute').addClass('mejs-mute');
							  }
						}
						updateVolumeSlider(e);
					},
					false
				);

				if (ply_obj.container.is(':visible')) {
					// set initial volume
					positionVolumeHandle(cfg.startVolume);

					// shim gets the startvolume as a parameter, but we have to set it on the native <video> and <audio> elements
					if (ply_obj.media.pluginType === 'native') {
						ply_obj.media.setVolume(cfg.startVolume);
					}
				}

				// mutes the media and sets the volume icon muted if the initial volume is set to 0
				if (cfg.startVolume === 0) {
					ply_obj.media.setMuted(true);
				}

				// shim gets the startvolume as a parameter, but we have to set it on the native <video> and <audio> elements
				if (ply_obj.media.pluginType === 'native') {
					ply_obj.media.setVolume(cfg.startVolume);
				}

				// Save ref. to jQuery object
				ply_obj.volumeSlider = volumeSlider;
			}
		}
	);
};

