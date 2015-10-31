//    XMPP plugins for Strophe v1.0.4

//    (c) 2012-2013 Yiorgis Gozadinos.
//    strophe.plugins is distributed under the MIT license.
//    http://github.com/ggozad/strophe.plugins


// A Disco plugin partially implementing
// [XEP-0030 Service Discovery](http://xmpp.org/extensions/xep-0030.html)

/*global
    msos: false,
    Strophe: false,
    $iq: false,
    $build: false,
    _: false,
    jQuery: false
*/

Strophe.addConnectionPlugin('disco', {

    _connection: null,
    _identities: [],
    _features: [],

    _p_name: 'strophe.plugins.disco - ',

    init: function (connection) {
        "use strict";

        msos.console.debug(this._p_name + 'init -> start.');

        this._connection = connection;

        msos.console.debug(this._p_name + 'init -> done!');
    },

    statusChanged: function (status) {
        "use strict";

        var self = this;

        if (status === Strophe.Status.CONNECTED) {
            self._connection.addStropheHandler(_.bind(self._onDiscoInfo, self), Strophe.NS.DISCO_INFO, 'iq', 'get');
        }
    },

    addIdentity: function (identity) {
        "use strict";

        this._identities.push(identity);
    },

    addFeature: function (feature) {
        "use strict";

        this._features.push(feature);
    },

    info: function (to, node) {
        "use strict";

        var d = jQuery.Deferred(),
            query = { xmlns: Strophe.NS.DISCO_INFO },
            identities = [],
            features = [],
            iq;

        if (node) {
            query.node = node;
        }

        iq = $iq(
                { to: to, type: 'get' }
            ).c('query', query);

        this._connection.sendIQ(
            iq,
            'get: query disco info',
            function (response) {
                _.each(
                    jQuery('identity', response),
                    function (node) {
                        identities.push(
                            _.reduce(
                                node.attributes,
                                function (identity, attr) {
                                    identity[attr.nodeName] = attr.nodeValue;
                                    return identity;
                                },
                                {}
                            )
                        );
                    }
                );

                _.each(
                    jQuery('feature', response),
                    function (node) {
                        features.push(node.getAttribute('var'));
                    }
                );

                d.resolve({ identities: identities, features: features });
            },
            d.reject
        );

        return d.promise();
    },

    _onDiscoInfo: function (iq) {
        "use strict";

        var response = $iq(
                {
                    to: iq.getAttribute('from'),
                    id: iq.getAttribute('id'),
                    type: 'result'
                }
            ).c(
                'query',
                { xmlns: Strophe.NS.DISCO_INFO }
            );

        _.each(
            this._identities,
            function (identity) {
                response.c('identity', identity).up();
            }
        );

        _.each(
            this._features,
            function (feature) {
                response.c(
                        'feature',
                        { 'var': feature }
                    ).up();
            }
        );

        this._connection.send(response.tree());
        return true;
    }
});
