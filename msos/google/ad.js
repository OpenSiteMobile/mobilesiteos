// Copyright Notice:
//				    ad.js
//			Copyright©2008-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile 'Google' functions w/jQuery integration

/*global
    msos: false,
    jQuery: false,
    google_loader_experiment: false
*/

msos.provide("msos.google.ad");

msos.google.ad.version = new msos.set_version(13, 12, 3);


// --------------------------
// Google AdSense Display
// --------------------------

msos.google.ad.delay = 3000;
msos.google.ad.run = function () {
    "use strict";

    var ad_txt = 'msos.google.ad.run',
        google_position = null,
        rt = msos.record_times;

    if (!msos.config.run_ads) {
        msos.console.warn(ad_txt + ' -> called, but run_ads = false!');
        return;
    }

    msos.console.debug(ad_txt + ' -> start.');

    google_position = function () {
        var pos_temp = ' - google_position -> ',
            g_iframe = jQuery('#google_ad > iframe');

        // If script didn't load...
        if (!window.google_unique_id) {
            msos.console.warn(ad_txt + pos_temp + 'failed, show_ad.js missing!');
            return;
        } else if (!jQuery('#google_ad > ins').length && !g_iframe.length) {
            msos.console.warn(ad_txt + pos_temp + 'failed, not loaded!');
            return;
        } else {

            // Run when ready (probably is, but in case of very slow ad response)
            jQuery(g_iframe).ready(
                function () {
                    jQuery('#google_ad').position({
                        of: jQuery('#rotate_marquee'),
                        my: 'center',
                        at: 'center',
                        collision: 'none'
                    });
    
                    jQuery('#slogan').fadeOut(
    
                    function () {
                        jQuery('#marquee').fadeOut(
    
                        function () {
                            jQuery('#google_ad').css('opacity', 1.0);
                        });
                    });

                    msos.console.debug(ad_txt + pos_temp + 'ad positioned and viewable, delay: ' + msos.google.ad.delay);
            
                }
            );
        }
    };

    msos.console.timeEnd('google_adsense');

    // Add to delay as a buffer for slow ad response
    if (typeof rt['google_adsense_time'] === 'number'
     && typeof rt['google_adsense_timeEnd'] === 'number') {
        msos.google.ad.delay = msos.google.ad.delay + rt['google_adsense_timeEnd'] - rt['google_adsense_time'];
    }

    // Show the ad after delay (ins and iframe elements have been injected into DOM)
    setTimeout(google_position, msos.google.ad.delay);

    // Add the google_position function to the 'onresize' queue
    msos.onresize_functions.push(google_position);

    msos.console.debug(ad_txt + ' -> done!');
};


// Run this at end of page load and other scripting
msos.onload_func_done.push(msos.google.ad.run);