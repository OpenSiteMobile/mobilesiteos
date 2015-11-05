// Copyright Notice:
//				html5/tracking.js
//			Copyright©2012-2015 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com

// OpenSiteMobile HTML5 DOM element tracking

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.html5.tracking");

msos.html5.tracking.version = new msos.set_version(15, 9, 24);


msos.html5.tracking.dom = function (method) {
	"use strict";

	var temp_dt = 'msos.html5.tracking.dom';

	if (msos.dom[method]) {
		msos.console.error(temp_dt + ' -> failed, jQuery.fn.' + method + ' already registered.');
		return;
	}

	msos.dom[method] = [];

    var jq_fn_org = jQuery.fn[method];

    jQuery.fn[method]= function () {

		var temp_fn = temp_dt + ' - ' + method,
			jq_new = [];

		msos.console.debug(temp_fn + ' -> start.');

		jQuery.each(
			this,
			function (index, value) {
				var trk = msos.dom[method],
					tag = value.tagName,
					id = value.id || 'trk_' + tag.toLowerCase() + '_' + (trk.length + 1),
					$el = jQuery(value);

				if (!value.id) { value.id = id; }

				// Skip one's we have already done
				if (trk.indexOf(id) === -1) {
					trk.push(id);
					jq_new.push(value);
					$el.data(id, true);
					if (msos.config.verbose) {
						msos.console.debug(temp_fn + ' -> skipped: ' + id);
					}
				// But redo element for new instance w/ same id
				} else if ($el.data(id) !== true) {
					jq_new.push(value);
					$el.data(id, true);
					msos.console.debug(temp_fn + ' -> new instance: ' + id);
				}
			}
		);

		msos.console.debug(temp_fn + ' -> done!');

        return (jq_fn_org.apply(jQuery(jq_new), arguments));
    };
};