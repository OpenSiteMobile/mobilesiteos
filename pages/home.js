// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("pages.home");
msos.require("msos.picture");


msos.onload_functions.push(
	function () {
        "use strict";

		msos.console.info('Content: home.html loaded!');

		jQuery('figure.picture').picture();
	}
);