
/*global
    msos: false,
    jQuery: false,
    mep: false
*/

msos.provide("mep.speedselect");

mep.speedselect.version = new msos.set_version(15, 12, 2);


// Start by loading our tracks.css stylesheet
mep.speedselect.css = new msos.loader();
mep.speedselect.css.load('mep_speedselect_css', msos.resource_url('mep', 'css/speedselect.css'));


mep.speedselect.start = function (me_player) {
	"use strict";

	// add extra default options 
    jQuery.extend(
		me_player.config,
		{
			speeds: ['200', '150', '125', '100', '75'],
			defaultSpeed: '100',
			speedChar: 'x'
		}
	);

	jQuery.extend(me_player.controls, {

		buildspeedselect: function (ply_obj) {

			if (ply_obj.media.pluginType === 'native') {

				var temp_ss = 'mep.speedselect.buildspeedselect',
					cfg = ply_obj.config,
					radio_select = 'input[type=radio][name=' + ply_obj.id + '_speed]',
					playbackSpeed = null,
					inputId = null,
					$li,
					speeds = [],
					defaultInArray = false,
					i = 0,
					s,
					getSpeedNameFromValue,
					button;

				for (i = 0; i < cfg.speeds.length; i += 1) {

					s = cfg.speeds[i];
	
					speeds.push({
						name: parseFloat(s / 100) + cfg.speedChar,
						value: s
					});

					if (s === cfg.defaultSpeed) {
						defaultInArray = true;
					}
				}

				if (!defaultInArray) {
					speeds.push({
						name: cfg.defaultSpeed + cfg.speedChar,
						value: cfg.defaultSpeed
					});
				}

				speeds.sort(
					function (a, b) {
						return parseFloat(b.value) - parseFloat(a.value);
					}
				);

				getSpeedNameFromValue = function (value) {
					var i = 0;

					for (i = 0; i < speeds.length; i += 1) {
						if (speeds[i].value === value) {
							return speeds[i].name;
						}
					}

					return 'unknown';
				};

				ply_obj.speedButton = jQuery('<div class="mejs-button mejs-speed"></div>');
				ply_obj.speedSelector = jQuery('<div class="mejs-speed-selector"><ul></ul></div>');
 
				button = jQuery('<button type="button">' + getSpeedNameFromValue(cfg.defaultSpeed) + '</button>');

				ply_obj.speedButton.append(button);

				for (i = 0; i < speeds.length; i += 1) {

					inputId = ply_obj.id + '-speed-' + speeds[i].value;

					$li = jQuery(
						'<li>' +
							'<input type="radio" name="' + ply_obj.id + '_speed" value="' + speeds[i].value + '" id="' + inputId + '" />' +
							'<label for="' + inputId + '">' + speeds[i].name + '</label>' +
						'</li>'
					);

					ply_obj.speedSelector.find('ul').append($li);
				}

				ply_obj.speedButton.append(ply_obj.speedSelector);
				ply_obj.speedButton.appendTo(ply_obj.controls);

				playbackSpeed = cfg.defaultSpeed;

				ply_obj.media.addEventListener(
					'loadedmetadata',
					function () {
						if (playbackSpeed) {
							ply_obj.media.playbackRate = parseFloat(playbackSpeed / 100);
						}
					},
					true
				);

				// Mobile
				button.on(
					'click',
					function () {
						ply_obj.speedSelector.css('visibility', 'visible');
						ply_obj.speedSelector.find(radio_select + '[value=' + playbackSpeed + ']').prop('checked', true);
					}
				);

				// hover or keyboard focus
				ply_obj.speedButton.on(
					'mouseenter focusin',
					function () {
						ply_obj.speedSelector.css('visibility', 'visible');
						ply_obj.speedSelector.find(radio_select + '[value=' + playbackSpeed + ']').prop('checked', true);
					}
				).on(
					'mouseleave focusout',
					function () {
						ply_obj.speedSelector.css('visibility', 'hidden');
					}
				);

				ply_obj.speedSelector.on(
					'click',	// change doesn't work in FF
					radio_select,
					function () {
						var newSpeed = jQuery(this).attr('value'),
							plybck_rate = parseFloat(newSpeed / 100);

							msos.console.debug(temp_ss + ' - on.change -> fired, value: ' + newSpeed + ', parseFloat: ' + plybck_rate);

							playbackSpeed = newSpeed;
							ply_obj.media.playbackRate = plybck_rate;

							button.html(getSpeedNameFromValue(newSpeed));
							ply_obj.speedSelector.css('visibility', 'hidden');
					}
				);
			}
		}
	});
};
