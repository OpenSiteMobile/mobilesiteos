// Page specific js code

/*global
    msos: false,
    jQuery: false,
    Packery: false
*/

msos.provide("demo.packery.origin");
msos.require("jquery.tools.packery");


msos.onload_functions.push(
    function () {
        "use strict";

        var pckry1,
            pckry2,
            pckry3;

        msos.console.info('Content: origin.html loaded!');

        jQuery('.container').addClass(msos.config.size);

        pckry1 = new Packery(
                '#top-right',
                {
                    itemSelector: '.item',
                    stamp: '.stamp',
                    isOriginLeft: false
                }
        );
        pckry2 = new Packery(
                '#bottom-left',
                {
                    itemSelector: '.item',
                    stamp: '.stamp',
                    isOriginTop: false
                }
        );
        pckry3 = new Packery(
                '#bottom-right',
                {
                    itemSelector: '.item',
                    stamp: '.stamp',
                    isOriginLeft: false,
                    isOriginTop: false
                }
        );
    }
);