//    XMPP plugins for Strophe v1.0.4

//    (c) 2012-2013 Yiorgis Gozadinos.
//    strophe.plugins is distributed under the MIT license.
//    http://github.com/ggozad/strophe.plugins


// A vCard plugin implementing
// [XEP-0049: vcard-temp](http://xmpp.org/extensions/xep-0049.html)

/*global
    Strophe: false,
    $iq: false,
    $build: false,
    _: false,
    jQuery: false
*/

Strophe.addConnectionPlugin(
    'vcard',
    {
        _p_name: 'strophe.plugins.vcard - ',

        _connection: null,

        init: function (conn) {
            "use strict";

            msos.console.debug(this._p_name + 'init -> start.');

            this._connection = conn;
            Strophe.addNamespace('VCARD', 'vcard-temp');

            msos.console.debug(this._p_name + 'init -> done!');
        },

        _buildvCard: function (dict, parent) {
            "use strict";

            var builder;

            if (parent === undefined) {
                builder = $build(
                    'vCard',
                    { xmlns: Strophe.NS.vCard, version: '2.0' }
                );
            } else {
                builder = $build(parent);
            }

            _.each(
                   dict,
                   function (val, key) {
                        if (typeof val === 'object') {
                            builder.cnode(this._buildvCard(val, key)).up();
                        } else if (val) {
                            builder.c(key, {}, val);
                        } else {
                            builder.c(key).up();
                        }
                    },
                this
            );

            return builder.tree();
        },

        _parsevCard: function (xml) {
            "use strict";

            var dict = {},
                self = this,
                jqEl;

            jQuery(xml).children().each(
                function (idx, el) {
                    jqEl = jQuery(el);

                    if (jqEl.children().length) {
                        dict[el.nodeName] = self._parsevCard(el);
                    } else {
                        dict[el.nodeName] = jqEl.text();
                    }
                }
            );

            return dict;
        },

        get: function (jid) {
            "use strict";

            var d = jQuery.Deferred(),
                self = this,
                iq = $iq(
                        {
                            type: 'get',
                            to: jid,
                            id: this._connection.getUniqueId('vCard')
                        }
                    ).c(
                        'vCard',
                        { xmlns: Strophe.NS.vCard });

            this._connection.sendIQ(
                iq.tree(),
                'get: vcard',
                function (response) {
                    var result = jQuery('vCard', response);

                    if (result.length > 0) {
                        d.resolve(self._parsevCard(result));
                    } else {
                        d.reject();
                    }
                },
                d.reject
            );

            return d.promise();
        },

        set: function (vcard) {
            "use strict";

            var d = jQuery.Deferred(),
                iq = $iq(
                    {
                        type: 'set',
                        id: this._connection.getUniqueId('vCard')
                    }
                ).cnode(this._buildvCard(vcard));

            this._connection.sendIQ(
                iq.tree(),
                'set: vcard',
                d.resolve,
                d.reject
            );

            return d.promise();
        },

        base64Image: function (url) {
            "use strict";

            var d = jQuery.Deferred(),
                img = new Image(),
                $img = jQuery(img);

            $img.error(d.reject);

            $img.load(
                function () {
                    var ctx,
                        canvas = document.createElement('canvas');

                    canvas.width = img.width;
                    canvas.height = img.height;

                    ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);

                    d.resolve(canvas.toDataURL('image/png'));
                }
            ).attr('src', url);

            return d.promise();
        }
    }
);

