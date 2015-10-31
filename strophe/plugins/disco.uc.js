/*
  Copyright 2010, François de Metz <francois@2metz.fr>
*/
/**
 * Disco Strophe Plugin
 * Implement http://xmpp.org/extensions/xep-0030.html
 * TODO: manage node hierarchies, and node on info request
 */

Strophe.addConnectionPlugin('disco', {
    _connection: null,
    _identities: [],
    _features: [],
    _items: [],

    _p_name: 'strophe.plugins.disco - ',

    init: function (conn) {
        "use strict";

        msos.console.debug(this._p_name + 'init -> start.');

        this._connection = conn;
        this._identities = [];
        this._features = [];
        this._items = [];

        msos.console.debug(this._p_name + 'init -> done!');
    },

    statusChanged: function (status) {
        "use strict";

        if (status === Strophe.Status.CONNECTED) {
            // disco info
            this._connection.addStropheHandler(_.bind(this._onDiscoInfo, this), Strophe.NS.DISCO_INFO, 'iq', 'get');
            // disco items
            this._connection.addStropheHandler(_.bind(this._onDiscoItems, this), Strophe.NS.DISCO_ITEMS, 'iq', 'get');

            return true;
        }
        return false;
    },

    addIdentity: function (category, type, name, lang) {
        "use strict";

        var i = 0;

        for (i = 0; i < this._identities.length; i += 1) {
            if (this._identities[i].category === category &&
                this._identities[i].type === type &&
                this._identities[i].name === name &&
                this._identities[i].lang === lang) {
                return false;
            }
        }

        this._identities.push({
            category: category,
            type: type,
            name: name,
            lang: lang
        });
        return true;
    },

    addFeature: function (var_name) {
        "use strict";

        var i = 0;

        for (i = 0; i < this._features.length; i += 1) {
            if (this._features[i] === var_name) {
                return false;
            }
        }

        this._features.push(var_name);
        return true;
    },

    removeFeature: function (var_name) {
        "use strict";

        var i = 0;

        for (i = 0; i < this._features.length; i += 1) {
            if (this._features[i] === var_name) {
                this._features.splice(i, 1);
                return true;
            }
        }
        return false;
    },

    addItem: function (jid, name, node, call_back) {
        "use strict";

        if (node && !call_back) {
            return false;
        }

        this._items.push({
            jid: jid,
            name: name,
            node: node,
            call_back: call_back
        });

        return true;
    },

    info: function (jid, node, success, error, timeout) {
        "use strict";

        var attrs = {
                xmlns: Strophe.NS.DISCO_INFO
            },
            info;

        if (node) {
            attrs.node = node;
        }

        info = $iq({
            from: this._connection.jid,
            to: jid,
            type: 'get'
        }).c('query', attrs);

        this._connection.sendIQ(
            info,
            'get: query disco info',
            success,
            error,
            timeout
        );
    },

    items: function (jid, node, success, error, timeout) {
        "use strict";

        var attrs = {
                xmlns: Strophe.NS.DISCO_ITEMS
            },
            items;

        if (node) {
            attrs.node = node;
        }

        items = $iq({
            from: this._connection.jid,
            to: jid,
            type: 'get'
        }).c('query', attrs);

        this._connection.sendIQ(
            items,
            'get: query disco items',
            success,
            error,
            timeout
        );
    },

    /** PrivateFunction: _buildIQResult
     */
    _buildIQResult: function (stanza, query_attrs) {
        "use strict";

        var id = stanza.getAttribute('id'),
            from = stanza.getAttribute('from'),
            iqresult = $iq({
                type: 'result',
                id: id
            });

        if (from !== null) {
            iqresult.attrs({
                to: from
            });
        }

        return iqresult.c('query', query_attrs);
    },

    _onDiscoInfo: function (stanza) {
        "use strict";

        var node = stanza.getElementsByTagName('query')[0].getAttribute('node'),
            attrs = {
                xmlns: Strophe.NS.DISCO_INFO
            },
            i,
            iqresult;

        if (node) {
            attrs.node = node;
        }

        iqresult = this._buildIQResult(stanza, attrs);

        for (i = 0; i < this._identities.length; i += 1) {
            attrs = {
                category: this._identities[i].category,
                type: this._identities[i].type
            };

            if (this._identities[i].name) {
                attrs.name = this._identities[i].name;
            }

            if (this._identities[i].lang) {
                attrs['xml:lang'] = this._identities[i].lang;
            }

            iqresult.c('identity', attrs).up();
        }

        for (i = 0; i < this._features.length; i += 1) {
            iqresult.c('feature', {
                'var': this._features[i]
            }).up();
        }

        this._connection.send(iqresult.tree());

        return true;
    },

    _onDiscoItems: function (stanza) {
        "use strict";

        var query_attrs = {
                xmlns: Strophe.NS.DISCO_ITEMS
            },
            node = stanza.getElementsByTagName('query')[0].getAttribute('node'),
            items,
            i,
            iqresult,
            attrs;

        if (node) {
            query_attrs.node = node;
            items = [];
            for (i = 0; i < this._items.length; i += 1) {
                if (this._items[i].node === node) {
                    items = this._items[i].call_back(stanza);
                    break;
                }
            }
        } else {
            items = this._items;
        }

        iqresult = this._buildIQResult(stanza, query_attrs);

        for (i = 0; i < items.length; i += 1) {
            attrs = {
                jid: items[i].jid
            };

            if (items[i].name) {
                attrs.name = items[i].name;
            }

            if (items[i].node) {
                attrs.node = items[i].node;
            }

            iqresult.c('item', attrs).up();
        }

        this._connection.send(iqresult.tree());

        return true;
    }
});
