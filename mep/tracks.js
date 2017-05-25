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

// Language selection text, ref. 'msos.config.i18n.select_trans_msos'

msos.provide("mep.tracks");

mep.tracks.version = new msos.set_version(17, 5, 21);


// Start by loading our tracks.css stylesheet
mep.tracks.css = new msos.loader();
mep.tracks.css.load(msos.resource_url('mep', 'css/tracks.css'));

	
mep.tracks.SMPTEtoSec = function (SMPTE) {
	"use strict";

	if (typeof SMPTE !== 'string') {
		return false;
	}

	SMPTE = SMPTE.replace(',', '.');

	var secs = 0,
		decimalLen = (SMPTE.indexOf('.') !== -1) ? SMPTE.split('.')[1].length : 0,
		multiplier = 1,
		i = 0;

	SMPTE = SMPTE.split(':').reverse();

	for (i = 0; i < SMPTE.length; i += 1) {
		multiplier = 1;
		if (i > 0) {
			multiplier = Math.pow(60, i);
		}
		secs += Number(SMPTE[i]) * multiplier;
	}

	return Number(secs.toFixed(decimalLen));
};

/*
Parses WebVVT format which should be formatted as
================================
WEBVTT

1
00:00:01,1 --> 00:00:05,000
A line of text

2
00:01:15,1 --> 00:02:05,000
A second line of text

===============================

Adapted from: http://www.delphiki.com/html5/playr
*/
mep.tracks.format_parser = {

	webvvt: {
		// match start "chapter-" (or anythingelse)
		pattern_timecode: /^((?:[0-9]{1,2}:)?[0-9]{2}:[0-9]{2}([,.][0-9]{1,3})?) --\> ((?:[0-9]{1,2}:)?[0-9]{2}:[0-9]{2}([,.][0-9]{3})?)(.*)$/,

		parse: function (trackText) {
			"use strict";
			var i = 0,
				lines = mep.tracks.format_parser.split2(trackText, /\r?\n/),
				entries = { text: [], times: [] },
				timecode,
				text,
				identifier;

			for (i = 0; i < lines.length; i += 1) {

				timecode = this.pattern_timecode.exec(lines[i]);

				if (timecode
				 && i < lines.length) {

					if ((i - 1) >= 0
					 && lines[i - 1] !== '') {
						identifier = lines[i - 1];
					}

					i += 1;

					// grab all the (possibly multi-line) text that follows
					text = lines[i];

					i += 1;

					while(lines[i] !== '' && i < lines.length){
						text = text + '\n' + lines[i];
						i += 1;
					}

					text = jQuery.trim(text).replace(/(\b(https?|ftp|file):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|])/ig, "<a href='$1' target='_blank'>$1</a>");

					// Text is in a different array so I can use .join
					entries.text.push(text);
					entries.times.push(
						{
							identifier: identifier,
							start: (mep.tracks.SMPTEtoSec(timecode[1]) === 0) ? 0.200 : mep.tracks.SMPTEtoSec(timecode[1]),
							stop: mep.tracks.SMPTEtoSec(timecode[3]),
							settings: timecode[5]
						}
					);
				}
				identifier = '';
			}
			return entries;
		}
	},

	// Thanks to Justin Capella: https://github.com/johndyer/mediaelement/pull/420
	dfxp: {
		parse: function (trackText) {
			"use strict";

			trackText = jQuery(trackText).filter("tt");

			var i = 0,
				container = trackText.children("div").eq(0),
				lines = container.find("p"),
				styleNode = trackText.find("#" + container.attr("style")),
				styles,
				style,
				_style,
				text,
				entries = { text: [], times: [] },
				attributes,
				_temp_times = {};

			if (styleNode.length) {
				attributes = styleNode.removeAttr("id").get(0).attributes;
				if (attributes.length) {
					styles = {};
					for (i = 0; i < attributes.length; i += 1) {
						styles[attributes[i].name.split(":")[1]] = attributes[i].value;
					}
				}
			}

			for (i = 0; i < lines.length; i += 1) {
				style = '';
				_style = '';
				_temp_times = {
					start: null,
					stop: null,
					style: null
				};

				if (lines.eq(i).attr("begin")) {
					_temp_times.start = mep.tracks.SMPTEtoSec(lines.eq(i).attr("begin"));
				}
				if (!_temp_times.start && lines.eq(i - 1).attr("end")) {
					_temp_times.start = mep.tracks.SMPTEtoSec(lines.eq(i - 1).attr("end"));
				}
				if (lines.eq(i).attr("end")) {
					_temp_times.stop = mep.tracks.SMPTEtoSec(lines.eq(i).attr("end"));
				}
				if (!_temp_times.stop && lines.eq(i + 1).attr("begin")) {
					_temp_times.stop = mep.tracks.SMPTEtoSec(lines.eq(i + 1).attr("begin"));
				}

				if (styles) {
					for (_style in styles) {
						if (styles.hasOwnProperty(_style)) {
							style += _style + ":" + styles[_style] + ";";
						}
					}
				}

				if (style) {
					_temp_times.style = style;
				}
				if (_temp_times.start === 0) {
					_temp_times.start = 0.200;
				}

				entries.times.push(_temp_times);

				text = jQuery.trim(lines.eq(i).html()).replace(/(\b(https?|ftp|file):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|])/ig, "<a href='$1' target='_blank'>$1</a>");

				entries.text.push(text);
				if (entries.times.start === 0) {
					entries.times.start = 2;
				}
			}
			return entries;
		}
	},

	split2: function (text, regex) {
		"use strict";
		return text.split(regex);
	}
};

