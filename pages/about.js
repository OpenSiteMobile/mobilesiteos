// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("pages.about");
msos.require("msos.picture");


msos.onload_functions.push(
	function () {
        "use strict";

		msos.console.info('Content: about.html loaded!');

		jQuery('figure.picture').picture();
	}
);