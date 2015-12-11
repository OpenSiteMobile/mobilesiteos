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

msos.provide("mep.keyboard");

mep.keyboard.version = new msos.set_version(15, 12, 9);


mep.keyboard.start = function (me_player) {
	"use strict";

	jQuery.extend(
		me_player.config,
		{
            // turns keyboard support on and off for this instance
            enableKeyboard: true,
            // array of keyboard actions such as play pause
            keyActions: [
                {
                    keys: [
                        32, // SPACE
                        179 // GOOGLE play/pause button
                    ],
                    action: function (ply_obj) {
                        if (ply_obj.media.paused || ply_obj.media.ended) {
                            ply_obj.media.play();
                        } else {
                            ply_obj.media.pause();
                        }
                    }
                },
                {
                    keys: [38], // UP
                    action: function (ply_obj) {
							ply_obj.volumeSlider.css('display','block');

							if (ply_obj.isVideo) {
								ply_obj.showControls();
								ply_obj.startControlsTimer();
							}

                        var newVolume = Math.min(ply_obj.media.volume + 0.1, 1);
                        ply_obj.media.setVolume(newVolume);
                    }
                },
                {
                    keys: [40], // DOWN
                    action: function (ply_obj) {
						ply_obj.volumeSlider.css('display','block');

						if (ply_obj.isVideo) {
							ply_obj.showControls();
							ply_obj.startControlsTimer();
						}

                        var newVolume = Math.max(ply_obj.media.volume - 0.1, 0);
                        ply_obj.media.setVolume(newVolume);
                    }
                },
                {
                    keys: [
                        37, // LEFT
                        227 // Google TV rewind
                    ],
                    action: function (ply_obj) {
                        if (!isNaN(ply_obj.media.duration) && ply_obj.media.duration > 0) {
                            if (ply_obj.isVideo) {
                                ply_obj.showControls();
                                ply_obj.startControlsTimer();
                            }
                            // 5%
							var newTime = Math.max(ply_obj.media.currentTime - ply_obj.config.defaultSeekBackwardInterval(ply_obj.media), 0);
                            ply_obj.media.setCurrentTime(newTime);
                        }
                    }
                },
                {
                    keys: [
                        39, // RIGHT
                        228 // Google TV forward
                    ],
                    action: function (ply_obj) {
                        if (!isNaN(ply_obj.media.duration) && ply_obj.media.duration > 0) {
                            if (ply_obj.isVideo) {
                                ply_obj.showControls();
                                ply_obj.startControlsTimer();
                            }

                            // 5%
							var newTime = Math.min(ply_obj.media.currentTime + ply_obj.config.defaultSeekForwardInterval(ply_obj.media), ply_obj.media.duration);
                            ply_obj.media.setCurrentTime(newTime);
                        }
                    }
                },
                {
                    keys: [70], // F
                    action: function (ply_obj) {
                        if (ply_obj.enterFullScreen !== undefined) {
                            if (ply_obj.isFullScreen) {
                                ply_obj.exitFullScreen();
                            } else {
                                ply_obj.enterFullScreen();
                              }
                        }
                    }
                },
				{
						keys: [77], // M
						action: function (ply_obj) {
								ply_obj.volumeSlider.css('display','block');

								if (ply_obj.isVideo) {
										ply_obj.showControls();
										ply_obj.startControlsTimer();
								}

								if (ply_obj.media.muted)	{ ply_obj.setMuted(false); }
								else						{ ply_obj.setMuted(true); }
						}
				}
            ]
		}
	);

	// Add keyboard hot-keys, movements
	jQuery.extend(
		me_player.controls,
		{
			buildkeyboard: function (ply_obj) {

                // listen for key presses
                jQuery(document).keydown(
                    function (e) {
                        var i = 0,
							cfg = ply_obj.config,
                            il = cfg.keyActions.length,
                            keyAction,
                            j = 0;

                        if (ply_obj.hasFocus && cfg.enableKeyboard) {
                            // find a matching key
                            for (i = 0; i < il; i += 1) {

                                keyAction = cfg.keyActions[i];

                                for (j = 0; j < keyAction.keys.length; j += 1) {
                                    if (e.keyCode === keyAction.keys[j]) {
                                        if (typeof(e.preventDefault) === "function") { e.preventDefault(); }
										keyAction.action(ply_obj);
										msos.console.debug(this.name + ' - buildkeyboard - keydown -> called for: ' + e.keyCode);
                                        return false;
                                    }
                                }
                            }
                        }
                        return true;
                    }
                );

                // check if someone clicked outside a player region, then kill its focus
                jQuery(document).click(
                    function (event) {
                        if (jQuery(event.target).closest('.mejs-container').length === 0) {
                            ply_obj.hasFocus = false;
                        }
                    }
                );
            }
		}
	);
};
