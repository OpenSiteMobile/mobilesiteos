/*global
    Strophe: false,
    $pres: false,
    $msg: false,
    $iq: false,
    $build: false,
    msos: false
*/


Strophe.addConnectionPlugin(
    'muc',
    {
        _connection: null,
        _p_name: 'strophe.plugins.muc - ',

        init: function (conn) {
            "use strict";

            msos.console.debug(this._p_name + 'init -> start.');

            this._connection = conn;

            Strophe.addNamespace('MUC_OWNER', Strophe.NS.MUC + "#owner");
            Strophe.addNamespace('MUC_ADMIN', Strophe.NS.MUC + "#admin");

            msos.console.debug(this._p_name + 'init -> done!');
        },

        join: function (room, nick, msg_handler_cb, pres_handler_cb, password) {
            "use strict";

            msos.console.debug(this._p_name + 'join -> start.');

            var room_nick = this._append_nick(room, nick),
                msg,
                password_elem,
                join_msg_hand,
                join_pres_hand;

            msg = $pres(
                    {
                        from: this._connection.jid,
                        to: room_nick
                    }
                ).c("x", { xmlns: Strophe.NS.MUC });

            if (password) {
                password_elem = Strophe.xmlElement(
                    "password",
                    [],
                    password
                );
                msg.cnode(password_elem);
            }

            if (msg_handler_cb) {
                join_msg_hand = this._connection.addStropheHandler(
                    function (stanza) {
                        var from = stanza.getAttribute('from'),
                            roomname = from.split("/");

                        // filter on room name
                        msos.console.debug(this._p_name + 'join -> done, msg callback.');

                        if (roomname[0] === room) { return msg_handler_cb(stanza); }
                        return true;
                    },
                    Strophe.NS.CLIENT,
                    "message"
                );
                join_msg_hand.describe = 'MUC join: ' + room_nick;
            }

            if (pres_handler_cb) {
                join_pres_hand = this._connection.addStropheHandler(
                    function (stanza) {
                        var xquery = stanza.getElementsByTagName("x"),
                            i = 0,
                            xmlns;

                        if (xquery.length > 0) {
                            //Handle only MUC user protocol
                            for (i = 0; i < xquery.length; i += 1) {
                                xmlns = xquery[i].getAttribute("xmlns");

                                if (xmlns && xmlns.match(Strophe.NS.MUC)) {
                                    msos.console.debug(this._p_name + 'join -> done, pres callback.');
                                    return pres_handler_cb(stanza);
                                }
                            }
                        }
                        return true;
                    },
                    Strophe.NS.CLIENT,
                    "presence"
                );
                join_pres_hand.describe = 'MUC join: ' + room_nick;
            }

            this._connection.send(msg);

            msos.console.debug(this._p_name + 'join -> done!');
        },

        leave: function (room, nick, handler_cb) {
            "use strict";

            msos.console.debug(this._p_name + 'leave -> start.');

            var room_nick = this._append_nick(room, nick),
                presenceid = this._connection.getUniqueId(),
                presence = $pres(
                    {
                        type: "unavailable",
                        id: presenceid,
                        from: this._connection.jid,
                        to: room_nick
                    }
                ).c("x", { xmlns: Strophe.NS.MUC }),
                leave_pres_hand;

            leave_pres_hand = this._connection.addStropheHandler(
                handler_cb,
                Strophe.NS.CLIENT,
                "presence",
                false,
                presenceid
            );

            this._connection.send(presence);

            msos.console.debug(this._p_name + 'leave -> done, room jid: ' + room_nick);
            return presenceid;
        },

        message: function (room, nick, message, type) {
            "use strict";

            msos.console.debug(this._p_name + 'message -> start.');

            var room_nick = this._append_nick(room, nick),
                msgid = this._connection.getUniqueId(),
                msg;

            type = type || "groupchat";

            msg = $msg(
                {
                    to: room_nick,
                    from: this._connection.jid,
                    type: type,
                    id: msgid}
            ).c("body", { xmlns: Strophe.NS.CLIENT }).t(message);

            msg.up().c("x", { xmlns: "jabber:x:event" }).c("composing");

            this._connection.send(msg);

            msos.console.debug(this._p_name + 'message -> done!');
            return msgid;
        },

        configure: function (room) {
            "use strict";

            msos.console.debug(this._p_name + 'configure -> called.');

            //send iq to start room configuration
            var config = $iq(
                    {
                        to: room,
                        type: "get"
                    }
                ).c("query", { xmlns: Strophe.NS.MUC_OWNER }),
                stanza = config.tree();

            return this._connection.sendIQ(
                stanza,
                'get: query MUC owner'
            );
        },

        cancelConfigure: function (room) {
            "use strict";

            msos.console.debug(this._p_name + 'cancelConfigure -> called.');

            //send iq to start room configuration
            var config = $iq(
                    {
                        to: room,
                        type: "set"
                    }
                ).c("query",    { xmlns: Strophe.NS.MUC_OWNER })
                 .c("x",        { xmlns: "jabber:x:data", type: "cancel" }
                ),
                stanza = config.tree();

            return this._connection.sendIQ(
                stanza,
                'set: query MUC owner, x cancel'
            );
        },

        saveConfiguration: function (room, configarray) {
            "use strict";

            msos.console.debug(this._p_name + 'saveConfiguration -> called.');

            var config = $iq(
                    {
                        to: room,
                        type: "set"
                    }
                ).c("query",    { xmlns: Strophe.NS.MUC_OWNER })
                 .c("x",        { xmlns: "jabber:x:data", type: "submit" }),
                i = 0,
                stanza;

            for (i = 0; i < configarray.length; i += 1) {
                config.cnode(configarray[i]);
                config.up();
            }

            stanza = config.tree();

            return this._connection.sendIQ(
                stanza,
                'set: query MUC owner, x submit (array up)'
            );
        },

        createInstantRoom: function (room) {
            "use strict";

            msos.console.debug(this._p_name + 'createInstantRoom -> called.');

            var roomiq = $iq(
                    {
                        to: room,
                        type: "set"
                    }
                ).c("query",    { xmlns: Strophe.NS.MUC_OWNER })
                 .c("x",        { xmlns: "jabber:x:data", type: "submit" });

            return this._connection.sendIQ(
                roomiq.tree(),
                'set: query MUC owner, x submit'
            );
        },

        setTopic: function (room, topic) {
            "use strict";

            msos.console.debug(this._p_name + 'setTopic -> called.');

            var msg = $msg(
                    {
                        to: room,
                        from: this._connection.jid,
                        type: "groupchat"
                    }
                ).c("subject", { xmlns: "jabber:client" }).t(topic);

            this._connection.send(msg.tree());
        },

        modifyUser: function (room, nick, role, affiliation, reason) {
            "use strict";

            msos.console.debug(this._p_name + 'modifyUser -> called.');

            var item_attrs = { nick: Strophe.escapeNode(nick) },
                item,
                roomiq;

            if (role !== null) {
                item_attrs.role = role;
            }
            if (affiliation !== null) {
                item_attrs.affiliation = affiliation;
            }

            item = $build("item", item_attrs);

            if (reason !== null) {
                item.cnode(Strophe.xmlElement("reason", reason));
            }

            roomiq = $iq(
                    {
                        to: room,
                        type: "set"
                    }
                ).c("query", { xmlns: Strophe.NS.MUC_OWNER }).cnode(item.tree());

            return this._connection.sendIQ(
                roomiq.tree(),
                'set: query MUC owner'
            );
        },

        changeNick: function (room, user) {
            "use strict";

            msos.console.debug(this._p_name + 'changeNick -> called.');

            var room_nick = this._append_nick(room, user),
                presence = $pres(
                    {
                        from: this._connection.jid,
                        to: room_nick
                    }
                ).c("x", { xmlns: Strophe.NS.MUC });

            this._connection.send(presence.tree());
        },

        listRooms: function (server, handle_cb) {
            "use strict";

            msos.console.debug(this._p_name + 'listRooms -> called.');
            var iq = $iq(
                    {
                        to: server,
                        from: this._connection.jid,
                        type: "get"
                    }
                ).c("query", { xmlns: Strophe.NS.DISCO_ITEMS });

            this._connection.sendIQ(
                iq,
                'get: query disco items (MUC)',
                handle_cb
            );
        },

        _append_nick: function (room, nick) {
            "use strict";

            var room_plus_nick = room;

            if (nick) {
                room_plus_nick += "/" + Strophe.escapeNode(nick);
            }

            msos.console.debug(this._p_name + '_append_nick -> called, room jid: ' + room_plus_nick);

            return room_plus_nick;
        }
    }
);