mep.tracks.start = function (me_player) {
    "use strict";

    // add extra default options 
    jQuery.extend(
		me_player.config,
		{
			auto_start_cc: false,

			startLanguage: msos.config.locale,

			// By default, no WAI-ARIA live region - don't make a
			// screen reader speak captions over an audio track.
			tracksAriaLive: false,

			// option to remove the [cc] button when no <track kind="subtitles"> are present
			hideCaptionsButtonWhenEmpty: true,

			// If true and we only have one track, just launch
			toggle_for_one: false,

			// #id or .class
			slidesSelector: ''
		}
	);

    jQuery.extend(me_player.controls, {

        hasChapters: false,

        buildtracks: function (ply_obj) {

            var temp_bt = 'mep.tracks.start - buildtracks -> ',
				radio_select = 'input[type=radio][name=' + ply_obj.id + '_captions]',
				tracksRadioVal = 'none',	// start default
				button,
				i = 0,
				subtitleCount = 0;

			msos.console.debug(temp_bt + 'start.');

			// If browser will do native captions, prefer mejs captions, loop through tracks -> hide
			if (ply_obj.node.textTracks) {
				for (i = ply_obj.node.textTracks.length - 1; i >= 0; i -= 1) {
					ply_obj.node.textTracks[i].mode = "hidden";
				}
			}

			ply_obj.tracks = [];
            ply_obj.trackToLoad = -1;
            ply_obj.selectedTrack = null;
            ply_obj.isLoadingTrack = false;

			ply_obj.findTracks = function () {

				var tracktags = ply_obj.$node.find('track');

				tracktags.each(
					function (index, track) {
						track = jQuery(track);

						ply_obj.tracks.push({
							srclang:	track.attr('srclang').toLowerCase(),
							src:		track.attr('src'),
							kind:		track.attr('kind'),
							label:		track.attr('label') || '',
							entries:	[],
							isLoaded:	false
						});
					}
				);
			};

			ply_obj.findTracks();

			// No tracks, so quit
            if (ply_obj.tracks.length === 0) { return; }

			for (i = 0; i < ply_obj.tracks.length; i += 1) {
				if (ply_obj.tracks[i].kind === 'subtitles') {
					subtitleCount += 1;
				}
			}

			msos.console.debug(temp_bt + 'found: ' + ply_obj.tracks.length + ', type subtitles: ' + subtitleCount);

			// Define our html, since there are some tracks
			ply_obj.captions = jQuery('<div class="mejs-captions-layer"></div>');
			ply_obj.captionsButton = jQuery('<div class="mejs-button mejs-captions"></div>');
			ply_obj.captionsSelect = jQuery('<div class="mejs-captions-selector"><ul></ul></div>');
			ply_obj.captionsPos = jQuery('<div class="mejs-captions-position"></div>');
			ply_obj.captionsText = jQuery('<span class="mejs-captions-text"></span>');
			ply_obj.chapters = jQuery('<div class="mejs-chapters"></div>');

			button = jQuery('<button type="button" aria-controls="' + ply_obj.id + '_captions" title="' + ply_obj.config.i18n.tracks_text + '" aria-label="' + ply_obj.config.i18n.tracks_text + '"><i class="fa fa-cc"></i></button>');

			ply_obj.captionsButton.append(button);

			if (ply_obj.config.tracksAriaLive) {
				ply_obj.captionsPos.attr({ role: "log", 'aria-live': "assertive", 'aria-atomic': false });
			}

			ply_obj.adjustLanguageBox = function () {
				// adjust the size of the outer box
				ply_obj.captionsSelect.height(
					ply_obj.captionsSelect.find('ul').outerHeight(true)
				);
			};

			ply_obj.removeTrackButton = function (lang) {

				ply_obj.captionsButton.find('input[value=' + lang + ']').closest('li').remove();

				ply_obj.adjustLanguageBox();
			};

			ply_obj.addTrackButton = function (lang, label) {

				if (lang === 'none') {
					label = ply_obj.config.i18n.tracks_none;
				}

				if (label === '') {
					label = msos.config.i18n.select_trans_msos[lang] || lang;
				}

				var radio_input = jQuery(
						'<li>' +
							'<input type="radio" name="' + ply_obj.id + '_captions" id="' + ply_obj.id + '_captions_' + lang + '" value="' + lang + '" />' +
							'<label for="' + ply_obj.id + '_captions_' + lang + '">' + label + '</label>' +
						'</li>'
					);

				ply_obj.captionsSelect.find('ul').append(radio_input);

				ply_obj.adjustLanguageBox();
			};

			ply_obj.loadTrack = function (index) {
				var track = ply_obj.tracks[index];

				jQuery.ajax({
					url: track.src,
					dataType: "text",
					success: function (d) {

						// parse the loaded file
						if (typeof d === "string" && (/<tt\s+xml/ig).exec(d)) {
							track.entries = mep.tracks.format_parser.dfxp.parse(d);					
						} else {
							track.entries = mep.tracks.format_parser.webvvt.parse(d);
						}

						track.isLoaded = true;

						// auto select
						if (ply_obj.config.auto_start_cc
						 && ply_obj.config.startLanguage === track.srclang) {
							jQuery('#' + ply_obj.id + '_captions_' + track.srclang).trigger('click');
						}

						ply_obj.adjustLanguageBox();
						ply_obj.loadNextTrack();

						if (track.kind === 'chapters') {
							ply_obj.media.addEventListener(
								'play',
								function () {
									if (ply_obj.media.duration > 0) {
										ply_obj.displayChapters(track);
									}
								},
								false
							);
						}

						if (track.kind === 'slides') {
							ply_obj.setupSlides(track);
						}
					},
					error: function () {
						msos.console.error(temp_bt + 'error during jQuery.ajax call.');
						ply_obj.removeTrackButton(track.srclang);
						ply_obj.loadNextTrack();
					}
				});
			};

			ply_obj.setTrack = function (lang){

				var i = 0;

				if (lang === 'none') {
					ply_obj.selectedTrack = null;
				} else {
					for (i = 0; i < ply_obj.tracks.length; i += 1) {
						if (ply_obj.tracks[i].srclang === lang) {
							ply_obj.selectedTrack = ply_obj.tracks[i];
							ply_obj.captions.attr('lang', ply_obj.selectedTrack.srclang);
							ply_obj.displayCaptions();
							break;
						}
					}
				}
			};

			ply_obj.loadNextTrack = function () {

				ply_obj.trackToLoad += 1;
				if (ply_obj.trackToLoad < ply_obj.tracks.length) {
					ply_obj.isLoadingTrack = true;
					ply_obj.loadTrack(ply_obj.trackToLoad);
				} else {
					// add done?
					ply_obj.isLoadingTrack = false;
					ply_obj.checkForTracks();
				}
			};

			ply_obj.checkForTracks = function () {
				var i = 0,
					hasSubtitles = false;

				// check if any subtitles
				if (ply_obj.config.hideCaptionsButtonWhenEmpty) {
					for (i = 0; i < ply_obj.tracks.length; i += 1) {
						if (ply_obj.tracks[i].kind === 'subtitles'
						 && ply_obj.tracks[i].isLoaded) {
							hasSubtitles = true;
							break;
						}
					}

					if (!hasSubtitles) {
						ply_obj.captionsButton.hide();
						ply_obj.setControlsSize();
					}
				}
			};

			ply_obj.displayCaptions = function () {

				if (ply_obj.tracks === undefined) {
					return;
				}

				var i, track = ply_obj.selectedTrack;

				if (track !== null && track.isLoaded) {

					for (i = 0; i < track.entries.times.length; i += 1) {
						if (ply_obj.media.currentTime >= track.entries.times[i].start
						 && ply_obj.media.currentTime <= track.entries.times[i].stop) {
							ply_obj.captionsText.html(track.entries.text[i]).attr('class', 'mejs-captions-text ' + (track.entries.times[i].identifier || ''));
							ply_obj.captions.show().height(0);
							return; // exit out if one is visible;
						}
					}

					ply_obj.captions.hide();
				} else {
					ply_obj.captions.hide();
				}
			};

			ply_obj.drawChapters = function (chapters) {
				var i,
					dur,
					percent = 0,
					usedPercent = 0;

				ply_obj.chapters.empty();

				for (i = 0; i < chapters.entries.times.length; i += 1) {
					dur = chapters.entries.times[i].stop - chapters.entries.times[i].start;
					percent = Math.floor(dur / ply_obj.media.duration * 100);
					if (percent + usedPercent > 100 || // too large
					(i === chapters.entries.times.length - 1 && percent + usedPercent < 100)) {
						percent = 100 - usedPercent;
					}

					ply_obj.chapters.append(
						jQuery('<div class="mejs-chapter" rel="' + chapters.entries.times[i].start + '" style="left: ' + usedPercent.toString() + '%;width: ' + percent.toString() + '%;">' +
							   '<div class="mejs-chapter-block' + ((i === chapters.entries.times.length - 1) ? ' mejs-chapter-block-last' : '') + '">' +
									'<span class="ch-title">' +
										chapters.entries.text[i] +
									'</span>' +
									'<span class="ch-time">' +
										mep.player.utils.secondsToTimeCode(chapters.entries.times[i].start, ply_obj.config) + '&ndash;' + mep.player.utils.secondsToTimeCode(chapters.entries.times[i].stop, ply_obj.config) +
									'</span>' +
								'</div>' +
							'</div>')
					);
					usedPercent += percent;
				}

				ply_obj.chapters.find('div.mejs-chapter').click(
					function (e) {
						msos.do_nothing(e);
						ply_obj.media.setCurrentTime(parseFloat(jQuery(this).attr('rel')));
						if (ply_obj.media.paused) {
							ply_obj.media.play();
						}
					});

				ply_obj.chapters.show();
			};

			ply_obj.setupSlides = function (track) {

				ply_obj.slides = track;
				ply_obj.slides.entries.imgs = [ply_obj.slides.entries.text.length];
				ply_obj.showSlide(0);
			};

			ply_obj.showSlide = function (index) {

				if (ply_obj.tracks === undefined
				 || ply_obj.slidesContainer === undefined) {
					return;
				}

				var url = ply_obj.slides.entries.text[index],
					img = ply_obj.slides.entries.imgs[index];

				if (img === undefined || img.fadeIn === undefined) {

					ply_obj.slides.entries.imgs[index] = img = jQuery('<img src="' + url + '">')
							.on(
								'load',
								function () {
									img.appendTo(ply_obj.slidesContainer)
										.hide()
											.fadeIn()
												.siblings(':visible')
													.fadeOut();
								}
							);
	
				} else {
	
					if (!img.is(':visible') && !img.is(':animated')) {
	
						img.fadeIn()
							.siblings(':visible')
								.fadeOut();
					}
				}
			};

			ply_obj.displaySlides = function () {

				var slides = ply_obj.slides,
					i;
	
				if (slides === undefined) {
					return;
				}

				for (i = 0; i < slides.entries.times.length; i += 1) {
					if (ply_obj.media.currentTime >= slides.entries.times[i].start
					 && ply_obj.media.currentTime <= slides.entries.times[i].stop) {
	
						ply_obj.showSlide(i);
	
						return; // exit out if one is visible;
					}
				}
			};

			ply_obj.displayChapters = function () {
				var i;

				for (i = 0; i < ply_obj.tracks.length; i += 1) {
					if (ply_obj.tracks[i].kind === 'chapters' && ply_obj.tracks[i].isLoaded) {
						ply_obj.drawChapters(ply_obj.tracks[i]);
						ply_obj.hasChapters = true;
						break;
					}
				}
			};

			// Apply our html to the mep player object
            ply_obj.chapters.prependTo(ply_obj.layers).hide();

			ply_obj.captionsPos.append(ply_obj.captionsText);

			ply_obj.captions.append(ply_obj.captionsPos);
            ply_obj.captions.prependTo(ply_obj.layers).hide();

			ply_obj.captionsButton.append(ply_obj.captionsSelect);
            ply_obj.captionsButton.appendTo(ply_obj.controls);

			// if only one language then just make the button a toggle
			if (ply_obj.config.toggle_for_one && subtitleCount === 1){

				button.on(
					'click',
					function () {
						var lang = 'none';

						if (ply_obj.selectedTrack === null) {
							lang = ply_obj.tracks[0].srclang;
						}

						ply_obj.setTrack(lang);
					}
				);

			} else {

				// Mobile
				button.on(
					'click',
					function () {
						ply_obj.captionsSelect.css('visibility', 'visible');
						ply_obj.captionsSelect.find(radio_select + '[value=' + tracksRadioVal + ']').prop('checked', true);
					}
				);

				// hover or keyboard focus
				ply_obj.captionsButton.on(
					'mouseenter focusin',
					function () {
						ply_obj.captionsSelect.css('visibility', 'visible');
						ply_obj.captionsSelect.find(radio_select + '[value=' + tracksRadioVal + ']').prop('checked', true);
						
					}
				).on(
					'mouseleave focusout',
					function () {
						ply_obj.captionsSelect.css('visibility', 'hidden');
					}
				);
			}

            if (!ply_obj.config.alwaysShowControls) {
                // move with controls
                ply_obj.container
					.bind(
						'controlsshown',
						function () {
							// push captions above controls
							ply_obj.captionsPos.addClass('mejs-captions-position-hover');
						}
					).bind(
						'controlshidden',
						function () {
							if (!ply_obj.media.paused) {
								// move back to normal place
								ply_obj.captionsPos.removeClass('mejs-captions-position-hover');
							}
						}
					);
            } else {
                ply_obj.captionsPos.addClass('mejs-captions-position-hover');
            }

			// Add language eq 'none' to stop CC display
			ply_obj.addTrackButton('none', ply_obj.config.i18n.tracks_none);

            // Add to <ul> all available tracks
            for (i = 0; i < ply_obj.tracks.length; i += 1) {
                if (ply_obj.tracks[i].kind === 'subtitles') {
                    ply_obj.addTrackButton(
						ply_obj.tracks[i].srclang,
						ply_obj.tracks[i].label
					);
                }
            }

			// start loading tracks
            ply_obj.loadNextTrack();

            ply_obj.media.addEventListener(
				'timeupdate',
				function () {
					ply_obj.displayCaptions();
				},
				false
			);

			if (ply_obj.config.slidesSelector !== '') {
				ply_obj.slidesContainer = jQuery(ply_obj.config.slidesSelector);

				ply_obj.media.addEventListener(
					'timeupdate',
					function () {
						ply_obj.displaySlides();
					},
					false
				);
			}

            ply_obj.media.addEventListener(
				'loadedmetadata',
				function () {
					ply_obj.displayChapters();
				},
				false
			);

            ply_obj.container.hover(

				function () {
					// chapters
					if (ply_obj.hasChapters) {
						ply_obj.chapters.css('visibility', 'visible');
						ply_obj.chapters.fadeIn(200)
							.height(ply_obj.chapters.find('.mejs-chapter').outerHeight());
					}
				},
				function () {
					if (ply_obj.hasChapters
					&& !ply_obj.media.paused) {
						ply_obj.chapters.fadeOut(
							200,
							function () {
								jQuery(this).css('visibility', 'hidden');
								jQuery(this).css('display', 'block');
							}
						);
					}
				}
			);

            // check for autoplay
            if (ply_obj.node.getAttribute('autoplay') !== null) {
                ply_obj.chapters.css('visibility', 'hidden');
            }

			ply_obj.captionsSelect.on(
				'click',	// change doesn't work in FF
				radio_select,
				function () {
					var value = jQuery(this).val();

					tracksRadioVal = value;

					msos.console.debug('mep.tracks.start - buildtracks - on.change -> fired, value: ' + value);

					ply_obj.setTrack(value);
					ply_obj.captionsSelect.css('visibility', 'hidden');
				}
			);

			msos.console.debug(temp_bt + 'done!');
        }
    });
};
