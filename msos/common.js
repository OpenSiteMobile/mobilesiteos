// Copyright Notice:
//					common.js
//			Copyright©2010-2015 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile common integrated functions

/*global
    msos: false,
    jQuery: false,
    _: false
*/

msos.provide("msos.common");

msos.common.version = new msos.set_version(15, 10, 7);


msos.common.button_count = 0;

// --------------------------
// Button generation
// --------------------------
msos.common.generate_button = function (parent_elm) {
    "use strict";

	msos.common.button_count += 1;

    var temp_gb = 'msos.common.generate_button',
		gen_but = this;

	// Common
    this.btn_mousedown = null;
    this.btn_mouseup = null;
    this.btn_onclick = null;
    this.btn_elm = null;
    this.btn_title = 'Button ' + msos.common.button_count;
    this.btn_id = 'msos_btn_' + msos.common.button_count;
	this.btn_class = '';	// not always needed (let the size be inherited)
    this.btn_style_on =  'active';
    this.btn_style_off = 'disabled';

	// Image specific
	this.img_dir = 'images';
    this.img_name = 'missing_name.gif';
	this.img_alt = this.btn_title;	// Just us title as default

	// Icon specific (type of icon, ref. fontawesome)
	this.icon_class = 'btn btn-msos fa fa-check-circle-o';

    // Set/update function for the state of an interactive element...
    this.set_state = function (id, new_value) {
        var old_value = this[id],
            elm = this.element;

        if (old_value !== new_value) {
            switch (id) {
            case "enabled":
                if (new_value) {
                    elm.removeClass(gen_but.btn_style_off);
                } else {
                    elm.addClass(gen_but.btn_style_off);
                }
                break;
            case "active":
                if (new_value) {
                    elm.addClass(gen_but.btn_style_on);
                } else {
                    elm.removeClass(gen_but.btn_style_on);
                }
                break;
            }
            this[id] = new_value;
        }
    };

    this.btn_append = function (btn_el) {

		var $btn_el = jQuery(btn_el);

        // Add a generic image button object for programmable control
        btn_el.button = {
            enabled: true,
            // is it enabled?
            active: false,
            // is it pressed?
            state: gen_but.set_state,
            // for changing state
            context: null,
            // enabled in a certain context?
            tool: null,
            // tool instance this button was created for
            debug: [] // add debug text as array elements
        };

        // Add mouse driven events
        $btn_el.bind("mousedown", function (evt) {
			var temp_txt = '';
            msos.do_nothing(evt);
            if (btn_el.button.enabled) {
                if (gen_but.btn_mousedown) {
                    gen_but.btn_mousedown(evt);
                }
            }
			if (msos.debug) {
				temp_txt = msos.debug.gen_input(btn_el, btn_el.button);
				if (btn_el.button.debug.length > 0) {
					temp_txt += "\n" + btn_el.button.debug.join("\n");
				}
                msos.debug.event(evt, temp_txt);
            }
        });
        $btn_el.bind("mouseup", function (evt) {
            msos.do_nothing(evt);
            if (btn_el.button.enabled) {
                if (gen_but.btn_mouseup) {
                    gen_but.btn_mouseup(evt);
                }
            }
        });

        function btn_click(evt) {
			var temp_txt = '';
            msos.do_nothing(evt);
            if (btn_el.button.enabled && gen_but.btn_onclick) {
                gen_but.btn_onclick(evt);
            }
			if (msos.debug) {
				temp_txt = msos.debug.gen_input(btn_el, btn_el.button);
				if (btn_el.button.debug.length > 0) {
					temp_txt += "\n" + btn_el.button.debug.join("\n");
				}
                msos.debug.event(evt, temp_txt);
            }
        }

        $btn_el.bind("click", btn_click);

        parent_elm.appendChild(btn_el);
    };

	this.generate_img_button = function () {

        var img_button = document.createElement("img"),
            image_src = msos.resource_url(gen_but.img_dir, gen_but.img_name);

        img_button.id = gen_but.btn_id;
        img_button.src = image_src;
        img_button.title = gen_but.btn_title;
        img_button.alt = gen_but.img_alt;
        img_button.className = gen_but.btn_class;

		this.btn_elm = img_button;
        this.btn_append(img_button);
    };

	this.generate_icon_button = function () {

        var icon_button = document.createElement("i");

        icon_button.id = gen_but.btn_id;
        icon_button.title = gen_but.btn_title;
        icon_button.className = gen_but.icon_class + ' ' + gen_but.btn_class;

		this.btn_elm = icon_button;
        this.btn_append(icon_button);
	};
};


