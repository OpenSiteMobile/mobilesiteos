//    XMPP plugins for Strophe v1.0.4

//    (c) 2012-2013 Yiorgis Gozadinos.
//    strophe.plugins is distributed under the MIT license.
//    http://github.com/ggozad/strophe.plugins


// Helpers for dealing with
// [XEP-0004: Data Forms](http://xmpp.org/extensions/xep-0004.html)

/*global
    Strophe: false,
    $iq: false,
    $build: false,
    jQuery: false,
    _: false
*/

(function () {
    "use strict";

    var Option = function (opts) {
            opts = opts || {};
            this.value = opts.value || '';
            this.label = opts.label;
        },
        Field,
        Form;

    _.extend(
        Option.prototype,
        {
            toXML: function () {
                var el, attrs = {};

                if (this.label) { attrs.label = this.label; }

                el = $build('option', attrs)
                    .c('value').t(this.value.toString());

                return el.tree();
            },
            toJSON: function () {
                return {
                    label: this.label,
                    value: this.value
                };
            }
        }
    );

    Option.fromXML = function (xml) {

        return new Option(
            {
                label: (jQuery(xml)).attr('label'),
                value: (jQuery(xml)).text()
            }
        );
    };

    Field = function (opts) {

        opts = opts || {};

        this.type =     opts.type || 'text-single';
        this['var'] =   opts['var'] || 'undefined';
        this.desc =     opts.desc;
        this.label =    opts.label;
        this.required = opts.required === true || opts.required === 'true' || false;
        this.options =  opts.options || [];
        this.values =   opts.values || [];

        if (opts.value) { this.values.push(opts.value); }

        return this;
    };

    _.extend(
        Field.prototype,
        {
            toXML: function () {
                var attrs = {
                    type: this.type,
                    'var': this['var']
                },
                xml;

                if (this.label) { attrs.label = this.label; }

                xml = $build('field', attrs);

                if (this.desc) { xml.c('desc').t(this.desc).up(); }

                if (this.required) { xml.c('required').up(); }

                _.each(
                    this.values,
                    function (value) {
                        xml.c('value').t(value.toString()).up();
                    }
                );

                _.each(
                    this.options,
                    function (option) {
                        xml.cnode(option.toXML()).up();
                    }
                );

                return xml.tree();
            },

            toJSON: function () {

                return {
                    type: this.type,
                    'var': this['var'],
                    desc: this.desc,
                    label: this.label,
                    required: this.required,
                    options: _.map(this.options, function (option) { return option.toJSON(); }),
                    values: this.values
                };
            }
        }
    );

    Field.fromXML = function (xml) {

        xml = jQuery(xml);

        return new Field({
            type: xml.attr('type'),
            'var': xml.attr('var'),
            label: xml.attr('label'),
            desc: xml.find('desc').text(),
            required: xml.find('required').length === 1,
            options: _.map(jQuery('option', xml), function (option) { return new Option.fromXML(option);}),
            values: _.map(jQuery('>value', xml), function (value) { return jQuery(value).text(); })
        });
    };

    Form = function (opts) {

        opts = opts || {};

        this.type =         opts.type || 'form';
        this.fields =       opts.fields || [];
        this.title =        opts.title;
        this.instructions = opts.instructions;

        return this;
    };

    _.extend(Form.prototype, {

        toXML: function () {
            var xml = $build('x', {
                    xmlns: 'jabber:x:data',
                    type: this.type
                });

            if (this.title) { xml.c('title').t(this.title.toString()).up(); }
            if (this.instructions) { xml.c('instructions').t(this.instructions.toString()).up(); }

            _.each(
                this.fields,
                function (field) { xml.cnode(field.toXML()).up(); }
            );

            return xml.tree();
        },

        toJSON: function () {

            return {
                type: this.type,
                title: this.title,
                instructions: this.instructions,
                fields: _.map(this.fields, function (field) { return field.toJSON(); })
            };

        }
    });

    Form.fromXML = function (xml) {

        xml = jQuery(xml);

        return new Form({
            type: xml.attr('type'),
            title: xml.find('title').text(),
            instructions: xml.find('instructions').text(),
            fields: _.map(jQuery('>field', xml), function (field) { return new Field.fromXML(field); })
        });

    };

    Strophe.addConnectionPlugin(
    'x',
        {
            _p_name: 'strophe.plugins.forms - ',
            _c: null,
    
            init: function (conn) {
                "use strict";
    
                msos.console.debug(this._p_name + 'init -> start.');
    
                this._c = conn;     // Isn't really needed...but matches other plugins
    
                msos.console.debug(this._p_name + 'init -> done!');
            },

            Form: Form,
            Field: Field,
            Option: Option
        }
    );

}());
