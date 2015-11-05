// Copyright Notice:
//				html5/range.js
//			Copyright©2012-2015 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com

// OpenSiteMobile HTML5 form range widget replacement

/*global
    msos: false,
    jQuery: false,
    Modernizr: false
*/

msos.provide("msos.html5.range");
msos.require("msos.html5.tracking");
msos.require("jquery.tools.range");

msos.html5.range.version = new msos.set_version(15, 11, 3);


(function ($) {
	"use strict";

	var count = 0;

	$.fn.html5_range = function () {

		// Add MSOS DOM tracking
		if (!msos.dom.html5_range) { msos.html5.tracking.dom('html5_range'); }

		if (msos.config.force_shim.inputs.range || !Modernizr.inputtypes.range) {
			$(this).rangeinput();
		}

	};

}(jQuery));
