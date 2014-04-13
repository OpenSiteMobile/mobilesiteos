// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("pages.devel.dependency");


msos.onload_functions.push(
	function () {
        "use strict";

		msos.console.info('Content: dependency.html loaded!');

        // Insert the ad code (no page load holdup)
        jQuery('#amazon_prod_ad').html(
            '<a href="http://www.amazon.com/gp/product/1449328253/ref=as_li_tf_il?ie=UTF8&camp=1789&creative=9325&creativeASIN=1449328253&linkCode=as2&tag=open0c0-20"><img border="0" src="http://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=1449328253&Format=_SL110_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1&tag=open0c0-20" ></a><img src="http://ir-na.amazon-adsystem.com/e/ir?t=open0c0-20&l=as2&o=1&a=1449328253" width="1" height="1" border="0" alt="" style="border:none !important; margin:0px !important;" />'
		);
	}
);