// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("pages.devel.execution");


msos.onload_functions.push(
	function () {
        "use strict";

		msos.console.info('Content: execution.html loaded!');

        // Insert the ad code (no page load holdup)
        jQuery('#amazon_prod_ad').html(
            '<a href="http://www.amazon.com/gp/product/B00CPBCHE4/ref=as_li_tf_il?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00CPBCHE4&linkCode=as2&tag=open0c0-20"><img border="0" src="http://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B00CPBCHE4&Format=_SL110_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1&tag=open0c0-20" ></a><img src="http://ir-na.amazon-adsystem.com/e/ir?t=open0c0-20&l=as2&o=1&a=B00CPBCHE4" width="1" height="1" border="0" alt="" style="border:none !important; margin:0px !important;" />'
        );
	}
);