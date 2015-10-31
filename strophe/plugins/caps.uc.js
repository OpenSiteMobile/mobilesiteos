/**
 * Entity Capabilities (XEP-0115)
 *
 * Depends on disco plugin.
 *
 * See: http://xmpp.org/extensions/xep-0115.html
 *
 * Authors:
 *   - Michael Weibel <michael.weibel@gmail.com>
 *
 * Copyright:
 *   - Michael Weibel <michael.weibel@gmail.com>
 */


Strophe.addConnectionPlugin('caps', {

    HASH: 'sha-1',
    node: 'http://strophe.im/strophejs/',
    _ver: '',
    _connection: null,
    _knownCapabilities: {},
    _jidVerIndex: {},

	_p_name: 'strophe.plugins.caps - ',

    init: function (conn) {
		"use strict";

		msos.console.debug(this._p_name + 'init -> start.');

        this._connection = conn;

        Strophe.addNamespace('CAPS', 'http://jabber.org/protocol/caps');

        if (!this._connection.disco) {
            throw "Caps plugin requires the disco plugin to be installed.";
        }

        this._connection.disco.addFeature(Strophe.NS.CAPS);
		this._connection.disco.addFeature(Strophe.NS.DISCO_INFO);
		this._connection.disco.addFeature(Strophe.NS.RECEIPTS);

		msos.console.debug(this._p_name + 'init -> done!');
    },

    statusChanged: function (status) {
        "use strict";

        if (status === Strophe.Status.CONNECTING) {
            this._connection.addStropheHandler(_.bind(this._delegateCapabilities, this), Strophe.NS.CAPS, 'presence');
			return true;
        }
		return false;
    },

    generateCapsAttrs: function () {
		"use strict";

        return {
            'xmlns': Strophe.NS.CAPS,
            'hash': this.HASH,
            'node': this.node,
            'ver': this.generateVer()
        };
    },

    generateVer: function () {
		"use strict";

        if (this._ver !== "") {
            return this._ver;
        }

        var i = 0,
			ver = "",
			curIdent,
            identities = this._connection.disco._identities.sort(this._sortIdentities),
            identitiesLen = identities.length,
            features = this._connection.disco._features.sort(),
            featuresLen = features.length;

		function safe_add(a, b) {
			var c = (65535 & a) + (65535 & b),
				d = (a >> 16) + (b >> 16) + (c >> 16);
			return d << 16 | 65535 & c;
		}

		function str2binb(a) {
			var b = [],
				c = 255,
				d = 0;

			for (d = 0; d < 8 * a.length; d += 8) { b[d >> 5] |= (a.charCodeAt(d / 8) & c) << 24 - d % 32; }

			return b;
		}

		function rol(a, b) {
			return a << b | a >>> 32 - b;
		}

		function sha1_ft(a, b, c, d) {
			return 20 > a ? b & c | ~b & d : 40 > a ? b ^ c ^ d : 60 > a ? b & c | b & d | c & d : b ^ c ^ d;
		}

		function sha1_kt(a) {
			return 20 > a ? 1518500249 : 40 > a ? 1859775393 : 60 > a ? -1894007588 : -899497514;
		}

		function core_sha1(a, b) {
			a[b >> 5] |= 128 << 24 - b % 32;
			a[(b + 64 >> 9 << 4) + 15] = b;

			var c, d, e, f, g, h, i, j, k = new Array(80),
				l = 1732584193,
				m = -271733879,
				n = -1732584194,
				o = 271733878,
				p = -1009589776;

			for (c = 0; c < a.length; c += 16) {
				for (f = l, g = m, h = n, i = o, j = p, d = 0; 80 > d; d += 1) {
					k[d] = 16 > d ? a[c + d] : rol(k[d - 3] ^ k[d - 8] ^ k[d - 14] ^ k[d - 16], 1);
					e = safe_add(safe_add(rol(l, 5), sha1_ft(d, m, n, o)), safe_add(safe_add(p, k[d]), sha1_kt(d)));
					p = o;
					o = n;
					n = rol(m, 30);
					m = l;
					l = e;
				}
				l = safe_add(l, f);
				m = safe_add(m, g);
				n = safe_add(n, h);
				o = safe_add(o, i);
				p = safe_add(p, j);
			}
			return [l, m, n, o, p];
		}

		function binb2b64(a) {
			var b, c, d = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", e = "", f = 0;

			for (f = 0; f < 4 * a.length; f += 3) {
				for (b = (a[f >> 2] >> 8 * (3 - f % 4) & 255) << 16 | (a[f + 1 >> 2] >> 8 * (3 - (f + 1) % 4) & 255) << 8 | a[f + 2 >> 2] >> 8 * (3 - (f + 2) % 4) & 255, c = 0; 4 > c; c += 1) {
					e += 8 * f + 6 * c > 32 * a.length ? "=" : d.charAt(b >> 6 * (3 - c) & 63);
				}
			}

			return e;
		}

		function b64_sha1(a) {
			return binb2b64(core_sha1(str2binb(a), 8 * a.length));
		}

        for (i = 0; i < identitiesLen; i += 1) {
            curIdent = identities[i];
            ver += curIdent.category + "/" + curIdent.type + "/" + curIdent.lang + "/" + curIdent.name + "<";
        }

        for (i = 0; i < featuresLen; i += 1) {
            ver += features[i] + '<';
        }

        this._ver = b64_sha1(ver);

        return this._ver;
    },

    getCapabilitiesByJid: function (jid) {
		"use strict";

        if (this._jidVerIndex[jid]) {
            return this._knownCapabilities[this._jidVerIndex[jid]];
        }
        return null;
    },

    _delegateCapabilities: function (stanza) {
		"use strict";

        var from = stanza.getAttribute('from'),
            c = stanza.querySelector('c'),
            ver = c.getAttribute('ver'),
            node = c.getAttribute('node');

        if (!this._knownCapabilities[ver]) {
            return this._requestCapabilities(from, node, ver);
        }

        this._jidVerIndex[from] = ver;

        if (!this._jidVerIndex[from] ||  !this._jidVerIndex[from] !==  ver) {
            this._jidVerIndex[from] =  ver;
        }
        return true;
    },

    _requestCapabilities: function (to, node, ver) {
		"use strict";

		var id;

        if (to !== this._connection.jid) {
            id = this._connection.disco.info(to, node + '#' + ver);
            this._connection.addStropheHandler(_.bind(this._handleDiscoInfoReply, this), Strophe.NS.DISCO_INFO, 'iq', 'result', id, to);
        }

        return true;
    },

    _handleDiscoInfoReply: function (stanza) {
		"use strict";

        var query = stanza.querySelector('query'),
            at_node = query.getAttribute('node').split('#'),
            ver = at_node[1],
            from = stanza.getAttribute('from'),
			childNodes,
			childNodesLen,
			i = 0,
			node;

        if (!this._knownCapabilities[ver]) {
            childNodes =  query.childNodes;
            childNodesLen =  childNodes.length;

            this._knownCapabilities[ver] = [];

            for (i = 0; i < childNodesLen; i += 1) {
                node = childNodes[i];
                this._knownCapabilities[ver].push({
                    name:  node.nodeName,
                    attributes:  node.attributes
                });
            }
            this._jidVerIndex[from] = ver;
        } else if (!this._jidVerIndex[from] || !this._jidVerIndex[from] !==  ver) {
            this._jidVerIndex[from] =  ver;
        }
        return false;
    },

    _sortIdentities: function (a, b) {
		"use strict";

        if (a.category > b.category) {
            return 1;
        }
        if (a.category < b.category) {
            return -1;
        }
        if (a.type > b.type) {
            return 1;
        }
        if (a.type < b.type) {
            return -1;
        }
        if (a.lang > b.lang) {
            return 1;
        }
        if (a.lang < b.lang) {
            return -1;
        }
        return 0;
    }
});