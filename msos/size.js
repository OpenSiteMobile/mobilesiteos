// Copyright Notice:
//				    size.js
//			Copyright©2012-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile MobileSiteOS page size selection code
//

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.size");
msos.require("msos.common");
msos.require("msos.i18n.common");   // required in msos.common too, but here to ref. dependency

msos.size.version = new msos.set_version(13, 12, 9);


// This code is very similar to the 'msos.demo' module
msos.size.selection = function ($container) {
    "use strict";

    var select_display_sizes = {},
        size = '';

    if (!msos.common.valid_jq_node($container, 'select')) { return; }

    // Build display size select input object
    for (size in msos.config.size_wide) {
        select_display_sizes[size] = (msos.i18n.common.bundle[size] || size) + ': ' + msos.config.size_wide[size] + 'px';
    }

    // Generate display size menu
    msos.common.gen_select_menu($container, select_display_sizes, msos.config.size);

    $container.change(
        function () {

            msos.config.query.size = jQuery.trim(this.value);

            // Make sure body is hidden, then run display change
            jQuery('#body').fadeOut(
                'fast',
                function () {
                    var cc = msos.config.cookie;

                    msos.get_display_size();
                    msos.set_display_size();

                    jQuery('#body').fadeIn('slow');

                    // Reset site user cookie for new size
                    msos.cookie(
                        cc.site_pref.name,
                        cc.site_pref.value,
                        cc.site_pref.params
                    );
                }
            );
        }
    );
};