// --------------------------
// Map element attributes
// --------------------------
msos.common.map_atts = function (input_elem) {
    "use strict";

	var j,
		attributes = input_elem.attributes || [],
		attr_name,
		attr_value,
		map = {},
		allow_atts = [
			'class', 'id', 'style', 'title', 'name',
			'tabindex', 'accesskey', 'disabled'
		];

	for (j = 0; j < attributes.length; j += 1) {
		attr_name  = attributes[j].name.toLowerCase();
		attr_value = attributes[j].value;
		// Only allow the 'allow_atts' attributes to be mapped
		if (_.indexOf(allow_atts, attr_name) !== -1) {
            if (msos.config.verbose) {
                msos.console.info('msos.common.map_atts -> name: ' + attr_name + ', value: ' + attr_value);
            }
			map[attr_name] = attr_value;
		}
	}
	return map;
};


// --------------------------
// Helper Functions
// --------------------------

msos.common.dec_to_hex = function (num) {
    "use strict";

    var mult = parseInt(num / 16, 10),
        base = msos.common.dec_eq_hex(mult),
        remainder = num - (mult * 16);

    return base + String(msos.common.dec_eq_hex(remainder));
};

msos.common.dec_eq_hex = function (num) {
    "use strict";

    if (num <= 9) {
        return num;
    }

    switch (num) {
    case 10:
        return 'A';
    case 11:
        return 'B';
    case 12:
        return 'C';
    case 13:
        return 'D';
    case 14:
        return 'E';
    case 15:
        return 'F';
    }
    return 0;
};

msos.common.hex_to_dec = function (hex) {
    "use strict";

    if (hex.length === 6) {
        return msos.common.hex_to_dec(hex.substr(0, 2)) + ' ' + msos.common.hex_to_dec(hex.substr(2, 2)) + ' ' + msos.common.hex_to_dec(hex.substr(4, 2));
    }
    var mult = parseInt(msos.common.hex_eq_dec(hex.substr(0, 1)), 10),
        sing = parseInt(msos.common.hex_eq_dec(hex.substr(1)), 10);

    return (mult * 16) + sing;
};

msos.common.hex_eq_dec = function (num) {
    "use strict";

    if (num <= 9) {
        return num;
    }

    switch (num.toUpperCase()) {
    case 'A':
        return 10;
    case 'B':
        return 11;
    case 'C':
        return 12;
    case 'D':
        return 13;
    case 'E':
        return 14;
    case 'F':
        return 15;
    }
    return 0;
};

msos.common.xml_innerhtml = function (elm, html) {
    "use strict";

    if (msos.config.verbose) {
        msos.console.debug('xml_innerhtml -> input: ' + html);
    }
    html = msos.escape_html(html);
    if (msos.config.verbose) {
        msos.console.debug('xml_innerhtml -> output: ' + html);
    }
    elm.innerHTML = html;
};

msos.common.html_entity = function (str) {
    "use strict";

    var result = '',
        i = 0;

    for (i = 0; i < str.length; i += 1) {
        if (str.charCodeAt(i) > 128) {
            result += "&#" + str.charCodeAt(i) + ";";
        }
        else {
            result += str.charAt(i);
        }
    }
    return result;
};

msos.common.absolute_url = function (url) {
    "use strict";
    var el = document.createElement('div');

    el.innerHTML = '<a href="' + msos.escape_html(url) + '">x</a>';
    return el.firstChild.href;
};

msos.common.escape_string = function (str) {
    "use strict";

    // Same code as 'dojo.string.escapeString' from dojo.string.extras, Dojo v0.4.2
    return ("\"" + str.replace(/(["\\])/g, "\\$1") + "\"").replace(/[\f]/g, "\\f").replace(/[\b]/g, "\\b").replace(/[\n]/g, "\\n").replace(/[\t]/g, "\\t").replace(/[\r]/g, "\\r");
};

msos.common.round = function (number, num_of_dec_places) {
    "use strict";

    // Round a number up or down
    var num_to_10th_pow = parseInt(Math.pow(10, num_of_dec_places), 10);

    return Math.round(number * num_to_10th_pow) / num_to_10th_pow;
};

msos.common.pause = function (millis) {
    "use strict";

	// Use sparingly -> brutal resource hog
    var date = new Date(),
        curDate = null;

    do {
        curDate = new Date();
    }
    while (curDate - date < millis);
};

msos.common.parents = function (node, filterFunction) {
    "use strict";

    var ancestors = [],
        isFunction = (filterFunction && (filterFunction instanceof Function || typeof filterFunction === "function"));

    while (node) {
        if (!isFunction || filterFunction(node)) {
            ancestors.push(node);
        }
        node = node.parentNode;
    }
    return ancestors;
};

msos.common.filter_parents = function (p) {
    "use strict";

    if ((p.nodeType === 1) && (!/html|head|base|body/i.test(p.nodeName))) {
        return true;
    }
    return false;
};
