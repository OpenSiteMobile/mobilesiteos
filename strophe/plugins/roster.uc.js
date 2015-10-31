/*
  Copyright 2010, François de Metz <francois@2metz.fr>
*/
/**
 * Roster Plugin
 * Allow easily roster management
 *
 *  Features
 *  * Get roster from server
 *  * handle presence
 *  * handle roster iq
 *  * subscribe/unsubscribe
 *  * authorize/unauthorize
 *  * roster versioning (xep 237)
 */

Strophe.addConnectionPlugin('roster', {

    _p_name: 'strophe.plugins.roster - ',

    init: function (conn) {

        msos.console.debug(this._p_name + 'init -> start.');

        this._connection = conn;
        this._callbacks = [];
        this._callbacks_request = [];

        this.items = [];

        ver = null;

        var oldCallback,
            newCallback
            roster = this,
            _connect = conn.connect,
            _attach =  conn.attach;

        newCallback = function (status) {
            var on_recv_pres,
                on_recv_iq;

            if (status == Strophe.Status.ATTACHED
             || status == Strophe.Status.CONNECTED) {
                on_recv_pres =  conn.addStropheHandler(_.bind(roster._onReceivePresence, roster), Strophe.NS.CLIENT, 'presence');
                on_recv_iq =    conn.addStropheHandler(_.bind(roster._onReceiveIQ, roster), Strophe.NS.ROSTER, 'iq', "set");

                on_recv_pres.describe = 'subscribe, unavailable: roster';
                on_recv_iq.describe = 'set: roster';
            }

            if (oldCallback !== null)
                oldCallback.apply(this, arguments);
        };

        conn.connect = function (jid, pass, callback, wait, hold, route) {
            oldCallback = callback;

            if (typeof jid == "undefined") {
                jid = null;
            }
        
            if (typeof pass == "undefined") {
                pass = null;
            }

            callback = newCallback;

            _connect.apply(conn, [jid, pass, callback, wait, hold, route]);
        };

        conn.attach = function (jid, sid, rid, callback, wait, hold, wind) {

            oldCallback = callback;

            if (typeof jid == "undefined") {
                jid = null;
            }

            if (typeof sid == "undefined") {
                sid = null;
            }

            if (typeof rid == "undefined") {
                rid = null;
            }

            callback = newCallback;

            _attach.apply(conn, [jid, sid, rid, callback, wait, hold, wind]);
        };

        Strophe.addNamespace('ROSTER_VER', 'urn:xmpp:features:rosterver');
        Strophe.addNamespace('NICK', 'http://jabber.org/protocol/nick');

        msos.console.debug(this._p_name + 'init -> done!');
    },

    supportVersioning: function () {
        return (this._connection.features && this._connection.features.getElementsByTagName('ver').length > 0);
    },

    get: function (userCallback, ver, items) {
        var attrs = {
                xmlns: Strophe.NS.ROSTER
            },
            iq;

        msos.console.debug(this._p_name + 'get -> called.');

        this.items = [];

        if (this.supportVersioning()) {
            // empty rev because i want an rev attribute in the result
            attrs.ver = ver || '';
            this.items = items || [];
        }

        iq = $iq({
            type: 'get',
            'id': this._connection.getUniqueId('roster')
        }).c('query', attrs);

        return this._connection.sendIQ(
            iq,
            'get: query roster',
            this._onReceiveRosterSuccess.bind(this, userCallback),
            this._onReceiveRosterError.bind(this, userCallback),
            false,
            Strophe.NS.ROSTER
        );
    },

    registerCallback: function (call_back) {
        msos.console.debug(this._p_name + 'registerCallback -> called.');

        this._callbacks.push(call_back);
    },

    registerRequestCallback: function (call_back) {
        msos.console.debug(this._p_name + 'registerRequestCallback -> called.');
        this._callbacks_request.push(call_back);
    },

    findItem: function (jid) {
        var i = 0;

        msos.console.debug(this._p_name + 'findItem -> called, jid: ' + jid);

        for (i = 0; i < this.items.length; i += 1) {
            if (this.items[i]
             && this.items[i].jid == jid) {
                return this.items[i];
            }
        }
        return false;
    },

    removeItem: function (jid) {
        var i = 0;

        msos.console.debug(this._p_name + 'removeItem -> called, jid: ' + jid);

        for (i = 0; i < this.items.length; i += 1) {
            if (this.items[i]
             && this.items[i].jid == jid) {
                this.items.splice(i, 1);
                return true;
            }
        }
        return false;
    },

    subscribe: function (jid, message, nick) {
        var pres = $pres({
                to: jid,
                type: "subscribe"
            });

        if (message && message !== "") {
            pres.c("status").t(message).up();
        }

        if (nick && nick !== "") {
            pres.c('nick', {
                'xmlns': Strophe.NS.NICK
            }).t(nick).up();
        }

        this._connection.send(pres);
    },

    unsubscribe: function (jid, message) {
        var pres = $pres({
                to: jid,
                type: "unsubscribe"
            });

        if (message && message !== "") {
            pres.c("status").t(message);
        }

        this._connection.send(pres);
    },

    authorize: function (jid, message) {
        var pres = $pres({
                to: jid,
                type: "subscribed"
            });

        if (message && message !== "") {
            pres.c("status").t(message);
        }

        this._connection.send(pres);
    },

    unauthorize: function (jid, message) {
        var pres = $pres({
                to: jid,
                type: "unsubscribed"
            });
    
        if (message && message !== "") {
            pres.c("status").t(message);
        }

        this._connection.send(pres);
    },

    add: function (jid, name, groups, call_back) {
        var iq = $iq({
                type: 'set'
            }).c('query', {
                xmlns: Strophe.NS.ROSTER
            }).c('item', {
                jid: jid,
                name: name
            }),
            i = 0;

        for (i = 0; i < groups.length; i += 1) {
            iq.c('group').t(groups[i]).up();
        }

        this._connection.sendIQ(iq, 'set: query roster, item jid/name', call_back, call_back, false, Strophe.NS.ROSTER);
    },

    update: function (jid, name, groups, call_back) {
        var item = this.findItem(jid),
            newName,
            newGroups,
            iq,
            i = 0;

        if (!item) {
            throw "item not found";
        }

        newName = name || item.name;
        newGroups = groups || item.groups;

        iq = $iq({
            type: 'set'
        }).c('query', {
            xmlns: Strophe.NS.ROSTER
        }).c('item', {
            jid: item.jid,
            name: newName
        });

        for (i = 0; i < newGroups.length; i += 1) {
            iq.c(
                'group').t(newGroups[i]
            ).up();
        }

        return this._connection.sendIQ(iq, 'set: query roster, item jid/name', call_back, call_back, false, Strophe.NS.ROSTER);
    },

    remove: function (jid, call_back) {
        var item = this.findItem(jid),
            iq;

        if (!item) {
            throw "item not found";
        }

        iq = $iq({
            type: 'set'
        }).c('query', {
            xmlns: Strophe.NS.ROSTER
        }).c('item', {
            jid: item.jid,
            subscription: "remove"
        });

        this._connection.sendIQ(iq, 'set: query roster, item remove', call_back, call_back, false, Strophe.NS.ROSTER);
    },

    _onReceiveRosterSuccess: function (userCallback, stanza) {
        this._updateItems(stanza);
        userCallback(this.items);
    },

    _onReceiveRosterError: function (userCallback, stanza) {
        userCallback(this.items);
    },

    _onReceivePresence: function (presence) {
        // TODO: from is optional
        var jid = presence.getAttribute('from'),
            from = Strophe.getBareJidFromJid(jid),
            item = this.findItem(from),
            type = presence.getAttribute('type');

        // not in roster
        if (!item) {
            // if 'friend request' presence
            if (type === 'subscribe') {
                this._call_backs_request(from);
            }
            return true;
        }

        if (type == 'unavailable') {
            delete item.resources[Strophe.getResourceFromJid(jid)];
        } else if (!type) {
            // TODO: add timestamp
            item.resources[Strophe.getResourceFromJid(jid)] = {
                show: (presence.getElementsByTagName('show').length !== 0) ? Strophe.getText(presence.getElementsByTagName('show')[0]) : "",
                status: (presence.getElementsByTagName('status').length !== 0) ? Strophe.getText(presence.getElementsByTagName('status')[0]) : "",
                priority: (presence.getElementsByTagName('priority').length !== 0) ? Strophe.getText(presence.getElementsByTagName('priority')[0]) : ""
            };
        } else {
            // Stanza is not a presence notification. (It's probably a subscription type stanza.)
            return true;
        }

        this._call_backs(this.items, item);

        return true;
    },

    _call_backs_request: function (from) {
        var i = 0;

        for (i = 0; i < this._callbacks_request.length; i += 1) {
            this._callbacks_request[i](from);
        }
    },

    _call_backs: function (items, item) {
        var i = 0;

        for (i = 0; i < this._callbacks.length; i += 1) {
            this._callbacks[i](items, item);
        }
    },

    _onReceiveIQ: function(iq) {
        var id = iq.getAttribute('id'),
            from = iq.getAttribute('from'),
            iqresult;

        // Receiving client MUST ignore stanza unless it has no from or from = user's JID.
        if (from
         && from !== ""
         && from != this._connection.jid && from != Strophe.getBareJidFromJid(this._connection.jid)) {
            return true;
         }

        var iqresult = $iq({
            type: 'result',
            id: id,
            from: this._connection.jid
        });

        this._connection.send(iqresult);
        this._updateItems(iq);

        return true;
    },

    _updateItems: function (iq) {
        var query = iq.getElementsByTagName('query'),
            self = this;

        if (query.length !== 0) {
            this.ver = query.item(0).getAttribute('ver');

            jQuery(query.item(0)).children('item').each(
                function (i, item) {
                    self._updateItem(item);
                }
            );
        }
        this._call_backs(this.items);
    },

    _updateItem: function (item) {
        var jid = item.getAttribute("jid"),
            name = item.getAttribute("name"),
            subscription = item.getAttribute("subscription"),
            ask = item.getAttribute("ask"),
            groups = [];

        jQuery(item).children('group').each(
            function (i, group) {
                groups.push(Strophe.getText(group));
            }
        );

        if (subscription == "remove") {
            this.removeItem(jid);
            return;
        }

        item = this.findItem(jid);

        if (!item) {
            this.items.push({
                name: name,
                jid: jid,
                subscription: subscription,
                ask: ask,
                groups: groups,
                resources: {}
            });
        } else {
            item.name = name;
            item.subscription = subscription;
            item.ask = ask;
            item.groups = groups;
        }
    }
});