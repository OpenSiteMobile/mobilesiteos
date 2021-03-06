// Copyright Notice:
//					site.js
//			Copyright©2012-2017 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensitemobile.com
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com

/*

	Use 'site.js' to add site specific code for availability
	to many pages and apps. Note that here, as oppose to the 'config.js'
	file, jQuery, Bootstrap, AngularJS, Backbone, etc. are now available for use.

	Also, add small jQuery plugin's here, (ie - jQuery FitText below).

	OpenSiteMobile MobileSiteOS site specific code:

	    Google Analytics,
	    Social site calls, etc.
	
	Plus:

	    Auto-Load Modules - based on dom elements
*/

/*global
	msos:false,
	Modernizr:false,
	jQuery: false
*/

msos.site = {
	msie: document.documentMode
};

msos.console.info('site -> start, (/mobilesiteos/site.js file).');
msos.console.time('site');


// --------------------------
// VisualEvent DOM3 Event Tracking
// --------------------------

// Add event debugging to "addEventListener", for DOM3 "VisualEvent"
if (msos.config.visualevent) {

	// Add event debugging to "addEventListener"
	Element.prototype.recorded_addEventListener = [];
	Element.prototype.org_addEventListener = Element.prototype.addEventListener;
	Element.prototype.addEventListener = function (a, b, c) {
		"use strict";

		this.org_addEventListener(a, b, c);

		// Exclude jQuery added event, (we get them later)
		if (typeof jQuery._data(jQuery(this)[0], 'events') !== 'object') {
			this.recorded_addEventListener.push(
				{
					"type" : a,
					"func" : b.toString(),
					"removed": false,
					"source": 'DOM 3 event'
				}
			);
		}
	};
}


/*
 * Copyright (c) 2013 Mike King (@micjamking)
 *
 * jQuery Succinct plugin
 * Version 1.0.1 (July 2013)
 *
 * Licensed under the MIT License
 */
