// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("pages.design.emulators");


msos.onload_functions.push(
	function () {
        "use strict";

		msos.console.info('Content: emulators.html loaded!');

        // Insert the ad code (no page load holdup)
        jQuery('#amazon_prod_ad').html(
            '<a href="http://www.amazon.com/gp/product/1449397654/ref=as_li_qf_sp_asin_il?ie=UTF8&amp;tag=open0c0-20&amp;linkCode=as2&amp;camp=1789&amp;creative=9325&amp;creativeASIN=1449397654"><img border="0" src="http://ws.assoc-amazon.com/widgets/q?_encoding=UTF8&amp;Format=_SL110_&amp;ASIN=1449397654&amp;MarketPlace=US&amp;ID=AsinImage&amp;WS=1&amp;tag=open0c0-20&amp;ServiceVersion=20070822" alt="Shop Amazon.com" /></a><img src="http://www.assoc-amazon.com/e/ir?t=open0c0-20&amp;l=as2&amp;o=1&amp;a=1449397654" width="1" height="1" border="0" alt="Shop Amazon.com" style="border:none !important; margin:0px !important;" />'
        );
	}
);