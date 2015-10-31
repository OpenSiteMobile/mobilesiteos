/*
 * candy-timeago-plugin
 * @version 0.1 (2011-07-15)
 * @author David Devlin (dave.devlin@gmail.com)
 *
 * Integrates the jQuery Timeago plugin (http://timeago.yarp.com/) with Candy.
 */

/*global
    msos: false,
    jQuery: false,
    jquery: false,
    candy: false
*/

msos.provide("candy.date.timeago");
msos.require("jquery.tools.timeago");

candy.date.timeago.version = new msos.set_version(15, 9, 10);


candy.date.timeago.iso8601 = function (date) {
	"use strict";

	var zeropad = function (num) {
			return ((num < 10) ? '0' : '') + num;
		};

    return date.getUTCFullYear()
        + "-" + zeropad(date.getUTCMonth()+1)
        + "-" + zeropad(date.getUTCDate())
        + "T" + zeropad(date.getUTCHours())
        + ":" + zeropad(date.getUTCMinutes())
        + ":" + zeropad(date.getUTCSeconds()) + "Z";
};

candy.date.timeago.init = function () {
	"use strict";

	candy.util.localizedTime = function (dateTime) {
		var temp_lt = 'candy.util.localizedTime (candy.date.timeago) -> ';

		if (msos.config.verbose) {
			msos.console.debug(temp_lt + 'start.');
		}

		if (dateTime === undefined || !dateTime instanceof Date) {
			msos.console.error(temp_lt + 'failed: missing or invalid Date instance!');
			return undefined;
		}

		if (msos.config.verbose) {
			msos.console.debug(temp_lt + 'done!');
		}
		return candy.date.timeago.iso8601(dateTime);
	};
};
