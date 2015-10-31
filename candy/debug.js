/*global
    msos: false,
    jQuery: false,
    candy: false,
    Strophe: false
*/

msos.provide("candy.debug");
msos.require("msos.xml.prettify");

if (candy.wrapper.use_xml_to_json) {
    // Works for msos.pyromane too!
    msos.require("jquery.tools.xml2json");
}

candy.debug.version = new msos.set_version(15, 8, 26);


candy.debug.init = function () {
    "use strict";

    // Don't bother, we only want Strophe output
    if (!msos.config.debug) { return; }

    var _jqc = jQuery(candy),
        debug = function (e, obj) {
            var tmp = 'candy.debug.init - debug -> event: ';

            if (msos.config.verbose) {
                msos.console.debug(tmp + e.type + '.' + e.namespace + ' fired,', obj);
            } else {
                msos.console.debug(tmp + e.type + '.' + e.namespace + ' fired!');
            }
        };

	_jqc.on('candy:core:connect.before',				debug);
    _jqc.on('candy:core:connect.after',					debug);

	_jqc.on('candy:event:jabber:rosterpush.removed',	debug);
	_jqc.on('candy:event:jabber:rosterpush.added',		debug);
	_jqc.on('candy:event:jabber:rosterpush.updated',	debug);
    _jqc.on('candy:event:jabber:room.chatstates',		debug);

    _jqc.on('candy:event:connect.status-0',				debug);
    _jqc.on('candy:event:connect.status-1',				debug);
    _jqc.on('candy:event:connect.status-2',				debug);
    _jqc.on('candy:event:connect.status-3',				debug);
    _jqc.on('candy:event:connect.status-4',				debug);
    _jqc.on('candy:event:connect.status-5',				debug);
    _jqc.on('candy:event:connect.status-6',				debug);
    _jqc.on('candy:event:connect.status-7',				debug);
    _jqc.on('candy:event:connect.status-8',				debug);
    _jqc.on('candy:event:connect.status-9',				debug);

	_jqc.on('candy:view:chat.addtab',					debug);

	_jqc.on('candy:view:message:submit.before-send',	debug);
	_jqc.on('candy:view:message:add.notify',			debug);
	_jqc.on('candy:view:message:add.after',				debug);

	_jqc.on('candy:view:room:show.after-show',			debug);
	_jqc.on('candy:view:room:show.after-hide',			debug);
	_jqc.on('candy:view:room:setsubject.after-change',	debug);
};

candy.debug.strophe_in = function (element) {
    "use strict";

    var data = Strophe.serialize(element),
		xml_obj;

	if (msos.config.verbose) {
		msos.console.debug('candy.debug.strophe_in (actual element)\n<<<< Recv', element);
	}

    if (candy.wrapper.use_xml_to_json) {
        xml_obj = jQuery.xml2json(data);
        msos.console.debug('candy.debug.strophe_in <<<< xml-to-json:', xml_obj);
    } else {
        msos.console.debug('<<<< Recv');
        msos.console.debug(msos.xml.prettify.now(data));
        msos.console.debug('<<<< Recv');
    }
};

candy.debug.strophe_out = function (data) {
    "use strict";

    var xml_obj;

    if (candy.wrapper.use_xml_to_json) {
        xml_obj = msos.xml.tojson(data);
        msos.console.debug('candy.debug.strophe_out >>>> xml-to-json:', xml_obj);
    } else {
        msos.console.debug('Sent >>>>');
        msos.console.debug(msos.xml.prettify.now(data));
        msos.console.debug('Sent >>>>');
    }
};

msos.onload_func_post.push(candy.debug.init);