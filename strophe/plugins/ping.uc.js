/*
* Based on Ping Strophejs plugins (https://github.com/metajack/strophejs-plugins/tree/master/ping)
* This plugin is distributed under the terms of the MIT licence.
* Please see the LICENCE file for details.
*
* Copyright (c) Markus Kohlhase, 2010
* Refactored by Pavel Lang, 2011
*/
/**
* File: strophe.ping.js
* A Strophe plugin for XMPP Ping ( http://xmpp.org/extensions/xep-0199.html )
*/

/*global
    Strophe: false,
    $iq: false
*/

Strophe.addConnectionPlugin(
    'ping',
    {
        _p_name: 'strophe.plugins.ping - ',

        _c: null,

        init: function (conn) {
            "use strict";

            msos.console.debug(this._p_name + 'init -> start.');

            this._c = conn;
            Strophe.addNamespace('PING', "urn:xmpp:ping");

            msos.console.debug(this._p_name + 'init -> done!');
        },

        ping: function (jid, success, error, timeout) {
            "use strict";

            var id = this._c.getUniqueId('ping'),
                iq = $iq(
                    {
                        type: 'get',
                        to: jid,
                        id: id
                    }
                ).c(
                    'ping',
                    { xmlns: Strophe.NS.PING }
                );

            this._c.sendIQ(
                iq,
                'get: ping',
                success,
                error,
                timeout
            );
        },

        pong: function (ping) {
            "use strict";

            var from = ping.getAttribute('from'),
                id = ping.getAttribute('id'),
                iq = $iq(
                    {
                        type: 'result',
                        to: from,
                        id: id
                    }
                );

            this._c.sendIQ(iq, 'result: pong');
        },

        addPingHandler: function (handler) {
            "use strict";

            return this._c.addStropheHandler(handler, Strophe.NS.PING, "iq", "get");
        }
    }
);
