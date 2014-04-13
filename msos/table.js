// Copyright Notice:
//				    table.js
//			Copyright©2011-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile 'table' functions

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.table");

msos.table.version = new msos.set_version(13, 6, 14);

// Start by loading our 'table.css' stylesheet
msos.table.css = new msos.loader();
msos.table.css.load('bootstrap_table', msos.resource_url('css', 'bootstrap/table.css'));

msos.table.initiate = function () {
    "use strict";

    // Add table dependent code here as needed...

};

// Run this at page load (uncomment to run)
//msos.add_onload_function(msos.table.initiate);