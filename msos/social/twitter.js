// Copyright Notice:
//				    twitter.js
//			Copyright©2013-2017 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensitemobile.com and http://ngmomentum.com
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile Twitter functions

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.social.twitter");

msos.social.twitter.version = new msos.set_version(17, 6, 22);


msos.social.twitter.like = function () {
    "use strict";

    var url = 'http://platform.twitter.com/widgets.js',
		tw_data = {
			'data-count' : 'horizontal',
			'data-text': 'Open Source Software for the Mobile Web',
			'data-url': msos.base_site_url,
			'data-via': 'mobilesiteos',
			'data-size': 'medium',
			'data-lang': msos.config.locale.substr(0,2)
	    };

    // Set to your website/page, text and twitter call
    if (jQuery('.twitter-share-button').length) {
		jQuery('.twitter-share-button').attr(tw_data);

		// Use our loader for better debugging
		msos.site.loader.load(url, 'js');
    }
};

msos.site.social_html =
	'<div class="row">' +
		'<div class="span3">' +
			'<div class="g-plusone"></div>' +	// Google rewrites the g-plusone div
		'</div>' +
		'<div class="span3 fb-like"></div>' +
		'<div class="span3 twitter-like">' +
			'<a class="twitter-share-button" href="https://twitter.com/share">Tweet</a>' +
		'</div>' +
	'</div>' +
    '<script>' +
		'msos.site.google_plusone();' +
		'msos.site.facebook_like();' +
		'msos.site.twitter_like();' +
    '</script>';