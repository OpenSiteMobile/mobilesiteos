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

msos.provide("mep.poster");

mep.poster.version = new msos.set_version(15, 12, 2);


mep.poster.start = function (me_player) {
	"use strict";

	// Add Poster for video
	jQuery.extend(
		me_player.controls,
		{
			buildposter: function (ply_obj) {

				var poster = jQuery('<div class="mejs-poster">').appendTo(ply_obj.layers),
					posterUrl = ply_obj.$node.attr('poster') || ply_obj.config.poster,
					setPoster = function (url) {
						var posterImg = poster.find('img');

						if (posterImg.length === 0) {
							posterImg = jQuery('<img alt="poster" />').appendTo(poster);
						}

						posterImg.attr('src', url);
					};

				// second, try the real poster
				if (posterUrl) {
					setPoster(posterUrl);
				} else {
					poster.hide();
				  }

				ply_obj.media.addEventListener(
					'play',
					function () { poster.hide(); },
					false
				);

				// Make available everywhere
				ply_obj.poster = poster;
				ply_obj.setPoster = setPoster;
			}
		}
	);
};
