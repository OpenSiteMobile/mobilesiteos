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
    Modernizr: false,
    mep: false
*/

msos.provide("mep.fullscreen");

mep.fullscreen.version = new msos.set_version(15, 12, 3);


mep.fullscreen.tests = function () {
	"use strict";

	var vid = document.createElement('video') || null,
		r = {
			can_play_type: false,
			can_play_mp4: false,

			semi_native: false,
			webkit_native: false,
			moz_native: false,
			ms_native: false,
			true_native: false,

			native_fs: false,
			native_fs_enabled: false,

			event_name: '',

			is_fullscreen: function () { return false; }
		};

	if (!msos.var_is_null(vid)) {

		r.can_play_type =	(vid.canPlayType !== undefined);
		r.can_play_mp4 =	(vid.canPlayType
						  && vid.canPlayType("video/mp4")	!== undefined);		// basic tests

		r.semi_native =		(vid.webkitEnterFullscreen		!== undefined);		// iOS
		r.webkit_native =	(vid.webkitRequestFullScreen	!== undefined);		// Webkit
		r.moz_native =		(vid.mozRequestFullScreen		!== undefined);		// firefox
		r.ms_native =		(vid.msRequestFullscreen		!== undefined);		// MicroSoft

		r.true_native = (r.webkit_native || r.moz_native || r.ms_native);

		r.native_fs_wc3 =	(vid.requestFullscreen !== undefined);
		r.native_fs_enabled = r.true_native;

		if (r.moz_native) {
			r.native_fs_enabled = document.mozFullScreenEnabled;
		}
		if (r.ms_native) {
			r.native_fs_enabled = document.msFullscreenEnabled;
		}

		if (r.true_native) {

			if		(r.webkit_native)	{ r.event_name = 'webkitfullscreenchange'; }
			else if (r.moz_native)		{ r.event_name = 'mozfullscreenchange'; }
			else if (r.ms_native)		{ r.event_name = 'MSFullscreenChange'; }

			// Is already Full-screen?
			if			(vid.mozRequestFullScreen) {
				r.is_fullscreen = function () {
					return document.mozFullScreen;
				};
			} else if	(vid.webkitRequestFullScreen) {
				r.is_fullscreen = function () {
					return document.webkitIsFullScreen;
				};
			} else if (vid.hasMsNativeFullScreen) {
				r.is_fullscreen = function () {
					return document.msFullscreenElement !== null;
				};
			}
		}
	}

	// clean up
	vid = null;

	if (msos.config.verbose) {
		msos.console.debug('mep.fullscreen.tests -> called, results: ', r);
	}
	return r;
};

