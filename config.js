// Copyright Notice:
//					config.js
//			Copyright©2012-2017 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://ngmomentum.com & http://opensitemobile.com
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com

/*
	MobileSiteOS demo pages (base) configuration file
*/

/*global
	msos: false,
    _gaq: true,
    ___gcfg: true
*/

msos.console.info('config -> start, (/mobilesiteos/config.js file).');
msos.console.time('config');

// Set specific config flags (w/ boolean)
msos.site_specific({ run_onerror: true, run_ads: true, run_size: true });

// --------------------------
// Stylesheets to load (CSS injection)
// --------------------------

if (msos.config.debug_css) {

	msos.deferred_css = [
		msos.resource_url('fonts', 'css/fontawesome.uc.css'),
		msos.resource_url('css', 'normalize.uc.css'),
		msos.resource_url('css', 'msos.css'),
		msos.resource_url('css', 'msos_bs.css'),
		msos.resource_url('css', 'msos_theme.css'),
		msos.resource_url('demo', 'css/base.css')
	];

} else {

	msos.deferred_css = [
		msos.resource_url('fonts', 'css/fontawesome.min.css'),
		msos.resource_url('css', 'normalize.min.css'),
		msos.resource_url('css', 'msos.css'),
		msos.resource_url('css', 'msos_bs.css'),
		msos.resource_url('css', 'msos_theme.css'),
		msos.resource_url('demo', 'css/base.css')
	];

}

// --------------------------
// Scripts to 'defer' load (script injection)
// --------------------------

if (msos.config.debug_script) {

	// Debug full scripts (line no's mean something)
    msos.deferred_scripts = [
		msos.resource_url('jquery', 'v311_msos.uc.js'),
		msos.resource_url('jquery', 'ui/v1120.uc.js'),		// All UI Core + Draggable Interaction + Effects Core
		msos.resource_url('hammer', 'v204.uc.js'),			// jQuery.hammer.js version of Hammer.js
		msos.resource_url('backbone', 'v123.uc.js'),
		msos.resource_url('gmap3', 'v600.uc.js'),
		msos.resource_url('hello', 'v029.uc.js'),
		msos.resource_url('','site.js'),					// Common installation specific setup code (which needs jQuery, underscore.js, etc.)
		msos.resource_url('msos', 'core.uc.js')
	];

} else {

	// Standard site provided (including ext. bundles) scripts
        msos.deferred_scripts = [
		msos.resource_url('jquery', 'v311_msos.min.js'),
		msos.resource_url('jquery', 'ui/v1120.min.js'),		// All UI Core + Draggable Interaction + Effects Core
		msos.resource_url('hammer', 'v204.min.js'),			// jQuery.hammer.js version of Hammer.js
		msos.resource_url('backbone', 'v123.min.js'),
		msos.resource_url('gmap3', 'v600.min.js'),
		msos.resource_url('hello', 'v029.min.js'),
		msos.resource_url('','site.js'),					// Common installation specific setup code (which needs jQuery, underscore.js, etc.)
		msos.resource_url('msos', 'core.min.js')
	];
}


// --------------------------
// Google Related Globals
// --------------------------

// Google Analytics
var _gaq = [],
    ___gcfg = {};

_gaq.push(['_setAccount', 'UA-24170958-1']);
_gaq.push(['_trackPageview']);
// Ref. 'msos.site.google_analytics' in site.uc.js -> site.min.js
msos.config.google.analytics_domain = 'opensitemobile.com';

// Add your Google Web Page Translator Widget ID here.
msos.config.google.translate_id = '7aa52b36fcd8fcb6-07fbdbdc6a976e62-g7261f6c2de6e277c-d';
msos.config.google.no_translate = {
	by_id: ['#marquee', '#header', '#footer', '#pyromane', '#locale', '#culture', '#calendar'],
	by_class: [],
	by_tag: ['code', 'u']
};
msos.config.google.hide_tooltip = {
	by_id: [],
	by_class: []
};

// Social website API access keys
msos.config.oauth2 = {
	google: '296183405068-3379jn2v9polk5aj6j6bilf1k42j0vp2.apps.googleusercontent.com',
	facebook: '169235526952969',
	windows: '000000004C107945',
	instagram: '34e2fb9bd305446cb080d852597584e9',
	cloudmade: 'efca0172cf084708a66a6d48ae1046dd',
	foursquare: 'SFYWHRQ1LTUJEQWYQMHOCXYWNFNS0MKUCAGANTHLFUGJX02E',
	yahoo: '',
	github: '',
	proxy_url: 'https://auth-server.herokuapp.com/proxy'
};

// Add your Google Maps API key here.
msos.config.google.maps_api_key = 'AIzaSyAhvG_5h55iUW3fLREMTPxB6joCAexYQ2o';


msos.css_loader(msos.deferred_css);
msos.script_loader(msos.deferred_scripts);

msos.console.info('config -> done!');
msos.console.timeEnd('config');
