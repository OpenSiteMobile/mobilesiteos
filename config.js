// Copyright Notice:
//					config.js
//			Copyright©2012-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com

/*
	OpenSiteMobile MobileSiteOS demo pages configuration file
*/

/*global
	msos: false,
    google: false,
    google_ad_client: true,
    google_ad_slot: true,
    google_ad_width: true,
    google_ad_height: true,
    _gaq: true,
    ___gcfg: true,
    addthis_config: true
*/

msos.console.info('config -> start, (/config.js file).');
msos.console.time('config');

// Set specific flags for this configuration:
//msos.config.run_ads = true;
//msos.config.run_analytics = true;
//msos.config.run_onerror = true;
//msos.config.run_social = true;
//msos.config.run_translate = true;


// --------------------------
// Stylesheets to load (CSS injection)
// --------------------------

if (msos.config.debug_css) {
	
	msos.deferred_css = [
		msos.resource_url('css', 'normalize.css'),
		msos.resource_url('css', 'fawe.css'),
		msos.resource_url('css', 'msos.css'),
		msos.resource_url('css', 'msos_bs.css'),
		msos.resource_url('css', 'msos_theme.css'),
	];

} else {

	msos.deferred_css = [
		msos.resource_url('css', 'bundle.min.css')
	];

}


// --------------------------
// Scripts to 'defer' load (script injection)
// --------------------------

if (msos.config.debug_script) {

	// Debug full scripts (line no's mean something)
    msos.deferred_scripts = [
		msos.resource_url('modernizr', 'v271.uc.js'),		// no class selectors - see build.txt note in /htdocs/modernizr
		msos.resource_url('jquery', 'v210.uc.js'),
		msos.resource_url('jquery', 'ui/v1104.uc.js'),		// All UI Core + Draggable Interaction + Effects Core
		msos.resource_url('underscore', 'v160.uc.js'),
		msos.resource_url('hammer', 'v106.uc.js'),			// jQuery.hammer.js version of Hammer.js
		msos.resource_url('backbone', 'v110.uc.js'),
		msos.resource_url('marionette', 'v123.uc.js'),
		msos.resource_url('msos', 'site.uc.js'),			// Common installation specific setup code (which needs jQuery, underscore.js, etc.)
		msos.resource_url('msos', 'core.uc.js')
	];

	if (!msos.config.json) {
		msos.deferred_scripts.push(msos.resource_url('utils', 'json2.uc.js'));
	}

} else {

	// Standard site provided (including ext. bundles) scripts
    msos.deferred_scripts = [
		msos.resource_url('msos', 'bundle.min.js'),			// Modernizr, jQuery, jQuery-UI, Hammer.js, Underscore, Backbone, Marionette bundled together
		msos.resource_url('msos', 'site.min.js'),
		msos.resource_url('msos', 'core.min.js')
	];

	if (!msos.config.json) {
		msos.deferred_scripts.push(msos.resource_url('utils', 'json2.min.js'));
	}
}


// --------------------------
// Google Related Globals
// --------------------------

// Replace with your site specific Google and other variables
var google_ad_client = 'pub-0581487774111572',	// Google AdSense publish key
    google_ad_slot = '3750415767',				// Only use 234px x 60px spec's here!
    google_ad_width = 234,						// See 'msos.google_ad_vars' below for
    google_ad_height = 60,						// additional size ad spec's.
    _gaq = [],
    ___gcfg = {},
	addthis_config = {							// AddThis (addthis.com) configuration object
		username: 'MobileSiteOS',
		data_ga_property: 'UA-24170958-1',
		ui_language: msos.default_locale,
		ui_click: true
	};

// AddThis Social Sharing
msos.config.addthis_pubid = 'ra-515ca32f73d2b2ae';

// Google Analytics
_gaq.push(['_setAccount', 'UA-24170958-1']);
_gaq.push(['_trackPageview']);
// Ref. 'msos.site.google_analytics' in site.uc.js -> site.min.js
msos.config.google.analytics_domain = 'opensitemobile.com';


// Add your Google Checkout Javascript API merchant id here. Test your code
// using sandbox merchant id and 'google_use_sandbox' = 'true' before going live.
msos.config.google.merchant_id = '752887290038807';		// Google Checkout merchant id
msos.config.google.sandbox_id =  '166486397016135';		// Google Checkout Sandbox merchant id
msos.config.google.use_sandbox = true;					// boolean true or false

// Add your Google Web Page Translator Widget ID here.
msos.config.google.translate_id = '7aa52b36fcd8fcb6-07fbdbdc6a976e62-g7261f6c2de6e277c-d';
msos.config.google.no_translate = {
	by_id: ['#rotate_marquee', '#header', '#footer', '#pyromane', '#locale', '#culture', '#calendar'],
	by_class: [],
	by_tag: ['code', 'u']
};
msos.config.google.hide_tooltip = {
	by_id: [],
	by_class: []
};

// Social website API access keys
msos.config.social = {
	google: '526338426431.apps.googleusercontent.com',
	facebook: '583738878406494',
	instagram: '34e2fb9bd305446cb080d852597584e9',
	cloudmade: 'efca0172cf084708a66a6d48ae1046dd',
	foursquare: {
		clientId: 'SFYWHRQ1LTUJEQWYQMHOCXYWNFNS0MKUCAGANTHLFUGJX02E',
		clientSecret: 'WYUTTJB5MSYU5ABNPWKIHXKNGQDNZXEBQQC3PTQIKKY4IQZW'
	}
};


// More Google AdSense
msos.google_ad_vars = function () {
	"use strict";

	var display = msos.config.size || 'phone';

	// Define 3 additional levels of Google Adsense ads
	if (display === 'desktop' || display === 'large' || display === 'medium') {
		google_ad_slot = "6015992869";
		google_ad_width = 728;
		google_ad_height = 90;
	} else if (display === 'small' || display === 'tablet') {
		google_ad_slot = "4194371168";
		google_ad_width = 468;
		google_ad_height = 60;
	} else {
		google_ad_slot = "4755521744";
		google_ad_width = 320;
		google_ad_height = 50;
	}
};


// --------------------------
// Load Google Adsense
// --------------------------
msos.load_adsense = function () {
    "use strict";

	// 'msos.load_adsense' is here because 'msos/site.js' may not be ready when this is called.
	// Google uses 'document.write' in their code which precludes it from being run after page load.
	var temp_la = 'msos.load_adsense -> ',
		bdwidth = msos.config.cookie.site_bdwd.value ?  parseInt(msos.config.cookie.site_bdwd.value, 10) : 0;

    if (!msos.config.run_ads) {
		msos.console.debug(temp_la + 'ads are off!');
        return;
    }

    if (bdwidth > 200) {

		// Set ad size to display
		msos.google_ad_vars();

		if (msos.config.doctype === 'html5') {
			window.document.write('<script src="//pagead2.googlesyndication.com/pagead/show_ads.js"></script>');

			msos.console.time('google_adsense');
			msos.console.debug(temp_la + 'code inserted!');
		} else {
			msos.console.warn(temp_la + 'skipped, ads not xhtml5 compliant!');
		}

	} else {

		msos.console.warn(temp_la + 'skipped, slow connection!');
	}
};

msos.css_loader(msos.deferred_css);
msos.script_loader(msos.deferred_scripts);

msos.console.info('config -> done!');
msos.console.timeEnd('config');