mep.fullscreen.start = function (me_player) {
	"use strict";

	//mep.fullscreen.features.init();

    jQuery.extend(
		me_player.config, {
			usePluginFullScreen: true,
			fullscreenMode: false
		}
	);

    jQuery.extend(
		me_player.controls, {

			isFullScreen: false,
			isNativeFullScreen: false,
			docStyleOverflow: null,
			FitMediaContainerStyle: '',
			normalHeight: 0,
			normalWidth: 0,

			buildfullscreen: function (ply_obj) {

				var temp_fs = 'mep.fullscreen',
					bfs = ' - buildfullscreen -> ',
					cfg = ply_obj.config,
					fs = mep.fullscreen.tests(),
					fullscreenBtn,
					hideTimeout = null,
					enterFullScreen,
					exitFullScreen;

				enterFullScreen = function () {
					var efs = ' - enterFullScreen -> ',
						requestFullScreen = function (el) {
							if			(fs.webkit_native) {
								msos.console.debug(temp_fs + bfs + efs + 'called for webkit native');
								el.webkitRequestFullScreen();
							} else if	(fs.moz_native) {
								msos.console.debug(temp_fs + bfs + efs + 'called for moz native');
								el.mozRequestFullScreen();
							} else if	(fs.ms_native) {
								msos.console.debug(temp_fs + bfs + efs + 'called for ms native');
								el.msRequestFullscreen();
							}
						};

					msos.console.debug(temp_fs + bfs + efs + 'start.');

					// firefox+flash can't adjust plugin sizes without resetting :(
					if (ply_obj.media.pluginType !== 'native' && cfg.usePluginFullScreen) {
						msos.console.debug(temp_fs + bfs + efs + 'usePluginFullScreen: true');
						return;
					}

					// Block msos.onresize_function (we don't want auto resizing here)
					ply_obj.config.fullscreenMode = true;

					// store overflow
					ply_obj.docStyleOverflow = document.documentElement.style.overflow;
					// set it to not show scroll bars so 100% will work
					document.documentElement.style.overflow = 'hidden';

					// store sizing
					ply_obj.normalHeight = ply_obj.container.height();
					ply_obj.normalWidth  = ply_obj.container.width();

					if (msos.config.verbose) {
						msos.console.debug(temp_fs + bfs + efs + 'nominal w: ' + ply_obj.normalWidth + ', h: ' + ply_obj.normalHeight);
					}

					// attempt to do true fullscreen (Safari 5.1 and Firefox Nightly only for now)
					if (ply_obj.media.pluginType === 'native') {

						if (fs.true_native) {

							msos.console.debug(temp_fs + bfs + efs + 'for true_native');

							requestFullScreen(ply_obj.container[0]);

						} else if (fs.semi_native) {

							msos.console.debug(temp_fs + bfs + efs + 'for semi_native');

							ply_obj.media.webkitEnterFullscreen();
							return;
						}
					}

					// Store container style
					ply_obj.FitMediaContainerStyle = ply_obj.container.attr('style');

					// full window code
					// make full size
					ply_obj.container.removeAttr('style');	// fitMedia adds padding-top info
					ply_obj.container.removeClass('fitmedia');
					ply_obj.container.addClass('mejs-container-fullscreen');

					ply_obj.fullscreenBtn.removeClass('mejs-fullscreen').addClass('mejs-unfullscreen');

					ply_obj.isFullScreen = true;

					// Must let DOM changes settle before size changes...
					setTimeout(
						function () {
							ply_obj.setControlsSize();
						},
						750
					);

					msos.console.debug(temp_fs + bfs + efs + 'done!');
				};

				exitFullScreen = function () {

					var efs = ' - exitFullScreen -> ',
						cancelFullScreen = function () {
							if			(fs.webkit_native) {
								msos.console.debug(temp_fs + bfs + efs + 'called for webkit native');
								document.webkitCancelFullScreen();
							} else if	(fs.moz_native) {
								msos.console.debug(temp_fs + bfs + efs + 'called for moz native');
								document.mozCancelFullScreen();
							} else if	(fs.ms_native) {
								msos.console.debug(temp_fs + bfs + efs + 'called for ms native');
								document.msExitFullscreen();
							}
						};

					msos.console.debug(temp_fs + bfs + efs + 'start.');

					// come out of native fullscreen
					if (fs.true_native && (fs.is_fullscreen() || ply_obj.isFullScreen)) {
						msos.console.debug(temp_fs + bfs + efs + 'for true_native');
						cancelFullScreen();
					}

					// restore scroll bars to document
					document.documentElement.style.overflow = ply_obj.docStyleOverflow;

					ply_obj.container.removeClass('mejs-container-fullscreen');
					ply_obj.container.addClass('fitmedia');
					ply_obj.container.attr('style', ply_obj.FitMediaContainerStyle);


					ply_obj.fullscreenBtn.removeClass('mejs-unfullscreen').addClass('mejs-fullscreen');

					ply_obj.isFullScreen = false;

					// Must let DOM changes settle before size changes...
					setTimeout(
						function () {
							ply_obj.setControlsSize();
						},
						750
					);

					// Unblock msos.onresize_function (we want auto resizing to start again)
					ply_obj.config.fullscreenMode = false;

					msos.console.debug(temp_fs + bfs + efs + 'done!');
				};

				// Make available everywhere
				ply_obj.enterFullScreen = enterFullScreen;
				ply_obj.exitFullScreen = exitFullScreen;

				// native events
				if (fs.true_native) {

					if (msos.config.verbose) {
						msos.console.debug(temp_fs + bfs + 'set for true_native.');
					}

					ply_obj.$node.bind(
						fs.event_name,
						function () {
							if (fs.is_fullscreen()) {
								ply_obj.isNativeFullScreen = true;
								ply_obj.setControlsSize();
							} else {
								ply_obj.isNativeFullScreen = false;								
								exitFullScreen();
							}
						}
					);
				}

				fullscreenBtn = jQuery(
						'<div class="mejs-button mejs-fullscreen">' +
							'<button type="button" aria-controls="' + ply_obj.id + '" title="' + cfg.i18n.fullscreen + '" aria-label="' + cfg.i18n.fullscreen + '"><i class="fa fa-arrows-alt"></i><i class="fa fa-compress"></i></button>' +
						'</div>')
					.appendTo(ply_obj.controls);

				if (ply_obj.media.pluginType === 'native' || (!cfg.usePluginFullScreen)) {

					if (msos.config.verbose) {
						msos.console.debug(temp_fs + bfs + 'use native.');
					}

					fullscreenBtn.click(
						function (e) {
							var is_fs = (fs.true_native && fs.is_fullscreen()) || ply_obj.isFullScreen;

							msos.do_nothing(e);

							if (is_fs)	{ exitFullScreen(); }
							else		{ enterFullScreen(); }
						}
					);

				} else {

						if (msos.config.verbose) {
							msos.console.debug(temp_fs + bfs + 'use plugin.');
						}

						// the hover state will show the fullscreen button in Flash to hover up and click
						fullscreenBtn.mouseover(
							function () {
								if (hideTimeout !== null) {
									clearTimeout(hideTimeout);
									hideTimeout = null;
								}

								var buttonPos = fullscreenBtn.offset(),
									containerPos = ply_obj.container.offset();

								ply_obj.media.positionFullscreenButton(
									buttonPos.left - containerPos.left,
									buttonPos.top - containerPos.top,
									true
								);
							}
						).mouseout(
							function () {

								if (hideTimeout !== null) {
									clearTimeout(hideTimeout);
									hideTimeout = null;
								}

								hideTimeout = setTimeout(

								function () {
									ply_obj.media.hideFullscreenButton();
								}, 1500);
							}
						);
				}

				ply_obj.fullscreenBtn = fullscreenBtn;

				ply_obj.$node.bind(
					'keydown',
					function (e) {
						if (msos.config.verbose) {
							msos.console.debug(temp_fs + bfs + '$node keydown event fired!');
						}
						msos.do_nothing(e);
						if (((fs.true_native && fs.is_fullscreen()) || ply_obj.isFullScreen)
						 && e.keyCode === 27) {
							exitFullScreen();
						}
					}
				);
			}
		}
	);
};
