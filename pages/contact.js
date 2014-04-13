// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("pages.contact");
msos.require("msos.google.maps");


msos.onload_functions.push(
	function () {
        "use strict";

		msos.console.info('Content: contact.html loaded!');

		var contact_map = function () {

			var geo_error = function (msg) {
					msg = typeof msg === 'string' ? msg : "Mapping failed!"
					msos.console.warn('Content: contact.html, mapping problem: ' + msg);
				},
				geo_locate = function (position) {

					// Go to go, so show map canvas
					msos.byid("map_canvas").style.display = 'block';

					var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
						myOptions = {
							zoom: 10,
							center: latlng,
							mapTypeControl: false,
							navigationControlOptions: { style: google.maps.NavigationControlStyle.SMALL },
							mapTypeId: google.maps.MapTypeId.ROADMAP
						},
						map = new google.maps.Map(msos.byid("map_canvas"), myOptions),
						marker = new google.maps.Marker({
							position: latlng,
							map: map,
							title: "Beautiful Hanahan, SC!"
						});

					msos.console.debug('Content: contact.html - geo_locate -> done!');
				};
	
			geo_locate({ coords: { latitude: 32.9169, longitude: -79.9958 } });
		};

		msos.console.debug('Content: contact.html done!');

		msos.google.maps.add_onload_ready(contact_map);
	}
);