
/*global
    msos: false,
    jQuery: false,
    mep: false
*/

msos.provide("mep.speedselect");

mep.speedselect.version = new msos.set_version(15, 11, 12);


// Start by loading our tracks.css stylesheet
mep.speedselect.css = new msos.loader();
mep.speedselect.css.load('mep_speedselect_css', msos.resource_url('mep', 'css/speedselect.css'));


mep.speedselect.start = function () {
	"use strict";

	// add extra default options 
    jQuery.extend(
		mep.player.config,
		{
			// Also supported => [{name: 'Slow', value: '0.75'}, {name: 'Normal', value: '1.00'}, ...]
			speeds: ['2.00', '1.50', '1.25', '1.00', '0.75'],
			defaultSpeed: '1.00',
			speedChar: 'x'
		}
	);

	jQuery.extend(mep.player.controls, {

		buildspeed: function (ply_obj) {

			if (ply_obj.media.pluginType === 'native') {

				var cfg = ply_obj.options,
					speedButton = null,
					speedSelector = null,
					playbackSpeed = null,
					inputId = null,
					speeds = [],
					defaultInArray = false,
					i = 0,
					s,
					getSpeedNameFromValue,
					button,
					html;

				for (i = 0; i < cfg.speeds.length; i += 1) {

					s = cfg.speeds[i];

					if (typeof s === 'string'){
	
						speeds.push({
							name: s + cfg.speedChar,
							value: s
						});

						if (s === cfg.defaultSpeed) {
							defaultInArray = true;
						}
					} else {

						speeds.push(s);

						if (s.value === cfg.defaultSpeed) {
							defaultInArray = true;
						}
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

				speedButton = '<div class="mejs-button mejs-speed-button"></div>';
				button = '<button type="button">' + getSpeedNameFromValue(cfg.defaultSpeed) + '</button>';

				html = '<div class="mejs-speed-selector">' +
							'<ul>';

				for (i = 0; i < speeds.length; i += 1) {

					inputId = ply_obj.id + '-speed-' + speeds[i].value;
	
						html += '<li>' + 
									'<input type="radio" name="speed" value="' + speeds[i].value + '" id="' + inputId + '" ' + (speeds[i].value === cfg.defaultSpeed ? ' checked' : '') + ' />' +
									'<label for="' + inputId + '" ' + (speeds[i].value === cfg.defaultSpeed ? ' class="mejs-speed-selected"' : '') + '>' + speeds[i].name + '</label>' +
								'</li>';
				}
					html += '</ul></div>';

				speedSelector = jQuery(html);
				speedButton.append(button, speedSelector);
				speedButton.appendTo(ply_obj.controls);

				playbackSpeed = cfg.defaultSpeed;

				ply_obj.media.addEventListener(
					'loadedmetadata',
					function () {
						if (playbackSpeed) {
							ply_obj.media.playbackRate = parseFloat(playbackSpeed);
						}
					},
					true
				);

				speedSelector.on(
					'click',
					'input[type="radio"]',
					function (e) {
						msos.do_nothing(e);

						var newSpeed = jQuery(this).attr('value');

						playbackSpeed = newSpeed;
						ply_obj.media.playbackRate = parseFloat(newSpeed);

						button.html(getSpeedNameFromValue(newSpeed));

						speedButton.find('.mejs-speed-selected').removeClass('mejs-speed-selected');
						speedButton.find('input[type="radio"]:checked').next().addClass('mejs-speed-selected');
					}
				);

				speedButton.one(
					'mouseenter focusin',
					function () {
						speedSelector
							.height(
								speedButton.find('.mejs-speed-selector ul').outerHeight(true)
							).css(
								'top', (-1 * speedSelector.height()) + 'px'
							);
					}
				);
			}
		}
	});
};

// Load early, but after 'mep.player' has loaded
msos.onload_func_start.push(mep.speedselect.start);