(function ($) {
	'use strict';

	$.fn.succinct = function (opts) {

		var defaults = {
				size: 240,
				omission: '...',
				ignore: true
			},
			options = $.extend(defaults, opts);

		return this.each(function () {

			var textDefault,
				textTruncated,
				elements = $(this),
				regex    = /[!-\/:-@\[-`{-~]$/;

			var truncate = function () {

				elements.each(function () {
					textDefault = $(this).text();

					if (textDefault.length > options.size) {
						textTruncated = $.trim(textDefault).
										substring(0, options.size).
										split(' ').
										slice(0, -1).
										join(' ');

						if (options.ignore) {
							textTruncated = textTruncated.replace( regex , '' );
						}

						$(this).text(textTruncated + options.omission);
					}
				});
			};

			var init = function () {
				truncate();
			};

			init();
		});
	};
})(jQuery);


/*!
 * FitText.js 1.1
 *
 * Copyright 2011, Dave Rupert http://daverupert.com
 * Released under the WTFPL license
 * http://sam.zoy.org/wtfpl/
 *
 * Date: Thu May 05 14:23:00 2011 -0600
 *
 * Modified for MobileSiteOS
 */
(function ($) {
	"use strict";

	$.fn.fitText = function (kompressor, options) {

        // Setup options
        var compressor = kompressor || 1,
            settings = $.extend({
                'minFontSize': Number.NEGATIVE_INFINITY,
                'maxFontSize': Number.POSITIVE_INFINITY
            }, options);

        return this.each(
			function () {
				var $this = $(this);
				// Resizes items based on the object width divided by the compressor * 10
				$this.css('font-size', Math.max(Math.min($this.width() / (compressor * 10), parseFloat(settings.maxFontSize)), parseFloat(settings.minFontSize)));
			}
		);
	};

}(jQuery));

// Adjust branding display using above
msos.ondisplay_size_change.push(
	function () {
		"use strict";

		var branding = jQuery('#branding');

		branding.hide();

		// Adjust branding for display size. (.8 is a compression factor for #branding)
		branding.fitText(0.8, { maxFontSize: branding.height() + 'px' });

		branding.fadeIn('slow');
	}
);


/*!
 * string_score.js: String Scoring Algorithm 0.1.20 
 *
 * http://joshaven.com/string_score
 * https://github.com/joshaven/string_score
 *
 * Copyright (C) 2009-2011 Joshaven Potter <yourtech@gmail.com>
 * 
 * Minimized and altered version for MobileSiteOS
*/
msos.site.likeness = function (string, word) {
    "use strict";

	var temp_sl = 'msos.site.likeness -> ',
		i = 0,
        runningScore = 0,
        charScore,
        finalScore,
        lString = '',
        lWord = '',
        idxOf,
        startAt = 0;

	if (msos.config.verbose) {
		msos.console.debug(temp_sl + 'called, string: ' + string + ', word: ' + word);
	}

    if (string === word) { return 1; }

	if (msos.var_is_empty(string)) {
		msos.console.warn(temp_sl + 'called, string is empty!');
		return 0;
	}
    if (msos.var_is_empty(word)) {
		msos.console.warn(temp_sl + 'called, word is empty!');
		return 0;
	}

	lString = string.toLowerCase();
	lWord = word.toLowerCase();

    for (i = 0; i < word.length; i += 1) {

        idxOf = lString.indexOf(lWord[i], startAt);

        if      (-1 === idxOf)          { return 0; }
        else if (startAt === idxOf)     { charScore = 0.7; }
        else                            { charScore = 0.1; if (string[idxOf - 1] === ' ') { charScore += 0.8; } }

        if (string[idxOf] === word[i])  { charScore += 0.1; }

        runningScore += charScore;
        startAt = idxOf + 1;
    }

    // Reduce penalty for longer strings.
    finalScore = 0.5 * (runningScore / string.length + runningScore / word.length);

    if ((lWord[0] === lString[0]) && (finalScore < 0.85)) {
        finalScore += 0.15;
    }

    return finalScore;
};


// --------------------------
// Google Analytics Tracking Function
// --------------------------

msos.site.google_analytics = function () {
    "use strict";

    // Set to your website or remove if/else statment
    if (document.domain === msos.config.google.analytics_domain) {

		var url = ('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js',
			ga_loader = new msos.loader();

		// Use our loader for better debugging
		ga_loader.load(url, 'js');

    } else {
		msos.console.warn('msos.site.google_analytics -> please update msos.config.google.analytics_domain in config.js!');
      }
};


(function () {
	"use strict";

	var msViewportStyle;

	// http://getbootstrap.com/getting-started/#support-ie10-width
	if (msos.site.msie >= 9 && navigator.userAgent.match(/IEMobile\/10\.0/)) {

		msViewportStyle = document.createElement('style');

		msViewportStyle.appendChild(
			document.createTextNode('@-ms-viewport{width:auto!important}')
		);

		document.head.appendChild(msViewportStyle);
	}
}());

// --------------------------
// Site Specific Code
// --------------------------

msos.site.auto_init = function () {
    "use strict";

	var temp_ai = 'msos.site.auto_init -> ',
		cfg = msos.config,
		req = msos.require,
		bw_val = msos.config.storage.site_bdwd.value || '',
		bdwidth = bw_val ? parseInt(bw_val, 10) : 0;

	msos.console.debug(temp_ai + 'start.');

	// Apple mobile OS
	if (cfg.mobile && navigator.platform.match(/iPad|iPhone|iPod/i)) { req("msos.mbp.ios"); }

	// Run MobileSiteOS sizing (alt. would be: use media queries instead)
	if (cfg.run_size)		{ req("msos.size"); }

	// Add event debugging functions
    if (cfg.visualevent)	{ req("msos.visualevent"); }

    // Add auto window.onerror alerting
    if (cfg.run_onerror)	{ req("msos.onerror"); }

	// Add debugging output (popup)
	if (cfg.debug_output)	{ req("msos.debug"); }

	// Add MSOS console output
	if (cfg.console)		{ req("msos.pyromane"); }

    // Based on page elements and configuration -> run functions or add modules
    if (cfg.run_ads && bdwidth > 150 && jQuery('#branding').length === 1)		{ req("msos.google.ad"); }

	// Or based on configuration settings
	if (cfg.run_analytics && bdwidth > 150)		{ msos.site.google_analytics(); }
	if (cfg.run_translate && bdwidth > 150)		{ req("msos.google.translate"); }

	// Bootstrap transitions: Always use this if "true"
	if (Modernizr.csstransitions)				{ req("bootstrap.transition"); }

	msos.console.debug(temp_ai + 'done!');
};

msos.site.css_load = function () {
    "use strict";

    var temp_cl = 'msos.site.css_load -> ',
		css_loader = null,
		M = Modernizr,
		con_type = msos.config.connection.type;

	msos.console.debug(temp_cl + 'start.');

	// Skip altogether for slow internet connections
	if (con_type === 'slow' || con_type === '2g') {
		msos.console.debug(temp_cl + 'done, skip for slow connection!');
		return;
	}

	css_loader = new msos.loader();

    // Only load css3 if supported
	if (M.cssgradients) {
		css_loader.load(msos.resource_url('css', 'msos_gradient.css'));
    }
	if (M.csstransitions) {
		css_loader.load(msos.resource_url('css', 'msos_transition.css'));
    }
	if (M.cssanimations && M.csstransforms) {
		css_loader.load(msos.resource_url('css', 'msos_animation.css'));
    }

	msos.console.debug(temp_cl + 'done!');
};


// Load site specific setup code
msos.onload_func_pre.push(msos.site.auto_init);

// Load additional CSS last, if supported
msos.onload_func_post.push(msos.site.css_load);


msos.console.info('site -> done!');
msos.console.timeEnd('site');
