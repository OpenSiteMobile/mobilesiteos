/**
 * @license AngularJS v1.3.0-beta.11
 * (c) 2010-2014 Google, Inc. http://angularjs.org
 * License: MIT
 *
 * Originally derived from  v1.3.0-beta.11,
 *       with updates from  v1.3.0-beta.18, v1.3.0-beta.19, v1.3.0-rc.1, v1.3.1, v1.3.2, v1.3.3,
 *                          v1.3.4, v1.3.5, v1.3.7, v1.3.8, v1.3.9, v1.3.10, v1.3.13
 *       ...plus improvements for MobileSiteOS
 */

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false
*/

msos.console.info('ng/v1313_msos -> start.');
msos.console.time('ng');

(function (window, document) {
    "use strict";

    function noop() { return undefined; }

    noop.$inject = [];

    function nullFormRenameControl(control, name) {
        control.$name = name;
    }

    var angular = {},
        version = {
            full: '1.3.13',
            major: 1,
            minor: 3,
            dot: 13,
            codeName: 'meticulous_riffleshuffle_msos'
        },
        NODE_TYPE_ELEMENT = 1,
        NODE_TYPE_TEXT = 3,
        NODE_TYPE_COMMENT = 8,
        NODE_TYPE_DOCUMENT = 9,
        NODE_TYPE_DOCUMENT_FRAGMENT = 11,
        REGEX_STRING_REGEXP = /^\/(.+)\/([a-z]*)$/,
        SNAKE_CASE_REGEXP = /[A-Z]/g,
        SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g,
        MOZ_HACK_REGEXP = /^moz([A-Z])/,
        HTML_REGEXP = /<|&#?\w+;/,
        FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
        FN_ARG_SPLIT = /,/,
        FN_ARG = /^\s*(_?)(\S+?)\1\s*$/,
        STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
        PREFIX_REGEXP = /^((?:x|data)[\:\-_])/i,
        PATH_MATCH = /^([^\?#]*)(\?([^#]*))?(#(.*))?$/,
        DATE_FORMATS_SPLIT = /((?:[^yMdHhmsaZEw']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z|w+))(.*)/,
        NUMBER_STRING = /^\-?\d+$/,
        ISO_DATE_REGEXP = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/,
        URL_REGEXP = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
        EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i,
        NUMBER_REGEXP = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/,
        DATE_REGEXP = /^(\d{4})-(\d{2})-(\d{2})$/,
        DATETIMELOCAL_REGEXP = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/,
        WEEK_REGEXP = /^(\d{4})-W(\d\d)$/,
        MONTH_REGEXP = /^(\d{4})-(\d\d)$/,
        TIME_REGEXP = /^(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/,
        DEFAULT_REGEXP = /(\s+|^)default(\s+|$)/,
        CONSTANT_VALUE_REGEXP = /^(true|false|\d+)$/,
        DATE_FORMATS = {},
        DECIMAL_SEP = '.',
        DEFAULT_PORTS = {
            'http': 80,
            'https': 443,
            'ftp': 21
        },
        SCE_CONTEXTS = {
            HTML: 'html',
            CSS: 'css',
            URL: 'url',
            RESOURCE_URL: 'resourceUrl',
            JS: 'js'
        },
        APPLICATION_JSON = 'application/json',
        CONTENT_TYPE_APPLICATION_JSON = {'Content-Type': APPLICATION_JSON + ';charset=utf-8'},
        JSON_START = /^\[|^\{(?!\{)/,
        JSON_ENDS = {
            '[': /]$/,
            '{': /}$/
        },
        JSON_PROTECTION_PREFIX = /^\)\]\}',?\n/,
        VALIDITY_STATE_PROPERTY = 'validity',
        VALID_CLASS = 'ng-valid',
        INVALID_CLASS = 'ng-invalid',
        PRISTINE_CLASS = 'ng-pristine',
        DIRTY_CLASS = 'ng-dirty',
        UNTOUCHED_CLASS = 'ng-untouched',
        TOUCHED_CLASS = 'ng-touched',
        PENDING_CLASS = 'ng-pending',
        SUBMITTED_CLASS = 'ng-submitted',
        NG_HIDE_CLASS = 'ng-hide',
        NG_HIDE_IN_PROGRESS_CLASS = 'ng-hide-animate',
        slice = [].slice,
        splice = [].splice,
        CALL = Function.prototype.call,
        APPLY = Function.prototype.apply,
        BIND = Function.prototype.bind,
        lowercase = function (s) {
            return _.isString(s)
                ? s.toLowerCase()
                : String(s);
        },
        hasOwnProperty = Object.prototype.hasOwnProperty,
        objectValueOf = Object.prototype.valueOf,
        uppercase = function (string) {
            return _.isString(string) ? string.toUpperCase() : string;
        },
        manualLowercase = function (s) {
            return _.isString(s)
                ? s.replace(/[A-Z]/g, function (ch) { return String.fromCharCode(ch.charCodeAt(0) | 32); })
                : String(s);
        },
        manualUppercase = function (s) {
            return _.isString(s)
                ? s.replace(/[a-z]/g, function (ch) { return String.fromCharCode(ch.charCodeAt(0) & ~32); })
                : String(s);
        },
        ngto_string = Object.prototype.toString,
        urlParsingNode = document.createElement("a"),
        originUrl,
        base_href = jQuery('base').attr('href') || '',
        baseHref = base_href ? base_href.replace(/^(https?\:)?\/\/[^\/]*/, '') : '',
        msie = document.documentMode,
        android = parseInt((/android (\d+)/.exec(lowercase((window.navigator || {}).userAgent)) || [])[1], 10),
        jqLite,
        ngMinErr = null,
        $injectorMinErr = null,
        $animateMinErr = null,
        $compileMinErr = null,
        $interpolateMinErr = null,
        $locationMinErr = null,
        $parseMinErr = null,
        $sceMinErr = null,
        ngOptionsMinErr = null,
        $ngModelMinErr = null,
        $controllerMinErr = null,
        $AnimateProvider = [],
        trim = function (value) {
            return _.isString(value) ? value.trim() : value;
        },
        escapeForRegexp = function (s) {
            return _.isString(s) ? s.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').replace(/\x08/g, '\\x08') : String(s);
        },
        angularModule,
        nodeName_ = function (element) {
            return lowercase(element.nodeName || (element[0] && element[0].nodeName));
        },
        uid = 0,
        csp,
        bindJQueryFired = false,
        skipDestroyOnNextJQueryCleanData,
        JQLitePrototype = {},
        addEventListenerFn = function (element, type, fn) {
            element.addEventListener(type, fn, false);
        },
        removeEventListenerFn = function (element, type, fn) {
            element.removeEventListener(type, fn, false);
        },
        BOOLEAN_ATTR = {},
        BOOLEAN_ELEMENTS = {},
        ALIASED_ATTR = {
            'ngMinlength': 'minlength',
            'ngMaxlength': 'maxlength',
            'ngMin' : 'min',
            'ngMax' : 'max',
            'ngPattern': 'pattern'
        },
        ESCAPE = {
            "n": "\n",
            "f": "\f",
            "r": "\r",
            "t": "\t",
            "v": "\v",
            "'": "'",
            '"': '"'
        },
        nullFormCtrl = {
            $addControl: noop,
            $$renameControl: nullFormRenameControl,
            $removeControl: noop,
            $setValidity: noop,
            $setDirty: noop,
            $setPristine: noop,
            $setSubmitted: noop
        },
        inputType = {},
        Parser = null,
        CONSTANTS = {},
        OPERATORS = {},
        Lexer = null,
        getterFnCacheDefault,
        getterFnCacheExpensive,
        locationPrototype,
        NgModelController,
        ngModelDirective,
        ngAttributeAliasDirectives = {},
        ngEventDirectives = {},
        forceAsyncEvents = {
            'blur': true,
            'focus': true
        },
        htmlAnchorDirective,
        formDirectiveFactory,
        formDirective,
        ngFormDirective,
        inputDirective,
        ngChangeDirective,
        requiredDirective,
        patternDirective,
        maxlengthDirective,
        minlengthDirective,
        ngListDirective,
        ngValueDirective,
        ngModelOptionsDirective,
        ngBindDirective,
        ngBindTemplateDirective,
        ngBindHtmlDirective,
        ngClassDirective,
        ngClassOddDirective,
        ngClassEvenDirective,
        ngCloakDirective,
        ngControllerDirective,
        ngIfDirective,
        ngIncludeDirective,
        ngIncludeFillContentDirective,
        ngInitDirective,
        ngNonBindableDirective,
        ngPluralizeDirective,
        ngRepeatDirective,
        ngShowDirective,
        ngHideDirective,
        ngStyleDirective,
        ngSwitchDirective,
        ngSwitchWhenDirective,
        ngSwitchDefaultDirective,
        ngTranscludeDirective,
        scriptDirective,
        ngOptionsDirective,
        selectDirective,
        optionDirective,
        styleDirective;

    window.angular = angular;

    if ('i' !== 'I'.toLowerCase()) {
        lowercase = manualLowercase;
        uppercase = manualUppercase;
    }

    // Not the same as _.isObject (function not included)
    function isObject(value) {
        return value !== null && typeof value === 'object';
    }

    function isDefined(value) {
        return value !== undefined;
    }

    function isWindow(obj) {
        return obj && obj.window === obj;
    }

    function isScope(obj) {
        return obj && obj.$evalAsync && obj.$watch;
    }

    function isFile(obj) {
        return ngto_string.call(obj) === '[object File]';
    }

    function isFormData(obj) {
        return ngto_string.call(obj) === '[object FormData]';
    }

    function isBlob(obj) {
        return ngto_string.call(obj) === '[object Blob]';
    }

    function isPromiseLike(obj) {
        return obj && _.isFunction(obj.then);
    }

    function isElement(node) {
        return !!(node && (node.nodeName || (node.prop && node.attr && node.find)));
    }

    function toJsonReplacer(key, value) {
        var val = value;

        if (typeof key === 'string' && key.charAt(0) === '$' && key.charAt(1) === '$') {
            val = undefined;
        } else if (isWindow(value)) {
            val = '$WINDOW';
        } else if (value && document === value) {
            val = '$DOCUMENT';
        } else if (isScope(value)) {
            val = '$SCOPE';
        }

        return val;
    }

    function toJson(obj, pretty) {
        if (obj === undefined) { return undefined; }
        if (!_.isNumber(pretty)) {
            pretty = pretty ? 2 : null;
        }
        return JSON.stringify(obj, toJsonReplacer, pretty);
    }

    function fromJson(json) {
        return _.isString(json) ? JSON.parse(json) : json;
    }

    function getValueOf(value) {
        return _.isFunction(value.valueOf) ? value.valueOf() : objectValueOf.call(value);
    }

    function serializeObject(obj) {
        var seen = [];

        return JSON.stringify(
            obj,
            function (key, val) {
                val = toJsonReplacer(key, val);

                if (_.isObject(val)) {
                    if (seen.indexOf(val) >= 0) { return '<< already seen >>'; }
                    seen.push(val);
                }

                return val;
            }
        );
    }

    function toDebugString(obj) {
        if (typeof obj === 'function') {
            return obj.toString().replace(/ \{[\s\S]*$/, '');
        }

        if (obj === undefined) {
            return 'undefined';
        }

        if (typeof obj !== 'string') {
            return serializeObject(obj);
        }

        return obj;
    }

    function minErr(module, ErrorConstructor) {
        ErrorConstructor = ErrorConstructor || Error;
        return function () {
            var templateArgs = Array.prototype.slice.call(arguments) || [],
                code = templateArgs[0] || 'missing code',
                prefix = '[' + (module ? module + ':' : '') + code + '] ',
                template = templateArgs[1] || 'missing template',    // Make sure something (string) is in template var
                message,
                i;

            message = prefix + template.replace(/\{\d+\}/g, function (match) {
                var index = +match.slice(1, -1);

                if (index + 2 < templateArgs.length) {
                    return toDebugString(templateArgs[index + 2]);
                }

                return match;
            });

            message = message + '\nhttp://errors.angularjs.org/1.3.13/' + (module ? module + '/' : '') + code;

            for (i = 2; i < arguments.length; i += 1) {
                message = message + (i === 2 ? '?' : '&') + 'p' + (i - 2) + '=' + encodeURIComponent(toDebugString(arguments[i]));
            }

            return new ErrorConstructor(message);
        };
    }

    ngMinErr = minErr('ng');
    $injectorMinErr = minErr('$injector');

    /**
     *
     *   | member name   | Description    |
     *   |---------------|----------------|
     *   | href          | A normalized version of the provided URL if it was not an absolute URL |
     *   | protocol      | The protocol including the trailing colon                              |
     *   | host          | The host and port (if the port is non-default) of the normalizedUrl    |
     *   | search        | The search params, minus the question mark                             |
     *   | hash          | The hash string, minus the hash symbol
     *   | hostname      | The hostname
     *   | port          | The port, without ":"
     *   | pathname      | The pathname, beginning with "/"
     *
     */
    function urlResolve(url, note) {

        if (msos.config.verbose) {
            msos.console.debug('ng - urlResolve -> start, url: ' + url + (note ? ', ref: ' + note : ''));
        }

        urlParsingNode.setAttribute('href', url);

        var purlFn = msos.purl(urlParsingNode.href, true),
            output = {
                href: purlFn.attr('source'),
                protocol: purlFn.attr('protocol'),
                host: purlFn.attr('host') + (purlFn.attr('port') ? ':' + purlFn.attr('port') : ''),
                search: purlFn.attr('query'),
                hash: purlFn.attr('fragment'),
                hostname: purlFn.attr('host'),
                port: purlFn.attr('port'),
                pathname: purlFn.attr('path'),
                source: purlFn.attr('source'),
                params: purlFn.param(),
            };

        if (msos.config.verbose) {
            msos.console.debug('ng - urlResolve -> done, output:', output);
        }

        return output;
    }

    originUrl = urlResolve(window.location.href, 'set original');

    function urlIsSameOrigin(requestUrl) {
        var parsed = (_.isString(requestUrl)) ? urlResolve(requestUrl, 'check same origin') : requestUrl;
        return (parsed.protocol === originUrl.protocol && parsed.host === originUrl.host);
    }

    function isArrayLike(obj) {
        // This must be '==' and not '==='
        if (!obj
          || obj === null
          || obj === undefined
          || isWindow(obj)) {
            return false;
        }

        var length = obj.length;

        if (obj.nodeType === NODE_TYPE_ELEMENT && length) {
            return true;
        }

        return _.isString(obj) || _.isArray(obj) || length === 0 || (typeof length === 'number' && length > 0 && obj.hasOwnProperty(length - 1));
    }

    function forEach(obj, iterator, context) {
        var key,
            length,
            isPrimitive;

        if (obj) {
            if (_.isFunction(obj)) {
                for (key in obj) {
                    if (key !== 'prototype' && key !== 'length' && key !== 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
                        iterator.call(context, obj[key], key, obj);
                    }
                }
            } else if (_.isArray(obj) || isArrayLike(obj)) {
                isPrimitive = typeof obj !== 'object';
                for (key = 0, length = obj.length; key < length; key += 1) {
                    if (isPrimitive || obj.hasOwnProperty(key)) {
                        iterator.call(context, obj[key], key, obj);
                    }
                }
            } else if (obj.forEach && obj.forEach !== forEach) {
                obj.forEach(iterator, context, obj);
            } else {
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        iterator.call(context, obj[key], key, obj);
                    }
                }
            }
        }
        return obj;
    }

    function sortedKeys(obj) {
        return Object.keys(obj).sort() || [];
    }

    function forEachSorted(obj, iterator, context) {
        var i = 0,
            keys = sortedKeys(obj);

        for (i = 0; i < keys.length; i += 1) {
            iterator.call(context, obj[keys[i]], keys[i]);
        }
        return keys;
    }

    function reverseParams(iteratorFn) {
        return function (value, key) {
            iteratorFn(key, value);
        };
    }

    function nextUid() {
        uid += 1;
        return uid;
    }

    function setHashKey(obj, h) {
        if (h) {
            obj.$$hashKey = h;
        } else {
            delete obj.$$hashKey;
        }
    }

    function extend(dst) {
        var h = dst.$$hashKey,
            i = 0,
            j = 0,
            obj,
            keys,
            key;

        for (i = 1; i < arguments.length; i += 1) {
            obj = arguments[i];
            if (obj) {
                keys = Object.keys(obj) || [];
                for (j = 0; j < keys.length; j += 1) {
                    key = keys[j];
                    dst[key] = obj[key];
                }
            }
        }

        setHashKey(dst, h);
        return dst;
    }

    function inherit(parent, extra) {
        return extend(Object.create(parent), extra);
    }

    function identity($) {
        return $;
    }

    identity.$inject = [];

    function valueFn(value) {
        return function () {
            return value;
        };
    }

    function makeMap(arry) {
        var obj = {},
            i;

        if (_.isArray(arry)) {
            for (i = 0; i < arry.length; i += 1) {
                obj[arry[i]] = true;
            }
        } else {
            msos.console.warn('ng - makeMap -> input not an array.');
        }

        return obj;
    }

    function arrayRemove(array, value) {
        var index = _.indexOf(array, value);
        if (index >= 0) {
            array.splice(index, 1);
        }
        return value;
    }

    function copy(source, destination, stackSource, stackDest) {
        var emptyObject,
            index,
            result,
            i = 0,
            h,
            key;

        if (isWindow(source) || isScope(source)) {
            throw ngMinErr(
                'cpws',
                "Can't copy! Making copies of Window or Scope instances is not supported."
            );
        }

        if (!destination) {

            destination = source;

            if (source) {
                if (_.isArray(source)) {
                    destination = copy(source, [], stackSource, stackDest);
                } else if (_.isDate(source)) {
                    destination = new Date(source.getTime());
                } else if (_.isRegExp(source)) {
                    destination = new RegExp(source.source, source.toString().match(/[^\/]*$/)[0]);
                    destination.lastIndex = source.lastIndex;
                } else if (isObject(source)) {
                    emptyObject = Object.create(Object.getPrototypeOf(source));
                    destination = copy(source, emptyObject, stackSource, stackDest);
                }
            }

        } else {

            if (source === destination) {
                throw ngMinErr(
                    'cpi',
                    "Can't copy! Source and destination are identical."
                );
            }

            stackSource = stackSource || [];
            stackDest = stackDest || [];

            if (isObject(source)) {
                index = _.indexOf(stackSource, source);
                if (index !== -1) {
                    return stackDest[index];
                }
                stackSource.push(source);
                stackDest.push(destination);
            }

            if (_.isArray(source) && _.isArray(destination)) {
                destination.length = 0;
                for (i = 0; i < source.length; i += 1) {
                    result = copy(source[i], null, stackSource, stackDest);
                    if (isObject(source[i])) {
                        stackSource.push(source[i]);
                        stackDest.push(result);
                    }
                    destination.push(result);
                }
            } else {
                h = destination.$$hashKey;
                if (_.isArray(destination)) {
                    destination.length = 0;
                } else {
                    forEach(destination, function (value, key) {
                        delete destination[key];
                    });
                }
                for (key in source) {
                    if (source.hasOwnProperty(key)) {
                        result = copy(source[key], null, stackSource, stackDest);
                        if (isObject(source[key])) {
                            stackSource.push(source[key]);
                            stackDest.push(result);
                        }
                        destination[key] = result;
                    }
                }
                setHashKey(destination, h);
            }
        }
        return destination;
    }

    function shallowCopy(src, dst) {
        var i = 0,
            ii,
            key;

        if (_.isArray(src)) {
            dst = dst || [];

            ii = src.length;

            for (i = 0; i < ii; i += 1) {
                dst[i] = src[i];
            }
        } else if (_.isObject(src)) {
            dst = dst || {};

            for (key in src) {
                if (!(key.charAt(0) === '$' && key.charAt(1) === '$')) {
                    dst[key] = src[key];
                }
            }
        }

        return dst || src;
    }

    function equals(o1, o2) {
        if (o1 === o2) { return true; }
        if (o1 === null || o2 === null) { return false; }

        var key,
            keySet;

        if (typeof o1 === 'object' && typeof o2 === 'object') {
            if (_.isArray(o1)) {
                if (!_.isArray(o2)) { return false; }
                if (o1.length === o2.length) {
                    for (key = 0; key < o1.length; key += 1) {
                        if (!equals(o1[key], o2[key])) { return false; }
                    }
                    return true;
                }
            } else if (_.isDate(o1)) {
                if (!_.isDate(o2)) { return false; }
                return equals(o1.getTime(), o2.getTime());
            }
            if (_.isRegExp(o1) && _.isRegExp(o2)) {
                return o1.toString() === o2.toString();
            }
            if (isScope(o1) || isScope(o2) || isWindow(o1) || isWindow(o2) || _.isArray(o2)) {
                return false;
            }

            keySet = {};

            for (key in o1) {
                if (key.charAt(0) !== '$' || !_.isFunction(o1[key])) {
                    if (!equals(o1[key], o2[key])) { return false; }
                    keySet[key] = true;
                }
            }
            for (key in o2) {
                if (!keySet.hasOwnProperty(key) && key.charAt(0) !== '$' && o2[key] !== undefined && !_.isFunction(o2[key])) { return false; }
            }
            return true;
        }
        return false;
    }

    csp = function () {
        if (isDefined(csp.isActive_)) { return csp.isActive_; }

        var active = !!(document.querySelector('[ng-csp]') || document.querySelector('[data-ng-csp]'));

        msos.console.debug('ng - csp -> requested: ' + active);

        if (!active) {
            try {
                /* jshint -W031, -W054 */
                new Function('');
                /* jshint +W031, +W054 */
            } catch (e) {
                active = true;
            }
        }

        csp.isActive_ = active;

        msos.console.debug('ng - csp -> set: ' + csp.isActive_);
        return csp.isActive_;
    };

    function concat(array1, array2, index) {
        return array1.concat(slice.call(array2, index));
    }

    function sliceArgs(args, startIndex) {
        return slice.call(args, startIndex || 0);
    }

    function startingTag(element) {
        element = jqLite(element).clone();
        try {
            element.empty();
        } catch (ignore) {}
        // As Per DOM Standards
        var elemHtml = jqLite('<div>').append(element).html();
        try {
            return element[0].nodeType === NODE_TYPE_TEXT ? lowercase(elemHtml) : elemHtml.match(/^(<[^>]+>)/)[1].replace(/^<([\w\-]+)/,
                    function (match, nodeName) {
                        return '<' + lowercase(nodeName);
                    }
                );
        } catch (e) {
            msos.console.warn('ng - startingTag -> failed:', e);
            return lowercase(elemHtml);
        }
    }

    function encodeUriQuery(val, pctEncodeSpaces) {
        return encodeURIComponent(val).
            replace(/%40/gi, '@').
            replace(/%3A/gi, ':').
            replace(/%24/g, '$').
            replace(/%2C/gi, ',').
            replace(/%3B/gi, ';').
            replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
    }

    function encodeUriSegment(val) {
        return encodeUriQuery(val, true).
            replace(/%26/gi, '&').
            replace(/%3D/gi, '=').
            replace(/%2B/gi, '+');
    }

    function toKeyValue(obj) {
        var parts = [];

        forEach(obj, function (value, key) {
            if (_.isArray(value)) {
                forEach(value, function (arrayValue) {
                    parts.push(encodeUriQuery(key, true) + (arrayValue === true ? '' : '=' + encodeUriQuery(arrayValue, true)));
                });
            } else {
                parts.push(encodeUriQuery(key, true) + (value === true ? '' : '=' + encodeUriQuery(value, true)));
            }
        });
        return parts.length ? parts.join('&') : '';
    }

    function snake_case(name, separator) {
        separator = separator || '_';

        if (_.isString(name)) {
            name = name.replace(SNAKE_CASE_REGEXP, function (letter, pos) { return (pos ? separator : '') + letter.toLowerCase(); });
        } else {
            msos.console.error('ng - snake_case -> not a string: ', name);
        }

        return name;
    }

    function JQLite(element) {

        if (element instanceof jQuery) {
            return element;
        }

        return jQuery(element);
    }

    JQLitePrototype = JQLite.prototype;

    function bindJQuery() {

        var originalCleanData,
            temp_bj = 'ng - bindJQuery -> ';

        msos.console.debug(temp_bj + 'start.');

        if (bindJQueryFired) {
            return;
        }

        if (jQuery && jQuery.fn.on) {

            jqLite = jQuery;

            extend(jQuery.fn, {
                scope: JQLitePrototype.scope,
                isolateScope: JQLitePrototype.isolateScope,
                controller: JQLitePrototype.controller,
                injector: JQLitePrototype.injector,
                inheritedData: JQLitePrototype.inheritedData
            });

            originalCleanData = jQuery.cleanData;

            jQuery.cleanData = function (elems) {
                var i = 0,
                    events;

                if (!skipDestroyOnNextJQueryCleanData) {
                    // must be "!=" and not "!==" null
                    for (i = 0; elems[i] != null; i += 1) {     // jshint ignore:line
                        events = jQuery._data(elems[i], "events");
                        if (events && events.$destroy) {
                            jQuery(elems[i]).triggerHandler('$destroy');
                        }
                    }
                } else {
                    skipDestroyOnNextJQueryCleanData = false;
                }
                originalCleanData(elems);
            };
        } else {
            msos.console.error(temp_bj + 'jQuery is missing!');
        }

        angular.element = jqLite;

        // Prevent double-proxying.
        bindJQueryFired = true;
    }

    function assertArg(arg, name, reason) {
        if (!arg) {
            throw ngMinErr('areq', "Argument '{0}' is {1}", (name || '?'), (reason || "required"));
        }
        return arg;
    }

    function assertArgFn(arg, name, acceptArrayAnnotation) {

        if (acceptArrayAnnotation && _.isArray(arg)) {
            arg = arg[arg.length - 1];
        }

        assertArg(_.isFunction(arg), name, 'not a function, is ' + (arg && typeof arg === 'object' ? arg.constructor.name || 'Object' : typeof arg));
        return arg;
    }

    function assertNotHasOwnProperty(name, context) {
        if (name === 'hasOwnProperty') {
            throw ngMinErr('badname', "hasOwnProperty is not a valid {0} name", context);
        }
    }

    function getter(obj, path, bindFnToScope) {

        if (!path) { return obj; }

        var keys = path.split('.') || [],
            key,
            lastInstance = obj,
            i = 0;

        for (i = 0; i < keys.length; i += 1) {
            key = keys[i];
            if (obj) {
                lastInstance = obj;
                obj = obj[key];
            }
        }

        if (!bindFnToScope && _.isFunction(obj)) {
            return _.bind(lastInstance, obj);
        }
        return obj;
    }

    function getBlockNodes(nodes) {

        var node = nodes[0],
            endNode = nodes[nodes.length - 1],
            blockNodes = [node];

        do {
            node = node.nextSibling;
            if (!node) { break; }
            blockNodes.push(node);
        } while (node !== endNode);

        return jqLite(blockNodes);
    }

    function createMap() {
        return Object.create(null);
    }

    function setupModuleLoader(window) {

        var temp_sm = 'ng - setupModuleLoader',
            angular_module = {};

        msos.console.debug(temp_sm + ' -> start.');

        function ensure(obj, name, factory) {
            var debug = 'exists';

            if (!obj[name]) {
                obj[name] = factory();
                debug = 'created';
            }

            msos.console.debug(temp_sm + ' - ensure -> ' + name + ', (' + debug + ')');

            return obj[name];
        }

        angular = ensure(window, 'angular', Object);

        // Store a list of angular.module() calls
        angular.modulelist = [];

        angular_module = ensure(angular, 'module', function () {

            var modules = {};

            return function module(name, requires, configFn) {
                var vb = msos.config.verbose;

                if (vb) {
                    msos.console.debug(temp_sm + ' - module -> start: ' + name);
                }

                angular.modulelist.push(name.replace(/\./g, '_'));

                assertNotHasOwnProperty(name, 'module');

                if (requires && modules.hasOwnProperty(name)) {
                    modules[name] = null;
                }

                if (vb) {
                    msos.console.debug(temp_sm + ' - module ->  done: ' + name);
                }

                return ensure(modules, name, function () {

                    if (vb) {
                        msos.console.debug(temp_sm + ' - module - factory -> start: ' + name);
                    }

                    if (!requires) {
                        throw $injectorMinErr('nomod', "Required module '{0}' is not available!", name);
                    }

                    var invokeQueue = [],
                        configBlocks = [],
                        runBlocks = [],
                        config,
                        moduleInstance = {};

                    function invokeLater(provider, method, insertMethod, queue) {
                        if (!queue) { queue = invokeQueue; }
                        return function () {
                            queue[insertMethod || 'push']([provider, method, arguments]);
                            return moduleInstance;
                        };
                    }

                    config = invokeLater('$injector', 'invoke', 'push', configBlocks);

                    moduleInstance = {
                        // Private state
                        _invokeQueue: invokeQueue,
                        _configBlocks: configBlocks,
                        _runBlocks: runBlocks,

                        requires: requires,
                        name: name,

                        provider:   invokeLater('$provide', 'provider'),
                        factory:    invokeLater('$provide', 'factory'),
                        service:    invokeLater('$provide', 'service'),
                        value:      invokeLater('$provide', 'value'),
                        constant:   invokeLater('$provide', 'constant', 'unshift'),
                        animation:  invokeLater('$animateProvider', 'register'),
                        filter:     invokeLater('$filterProvider', 'register'),
                        controller: invokeLater('$controllerProvider', 'register'),
                        directive:  invokeLater('$compileProvider', 'directive'),

                        config: config,

                        run: function (block) {
                            runBlocks.push(block);
                            return this;
                        }
                    };

                    if (configFn) { config(configFn); }

                    if (vb) {
                        msos.console.debug(temp_sm + ' - module - factory ->  done: ' + name);
                    }

                    return moduleInstance;
                });
            };
        });

        msos.console.debug(temp_sm + ' -> done!');

        return angular_module;
    }

    function camelCase(name) {
        if (_.isString(name)) {
            name = name.replace(
                    SPECIAL_CHARS_REGEXP,
                    function (underscore, separator, letter, offset) { return offset ? letter.toUpperCase() : letter; }
                ).replace(MOZ_HACK_REGEXP, 'Moz$1');
        } else {
            msos.console.error('ng - camelCase -> not a string:', name);
        }
        return name;
    }

    function jqLiteIsTextNode(html) {
        return !HTML_REGEXP.test(html);
    }

    function jqLiteClone(element) {
        return element.cloneNode(true);
    }

    function jqLiteRemoveClass(element, cssClasses) {
        if (cssClasses && element.setAttribute) {
            forEach(cssClasses.split(' '), function (cssClass) {
                element.setAttribute('class', trim(
                (" " + (element.getAttribute('class') || '') + " ").replace(/[\n\t]/g, " ").replace(" " + trim(cssClass) + " ", " ")));
            });
        }
    }

    function jqLiteAddClass(element, cssClasses) {
        if (cssClasses && element.setAttribute) {
            var existingClasses = (' ' + (element.getAttribute('class') || '') + ' ').replace(/[\n\t]/g, " ");

            forEach(cssClasses.split(' '), function (cssClass) {
                cssClass = trim(cssClass);
                if (existingClasses.indexOf(' ' + cssClass + ' ') === -1) {
                    existingClasses += cssClass + ' ';
                }
            });

            element.setAttribute('class', trim(existingClasses));
        }
    }

    function jqLiteAddNodes(root, elements) {

        if (root && elements) {

            if (elements.nodeType) {
                root.push(elements);
            } else {

                var lngth = elements.length,
                    i = 0;

                // if an Array or NodeList and not a Window
                if (typeof lngth === 'number' && elements.window !== elements) {
                    if (lngth) {
                        for (i = 0; i < lngth; i += 1) {
                            root.push(elements[i]);
                        }
                    }
                } else {
                    root.push(elements);
                }
            }
        } else {
            msos.console.warn('ng - jqLiteAddNodes -> missing input.');
        }
    }

    function jqLiteInheritedData(element, name, value) {

        if (element.nodeType === NODE_TYPE_DOCUMENT) {
            element = element.documentElement;
        }

        var names = _.isArray(name) ? name : [name],
            i = 0;

        while (element) {
            for (i = 0; i < names.length; i += 1) {
                value = jqLite.data(element, names[i]);
                if (value !== undefined) { return value; }
            }

            element = element.parentNode || (element.nodeType === NODE_TYPE_DOCUMENT_FRAGMENT && element.host);
        }

        return undefined;
    }

    function jqLiteController(element, name) {
        return jqLiteInheritedData(element, '$' + (name || 'ngController') + 'Controller');
    }

    forEach(['multiple', 'selected', 'checked', 'disabled', 'readOnly', 'required', 'open'], function (value) {
        BOOLEAN_ATTR[lowercase(value)] = value;
    });

    forEach(['input', 'select', 'option', 'textarea', 'button', 'form', 'details'], function (value) {
        BOOLEAN_ELEMENTS[value] = true;
    });

    function getBooleanAttrName(element, name) {
        // check dom last since we will most likely fail on name
        var booleanAttr = BOOLEAN_ATTR[name.toLowerCase()];

        // booleanAttr is here twice to minimize DOM access
        return booleanAttr && BOOLEAN_ELEMENTS[nodeName_(element)] && booleanAttr;
    }

    function getAliasedAttrName(element, name) {
        var nodeName = element.nodeName;
        return (nodeName === 'INPUT' || nodeName === 'TEXTAREA') && ALIASED_ATTR[name];
    }

    forEach({

        inheritedData: jqLiteInheritedData,

        scope: function (element) {
            return jqLite.data(element, '$scope') || jqLiteInheritedData(element.parentNode || element, ['$isolateScope', '$scope']);
        },

        isolateScope: function (element) {
            return jqLite.data(element, '$isolateScope') || jqLite.data(element, '$isolateScopeNoTemplate');
        },

        controller: jqLiteController,

        injector: function (element) {
            return jqLiteInheritedData(element, '$injector');
        }

    }, function (fn, name) {

        JQLite.prototype[name] = function (arg1, arg2) {
            var i = 0,
                j = 0,
                jj,
                key,
                nodeCount = this.length,
                value,
                nodeValue;

            if (((fn.length === 2 && fn !== jqLiteController) ? arg1 : arg2) === undefined) {

                if (_.isObject(arg1)) {

                    for (i = 0; i < nodeCount; i += 1) {
                        for (key in arg1) {
                            fn(this[i], key, arg1[key]);
                        }
                    }

                    return this;
                }

                value = fn.$dv;
                jj = (value === undefined) ? Math.min(nodeCount, 1) : nodeCount;

                // Only if we have $dv do we iterate over all, otherwise it is just the first element.
                for (j = 0; j < jj; j += 1) {
                    nodeValue = fn(this[j], arg1, arg2);
                    value = value ? value + nodeValue : nodeValue;
                }

                return value;
            }

            for (i = 0; i < nodeCount; i += 1) {
                fn(this[i], arg1, arg2);
            }

            return this;
        };
    });

    forEach({

        clone: jqLiteClone

    }, function (fn, name) {

        JQLite.prototype[name] = function (arg1, arg2, arg3) {
            var value,
                i = 0;

            for (i = 0; i < this.length; i += 1) {
                if (_.isUndefined(value)) {
                    value = fn(this[i], arg1, arg2, arg3);
                    if (isDefined(value)) {
                        // any function which returns a value needs to be wrapped
                        value = jqLite(value);
                    }
                } else {
                    jqLiteAddNodes(value, fn(this[i], arg1, arg2, arg3));
                }
            }
            return isDefined(value) ? value : this;
        };

    });

    function hashKey(obj, nextUidFn) {
        var key = obj && obj.$$hashKey,
            objType;

        if (key) {
            if (typeof key === 'function') {
                key = obj.$$hashKey();
            }
            return key;
        }

        objType = typeof obj;

        if (objType === 'function' || (objType === 'object' && obj !== null)) {
            key = obj.$$hashKey = objType + ':' + (nextUidFn || nextUid)();
        } else {
            key = objType + ':' + obj;
        }

        return key;
    }

    function HashMap(array, isolatedUid) {
        if (isolatedUid) {
            var iso_uid = 0;
            this.nextUid = function () {
                iso_uid += 1;
                return iso_uid;
            };
        }
        forEach(array, this.put, this);
    }

    HashMap.prototype = {

        put: function (key, value) {
            this[hashKey(key, this.nextUid)] = value;
        },

        get: function (key) {
            return this[hashKey(key, this.nextUid)];
        },

        remove: function (key) {
            key = hashKey(key, this.nextUid);
            var value = this[key];
            delete this[key];
            return value;
        }
    };

    function anonFn(fn) {
        var fnText = fn.toString().replace(STRIP_COMMENTS, ''),
            args = fnText.match(FN_ARGS);

        if (args) {
            return 'function(' + (args[1] || '').replace(/[\s\r\n]+/, ' ') + ')';
        }
        return 'fn';
    }

    function annotate(fn, strictDi, name) {
        var temp_a = 'ng - annotate -> ',
            debug = '',
            $inject,
            fnText,
            argDecl,
            last;

        if (msos.config.verbose === 'annotate') {
            msos.console.debug(temp_a + 'start.');
        }

        if (typeof fn === 'function') {
            debug = 'function';
            $inject = fn.$inject;
            if (!$inject) {
                $inject = [];
                if (fn.length) {
                    if (strictDi) {
                        if (!_.isString(name) || !name) {
                            name = fn.name || anonFn(fn);
                        }
                        throw $injectorMinErr(
                            'strictdi',
                            '{0} is not using explicit annotation and cannot be invoked in strict mode',
                            name
                        );
                    }
                    fnText = fn.toString().replace(STRIP_COMMENTS, '');
                    argDecl = fnText.match(FN_ARGS);
                    forEach(
                        argDecl[1].split(FN_ARG_SPLIT),
                        function (arg) {
                            arg.replace(
                                FN_ARG,
                                function (all, underscore, name) {
                                    $inject.push(name);
                                }
                            );
                        }
                    );
                }
                fn.$inject = $inject;
            }
        } else if (_.isArray(fn)) {
            debug = 'array';
            last = fn.length - 1;
            assertArgFn(fn[last], 'fn');
            $inject = fn.slice(0, last);
        } else {
            debug = 'unknown';
            assertArgFn(fn, 'fn', true);
        }

        if (msos.config.verbose === 'annotate') {
            msos.console.debug(temp_a + 'done, for ' + debug + (name ? ', name: ' + name : ''));
        }
        return $inject;
    }

    function createInjector(modulesToLoad, strictDi) {

        strictDi = (strictDi === true);

        var temp_ci = 'ng - createInjector',
            vb = msos.config.verbose,
            INSTANTIATING = {},
            providerSuffix = 'Provider',
            path = [],
            loadedModules = new HashMap([], true),
            providerCache = {},
            instanceCache = {},
            providerInjector = null,
            instanceInjector = null;

        msos.console.info(temp_ci + ' ===> start:', modulesToLoad);

        ////////////////////////////////////
        // $provider
        ////////////////////////////////////
        function supportObject(delegate) {
            return function (key, value) {
                if (_.isObject(key)) {
                    forEach(key, reverseParams(delegate));
                } else {
                    return delegate(key, value);
                }
                return undefined;
            };
        }

        function provider(name, provider_input) {

            var db_out = name + ', ' + name + providerSuffix;

            if (vb) {
                msos.console.debug(temp_ci + ' - provider -> start: ' + db_out);
            }

            assertNotHasOwnProperty(name, 'service');

            if (_.isFunction(provider_input) || _.isArray(provider_input)) {
                provider_input = providerInjector.instantiate(provider_input);
            }

            if (!provider_input.$get) {
                throw $injectorMinErr('pget', "Provider '{0}' must define $get factory method.", name);
            }

            if (vb) {
                msos.console.debug(temp_ci + ' - provider ->  done: ' + db_out);
            }

            // Cache the current provider
            providerCache[name + providerSuffix] = provider_input;

            return provider_input;
        }

        function enforceReturnValue(name, factory) {
            return function enforcedReturnValue() {
                var result = instanceInjector.invoke(factory, this);
                    if (_.isUndefined(result)) {
                        throw $injectorMinErr(
                            'undef',
                            "Provider '{0}' must return a value from $get factory method.",
                            name
                        );
                    }
                return result;
            };
        }

        function factory(name, factoryFn, enforce) {
            return provider(
                name,
                {
                    $get: enforce !== false ? enforceReturnValue(name, factoryFn) : factoryFn
                }
            );
        }

        function service(name, constructor) {
            if (vb) {
                msos.console.debug(temp_ci + ' - service -> called: ' + name);
            }
            return factory(name, ['$injector', function ($injector) {
                return $injector.instantiate(constructor);
            }]);
        }

        function value(name, val) {
            return factory(name, valueFn(val), false);
        }

        function constant(name, value) {
            assertNotHasOwnProperty(name, 'constant');
            providerCache[name] = value;
            instanceCache[name] = value;
        }


        function decorator(serviceName, decorFn) {
            if (vb) {
                msos.console.debug(temp_ci + ' - decorator -> called: ' + serviceName + providerSuffix);
            }
            var origProvider = providerInjector.get(serviceName + providerSuffix),
                orig$get = origProvider.$get;

            origProvider.$get = function () {
                var origInstance = instanceInjector.invoke(orig$get, origProvider);
                return instanceInjector.invoke(decorFn, null, {
                    $delegate: origInstance
                });
            };
        }

        providerCache = {
            $provide: {
                provider: supportObject(provider),
                factory: supportObject(factory),
                service: supportObject(service),
                value: supportObject(value),
                constant: supportObject(constant),
                decorator: decorator
            }
        };

        ////////////////////////////////////
        // internal Injector
        ////////////////////////////////////
        function createInternalInjector(cache, factory) {
            var temp_cii = ' - createInternalInjector';

            if (vb === 'injector') {
                msos.console.debug(temp_ci + temp_cii + ' -> start.');
            }

            function getService(serviceName, caller) {

                if (vb === 'injector') {
                    msos.console.debug(temp_ci + temp_cii + ' - getService -> ' + serviceName + (caller ? ', caller: ' + caller : ''));
                }

                if (cache.hasOwnProperty(serviceName)) {
                    if (cache[serviceName] === INSTANTIATING) {
                        throw $injectorMinErr('cdep', 'Circular dependency found: {0}', serviceName + ' <- ' + path.join(' <- '));
                    }
                    return cache[serviceName];
                }

                try {
                    path.unshift(serviceName);
                    cache[serviceName] = INSTANTIATING;
                    cache[serviceName] = factory(serviceName, caller);
                    return cache[serviceName];
                } catch (err) {
                    if (cache[serviceName] === INSTANTIATING) {
                        delete cache[serviceName];
                    }
                    throw err;
                } finally {
                    path.shift();
                }
            }

            function invoke(fn, self, locals, serviceName) {

                if (vb === 'injector') {
                    msos.console.debug(temp_ci + temp_cii + ' - invoke -> start' + (serviceName ? ': ' + serviceName : '.'));
                }

                if (typeof locals === 'string') {
                    serviceName = locals;
                    locals = null;
                }

                var args = [],
                    $inject = createInjector.$$annotate(fn, strictDi, serviceName) || [],
                    length,
                    i = 0,
                    key,
                    debug = [];

                if (_.isArray($inject)) {
                    for (i = 0, length = $inject.length; i < length; i += 1) {
                        key = $inject[i];

                        if (typeof key !== 'string') {
                            throw $injectorMinErr(
                                'itkn',
                                'Incorrect injection token! Expected service name as string, got {0}',
                                key
                            );
                        }

                        debug.push(key);

                        args.push(locals && locals.hasOwnProperty(key)
                            ? locals[key]
                            : getService(key, serviceName)
                        );
                    }
                } else {
                    msos.console.error(temp_ci + temp_cii + ' - invoke -> $inject not an array.');
                }

                if (_.isArray(fn)) {
                    fn = fn[length];
                }

                if (vb === 'injector') {
                    msos.console.debug(temp_ci + temp_cii + ' - invoke -> done:', debug);
                }

                return fn.apply(self, args);
            }

            function instantiate(Type, locals, serviceName) {
                var instance = Object.create((_.isArray(Type) ? Type[Type.length - 1] : Type).prototype || null),
                    returnedValue = invoke(Type, instance, locals, serviceName);

                if (vb === 'injector') {
                    msos.console.debug(temp_ci + temp_cii + ' - instantiate -> called.');
                }

                return _.isObject(returnedValue) || _.isFunction(returnedValue) ? returnedValue : instance;
            }

            if (vb === 'injector') {
                msos.console.debug(temp_ci + ' - createInternalInjector ->  done!');
            }

            return {
                invoke: invoke,
                instantiate: instantiate,
                get: getService,
                annotate: createInjector.$$annotate,
                has: function (name) {
                    return providerCache.hasOwnProperty(name + providerSuffix) || cache.hasOwnProperty(name);
                }
            };
        }

        if (vb) {
            msos.console.debug(temp_ci + ' ===> create providerInjector.');
        }

        providerCache.$injector = createInternalInjector(
            providerCache,
            function (serviceName, caller) {
                if (_.isString(caller)) { path.push(caller); }
                throw $injectorMinErr(
                    'unpr',
                    "Unknown provider: {0}", path.join(' <- ')
                );
            }
        );

        providerInjector = providerCache.$injector;

        if (vb) {
            msos.console.debug(temp_ci + ' ===> create instanceInjector.');
        }

        instanceCache.$injector = createInternalInjector(
            instanceCache,
            function (serviceName, caller) {
                var provid_inject = providerInjector.get(serviceName + providerSuffix, caller);

                return instanceInjector.invoke(provid_inject.$get, provid_inject, undefined, serviceName);
            }
        );

        instanceInjector = instanceCache.$injector;

        ////////////////////////////////////
        // Module Loading
        ////////////////////////////////////
        function loadModules(modulesToLoad) {

            var temp_lm = ' - loadModules -> ',
                debug_note = [],
                runBlocks = [],
                moduleFn;

            msos.console.debug(temp_ci + temp_lm + 'start:', modulesToLoad);

            if (!_.isArray(modulesToLoad)) {
                msos.console.warn(temp_ci + temp_lm + ' done: input not array!', modulesToLoad);
                return runBlocks;
            }

            if (modulesToLoad.length === 0) {
                msos.console.debug(temp_ci + temp_lm + ' done:', modulesToLoad);
                return runBlocks;
            }

            function runInvokeQueue(queue) {
                var i = 0,
                    invokeArgs,
                    riq_provider;

                for (i = 0; i < queue.length; i += 1) {
                    invokeArgs = queue[i];

                    riq_provider = providerInjector.get(invokeArgs[0]);
                    riq_provider[invokeArgs[1]].apply(riq_provider, invokeArgs[2]);
                }
            }

            forEach(
                modulesToLoad,
                function (module) {

                    if (!loadedModules.get(module)) {

                        loadedModules.put(module, true);

                        try {
                            if (_.isString(module)) {
                                debug_note.push('is string (' + module + ')');
                                moduleFn = angularModule(module);
                                runBlocks = runBlocks.concat(loadModules(moduleFn.requires)).concat(moduleFn._runBlocks);
                                runInvokeQueue(moduleFn._invokeQueue);
                                runInvokeQueue(moduleFn._configBlocks);
                            } else if (_.isFunction(module)) {
                                debug_note.push('is function (' + module + ')');
                                runBlocks.push(providerInjector.invoke(module));
                            } else if (_.isArray(module)) {
                                debug_note.push('is array (' + module[0] + ')');
                                runBlocks.push(providerInjector.invoke(module));
                            } else {
                                debug_note.push('is arg function (' + module + ')');
                                assertArgFn(module, 'module');
                            }

                        } catch (e) {

                            if (_.isArray(module)) {
                                module = module[module.length - 1];
                            }

                            debug_note.push('error: ' + module);
                        }

                    } else {

                        debug_note.push('already loaded (' + module + ')');
                    }
                }
            );

            msos.console.debug(temp_ci + temp_lm + ' done:', modulesToLoad, debug_note);

            return runBlocks;
        }

        if (vb) {
            msos.console.debug(temp_ci + ' ===> run instanceInjector.invoke.');
        }

        forEach(
            loadModules(modulesToLoad),
            function (fn) {
                instanceInjector.invoke(fn || noop);
            }
        );

        msos.console.info(temp_ci + ' ===> done!');

        return instanceInjector;
    }

    createInjector.$$annotate = annotate;

    function bootstrap(element, modules, config) {

        if (!_.isObject(config)) { config = {}; }

        var defaultConfig = {
                strictDi: false
            },
            temp_b = 'ng - bootstrap',
            doBootstrap = null,
            NG_ENABLE_DEBUG_INFO = /^NG_ENABLE_DEBUG_INFO!/,
            bs_injector;

        config = extend(defaultConfig, config);

        msos.console.debug(temp_b + ' -> start, config:', config);

        doBootstrap = function () {

            var temp_db = ' - doBootstrap',
                tag = '',
                injector = null;

            element = jqLite(element);

            tag = (element[0] === document) ? 'document' : startingTag(element);

            msos.console.debug(temp_b + temp_db + ' -> start, attached to: ' + tag);

            if (element.injector()) {
                throw ngMinErr(
                    'btstrpd',
                    "App Already Bootstrapped to '{0}'",
                    tag.replace(/</, '&lt;').replace(/>/, '&gt;')
                );
            }

            modules = modules || [];
            modules.unshift(['$provide', function ($provide) {
                $provide.value('$rootElement', element);
            }]);

            if (config.debugInfoEnabled) {
                // Pushing so that this overrides `debugInfoEnabled` setting defined in user's `modules`.
                modules.push(
                    [
                        '$compileProvider',
                        function ($compileProvider) {
                            $compileProvider.debugInfoEnabled(true);
                        }
                    ]
                );
            }

            modules.unshift('ng');

            injector = createInjector(modules, config.strictDi);

            injector.invoke(
            ['$rootScope', '$rootElement', '$compile', '$injector', function bootstrapApply(scope, element, compile, injector) {
                msos.console.info(temp_b + temp_db + ' - bootstrapApply -> start, node: ' + nodeName_(element) + (element[0].id ? '#' + element[0].id : ''));

                scope.$apply(
                    function () {
                        element.data('$injector', injector);
                        compile(element)(scope);
                    }
                );

                msos.console.info(temp_b + temp_db + ' - bootstrapApply -> done!');
            }]);

            msos.console.debug(temp_b + ' - doBootstrap -> done!');
            return injector;
        };

        if (window && NG_ENABLE_DEBUG_INFO.test(window.name)) {
            config.debugInfoEnabled = true;
            window.name = window.name.replace(NG_ENABLE_DEBUG_INFO, '');
        }

        bs_injector = doBootstrap();

        msos.console.debug(temp_b + ' -> done!');
        return bs_injector;
    }

    function reloadWithDebugInfo() {
        window.name = 'NG_ENABLE_DEBUG_INFO!' + window.name;
        window.location.reload();
    }

    function getTestability(rootElement) {
        var injector = angular.element(rootElement).injector();

        if (!injector) {
            throw ngMinErr(
                'test',
                'no injector found for element argument to getTestability'
            );
        }
        return injector.get('$$testability');
    }

    function $AnchorScrollProvider() {

        var autoScrollingEnabled = true;

        this.disableAutoScrolling = function () {
            autoScrollingEnabled = false;
        };

        this.$get = ['$window', '$location', '$rootScope', function ($window, $location, $rootScope) {

            function getFirstAnchor(list) {
                var result = null;

                Array.prototype.some.call(
                    list,
                    function (element) {
                        if (nodeName_(element) === 'a') {
                            result = element;
                            return true;
                        }
                        return false;
                    }
                );
                return result;
            }

            function scroll() {
                var ng_win_doc = $window.document,
                    hash = $location.hash(),
                    elm;

                msos.console.debug('ng - $AnchorScrollProvider - scroll -> called, hash: ' + (hash || 'na'));

                function getYOffset() {

                    var offset = scroll.yOffset,
                        elem,
                        style;

                    if (_.isFunction(offset)) {
                        offset = offset();
                    } else if (isElement(offset)) {
                        elem = offset[0];
                        style = $window.getComputedStyle(elem);

                        if (style.position !== 'fixed') {
                            offset = 0;
                        } else {
                            offset = elem.getBoundingClientRect().bottom;
                        }
                    } else if (!_.isNumber(offset)) {
                        offset = 0;
                    }

                    return offset;
                }

                function scrollTo(elem) {
                    var offset,
                        elemTop;

                    if (elem) {
                        elem.scrollIntoView();

                        offset = getYOffset();

                        if (offset) {
                            elemTop = elem.getBoundingClientRect().top;
                            $window.scrollBy(0, elemTop - offset);
                        }

                    } else {
                        $window.scrollTo(0, 0);
                    }
                }

                // Start scroll execution

                if (!hash || hash === 'top') {
                    scrollTo(null);
                    return;
                }

                elm = ng_win_doc.getElementById(hash) || getFirstAnchor(document.getElementsByName(hash));

                if (elm) { scrollTo(elm); }
            }

            scroll.prototype.yOffset = 0;

            if (autoScrollingEnabled) {
                $rootScope.$watch(
                    function autoScrollWatch() {
                        return $location.hash();
                    },
                    function autoScrollWatchAction(newVal, oldVal) {
                        // skip the initial scroll if $location.hash is empty
                        if (newVal === oldVal && newVal === '') { return; }

                        // Since we only "bootstrap" after page load,
                        // we don't need the "jqLiteDocumentLoaded" stuff
                        $rootScope.$evalAsync(scroll, { directive_name: 'AnchorScrollProvider' });
                    }
                );
            }

            return scroll;
        }];
    }

    $animateMinErr = minErr('$animate');

    $AnimateProvider = ['$provide', function ($provide) {

        this.$$selectors = {};

        this.register = function (name, factory) {
            var key = name + '-animation';
            if (name && name.charAt(0) !== '.') {
                throw $animateMinErr('notcsel', "Expecting class selector starting with '.' got '{0}'.", name);
            }
            this.$$selectors[name.substr(1)] = key;
            $provide.factory(key, factory);
        };

        this.classNameFilter = function (expression) {
            if (arguments.length === 1) {
                this.$$classNameFilter = (expression instanceof RegExp) ? expression : null;
            }
            return this.$$classNameFilter;
        };

        this.$get = ['$$q', '$$asyncCallback', '$rootScope', function($$q, $$asyncCallback, $rootScope) {

            var currentDefer;

            function runAnimationPostDigest(fn) {
                var cancelFn,
                    defer = $$q.defer('runAnimationPostDigest');

                defer.promise.$$cancelFn = function ngAnimateMaybeCancel() {
                    if (cancelFn) {
                        cancelFn();
                    }
                };

                $rootScope.$$postDigest(
                    function ngAnimatePostDigest() {
                        cancelFn = fn(
                            function ngAnimateNotifyComplete() {
                                defer.resolve();
                            }
                        );
                    }
                );

                return defer.promise;
            }

            function resolveElementClasses(element, classes) {
                var toAdd = [],
                    toRemove = [],
                    hasClasses = createMap();

                forEach(
                    (element.attr('class') || '').split(/\s+/),
                    function (className) {
                        hasClasses[className] = true;
                    }
                );

                forEach(
                    classes,
                    function (status, className) {
                        var hasClass = hasClasses[className];

                        if (status === false && hasClass) {
                            toRemove.push(className);
                        } else if (status === true && !hasClass) {
                            toAdd.push(className);
                        }
                    }
                );

                return (toAdd.length + toRemove.length) > 0 && [toAdd.length ? toAdd : null, toRemove.length ? toRemove : null];
            }

            function cachedClassManipulation(cache, classes, op) {
                var i = 0,
                    className;

                for (i = 0; i < classes.length; i += 1) {
                    className = classes[i];
                    cache[className] = op;
                }
            }

            function asyncPromise() {
                // only serve one instance of a promise in order to save CPU cycles
                if (!currentDefer) {
                    currentDefer = $$q.defer('asyncPromise');
                    $$asyncCallback(
                        function () {
                            currentDefer.resolve();
                            currentDefer = null;
                        }
                    );
                }

                return currentDefer.promise;
            }

            function applyStyles(element, options) {
                if (_.isObject(options)) {
                    var styles = extend(options.from || {}, options.to || {});
                    element.css(styles);
                }
            }

            return {
                animate: function (element, from, to) {
                    applyStyles(element, { from: from, to: to });
                    return asyncPromise();
                },

                enter: function (element, parent, after, options) {
                    applyStyles(element, options);

                    if (after)  { after.after(element); }
                    else        { parent.prepend(element); }

                    return asyncPromise();
                },

                leave: function (element, options) {
                    element.remove();
                    return asyncPromise();
                },

                move: function (element, parent, after, options) {
                    return this.enter(element, parent, after, options);
                },

                addClass: function(element, className, options) {
                    return this.setClass(element, className, [], options);
                },

                $$addClassImmediately: function(element, className, options) {
                    element = jqLite(element);
                    className = !_.isString(className)
                        ? (_.isArray(className) ? className.join(' ') : '')
                        : className;

                    forEach(
                        element,
                        function (element) {
                            jqLiteAddClass(element, className);
                        }
                    );

                    applyStyles(element, options);
                    return asyncPromise();
                },

                removeClass: function (element, className, options) {
                    return this.setClass(element, [], className, options);
                },

                $$removeClassImmediately: function (element, className, options) {
                    element = jqLite(element);
                    className = !_.isString(className)
                        ? (_.isArray(className) ? className.join(' ') : '')
                        : className;

                    forEach(
                        element,
                        function (element) {
                            jqLiteRemoveClass(element, className);
                        }
                    );

                    applyStyles(element, options);
                    return asyncPromise();
                },

                setClass: function (element, add, remove, options) {
                    var self = this,
                        STORAGE_KEY = '$$animateClasses',
                        createdCache = false,
                        cache,
                        classes;

                    element = jqLite(element);

                    cache = element.data(STORAGE_KEY);

                    if (!cache) {
                        cache = {
                            classes: {},
                            options: options
                        };
                        createdCache = true;
                    } else if (options && cache.options) {
                        cache.options = extend(cache.options || {}, options);
                    }

                    classes = cache.classes;
    
                    add = _.isArray(add) ? add : add.split(' ');
                    remove = _.isArray(remove) ? remove : remove.split(' ');
                    cachedClassManipulation(classes, add, true);
                    cachedClassManipulation(classes, remove, false);

                    if (createdCache) {
                        cache.promise = runAnimationPostDigest(
                            function (done) {
                                var cache_pd = element.data(STORAGE_KEY),
                                    classes_pd;
    
                                element.removeData(STORAGE_KEY);
    
                                if (cache_pd) {
                                    classes_pd = resolveElementClasses(element, cache_pd.classes);
                                    if (classes_pd) {
                                        self.$$setClassImmediately(element, classes_pd[0], classes_pd[1], cache_pd.options);
                                    }
                                }
    
                                done();
                            }
                        );
                        element.data(STORAGE_KEY, cache);
                    }

                    return cache.promise;
                },

                $$setClassImmediately: function (element, add, remove, options) {
                    if (add)    { this.$$addClassImmediately(element, add); }
                    if (remove) { this.$$removeClassImmediately(element, remove); }

                    applyStyles(element, options);
                    return asyncPromise();
                },

                enabled: noop,
                cancel: noop
            };
        }];
    }];

    function $$AsyncCallbackProvider() {
        this.$get = ['$$rAF', '$timeout', function ($$rAF, $timeout) {
            return $$rAF.supported ?
            function (fn) {
                return $$rAF(fn);
            } : function (fn) {
                return $timeout(fn, 0, false);
            };
        }];
    }

    function stripHash(url) {
        var index = url.indexOf('#');
        return index === -1 ? url : url.substr(0, index);
    }

    function trimEmptyHash(url) {
        return url.replace(/(#.+)|#$/, '$1');
    }

    function Browser(window, document, $log) {
        var temp_br = 'ng - Browser',
            self = this,
            rawDocument = document[0],
            location = window.location,
            history = window.history,
            setTimeout = window.setTimeout,
            clearTimeout = window.clearTimeout,
            pendingDeferIds = {},
            outstandingRequestCount = 0,
            outstandingRequestCallbacks = [],
            pollFns = [],
            pollTimeout,
            lastBrowserUrl = location.href,
            urlChangeListeners = [],
            urlChangeInit = false,
            lastCookies = {},
            lastCookieString = '',
            reloadLocation = null,
            sameState,
            sameBase,
            cachedState,
            lastCachedState = null,
            lastHistoryState;

        self.isMock = false;

        function completeOutstandingRequest(fn) {
            try {
                fn.apply(null, sliceArgs(arguments, 1));
            } finally {
                outstandingRequestCount -= 1;
                if (outstandingRequestCallbacks
                 && outstandingRequestCount === 0) {
                    while (outstandingRequestCallbacks.length) {
                        try {
                            outstandingRequestCallbacks.pop()();
                        } catch (e) {
                            $log.error(e);
                        }
                    }
                }
            }
        }

        function getHash(url) {
            var index = url.indexOf('#');

            return index === -1 ? '' : url.substr(index + 1);
        }

        self.$$completeOutstandingRequest = completeOutstandingRequest;
        self.$$incOutstandingRequestCount = function () {
            outstandingRequestCount += 1;
        };

        self.notifyWhenNoOutstandingRequests = function (callback) {

            forEach(
                pollFns,
                function (pollFn) { pollFn(); }
            );

            if (outstandingRequestCount === 0) {
                callback();
            } else {
                outstandingRequestCallbacks.push(callback);
            }
        };

        //////////////////////////////////////////////////////////////
        // Poll Watcher API
        //////////////////////////////////////////////////////////////

        function startPoller(interval, setTimeout) {
            (function check() {
                forEach(
                    pollFns,
                    function (pollFn) { pollFn(); });
                    pollTimeout = setTimeout(check, interval);
            }());
        }

        self.addPollFn = function (fn) {
            if (_.isUndefined(pollTimeout)) { startPoller(100, setTimeout); }
            pollFns.push(fn);
            return fn;
        };

        //////////////////////////////////////////////////////////////
        // URL API
        //////////////////////////////////////////////////////////////

        function cacheState() {
            // This should be the only place in $browser where `history.state` is read.
            cachedState = window.history.state;
            cachedState = _.isUndefined(cachedState) ? null : cachedState;

            // Prevent callbacks fo fire twice if both hashchange & popstate were fired.
            if (equals(cachedState, lastCachedState)) {
                cachedState = lastCachedState;
            }

            lastCachedState = cachedState;
        }

        cacheState();
        lastHistoryState = cachedState;

        self.url = function (url, replace, state) {
            var out_url;

            if (_.isUndefined(state)) { state = null; }

            // Android Browser BFCache causes location, history reference to become stale.
            if (location !== window.location) { location = window.location; }
            if (history  !== window.history)  { history  = window.history; }

            msos.console.debug(temp_br + ' - url -> ' + (url ? 'setter: ' + url : 'getter') + ', start');

            // setter
            if (url) {
                sameState = lastHistoryState === state;

                if (lastBrowserUrl === url && (!Modernizr.history || sameState)) {
                    msos.console.debug(temp_br + ' - url -> done, no change!');
                    return self;
                }

                sameBase = lastBrowserUrl && stripHash(lastBrowserUrl) === stripHash(url);

                lastBrowserUrl = url;
                lastHistoryState = state;

                if (Modernizr.history && (!sameBase || !sameState)) {
                    history[replace ? 'replaceState' : 'pushState'](state, '', url);
                    cacheState();
                    // Do the assignment again so that those two variables are referentially identical.
                    lastHistoryState = cachedState;
                } else {
                    if (!sameBase) {
                        reloadLocation = url;
                    }

                    if (replace) {
                        msos.console.debug(temp_br + ' - url -> setter done, replace url: ' + url);

                        location.replace(url);
                    } else if (!sameBase) {
                        if (msos.config.debug) {
                            alert(temp_br + ' - url -> setter done, not same base: ' + url);
                        }

                        location.href = url;
                    } else {

                        location.hash = getHash(url);
                    }
                }

                msos.console.debug(temp_br + ' - url -> setter done!');
                return self;
            }

            out_url = reloadLocation || window.location.href.replace(/%27/g,"'");

            msos.console.debug(temp_br + ' - url -> getter done, url: ' + out_url);
            return out_url;
        };

        self.state = function() {
            return cachedState;
        };

        function fireUrlChange() {

            if (lastBrowserUrl === self.url() && lastHistoryState === cachedState) {
                msos.console.debug(temp_br + ' - fireUrlChange -> no change!');
                return;
            }

            lastBrowserUrl = self.url();
            lastHistoryState = cachedState;

            forEach(
                urlChangeListeners,
                function (listener) {
                    listener(self.url(), cachedState);
                }
            );
        }

        function cacheStateAndFireUrlChange() {
            cacheState();
            fireUrlChange();
        }

        self.onUrlChange = function (callback) {

            if (!urlChangeInit) {
                // html5 history api - popstate event
                if (Modernizr.history) {
                    jqLite(window).on('popstate', cacheStateAndFireUrlChange);
                }
                // hashchange event
                jqLite(window).on('hashchange', cacheStateAndFireUrlChange);

                urlChangeInit = true;
            }

            urlChangeListeners.push(callback);
            return callback;
        };

        self.$$checkUrlChange = fireUrlChange;


        //////////////////////////////////////////////////////////////
        // Cookies API
        //////////////////////////////////////////////////////////////

        function safeDecodeURIComponent(str) {
            try {
                return decodeURIComponent(str);
            } catch (e) {
                return str;
            }
        }

        self.cookies = function (name, value) {
            var cookieLength,
                cookieArray,
                cookie,
                i = 0,
                index;

            if (name) {
                if (value === undefined) {
                    rawDocument.cookie = encodeURIComponent(name) + "=;path=" + baseHref + ";expires=Thu, 01 Jan 1970 00:00:00 GMT";
                } else {
                    if (_.isString(value)) {
                        rawDocument.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + ';path=' + baseHref;
                        cookieLength = rawDocument.cookie.length + 1;

                        if (cookieLength > 4096) {
                            $log.warn("Cookie '" + name + "' possibly not set or overflowed because it was too large (" + cookieLength + " > 4096 bytes)!");
                        }
                    }
                }
                return undefined;
            }

            if (rawDocument.cookie !== lastCookieString) {
                lastCookieString = rawDocument.cookie;
                cookieArray = lastCookieString.split("; ");
                lastCookies = {};

                for (i = 0; i < cookieArray.length; i += 1) {
                    cookie = cookieArray[i];
                    index = cookie.indexOf('=');
                    if (index > 0) { //ignore nameless cookies
                        name = safeDecodeURIComponent(cookie.substring(0, index));

                        if (lastCookies[name] === undefined) {
                            lastCookies[name] = safeDecodeURIComponent(cookie.substring(index + 1));
                        }
                    }
                }
            }
            return lastCookies;
        };

        self.defer = function (fn, delay) {
            var timeoutId;

            msos.console.debug(temp_br + ' - defer -> start, delay: ' + delay);

            outstandingRequestCount += 1;

            timeoutId = setTimeout(
                function () {
                    delete pendingDeferIds[timeoutId];
                    completeOutstandingRequest(fn);
                },
                delay || 0
            );

            pendingDeferIds[timeoutId] = true;

            msos.console.debug(temp_br + ' - defer -> done, outstanding requests: ' + outstandingRequestCount);

            return timeoutId;
        };

        self.defer.cancel = function (deferId) {
            if (pendingDeferIds[deferId]) {
                delete pendingDeferIds[deferId];
                clearTimeout(deferId);
                completeOutstandingRequest(noop);
                return true;
            }
            return false;
        };
    }

    function $BrowserProvider() {
        this.$get = ['$window', '$log', '$document',
            function ($window, $log, $document) {
                return new Browser($window, $document, $log);
            }
        ];
    }

    function $CacheFactoryProvider() {

        this.$get = function () {
            var caches = {};

            function cacheFactory(cacheId, options) {

                if (caches.hasOwnProperty(cacheId)) {
                    throw minErr('$cacheFactory')('iid', "CacheId '{0}' is already taken!", cacheId);
                }

                var cfp_size = 0,
                    stats = extend({}, options, {
                        id: cacheId
                    }),
                    data = {},
                    capacity = (options && options.capacity) || Number.MAX_VALUE,
                    lruHash = {},
                    freshEnd = null,
                    staleEnd = null;

                function link(nextEntry, prevEntry) {
                    if (nextEntry !== prevEntry) {
                        if (nextEntry) { nextEntry.p = prevEntry; }     //p stands for previous, 'prev' didn't minify
                        if (prevEntry) { prevEntry.n = nextEntry; }     //n stands for next, 'next' didn't minify
                    }
                }

                function refresh(entry) {
                    if (entry !== freshEnd) {
                        if (!staleEnd) {
                            staleEnd = entry;
                        } else if (staleEnd === entry) {
                            staleEnd = entry.n;
                        }

                        link(entry.n, entry.p);
                        link(entry, freshEnd);
                        freshEnd = entry;
                        freshEnd.n = null;
                    }
                }

                caches[cacheId] = {

                    put: function (key, value) {
                        var lruEntry;

                        if (capacity < Number.MAX_VALUE) {
                            if (lruHash[key]) {
                                lruEntry = lruHash[key];
                            } else {
                                lruHash[key] = { key: key };
                                lruEntry = lruHash[key];
                            }
                            refresh(lruEntry);
                        }

                        if (_.isUndefined(value)) { return undefined; }
                        if (!data.hasOwnProperty(key)) { cfp_size += 1; }

                        data[key] = value;

                        if (cfp_size > capacity) {
                            this.remove(staleEnd.key);
                        }

                        return value;
                    },

                    get: function (key) {
                        if (capacity < Number.MAX_VALUE) {
                            var lruEntry = lruHash[key];

                            if (!lruEntry) { return undefined; }

                            refresh(lruEntry);
                        }

                        return data[key];
                    },

                    remove: function (key) {
                        if (capacity < Number.MAX_VALUE) {
                            var lruEntry = lruHash[key];

                            if (!lruEntry) { return; }

                            // Should these be '===' instead of '==' ?
                            if (lruEntry === freshEnd) { freshEnd = lruEntry.p; }
                            if (lruEntry === staleEnd) { staleEnd = lruEntry.n; }

                            link(lruEntry.n, lruEntry.p);

                            delete lruHash[key];
                        }

                        delete data[key];
                        cfp_size -= 1;
                    },

                    removeAll: function () {
                        data = {};
                        cfp_size = 0;
                        lruHash = {};
                        freshEnd = staleEnd = null;
                    },

                    destroy: function () {
                        data = null;
                        stats = null;
                        lruHash = null;
                        delete caches[cacheId];
                    },

                    info: function () {
                        return extend({}, stats, {
                            size: cfp_size
                        });
                    }
                };

                return caches[cacheId];
            }

            cacheFactory.info = function () {
                var info = {};
                forEach(caches, function (cache, cacheId) {
                    info[cacheId] = cache.info();
                });
                return info;
            };

            cacheFactory.get = function (cacheId) {
                return caches[cacheId];
            };


            return cacheFactory;
        };
    }

    function $TemplateCacheProvider() {
        this.$get = ['$cacheFactory', function ($cacheFactory) {
            return $cacheFactory('templates');
        }];
    }

    function directiveNormalize(name) {
        return camelCase(name.replace(PREFIX_REGEXP, ''));
    }

    function tokenDifference(str1, str2) {
        var values = '',
            tokens1 = str1.split(/\s+/),
            tokens2 = str2.split(/\s+/),
            token,
            i = 0,
            j = 0;

        outerl: for (i = 0; i < tokens1.length; i += 1) {
            token = tokens1[i];
            for (j = 0; j < tokens2.length; j += 1) {
                if (token === tokens2[j]) { continue outerl; }
            }
            values += (values.length > 0 ? ' ' : '') + token;
        }
        return values;
    }

    function removeComments(jqNodes) {
        jqNodes = jqLite(jqNodes);

        var i = jqNodes.length,
            node;

        if (i <= 1) {
            return jqNodes;
        }

        while (i) {

            node = jqNodes[i];

            if (node.nodeType === NODE_TYPE_COMMENT) {
                splice.call(jqNodes, i, 1);
            }

            i -= 1;
        }
        return jqNodes;
    }

    $compileMinErr = minErr('$compile');

    function $CompileProvider($provide, $$sanitizeUriProvider) {
        var hasDirectives = {},
            Suffix = 'Directive',
            COMMENT_DIRECTIVE_REGEXP = /^\s*directive\:\s*([\w\-]+)\s+(.*)$/,
            CLASS_DIRECTIVE_REGEXP = /(([\w\-]+)(?:\:([^;]+))?;?)/,
            ALL_OR_NOTHING_ATTRS = makeMap(['ngSrc', 'ngSrcset', 'src', 'srcset']),
            REQUIRE_PREFIX_REGEXP = /^(?:(\^\^?)?(\?)?(\^\^?)?)?/,
            EVENT_HANDLER_ATTR_REGEXP = /^(on[a-z]+|formaction)$/,
            debugInfoEnabled_CP = msos.config.debug,     // Default in std AngularJS is 'true'
            temp_cp = 'ng - $CompileProvider',
            vc = (msos.config.verbose === 'compile');

        function parseIsolateBindings(scope, directiveName) {
            var LOCAL_REGEXP = /^\s*([@&]|=(\*?))(\??)\s*(\w*)\s*$/,
                bindings = {};

            forEach(
                scope,
                function (definition, scopeName) {
                    var match = definition.match(LOCAL_REGEXP);

                    if (!match) {
                        throw $compileMinErr(
                            'iscp',
                            "Invalid isolate scope definition for directive '{0}'. Definition: {... {1}: '{2}' ...}",
                            directiveName,
                            scopeName,
                            definition
                        );
                    }

                    bindings[scopeName] = {
                        mode: match[1][0],
                        collection: match[2] === '*',
                        optional: match[3] === '?',
                        attrName: match[4] || scopeName
                    };
                }
            );

            return bindings;
        }
  
        this.directive = function registerDirective(name, directiveFactory) {

            assertNotHasOwnProperty(name, 'directive');

            if (_.isString(name)) {

                if (vc) {
                    msos.console.debug(temp_cp + ' - directive -> start: ' + name);
                }

                assertArg(directiveFactory, 'directiveFactory');
                if (!hasDirectives.hasOwnProperty(name)) {
                    hasDirectives[name] = [];
                    $provide.factory(name + Suffix, ['$injector', function ($injector) {
                        var directives = [];
                        forEach(hasDirectives[name], function (directiveFactory, index) {
                            try {
                                var directive = $injector.invoke(directiveFactory);
                                if (_.isFunction(directive)) {
                                    directive = {
                                        compile: valueFn(directive)
                                    };
                                } else if (!directive.compile && directive.link) {
                                    directive.compile = valueFn(directive.link);
                                }
                                directive.priority = directive.priority || 0;
                                directive.index = index;
                                directive.name = directive.name || name;
                                directive.require = directive.require || (directive.controller && directive.name);
                                directive.restrict = directive.restrict || 'EA';
                                if (_.isObject(directive.scope)) {
                                    directive.$$isolateBindings = parseIsolateBindings(directive.scope, directive.name);
                                }
                                directives.push(directive);
                            } catch (e) {
                                msos.console.error(temp_cp + ' - directive - registerDirective ($provide.factory) -> failed:', e);
                            }
                        });
                        return directives;
                    }]);
                }
                hasDirectives[name].push(directiveFactory);
            } else {
                if (vc) {
                    msos.console.debug(temp_cp + ' - directive -> start, reverseParams:', name);
                }
                forEach(name, reverseParams(registerDirective));
            }

            if (vc) {
                msos.console.debug(temp_cp + ' - directive -> done: ' + name);
            }
            return this;
        };

        this.aHrefSanitizationWhitelist = function (regexp) {
            if (isDefined(regexp)) {
                $$sanitizeUriProvider.aHrefSanitizationWhitelist(regexp);
                return this;
            }
            return $$sanitizeUriProvider.aHrefSanitizationWhitelist();
        };

        this.imgSrcSanitizationWhitelist = function (regexp) {
            if (isDefined(regexp)) {
                $$sanitizeUriProvider.imgSrcSanitizationWhitelist(regexp);
                return this;
            }
            return $$sanitizeUriProvider.imgSrcSanitizationWhitelist();
        };

        this.debugInfoEnabled = function (enabled) {
            if (isDefined(enabled)) {
                debugInfoEnabled_CP = enabled;
                return this;
            }
            return debugInfoEnabled_CP;
        };

        this.$get = [
            '$injector', '$interpolate', '$templateRequest', '$parse',
            '$controller', '$rootScope', '$sce', '$animate', '$$sanitizeUri',
            function($injector, $interpolate, $templateRequest, $parse,
                     $controller, $rootScope, $sce, $animate, $$sanitizeUri) {

            var Attributes = function (element, attributesToCopy) {
                    if (attributesToCopy) {
                        var keys = Object.keys(attributesToCopy),
                            i,
                            key;

                        for (i = 0; i < keys.length; i += 1) {
                            key = keys[i];
                            this[key] = attributesToCopy[key];
                        }
                    } else {
                        this.$attr = {};
                    }

                    this.$$element = element;
                },
                startSymbol = $interpolate.startSymbol(),
                endSymbol = $interpolate.endSymbol(),
                denormalizeTemplate = (startSymbol === '{{' || endSymbol === '}}') ? identity : function denormalizeTemplate(template) {
                    return template.replace(/\{\{/g, startSymbol).replace(/\}\}/g, endSymbol);
                },
                NG_ATTR_BINDING = /^ngAttr[A-Z]/,
                applyDirectivesToNode = null,
                compile = null,
                compile_nodes_cnt = 0;

            Attributes.prototype = {

                $normalize: directiveNormalize,

                $addClass: function (classVal) {
                    if (classVal && classVal.length > 0) {
                        $animate.addClass(this.$$element, classVal);
                    }
                },

                $removeClass: function (classVal) {
                    if (classVal && classVal.length > 0) {
                        $animate.removeClass(this.$$element, classVal);
                    }
                },

                $updateClass: function (newClasses, oldClasses) {
                    var toAdd = tokenDifference(newClasses, oldClasses),
                        toRemove;

                    if (toAdd && toAdd.length) {
                        $animate.addClass(this.$$element, toAdd);
                    }

                    toRemove = tokenDifference(oldClasses, newClasses);

                    if (toRemove && toRemove.length) {
                        $animate.removeClass(this.$$element, toRemove);
                    }
                },

                $set: function (key, value, writeAttr, attrName) {

                    var node = this.$$element[0],
                        booleanKey = getBooleanAttrName(node, key),
                        aliasedKey = getAliasedAttrName(node, key),
                        observer = key,
                        $$observers,
                        nodeName,
                        result = '',
                        trimmedSrcset,
                        //            (   999x   ,|   999w   ,|   ,|,   )
                        srcPattern = /(\s+\d+x\s*,|\s+\d+w\s*,|\s+,|,\s+)/,
                        pattern,
                        rawUris,
                        nbrUrisWith2parts,
                        j = 0,
                        innerIdx,
                        lastTuple;

                    if (booleanKey) {
                        this.$$element.prop(key, value);
                        attrName = booleanKey;
                    } else if (aliasedKey) {
                        this[aliasedKey] = value;
                        observer = aliasedKey;
                    }

                    this[key] = value;

                    // translate normalized key to actual key
                    if (attrName) {
                        this.$attr[key] = attrName;
                    } else {
                        attrName = this.$attr[key];
                        if (!attrName) {
                            this.$attr[key] = attrName = snake_case(key, '-');
                        }
                    }

                    nodeName = nodeName_(this.$$element);

                    if ((nodeName === 'a' && key === 'href') || (nodeName === 'img' && key === 'src')) {
                        // sanitize a[href] and img[src] values
                        this[key] = value = $$sanitizeUri(value, key === 'src');
                    } else if (nodeName === 'img' && key === 'srcset') {
                        // sanitize img[srcset] values
                        result = '';

                        // first check if there are spaces because it's not the same pattern
                        trimmedSrcset = trim(value);
                        pattern = /\s/.test(trimmedSrcset) ? srcPattern : /(,)/;

                        // split srcset into tuple of uri and descriptor except for the last item
                        rawUris = trimmedSrcset.split(pattern);

                        // for each tuples
                        nbrUrisWith2parts = Math.floor(rawUris.length / 2);

                        for (j = 0; j < nbrUrisWith2parts; j += 1) {
                            innerIdx = j * 2;
                            // sanitize the uri
                            result += $$sanitizeUri(trim(rawUris[innerIdx]), true);
                            // add the descriptor
                            result += (" " + trim(rawUris[innerIdx + 1]));
                        }

                        // split the last item into uri and descriptor
                        lastTuple = trim(rawUris[j * 2]).split(/\s/);

                        // sanitize the last uri
                        result += $$sanitizeUri(trim(lastTuple[0]), true);

                        // and add the last descriptor if any
                        if (lastTuple.length === 2) {
                            result += (" " + trim(lastTuple[1]));
                        }
                        this[key] = value = result;
                    }

                    if (writeAttr !== false) {
                        if (value === null || value === undefined) {
                            this.$$element.removeAttr(attrName);
                        } else {
                            this.$$element.attr(attrName, value);
                        }
                    }

                    // fire observers
                    $$observers = this.$$observers;

                    if ($$observers) {
                        forEach(
                            $$observers[observer],
                            function (fn) {
                                try {
                                    fn(value);
                                } catch (e) {
                                    msos.console.error(temp_cp + ' - $get - Attributes.$set -> failed:', e);
                                }
                            }
                        );
                    }
                },

                $observe: function (key, fn) {
                    var attrs = this,
                        $$observers,
                        listeners;

                    if (!attrs.$$observers) { attrs.$$observers = createMap(); }

                    $$observers = attrs.$$observers;

                    if (!$$observers[key]) { $$observers[key] = []; }

                    listeners = $$observers[key];

                    listeners.push(fn);

                    $rootScope.$evalAsync(
                        function () {
                            if (!listeners.$$inter && attrs.hasOwnProperty(key)) {
                                fn(attrs[key]);
                            }
                        },
                        { directive_name: '$CompileProvider' }
                    );

                    return function () {
                        arrayRemove(listeners, fn);
                    };
                }
            };

            function wrapTemplate(type, template) {
                var wrapper;

                type = lowercase(type || 'html');

                switch (type) {
                    case 'svg':
                    case 'math':
                        wrapper = document.createElement('div');
                        wrapper.innerHTML = '<' + type + '>' + template + '</' + type + '>';
                        return wrapper.childNodes[0].childNodes;
                    default:
                        return template;
                }
            }

            function detectNamespaceForChildElements(parentElement) {

                var node = parentElement && parentElement[0];

                if (!node) { return 'html'; }
                
                return nodeName_(node) !== 'foreignobject' && node.toString().match(/SVG/) ? 'svg' : 'html';
            }

            function safeAddClass($element, className) {
                try {
                    $element.addClass(className);
                } catch (e) {
                    // ignore, since it means that we are trying to set class on
                    // SVG element, where class name is read-only
                    msos.console.warn(temp_cp + ' - $get - safeAddClass -> ??? SVG element: ' + className, e);
                }
            }

            function createBoundTranscludeFn(scope, transcludeFn, previousBoundTranscludeFn) {

                var boundTranscludeFn = function (transcludedScope, cloneFn, controllers, futureParentElement, containingScope) {

                    if (!transcludedScope) {
                        transcludedScope = scope.$new(false, containingScope);
                        transcludedScope.$$transcluded = true;
                    }

                    return transcludeFn(
                        transcludedScope,
                        cloneFn,
                        {
                            parentBoundTranscludeFn: previousBoundTranscludeFn,
                            transcludeControllers: controllers,
                            futureParentElement: futureParentElement
                        }
                    );
                };

                return boundTranscludeFn;
            }

            /**
             * looks up the directive and decorates it with exception handling and proper parameters. We
             * call this the boundDirective.
             *
             * @param {string} name name of the directive to look up.
             * @param {string} location The directive must be found in specific format.
             *   String containing any of theses characters:
             *
             *   * `E`: element name
             *   * `A': attribute
             *   * `C`: class
             *   * `M`: comment
             * @returns {boolean} true if directive was added.
             */
            function addDirective(tDirectives, name, location, maxPriority, ignoreDirective, startAttrName, endAttrName) {

                if (vc) {
                    msos.console.debug(temp_cp + ' - $get - addDirective -> name: ' + name + ', location: ' + location);
                }

                if (name === ignoreDirective) { return null; }

                var match = null,
                    directive,
                    directives,
                    i = 0;

                if (hasDirectives.hasOwnProperty(name)) {

                    directives = $injector.get(name + Suffix);

                    for (i = 0; i < directives.length; i += 1) {
                        try {
                            directive = directives[i];
                            if ((maxPriority === undefined || maxPriority > directive.priority) && directive.restrict.indexOf(location) !== -1) {
                                if (startAttrName) {
                                    directive = inherit(directive, {
                                        $$start: startAttrName,
                                        $$end: endAttrName
                                    });
                                }
                                tDirectives.push(directive);
                                match = directive;
                            }
                        } catch (e) {
                            msos.console.error(temp_cp + ' - $get - addDirective -> failed:', e);
                        }
                    }
                }
                return match;
            }

            function directiveIsMultiElement(name) {
                var directive,
                    directives,
                    i = 0;

                if (hasDirectives.hasOwnProperty(name)) {

                    directives = $injector.get(name + Suffix);

                    for (i = 0; i < directives.length; i += 1) {
                        directive = directives[i];
                        if (directive.multiElement) {
                            return true;
                        }
                    }
                }
                return false;
            }

            function getTrustedContext(node, attrNormalizedName) {

                if (attrNormalizedName === "srcdoc") {
                    return $sce.HTML;
                }

                var tag = nodeName_(node);
                // maction[xlink:href] can source SVG.  It's not limited to <maction>.
                if (attrNormalizedName === "xlinkHref"
                 || (tag === "form" && attrNormalizedName === "action")
                 || (tag !== "img" && (attrNormalizedName === "src" || attrNormalizedName === "ngSrc"))) {
                    return $sce.RESOURCE_URL;
                }

                return undefined;
            }

            function addAttrInterpolateDirective(node, directives, value, name, allOrNothing) {

                if (vc) {
                    msos.console.debug(temp_cp + ' - addAttrInterpolateDirective -> start.');
                }

                allOrNothing = ALL_OR_NOTHING_ATTRS[name] || allOrNothing;

                var trustedContext = getTrustedContext(node, name),
                    interpolateFn = $interpolate(value, true, trustedContext, allOrNothing);

                // no interpolation found -> ignore
                if (!interpolateFn) {
                    if (vc) {
                        msos.console.debug(temp_cp + ' - addAttrInterpolateDirective -> done, no interpolation function.');
                    }
                    return;
                }

                if (name === "multiple" && nodeName_(node) === "select") {
                    throw $compileMinErr(
                        "selmulti",
                        "Binding to the 'multiple' attribute is not supported. Element: {0}",
                        startingTag(node)
                    );
                }

                directives.push({
                    priority: 100,
                    compile: function () {
                        return {
                            pre: function attrInterpolatePreLinkFn(scope, element, attr) {
                                var $$observers,
                                    watch_scope,
                                    newValue;

                                if (!attr.$$observers) { attr.$$observers = {}; }

                                $$observers = attr.$$observers;

                                if (EVENT_HANDLER_ATTR_REGEXP.test(name)) {
                                    throw $compileMinErr(
                                        'nodomevents',
                                        "Interpolations for HTML DOM event attributes are disallowed. Please use the " + "ng- versions (such as ng-click instead of onclick) instead."
                                    );
                                }

                                // If the attribute has changed since last $interpolate()ed
                                newValue = attr[name];

                                if (newValue !== value) {
                                    interpolateFn = newValue && $interpolate(newValue, true, trustedContext, allOrNothing);
                                    value = newValue;
                                }

                                // if attribute was updated so that there is no interpolation going on we don't want to
                                // register any observers
                                if (!interpolateFn) { return; }

                                attr[name] = interpolateFn(scope);

                                if (!$$observers[name]) { $$observers[name] = []; }

                                $$observers[name].$$inter = true;

                                if (attr.$$observers
                                 && attr.$$observers[name]
                                 && attr.$$observers[name].$$scope) {
                                    watch_scope = attr.$$observers[name].$$scope;
                                } else {
                                    watch_scope = scope;
                                }

                                watch_scope.$watch(
                                    interpolateFn,
                                    function interpolateFnWatchAction(newValue, oldValue) {
                                        if (name === 'class' && newValue !== oldValue) {
                                            attr.$updateClass(newValue, oldValue);
                                        } else {
                                            attr.$set(name, newValue);
                                        }
                                    }
                                );
                            }
                        };
                    }
                });

                if (vc) {
                    msos.console.debug(temp_cp + ' - addAttrInterpolateDirective -> done!');
                }
            }

            function addTextInterpolateDirective(directives, text) {
                if (vc) {
                    msos.console.debug(temp_cp + ' - addTextInterpolateDirective -> start.');
                }

                var interpolateFn = $interpolate(text, true);

                if (interpolateFn) {
                    directives.push({
                        priority: 0,
                        compile: function textInterpolateCompileFn(templateNode) {
                            var templateNodeParent = templateNode.parent(),
                                hasCompileParent = !!templateNodeParent.length;

                            // When transcluding a template that has bindings in the root
                            // we don't have a parent and thus need to add the class during linking fn.
                            if (hasCompileParent) {
                                compile.$$addBindingClass(templateNodeParent);
                            }

                            return function textInterpolateLinkFn(scope, node) {
                                var parent = node.parent();

                                if (!hasCompileParent) { compile.$$addBindingClass(parent); }

                                compile.$$addBindingInfo(parent, interpolateFn.expressions);
                                scope.$watch(
                                    interpolateFn,
                                    function interpolateFnWatchAction(value) {
                                        node[0].nodeValue = value;
                                    }
                                );
                            };
                        }
                    });
                }

                if (vc) {
                    msos.console.debug(temp_cp + ' - addTextInterpolateDirective -> done!');
                }
            }

            function byPriority(a, b) {
                var diff = b.priority - a.priority;
                if (diff !== 0) { return diff; }
                if (a.name !== b.name) { return (a.name < b.name) ? -1 : 1; }
                return a.index - b.index;
            }

            function collectDirectives(node, directives, attrs, maxPriority, ignoreDirective) {

                var temp_cd = ' - $get - collectDirectives -> ',
                    nodeType = node.nodeType,
                    node_name = nodeName_(node),
                    attr,
                    name,
                    nName,
                    ngAttrName,
                    value,
                    isNgAttr,
                    nAttrs,
                    j = 0,
                    jj = 0,
                    attrStartName = false,
                    attrEndName = false,
                    directiveNName = '',
                    attrsMap = attrs.$attr,
                    match,
                    className;

                if (msos.config.verbose || directives.length) {
                    msos.console.debug(temp_cp + temp_cd + 'start, for: ' + node_name);
                }

                switch (nodeType) {

                    case NODE_TYPE_ELEMENT:
                        /* Element */
                        // use the node name: <directive>
                        addDirective(
                            directives,
                            directiveNormalize(nodeName_(node)),
                            'E',
                            maxPriority,
                            ignoreDirective
                        );

                        nAttrs = node.attributes;

                        if (nAttrs && nAttrs.length) { jj = nAttrs.length; }

                        for (j = 0; j < jj; j += 1) {

                            attrStartName = false;
                            attrEndName = false;

                            attr = nAttrs[j];

                            name = attr.name;
                            value = trim(attr.value);

                            // support ngAttr attribute binding
                            ngAttrName = directiveNormalize(name);
                            isNgAttr = NG_ATTR_BINDING.test(ngAttrName);

                            if (isNgAttr) {
                                name = name.replace(
                                    PREFIX_REGEXP,
                                    ''
                                ).substr(8).replace(
                                    /_(.)/g,
                                    function (match, letter) {
                                        return letter.toUpperCase();
                                    }
                                );
                            }

                            directiveNName = ngAttrName.replace(/(Start|End)$/, '');

                            if (directiveIsMultiElement(directiveNName)) {
                                if (ngAttrName === directiveNName + 'Start') {
                                    attrStartName = name;
                                    attrEndName = name.substr(0, name.length - 5) + 'end';
                                    name = name.substr(0, name.length - 6);
                                }
                            }

                            nName = directiveNormalize(name.toLowerCase());
                            attrsMap[nName] = name;
                            if (isNgAttr || !attrs.hasOwnProperty(nName)) {
                                attrs[nName] = value;
                                if (getBooleanAttrName(node, nName)) {
                                    attrs[nName] = true; // presence means true
                                }
                            }
                            addAttrInterpolateDirective(node, directives, value, nName, isNgAttr);
                            addDirective(
                                directives,
                                nName,
                                'A',
                                maxPriority,
                                ignoreDirective,
                                attrStartName,
                                attrEndName
                            );
                        }

                        // use class as directive
                        className = node.className;

                        if (_.isObject(className)) {
                            // Maybe SVGAnimatedString
                            className = className.animVal;
                        }

                        if (_.isString(className) && className !== '') {
                            // initial value
                            match = CLASS_DIRECTIVE_REGEXP.exec(className);

                            while (match) {
                                nName = directiveNormalize(match[2]);
                                if (addDirective(directives, nName, 'C', maxPriority, ignoreDirective)) {
                                    attrs[nName] = trim(match[3]);
                                }

                                className = className.substr(match.index + match[0].length);

                                // for next interation
                                match = CLASS_DIRECTIVE_REGEXP.exec(className);
                            }
                        }
                    break;

                    case NODE_TYPE_TEXT:
                        /* Text Node */
                        addTextInterpolateDirective(directives, node.nodeValue);
                    break;

                    case NODE_TYPE_COMMENT:
                        /* Comment */
                        try {
                            match = COMMENT_DIRECTIVE_REGEXP.exec(node.nodeValue);
                            if (match) {
                                nName = directiveNormalize(match[1]);
                                if (addDirective(directives, nName, 'M', maxPriority, ignoreDirective)) {
                                    attrs[nName] = trim(match[2]);
                                }
                            }
                        } catch (ignore) {
                            // turns out that under some circumstances IE9 throws errors when one attempts to read comment's node value.
                            msos.console.warn(temp_cp + temp_cd + 'failed to read comment node (IE9???)');
                        }
                    break;
                }

                directives.sort(byPriority);

                if (msos.config.verbose || directives.length) {
                    msos.console.debug(temp_cp + temp_cd + ' done, for: ' + node_name + ', sorted directives:', directives);
                }

                return directives;
            }

            function cloneAndAnnotateFn(fn, annotation) {
                return extend(function () {
                    return fn.apply(null, arguments);
                }, fn, annotation);
            }

            function groupScan(node, attrStart, attrEnd) {
                var nodes = [],
                    depth = 0;

                if (attrStart && node.hasAttribute && node.hasAttribute(attrStart)) {

                    do {
                        if (!node) {
                            throw $compileMinErr(
                                'uterdir',
                                "Unterminated attribute, found '{0}' but no matching '{1}' found.",
                                attrStart,
                                attrEnd
                            );
                        }
                        if (node.nodeType === NODE_TYPE_ELEMENT) {
                            if (node.hasAttribute(attrStart))   { depth += 1; }
                            if (node.hasAttribute(attrEnd))     { depth -= 1; }
                        }
                        nodes.push(node);
                        node = node.nextSibling;
                    } while (depth > 0);
                } else {
                    nodes.push(node);
                }

                return jqLite(nodes);
            }

            function groupElementsLinkFnWrapper(linkFn, attrStart, attrEnd) {
                return function (scope, element, attrs, controllers, transcludeFn) {
                    element = groupScan(element[0], attrStart, attrEnd);
                    return linkFn(scope, element, attrs, controllers, transcludeFn);
                };
            }

            function mergeTemplateAttributes(dst, src) {
                var srcAttr = src.$attr,
                    dstAttr = dst.$attr,
                    $element = dst.$$element;

                // reapply the old attributes to the new element
                forEach(dst, function (value, key) {
                    if (key.charAt(0) !== '$') {
                        if (src[key] && src[key] !== value) {
                            value += (key === 'style' ? ';' : ' ') + src[key];
                        }
                        dst.$set(key, value, true, srcAttr[key]);
                    }
                });

                // copy the new attributes on the old attrs object
                forEach(src, function (value, key) {
                    if (key === 'class') {
                        safeAddClass($element, value);
                        // just bad cricket using reserve words
                        dst['class'] = (dst['class'] ? dst['class'] + ' ' : '') + value;
                    } else if (key === 'style') {
                        $element.attr('style', $element.attr('style') + ';' + value);
                        dst.style = (dst.style ? dst.style + ';' : '') + value;
                        // `dst` will never contain hasOwnProperty as DOM parser won't let it.
                        // You will get an "InvalidCharacterError: DOM Exception 5" error if you
                        // have an attribute like "has-own-property" or "data-has-own-property", etc.
                    } else if (key.charAt(0) !== '$' && !dst.hasOwnProperty(key)) {
                        dst[key] = value;
                        dstAttr[key] = srcAttr[key];
                    }
                });
            }

            function markDirectivesAsIsolate(directives) {
                var j = 0;
                // mark all directives as needing isolate scope.
                for (j = 0; j < directives.length; j += 1) {
                    directives[j] = inherit(directives[j], { $$isolateScope: true });
                }
            }

            function assertNoDuplicate(what, previousDirective, directive, element) {
                var temp_an = ' - $get - assertNoDuplicate -> ';

                msos.console.debug(temp_cp + temp_an + 'directive: ' + directive.name + ' for: ' + what);

                if (previousDirective) {
                    msos.console.error(temp_cp + temp_an + 'failed, node:', element);

                    throw $compileMinErr(
                        'multidir',
                        'Multiple directives called for {0}, when asking for {1}',
                        previousDirective.name,
                        what
                    );
                }
            }

            function invokeLinkFn(linkFn, scope, $element, attrs, controllers, transcludeFn) {
                try {
                    linkFn(scope, $element, attrs, controllers, transcludeFn);
                } catch (e) {
                    msos.console.error(temp_cp + ' - $get - invokeLinkFn -> failed, tag: ' + startingTag($element), e);
                }
            }

            function replaceWith($rootElement, elementsToRemove, newNode) {
                var firstElementToRemove = elementsToRemove[0],
                    removeCount = elementsToRemove.length,
                    parent = firstElementToRemove.parentNode,
                    i = 0,
                    ii = 0,
                    j = 0,
                    jj = 0,
                    j2 = 0,
                    fragment,
                    k = 0,
                    kk = elementsToRemove.length,
                    element;

                if ($rootElement) {
                    for (i = 0, ii = $rootElement.length; i < ii; i += 1) {
                        if ($rootElement[i] === firstElementToRemove) {
                            $rootElement[i] = newNode;
                            i += 1;
                            for (j = i, j2 = j + removeCount - 1, jj = $rootElement.length; j < jj; j += 1, j2 += 1) {
                                if (j2 < jj) {
                                    $rootElement[j] = $rootElement[j2];
                                } else {
                                    delete $rootElement[j];
                                }
                            }
                            $rootElement.length -= removeCount - 1;

                            // If the replaced element is also the jQuery .context then replace it
                            // .context is a deprecated jQuery api, so we should set it only when jQuery set it
                            // http://api.jquery.com/context/
                            if ($rootElement.context === firstElementToRemove) {
                                $rootElement.context = newNode;
                            }
                            break;
                        }
                    }
                }

                if (parent) {
                    parent.replaceChild(newNode, firstElementToRemove);
                }

                fragment = document.createDocumentFragment();
                fragment.appendChild(firstElementToRemove);

                jqLite(newNode).data(jqLite(firstElementToRemove).data());

                skipDestroyOnNextJQueryCleanData = true;
                jQuery.cleanData([firstElementToRemove]);

                for (k = 1; k < kk; k += 1) {
                    element = elementsToRemove[k];
                    jqLite(element).remove();
                    fragment.appendChild(element);
                    delete elementsToRemove[k];
                }

                elementsToRemove[0] = newNode;
                elementsToRemove.length = 1;
            }

            function compileNodes(nodeList, transcludeFn, $rootElement, maxPriority, ignoreDirective, previousCompileContext_cn) {
                var temp_cn = ' - $get - compileNodes -> ',
                    debug_cn = [],
                    linkFns = [],
                    attrs,
                    directives,
                    nodeLinkFn_cN,
                    childNodes,
                    childLinkFn_cN,
                    linkFnFound,
                    nodeLinkFnFound,
                    l = 0,
                    m = 0;

                compile_nodes_cnt += 1;
                m = String(compile_nodes_cnt);

                if (msos.config.verbose) {
                    msos.console.debug(temp_cp + temp_cn + 'start: ' + m, previousCompileContext_cn);
                }

                for (l = 0; l < nodeList.length; l += 1) {

                    // We don't want to process these, ever!
                    if (nodeName_(nodeList[l]) !== 'head') {

                        attrs = new Attributes();

                        // we must always refer to nodeList[l] since the nodes can be replaced underneath us.
                        directives = collectDirectives(nodeList[l], [], attrs, l === 0 ? maxPriority : undefined, ignoreDirective);

                        nodeLinkFn_cN = (directives.length) ? applyDirectivesToNode(directives, nodeList[l], attrs, transcludeFn, $rootElement, null, [], [], previousCompileContext_cn) : null;

                        if (nodeLinkFn_cN && nodeLinkFn_cN.scope) {
                            debug_cn.push('node link func, scope!');
                            compile.$$addScopeClass(attrs.$$element);
                        }

                        childNodes = nodeList[l].childNodes;

                        childLinkFn_cN = ((nodeLinkFn_cN && nodeLinkFn_cN.terminal) || !childNodes || !childNodes.length)
                            ? null
                            : compileNodes(
                                childNodes,
                                nodeLinkFn_cN
                                    ? ((nodeLinkFn_cN.transcludeOnThisElement || !nodeLinkFn_cN.templateOnThisElement) && nodeLinkFn_cN.transclude)
                                    : transcludeFn
                            );

                        if (nodeLinkFn_cN || childLinkFn_cN) {
                            debug_cn.push('node link func, or child link!');
                            linkFns.push(l, nodeLinkFn_cN, childLinkFn_cN);
                            linkFnFound = true;
                            nodeLinkFnFound = nodeLinkFnFound || nodeLinkFn_cN;
                        }

                        // use the previous context only for the first element in the virtual group
                        previousCompileContext_cn = {};   // ???? {}
                    }

                    if (msos.config.verbose) {
                        msos.console.debug(temp_cp + temp_cn + ' done: ' + m + ', directives: ' + directives.length + (debug_cn.length ? ', w/ ' + debug_cn.join(', ') : ''));
                    }
                }

                function compositeLinkFn(scope, nodeList, $rootElement, parentBoundTranscludeFn) {
                    var nodeLinkFn_cLF,
                        childLinkFn_cLF,
                        node,
                        childScope,
                        i,
                        idx,
                        childBoundTranscludeFn,
                        stableNodeList,
                        nodeListLength;

                    if (nodeLinkFnFound) {
                        // copy nodeList so that if a nodeLinkFn removes or adds an element at this DOM level our
                        // offsets don't get screwed up
                        nodeListLength = nodeList.length;
                        stableNodeList = new Array(nodeListLength);

                        // create a sparse array by only copying the elements which have a linkFn
                        for (i = 0; i < linkFns.length; i += 3) {
                            idx = linkFns[i];
                            stableNodeList[idx] = nodeList[idx];
                        }
                    } else {
                        stableNodeList = nodeList;
                    }

                    for (i = 0; i < linkFns.length; i += 1) {
                        node = stableNodeList[linkFns[i]];
                        i += 1;
                        nodeLinkFn_cLF = linkFns[i];
                        i += 1;
                        childLinkFn_cLF = linkFns[i];

                        if (nodeLinkFn_cLF) {
                            if (nodeLinkFn_cLF.scope) {
                                childScope = scope.$new();
                                compile.$$addScopeInfo(jqLite(node), childScope);
                            } else {
                                childScope = scope;
                            }

                            if (nodeLinkFn_cLF.transcludeOnThisElement) {
                                childBoundTranscludeFn = createBoundTranscludeFn(
                                    scope,
                                    nodeLinkFn_cLF.transclude,
                                    parentBoundTranscludeFn
                                );

                            } else if (!nodeLinkFn_cLF.templateOnThisElement && parentBoundTranscludeFn) {
                                childBoundTranscludeFn = parentBoundTranscludeFn;

                            } else if (!parentBoundTranscludeFn && transcludeFn) {
                                childBoundTranscludeFn = createBoundTranscludeFn(scope, transcludeFn);

                            } else {
                                childBoundTranscludeFn = null;
                            }

                            nodeLinkFn_cLF(
                                childLinkFn_cLF,
                                childScope,
                                node,
                                $rootElement,
                                childBoundTranscludeFn
                            );

                        } else if (childLinkFn_cLF) {
                            childLinkFn_cLF(
                                scope,
                                node.childNodes,
                                undefined,
                                parentBoundTranscludeFn
                            );
                        }
                    }
                }

                // return a linking function if we have found anything, null otherwise
                return linkFnFound ? compositeLinkFn : null;
            }

            function compileTemplateUrl(directives, $compileNode, tAttrs, $rootElement, childTranscludeFn, preLinkFns, postLinkFns, previousCompileContext_url) {
                var temp_ct = ' - $get - compileTemplateUrl',
                    linkQueue = [],
                    afterTemplateNodeLinkFn,
                    afterTemplateChildLinkFn,
                    beforeTemplateCompileNode = $compileNode[0],
                    origAsyncDirective = directives.shift(),
                    // The fact that we have to copy and patch the directive seems wrong!
                    derivedSyncDirective = inherit(
                        origAsyncDirective,
                        {
                            templateUrl: null,
                            transclude: null,
                            replace: null,
                            $$originalDirective: origAsyncDirective
                        }
                    ),
                    templateUrl = (_.isFunction(origAsyncDirective.templateUrl)) ? origAsyncDirective.templateUrl($compileNode, tAttrs) : origAsyncDirective.templateUrl,
                    templateNamespace = origAsyncDirective.templateNamespace;

                msos.console.debug(temp_cp + temp_ct + ' -> start.');

                $compileNode.empty();

                $templateRequest(
                    $sce.getTrustedResourceUrl(templateUrl)
                ).then(
                    function(content) {
                        var compileNode_suc,
                            tempTemplateAttrs,
                            $template_suc,
                            childBoundTranscludeFn,
                            templateDirectives_suc,
                            scope,
                            beforeTemplateLinkNode,
                            linkRootElement,
                            boundTranscludeFn,
                            linkNode,
                            oldClasses;

                        msos.console.debug(temp_cp + temp_ct + ' - $templateRequest - then -> start.');

                        content = denormalizeTemplate(content);

                        if (origAsyncDirective.replace) {
                            if (jqLiteIsTextNode(content)) {
                                $template_suc = [];
                            } else {
                                $template_suc = removeComments(wrapTemplate(templateNamespace, trim(content)));
                            }
                            compileNode_suc = $template_suc[0];

                            if ($template_suc.length !== 1 || compileNode_suc.nodeType !== NODE_TYPE_ELEMENT) {
                                throw $compileMinErr('tplrt', "Template for directive '{0}' must have exactly one root element. {1}", origAsyncDirective.name, templateUrl);
                            }

                            tempTemplateAttrs = {
                                $attr: {}
                            };
                            replaceWith($rootElement, $compileNode, compileNode_suc);
                            templateDirectives_suc = collectDirectives(compileNode_suc, [], tempTemplateAttrs);

                            if (_.isObject(origAsyncDirective.scope)) {
                                markDirectivesAsIsolate(templateDirectives_suc);
                            }
                            directives = templateDirectives_suc.concat(directives);
                            mergeTemplateAttributes(tAttrs, tempTemplateAttrs);
                        } else {
                            compileNode_suc = beforeTemplateCompileNode;
                            $compileNode.html(content);
                        }

                        directives.unshift(derivedSyncDirective);

                        afterTemplateNodeLinkFn = applyDirectivesToNode(
                            directives,
                            compileNode_suc,
                            tAttrs,
                            childTranscludeFn,
                            $compileNode,
                            origAsyncDirective,
                            preLinkFns,
                            postLinkFns,
                            previousCompileContext_url
                        );

                        forEach($rootElement, function (node, i) {
                            if (node === compileNode_suc) {
                                $rootElement[i] = $compileNode[0];
                            }
                        });

                        afterTemplateChildLinkFn = compileNodes(
                            $compileNode[0].childNodes,
                            childTranscludeFn
                        );

                        while (linkQueue.length) {
                            scope = linkQueue.shift();
                            beforeTemplateLinkNode = linkQueue.shift();
                            linkRootElement = linkQueue.shift();
                            boundTranscludeFn = linkQueue.shift();
                            linkNode = $compileNode[0];

                            if (scope.$$destroyed) { continue; }

                            if (beforeTemplateLinkNode !== beforeTemplateCompileNode) {
                                oldClasses = beforeTemplateLinkNode.className;

                                if (!(previousCompileContext_url.hasElementTranscludeDirective && origAsyncDirective.replace)) {
                                    // it was cloned therefore we have to clone as well.
                                    linkNode = jqLiteClone(compileNode_suc);
                                }

                                replaceWith(linkRootElement, jqLite(beforeTemplateLinkNode), linkNode);

                                // Copy in CSS classes from original node
                                safeAddClass(jqLite(linkNode), oldClasses);
                            }
                            if (afterTemplateNodeLinkFn.transcludeOnThisElement) {
                                childBoundTranscludeFn = createBoundTranscludeFn(
                                    scope,
                                    afterTemplateNodeLinkFn.transclude,
                                    boundTranscludeFn
                                );
                            } else {
                                childBoundTranscludeFn = boundTranscludeFn;
                            }
                            afterTemplateNodeLinkFn(afterTemplateChildLinkFn, scope, linkNode, $rootElement, childBoundTranscludeFn);
                        }
                        linkQueue = null;

                        msos.console.debug(temp_cp + temp_ct + ' - $templateRequest - then -> done!');
                    }
                );

                msos.console.debug(temp_cp + temp_ct + ' -> done!');

                return function delayedNodeLinkFn(ignoreChildLinkFn, scope, node, rootElement, boundTranscludeFn) {
                    var childBoundTranscludeFn = boundTranscludeFn;

                    if (scope.$$destroyed) { return; }

                    if (linkQueue) {
                        linkQueue.push(
                            scope,
                            node,
                            rootElement,
                            childBoundTranscludeFn
                        );
                    } else {
                        if (afterTemplateNodeLinkFn.transcludeOnThisElement) {
                            childBoundTranscludeFn = createBoundTranscludeFn(
                                scope,
                                afterTemplateNodeLinkFn.transclude,
                                boundTranscludeFn
                            );
                        }
                        afterTemplateNodeLinkFn(afterTemplateChildLinkFn, scope, node, rootElement, childBoundTranscludeFn);
                    }
                };
            }

            // Using var applyDirectivesToNode is way faster since order of declaration is correct
            applyDirectivesToNode = function (directives, compileNode, templateAttrs, transcludeFn, jqCollection, originalReplaceDirective, preLinkFns, postLinkFns, previousCompileContext_apply) {

                previousCompileContext_apply = previousCompileContext_apply || {};

                templateAttrs.$$element = jqLite(compileNode);

                var temp_ap = ' - $get - applyDirectivesToNode -> ',
                    i = 0,
                    ii = 0,
                    terminalPriority = -Number.MAX_VALUE,
                    newScopeDirective,
                    controllerDirectives = previousCompileContext_apply.controllerDirectives,
                    controllers,
                    newIsolateScopeDirective = previousCompileContext_apply.newIsolateScopeDirective,
                    templateDirective = previousCompileContext_apply.templateDirective,
                    nonTlbTranscludeDirective = previousCompileContext_apply.nonTlbTranscludeDirective,
                    hasTranscludeDirective = false,
                    hasTemplate = false,
                    hasElementTranscludeDirective = previousCompileContext_apply.hasElementTranscludeDirective,
                    $compileNode = templateAttrs.$$element,
                    directive,
                    directiveName,
                    $template,
                    replaceDirective = originalReplaceDirective,
                    childTranscludeFn = transcludeFn,
                    linkFn,
                    directiveValue,
                    attrStart,
                    attrEnd,
                    newTemplateAttrs,
                    templateDirectives,
                    unprocessedDirectives;

                if (vc) {
                    msos.console.debug(temp_cp + temp_ap + 'start, node: ' + lowercase(compileNode.nodeName), previousCompileContext_apply);
                }

                // executes all directives on the current element
                ii = directives.length;

                // Start: defining functions for applyDirectivesToNode
                function getControllers(directiveName, require, $element, elementControllers) {
                    var value,
                        retrievalMethod = 'data',
                        optional = false,
                        $searchElement = $element,
                        match;

                    if (_.isString(require)) {

                        match = require.match(REQUIRE_PREFIX_REGEXP);
                        require = require.substring(match[0].length);

                        if (match[3]) {
                            if (match[1])   { match[3] = null; }
                            else            { match[1] = match[3]; }
                        }

                        if (match[1] === '^') {
                            retrievalMethod = 'inheritedData';
                        } else if (match[1] === '^^') {
                            retrievalMethod = 'inheritedData';
                            $searchElement = $element.parent();
                        }

                        if (match[2] === '?') {
                            optional = true;
                        }

                        value = null;

                        if (elementControllers && retrievalMethod === 'data') {
                            value = elementControllers[require];
                            if (value) {
                                value = value.instance;
                            }
                        }

                        value = value || $searchElement[retrievalMethod]('$' + require + 'Controller');

                        if (!value && !optional) {
                            throw $compileMinErr(
                                'ctreq',
                                "Controller '{0}', required by directive '{1}', can't be found!",
                                require,
                                directiveName
                            );
                        }

                        return value || null;
                    }

                    if (_.isArray(require)) {
                        value = [];
                        forEach(
                            require,
                            function (require) {
                                value.push(getControllers(directiveName, require, $element, elementControllers));
                            }
                        );
                    }

                    return value;
                }

                function nodeLinkFn(childLinkFn, scope, linkNode, $rootElement, boundTranscludeFn) {
                    var k,
                        kk,
                        linkFn_nLF,
                        controller,
                        isolateScope,
                        elementControllers,
                        transcludeFn_nLF,
                        $element,
                        attrs,
                        scopeToChild,
                        isolateScopeController,
                        isolateBindingContext;

                    // This is the function that is injected as `$transclude`.
                    // Note: all arguments are optional!
                    function controllersBoundTransclude(scope, cloneAttachFn, futureParentElement) {
                        var transcludeControllers;

                        // No scope passed in:
                        if (!isScope(scope)) {
                            futureParentElement = cloneAttachFn;
                            cloneAttachFn = scope;
                            scope = undefined;
                        }

                        if (hasElementTranscludeDirective) {
                            transcludeControllers = elementControllers;
                        }

                        if (!futureParentElement) {
                            futureParentElement = hasElementTranscludeDirective ? $element.parent() : $element;
                        }

                        return boundTranscludeFn(scope, cloneAttachFn, transcludeControllers, futureParentElement, scopeToChild);
                    }

                    if (compileNode === linkNode) {
                        attrs = templateAttrs;
                        $element = templateAttrs.$$element;
                    } else {
                        $element = jqLite(linkNode);
                        attrs = new Attributes($element, templateAttrs);
                    }

                    if (newIsolateScopeDirective) {
                        isolateScope = scope.$new(true);
                    }

                    if (boundTranscludeFn) {
                        // track `boundTranscludeFn` so it can be unwrapped if `transcludeFn`
                        // is later passed as `parentBoundTranscludeFn` to `publicLinkFn`
                        transcludeFn_nLF = controllersBoundTransclude;
                        transcludeFn_nLF.$$boundTransclude = boundTranscludeFn;
                    }

                    if (controllerDirectives) {
                        controllers = {};
                        elementControllers = {};

                        forEach(
                            controllerDirectives,
                            function (directive) {
                                var locals = {
                                        $scope: directive === newIsolateScopeDirective || directive.$$isolateScope ? isolateScope : scope,
                                        $element: $element,
                                        $attrs: attrs,
                                        $transclude: transcludeFn_nLF
                                    },
                                    controllerInstance;

                                controller = directive.controller;

                                if (controller === '@') {
                                    controller = attrs[directive.name];
                                }

                                controllerInstance = $controller(
                                    controller,
                                    locals,
                                    true,
                                    directive.controllerAs
                                );

                                elementControllers[directive.name] = controllerInstance;

                                if (!hasElementTranscludeDirective) {
                                    $element.data('$' + directive.name + 'Controller', controllerInstance.instance);
                                }

                                controllers[directive.name] = controllerInstance;
                            }
                        );
                    }

                    if (newIsolateScopeDirective) {

                        compile.$$addScopeInfo(
                            $element,
                            isolateScope,
                            true,
                            !(templateDirective && (templateDirective === newIsolateScopeDirective || templateDirective === newIsolateScopeDirective.$$originalDirective))
                        );

                        compile.$$addScopeClass($element, true);

                        isolateScopeController = controllers && controllers[newIsolateScopeDirective.name];
                        isolateBindingContext = isolateScope;

                        if (isolateScopeController
                         && isolateScopeController.identifier
                         && newIsolateScopeDirective.bindToController === true) {
                            isolateBindingContext = isolateScopeController.instance;
                        }

                        isolateScope.$$isolateBindings = newIsolateScopeDirective.$$isolateBindings;

                        forEach(
                            isolateScope.$$isolateBindings,
                            function (definition, scopeName) {
                                var attrName = definition.attrName,
                                    optional = definition.optional,
                                    mode = definition.mode, // @, =, or &
                                    lastValue,
                                    parentValueWatch,
                                    unwatch,
                                    parentGet,
                                    parentSet,
                                    compare;

                                switch (mode) {

                                    case '@':
                                        attrs.$observe(
                                            attrName,
                                            function (value) {
                                                isolateBindingContext[scopeName] = value;
                                            }
                                        );

                                        attrs.$$observers[attrName].$$scope = scope;

                                        if (attrs[attrName]) {
                                            // If the attribute has been provided then we trigger an interpolation to ensure
                                            // the value is there for use in the link fn
                                            isolateBindingContext[scopeName] = $interpolate(attrs[attrName])(scope);
                                        }
                                    break;

                                    case '=':
                                        if (optional && !attrs[attrName]) {
                                            return;
                                        }

                                        parentGet = $parse(attrs[attrName]);

                                        if (parentGet.literal) {
                                            compare = equals;
                                        } else {
                                            compare = function (a, b) { return a === b || (a !== a && b !== b); };
                                        }

                                        parentSet = parentGet.assign || function () {
                                            // reset the change, or we will throw this exception on every $digest
                                            lastValue = isolateBindingContext[scopeName] = parentGet(scope);
                                            throw $compileMinErr(
                                                'nonassign',
                                                "Expression '{0}' used with directive '{1}' is non-assignable!",
                                                attrs[attrName],
                                                newIsolateScopeDirective.name
                                            );
                                        };

                                        lastValue = isolateBindingContext[scopeName] = parentGet(scope);

                                        parentValueWatch = function parentValueWatch(parentValue) {
                                            if (!compare(parentValue, isolateBindingContext[scopeName])) {
                                                // we are out of sync and need to copy
                                                if (!compare(parentValue, lastValue)) {
                                                    // parent changed and it has precedence
                                                    isolateBindingContext[scopeName] = parentValue;
                                                } else {
                                                    // if the parent can be assigned then do so
                                                    parentValue = isolateBindingContext[scopeName];
                                                    parentSet(scope, parentValue);
                                                }
                                            }

                                            lastValue = parentValue;
                                            return lastValue;
                                        };

                                        parentValueWatch.$stateful = true;

                                        if (definition.collection) {
                                            unwatch = scope.$watchCollection(attrs[attrName], parentValueWatch);
                                        } else {
                                            unwatch = scope.$watch($parse(attrs[attrName], parentValueWatch), null, parentGet.literal);
                                        }

                                        isolateScope.$on('$destroy', unwatch);
                                    break;

                                    case '&':
                                        parentGet = $parse(attrs[attrName]);
                                        isolateBindingContext[scopeName] = function (locals) {
                                            return parentGet(scope, locals);
                                        };
                                    break;
                                }
                            }
                        );
                    }

                    if (controllers) {
                        forEach(
                            controllers,
                            function (controller) { controller(); }
                        );

                        controllers = null;
                    }

                    // PRELINKING
                    for (k = 0, kk = preLinkFns.length; k < kk; k += 1) {
                        linkFn_nLF = preLinkFns[k];

                        invokeLinkFn(
                            linkFn_nLF,
                            linkFn_nLF.isolateScope ? isolateScope : scope,
                            $element,
                            attrs,
                            linkFn_nLF.require && getControllers(linkFn_nLF.directiveName, linkFn_nLF.require, $element, elementControllers),
                            transcludeFn_nLF
                        );
                    }

                    // RECURSION
                    // We only pass the isolate scope, if the isolate directive has a template,
                    // otherwise the child elements do not belong to the isolate directive.
                    scopeToChild = scope;

                    if (newIsolateScopeDirective && (newIsolateScopeDirective.template || newIsolateScopeDirective.templateUrl === null)) {
                        scopeToChild = isolateScope;
                    }

                    if (childLinkFn) {
                        childLinkFn(scopeToChild, linkNode.childNodes, undefined, boundTranscludeFn);
                    }

                    // POSTLINKING
                    for (k = postLinkFns.length - 1; k >= 0; k -= 1) {
                        linkFn_nLF = postLinkFns[k];

                        invokeLinkFn(
                            linkFn_nLF,
                            linkFn_nLF.isolateScope ? isolateScope : scope,
                            $element,
                            attrs,
                            linkFn_nLF.require && getControllers(linkFn_nLF.directiveName, linkFn_nLF.require, $element, elementControllers),
                            transcludeFn_nLF
                        );
                    }
                }

                function addLinkFns(pre, post, attrStart, attrEnd) {
                    if (pre) {
                        if (attrStart) { pre = groupElementsLinkFnWrapper(pre, attrStart, attrEnd); }
                        pre.require = directive.require;
                        pre.directiveName = directiveName;
                        if (newIsolateScopeDirective === directive || directive.$$isolateScope) {
                            pre = cloneAndAnnotateFn(pre, {
                                isolateScope: true
                            });
                        }
                        preLinkFns.push(pre);
                    }

                    if (post) {
                        if (attrStart) { post = groupElementsLinkFnWrapper(post, attrStart, attrEnd); }
                        post.require = directive.require;
                        post.directiveName = directiveName;
                        if (newIsolateScopeDirective === directive || directive.$$isolateScope) {
                            post = cloneAndAnnotateFn(post, {
                                isolateScope: true
                            });
                        }
                        postLinkFns.push(post);
                    }
                }
                // End: defining functions for applyDirectivesToNode

                // Start: for loop for applyDirectivesToNode
                for (i = 0; i < ii; i += 1) {
                    directive = directives[i];
                    attrStart = directive.$$start;
                    attrEnd = directive.$$end;

                    // collect multiblock sections
                    if (attrStart) {
                        $compileNode = groupScan(compileNode, attrStart, attrEnd);
                    }
                    $template = undefined;

                    if (terminalPriority > directive.priority) {
                        break; // prevent further processing of directives
                    }

                    directiveValue = directive.scope;

                    if (directiveValue) {
                        // skip the check for directives with async templates, we'll check the derived sync
                        // directive when the template arrives
                        msos.console.debug(temp_cp + temp_ap + 'processing directive value.');

                        if (!directive.templateUrl) {
                            if (_.isObject(directiveValue)) {
                                // This directive is trying to add an isolated scope.
                                // Check that there is no scope of any kind already
                                assertNoDuplicate('new/isolated scope (object)', newIsolateScopeDirective || newScopeDirective, directive, $compileNode);
                                newIsolateScopeDirective = directive;
                            } else {
                                // This directive is trying to add a child scope.
                                // Check that there is no isolated scope already
                                assertNoDuplicate('new/isolated scope (value)', newIsolateScopeDirective, directive, $compileNode);
                            }
                        }

                        newScopeDirective = newScopeDirective || directive;
                    }

                    directiveName = directive.name;

                    if (!directive.templateUrl && directive.controller) {
                        directiveValue = directive.controller;
                        controllerDirectives = controllerDirectives || {};

                        msos.console.debug(temp_cp + temp_ap + 'waiting for template, controller ready: ' + directiveName);

                        assertNoDuplicate(
                            directiveName + " controller",
                            controllerDirectives[directiveName],
                            directive,
                            $compileNode
                        );

                        controllerDirectives[directiveName] = directive;
                    }

                    directiveValue = directive.transclude;

                    if (directiveValue) {
                        hasTranscludeDirective = true;

                        msos.console.debug(temp_cp + temp_ap + 'processing transclusion: ' + directiveName);

                        if (!directive.$$tlb) {
                            assertNoDuplicate(
                                'transclusion (no $$tlb)',
                                nonTlbTranscludeDirective,
                                directive,
                                $compileNode
                            );
                            nonTlbTranscludeDirective = directive;
                        }

                        if (directiveValue === 'element') {
                            hasElementTranscludeDirective = true;
                            terminalPriority = directive.priority;
                            $template = $compileNode;
                            $compileNode = templateAttrs.$$element = jqLite(document.createComment(' ' + directiveName + ': ' + templateAttrs[directiveName] + ' '));
                            compileNode = $compileNode[0];
                            replaceWith(jqCollection, sliceArgs($template), compileNode);

                            childTranscludeFn = compile(
                                $template,
                                transcludeFn,
                                terminalPriority,
                                replaceDirective && replaceDirective.name,
                                { nonTlbTranscludeDirective: nonTlbTranscludeDirective }
                            );
                        } else {
                            $template = jqLite(jqLiteClone(compileNode)).contents();
                            $compileNode.empty(); // clear contents
                            childTranscludeFn = compile($template, transcludeFn);
                        }
                    }

                    if (directive.template) {
                        hasTemplate = true;

                        msos.console.debug(temp_cp + temp_ap + 'processing template (script): ' + directiveName);

                        assertNoDuplicate('template (script)', templateDirective, directive, $compileNode);

                        templateDirective = directive;

                        directiveValue = (_.isFunction(directive.template)) ? directive.template($compileNode, templateAttrs) : directive.template;

                        directiveValue = denormalizeTemplate(directiveValue);

                        if (directive.replace) {
                            replaceDirective = directive;
                            if (jqLiteIsTextNode(directiveValue)) {
                                $template = [];
                            } else {
                                $template = removeComments(wrapTemplate(directive.templateNamespace, trim(directiveValue)));
                            }

                            compileNode = $template[0];

                            if ($template.length !== 1 || compileNode.nodeType !== NODE_TYPE_ELEMENT) {
                                throw $compileMinErr(
                                    'tplrt',
                                    "Template for directive '{0}' must have exactly one root element. {1}",
                                    directiveName,
                                    ''
                                );
                            }

                            replaceWith(jqCollection, $compileNode, compileNode);

                            newTemplateAttrs = {
                                $attr: {}
                            };

                            templateDirectives = collectDirectives(compileNode, [], newTemplateAttrs);
                            unprocessedDirectives = directives.splice(i + 1, directives.length - (i + 1));

                            if (newIsolateScopeDirective) {
                                markDirectivesAsIsolate(templateDirectives);
                            }
                            directives = directives.concat(templateDirectives).concat(unprocessedDirectives);
                            mergeTemplateAttributes(templateAttrs, newTemplateAttrs);

                            ii = directives.length;
                        } else {
                            $compileNode.html(directiveValue);
                        }
                    }

                    if (directive.templateUrl) {
                        hasTemplate = true;

                        msos.console.debug(temp_cp + temp_ap + 'processing template (url): ' + directiveName);

                        assertNoDuplicate('template (url)', templateDirective, directive, $compileNode);

                        templateDirective = directive;

                        if (directive.replace) {
                            replaceDirective = directive;
                        }

                        nodeLinkFn = compileTemplateUrl(
                            directives.splice(i, directives.length - i),
                            $compileNode,
                            templateAttrs,
                            jqCollection,
                            hasTranscludeDirective && childTranscludeFn,
                            preLinkFns,
                            postLinkFns,
                            {
                                controllerDirectives:       controllerDirectives,
                                newIsolateScopeDirective:   newIsolateScopeDirective,
                                templateDirective:          templateDirective,
                                nonTlbTranscludeDirective:  nonTlbTranscludeDirective
                            }
                        );

                        ii = directives.length;

                    } else if (directive.compile) {
                        try {
                            linkFn = directive.compile($compileNode, templateAttrs, childTranscludeFn);
                            if (_.isFunction(linkFn)) {
                                addLinkFns(null, linkFn, attrStart, attrEnd);
                            } else if (linkFn) {
                                addLinkFns(linkFn.pre, linkFn.post, attrStart, attrEnd);
                            }
                        } catch (e) {
                            msos.console.error(temp_cp + temp_ap + 'failed, tag: ' + startingTag($compileNode) + ', directive: ' + directiveName, e);
                        }
                    }

                    if (directive.terminal) {
                        nodeLinkFn.terminal = true;
                        terminalPriority = Math.max(terminalPriority, directive.priority);
                    }
                }
                // End: for loop for applyDirectivesToNode

                nodeLinkFn.scope = newScopeDirective && newScopeDirective.scope === true;
                nodeLinkFn.transcludeOnThisElement = hasTranscludeDirective;
                nodeLinkFn.elementTranscludeOnThisElement = hasElementTranscludeDirective;
                nodeLinkFn.templateOnThisElement = hasTemplate;
                nodeLinkFn.transclude = childTranscludeFn;

                previousCompileContext_apply.hasElementTranscludeDirective = hasElementTranscludeDirective;

                if (vc) {
                    msos.console.debug(temp_cp + temp_ap + 'done!');
                }

                // might be normal or delayed nodeLinkFn depending on if templateUrl is present
                return nodeLinkFn;
            };

            compile = function ($compileNodes, transcludeFn, maxPriority, ignoreDirective, previousCompileContext_compile) {
                var temp_c = ' - $get - compile -> ',
                    compositeLinkFn_cpl,
                    namespace = null;

                msos.console.debug(temp_cp + temp_c + 'start, prev. context:', (previousCompileContext_compile || {}));

                if (!($compileNodes instanceof jqLite)) {
                    $compileNodes = jqLite($compileNodes);
                }

                // We can not compile top level text elements since text nodes can be merged and we will
                // not be able to attach scope data to them, so we will wrap them in <span>
                forEach(
                    $compileNodes,
                    function (node, index) {
                        if (node.nodeType === NODE_TYPE_TEXT
                         && node.nodeValue.match(/\S+/)) {
                            $compileNodes[index] = jqLite(node).wrap('<span></span>').parent()[0];
                        }
                    }
                );

                // This is the only one which passes previous context
                compositeLinkFn_cpl = compileNodes(
                    $compileNodes,
                    transcludeFn,
                    $compileNodes,
                    maxPriority,
                    ignoreDirective,
                    previousCompileContext_compile
                );

                compile.$$addScopeClass($compileNodes);

                msos.console.debug(temp_cp + temp_c + ' done, prev. context:', (previousCompileContext_compile || {}));

                return function publicLinkFn(scope, cloneConnectFn, options) {

                    assertArg(scope, 'scope');

                    options = options || {};

                    var parentBoundTranscludeFn = options.parentBoundTranscludeFn,
                        transcludeControllers = options.transcludeControllers,
                        futureParentElement = options.futureParentElement,
                        $linkNode,
                        controllerName;

                    // When `parentBoundTranscludeFn` is passed, it is a
                    // `controllersBoundTransclude` function (it was previously passed
                    // as `transclude` to directive.link) so we must unwrap it to get
                    // its `boundTranscludeFn`
                    if (parentBoundTranscludeFn && parentBoundTranscludeFn.$$boundTransclude) {
                        parentBoundTranscludeFn = parentBoundTranscludeFn.$$boundTransclude;
                    }

                    if (!namespace) {
                        namespace = detectNamespaceForChildElements(futureParentElement);
                    }

                    if (namespace !== 'html') {
                        $linkNode = jqLite(
                            wrapTemplate(namespace, jqLite('<div>').append($compileNodes).html())
                        );

                    } else if (cloneConnectFn) {
                        // important!!: we must call our jqLite.clone() since the jQuery one is trying to be smart
                        // and sometimes changes the structure of the DOM.
                        $linkNode = JQLitePrototype.clone.call($compileNodes);
                    } else {
                        $linkNode = $compileNodes;
                    }

                    if (transcludeControllers) {
                        for (controllerName in transcludeControllers) {
                            $linkNode.data('$' + controllerName + 'Controller', transcludeControllers[controllerName].instance);
                        }
                    }

                    compile.$$addScopeInfo($linkNode, scope);

                    if (cloneConnectFn) { cloneConnectFn($linkNode, scope); }
                    if (compositeLinkFn_cpl) { compositeLinkFn_cpl(scope, $linkNode, $linkNode, parentBoundTranscludeFn); }

                    return $linkNode;
                };
            };

            compile.$$addBindingInfo = debugInfoEnabled_CP
                ? function $$addBindingInfo($element, binding) {
                    var bindings = $element.data('$binding') || [];

                    if (_.isArray(binding)) {
                        bindings = bindings.concat(binding);
                    } else {
                        bindings.push(binding);
                    }

                    $element.data('$binding', bindings);
                }
                : noop;

            compile.$$addBindingClass = debugInfoEnabled_CP
                ? function $$addBindingClass($element) {
                    safeAddClass($element, 'ng-binding');
                }
                : noop;

            compile.$$addScopeInfo = debugInfoEnabled_CP
                ? function $$addScopeInfo($element, scope, isolated, noTemplate) {
                    var dataName = isolated ? (noTemplate ? '$isolateScopeNoTemplate' : '$isolateScope') : '$scope';
                    $element.data(dataName, scope);
                }
                : noop;

            compile.$$addScopeClass = debugInfoEnabled_CP
                ? function $$addScopeClass($element, isolated) {
                    safeAddClass($element, isolated ? 'ng-isolate-scope' : 'ng-scope');
                }
                : noop;

            return compile;
        }];
    }

    $controllerMinErr = minErr('$controller');

    $CompileProvider.$inject = ['$provide', '$$sanitizeUriProvider'];

    function $ControllerProvider() {
        var temp_cp = 'ng - $ControllerProvider',
            controllers = {},
            globals = false,
            CNTRL_REG = /^(\S+)(\s+as\s+(\w+))?$/;

        this.register = function (name, constructor) {
            assertNotHasOwnProperty(name, 'controller');
            if (_.isObject(name)) {
                extend(controllers, name);
            } else {
                controllers[name] = constructor;
            }
        };

        this.allowGlobals = function () {
            globals = true;
        };

        this.$get = ['$injector', '$window', function ($injector, $window) {

            function addIdentifier(locals, identifier, instance, name) {

                if (!(locals && _.isObject(locals.$scope))) {
                    throw minErr('$controller')(
                        'noscp',
                        "Cannot export controller '{0}' as '{1}'! No $scope object provided via `locals`.",
                        name,
                        identifier
                    );
                }

                locals.$scope[identifier] = instance;
            }

            return function (expression, locals, later, ident) {
                var instance,
                    match,
                    constructor,
                    identifier,
                    controllerPrototype;

                later = later === true;

                if (ident && _.isString(ident)) {
                    identifier = ident;
                }

                if (_.isString(expression)) {
                    match = expression.match(CNTRL_REG);

                    if (!match) {
                        throw $controllerMinErr(
                            'ctrlfmt',
                            "Badly formed controller string '{0}'. Must match `__name__ as __id__` or `__name__`.",
                            expression
                        );
                    }

                    constructor = match[1];
                    identifier = identifier || match[3];

                    msos.console.debug(
                        temp_cp + ' - $get -> start: ' + expression
                      + (constructor ? ', constructor: ' + constructor : '')
                      + (identifier ? ', identifier: ' + identifier : '')
                    );

                    expression = controllers.hasOwnProperty(constructor)
                        ? controllers[constructor]
                        : getter(locals.$scope, constructor, true)
                            || (globals ? getter($window, constructor, true) : undefined);

                    assertArgFn(expression, constructor, true);
                } else {
                    msos.console.debug(temp_cp + ' - $get -> start, for expression object.');
                }

                if (later) {

                    controllerPrototype = (
                        _.isArray(expression)
                            ? expression[expression.length - 1]
                            : expression
                    ).prototype;

                    instance = Object.create(controllerPrototype || null);

                    if (identifier) {
                        addIdentifier(
                            locals,
                            identifier,
                            instance,
                            constructor || expression.name
                        );
                    }

                    msos.console.debug(temp_cp + ' - $get -> flagged later, done!');

                    return extend(
                        function () {
                            $injector.invoke(expression, instance, locals, constructor);
                            return instance;
                        },
                        {
                            instance: instance,
                            identifier: identifier
                        }
                    );
                }

                instance = $injector.instantiate(expression, locals, constructor);

                if (identifier) {
                    addIdentifier(
                        locals,
                        identifier,
                        instance,
                        constructor || expression.name
                    );
                }

                msos.console.debug(temp_cp + ' - $get -> done!');
                return instance;
            };
        }];
    }

    function $DocumentProvider() {
        this.$get = ['$window', function (window) {
            return jqLite(window.document);
        }];
    }

    function $ExceptionHandlerProvider() {
        this.$get = ['$log', function ($log) {
            return function () {
                $log.error.apply($log, arguments);
            };
        }];
    }

    function isJsonLike(str) {
        var jsonStart = str.match(JSON_START);
        return jsonStart && JSON_ENDS[jsonStart[0]].test(str);
    }

    function defaultHttpResponseTransform(data, headers) {
        var contentType,
            tempData;

        if (_.isString(data)) {
            // Strip json vulnerability protection prefix and trim whitespace
            tempData = data.replace(JSON_PROTECTION_PREFIX, '').trim();

            if (tempData) {
                contentType = headers('Content-Type');
                if ((contentType && (contentType.indexOf(APPLICATION_JSON) === 0)) || isJsonLike(tempData)) {
                    data = fromJson(tempData);
                }
            }
        }

        return data;
    }

    function parseHeaders(headers) {
        var parsed = createMap(),
            key,
            val,
            i;

        if (!headers) { return parsed; }

        forEach(headers.split('\n'), function (line) {
            i = line.indexOf(':');
            key = lowercase(trim(line.substr(0, i)));
            val = trim(line.substr(i + 1));

            if (key) {
                parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
            }
        });

        return parsed;
    }

    function headersGetter(headers) {
        var headersObj = _.isObject(headers) ? headers : undefined;

        return function (name) {
            var value;

            if (!headersObj) { headersObj = parseHeaders(headers); }

            if (name) {
                value = headersObj[lowercase(name)];

                if (value === undefined) {
                    value = null;
                }
                return value;
            }

            return headersObj;
        };
    }


    function transformData(data, headers, status, fns) {
        if (_.isFunction(fns)) { return fns(data, headers, status); }

        forEach(
            fns,
            function (fn) {
                data = fn(data, headers, status);
            }
        );

        return data;
    }

    function isSuccess(status) {
        return 200 <= status && status < 300;
    }

    function $HttpProvider() {

        var temp_hp = 'ng - $HttpProvider',
            useApplyAsync = false,
            defaults,
            interceptorFactories;

        this.interceptors = [];

        this.defaults = {
            // transform incoming response data
            transformResponse: [defaultHttpResponseTransform],

            // transform outgoing request data
            transformRequest: [function (d) {
                return _.isObject(d) && !isFile(d) && !isBlob(d) && !isFormData(d) ? toJson(d) : d;
            }],

            // default headers
            headers: {
                common: {
                    'Accept': 'application/json, text/plain, */*'
                },
                post: shallowCopy(CONTENT_TYPE_APPLICATION_JSON),
                put: shallowCopy(CONTENT_TYPE_APPLICATION_JSON),
                patch: shallowCopy(CONTENT_TYPE_APPLICATION_JSON)
            },

            xsrfCookieName: 'XSRF-TOKEN',
            xsrfHeaderName: 'X-XSRF-TOKEN'
        };

        this.useApplyAsync = function (value) {
            if (isDefined(value)) {
                useApplyAsync = !!value;
                return this;
            }

            return useApplyAsync;
        };

        defaults = this.defaults;
        interceptorFactories = this.interceptors;

        this.$get = [
            '$httpBackend', '$browser', '$cacheFactory', '$rootScope', '$q', '$injector',
            function ($httpBackend, $browser, $cacheFactory, $rootScope, $q, $injector) {

                var defaultCache = $cacheFactory('$http'),
                    reversedInterceptors = [];

                function buildUrl(url, params) {

                    if (!params) { return url; }

                    var parts = [];

                    forEachSorted(params, function (value, key) {
                        if (value === null || _.isUndefined(value)) { return; }
                        if (!_.isArray(value)) { value = [value]; }
    
                        forEach(value, function (v) {
                            if (_.isObject(v)) {
                                if (_.isDate(v)) {
                                    v = v.toISOString();
                                } else {
                                    v = toJson(v);
                                }
                            }
                            parts.push(encodeUriQuery(key) + '=' + encodeUriQuery(v));
                        });
                    });
                    if (parts.length > 0) {
                        url += ((url.indexOf('?') === -1) ? '?' : '&') + parts.join('&');
                    }
                    return url;
                }

                function $http(requestConfig) {

                    if (!_.isObject(requestConfig)) {
                        throw minErr('$http')(
                            'badreq',
                            'Http request configuration must be an object.  Received: {0}',
                            requestConfig
                        );
                    }

                    function executeHeaderFns(headers) {
                        var headerContent,
                            processedHeaders = {};

                        forEach(
                            headers,
                            function (headerFn, header) {
                                if (_.isFunction(headerFn)) {
                                    headerContent = headerFn();
                                    if (headerContent !== null) {
                                        processedHeaders[header] = headerContent;
                                    }
                                } else {
                                    processedHeaders[header] = headerFn;
                                }
                            }
                        );

                        return processedHeaders;
                    }


                    function mergeHeaders(config) {
                        var defHeaders = defaults.headers,
                            reqHeaders = extend({}, config.headers),
                            defHeaderName,
                            lowercaseDefHeaderName,
                            reqHeaderName;

                        defHeaders = extend({}, defHeaders.common, defHeaders[lowercase(config.method)]);

                        // using for-in instead of forEach to avoid unecessary iteration after header has been found
                        defaultHeadersIteration: for (defHeaderName in defHeaders) {
                            lowercaseDefHeaderName = lowercase(defHeaderName);

                            for (reqHeaderName in reqHeaders) {
                                if (lowercase(reqHeaderName) === lowercaseDefHeaderName) {
                                    continue defaultHeadersIteration;
                                }
                            }

                            reqHeaders[defHeaderName] = defHeaders[defHeaderName];
                        }

                        // execute if header value is a function for merged headers
                        return executeHeaderFns(reqHeaders);
                    }

                    var config = extend(
                            {
                                method: 'get',
                                transformRequest: defaults.transformRequest,
                                transformResponse: defaults.transformResponse
                            },
                            requestConfig
                        ),
                        serverRequest,
                        chain,
                        promise,
                        thenFn,
                        rejectFn;

                    config.headers = mergeHeaders(requestConfig);
                    config.method = uppercase(config.method);

                    function transformResponse(response) {
                        // make a copy since the response must be cacheable
                        var resp = extend({}, response);

                        if (!response.data) {
                            resp.data = response.data;
                        } else {
                            resp.data = transformData(response.data, response.headers, response.status, config.transformResponse);
                        }

                        return (isSuccess(response.status)) ? resp : $q.reject($q.defer('reject_transformResponse'), resp);
                    }

                    serverRequest = function (config) {
                        var headers = config.headers,
                            reqData = transformData(config.data, headersGetter(headers), undefined, config.transformRequest);

                        // strip content-type if data is undefined
                        if (_.isUndefined(reqData)) {
                            forEach(
                                headers,
                                function (value, header) {
                                    if (lowercase(header) === 'content-type') {
                                        delete headers[header];
                                    }
                                }
                            );
                        }

                        if (_.isUndefined(config.withCredentials) && !_.isUndefined(defaults.withCredentials)) {
                            config.withCredentials = defaults.withCredentials;
                        }

                        function sendReq(config, reqData) {

                            var deferred = $q.defer('sendReq'),
                                promise_srq = deferred.promise,
                                cache,
                                cachedResp,
                                reqHeaders = config.headers,
                                url = buildUrl(config.url, config.params),
                                xsrfValue,
                                temp_sr = ' - $get - serverRequest - sendReq';

                            msos.console.debug(temp_hp + temp_sr + ' -> start, url: ' + url);

                            function resolvePromise(response, status, headers, statusText) {

                                msos.console.debug(temp_hp + temp_sr + ' - resolvePromise -> called.');

                                // normalize internal statuses to 0
                                status = Math.max(status, 0);

                                (isSuccess(status) ? deferred.resolve : deferred.reject)({
                                    data: response,
                                    status: status,
                                    headers: headersGetter(headers),
                                    config: config,
                                    statusText: statusText
                                });
                            }

                            function resolvePromiseWithResult(result) {
                                resolvePromise(
                                    result.data,
                                    result.status,
                                    shallowCopy(result.headers()),
                                    result.statusText
                                );
                            }

                            function done(status, response, headersString, statusText) {
                                var db_done = '';

                                msos.console.info(temp_hp + temp_sr + ' - done -> start, url: ' + url + ', phase: ' + $rootScope.$$phase);

                                if (cache) {
                                    if (isSuccess(status)) {
                                        cache.put(url, [status, response, parseHeaders(headersString), statusText]);
                                        db_done = ', added to cache';
                                    } else {
                                        // remove promise from the cache
                                        cache.remove(url);
                                        db_done = ', removed from cache';
                                    }
                                }

                                function resolveHttpPromise() {
                                    resolvePromise(response, status, headersString, statusText);
                                }

                                if (useApplyAsync) {
                                    db_done = 'useApplyAsync' + db_done;
                                    $rootScope.$applyAsync(resolveHttpPromise);
                                } else {
                                    db_done = 'resolveHttpPromise' + db_done;
                                    resolveHttpPromise();

                                    if (!$rootScope.$$phase) { $rootScope.$apply(); }
                                }
                                // Its done...done!
                                msos.console.info(temp_hp + temp_sr + ' - done ->  done, url: ' + url + ', by: ' + db_done);
                            }

                            function removePendingReq() {
                                var idx = $http.pendingRequests.indexOf(config);

                                if (idx !== -1) { $http.pendingRequests.splice(idx, 1); }
                            }

                            $http.pendingRequests.push(config);

                            promise_srq.then(removePendingReq, removePendingReq);

                            if ((config.cache || defaults.cache) && config.cache !== false && (config.method === 'GET' || config.method === 'JSONP')) {
                                cache = _.isObject(config.cache) ? config.cache : _.isObject(defaults.cache) ? defaults.cache : defaultCache;
                            }

                            if (cache) {
                                cachedResp = cache.get(url);

                                if (isDefined(cachedResp)) {
                                    if (isPromiseLike(cachedResp)) {
                                        // cached request has already been sent, but there is no response yet
                                        cachedResp.then(resolvePromiseWithResult, resolvePromiseWithResult);
                                    } else {
                                        // serving from cache
                                        if (_.isArray(cachedResp)) {
                                            resolvePromise(cachedResp[1], cachedResp[0], shallowCopy(cachedResp[2]), cachedResp[3]);
                                        } else {
                                            resolvePromise(cachedResp, 200, {}, 'OK');
                                        }
                                    }
                                } else {
                                    // put the promise for the non-transformed response into cache as a placeholder
                                    cache.put(url, promise_srq);
                                }
                            }

                            // if we won't have the response in cache, set the xsrf headers and
                            // send the request to the backend
                            if (_.isUndefined(cachedResp)) {
                                xsrfValue = urlIsSameOrigin(config.url) ? $browser.cookies()[config.xsrfCookieName || defaults.xsrfCookieName] : undefined;
                                if (xsrfValue) {
                                    reqHeaders[(config.xsrfHeaderName || defaults.xsrfHeaderName)] = xsrfValue;
                                }

                                $httpBackend(config.method, url, reqData, done, reqHeaders, config.timeout, config.withCredentials, config.responseType);
                            }

                            msos.console.debug(temp_hp + temp_sr + ' -> done!');

                            return promise_srq;
                        }

                        // send request
                        return sendReq(config, reqData).then(transformResponse, transformResponse);
                    };

                    chain = [serverRequest, undefined];
                    promise = $q.when($q.defer('when_$http'), config);

                    // apply interceptors
                    forEach(reversedInterceptors, function (interceptor) {
                        if (interceptor.request || interceptor.requestError) {
                            chain.unshift(interceptor.request, interceptor.requestError);
                        }
                        if (interceptor.response || interceptor.responseError) {
                            chain.push(interceptor.response, interceptor.responseError);
                        }
                    });

                    while (chain.length) {
                        thenFn = chain.shift();
                        rejectFn = chain.shift();

                        promise = promise.then(thenFn, rejectFn);
                    }

                    promise.success = function (fn) {
                        promise.then(function (response) {
                            fn(response.data, response.status, response.headers, config);
                        });
                        return promise;
                    };

                    promise.error = function (fn) {
                        promise.then(null, function (response) {
                            fn(response.data, response.status, response.headers, config);
                        });
                        return promise;
                    };

                    return promise;
                }

                function createShortMethods() {
                    forEach(arguments, function (name) {
                        $http[name] = function (url, config) {
                            return $http(extend(config || {}, {
                                method: name,
                                url: url
                            }));
                        };
                    });
                }

                function createShortMethodsWithData() {
                    forEach(arguments, function (name) {
                        $http[name] = function (url, data, config) {
                            return $http(extend(config || {}, {
                                method: name,
                                url: url,
                                data: data
                            }));
                        };
                    });
                }

                forEach(interceptorFactories, function (interceptorFactory) {
                    reversedInterceptors.unshift(_.isString(interceptorFactory) ? $injector.get(interceptorFactory) : $injector.invoke(interceptorFactory));
                });

                $http.pendingRequests = [];

                createShortMethods('get', 'delete', 'head', 'jsonp');

                createShortMethodsWithData('post', 'put', 'patch');

                $http.defaults = defaults;

                return $http;
            }
        ];
    }

    function createXhr() {
        return new window.XMLHttpRequest();
    }

    function createHttpBackend($browser, createXhr, $browserDefer, callbacks, rawDocument) {

        function jsonpReq(url, callbackId, done) {
            // we can't use jQuery/jqLite here because jQuery does crazy shit with script elements, e.g.:
            // - fetches local scripts via XHR and evals them
            // - adds and immediately removes script elements from the document
            var script = rawDocument.createElement('script'),
                callback = null;

            script.type = "text/javascript";
            script.src = url;
            script.async = true;

            callback = function (event) {
                removeEventListenerFn(script, "load", callback);
                removeEventListenerFn(script, "error", callback);
                rawDocument.body.removeChild(script);
                script = null;

                var status = -1,
                    text = "unknown";

                if (event) {
                    if (event.type === "load" && !callbacks[callbackId].called) {
                        event = {
                            type: "error"
                        };
                    }
                    text = event.type;
                    status = event.type === "error" ? 404 : 200;
                }

                if (done) {
                    done(status, text);
                }
            };

            addEventListenerFn(script, "load", callback);
            addEventListenerFn(script, "error", callback);
            rawDocument.body.appendChild(script);
            return callback;
        }

        return function (method, url, post, callback, headers, timeout, withCredentials, responseType) {
            var callbackId,
                jsonpDone,
                xhr,
                timeoutId,
                requestError;

            $browser.$$incOutstandingRequestCount();
            url = url || $browser.url();

            function timeoutRequest() {
                if (jsonpDone) { jsonpDone(); }
                if (xhr) { xhr.abort(); }
            }

            function completeRequest(callback, status, response, headersString, statusText) {
                // cancel timeout and subsequent timeout promise resolution
                if (timeoutId !== undefined) {
                    $browserDefer.cancel(timeoutId);
                }

                jsonpDone = xhr = null;

                callback(
                    status,
                    response,
                    headersString,
                    statusText
                );

                $browser.$$completeOutstandingRequest(noop);
            }

            if (lowercase(method) === 'jsonp') {
                callbackId = '_' + (callbacks.counter).toString(36);
                callbacks.counter += 1;
                callbacks[callbackId] = function (data) {
                    callbacks[callbackId].data = data;
                    callbacks[callbackId].called = true;
                };

                jsonpDone = jsonpReq(
                    url.replace('JSON_CALLBACK', 'angular.callbacks.' + callbackId),
                    callbackId,
                    function (status, text) {
                        completeRequest(callback, status, callbacks[callbackId].data, "", text);
                        callbacks[callbackId] = noop;
                    }
                );
            } else {

                xhr = createXhr();

                xhr.open(method, url, true);

                forEach(headers, function (value, key) {
                    if (isDefined(value)) {
                        xhr.setRequestHeader(key, value);
                    }
                });

                xhr.onload = function requestLoaded() {
                    var statusText = xhr.statusText || '',
                        response = xhr.hasOwnProperty('response') ? xhr.response : xhr.responseText,
                        status = xhr.status === 1223 ? 204 : xhr.status;

                    if (status === 0) {
                        status = response ? 200 : urlResolve(url, 'xhr onload').protocol === 'file' ? 404 : 0;
                    }

                    completeRequest(
                        callback,
                        status,
                        response,
                        xhr.getAllResponseHeaders(),
                        statusText
                    );
                };

                requestError = function () {
                    completeRequest(
                        callback,
                        -1,
                        null,
                        null,
                        ''
                    );
                };

                xhr.onerror = requestError;
                xhr.onabort = requestError;

                if (withCredentials) {
                    xhr.withCredentials = true;
                }

                if (responseType) {
                    try {
                        xhr.responseType = responseType;
                    } catch (e) {
                        if (responseType !== 'json') {
                            throw e;
                        }
                    }
                }

                xhr.send(post || null);
            }

            if (timeout > 0) {
                timeoutId = $browserDefer(timeoutRequest, timeout);
            } else if (isPromiseLike(timeout)) {
                timeout.then(timeoutRequest);
            }
        };
    }

    function $HttpBackendProvider() {
        this.$get = ['$browser', '$window', '$document', function ($browser, $window, $document) {
            return createHttpBackend($browser, createXhr, $browser.defer, $window.angular.callbacks, $document[0]);
        }];
    }

    $interpolateMinErr = minErr('$interpolate');

    function $InterpolateProvider() {
        var temp_ip = 'ng - $InterpolateProvider - ',
            startSymbol = '{{',
            endSymbol = '}}';

        this.startSymbol = function (value) {
            if (value) {
                startSymbol = value;
                return this;
            }
            return startSymbol;
        };

        this.endSymbol = function (value) {
            if (value) {
                endSymbol = value;
                return this;
            }
            return endSymbol;
        };

        this.$get = ['$parse', '$sce', function ($parse, $sce) {

            function escape(ch) {
                return '\\\\\\' + ch;
            }

            var startSymbolLength = startSymbol.length,
                endSymbolLength = endSymbol.length,
                escapedStartRegexp = new RegExp(startSymbol.replace(/./g, escape), 'g'),
                escapedEndRegexp = new RegExp(endSymbol.replace(/./g, escape), 'g');

            function $interpolate(text, mustHaveExpression, trustedContext, allOrNothing) {

                allOrNothing = !!allOrNothing;

                var temp_it = '$get - $interpolate - ',
                    startIndex,
                    endIndex,
                    index = 0,
                    expressions = [],
                    parseFns = [],
                    textLength = text.length,
                    exp,
                    int_concat = [],
                    expressionPositions = [],
                    compute = function (values) {
                        var i = 0;
                        for (i = 0; i < expressions.length; i += 1) {
                            if (allOrNothing && _.isUndefined(values[i])) { return undefined; }
                            int_concat[expressionPositions[i]] = values[i];
                        }
                        return int_concat.join('');
                    },
                    getValue = function (value) {
                        return trustedContext ? $sce.getTrusted(trustedContext, value) : $sce.valueOf(value);
                    },
                    stringify = function (value) {
                        if (value == null) {    // jshint ignore:line
                            return '';
                        }

                        switch (typeof value) {
                            case 'string':
                            break;

                            case 'number':
                                value = String(value);
                            break;

                            default:
                                value = toJson(value);
                        }

                        return value;
                    };

                function unescapeText(text) {
                    return text.replace(escapedStartRegexp, startSymbol).
                    replace(escapedEndRegexp, endSymbol);
                }

                function parseStringifyInterceptor(value) {
                    try {
                        value = getValue(value);
                        return allOrNothing && !isDefined(value) ? value : stringify(value);
                    } catch (err) {
                        var newErr = $interpolateMinErr(
                                'interr',
                                "Can't interpolate: {0}\n",
                                text
                            );

                        msos.console.error(temp_ip + temp_it + 'parseStringifyInterceptor -> failed: ' + newErr, err);
                    }
                    return undefined;
                }

                while (index < textLength) {
                    startIndex = text.indexOf(startSymbol, index);
                    endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength);
                    if (startIndex !== -1 && endIndex !== -1) {
                        if (index !== startIndex) {
                            int_concat.push(unescapeText(text.substring(index, startIndex)));
                        }
                        exp = text.substring(startIndex + startSymbolLength, endIndex);
                        expressions.push(exp);
                        parseFns.push($parse(exp, parseStringifyInterceptor));
                        index = endIndex + endSymbolLength;
                        expressionPositions.push(int_concat.length);
                        int_concat.push('');
                    } else {
                        // we did not find an interpolation, so we have to add the remainder to the separators array
                        if (index !== textLength) {
                            int_concat.push(unescapeText(text.substring(index)));
                        }
                        break;
                    }
                }

                if (trustedContext && int_concat.length > 1) {
                    throw $interpolateMinErr(
                        'noconcat',
                        "Error while interpolating: {0}\nStrict Contextual Escaping disallows interpolations that concatenate multiple expressions when a trusted value is required.",
                        text
                    );
                }

                if (!mustHaveExpression || expressions.length) {

                    return extend(
                        function interpolationFn(context) {
                            var i = 0,
                                values = [],
                                newErr;

                            try {
                                for (i = 0; i < expressions.length; i += 1) {
                                    values[i] = parseFns[i](context);
                                }

                                return compute(values);

                            } catch (err) {
                                newErr = $interpolateMinErr('interr', "Can't interpolate: {0}\n", text);

                                msos.console.error(temp_ip + temp_it + 'interpolationFn -> failed: ' + newErr, err);
                            }

                            return undefined;
                        },
                        {
                            exp: text,
                            expressions: expressions,
                            $$watchDelegate: function (scope, listener, objectEquality) {
                                var lastValue;
                                return scope.$watchGroup(
                                        parseFns,
                                        function interpolateFnWatcher(values, oldValues) {
                                            var currValue = compute(values);
                                            if (_.isFunction(listener)) {
                                                listener.call(this, currValue, values !== oldValues ? lastValue : currValue, scope);
                                            }
                                            lastValue = currValue;
                                        },
                                        objectEquality
                                    );
                            }
                        }
                    );
                }

                return undefined;
            }

            $interpolate.startSymbol = function () {
                return startSymbol;
            };

            $interpolate.endSymbol = function () {
                return endSymbol;
            };

            return $interpolate;
        }];
    }

    function $IntervalProvider() {
        this.$get = ['$rootScope', '$window', '$q', '$$q', function ($rootScope, $window, $q, $$q) {
            var intervals = {},
                temp_ipg = 'ng - $IntervalProvider - $get';

            function interval(fn, delay, count, invokeApply) {
                var temp_in = ' - interval',
                    setInterval = $window.setInterval,
                    clearInterval = $window.clearInterval,
                    iteration = 0,
                    skipApply = (isDefined(invokeApply) && !invokeApply),
                    deferred = (skipApply ? $$q : $q).defer('interval'),
                    promise = deferred.promise;

                msos.console.debug(temp_ipg + temp_in + ' -> start, name: ' + promise.$$state.name);

                count = isDefined(count) ? count : 0;

                promise.then(null, null, fn);

                promise.$$intervalId = setInterval(
                    function tick() {

                        msos.console.info(temp_ipg + temp_in + ' - tick -> start, name: ' + promise.$$state.name + ', iteration: ' + iteration);

                        deferred.notify(iteration);
                        iteration += 1;

                        if (count > 0 && iteration >= count) {
                            deferred.resolve(iteration);
                            clearInterval(promise.$$intervalId);
                            delete intervals[promise.$$intervalId];
                        }

                        if (!skipApply) { $rootScope.$apply(); }

                        msos.console.info(temp_ipg + temp_in + ' - tick -> done!');
                    },
                    delay
                );

                intervals[promise.$$intervalId] = deferred;

                msos.console.debug(temp_ipg + temp_in + ' -> done!');
                return promise;
            }

            interval.cancel = function (promise) {

                if (promise && intervals.hasOwnProperty(promise.$$intervalId)) {
                    intervals[promise.$$intervalId].reject('canceled');
                    $window.clearInterval(promise.$$intervalId);
                    delete intervals[promise.$$intervalId];
                    return true;
                }
                return false;
            };

            return interval;
        }];
    }

    function $LocaleProvider() {
        this.$get = function () {
            return {
                id: 'en-us',

                NUMBER_FORMATS: {
                    DECIMAL_SEP: '.',
                    GROUP_SEP: ',',
                    PATTERNS: [{ // Decimal Pattern
                        minInt: 1,
                        minFrac: 0,
                        maxFrac: 3,
                        posPre: '',
                        posSuf: '',
                        negPre: '-',
                        negSuf: '',
                        gSize: 3,
                        lgSize: 3
                    }, { //Currency Pattern
                        minInt: 1,
                        minFrac: 2,
                        maxFrac: 2,
                        posPre: '\u00A4',
                        posSuf: '',
                        negPre: '(\u00A4',
                        negSuf: ')',
                        gSize: 3,
                        lgSize: 3
                    }],
                    CURRENCY_SYM: '$'
                },

                DATETIME_FORMATS: {
                    MONTH: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                    SHORTMONTH: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    DAY: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                    SHORTDAY: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                    AMPMS: ['AM', 'PM'],
                    medium: 'MMM d, y h:mm:ss a',
                    'short': 'M/d/yy h:mm a',
                    fullDate: 'EEEE, MMMM d, y',
                    longDate: 'MMMM d, y',
                    mediumDate: 'MMM d, y',
                    shortDate: 'M/d/yy',
                    mediumTime: 'h:mm:ss a',
                    shortTime: 'h:mm a'
                },

                pluralCat: function (num) {
                    if (num === 1) {
                        return 'one';
                    }
                    return 'other';
                }
            };
        };
    }

    $locationMinErr = minErr('$location');

    function encodePath(path) {
        var segments = path.split('/'),
            i = segments.length;

        while (i) {
            i -= 1;
            segments[i] = encodeUriSegment(segments[i]);
        }

        return segments.join('/');
    }

    function parseAppUrl(relativeUrl, locationObj) {
        var temp_pa = 'ng - parseAppUrl -> ',
            prefixed = (relativeUrl.charAt(0) !== '/'),
            match;

        // Always make it something (ie: /)
        if (prefixed) {
            relativeUrl = '/' + relativeUrl;
        }

        msos.console.debug(temp_pa + 'start, relative url: ' + relativeUrl + ', prefixed: ' + prefixed);

        match = urlResolve(relativeUrl, 'parseAppUrl');

        locationObj.$$path = decodeURIComponent(prefixed && match.pathname.charAt(0) === '/' ? match.pathname.substring(1) : match.pathname);
        locationObj.$$search = match.params;
        locationObj.$$hash = decodeURIComponent(match.hash);

        // make sure path starts with '/';
        if (locationObj.$$path && locationObj.$$path.charAt(0) !== '/') {
            locationObj.$$path = '/' + locationObj.$$path;
        }

        msos.console.debug(temp_pa + 'done, Location Object:', locationObj);
    }

    function beginsWith(begin, whole) {
        if (whole.indexOf(begin) === 0) {
            return whole.substr(begin.length);
        }
        return undefined;
    }

    function stripFile(url) {
        return url.substr(0, stripHash(url).lastIndexOf('/') + 1);
    }

    /* return the server only (scheme://host:port) */
    function serverBase(url) {
        return url.substring(0, url.indexOf('/', url.indexOf('//') + 2));
    }

    function LocationHtml5Url(appBase, basePrefix) {

        this.$$html5 = true;
        basePrefix = basePrefix || '';

        var temp_lh5 = 'ng - LocationHtml5Url',
            appBaseNoFile = stripFile(appBase);

        msos.console.debug(temp_lh5 + ' -> start, app base: ' + appBase + (basePrefix ? ', base prefix: ' + basePrefix : ''));

        this.$$protocol = originUrl.protocol;
        this.$$host = originUrl.hostname;
        this.$$port = parseInt(originUrl.port, 10) || DEFAULT_PORTS[originUrl.protocol] || null;

        this.$$parse = function (url) {

            msos.console.debug(temp_lh5 + ' - $$parse -> start, url: ' + url);

            var pathUrl = beginsWith(appBaseNoFile, url);

            if (!_.isString(pathUrl)) {
                throw $locationMinErr('ipthprfx', 'Invalid url "{0}", missing path prefix "{1}".', url, appBaseNoFile);
            }

            parseAppUrl(pathUrl, this);

            if (!this.$$path) {
                this.$$path = '/';
            }

            this.$$compose();

            msos.console.debug(temp_lh5 + ' - $$parse -> done!');
        };

        this.$$compose = function () {
            var search = toKeyValue(this.$$search),
                hash = this.$$hash ? '#' + encodeUriSegment(this.$$hash) : '';

            this.$$url = encodePath(this.$$path) + (search ? '?' + search : '') + hash;
            this.$$absUrl = appBaseNoFile + this.$$url.substr(1); // first char is always '/'
        };

        this.$$parseLinkUrl = function (url, relHref) {
            
            if (relHref && relHref[0] === '#') {
                // special case for links to hash fragments:
                // keep the old url and only replace the hash fragment
                this.hash(relHref.slice(1));
                return true;
            }

            var appUrl = beginsWith(appBase, url),
                appUrlNF = beginsWith(appBaseNoFile, url),
                prevAppUrl,
                rewrittenUrl;
            
            if (appUrl !== undefined) {
                prevAppUrl = appUrl;

                appUrl = beginsWith(basePrefix, appUrl);

                if (appUrl !== undefined) {
                    rewrittenUrl = appBaseNoFile + (beginsWith('/', appUrl) || appUrl);
                } else {
                    rewrittenUrl = appBase + prevAppUrl;
                }
            } else if (appUrlNF !== undefined) {
                rewrittenUrl = appBaseNoFile + appUrlNF;
            } else if (appBaseNoFile === url + '/') {
                rewrittenUrl = appBaseNoFile;
            }

            if (rewrittenUrl) {
                this.$$parse(rewrittenUrl);
            }
            return !!rewrittenUrl;
        };

        msos.console.debug(temp_lh5 + ' -> done!');
    }

    function LocationHashbangUrl(appBase, hashPrefix) {

        var temp_hb = 'ng - LocationHashbangUrl',
            appBaseNoFile = stripFile(appBase);

        msos.console.debug(temp_hb + ' -> start, app base: ' + appBase + (hashPrefix ? ', hash prefix: ' + hashPrefix : ''));

        this.$$protocol = originUrl.protocol;
        this.$$host = originUrl.hostname;
        this.$$port = parseInt(originUrl.port, 10) || DEFAULT_PORTS[originUrl.protocol] || null;

        this.$$parse = function (url) {

            msos.console.debug(temp_hb + ' - $$parse -> start, url: ' + url);
    
            var withoutBaseUrl = beginsWith(appBase, url) || beginsWith(appBaseNoFile, url),
                withoutHashUrl;


            if (withoutBaseUrl.charAt(0) === '#') {
                withoutHashUrl = beginsWith(hashPrefix, withoutBaseUrl);
                if (_.isUndefined(withoutHashUrl)) {
                    withoutHashUrl = withoutBaseUrl;
                }
            } else {
                withoutHashUrl = this.$$html5 ? withoutBaseUrl : '';
            }

            function removeWindowsDriveName(path, url, base) {
                /*
                    Matches paths for file protocol on windows,
                    such as /C:/foo/bar, and captures only /foo/bar.
                */
                var windowsFilePathExp = /^\/[A-Z]:(\/.*)/,
                    firstPathSegmentMatch;

                //Get the relative path from the input URL.
                if (url.indexOf(base) === 0) {
                    url = url.replace(base, '');
                }

                // The input URL intentionally contains a first path segment that ends with a colon.
                if (windowsFilePathExp.exec(url)) {
                    return path;
                }

                firstPathSegmentMatch = windowsFilePathExp.exec(path);

                return firstPathSegmentMatch ? firstPathSegmentMatch[1] : path;
            }

            parseAppUrl(withoutHashUrl, this);

            this.$$path = removeWindowsDriveName(this.$$path, withoutHashUrl, appBase);

            this.$$compose();

            msos.console.debug(temp_hb + ' - $$parse -> done!');
        };

        this.$$compose = function () {
            var search = toKeyValue(this.$$search),
                hash = this.$$hash ? '#' + encodeUriSegment(this.$$hash) : '';

            this.$$url = encodePath(this.$$path) + (search ? '?' + search : '') + hash;
            this.$$absUrl = appBase + (this.$$url ? hashPrefix + this.$$url : '');
        };

        this.$$parseLinkUrl = function (url) {
            if (stripHash(appBase) === stripHash(url)) {
                this.$$parse(url);
                return true;
            }
            return false;
        };

        msos.console.debug(temp_hb + ' -> done!');
    }

    function LocationHashbangInHtml5Url(appBase, hashPrefix) {
        this.$$html5 = true;
        LocationHashbangUrl.apply(this, arguments);

        var appBaseNoFile = stripFile(appBase);

        this.$$parseLinkUrl = function (url, relHref) {

            if (relHref && relHref[0] === '#') {
                // special case for links to hash fragments:
                // keep the old url and only replace the hash fragment
                this.hash(relHref.slice(1));
                return true;
            }

            var rewrittenUrl,
                appUrl = beginsWith(appBaseNoFile, url);

            if (appBase === stripHash(url)) {
                rewrittenUrl = url;
            } else if (appUrl) {
                rewrittenUrl = appBase + hashPrefix + appUrl;
            } else if (appBaseNoFile === url + '/') {
                rewrittenUrl = appBaseNoFile;
            }

            if (rewrittenUrl) {
                this.$$parse(rewrittenUrl);
            }

            return !!rewrittenUrl;
        };

        this.$$compose = function () {
            var search = toKeyValue(this.$$search),
                hash = this.$$hash ? '#' + encodeUriSegment(this.$$hash) : '';

            this.$$url = encodePath(this.$$path) + (search ? '?' + search : '') + hash;
            // include hashPrefix in $$absUrl when $$url is empty so IE8 & 9 do not reload page because of removal of '#'
            this.$$absUrl = appBase + hashPrefix + this.$$url;
        };
    }

    function locationGetter(property) {
        return function () {
            return this[property];
        };
    }

    function locationGetterSetter(property, preprocess) {
        return function (value) {
            if (_.isUndefined(value)) {
                return this[property];
            }

            this[property] = preprocess(value);
            this.$$compose();

            return this;
        };
    }

    locationPrototype = {

        $$html5: false,
        $$replace: false,
        absUrl: locationGetter('$$absUrl'),

        url: function (url) {
            if (_.isUndefined(url)) { return this.$$url; }

            var match = PATH_MATCH.exec(url);

            if (match[1]) { this.path(decodeURIComponent(match[1])); }
            if (match[2] || match[1]) { this.search(match[3] || ''); }

            this.hash(match[5] || '');

            msos.console.debug('ng - locationPrototype - url -> called, output:', this);
            return this;
        },

        protocol:   locationGetter('$$protocol'),
        host:       locationGetter('$$host'),
        port:       locationGetter('$$port'),

        path: locationGetterSetter(
            '$$path',
            function (path) {
                path = path !== null ? path.toString() : '';
                return path.charAt(0) === '/' ? path : '/' + path;
            }
        ),

        search: function (srch, paramValue) {

            switch (arguments.length) {

                case 0:
                    return this.$$search;

                case 1:
                    if (_.isString(srch) || _.isNumber(srch)) {
                        srch = srch.toString();
                        this.$$search = msos.parse_string(srch);
                    } else if (_.isObject(srch)) {
                        srch = copy(srch, {});
                        // remove object undefined or null properties
                        forEach(
                            srch,
                            function (value, key) {
                                if (value === null) { delete srch[key]; }
                            }
                        );

                        this.$$search = srch;
                    } else {
                        throw $locationMinErr(
                            'isrcharg',
                            'The first argument of the `$location#search()` call must be a string or an object.'
                        );
                    }
                break;

                default:
                    if (_.isUndefined(paramValue) || paramValue === null) {
                        delete this.$$search[srch];
                    } else {
                        this.$$search[srch] = paramValue;
                    }
            }

            this.$$compose();

            return this;
        },

        hash: locationGetterSetter(
            '$$hash',
            function (hash) {
                return hash !== null ? hash.toString() : '';
            }
        ),

        replace: function () {
            this.$$replace = true;
            return this;
        }
    };

    forEach(
        [LocationHashbangInHtml5Url, LocationHashbangUrl, LocationHtml5Url],
        function (Location) {
            Location.prototype = Object.create(locationPrototype);

            Location.prototype.state = function (state) {
                if (!arguments.length) {
                    return this.$$state;
                }

                if (Location !== LocationHtml5Url || !this.$$html5) {
                    throw $locationMinErr(
                        'nostate',
                        'History API state support is available only in HTML5 mode and only in browsers supporting HTML5 History API'
                    );
                }

                this.$$state = _.isUndefined(state) ? null : state;

                return this;
            };
        }
    );

    function $LocationProvider() {
        var temp_lp = 'ng - $LocationProvider',
            hashPrefix = '',
            html5Mode = {
                enabled: false,
                requireBase: true,
                rewriteLinks: true
            };

        msos.console.debug(temp_lp + ' -> start.');

        this.hashPrefix = function (prefix) {
            if (isDefined(prefix)) {
                hashPrefix = prefix;
                return this;
            }

            return hashPrefix;
        };

        this.html5Mode = function (mode) {
            if (_.isBoolean(mode)) {
                html5Mode.enabled = mode;
                return this;
            }
            
            if (_.isObject(mode)) {

                if (_.isBoolean(mode.enabled)) {
                    html5Mode.enabled = mode.enabled;
                }

                if (_.isBoolean(mode.requireBase)) {
                    html5Mode.requireBase = mode.requireBase;
                }

                if (_.isBoolean(mode.rewriteLinks)) {
                    html5Mode.rewriteLinks = mode.rewriteLinks;
                }

                return this;
            }

            return html5Mode;
        };

        this.$get = ['$rootScope', '$browser', '$rootElement', function ($rootScope, $browser, $rootElement) {

            var $location_LP,
                LocationMode,
                initialUrl,
                IGNORE_URI_REGEXP = /^\s*(javascript|mailto):/i,
                appBase,
                initializing = true;

            msos.console.debug(temp_lp + ' - $get -> start.');

            initialUrl = originUrl.source;  // was initialUrl = $browser.url(); but we already have it now

            if (html5Mode.enabled) {
                if (!baseHref && html5Mode.requireBase) {
                    throw $locationMinErr(
                        'nobase',
                        "$location in HTML5 mode requires a <base> tag to be present!"
                    );
                }
                appBase = serverBase(initialUrl) + (baseHref || '/');
                LocationMode = Modernizr.history ? LocationHtml5Url : LocationHashbangInHtml5Url;
            } else {
                appBase = stripHash(initialUrl);
                LocationMode = LocationHashbangUrl;
            }

            $location_LP = new LocationMode(appBase, '#' + hashPrefix);
            $location_LP.$$parseLinkUrl(initialUrl, initialUrl);

            $location_LP.$$state = $browser.state();

            function setBrowserUrlWithFallback(url, replace, state) {
                var temp_sbf = ' - $get - setBrowserUrlWithFallback -> ',
                    oldUrl = $location_LP.url(),
                    oldState = $location_LP.$$state;

                try {
                    msos.console.debug(temp_lp + temp_sbf + 'called.');
                    $browser.url(url, replace, state);
                    $location_LP.$$state = $browser.state();
                } catch (e) {
                    // Restore old values if pushState fails
                    $location_LP.url(oldUrl);
                    $location_LP.$$state = oldState;

                    msos.console.warn(temp_lp + temp_sbf + 'pushstate failed:', e);
                }
            }

            function afterLocationChange(oldUrl, oldState) {
                $rootScope.$broadcast('$locationChangeSuccess', $location_LP.absUrl(), oldUrl,
                $location_LP.$$state, oldState);
            }

            $rootElement.on(
                'click',
                function (event) {
                    var temp_re = ' - $get - $rootElement.on:click -> ',
                        tar_name = event.target.id || lowercase(event.target.nodeName),
                        debug = 'no a tag',
                        elm,
                        absHref,
                        relHref;

                    msos.console.debug(temp_lp + temp_re + 'start, target: ' + tar_name);

                    if (!html5Mode.rewriteLinks || event.ctrlKey || event.metaKey || event.shiftKey || event.which == 2 || event.button == 2) {
                        msos.console.debug(temp_lp + temp_re + ' done, target: ' + tar_name + ', ' + (html5Mode.rewriteLinks ? 'html5 rewrite links' : 'skipped event'));
                        return;
                    }

                    elm = jqLite(event.target);

                    // traverse the DOM up to find first A tag
                    while (nodeName_(elm[0]) !== 'a') {
                        // ignore rewriting if no A tag (reached root element, or no parent - removed from document)
                        if (elm[0] === $rootElement[0]) {
                            debug += ', for root element.';
                            msos.console.debug(temp_lp + temp_re + ' done, target: ' + tar_name + ', ' + debug);
                            return;
                        }

                        elm = elm.parent();

                        if (!elm || elm[0]) {
                            debug += ', no parent element.';
                            msos.console.debug(temp_lp + temp_re + ' done, target: ' + tar_name + ', ' + debug);
                            return;
                        }
                    }

                    absHref = elm.prop('href');
                    relHref = elm.attr('href') || elm.attr('xlink:href');

                    if (_.isObject(absHref) && absHref.toString() === '[object SVGAnimatedString]') {
                        absHref = urlResolve(absHref.animVal, 'SVGAnimatedString').href;
                    }

                    // Ignore when url is started with javascript: or mailto:
                    if (IGNORE_URI_REGEXP.test(absHref)) {
                        msos.console.debug(temp_lp + temp_re + ' done, target: ' + tar_name + ', js or mailto url! ');
                        return;
                    }

                    if (absHref && !elm.attr('target') && !event.isDefaultPrevented()) {
                        if ($location_LP.$$parseLinkUrl(absHref, relHref)) {
                            event.preventDefault();
                            // update location manually
                            if ($location_LP.absUrl() !== $browser.url()) {
                                debug = ', update location manually.';
                                $rootScope.$apply();
                            }
                        }
                    }

                    msos.console.debug(temp_lp + temp_re + ' done, target: ' + tar_name + ', ' + debug);
                }
            );

            // rewrite hashbang url <> html5 url
            if (trimEmptyHash($location_LP.absUrl()) != trimEmptyHash(initialUrl)) {
                $browser.url($location_LP.absUrl(), true);
            }

            // update $location when $browser url changes
            $browser.onUrlChange(
                function (newUrl, newState) {
                    $rootScope.$evalAsync(
                        function () {
                            var oldUrl = $location_LP.absUrl(),
                                oldState = $location_LP.$$state,
                                defaultPrevented;

                            $location_LP.$$parse(newUrl);
                            $location_LP.$$state = newState;

                            defaultPrevented = $rootScope.$broadcast(
                                '$locationChangeStart',
                                newUrl,
                                oldUrl,
                                newState,
                                oldState
                            ).defaultPrevented;

                            // if the location was changed by a `$locationChangeStart` handler then stop
                            // processing this location change
                            if ($location_LP.absUrl() !== newUrl) { return; }

                            if (defaultPrevented) {
                                $location_LP.$$parse(oldUrl);
                                $location_LP.$$state = oldState;

                                setBrowserUrlWithFallback(oldUrl, false, oldState);
                            } else {
                                initializing = false;
                                afterLocationChange(oldUrl, oldState);
                            }
                        },
                        { directive_name: '$LocationProvider_$browser_onUrlChange' }
                    );
                    if (!$rootScope.$$phase) { $rootScope.$digest(); }
                }
            );

            // update browser
            $rootScope.$watch(
                function $locationWatch() {
                    var oldUrl = trimEmptyHash($browser.url()),
                        newUrl = trimEmptyHash($location_LP.absUrl()),
                        oldState = $browser.state(),
                        currentReplace = $location_LP.$$replace,
                        urlOrStateChanged = oldUrl !== newUrl ||
                            ($location_LP.$$html5 && Modernizr.history && oldState !== $location_LP.$$state);

                    if (initializing || urlOrStateChanged) {
                        initializing = false;

                        $rootScope.$evalAsync(
                            function () {
                                var temp_ea = ' - $get - $rootScope.$evalAsync -> ',
                                    newUrl_ev = $location_LP.absUrl(),
                                    defaultPrevented = $rootScope.$broadcast(
                                        '$locationChangeStart',
                                        newUrl_ev,
                                        oldUrl,
                                        $location_LP.$$state, oldState
                                    ).defaultPrevented;

                                // Check for weirdness...and acknowledge
                                if (newUrl !== newUrl_ev || newUrl !== trimEmptyHash(newUrl_ev)) {
                                    msos.console.warn(temp_lp + temp_ea + 'newUrl was: ' + newUrl + ', is: ' + newUrl_ev);
                                }

                                // if the location was changed by a $locationChangeStart handler, then stop
                                // processing this location change
                                if ($location_LP.absUrl() !== newUrl_ev) {
                                    msos.console.debug(temp_lp + temp_ea + 'url changed (by a $locationChangeStart): ' + newUrl_ev);
                                    return;
                                }

                                if (defaultPrevented) {
                                    $location_LP.$$parse(oldUrl);
                                    $location_LP.$$state = oldState;
                                } else {
                                    if (urlOrStateChanged) {
                                        setBrowserUrlWithFallback(
                                            newUrl_ev,
                                            currentReplace,
                                            oldState === $location_LP.$$state ? null : $location_LP.$$state
                                        );
                                    }
                                    afterLocationChange(oldUrl, oldState);
                                }
                            },
                            { directive_name: '$LocationProvider_$locationWatch' }
                        );
                    }

                    $location_LP.$$replace = false;
                }
            );

            msos.console.debug(temp_lp + ' - $get -> done!');

            return $location_LP;
        }];

        msos.console.debug(temp_lp + ' -> done!');
    }

    function $LogProvider() {

        this.debugEnabled = function (flag) {
            if (isDefined(flag)) {
                msos.config.debug = flag;
                return this;
            }

            return msos.config.debug;
        };

        this.$get = ['$window', function ($window) {
            return $window.msos.console;
        }];
    }

    $parseMinErr = minErr('$parse');

    function ensureSafeMemberName(name, fullExpression) {
        if (name === "__defineGetter__"
         || name === "__defineSetter__"
         || name === "__lookupGetter__"
         || name === "__lookupSetter__"
         || name === "__proto__") {
            throw $parseMinErr('isecfld', 'Attempting to access a disallowed field in Angular expressions! ' + 'Expression: {0}', fullExpression);
        }
        return name;
    }

    function ensureSafeObject(obj, fullExpression) {
        var ref_txt = ': referencing in Angular expressions is disallowed! Expression: {0}';

        // nifty check if obj is Function that is fast and works across iframes and other contexts
        if (obj) {
            if (obj.constructor === obj) {
                throw $parseMinErr('isecfn', 'Function' + ref_txt, fullExpression);
            }
            if (obj.window === obj) {
                throw $parseMinErr('isecwindow', 'Window' + ref_txt, fullExpression);
            }
            if (obj.children && (obj.nodeName || (obj.prop && obj.attr && obj.find))) {
                throw $parseMinErr('isecdom', 'DOM nodes' + ref_txt, fullExpression);
            }
            if (obj === Object) {
                throw $parseMinErr('isecobj', 'Object' + ref_txt, fullExpression);
            }
            if (obj === CALL || obj === APPLY || obj === BIND) {
                throw $parseMinErr('isecff', 'call, bind, apply' + ref_txt, fullExpression);
            }
        }
        return obj;
    }

    //////////////////////////////////////////////////
    // Parser helper functions
    //////////////////////////////////////////////////

    function setter(obj, locals, path, setValue, fullExp) {
        ensureSafeObject(obj, fullExp);
        ensureSafeObject(locals, fullExp);

        var element = path.split('.'),
            i = 0,
            key,
            propertyObj;

        for (i = 0; element.length > 1; i += 1) {
            key = ensureSafeMemberName(element.shift(), fullExp);
            propertyObj = (i === 0 && locals && locals[key]) || obj[key];

            if (!propertyObj) {
                propertyObj = {};
                obj[key] = propertyObj;
            }
            obj = ensureSafeObject(propertyObj, fullExp);
        }

        key = ensureSafeMemberName(element.shift(), fullExp);
        ensureSafeObject(obj[key], fullExp);
        obj[key] = setValue;
        return setValue;
    }

    getterFnCacheDefault = createMap();
    getterFnCacheExpensive = createMap();

    function isPossiblyDangerousMemberName(name) {
        return name === 'constructor';
    }

    /**
     * Implementation of the "Black Hole" variant from:
     * - http://jsperf.com/angularjs-parse-getter/4
     * - http://jsperf.com/path-evaluation-simplified/7
     */
    function cspSafeGetterFn(key0, key1, key2, key3, key4, fullExp, expensiveChecks) {

        ensureSafeMemberName(key0, fullExp);
        ensureSafeMemberName(key1, fullExp);
        ensureSafeMemberName(key2, fullExp);
        ensureSafeMemberName(key3, fullExp);
        ensureSafeMemberName(key4, fullExp);

        var eso = function (o) {
                return ensureSafeObject(o, fullExp);
            },
            eso0 = (expensiveChecks || isPossiblyDangerousMemberName(key0)) ? eso : identity,
            eso1 = (expensiveChecks || isPossiblyDangerousMemberName(key1)) ? eso : identity,
            eso2 = (expensiveChecks || isPossiblyDangerousMemberName(key2)) ? eso : identity,
            eso3 = (expensiveChecks || isPossiblyDangerousMemberName(key3)) ? eso : identity,
            eso4 = (expensiveChecks || isPossiblyDangerousMemberName(key4)) ? eso : identity;

        return function cspSafeGetter(scope, locals) {
            var pathVal = (locals && locals.hasOwnProperty(key0)) ? locals : scope;

            if (pathVal == null) { return pathVal; }    // jshint ignore:line

            pathVal = eso0(pathVal[key0]);

            if (!key1) { return pathVal; }

            if (pathVal == null) { return undefined; }  // jshint ignore:line

            pathVal = eso1(pathVal[key1]);

            if (!key2) { return pathVal; }

            if (pathVal == null) { return undefined; }  // jshint ignore:line

            pathVal = eso2(pathVal[key2]);

            if (!key3) { return pathVal; }

            if (pathVal == null) { return undefined; }  // jshint ignore:line

            pathVal = eso3(pathVal[key3]);

            if (!key4) { return pathVal; }

            if (pathVal == null) { return undefined; }  // jshint ignore:line

            pathVal = eso4(pathVal[key4]);

            return pathVal;
        };
    }

    function getterFnWithEnsureSafeObject(fn, fullExpression) {
        return function (s, l) {
            return fn(s, l, ensureSafeObject, fullExpression);
        };
    }

    function getterFn(path, options, fullExp) {
        var expensiveChecks = options.expensiveChecks,
            getterFnCache = (expensiveChecks ? getterFnCacheExpensive : getterFnCacheDefault),
            fn = getterFnCache[path],
            pathKeys = path.split('.'),
            pathKeysLength = pathKeys.length,
            code = '',
            needsEnsureSafeObject,
            evaledFnGetter;

        if (fn) { return fn; }

        // http://jsperf.com/angularjs-parse-getter/6
        if (options.csp) {
            if (pathKeysLength < 6) {
                fn = cspSafeGetterFn(pathKeys[0], pathKeys[1], pathKeys[2], pathKeys[3], pathKeys[4], fullExp, expensiveChecks);
            } else {
                fn = function cspSafeGetter(scope, locals) {
                    var i = 0,
                        val;

                    do {
                        val = cspSafeGetterFn(
                                pathKeys[i++],
                                pathKeys[i++],
                                pathKeys[i++],
                                pathKeys[i++],
                                pathKeys[i++],
                                fullExp,
                                expensiveChecks
                            )(scope, locals);
    
                        locals = undefined; // clear after first iteration
                        scope = val;
                    } while (i < pathKeysLength);
    
                    return val;
                };
            }
        } else {

            if (expensiveChecks) {
                code += 's = eso(s, fe);\nl = eso(l, fe);\n';
            }

            needsEnsureSafeObject = expensiveChecks;

            forEach(
                pathKeys,
                function (key, index) {
                    ensureSafeMemberName(key, fullExp);
    
                    var lookupJs = (index
                            // we simply dereference 's' on any .dot notation
                            ? 's'
                            // but if we are first then we check locals first, and if so read it first
                            : '((l && l.hasOwnProperty("' + key + '")) ? l : s)') + '.' + key;

                    if (expensiveChecks || isPossiblyDangerousMemberName(key)) {
                        lookupJs = 'eso(' + lookupJs + ', fe)';
                        needsEnsureSafeObject = true;
                    }

                    code += 'if (s == null) { return undefined; }\n' + 's = ' + lookupJs + ';\n';
                }
            );

            code += 'return s;';

            /* jshint -W054 */
            evaledFnGetter = new Function('s', 'l', 'eso', 'fe', code); // s = scope, l = locals, eso = ensureSafeObject
            /* jshint +W054 */

            evaledFnGetter.toString = valueFn(code);

            if (needsEnsureSafeObject) {
                evaledFnGetter = getterFnWithEnsureSafeObject(evaledFnGetter, fullExp);
            }

            fn = evaledFnGetter;
        }

        fn.sharedGetter = true;
        fn.assign = function(self, value, locals) {
            return setter(self, locals, path, value, path);
        };

        getterFnCache[path] = fn;
        return fn;
    }

    CONSTANTS = createMap();

    forEach(
        {
            'null':         function () { return null; },
            'true':         function () { return true; },
            'false':        function () { return false; },
            'undefined':    function () { return undefined; }
        },
        function (constantGetter, name) {
            constantGetter.constant = constantGetter.literal = constantGetter.sharedGetter = true;
            CONSTANTS[name] = constantGetter;
        }
    );

    // Not quite a constant, but can be lex/parsed the same
    CONSTANTS['this'] = function (self) { return self; };
    CONSTANTS['this'].sharedGetter = true;

    OPERATORS = extend(createMap(), {
        '+': function (self, locals, a, b) {
            a = a(self, locals);
            b = b(self, locals);
            if (isDefined(a)) {
                if (isDefined(b)) {
                    return a + b;
                }
                return a;
            }
            return isDefined(b) ? b : undefined;
        },
        '-': function (self, locals, a, b) {
            a = a(self, locals);
            b = b(self, locals);
            return (isDefined(a) ? a : 0) - (isDefined(b) ? b : 0);
        },
        '*': function (self, locals, a, b) {
            return a(self, locals) * b(self, locals);
        },
        '/': function (self, locals, a, b) {
            return a(self, locals) / b(self, locals);
        },
        '%': function (self, locals, a, b) {
            return a(self, locals) % b(self, locals);
        },
        '^': function (self, locals, a, b) {
            return a(self, locals) ^ b(self, locals);
        },
        '=': noop,
        '===': function (self, locals, a, b) {
            return a(self, locals) === b(self, locals);
        },
        '!==': function (self, locals, a, b) {
            return a(self, locals) !== b(self, locals);
        },
        '==': function (self, locals, a, b) {
            return a(self, locals) == b(self, locals);      // jshint ignore:line
        },
        '!=': function (self, locals, a, b) {
            return a(self, locals) != b(self, locals);      // jshint ignore:line
        },
        '<': function (self, locals, a, b) {
            return a(self, locals) < b(self, locals);
        },
        '>': function (self, locals, a, b) {
            return a(self, locals) > b(self, locals);
        },
        '<=': function (self, locals, a, b) {
            return a(self, locals) <= b(self, locals);
        },
        '>=': function (self, locals, a, b) {
            return a(self, locals) >= b(self, locals);
        },
        '&&': function (self, locals, a, b) {
            return a(self, locals) && b(self, locals);
        },
        '||': function (self, locals, a, b) {
            return a(self, locals) || b(self, locals);
        },
        '&': function (self, locals, a, b) {
            return a(self, locals) & b(self, locals);
        },
        //    '|':function(self, locals, a,b){return a|b;},
        '|': function (self, locals, a, b) {
            return b(self, locals)(self, locals, a(self, locals));
        },
        '!': function (self, locals, a) {
            return !a(self, locals);
        }
    });

/**
 * @constructor
 */
    Lexer = function (options) {
        this.options = options;
    };

    Lexer.prototype = {

        constructor: Lexer,

        lex: function (text) {
            var ch,
                ch2,
                ch3,
                op1,
                op2,
                op3,
                token;

            this.text = text;
            this.index = 0;
            this.tokens = [];

            while (this.index < this.text.length) {
                ch = this.text.charAt(this.index);

                if (ch === '"' || ch === "'") {
                    this.readString(ch);
                } else if (this.isNumber(ch) || (ch === '.' && this.isNumber(this.peek()))) {
                    this.readNumber();
                } else if (this.isIdent(ch)) {
                    this.readIdent();
                } else if (this.is(ch, '(){}[].,;:?')) {
                    this.tokens.push({ index: this.index, text: ch });
                    this.index += 1;
                } else if (this.isWhitespace(ch)) {
                    this.index += 1;
                } else {
                    ch2 = ch  + this.peek();
                    ch3 = ch2 + this.peek(2);
                    op1 = OPERATORS[ch];
                    op2 = OPERATORS[ch2];
                    op3 = OPERATORS[ch3];

                    if (op1 || op2 || op3) {
                        token = op3 ? ch3 : (op2 ? ch2 : ch);
                        this.tokens.push({ index: this.index, text: token, operator: true });
                        this.index += token.length;
                    } else {
                        this.throwError(
                            'Unexpected next character ',
                            this.index,
                            this.index + 1
                        );
                    }
                }
            }
            return this.tokens;
        },

        is: function (ch, chars) {
            return chars.indexOf(ch) !== -1;
        },

        peek: function (i) {
            var num = i || 1;
            return (this.index + num < this.text.length) ? this.text.charAt(this.index + num) : false;
        },

        isNumber: function (ch) {
            return ('0' <= ch && ch <= '9') && typeof ch === "string";
        },

        isWhitespace: function (ch) {
            // IE treats non-breaking space as \u00A0
            return (ch === ' ' || ch === '\r' || ch === '\t' ||
                    ch === '\n' || ch === '\v' || ch === '\u00A0');
        },

        isIdent: function (ch) {
            return (('a' <= ch && ch <= 'z') ||
                    ('A' <= ch && ch <= 'Z') ||
                    ch === '_' ||
                    ch === '$'
            );
        },

        isExpOperator: function (ch) {
            return (ch === '-' || ch === '+' || this.isNumber(ch));
        },

        throwError: function (error, start, end) {
            end = end || this.index;

            var colStr = (isDefined(start)
                    ? 's ' + start +  '-' + this.index + ' [' + this.text.substring(start, end) + ']'
                    : ' ' + end
                );

            throw $parseMinErr(
                'lexerr',
                'Lexer Error: {0} at column{1} in expression [{2}].',
                error,
                colStr,
                this.text
            );
        },

        readNumber: function () {
            var number = '',
                start = this.index,
                ch,
                peekCh;

            while (this.index < this.text.length) {
                ch = lowercase(this.text.charAt(this.index));
                if (ch === '.' || this.isNumber(ch)) {
                    number += ch;
                } else {
                    peekCh = this.peek();
                    if (ch === 'e' && this.isExpOperator(peekCh)) {
                        number += ch;
                    } else if (this.isExpOperator(ch)
                            && peekCh
                            && this.isNumber(peekCh)
                            && number.charAt(number.length - 1) === 'e') {
                        number += ch;
                    } else if (this.isExpOperator(ch)
                           && (!peekCh || !this.isNumber(peekCh))
                           && number.charAt(number.length - 1) === 'e') {
                        this.throwError('Invalid exponent');
                    } else {
                        break;
                    }
                }
                this.index += 1;
            }

            this.tokens.push({
                index: start,
                text: number,
                constant: true,
                value: Number(number)
            });
        },

        readIdent: function () {
            var start = this.index,
                ch;

            while (this.index < this.text.length) {
                ch = this.text.charAt(this.index);

                if (!(this.isIdent(ch) || this.isNumber(ch))) {
                    break;
                }

                this.index += 1;
            }

            this.tokens.push({
                index: start,
                text: this.text.slice(start, this.index),
                identifier: true
            });
        },

        readString: function (quote) {
            var start = this.index,
                string = '',
                rawString = quote,
                escape = false,
                ch,
                hex,
                rep;

            this.index += 1;

            while (this.index < this.text.length) {
                ch = this.text.charAt(this.index);
                rawString += ch;

                if (escape) {
                    if (ch === 'u') {
                        hex = this.text.substring(this.index + 1, this.index + 5);
                        if (!hex.match(/[\da-f]{4}/i)) {
                            this.throwError('Invalid unicode escape [\\u' + hex + ']');
                        }
                        this.index += 4;
                        string += String.fromCharCode(parseInt(hex, 16));
                    } else {
                        rep = ESCAPE[ch];
                        string = string + (rep || ch);
                    }
                    escape = false;
                } else if (ch === '\\') {
                    escape = true;
                } else if (ch === quote) {
                    this.index += 1;

                    this.tokens.push({
                        index: start,
                        text: rawString,
                        constant: true,
                        value: string
                    });

                    return;
                } else {
                    string += ch;
                }

                this.index += 1;
            }

            this.throwError(
                'Unterminated quote',
                start
            );
        }
    };

    function isConstant(exp) {
        return exp.constant;
    }

    Parser = function (lexer, $filter, options) {
            this.lexer = lexer;
            this.$filter = $filter;
            this.options = options;
        };

    Parser.ZERO = extend(function () {
        return 0;
    }, {
        sharedGetter: true,   // this causes modal problem for bootstrap2.html
        constant: true
    });

    Parser.prototype = {

        constructor: Parser,

        parse: function (text) {
            this.text = text;
            this.tokens = this.lexer.lex(text);

            var value = this.statements();

            if (this.tokens.length !== 0) {
                this.throwError('is an unexpected token', this.tokens[0]);
            }

            value.literal = !! value.literal;
            value.constant = !! value.constant;

            return value;
        },

        primary: function () {
            var primary,
                next,
                context;

            if (this.expect('(')) {
                primary = this.filterChain();
                this.consume(')');
            } else if (this.expect('[')) {
                primary = this.arrayDeclaration();
            } else if (this.expect('{')) {
                primary = this.object();
            } else if (this.peek().identifier && this.peek().text in CONSTANTS) {   // must use "in CONSTANTS"
                primary = CONSTANTS[this.consume().text];
            } else if (this.peek().identifier) {
                primary = this.identifier();
            } else if (this.peek().constant) {
                primary = this.constant();
            } else {
                this.throwError(
                    'not a primary expression',
                    this.peek()
                );
            }

            // Hard to see how this works?
            while ((next = this.expect('(', '[', '.'))) {
                if (msos.config.verbose) {
                    msos.console.debug('ng - Parser - primary -> next:', next);
                }
                if (next.text === '(') {
                    primary = this.functionCall(primary, context);
                    context = null;
                } else if (next.text === '[') {
                    context = primary;
                    primary = this.objectIndex(primary);
                } else if (next.text === '.') {
                    context = primary;
                    primary = this.fieldAccess(primary);
                } else {
                    this.throwError('IMPOSSIBLE');
                }
            }

            return primary;
        },

        throwError: function (msg, token) {
            throw $parseMinErr(
                'syntax',
                'Syntax Error: Token \'{0}\' {1} at column {2} of the expression [{3}] starting at [{4}].',
                token.text,
                msg,
                (token.index + 1),
                this.text,
                this.text.substring(token.index)
            );
        },

        peekToken: function () {
            if (this.tokens.length === 0) {
                throw $parseMinErr(
                    'ueoe',
                    'Unexpected end of expression: {0}',
                    this.text
                );
            }

            return this.tokens[0];
        },

        peek: function (e1, e2, e3, e4) {
            return this.peekAhead(0, e1, e2, e3, e4);
        },

        peekAhead: function (i, e1, e2, e3, e4) {
            var token,
                t;

            if (this.tokens.length > i) {
                token = this.tokens[i];
                t = token.text;

                if (t === e1 || t === e2 || t === e3 || t === e4 || (!e1 && !e2 && !e3 && !e4)) {
                    return token;
                }
            }

            return false;
        },

        expect: function (e1, e2, e3, e4) {
            var token = this.peek(e1, e2, e3, e4);

            if (token) {
                this.tokens.shift();
                return token;
            }

            return false;
        },

        consume: function (e1) {
            if (this.tokens.length === 0) {
                throw $parseMinErr(
                    'ueoe',
                    'Unexpected end of expression: {0}',
                    this.text
                );
            }

            var token = this.expect(e1);

            if (!token) {
                this.throwError(
                    'is unexpected, expecting [' + e1 + ']',
                    this.peek()
                );
            }

            return token;
        },

        unaryFn: function (op, right) {
            var fn = OPERATORS[op];

            return extend(
                function $parseUnaryFn(self, locals) {
                    return fn(self, locals, right);
                },
                {
                    constant:right.constant,
                    inputs: [right]
                }
            );
        },

        binaryFn: function (left, op, right, isBranching) {
            var fn = OPERATORS[op];

            return extend(
                function $parseBinaryFn(self, locals) {
                    return fn(self, locals, left, right);
                },
                {
                    constant: left.constant && right.constant,
                    inputs: !isBranching && [left, right]
                }
            );
        },

        identifier: function () {
            var id = this.consume().text;

            // Continue reading each `.identifier` unless it is a method invocation
            while (this.peek('.') && this.peekAhead(1).identifier && !this.peekAhead(2, '(')) {
                id += this.consume().text + this.consume().text;
            }

            return getterFn(id, this.options, this.text);
        },

        constant: function () {
            var value = this.consume().value;

            return extend(
                function $parseConstant() {
                    return value;
                },
                {
                    constant: true,
                    literal: true
                }
            );
        },

        statements: function () {
            var statements = [];

            while (true) {
                if (this.tokens.length > 0 && !this.peek('}', ')', ';', ']')) {
                    statements.push(this.filterChain());
                }

                if (!this.expect(';')) {
                    return (statements.length === 1)
                        ? statements[0]
                        : function $parseStatements(self, locals) {
                            var value,
                                i = 0;

                            for (i = 0; i < statements.length; i += 1) {
                                value = statements[i](self, locals);
                            }

                            return value;
                        };
                }
            }
        },

        filterChain: function () {
            var left = this.expression();

//            while ((token = this.expect('|'))) {
            while (this.expect('|')) {
                left = this.filter(left);
            }

            return left;
        },

        filter: function (inputFn) {
            var fn = this.$filter(this.consume().text),
                argsFn,
                args,
                inputs;

            if (this.peek(':')) {
                argsFn = [];
                args = []; // we can safely reuse the array

                while (this.expect(':')) {
                    argsFn.push(this.expression());
                }
            }

            inputs = [inputFn].concat(argsFn || []);

            return extend(
                function $parseFilter(self, locals) {
                    var input = inputFn(self, locals),
                        i = 0;

                    if (args) {
                        args[0] = input;

                        i = argsFn.length;

                        while (i) {
                            i -= 1;
                            args[i + 1] = argsFn[i](self, locals);
                        }

                        return fn.apply(undefined, args);
                    }

                    return fn(input);
                },
                {
                    constant: !fn.$stateful && inputs.every(isConstant),
                    inputs: !fn.$stateful && inputs
                }
            );
        },

        expression: function () {
            return this.assignment();
        },

        assignment: function () {
            var left = this.ternary(),
                right,
                token = this.expect('=');

            if (token) {

                if (!left.assign) {
                    this.throwError(
                        'implies assignment but [' + this.text.substring(0, token.index) + '] can not be assigned to',
                        token
                    );
                }

                right = this.ternary();

                return extend(
                    function $parseAssignment(scope, locals) {
                        return left.assign(scope, right(scope, locals), locals);
                    },
                    {
                        inputs: [left, right]
                    }
                );
            }

            return left;
        },

        ternary: function () {
            var left = this.logicalOR(),
                middle,
                token = this.expect('?'),
                right;

            if (token) {
                middle = this.assignment();
                if (this.consume(':')) {
                    right = this.assignment();

                    return extend(
                        function $parseTernary(self, locals) {
                            return left(self, locals) ? middle(self, locals) : right(self, locals);
                        },
                        {
                            constant: left.constant && middle.constant && right.constant
                        }
                    );
                }
            }

            return left;
        },

        logicalOR: function () {
            var left = this.logicalAND(),
                token;

            while ((token = this.expect('||'))) {
                left = this.binaryFn(left, token.text, this.logicalAND(), true);
            }

            return left;
        },

        logicalAND: function () {
            var left = this.equality(),
                token;

            while ((token = this.expect('&&'))) {
                left = this.binaryFn(left, token.text, this.equality(), true);
            }

            return left;
        },

        equality: function () {
            var left = this.relational(),
                token;

            while ((token = this.expect('==','!=','===','!=='))) {
                left = this.binaryFn(left, token.text, this.relational());
            }

            return left;
        },

        relational: function () {
            var left = this.additive(),
                token;

            while ((token = this.expect('<', '>', '<=', '>='))) {
                left = this.binaryFn(left, token.text, this.additive());
            }

            return left;
        },

        additive: function () {
            var left = this.multiplicative(),
                token;

            while ((token = this.expect('+','-'))) {
                left = this.binaryFn(left, token.text, this.multiplicative());
            }

            return left;
        },

        multiplicative: function () {
            var left = this.unary(),
                token;

            while ((token = this.expect('*','/','%'))) {
                left = this.binaryFn(left, token.text, this.unary());
            }

            return left;
        },

        unary: function () {
            var token;

            if (this.expect('+')) {
                return this.primary();
            }

            token = this.expect('-');
            if (token) {
                return this.binaryFn(Parser.ZERO, token.text, this.unary());
            }

            token = this.expect('!');
            if (token) {
                return this.unaryFn(token.text, this.unary());
            }

            return this.primary();
        },

        fieldAccess: function (object) {
            var getter_fa = this.identifier();

            return extend(
                function $parseFieldAccess(scope, locals, self) {
                    var o = self || object(scope, locals);

                    return (o == null) ? undefined : getter_fa(o);
                },
                {
                    assign: function (scope, value, locals) {
                        var o = object(scope, locals);

                        if (!o) {
                            o = {};
                            object.assign(scope, o, locals);
                        }

                        return getter_fa.assign(o, value);
                    }
                }
            );
        },

        objectIndex: function (obj) {
            var expression = this.text,
                indexFn = this.expression();

            this.consume(']');

            return extend(
                function $parseObjectIndex(self, locals) {
                    var o = obj(self, locals),
                        i = indexFn(self, locals),
                        v;

                    ensureSafeMemberName(i, expression);

                    if (!o) { return undefined; }

                    v = ensureSafeObject(o[i], expression);

                    return v;
                },
                {
                    assign: function (self, value, locals) {
                        var key = ensureSafeMemberName(indexFn(self, locals), expression),
                            o = ensureSafeObject(obj(self, locals), expression);

                        if (!o) {
                            o = {};
                            obj.assign(self, o, locals);
                        }

                        o[key] = value;

                        return value;
                    }
                }
            );
        },

        functionCall: function (fnGetter, contextGetter) {
            var argsFn = [],
                expressionText,
                args;

            if (this.peekToken().text !== ')') {
                do {
                    argsFn.push(this.expression());
                } while (this.expect(','));
            }

            this.consume(')');

            expressionText = this.text;
            // we can safely reuse the array across invocations
            args = argsFn.length ? [] : null;

            return function $parseFunctionCall(scope, locals) {
                var context = contextGetter ? contextGetter(scope, locals) : isDefined(contextGetter) ? undefined : scope,
                    fn = fnGetter(scope, locals, context) || noop,
                    i = 0,
                    v;

                if (args) {
                    i = argsFn.length;
                    while (i) {
                        i -= 1;
                        args[i] = ensureSafeObject(argsFn[i](scope, locals), expressionText);
                    }
                }

                ensureSafeObject(context, expressionText);
                ensureSafeObject(fn, expressionText);

                // IE stupidity! (IE doesn't have apply for some native functions)
                v = fn.apply
                    ? fn.apply(context, args)
                    : fn(args[0], args[1], args[2], args[3], args[4]);

                if (args) {
                    // Free-up the memory (arguments of the last function call).
                    args.length = 0;
                }

                return ensureSafeObject(v, expressionText);
            };
        },

        // This is used with json array declaration
        arrayDeclaration: function () {
            var elementFns = [];

            if (this.peekToken().text !== ']') {

                do {
                    if (this.peek(']')) {
                        // Support trailing commas per ES5.1.
                        break;
                    }

                    elementFns.push(this.expression());
                } while (this.expect(','));
            }

            this.consume(']');

            return extend(
                function $parseArrayLiteral(self, locals) {
                    var array = [],
                        i = 0,
                        ii = 0;

                    for (i = 0, ii = elementFns.length; i < ii; i += 1) {
                        array.push(elementFns[i](self, locals));
                    }

                    return array;
                },
                {
                    literal: true,
                    constant: elementFns.every(isConstant),
                    inputs: elementFns
                }
            );
        },

          object: function () {
            var keys = [],
                valueFns = [],
                token;

            if (this.peekToken().text !== '}') {

                do {
                    if (this.peek('}')) {
                        // Support trailing commas per ES5.1.
                        break;
                    }

                    token = this.consume();

                    if (token.constant) {
                        keys.push(token.value);
                    } else if (token.identifier) {
                        keys.push(token.text);
                    } else {
                        this.throwError(
                            "invalid key",
                            token
                        );
                    }

                    this.consume(':');

                    valueFns.push(this.expression());

                } while (this.expect(','));
            }

            this.consume('}');

            return extend(
                function $parseObjectLiteral(self, locals) {
                    var object = {},
                        i = 0,
                        ii = 0;

                    for (i = 0, ii = valueFns.length; i < ii; i += 1) {
                        object[keys[i]] = valueFns[i](self, locals);
                    }

                    return object;
                },
                {
                    literal: true,
                    constant: valueFns.every(isConstant),
                    inputs: valueFns
                }
            );
        }
    };

    function $ParseProvider() {
        var cacheDefault = createMap(),
            cacheExpensive = createMap();

        this.$get = ['$filter', function($filter) {
            var $parseOptions = {
                    csp: csp(),
                    expensiveChecks: false
                },
                $parseOptionsExpensive = {
                    csp: csp(),
                    expensiveChecks: true
                };

            function wrapSharedExpression(exp) {
                var wrapped = exp;

                if (exp.sharedGetter) {
                    wrapped = function $parseWrapper(self, locals) {
                        return exp(self, locals);
                    };

                    wrapped.literal = exp.literal;
                    wrapped.constant = exp.constant;
                    wrapped.assign = exp.assign;
                }

                return wrapped;
            }

            function collectExpressionInputs(inputs, list) {
                var i = 0,
                    ii = inputs.length,
                    input;

                for (i = 0; i < ii; i += 1) {
                    input = inputs[i];
                    if (!input.constant) {
                        if (input.inputs) {
                            collectExpressionInputs(input.inputs, list);
                        } else if (list.indexOf(input) === -1) {
                            list.push(input);
                        }
                    }
                }

                return list;
            }

            function expressionInputDirtyCheck(newValue, oldValueOfValue) {

                if (newValue == null || oldValueOfValue == null) {      // jshint ignore:line
                    return newValue === oldValueOfValue;
                }

                if (typeof newValue === 'object') {

                    newValue = getValueOf(newValue);

                    if (typeof newValue === 'object') {
                        // objects/arrays are not supported - deep-watching them would be too expensive
                        return false;
                    }
                }

                // Primitive or NaN
                return newValue === oldValueOfValue || (newValue !== newValue && oldValueOfValue !== oldValueOfValue);
            }

            function inputsWatchDelegate(scope, listener, objectEquality, parsedExpression) {

                var inputExpressions,
                    lastResult,
                    oldInputValue,
                    oldInputValueOfValues = [],
                    k = 0,
                    kk = 0;

                if (!parsedExpression.$$inputs) {
                    parsedExpression.$$inputs = collectExpressionInputs(parsedExpression.inputs, []);
                }

                inputExpressions = parsedExpression.$$inputs;

                if (inputExpressions.length === 1) {
                    oldInputValue = expressionInputDirtyCheck; // init to something unique so that equals check fails
                    inputExpressions = inputExpressions[0];

                    return scope.$watch(
                        function expressionInputWatch(scope) {
                            var newInputValue = inputExpressions(scope);

                            if (!expressionInputDirtyCheck(newInputValue, oldInputValue)) {
                                lastResult = parsedExpression(scope);
                                oldInputValue = newInputValue && getValueOf(newInputValue);
                            }

                            return lastResult;
                        },
                        listener,
                        objectEquality
                    );
                }

                for (k = 0, kk = inputExpressions.length; k < kk; k += 1) {
                    oldInputValueOfValues[k] = expressionInputDirtyCheck; // init to something unique so that equals check fails
                }

                return scope.$watch(
                    function expressionInputsWatch(scope) {
                        var changed = false,
                            j = 0,
                            jj = 0,
                            newInputValue;

                        for (j = 0, jj = inputExpressions.length; j < jj; j += 1) {
                            newInputValue = inputExpressions[j](scope);

                            if (!changed) {
                                changed = !expressionInputDirtyCheck(newInputValue, oldInputValueOfValues[j]);
                            }

                            if (changed) {
                                oldInputValueOfValues[j] = newInputValue && getValueOf(newInputValue);
                            }
                        }

                        if (changed) {
                            lastResult = parsedExpression(scope);
                        }

                        return lastResult;
                    },
                    listener,
                    objectEquality
                );
            }

            function oneTimeWatchDelegate(scope, listener, objectEquality, parsedExpression) {
                var unwatch,
                    lastValue;

                unwatch = scope.$watch(
                    function oneTimeWatch(scope) {
                        return parsedExpression(scope);
                    },
                    function oneTimeListener(value, old, scope) {
                        lastValue = value;
                        if (_.isFunction(listener)) {
                            listener.apply(this, arguments);
                        }
                        if (isDefined(value)) {
                            scope.$$postDigest(
                                function () {
                                    if (isDefined(lastValue)) {
                                        unwatch();
                                    }
                                }
                            );
                        }
                    },
                    objectEquality
                );

                return unwatch;
            }

            function oneTimeLiteralWatchDelegate(scope, listener, objectEquality, parsedExpression) {
                var unwatch,
                    lastValue;

                function isAllDefined(value) {
                    var allDefined = true;
                    forEach(value, function(val) {
                        if (!isDefined(val)) { allDefined = false; }
                    });

                    return allDefined;
                }

                unwatch = scope.$watch(
                    function oneTimeWatch(scope) {
                        return parsedExpression(scope);
                    },
                    function oneTimeListener(value, old, scope) {
                        lastValue = value;
                        if (_.isFunction(listener)) {
                            listener.call(this, value, old, scope);
                        }
                        if (isAllDefined(value)) {
                            scope.$$postDigest(
                                function () {
                                    if (isAllDefined(lastValue)) { unwatch(); }
                                }
                            );
                        }
                    },
                    objectEquality
                );

                return unwatch;
            }

            function constantWatchDelegate(scope, listener, objectEquality, parsedExpression) {
                var unwatch = scope.$watch(
                        function constantWatch(scope) {
                            return parsedExpression(scope);
                        },
                        function constantListener(value, old, scope) {
                            if (_.isFunction(listener)) {
                                listener.apply(this, arguments);
                            }
                            unwatch();
                        },
                        objectEquality
                    );

                return unwatch;
            }

            function addInterceptor(parsedExpression, interceptorFn) {

                if (!interceptorFn) { return parsedExpression; }

                var watchDelegate = parsedExpression.$$watchDelegate,
                    regularWatch = watchDelegate !== oneTimeLiteralWatchDelegate && watchDelegate !== oneTimeWatchDelegate,
                    fn = regularWatch
                        ? function regularInterceptedExpression(scope, locals) {
                                var value = parsedExpression(scope, locals);

                                return interceptorFn(value, scope, locals);
                          }
                        : function oneTimeInterceptedExpression(scope, locals) {
                                var value = parsedExpression(scope, locals),
                                    result = interceptorFn(value, scope, locals);

                                // we only return the interceptor's result if the
                                // initial value is defined (for bind-once)
                                return isDefined(value) ? result : value;
                          };

                // Propagate $$watchDelegates other then inputsWatchDelegate
                if (parsedExpression.$$watchDelegate
                 && parsedExpression.$$watchDelegate !== inputsWatchDelegate) {
                    fn.$$watchDelegate = parsedExpression.$$watchDelegate;
                } else if (!interceptorFn.$stateful) {
                    // If there is an interceptor, but no watchDelegate then treat the interceptor like
                    // we treat filters - it is assumed to be a pure function unless flagged with $stateful
                    fn.$$watchDelegate = inputsWatchDelegate;
                    fn.inputs = [parsedExpression];
                }

                return fn;
            }

            return function $parse(exp, interceptorFn, expensiveChecks) {
                var parsedExpression,
                    oneTime,
                    cacheKey,
                    cache,
                    parseOptions,
                    lexer,
                    parser;

                switch (typeof exp) {

                    case 'string':
                        cacheKey = exp = exp.trim();

                        cache = (expensiveChecks ? cacheExpensive : cacheDefault);
                        parsedExpression = cache[cacheKey];

                        if (!parsedExpression) {
                            if (exp.charAt(0) === ':' && exp.charAt(1) === ':') {
                                oneTime = true;
                                exp = exp.substring(2);
                            }

                            parseOptions = expensiveChecks ? $parseOptionsExpensive : $parseOptions;
                            lexer = new Lexer(parseOptions);
                            parser = new Parser(lexer, $filter, parseOptions);

                            parsedExpression = parser.parse(exp);

                            if (parsedExpression.constant) {
                                parsedExpression.$$watchDelegate = constantWatchDelegate;
                            } else if (oneTime) {
                                // oneTime is not part of the exp passed to the Parser so we may have to
                                // wrap the parsedExpression before adding a $$watchDelegate
                                parsedExpression = wrapSharedExpression(parsedExpression);
                                parsedExpression.$$watchDelegate = parsedExpression.literal ?
                                oneTimeLiteralWatchDelegate : oneTimeWatchDelegate;
                            } else if (parsedExpression.inputs) {
                                parsedExpression.$$watchDelegate = inputsWatchDelegate;
                            }

                            cache[cacheKey] = parsedExpression;
                        }

                        return addInterceptor(parsedExpression, interceptorFn);

                    case 'function':
                        return addInterceptor(exp, interceptorFn);

                    default:
                        return addInterceptor(noop, interceptorFn);
                }
            };
        }];
    }

    function qFactory(nextTick, pvdr) {
        var temp_qf = 'ng - ' + pvdr + ' - qFactory',
            count = 0,
            defer_qf,
            reject_qf,
            when_qf,
            all_qf;

        function processQueue(state) {
            var temp_pq = temp_qf + ' - processQueue -> ',
                fn,
                promise,
                pending = state.pending,
                i = 0,
                ii = pending.length,
                pq_debug = '';

            msos.console.debug(temp_pq + 'start: ' + state.name);

            for (i = 0; i < ii; i += 1) {
                promise = pending[i][0];
                fn = pending[i][state.status];

                pq_debug += ', index: ' + i + ', is ';

                try {
                    if (_.isFunction(fn)) {
                        pq_debug += 'a function';
                        promise.resolve(fn(state.value));
                    } else if (state.status === 1) {
                        pq_debug += 'status === 1';
                        promise.resolve(state.value);
                    } else {
                        pq_debug += 'rejected';
                        promise.reject(state.value);
                    }
                } catch (e) {
                    msos.console.error(temp_pq + 'failed' + pq_debug + ' 8===> ', e);
                    promise.reject(e);
                }
            }

            msos.console.debug(temp_pq + ' done: ' + state.name + pq_debug);
        }

        function scheduleProcessQueue(state) {
            var temp_sp = temp_qf + ' - scheduleProcessQueue -> ';

            msos.console.debug(temp_sp + 'start: ' + state.name);

            if (state.processScheduled) {
                msos.console.debug(temp_sp + ' done: ' + state.name + ' already scheduled!');
                return;
            }

            state.processScheduled = true;

            nextTick(
                function () { processQueue(state); },
                state.name
            );

            msos.console.debug(temp_sp + ' done: ' + state.name + ' process nextTick!');
        }

        function Promise(type) {

            count += 1;

            this.then = function (onFulfilled, onRejected, progressBack) {

                var temp_t = ' - Promise.then -> ',
                    t_name = this.$$state.name,
                    result = defer_qf(t_name);

                msos.console.debug(temp_qf + temp_t + 'start: ' + t_name);

                this.$$state.pending.push([result, onFulfilled, onRejected, progressBack]);

                if (this.$$state.status > 0) {
                    scheduleProcessQueue(this.$$state);
                }

                msos.console.debug(temp_qf + temp_t + ' done: ' + t_name);
                return result.promise;
            };

            this.decrement = function (func) {
                if (_.isFunction(func)) { func(); }
                return this;
            };

            this.$$state = {
                status: 0,
                name: type + ':' + count,
                processScheduled: false,
                pending: []
            };
        }

        function Deferred(type) {

            this.promise = new Promise(type);

            this.resolve = _.bind(this.resolve,   this);
            this.reject =  _.bind(this.reject,    this);
            this.notify =  _.bind(this.notify,    this);
        }

        Deferred.prototype = {

            resolve: function (val) {
                var temp_r = ' - Deferred.resolve -> ',
                    vb = msos.config.verbose,
                    self = this,
                    ps = self.promise.$$state,
                    r_name = ps.name,
                    r_stat = ps.status,
                    r_dbug = 'error',
                    then;

                if (vb) {
                    msos.console.debug(temp_qf + temp_r + 'start: ' + r_name);
                }

                if (r_stat > 0) {
                    if (vb) {
                        msos.console.debug(temp_qf + temp_r + ' done: ' + r_name + ', for status: ' + r_stat);
                    }
                    return;
                }

                if (val === self.promise) {
                    self.reject('Resolve input object === Promise object');
                } else {
                    try {
                        if ((_.isObject(val) || _.isFunction(val))) {
                            then = val && val.then;
                        }

                        if (_.isFunction(then) && !self.resolved) {
                            ps.status = -1;
                            self.resolved = true;   // only once
                            then.call(
                                val,
                                self.resolve,
                                self.reject,
                                self.notify
                            );
                            r_dbug = 'then function';
                        } else {
                            ps.value = val;
                            ps.status = 1;
                            if (ps.pending.length) {
                                scheduleProcessQueue(ps);
                                r_dbug = 'scheduleProcessQueue';
                            } else {
                                r_dbug = 'set status, value' + (_.isObject(val) ? ' object' : '');
                            }
                        }
                    } catch (e) {
                        msos.console.error(temp_qf + temp_r + 'failed:', e);
                        self.reject(e);
                    }
                }

                if (vb) {
                    msos.console.debug(temp_qf + temp_r + ' done: ' + r_name + ', debug: ' + r_dbug);
                }
            },

            resolved: false,

            reject: function (reason) {
                var temp_j = ' - Deferred.reject -> ',
                    ps = this.promise.$$state,
                    j_name = ps.name,
                    j_stat = ps.status;

                msos.console.debug(temp_qf + temp_j + 'start: ' + j_name);

                if (j_stat > 0) {
                    msos.console.debug(temp_qf + temp_j + ' done: ' + j_name + ', for status: ' + j_stat);
                    return;
                }

                ps.value = reason;
                ps.status = 2;

                if (ps.pending.length && !this.rejected) {
                    this.rejected = true;   // only once
                    scheduleProcessQueue(ps);
                }

                msos.console.debug(temp_qf + temp_j + ' done: ' + j_name + ', for status: ' + j_stat);
            },

            rejected: false,

            notify: function (progress) {
                var temp_n = ' - Deferred.notify -> ',
                    ps = this.promise.$$state,
                    n_name = ps.name,
                    n_stat = ps.status,
                    callbacks = ps.pending,
                    db_n = '';

                msos.console.debug(temp_qf + temp_n + 'start: ' + n_name + ', progress: ' + progress);

                if ((n_stat <= 0) && callbacks && callbacks.length) {
                    db_n = ' process nextTick';
                    nextTick(
                        function () {
                            var callback,
                                result,
                                i = 0;

                            for (i = 0; i < callbacks.length; i += 1) {
                                result = callbacks[i][0];
                                callback = callbacks[i][3];
                                try {
                                    result.notify(_.isFunction(callback) ? callback(progress) : progress);
                                } catch (e) {
                                    msos.console.error(temp_qf + temp_n + 'failed:', e);
                                }
                            }
                        },
                        n_name
                    );
                }

                msos.console.debug(temp_qf + temp_n + ' done: ' + n_name + db_n + ', for status: ' + n_stat);
            }
        };

        defer_qf = function (origin) {
            return new Deferred(origin);
        };

        reject_qf = function (d, reason) {
            d.reject(reason);
            return d.promise;
        };

        when_qf = function (d, value, callback, errback, progressBack) {
            d.resolve(value);
            return d.promise.then(callback, errback, progressBack);
        };

        all_qf = function (d, promises) {
            var counter = 0,
                results = _.isArray(promises) ? [] : {};

            forEach(
                promises,
                function (promise, key) {
                    counter += 1;

                    when_qf(defer_qf('qFactory_all_when'), promise).then(
                        function (value) {
                            if (results.hasOwnProperty(key)) { return; }
                            results[key] = value;
                            counter -= 1;
                            if (!counter) { d.resolve(results); }
                        },
                        function (reason) {
                            if (results.hasOwnProperty(key)) { return; }
                            d.reject(reason);
                        }
                    );
                }
            );

            if (counter === 0) {
                d.resolve(results);
            }

            return d.promise;
        };

        return {
            defer:  defer_qf,
            reject: reject_qf,
            when:   when_qf,
            all:    all_qf
        };
    }

    function $QProvider() {
        msos.console.debug('ng - $QProvider -> start');

        this.$get = ['$rootScope', function ($rootScope) {
            return qFactory(
                    function (callback, state_name) {
                        $rootScope.$evalAsync(
                            callback,
                            { directive_name: '$QProvider_' + state_name }
                        );
                    },
                    '$q'
                );
            }
        ];

        msos.console.debug('ng - $QProvider -> done!');
    }

    function $$QProvider() {
        msos.console.debug('ng - $$QProvider -> start');

        this.$get = ['$browser', function ($browser) {
            return qFactory(
                    function (callback) {
                        $browser.defer(callback);
                    },
                    '$$q'
                );
            }
        ];

        msos.console.debug('ng - $$QProvider -> done!');
    }

    function $$RAFProvider() { //rAF
        this.$get = ['$window', '$timeout', function ($window, $timeout) {
            var requestAnimationFrame = $window.requestAnimationFrame || $window.webkitRequestAnimationFrame,
                cancelAnimationFrame = $window.cancelAnimationFrame || $window.webkitCancelAnimationFrame || $window.webkitCancelRequestAnimationFrame,
                rafSupported = !!requestAnimationFrame,
                raf = rafSupported
                    ? function (fn) {
                        var id = requestAnimationFrame(fn);
                        return function () {
                            cancelAnimationFrame(id);
                        };
                    }
                    : function (fn) {
                        var timer = $timeout(fn, 16.66, false); // 1000 / 60 = 16.666
                        return function () {
                            $timeout.cancel(timer);
                        };
                    };

            raf.supported = rafSupported;

            return raf;
        }];
    }

    function $RootScopeProvider() {
        var temp_rsp = 'ng - $RootScopeProvider - ',
            TTL = 10,
            $rootScopeMinErr = minErr('$rootScope'),
            lastDirtyWatch = null,
            applyAsyncId = null;

        this.digestTtl = function (value) {
            if (arguments.length) {
                TTL = value;
            }
            return TTL;
        };

        this.$get = ['$parse', '$browser', function ($parse, $browser) {

            var $rootScope_P,
                asyncQueue,
                postDigestQueue = [],
                applyAsyncQueue = [];

            msos.console.debug(temp_rsp + '$get -> start.');

            function decrementListenerCount(current, count, name) {

                var temp_dl = temp_rsp + '$get - decrementListenerCount -> ';

                msos.console.debug(temp_dl + 'called, name: ' + name + ', count: ' + count);

                do {
                    current.$$listenerCount[name] -= count;

                    if (current.$$listenerCount[name] === 0) {
                        delete current.$$listenerCount[name];
                        msos.console.debug(temp_dl + 'done, scope: ' + current.$id);
                    }
                } while ((current = current.$parent));
            }

            function initWatchVal() { return undefined; }

            function flushApplyAsync() {
                var temp_fa = '$get - flushApplyAsync -> ';

                msos.console.info(temp_rsp + temp_fa + 'start.');

                while (applyAsyncQueue.length) {
                    try {
                        applyAsyncQueue.shift()();
                    } catch (e) {
                        msos.console.error(temp_rsp + temp_fa + 'failed:', e);
                    }
                }

                applyAsyncId = null;

                msos.console.info(temp_rsp + temp_fa + 'done!');
            }

            function scheduleApplyAsync() {
                var temp_sa = '$get - scheduleApplyAsync -> ';

                msos.console.info(temp_rsp + temp_sa + 'start.');

                if (applyAsyncId === null) {
                    applyAsyncId = $browser.defer(
                        function () {
                            $rootScope_P.$apply(flushApplyAsync);
                        }
                    );
                }
                msos.console.info(temp_rsp + temp_sa + 'done!');
            }

            function Scope() {
                this.$id = nextUid();
                this.$$phase = this.$parent = this.$$watchers = this.$$nextSibling = this.$$prevSibling = this.$$childHead = this.$$childTail = null;
                this.$root = this;
                this.$$destroyed = false;
                this.$$listeners = {};
                this.$$listenerCount = {};
                this.$$isolateBindings = null;
            }

            Scope.prototype = {

                constructor: Scope,

                $new: function (isolate, parent) {
                    var child;

                    function destroyChild() {
                        child.$$destroyed = true;
                    }

                    parent = parent || this;

                    if (isolate) {
                        child = new Scope();
                        child.$root = this.$root;
                    } else {
                        // Only create a child scope class if somebody asks for one,
                        // but cache it to allow the VM to optimize lookups.
                        if (!this.$$ChildScope) {
                            this.$$ChildScope = function ChildScope() {
                                this.$$watchers = this.$$nextSibling = this.$$childHead = this.$$childTail = null;
                                this.$$listeners = {};
                                this.$$listenerCount = {};
                                this.$id = nextUid();
                                this.$$ChildScope = null;
                            };

                            this.$$ChildScope.prototype = this;
                        }

                        child = new this.$$ChildScope();
                    }

                    child.$parent = parent;
                    child.$$prevSibling = parent.$$childTail;

                    if (parent.$$childHead) {
                        parent.$$childTail.$$nextSibling = child;
                        parent.$$childTail = child;
                    } else {
                        parent.$$childHead = parent.$$childTail = child;
                    }

                    if (isolate || parent !== this) { child.$on('$destroy', destroyChild); }

                    return child;
                },

                $watch: function (watchExp, listener, objectEquality) {

                    var scope = this,
                        array = [],
                        watcher = {},
                        get = $parse(watchExp);

                    if (get.$$watchDelegate) {
                        return get.$$watchDelegate(this, listener, objectEquality, get);
                    }

                    array = scope.$$watchers;

                    watcher = {
                        fn: listener,
                        last: initWatchVal,
                        get: get,
                        exp: watchExp,
                        eq: !!objectEquality
                    };

                    lastDirtyWatch = null;

                    if (!_.isFunction(listener)) {
                        watcher.fn = noop;
                    }

                    if (!array) {
                        array = scope.$$watchers = [];
                    }
                    // we use unshift since we use a while loop in $digest for speed.
                    // the while loop reads in reverse order.
                    array.unshift(watcher);

                    return function deregisterWatch() {
                        arrayRemove(array, watcher);
                        lastDirtyWatch = null;
                    };
                },

                $watchGroup: function (watchExpressions, listener) {
                    var oldValues = new Array(watchExpressions.length),
                        newValues = new Array(watchExpressions.length),
                        deregisterFns = [],
                        self = this,
                        changeReactionScheduled = false,
                        firstRun = true,
                        shouldCall = true;

                    function watchGroupAction() {
                        changeReactionScheduled = false;

                        if (firstRun) {
                            firstRun = false;
                            listener(newValues, newValues, self);
                        } else {
                            listener(newValues, oldValues, self);
                        }
                    }

                    if (!watchExpressions.length) {
                        // No expressions means we call the listener ASAP
                        self.$evalAsync(
                            function () {
                                if (shouldCall) { listener(newValues, newValues, self); }
                            },
                            { directive_name: '$RootScopeProvider_$watchGroup' }
                        );

                        return function deregisterWatchGroup() {
                            shouldCall = false;
                        };
                    }

                    if (watchExpressions.length === 1) {
                        // Special case size of one
                        return this.$watch(watchExpressions[0], function watchGroupAction(value, oldValue, scope) {
                            newValues[0] = value;
                            oldValues[0] = oldValue;
                            listener(newValues, (value === oldValue) ? newValues : oldValues, scope);
                        });
                    }

                    forEach(watchExpressions, function (expr, i) {
                        var unwatchFn = self.$watch(expr, function watchGroupSubAction(value, oldValue) {
                            newValues[i] = value;
                            oldValues[i] = oldValue;
                            if (!changeReactionScheduled) {
                                changeReactionScheduled = true;
                                self.$evalAsync(
                                    watchGroupAction,
                                    { directive_name: '$RootScopeProvider_watchGroupSubAction' }
                                );
                            }
                        });
                        deregisterFns.push(unwatchFn);
                    });

                    return function deregisterWatchGroup() {
                        while (deregisterFns.length) {
                            deregisterFns.shift()();
                        }
                    };
                },

                $watchCollection: function (obj, listener) {

                    var self = this,
                        newValue,
                        oldValue,
                        veryOldValue,
                        trackVeryOldValue = (listener.length > 1),
                        changeDetected = 0,
                        changeDetector,
                        internalArray = [],
                        internalObject = {},
                        initRun = true,
                        oldLength = 0;

                    function $watchCollectionInterceptor(_value) {
                        newValue = _value;

                        var newLength,
                            key,
                            bothNaN,
                            newItem,
                            oldItem,
                            i = 0;

                        // If the new value is undefined, then return undefined as the watch may be a one-time watch
                        if (_.isUndefined(newValue)) { return undefined; }

                        if (!_.isObject(newValue)) {    // if primitive
                            if (oldValue !== newValue) {
                                oldValue = newValue;
                                changeDetected += 1;
                            }
                        } else if (isArrayLike(newValue)) {
                            if (oldValue !== internalArray) {
                                // we are transitioning from something which was not an array into array.
                                oldValue = internalArray;
                                oldLength = oldValue.length = 0;
                                changeDetected += 1;
                            }

                            newLength = newValue.length;

                            if (oldLength !== newLength) {
                                // if lengths do not match we need to trigger change notification
                                changeDetected += 1;
                                oldValue.length = oldLength = newLength;
                            }

                            // copy the items to oldValue and look for changes.
                            for (i = 0; i < newLength; i += 1) {
                                oldItem = oldValue[i];
                                newItem = newValue[i];

                                bothNaN = (oldItem !== oldItem) && (newItem !== newItem);

                                if (!bothNaN && (oldItem !== newItem)) {
                                    changeDetected += 1;
                                    oldValue[i] = newItem;
                                }
                            }
                        } else {
                            if (oldValue !== internalObject) {
                                // we are transitioning from something which was not an object into object.
                                oldValue = internalObject = {};
                                oldLength = 0;
                                changeDetected += 1;
                            }
                            // copy the items to oldValue and look for changes.
                            newLength = 0;

                            for (key in newValue) {
                                if (newValue.hasOwnProperty(key)) {
                                    newLength += 1;
                                    newItem = newValue[key];
                                    oldItem = oldValue[key];

                                    if (oldValue.hasOwnProperty(key)) {

                                        bothNaN = (oldItem !== oldItem) && (newItem !== newItem);

                                        if (!bothNaN && (oldItem !== newItem)) {
                                            changeDetected += 1;
                                            oldValue[key] = newItem;
                                        }
                                    } else {
                                        oldLength += 1;
                                        oldValue[key] = newItem;
                                        changeDetected += 1;
                                    }
                                }
                            }

                            if (oldLength > newLength) {
                                // we used to have more keys, need to find them and destroy them.
                                changeDetected += 1;

                                for (key in oldValue) {
                                    if (!newValue.hasOwnProperty(key)) {
                                        oldLength -= 1;
                                        delete oldValue[key];
                                    }
                                }
                            }
                        }
                        return changeDetected;
                    }

                    function $watchCollectionAction() {
                        var i = 0,
                            key;

                        if (initRun) {
                            initRun = false;
                            listener(newValue, newValue, self);
                        } else {
                            listener(newValue, veryOldValue, self);
                        }

                        // make a copy for the next time a collection is changed
                        if (trackVeryOldValue) {
                            if (!_.isObject(newValue)) {
                                //primitive
                                veryOldValue = newValue;
                            } else if (isArrayLike(newValue)) {
                                veryOldValue = new Array(newValue.length);

                                for (i = 0; i < newValue.length; i += 1) {
                                    veryOldValue[i] = newValue[i];
                                }
                            } else { // if object
                                veryOldValue = {};

                                for (key in newValue) {
                                    if (hasOwnProperty.call(newValue, key)) {
                                        veryOldValue[key] = newValue[key];
                                    }
                                }
                            }
                        }
                    }

                    $watchCollectionInterceptor.$stateful = true;

                    changeDetector = $parse(obj, $watchCollectionInterceptor);

                    return this.$watch(changeDetector, $watchCollectionAction);
                },

                $digest: function () {
                    var temp_dg = '$get - Scope - $digest -> ',
                        db_note = '',
                        watch,
                        value,
                        last,
                        watchers,
                        check_nan,
                        length,
                        dirty,
                        ttl = TTL,
                        next,
                        current,
                        target = this,
                        watchLog = [],
                        logIdx,
                        asyncTask;

                    msos.console.debug(temp_rsp + temp_dg + 'start.');

                    if ($rootScope_P.$$phase) {
                        // Do I really need to kill it?
                        throw $rootScopeMinErr('inprog', '{0} already in progress', $rootScope_P.$$phase);
                    }

                    $rootScope_P.$$phase = '$digest';

                    // Check for changes to browser url that happened in sync before the call to $digest
                    $browser.$$checkUrlChange();

                    if (this === $rootScope_P && applyAsyncId !== null) {
                        // If this is the root scope, and $applyAsync has scheduled a deferred $apply(), then
                        // cancel the scheduled $apply and flush the queue of expressions to be evaluated.
                        $browser.defer.cancel(applyAsyncId);
                        flushApplyAsync();
                    }

                    lastDirtyWatch = null;

                    // "while dirty" loop
                    do {
                        dirty = false;
                        current = target;

                        while (asyncQueue.length) {
                            try {
                                asyncTask = asyncQueue.shift();
                                asyncTask.scope.$eval(asyncTask.expression, asyncTask.locals);
                            } catch (e) {

                                if      (!asyncTask)            { db_note = ' asyncTask'; }
                                else if (!asyncTask.expression) { db_note = ' asyncTask.expression'; }

                                db_note += ' at index ' + (asyncQueue.length + 1) + ':';

                                msos.console.error(temp_rsp + temp_dg + 'failed' + db_note, e);
                            }
                            lastDirtyWatch = null;
                        }

                        // "traverse the scopes" loop
                        traverseScopesLoop: do {
                            watchers = current.$$watchers;
                            if (watchers) {
                                // process our watches
                                length = watchers.length;

                                while (length) {
                                    length -= 1;
                                    try {
                                        watch = watchers[length];
                                        // Most common watches are on primitives, in which case we can short
                                        // circuit it with === operator, only when === fails do we use .equals
                                        if (watch) {
                                            value = watch.get(current);
                                            last = watch.last;
                                            check_nan = (typeof value === 'number' && typeof last === 'number' && isNaN(value) && isNaN(last));
                                            if (value !== last && !(watch.eq ? equals(value, last) : check_nan)) {
                                                dirty = true;
                                                lastDirtyWatch = watch;
                                                watch.last = watch.eq ? copy(value, null) : value;
                                                watch.fn(value, ((last === initWatchVal) ? value : last), current);
                                                if (ttl < 5) {
                                                    logIdx = 4 - ttl;
                                                    if (!watchLog[logIdx]) { watchLog[logIdx] = []; }

                                                    watchLog[logIdx].push(
                                                        {
                                                            msg: _.isFunction(watch.exp)
                                                                ? 'fn: ' + (watch.exp.name || watch.exp.toString())
                                                                : watch.exp,
                                                            newVal: value,
                                                            oldVal: last
                                                        }
                                                    );
                                                }
                                            } else if (watch === lastDirtyWatch) {
                                                // If the most recently dirty watcher is now clean, short circuit since the remaining watchers
                                                // have already been tested.
                                                dirty = false;
                                                break traverseScopesLoop;
                                            }
                                        }
                                    } catch (e) {
                                        msos.console.error(temp_rsp + temp_dg + 'traverseScopesLoop, failed:', e);
                                    }
                                }
                            }

                            if (!(next = (current.$$childHead || (current !== target && current.$$nextSibling)))) {
                                while (current !== target && !(next = current.$$nextSibling)) {
                                    current = current.$parent;
                                }
                            }

                        } while ((current = next));

                        // `break traverseScopesLoop;` takes us to here
                        if ((dirty || asyncQueue.length) && !(ttl--)) {     // ttl-- is written as needed
                            // clearPhase
                            $rootScope_P.$$phase = null;
                            // If I need to kill it, why bother setting to null?
                            throw $rootScopeMinErr(
                                'infdig',
                                '{0} $digest() iterations reached. Aborting!\n' + 'Watchers fired in the last 5 iterations: {1}',
                                TTL,
                                watchLog
                            );
                        }

                    } while (dirty || asyncQueue.length);

                    // clearPhase
                    $rootScope_P.$$phase = null;

                    while (postDigestQueue.length) {
                        try {
                            postDigestQueue.shift()();
                        } catch (e) {
                            msos.console.error(temp_rsp + temp_dg + 'failed:', e);
                        }
                    }

                    msos.console.debug(temp_rsp + temp_dg + 'done!');
                },

                $destroy: function () {

                    if (msos.config.verbose) {
                        msos.console.debug(temp_rsp + '$get - Scope - $destroy -> called.');
                    }

                    // we can't destroy the root scope or a scope that has been already destroyed
                    if (this.$$destroyed) { return; }
                    var parent = this.$parent,
                        eventName;

                    this.$broadcast('$destroy');
                    this.$$destroyed = true;

                    if (this === $rootScope_P) { return; }

                    for (eventName in this.$$listenerCount) {
                        decrementListenerCount(this, this.$$listenerCount[eventName], eventName);
                    }

                    // sever all the references to parent scopes (after this cleanup, the current scope should
                    // not be retained by any of our references and should be eligible for garbage collection)
                    if (parent.$$childHead === this) { parent.$$childHead = this.$$nextSibling; }
                    if (parent.$$childTail === this) { parent.$$childTail = this.$$prevSibling; }
                    if (this.$$prevSibling) { this.$$prevSibling.$$nextSibling = this.$$nextSibling; }
                    if (this.$$nextSibling) { this.$$nextSibling.$$prevSibling = this.$$prevSibling; }

                    // Disable listeners, watchers and apply/digest methods
                    this.$destroy = this.$digest = this.$apply = this.$evalAsync = this.$applyAsync = noop;
                    this.$on = this.$watch = this.$watchGroup = function() { return noop; };
                    this.$$listeners = {};

                    this.$parent = this.$$nextSibling = this.$$prevSibling = this.$$childHead = this.$$childTail = this.$root = this.$$watchers = null;
                },

                $eval: function (expr, locals) {
                    return $parse(expr)(this, locals);
                },

                $evalAsync: function (expr, locals) {
                    var temp_sy = '$get - Scope - $evalAsync -> ',
                        queue_obj = {};

                    if (msos.config.verbose) {
                        msos.console.debug(temp_rsp + temp_sy + 'start.');
                    }

                    // if we are outside of an $digest loop and this is the first time we are scheduling async
                    // task also schedule async auto-flush
                    if (!$rootScope_P.$$phase && !asyncQueue.length) {
                        $browser.defer(
                            function () {
                                if (asyncQueue.length) {
                                    $rootScope_P.$digest();
                                }
                            }
                        );
                    }

                    queue_obj = {
                        scope: this,
                        expression: expr,
                        locals: locals
                    };

                    asyncQueue.push(queue_obj);

                    if (msos.config.verbose) {
                        msos.console.debug(temp_rsp + temp_sy + 'done, added: ' + (queue_obj.locals.directive_name || 'na'));
                    }
                },

                $$postDigest: function (fn) {
                    postDigestQueue.push(fn);
                },

                $apply: function (expr) {
                    var temp_ap = '$get - Scope - $apply ===> ',
                        dbug_app = '';


                    if (!$rootScope_P.$$phase) {
                        $rootScope_P.$$phase = '$apply';
                        dbug_app = 'initiated ';
                    }

                   if (!expr) {
                        dbug_app +=  (dbug_app ? 'with ' : '') + 'no expression ';
                    }

                    msos.console.debug(temp_rsp + temp_ap + 'start, ' + dbug_app + 'for phase: ' + $rootScope_P.$$phase);

                    try {

                        return this.$eval(expr);

                    } catch (e) {

                        msos.console.error(temp_rsp + temp_ap + 'error for: ' + $rootScope_P.$$phase + ', debug: ' + dbug_app, e);

                    } finally {

                        // clearPhase
                        $rootScope_P.$$phase = null;

                        try {
                            $rootScope_P.$digest();
                        } catch (e) {
                            // really bad...
                            msos.console.error(temp_rsp + temp_ap + 'failed (finally)', e);
                        }

                        msos.console.debug(temp_rsp + temp_ap + ' done, ' + dbug_app);
                    }

                    return undefined;
                },

                $applyAsync: function (expr) {
                    var scope = this;

                    function $applyAsyncExpression() {
                        scope.$eval(expr);
                    }

                    if (expr) {
                        applyAsyncQueue.push($applyAsyncExpression);
                    }

                    scheduleApplyAsync();
                },

                $on: function (name, listener) {
                    var namedListeners = this.$$listeners[name],
                        current,
                        self;

                    if (!namedListeners) {
                        this.$$listeners[name] = namedListeners = [];
                    }

                    namedListeners.push(listener);

                    current = this;

                    do {
                        if (!current.$$listenerCount[name]) {
                            current.$$listenerCount[name] = 0;
                        }
                        current.$$listenerCount[name] += 1;
                    } while ((current = current.$parent));

                    self = this;

                    return function () {
                        var indexOfListener = namedListeners.indexOf(listener);

                        if (indexOfListener !== -1) {
                            namedListeners[indexOfListener] = null;
                            decrementListenerCount(self, 1, name);
                        }
                    };
                },

                $emit: function (name) {
                    var empty = [],
                        namedListeners,
                        scope = this,
                        stopPropagation = false,
                        event = {
                            name: name,
                            targetScope: scope,
                            stopPropagation: function () {
                                stopPropagation = true;
                            },
                            preventDefault: function () {
                                event.defaultPrevented = true;
                            },
                            defaultPrevented: false
                        },
                        listenerArgs = concat([event], arguments, 1),
                        i,
                        length;

                    do {
                        namedListeners = scope.$$listeners[name] || empty;
                        event.currentScope = scope;
                        for (i = 0, length = namedListeners.length; i < length; i += 1) {

                            // if listeners were deregistered, defragment the array
                            if (!namedListeners[i]) {
                                namedListeners.splice(i, 1);
                                i -= 1;
                                length -= 1;
                                continue;
                            }
                            try {
                                //allow all listeners attached to the current scope to run
                                namedListeners[i].apply(null, listenerArgs);
                            } catch (e) {
                                msos.console.error(temp_rsp + '$get - Scope - $emit -> failed:', e);
                            }
                        }
                        //if any listener on the current scope stops propagation, prevent bubbling
                        if (stopPropagation) {
                            event.currentScope = null;
                            return event;
                        }
                        //traverse upwards
                        scope = scope.$parent;
                    } while (scope);

                    event.currentScope = null;

                    return event;
                },

                $broadcast: function (name) {
                    var target = this,
                        current = target,
                        next = target,
                        event = {
                            name: name,
                            targetScope: target,
                            preventDefault: function () {
                                event.defaultPrevented = true;
                            },
                            defaultPrevented: false
                        },
                        listenerArgs,
                        listeners,
                        i,
                        length;

                    if (!target.$$listenerCount[name]) { return event; }

                    listenerArgs = concat([event], arguments, 1);

                    //down while you can, then up and next sibling or up and next sibling until back at root
                    while ((current = next)) {
                        event.currentScope = current;
                        listeners = current.$$listeners[name] || [];
                        for (i = 0, length = listeners.length; i < length; i += 1) {
                            // if listeners were deregistered, defragment the array
                            if (!listeners[i]) {
                                listeners.splice(i, 1);
                                i -= 1;
                                length -= 1;
                                continue;
                            }

                            try {
                                listeners[i].apply(null, listenerArgs);
                            } catch (e) {
                                msos.console.error(temp_rsp + '$get - Scope - $broadcast -> failed:', e);
                            }
                        }

                        if (!(next = ((current.$$listenerCount[name] && current.$$childHead) || (current !== target && current.$$nextSibling)))) {
                            while (current !== target && !(next = current.$$nextSibling)) {
                                current = current.$parent;
                            }
                        }
                    }

                    event.currentScope = null;
                    return event;
                }
            };

            // Notice the $rootScope_P, (keeping it real!)
            $rootScope_P = new Scope();

            //The internal queues. Expose them on the $rootScope for debugging/testing purposes.
            asyncQueue = $rootScope_P.$$asyncQueue = [];
            postDigestQueue = $rootScope_P.$$postDigestQueue = [];
            applyAsyncQueue = $rootScope_P.$$applyAsyncQueue = [];

            msos.console.debug(temp_rsp + '$get -> done!');

            return $rootScope_P;
        }];
    }

    function $$SanitizeUriProvider() {
        var aHrefSanitizationWhitelist = /^\s*(https?|ftp|mailto|tel|file):/,
            imgSrcSanitizationWhitelist = /^\s*((https?|ftp|file|blob):|data:image\/)/;

        msos.console.debug('ng - $$SanitizeUriProvider -> start.');

        this.aHrefSanitizationWhitelist = function (regexp) {
            if (isDefined(regexp)) {
                aHrefSanitizationWhitelist = regexp;
                return this;
            }
            return aHrefSanitizationWhitelist;
        };

        this.imgSrcSanitizationWhitelist = function (regexp) {
            if (isDefined(regexp)) {
                imgSrcSanitizationWhitelist = regexp;
                return this;
            }
            return imgSrcSanitizationWhitelist;
        };

        this.$get = function () {
            return function sanitizeUri(uri, isImage) {
                var regex = isImage ? imgSrcSanitizationWhitelist : aHrefSanitizationWhitelist,
                    normalizedVal = urlResolve(uri, '$$SanitizeUriProvider - get').href;

                if (normalizedVal !== '' && !normalizedVal.match(regex)) {
                    return 'unsafe:' + normalizedVal;
                }
                return uri;
            };
        };

        msos.console.debug('ng - $$SanitizeUriProvider -> done!');
    }

    $sceMinErr = minErr('$sce');

    function adjustMatcher(matcher) {
        if (matcher === 'self') {
            return matcher;
        }

        if (_.isString(matcher)) {
            // Strings match exactly except for 2 wildcards - '*' and '**'.
            // '*' matches any character except those from the set ':/.?&'.
            // '**' matches any character (like .* in a RegExp).
            // More than 2 *'s raises an error as it's ill defined.
            if (matcher.indexOf('***') > -1) {
                throw $sceMinErr('iwcard', 'Illegal sequence *** in string matcher.  String: {0}', matcher);
            }
            matcher = escapeForRegexp(matcher).
            replace('\\*\\*', '.*').
            replace('\\*', '[^:/.?&;]*');
            return new RegExp('^' + matcher + '$');
        }

        if (_.isRegExp(matcher)) {
            // The only other type of matcher allowed is a Regexp.
            // Match entire URL / disallow partial matches.
            // Flags are reset (i.e. no global, ignoreCase or multiline)
            return new RegExp('^' + matcher.source + '$');
        }

        throw $sceMinErr('imatcher', 'Matchers may only be "self", string patterns or RegExp objects');
    }

    function adjustMatchers(matchers) {
        var adjustedMatchers = [];
        if (isDefined(matchers)) {
            forEach(matchers, function (matcher) {
                adjustedMatchers.push(adjustMatcher(matcher));
            });
        }
        return adjustedMatchers;
    }

    function $SceDelegateProvider() {

        this.SCE_CONTEXTS = SCE_CONTEXTS;

        // Resource URLs can also be trusted by policy.
        var resourceUrlWhitelist = ['self'],
            resourceUrlBlacklist = [],
            temp_sd = 'ng - $SceDelegateProvider';

        msos.console.debug(temp_sd + ' -> start.');

        this.resourceUrlWhitelist = function (value) {
            if (arguments.length) {
                resourceUrlWhitelist = adjustMatchers(value);
            }
            return resourceUrlWhitelist;
        };

        this.resourceUrlBlacklist = function (value) {
            if (arguments.length) {
                resourceUrlBlacklist = adjustMatchers(value);
            }
            return resourceUrlBlacklist;
        };

        this.$get = ['$injector', function ($injector) {

            msos.console.debug(temp_sd + ' - $get -> start.');

            var htmlSanitizer = function () {
                    throw $sceMinErr(
                        'unsafe',
                        'Attempting to use an unsafe value in a safe context.'
                    );
                },
                trustedValueHolderBase,
                byType = {};

            if ($injector.has('$sanitize')) {
                htmlSanitizer = $injector.get('$sanitize');
            }

            function matchUrl(matcher, parsedUrl) {
                if (matcher === 'self') {
                    return urlIsSameOrigin(parsedUrl);
                }
                // definitely a regex.  See adjustMatchers()
                return !!matcher.exec(parsedUrl.href);
            }

            function isResourceUrlAllowedByPolicy(url) {
                var parsedUrl = urlResolve(url.toString(), temp_sd + ' - $get - isResourceUrlAllowedByPolicy'),
                    i,
                    n,
                    allowed = false;

                // Ensure that at least one item from the whitelist allows this url.
                for (i = 0, n = resourceUrlWhitelist.length; i < n; i += 1) {
                    if (matchUrl(resourceUrlWhitelist[i], parsedUrl)) {
                        allowed = true;
                        break;
                    }
                }
                if (allowed) {
                    // Ensure that no item from the blacklist blocked this url.
                    for (i = 0, n = resourceUrlBlacklist.length; i < n; i += 1) {
                        if (matchUrl(resourceUrlBlacklist[i], parsedUrl)) {
                            allowed = false;
                            break;
                        }
                    }
                }
                return allowed;
            }

            function generateHolderType(Base) {
                var holderType = function TrustedValueHolderType(trustedValue) {
                        this.$$unwrapTrustedValue = function () {
                            return trustedValue;
                        };
                    };

                if (Base) {
                    holderType.prototype = new Base();
                }

                holderType.prototype.valueOf = function sceValueOf() {
                    return this.$$unwrapTrustedValue();
                };

                holderType.prototype.toString = function sceToString() {
                    return this.$$unwrapTrustedValue().toString();
                };

                return holderType;
            }

            trustedValueHolderBase = generateHolderType();

            byType[SCE_CONTEXTS.HTML] = generateHolderType(trustedValueHolderBase);
            byType[SCE_CONTEXTS.CSS] = generateHolderType(trustedValueHolderBase);
            byType[SCE_CONTEXTS.URL] = generateHolderType(trustedValueHolderBase);
            byType[SCE_CONTEXTS.JS] = generateHolderType(trustedValueHolderBase);
            byType[SCE_CONTEXTS.RESOURCE_URL] = generateHolderType(byType[SCE_CONTEXTS.URL]);

            function trustAs(type, trustedValue) {
                var Constructor = (byType.hasOwnProperty(type) ? byType[type] : null);
                if (!Constructor) {
                    throw $sceMinErr('icontext', 'Attempted to trust a value in invalid context. Context: {0}; Value: {1}', type, trustedValue);
                }
                if (trustedValue === null || trustedValue === undefined || trustedValue === '') {
                    return trustedValue;
                }
                // All the current contexts in SCE_CONTEXTS happen to be strings.  In order to avoid trusting
                // mutable objects, we ensure here that the value passed in is actually a string.
                if (typeof trustedValue !== 'string') {
                    throw $sceMinErr('itype', 'Attempted to trust a non-string value in a content requiring a string: Context: {0}', type);
                }
                return new Constructor(trustedValue);
            }

            function valueOf(maybeTrusted) {
                if (maybeTrusted instanceof trustedValueHolderBase) {
                    return maybeTrusted.$$unwrapTrustedValue();
                }

                return maybeTrusted;
            }

            function getTrusted(type, maybeTrusted) {
                var temp_gt = ' - $get - getTrusted -> ',
                    constructor;

                msos.console.debug(temp_sd + temp_gt + 'start, type: ' + type + (maybeTrusted ? ', context: ' + maybeTrusted : ''));

                if (maybeTrusted === null || maybeTrusted === undefined || maybeTrusted === '') {
                    msos.console.debug(temp_sd + temp_gt + 'done, for: ' + (maybeTrusted === null ? 'null' : 'undefined'));
                    return maybeTrusted;
                }

                constructor = (byType.hasOwnProperty(type) ? byType[type] : null);

                if (constructor && maybeTrusted instanceof constructor) {
                    msos.console.debug(temp_sd + temp_gt + 'done, constructor');
                    return maybeTrusted.$$unwrapTrustedValue();
                }
                // If we get here, then we may only take one of two actions.
                // 1. sanitize the value for the requested type, or
                // 2. throw an exception.
                if (type === SCE_CONTEXTS.RESOURCE_URL) {
                    if (isResourceUrlAllowedByPolicy(maybeTrusted)) {
                        msos.console.debug(temp_sd + temp_gt + 'done, policy');
                        return maybeTrusted;
                    }

                    throw $sceMinErr('insecurl', 'Blocked loading resource from url not allowed by $sceDelegate policy.  URL: {0}', maybeTrusted.toString());
                }

                if (type === SCE_CONTEXTS.HTML) {
                    msos.console.debug(temp_sd + temp_gt + 'done, sanitizer');
                    return htmlSanitizer(maybeTrusted);
                }

                throw $sceMinErr('unsafe', 'Attempting to use an unsafe value in a safe context.');
            }

            msos.console.debug(temp_sd + ' - $get -> done!');

            return {
                trustAs: trustAs,
                getTrusted: getTrusted,
                valueOf: valueOf
            };
        }];

        msos.console.debug(temp_sd + ' -> done!');
    }

    function $SceProvider() {
        var enabled = true;

        this.enabled = function (value) {
            if (arguments.length) {
                enabled = !!value;
            }
            return enabled;
        };

        this.$get = ['$parse', '$sceDelegate', function ($parse, $sceDelegate) {

            var sce = shallowCopy(SCE_CONTEXTS),
                lName;

            sce.isEnabled = function () {
                return enabled;
            };

            sce.trustAs = $sceDelegate.trustAs;
            sce.getTrusted = $sceDelegate.getTrusted;
            sce.valueOf = $sceDelegate.valueOf;

            if (!enabled) {
                sce.trustAs = sce.getTrusted = function (type, value) {
                    return value;
                };
                sce.valueOf = identity;
            }

            sce.parseAs = function sceParseAs(type, expr) {
                var parsed = $parse(expr);

                if (parsed.literal && parsed.constant) {
                    return parsed;
                }

                return $parse(
                    expr,
                    function (value) {
                        return sce.getTrusted(type, value);
                    }
                );
            };

            forEach(SCE_CONTEXTS, function (enumValue, name) {
                lName = lowercase(name);
                sce[camelCase("parse_as_" + lName)] = function (expr) {
                    return sce.parseAs(enumValue, expr);
                };
                sce[camelCase("get_trusted_" + lName)] = function (value) {
                    return sce.getTrusted(enumValue, value);
                };
                sce[camelCase("trust_as_" + lName)] = function (value) {
                    return sce.trustAs(enumValue, value);
                };
            });

            return sce;
        }];
    }

    function $TemplateRequestProvider() {
        this.$get = ['$templateCache', '$http', '$q', function ($templateCache, $http, $q) {
            function handleRequestFn(tpl) {
                var transformResponse,
                    httpOptions;

                handleRequestFn.totalPendingRequests += 1;

                transformResponse = $http.defaults && $http.defaults.transformResponse;

                if (_.isArray(transformResponse)) {
                    transformResponse = transformResponse.filter(
                        function (transformer) {
                            return transformer !== defaultHttpResponseTransform;
                        }
                    );
                } else if (transformResponse === defaultHttpResponseTransform) {
                    transformResponse = null;
                }

                httpOptions = {
                    cache: $templateCache,
                    transformResponse: transformResponse
                };

                function handleError(resp) {
                    msos.console.error('ng - $TemplateRequestProvider - $get - handleRequestFn -> failed, template: ' + tpl);
                    return $q.reject($q.defer('reject_handleRequestFn'), resp);
                }

                return $http.get(
                        tpl,
                        httpOptions
                    ).decrement(
                        function () {
                            // Only decrement one (on success or error) Note: not using Promise.finally
                            handleRequestFn.totalPendingRequests -= 1;
                        }
                    ).then(
                        function (response) {
                            return response.data;
                        },
                        handleError
                    );
            }

            handleRequestFn.totalPendingRequests = 0;

            return handleRequestFn;
        }];
    }

    function $$TestabilityProvider() {
        this.$get = ['$rootScope', '$browser', '$location', function($rootScope,   $browser,   $location) {

            var testability = {};

            testability.findBindings = function (element, expression, opt_exactMatch) {
                var bindings = element.getElementsByClassName('ng-binding'),
                    matches = [];

                forEach(
                    bindings,
                    function (binding) {
                        var dataBinding = angular.element(binding).data('$binding');

                        if (dataBinding) {
                            forEach(
                                dataBinding,
                                function (bindingName) {
                                    var matcher;

                                    if (opt_exactMatch) {
                                        matcher = new RegExp('(^|\\s)' + escapeForRegexp(expression) + '(\\s|\\||$)');

                                        if (matcher.test(bindingName)) {
                                            matches.push(binding);
                                        }
                                    } else {
                                        if (bindingName.indexOf(expression) !== -1) {
                                            matches.push(binding);
                                        }
                                    }
                                }
                            );
                        }
                    }
                );

                msos.console.debug('ng - $$TestabilityProvider - $get - findBindings -> bindings: ' + matches.length + ', for: ' + expression);
                return matches;
            };

            testability.findModels = function (element, expression, opt_exactMatch) {
                var prefixes = ['ng-', 'data-ng-', 'ng\\:'],
                    p = 0,
                    attributeEquals = opt_exactMatch ? '=' : '*=',
                    selector = '',
                    elements;

                for (p = 0; p < prefixes.length; p += 1) {
                    selector = '[' + prefixes[p] + 'model' + attributeEquals + '"' + expression + '"]';
                    elements = element.querySelectorAll(selector);

                    if (elements.length) {
                        msos.console.debug('ng - $$TestabilityProvider - $get - findModels -> models: ' +  elements.length + ', for: ' + expression);
                        return elements;
                    }
                }

                return undefined;
            };

            testability.getLocation = function () {
                return $location.url();
            };

            testability.setLocation = function (url) {
                if (url !== $location.url()) {
                    $location.url(url);
                    $rootScope.$digest();
                }
            };

            testability.whenStable = function (callback) {
                $browser.notifyWhenNoOutstandingRequests(callback);
            };

            return testability;
        }];
    }

    function $TimeoutProvider() {
        var temp_tp = 'ng - $TimeoutProvider';

        this.$get = ['$rootScope', '$browser', '$q', '$$q', function ($rootScope, $browser, $q, $$q) {
            var deferreds = {};

            function timeout(fn, delay, invokeApply) {
                var temp_to = ' - $get - timeout -> ',
                    skipApply = (isDefined(invokeApply) && !invokeApply),
                    deferred = (skipApply ? $$q : $q).defer('timeout'),
                    promise = deferred.promise,
                    timeoutId;

                msos.console.debug(temp_tp + temp_to + 'start, name: ' + promise.$$state.name + ', delay: ' + delay);

                timeoutId = $browser.defer(
                    function () {
                        try {
                            deferred.resolve(fn());
                        } catch (e) {
                            msos.console.error(temp_tp + temp_to + 'failed:', e);
                            deferred.reject(e);
                        } finally {
                            delete deferreds[promise.$$timeoutId];
                        }
    
                        if (!skipApply) { $rootScope.$apply(); }
                    },
                    delay
                );

                promise.$$timeoutId = timeoutId;
                deferreds[timeoutId] = deferred;

                msos.console.debug(temp_tp + temp_to + 'done!');
                return promise;
            }

            timeout.cancel = function (promise) {
                if (promise && deferreds.hasOwnProperty(promise.$$timeoutId)) {
                    deferreds[promise.$$timeoutId].reject('canceled');
                    delete deferreds[promise.$$timeoutId];
                    return $browser.defer.cancel(promise.$$timeoutId);
                }
                return false;
            };

            return timeout;
        }];
    }

    function $WindowProvider() {
        this.$get = valueFn(window);
    }

    function orderByFilter($parse) {
        return function (array, sortPredicate, reverseOrder) {

            if (!(isArrayLike(array))) { return array; }

            function comparator(o1, o2) {
                var i = 0,
                    comp;

                for (i = 0; i < sortPredicate.length; i += 1) {
                    comp = sortPredicate[i](o1, o2);
                    if (comp !== 0) { return comp; }
                }
                return 0;
            }

            function reverseComparator(comp, descending) {
                return descending
                    ? function (a, b) { return comp(b, a); }
                    : comp;
            }

            function isPrimitive(value) {
                switch (typeof value) {
                    case 'number':      /* falls through */
                    case 'boolean':     /* falls through */
                    case 'string':
                        return true;
                    default:
                        return false;
                }
            }

            function objectToString(value) {
                if (value === null) { return 'null'; }

                if (typeof value.valueOf === 'function') {
                    value = value.valueOf();
                    if (isPrimitive(value)) { return value; }
                }

                if (typeof value.toString === 'function') {
                    value = value.toString();
                    if (isPrimitive(value)) { return value; }
                }
                return '';
            }

            function compare(v1, v2) {
                var t1 = typeof v1,
                    t2 = typeof v2;

                if (t1 === t2 && t1 === "object") {
                    v1 = objectToString(v1);
                    v2 = objectToString(v2);
                }

                if (t1 === t2) {
                    if (t1 === "string") {
                        v1 = v1.toLowerCase();
                        v2 = v2.toLowerCase();
                    }

                    if (v1 === v2) { return 0; }

                    return v1 < v2 ? -1 : 1;
                } else {
                    return t1 < t2 ? -1 : 1;
                }
            }

            sortPredicate = _.isArray(sortPredicate) ? sortPredicate : [sortPredicate];

            if (sortPredicate.length === 0) { sortPredicate = ['+']; }

            sortPredicate = sortPredicate.map(
                function (predicate) {
                    var descending = false,
                        get = predicate || identity,
                        key;

                    if (_.isString(predicate)) {
                        if ((predicate.charAt(0) === '+' || predicate.charAt(0) === '-')) {
                            descending = predicate.charAt(0) === '-';
                            predicate = predicate.substring(1);
                        }

                        if (predicate === '') {
                            // Effectively no predicate was passed so we compare identity
                            return reverseComparator(compare, descending);
                        }

                        get = $parse(predicate);

                        if (get.constant) {
                            key = get();

                            return reverseComparator(
                                function (a, b) {
                                    return compare(a[key], b[key]);
                                },
                                descending
                            );
                        }
                    }

                    return reverseComparator(
                        function (a, b) {
                            return compare(get(a),get(b));
                        },
                        descending
                    );
                }
            );

            return slice.call(array).sort(reverseComparator(comparator, reverseOrder));
        };
    }

    orderByFilter.$inject = ['$parse'];

    function deepCompare(actual, expected, comparator, matchAgainstAnyProp, dontMatchWholeObject) {
        var actualType = typeof actual,
            expectedType = typeof expected,
            key,
            expectedVal,
            matchAnyProperty,
            actualVal;

        if ((expectedType === 'string') && (expected.charAt(0) === '!')) {
            return !deepCompare(actual, expected.substring(1), comparator, matchAgainstAnyProp);
        }

        if (actualType === 'function') { return false; }

        if (_.isArray(actual)) {
            return actual.some(
                function (item) {
                    return deepCompare(item, expected, comparator, matchAgainstAnyProp);
                }
            );
        }

        if (actualType === 'object') {
            if (matchAgainstAnyProp) {
                for (key in actual) {
                    if ((key.charAt(0) !== '$') && deepCompare(actual[key], expected, comparator, true)) {
                        return true;
                    }
                }

                return dontMatchWholeObject ? false : deepCompare(actual, expected, comparator, false);
            }

            if (expectedType === 'object') {
                for (key in expected) {
                    expectedVal = expected[key];

                    if (_.isFunction(expectedVal)) { continue; }

                    matchAnyProperty = key === '$';
                    actualVal = matchAnyProperty ? actual : actual[key];

                    if (!deepCompare(actualVal, expectedVal, comparator, matchAnyProperty, matchAnyProperty)) {
                        return false;
                    }
                }
                return true;
            }
        }

        return comparator(actual, expected);
    }

    function createPredicateFn(expression, comparator, matchAgainstAnyProp) {
        var shouldMatchPrimitives = _.isObject(expression) && (expression.hasOwnProperty('$')),
            predicateFn;

        if (comparator === true) {
            comparator = equals;
        } else if (!_.isFunction(comparator)) {
            comparator = function(actual, expected) {
                if (_.isObject(actual) || _.isObject(expected)) {
                    // Prevent an object to be considered equal to a string like `'[object'`
                    return false;
                }

                actual =    lowercase(String(actual));
                expected =  lowercase(String(expected));

                return actual.indexOf(expected) !== -1;
            };
        }

        predicateFn = function (item) {
            if (shouldMatchPrimitives && !_.isObject(item)) {
                return deepCompare(item, expression.$, comparator, false);
            }
            return deepCompare(item, expression, comparator, matchAgainstAnyProp);
        };

        return predicateFn;
    }

    function filterFilter() {
        return function (array, expression, comparator) {
            if (!_.isArray(array)) { return array; }

            var predicateFn,
                matchAgainstAnyProp;

            switch (typeof expression) {
                case 'function':
                    predicateFn = expression;
                break;
                case 'boolean':
                case 'number':
                case 'string':
                    matchAgainstAnyProp = true;
                //jshint -W086
                case 'object':
                //jshint +W086
                    predicateFn = createPredicateFn(expression, comparator, matchAgainstAnyProp);
                break;
                default:
                    return array;
            }

            return array.filter(predicateFn);
        };
    }

    function formatNumber(number, pattern, groupSep, decimalSep, fractionSize) {

        if (!isFinite(number) || _.isObject(number)) { return ''; }

        var isNegative = number < 0,
            numStr,
            match,
            formatedText = '',
            parts = [],
            hasExponent = false,
            fraction,
            whole,
            fractionLen,
            i,
            pos = 0,
            lgroup,
            group;

        number = Math.abs(number);

        numStr = String(number);

        if (numStr.indexOf('e') !== -1) {
            match = numStr.match(/([\d\.]+)e(-?)(\d+)/);
            if (match && match[2] === '-' && match[3] > fractionSize + 1) {
                number = 0;
            } else {
                formatedText = numStr;
                hasExponent = true;
            }
        }

        if (!hasExponent) {

            fractionLen = (numStr.split(DECIMAL_SEP)[1] || '').length;

            // determine fractionSize if it is not specified
            if (_.isUndefined(fractionSize)) {
                fractionSize = Math.min(Math.max(pattern.minFrac, fractionLen), pattern.maxFrac);
            }

            // safely round numbers in JS without hitting imprecisions of floating-point arithmetics
            // inspired by:
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
            number = +(Math.round(+(number.toString() + 'e' + fractionSize)).toString() + 'e' + -fractionSize);

            fraction = String(number).split(DECIMAL_SEP);
            whole = fraction[0];

            fraction = fraction[1] || '';

            lgroup = pattern.lgSize;
            group = pattern.gSize;

            if (whole.length >= (lgroup + group)) {
                pos = whole.length - lgroup;
                for (i = 0; i < pos; i += 1) {
                    if ((pos - i) % group === 0 && i !== 0) {
                        formatedText += groupSep;
                    }
                    formatedText += whole.charAt(i);
                }
            }

            for (i = pos; i < whole.length; i += 1) {
                if ((whole.length - i) % lgroup === 0 && i !== 0) {
                    formatedText += groupSep;
                }
                formatedText += whole.charAt(i);
            }

            // format fraction part.
            while (fraction.length < fractionSize) {
                fraction += '0';
            }

            if (fractionSize && fractionSize !== "0") { formatedText += decimalSep + fraction.substr(0, fractionSize); }

        } else {

            if (fractionSize > 0 && number < 1) {
                formatedText = number.toFixed(fractionSize);
                number = parseFloat(formatedText);
            }
        }

        if (number === 0) {
            isNegative = false;
        }

        parts.push(
            isNegative ? pattern.negPre : pattern.posPre,
            formatedText,
            isNegative ? pattern.negSuf : pattern.posSuf
        );

        return parts.join('');
    }

    function currencyFilter($locale) {
        var formats = $locale.NUMBER_FORMATS;

        return function (amount, currencySymbol, fractionSize) {
            if (_.isUndefined(currencySymbol)) {
                currencySymbol = formats.CURRENCY_SYM;
            }

            if (_.isUndefined(fractionSize)) {
                fractionSize = formats.PATTERNS[1].maxFrac;
            }

            // if null or undefined pass it through
            return (amount == null)     // jshint ignore:line
                ? amount
                : formatNumber(
                    amount,
                    formats.PATTERNS[1],
                    formats.GROUP_SEP,
                    formats.DECIMAL_SEP,
                    fractionSize
                ).replace(/\u00A4/g, currencySymbol);
        };
    }

    currencyFilter.$inject = ['$locale'];

    function numberFilter($locale) {
        var formats = $locale.NUMBER_FORMATS;
        return function (number, fractionSize) {

            // if null or undefined pass it through
            return (number == null)     // jshint ignore:line
                ? number
                : formatNumber(
                    number,
                    formats.PATTERNS[0],
                    formats.GROUP_SEP,
                    formats.DECIMAL_SEP,
                    fractionSize
                );
        };
    }

    numberFilter.$inject = ['$locale'];

    function jsonFilter() {
        return function (object, spacing) {
            if (_.isUndefined(spacing)) {
                spacing = 2;
            }
            return toJson(object, spacing);
        };
    }

    function limitToFilter() {
        return function (input, limit) {
            if (_.isNumber(input)) { input = input.toString(); }
            if (!_.isArray(input) && !_.isString(input)) { return input; }

            if (Math.abs(Number(limit)) === Infinity) {
                limit = Number(limit);
            } else {
                limit = parseInt(limit, 10);
            }

            // NaN check on limit
            if (limit) {
                return limit > 0 ? input.slice(0, limit) : input.slice(limit);
            }

            return _.isString(input) ? "" : [];
        };
    }

    function padNumber(num, digits, trim) {
        var neg = '';

        if (num < 0) {
            neg = '-';
            num = -num;
        }

        num = String(num);

        while (num.length < digits) { num = '0' + num; }

        if (trim) { num = num.substr(num.length - digits); }

        return neg + num;
    }

    function dateGetter(name, size, offset, trim) {
        offset = offset || 0;
        return function (date) {
            var value = date['get' + name]();
            if (offset > 0 || value > -offset) { value += offset; }
            if (value === 0 && offset === -12) { value = 12; }
            return padNumber(value, size, trim);
        };
    }

    function dateStrGetter(name, shortForm) {
        return function (date, formats) {
            var value = date['get' + name](),
                get = uppercase(shortForm ? ('SHORT' + name) : name);

            return formats[get][value];
        };
    }

    function timeZoneGetter(date) {
        var zone = -1 * date.getTimezoneOffset(),
            paddedZone = (zone >= 0) ? "+" : "";

        paddedZone += padNumber(Math[zone > 0 ? 'floor' : 'ceil'](zone / 60), 2) + padNumber(Math.abs(zone % 60), 2);

        return paddedZone;
    }

    function getFirstThursdayOfYear(year) {
        // 0 = index of January
        var dayOfWeekOnFirst = (new Date(year, 0, 1)).getDay();
        // 4 = index of Thursday (+1 to account for 1st = 5)
        // 11 = index of *next* Thursday (+1 account for 1st = 12)
        return new Date(year, 0, ((dayOfWeekOnFirst <= 4) ? 5 : 12) - dayOfWeekOnFirst);
    }

    function getThursdayThisWeek(datetime) {
        return new Date(datetime.getFullYear(), datetime.getMonth(),
        // 4 = index of Thursday
        datetime.getDate() + (4 - datetime.getDay()));
    }

    function weekGetter(size) {
        return function (date) {
            var firstThurs = getFirstThursdayOfYear(date.getFullYear()),
                thisThurs = getThursdayThisWeek(date),
                diff = +thisThurs - +firstThurs,
                result = 1 + Math.round(diff / 6.048e8); // 6.048e8 ms per week

            return padNumber(result, size);
        };
    }

    function ampmGetter(date, formats) {
        return date.getHours() < 12 ? formats.AMPMS[0] : formats.AMPMS[1];
    }

    DATE_FORMATS = {
        yyyy: dateGetter('FullYear', 4),
        yy: dateGetter('FullYear', 2, 0, true),
        y: dateGetter('FullYear', 1),
        MMMM: dateStrGetter('Month'),
        MMM: dateStrGetter('Month', true),
        MM: dateGetter('Month', 2, 1),
        M: dateGetter('Month', 1, 1),
        dd: dateGetter('Date', 2),
        d: dateGetter('Date', 1),
        HH: dateGetter('Hours', 2),
        H: dateGetter('Hours', 1),
        hh: dateGetter('Hours', 2, -12),
        h: dateGetter('Hours', 1, -12),
        mm: dateGetter('Minutes', 2),
        m: dateGetter('Minutes', 1),
        ss: dateGetter('Seconds', 2),
        s: dateGetter('Seconds', 1),
        sss: dateGetter('Milliseconds', 3),
        EEEE: dateStrGetter('Day'),
        EEE: dateStrGetter('Day', true),
        a: ampmGetter,
        Z: timeZoneGetter,
        ww: weekGetter(2),
        w: weekGetter(1)
    };

    function dateFilter($locale) {

        var R_ISO8601_STR = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
        // 1        2       3         4          5          6          7          8  9     10      11
        function jsonStringToDate(string) {
            var match,
                date,
                tzHour = 0,
                tzMin = 0,
                dateSetter,
                timeSetter,
                h,
                m,
                s,
                ms;

            match = string.match(R_ISO8601_STR);

            if (match) {
                date = new Date(0);
                dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear;
                timeSetter = match[8] ? date.setUTCHours : date.setHours;

                if (match[9]) {
                    tzHour = parseInt(match[9] + match[10], 10);
                    tzMin = parseInt(match[9] + match[11], 10);
                }
                dateSetter.call(date, parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10));

                h = parseInt(match[4] || 0, 10) - tzHour;
                m = parseInt(match[5] || 0, 10) - tzMin;
                s = parseInt(match[6] || 0, 10);
                ms = Math.round(parseFloat('0.' + (match[7] || 0)) * 1000);

                timeSetter.call(date, h, m, s, ms);
                return date;
            }
            return string;
        }

        return function (date, format, timezone) {
            var text = '',
                parts = [],
                fn, match;

            format = format || 'mediumDate';
            format = $locale.DATETIME_FORMATS[format] || format;
            if (_.isString(date)) {
                date = NUMBER_STRING.test(date) ? parseInt(date, 10) : jsonStringToDate(date);
            }

            if (_.isNumber(date)) {
                date = new Date(date);
            }

            if (!_.isDate(date)) {
                return date;
            }

            while (format) {
                match = DATE_FORMATS_SPLIT.exec(format);
                if (match) {
                    parts = concat(parts, match, 1);
                    format = parts.pop();
                } else {
                    parts.push(format);
                    format = null;
                }
            }

            if (timezone && timezone === 'UTC') {
                date = new Date(date.getTime());
                date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
            }

            forEach(parts, function (value) {
                fn = DATE_FORMATS[value];
                text += fn ? fn(date, $locale.DATETIME_FORMATS) : value.replace(/(^'|'$)/g, '').replace(/''/g, "'");
            });

            return text;
        };
    }

    dateFilter.$inject = ['$locale'];

    function $FilterProvider($provide) {
        var suffix = 'Filter',
            lowercaseFilter = valueFn(lowercase),
            uppercaseFilter = valueFn(uppercase);

        function register(name, factory) {
            if (_.isObject(name)) {
                var filters = {};
                forEach(name, function (filter, key) {
                    filters[key] = register(key, filter);
                });
                return filters;
            }
            return $provide.factory(name + suffix, factory);
        }
        this.register = register;

        this.$get = ['$injector', function ($injector) {
            return function (name) {
                return $injector.get(name + suffix);
            };
        }];

        register('currency', currencyFilter);
        register('date', dateFilter);
        register('filter', filterFilter);
        register('json', jsonFilter);
        register('limitTo', limitToFilter);
        register('lowercase', lowercaseFilter);
        register('number', numberFilter);
        register('orderBy', orderByFilter);
        register('uppercase', uppercaseFilter);
    }

    $FilterProvider.$inject = ['$provide'];

    function ngDirective(directive) {
        if (_.isFunction(directive)) {
            directive = {
                link: directive
            };
        }
        directive.restrict = directive.restrict || 'AC';
        return valueFn(directive);
    }

    htmlAnchorDirective = valueFn({
        restrict: 'E',
        compile: function (element, attr) {

            if (!attr.href && !attr.xlinkHref && !attr.name) {
                return function (scope, element) {

                    // If the linked element is not an anchor tag anymore, do nothing
                    if (element[0].nodeName.toLowerCase() !== 'a') { return; }

                    // SVGAElement does not use the href attribute, but rather the 'xlinkHref' attribute.
                    var href = ngto_string.call(element.prop('href')) === '[object SVGAnimatedString]' ? 'xlink:href' : 'href';

                    element.on('click', function (event) {
                        // if we have no href url, then don't navigate anywhere.
                        if (!element.attr(href)) {
                            event.preventDefault();
                        }
                    });
                };
            }
            return undefined;
        }
    });

    // boolean attrs are evaluated
    forEach(BOOLEAN_ATTR, function (propName, attrName) {
        // binding to multiple is not supported
        if (propName === "multiple") { return; }

        var normalized = directiveNormalize('ng-' + attrName);
        ngAttributeAliasDirectives[normalized] = function () {
            return {
                restrict: 'A',
                priority: 100,
                link: function (scope, element, attr) {
                    scope.$watch(attr[normalized], function ngBooleanAttrWatchAction(value) {
                        attr.$set(attrName, !! value);
                    });
                }
            };
        };
    });

    // aliased input attrs are evaluated
    forEach(ALIASED_ATTR, function (htmlAttr, ngAttr) {
        ngAttributeAliasDirectives[ngAttr] = function () {
            return {
                priority: 100,
                link: function (scope, element, attr) {
                    //special case ngPattern when a literal regular expression value
                    //is used as the expression (this way we don't have to watch anything).
                    if (ngAttr === "ngPattern" && attr.ngPattern.charAt(0) === "/") {
                        var match = attr.ngPattern.match(REGEX_STRING_REGEXP);
                        if (match) {
                            attr.$set("ngPattern", new RegExp(match[1], match[2]));
                            return;
                        }
                    }

                    scope.$watch(attr[ngAttr], function ngAttrAliasWatchAction(value) {
                        attr.$set(ngAttr, value);
                    });
                }
            };
        };
    });

    forEach(['src', 'srcset', 'href'], function (attrName) {
        var normalized = directiveNormalize('ng-' + attrName);
        ngAttributeAliasDirectives[normalized] = function () {
            return {
                priority: 99,
                // it needs to run after the attributes are interpolated
                link: function (scope, element, attr) {
                    var propName = attrName,
                        name = attrName;

                    if (attrName === 'href' && ngto_string.call(element.prop('href')) === '[object SVGAnimatedString]') {
                        name = 'xlinkHref';
                        attr.$attr[name] = 'xlink:href';
                        propName = null;
                    }

                    attr.$observe(normalized, function (value) {
                        if (!value) {
                            if (attrName === 'href') {
                                attr.$set(name, null);
                            }
                            return;
                        }

                        attr.$set(name, value);

                        // on IE, if "ng:src" directive declaration is used and "src" attribute doesn't exist
                        // then calling element.setAttribute('src', 'foo') doesn't do anything, so we need
                        // to set the property as well to achieve the desired effect.
                        // we use attr[attrName] value since $set can sanitize the url.
                        if (msie && propName) { element.prop(propName, attr[name]); }
                    });
                }
            };
        };
    });

    if (msos.config.verbose) {
        msos.console.debug('ng - ngAttributeAliasDirectives -> created:', _.keys(ngAttributeAliasDirectives));
    }

    function isObjectEmpty(obj) {
        var prop,
            flag = true;

        if (obj) {
            for (prop in obj) {
                if (isDefined(prop)) { flag = false; }
            }
        }

        return flag;
    }

    function addSetValidityMethod(context) {
        var ctrl = context.ctrl,
            $element = context.$element,
            classCache = {},
            set = context.set,
            unset = context.unset,
            parentForm = context.parentForm,
            $animate = context.$animate;

        function cachedToggleClass(className, switchValue) {
            if (switchValue && !classCache[className]) {
                $animate.addClass($element, className);
                classCache[className] = true;
            } else if (!switchValue && classCache[className]) {
                $animate.removeClass($element, className);
                classCache[className] = false;
            }
        }

        function toggleValidationCss(validationErrorKey, isValid) {
            validationErrorKey = validationErrorKey ? '-' + snake_case(validationErrorKey, '-') : '';

            cachedToggleClass(VALID_CLASS + validationErrorKey, isValid === true);
            cachedToggleClass(INVALID_CLASS + validationErrorKey, isValid === false);
        }

        function createAndSet(name, value, controller) {
            if (!ctrl[name]) {
                ctrl[name] = {};
            }
            set(ctrl[name], value, controller);
        }

        function unsetAndCleanup(name, value, controller) {
            if (ctrl[name]) {
                unset(ctrl[name], value, controller);
            }
            if (isObjectEmpty(ctrl[name])) {
                ctrl[name] = undefined;
            }
        }

        function setValidity(validationErrorKey, state, controller) {
            var combinedState;

            if (state === undefined) {
                createAndSet('$pending', validationErrorKey, controller);
            } else {
                unsetAndCleanup('$pending', validationErrorKey, controller);
            }

            if (!_.isBoolean(state)) {
                unset(ctrl.$error, validationErrorKey, controller);
                unset(ctrl.$$success, validationErrorKey, controller);
            } else {
                if (state) {
                    unset(ctrl.$error, validationErrorKey, controller);
                    set(ctrl.$$success, validationErrorKey, controller);
                } else {
                    set(ctrl.$error, validationErrorKey, controller);
                    unset(ctrl.$$success, validationErrorKey, controller);
                }
            }

            if (ctrl.$pending) {
                cachedToggleClass(PENDING_CLASS, true);
                ctrl.$valid = ctrl.$invalid = undefined;
                toggleValidationCss('', null);
            } else {
                cachedToggleClass(PENDING_CLASS, false);
                ctrl.$valid = isObjectEmpty(ctrl.$error);
                ctrl.$invalid = !ctrl.$valid;
                toggleValidationCss('', ctrl.$valid);
            }

            // re-read the state as the set/unset methods could have
            // combined state in ctrl.$error[validationError] (used for forms),
            // where setting/unsetting only increments/decrements the value,
            // and does not replace it.
            if (ctrl.$pending && ctrl.$pending[validationErrorKey]) {
                combinedState = undefined;
            } else if (ctrl.$error[validationErrorKey]) {
                combinedState = false;
            } else if (ctrl.$$success[validationErrorKey]) {
                combinedState = true;
            } else {
                combinedState = null;
            }

            toggleValidationCss(validationErrorKey, combinedState);
            parentForm.$setValidity(validationErrorKey, combinedState, ctrl);
        }

        classCache[VALID_CLASS] = $element.hasClass(VALID_CLASS);
        classCache[INVALID_CLASS] = !classCache[VALID_CLASS];

        ctrl.$setValidity = setValidity;
    }

    function FormController(element, attrs, $scope, $animate, $interpolate) {
        var temp_fc = 'ng - FormController',
            form = this,
            controls = [],
            parentForm;

        // init state
        form.$$parentForm = element.parent().controller('form') || nullFormCtrl;
        form.$error = {};
        form.$$success = {};
        form.$pending = undefined;
        form.$name = $interpolate(attrs.name || attrs.ngForm || '')($scope);
        form.$dirty = false;
        form.$pristine = true;
        form.$valid = true;
        form.$invalid = false;
        form.$submitted = false;

        parentForm = form.$$parentForm;

        parentForm.$addControl(form);

        form.$rollbackViewValue = function () {
            forEach(controls, function (control) {
                control.$rollbackViewValue();
            });
        };

        form.$commitViewValue = function () {
            forEach(controls, function (control) {
                control.$commitViewValue();
            });
        };

        form.$addControl = function (control) {
            // Breaking change - before, inputs whose name was "hasOwnProperty" were quietly ignored
            // and not added to the scope.  Now we throw an error.
            assertNotHasOwnProperty(control.$name, 'input');
            controls.push(control);

            if (control.$name) {
                form[control.$name] = control;
            }
        };

        // Private API: rename a form control
        form.$$renameControl = function (control, newName) {
            var oldName = control.$name;

            if (form[oldName] === control) {
                delete form[oldName];
            }

            form[newName] = control;
            control.$name = newName;
        };

        form.$removeControl = function (control) {
            if (control.$name && form[control.$name] === control) {
                delete form[control.$name];
            }
            forEach(form.$pending, function (value, name) {
                form.$setValidity(name, null, control);
            });
            forEach(form.$error, function (value, name) {
                form.$setValidity(name, null, control);
            });
            forEach(form.$$success, function (value, name) {
                form.$setValidity(name, null, control);
            });

            arrayRemove(controls, control);
        };

        addSetValidityMethod(
            {
                ctrl: this,
                $element: element,
                set: function (object, property, controller) {
                    var list = object[property],
                        index;

                    if (!list) {
                        object[property] = [controller];
                    } else {
                        index = list.indexOf(controller);
                        if (index === -1) {
                            list.push(controller);
                        }
                    }
                },
                unset: function (object, property, controller) {
                    var list = object[property];

                    if (!list) { return; }

                    arrayRemove(list, controller);

                    if (list.length === 0) {
                        delete object[property];
                    }
                },
                parentForm: parentForm,
                $animate: $animate
            }
        );

        form.$setDirty = function () {
            $animate.removeClass(element, PRISTINE_CLASS);
            $animate.addClass(element, DIRTY_CLASS);
            form.$dirty = true;
            form.$pristine = false;
            parentForm.$setDirty();
        };

        form.$setPristine = function () {
            $animate.setClass(element, PRISTINE_CLASS, DIRTY_CLASS + ' ' + SUBMITTED_CLASS);
            form.$dirty = false;
            form.$pristine = true;
            form.$submitted = false;
            forEach(controls, function (control) {
                control.$setPristine();
            });
        };

        form.$setUntouched = function () {
            forEach(
                controls,
                function (control) {
                    control.$setUntouched();
                }
            );
        };

        form.$setSubmitted = function () {
            $animate.addClass(element, SUBMITTED_CLASS);
            form.$submitted = true;
            parentForm.$setSubmitted();
        };
    }

    FormController.$inject = ['$element', '$attrs', '$scope', '$animate', '$interpolate'];

    formDirectiveFactory = function (isNgForm) {
        var temp_fd = 'ng - formDirectiveFactory';

        return ['$timeout', function ($timeout) {
            var formDirective_F = {
                name: 'form',
                restrict: isNgForm ? 'EAC' : 'E',
                controller: FormController,
                compile: function ngFormCompile(formElement) {
                    // Setup initial state of the control
                    formElement.addClass(PRISTINE_CLASS).addClass(VALID_CLASS);

                    return {
                        pre: function ngFormPreLink(scope, formElement, attr, controller) {
                            var handleFormSubmission,
                                parentFormCtrl,
                                alias;

                            if (!attr.hasOwnProperty('action')) {

                                handleFormSubmission = function (event) {
                                    var temp_hf = ' - compile - ngFormPreLink - handleFormSubmission -> ',
                                        tar_name = event.target.id || lowercase(event.target.nodeName);

                                    msos.console.debug(temp_fd + temp_hf + 'start, target: ' + tar_name);

                                    scope.$apply(
                                        function () {
                                            controller.$commitViewValue();
                                            controller.$setSubmitted();
                                        }
                                    );

                                    event.preventDefault();
                                    msos.console.debug(temp_fd + temp_hf + 'done!');
                                };

                                addEventListenerFn(formElement[0], 'submit', handleFormSubmission);

                                // unregister the preventDefault listener so that we don't not leak memory but in a
                                // way that will achieve the prevention of the default action.
                                formElement.on(
                                    '$destroy',
                                    function () {
                                        $timeout(
                                            function () {
                                                removeEventListenerFn(formElement[0], 'submit', handleFormSubmission);
                                            },
                                            0,
                                            false
                                        );
                                    }
                                );
                            }

                            parentFormCtrl = controller.$$parentForm;
                            alias = controller.$name;

                            if (alias) {

                                setter(scope, null, alias, controller, alias);

                                attr.$observe(
                                    attr.name ? 'name' : 'ngForm',
                                    function (newValue) {
                                        if (alias === newValue) { return; }

                                        setter(scope, null, alias, undefined, alias);
                                        alias = newValue;

                                        setter(scope, null, alias, controller, alias);
                                        parentFormCtrl.$$renameControl(controller, alias);
                                    }
                                );
                            }

                            formElement.on(
                                '$destroy',
                                function () {
                                    parentFormCtrl.$removeControl(controller);
                                    if (alias) {
                                        setter(scope, null, alias, undefined, alias);
                                    }
                                    extend(controller, nullFormCtrl); //stop propagating child destruction handlers upwards
                                }
                            );
                        }
                    };
                }
            };

            return formDirective_F;
        }];
    };

    formDirective = formDirectiveFactory();
    ngFormDirective = formDirectiveFactory(true);

    function stringBasedInputType(ctrl) {
        ctrl.$formatters.push(
            function (value) {
                return ctrl.$isEmpty(value) ? value : value.toString();
            }
        );
    }

    function baseInputType(scope, element, attr, ctrl, $browser) {
        var type = lowercase(element[0].type),
            listener,
            composing = false,
            timeout,
            deferListener;

        listener = function (ev) {

            if (timeout) {
                $browser.defer.cancel(timeout);
                timeout = null;
            }

            if (composing) { return; }

            var value = element.val(),
                event = ev && ev.type;

            if (type !== 'password' && (!attr.ngTrim || attr.ngTrim !== 'false')) {
                value = trim(value);
            }

            if (ctrl.$viewValue !== value || (value === '' && ctrl.$$hasNativeValidators)) {
                ctrl.$setViewValue(value, event);
            }
        };

        if (!android) {

            element.on('compositionstart', function () {
                composing = true;
            });

            element.on('compositionend', function () {
                composing = false;
                listener();
            });
        }

        // if the browser does support "input" event, we are fine - except on IE9 which doesn't fire the
        // input event on backspace, delete or cut
        if (Modernizr.hasEvent('input')) {
            element.on('input', listener);
        } else {

            deferListener = function (ev, input, origValue) {
                if (!timeout) {
                    timeout = $browser.defer(
                        function () {
                            timeout = null;
                            if (!input || input.value !== origValue) {
                                listener(ev);
                            }
                        }
                    );
                }
            };

            element.on('keydown', function (event) {
                var key = event.keyCode;

                // ignore
                //    command            modifiers                   arrows
                if (key === 91 || (15 < key && key < 19) || (37 <= key && key <= 40)) { return; }

                deferListener(event, this, this.value);
            });

            // if user modifies input value using context menu in IE, we need "paste" and "cut" events to catch it
            if (Modernizr.hasEvent('paste')) {
                element.on('paste cut', deferListener);
            }
        }

        // if user paste into input using mouse on older browser
        // or form autocomplete on newer browser, we need "change" event to catch it
        element.on('change', listener);

        ctrl.$render = function () {
            element.val(ctrl.$isEmpty(ctrl.$viewValue) ? '' : ctrl.$viewValue);
        };
    }

    function textInputType(scope, element, attr, ctrl, $browser) {
        baseInputType(scope, element, attr, ctrl, $browser);
        stringBasedInputType(ctrl);
    }

    function weekParser(isoWeek, existingDate) {
        var parts,
            year,
            week,
            hours,
            minutes,
            seconds,
            milliseconds,
            firstThurs,
            addDays;

        if (_.isDate(isoWeek)) {
            return isoWeek;
        }

        if (_.isString(isoWeek)) {

            WEEK_REGEXP.lastIndex = 0;

            parts = WEEK_REGEXP.exec(isoWeek);

            if (parts) {
                year = +parts[1];
                week = +parts[2];
                hours = 0;
                minutes = 0;
                seconds = 0;
                milliseconds = 0;
                firstThurs = getFirstThursdayOfYear(year);
                addDays = (week - 1) * 7;

                if (existingDate) {
                    hours = existingDate.getHours();
                    minutes = existingDate.getMinutes();
                    seconds = existingDate.getSeconds();
                    milliseconds = existingDate.getMilliseconds();
                }

                return new Date(year, 0, firstThurs.getDate() + addDays, hours, minutes, seconds, milliseconds);
            }
        }

        return NaN;
    }  

    function createDateParser(regexp, mapping) {
        return function(iso, date) {
            var parts,
                map;

            if (_.isDate(iso)) {
                return iso;
            }

            if (_.isString(iso)) {
                // When a date is JSON'ified to wraps itself inside of an extra
                // set of double quotes. This makes the date parsing code unable
                // to match the date string and parse it as a date.
                if (iso.charAt(0) === '"'
                 && iso.charAt(iso.length - 1) === '"') {
                    iso = iso.substring(1, iso.length - 1);
                }

                if (ISO_DATE_REGEXP.test(iso)) {
                    return new Date(iso);
                }

                regexp.lastIndex = 0;
                parts = regexp.exec(iso);

                if (parts) {
                    parts.shift();
                    if (date) {
                        map = {
                            yyyy: date.getFullYear(),
                            MM: date.getMonth() + 1,
                            dd: date.getDate(),
                            HH: date.getHours(),
                            mm: date.getMinutes(),
                            ss: date.getSeconds(),
                            sss: date.getMilliseconds() / 1000
                        };
                    } else {
                        map = {
                            yyyy: 1970,
                            MM: 1,
                            dd: 1,
                            HH: 0,
                            mm: 0,
                            ss: 0,
                            sss: 0
                        };
                    }

                    forEach(
                        parts,
                        function (part, index) {
                            if (index < mapping.length) {
                                map[mapping[index]] = +part;
                            }
                        }
                    );
                    return new Date(map.yyyy, map.MM - 1, map.dd, map.HH, map.mm, map.ss || 0, map.sss * 1000 || 0);
                }
            }
    
            return NaN;
        };
    }

    function badInputChecker(scope, element, attr, ctrl) {
        var node = element[0];

        ctrl.$$hasNativeValidators = _.isObject(node.validity);

        if (ctrl.$$hasNativeValidators) {
            ctrl.$parsers.push(
                function (value) {
                    var validity = element.prop(VALIDITY_STATE_PROPERTY) || {};

                    return validity.badInput && !validity.typeMismatch ? undefined : value;
                }
            );
        }
    }

    function createDateInputType(type, regexp, parseDate, format) {
        return function dynamicDateInputType(scope, element, attr, ctrl, $browser, $filter) {

            badInputChecker(scope, element, attr, ctrl);
            baseInputType(scope, element, attr, ctrl, $browser);

            var timezone = ctrl && ctrl.$options && ctrl.$options.timezone,
                previousDate,
                minVal,
                maxVal;

            function isValidDate(value) {
                // Invalid Date: getTime() returns NaN
                return value && !(value.getTime && value.getTime() !== value.getTime());
            }

            function parseObservedDateValue(val) {
                return isDefined(val) ? (_.isDate(val) ? val : parseDate(val)) : undefined;
            }

            ctrl.$$parserName = type;

            ctrl.$parsers.push(
                function (value) {
                    var parsedDate_out;

                    if (ctrl.$isEmpty(value)) { return null; }

                    if (regexp.test(value)) {
                        // Note: We cannot read ctrl.$modelValue, as there might be a different
                        // parser/formatter in the processing chain so that the model
                        // contains some different data format!
                        parsedDate_out = parseDate(value, previousDate);

                        if (timezone === 'UTC') {
                            parsedDate_out.setMinutes(parsedDate_out.getMinutes() - parsedDate_out.getTimezoneOffset());
                        }
                        return parsedDate_out;
                    }
                    return undefined;
                }
            );

            ctrl.$formatters.push(
                function (value) {
                    if (value && !_.isDate(value)) {
                        throw $ngModelMinErr(
                            'datefmt',
                            'Expected `{0}` to be a date',
                            value
                        );
                    }

                    if (isValidDate(value)) {

                        previousDate = value;

                        if (previousDate && timezone === 'UTC') {
                            var timezoneOffset = 60000 * previousDate.getTimezoneOffset();
                            previousDate = new Date(previousDate.getTime() + timezoneOffset);
                        }

                        return $filter('date')(value, format, timezone);
                    }

                    previousDate = null;
                    return '';
                }
            );

            if (isDefined(attr.min) || attr.ngMin) {
                ctrl.$validators.min = function (value) {
                    return !isValidDate(value) || _.isUndefined(minVal) || parseDate(value) >= minVal;
                };
                attr.$observe(
                    'min',
                    function (val) {
                        minVal = parseObservedDateValue(val);
                        ctrl.$validate();
                    }
                );
            }

            if (isDefined(attr.max) || attr.ngMax) {
                ctrl.$validators.max = function (value) {
                    return !isValidDate(value) || _.isUndefined(maxVal) || parseDate(value) <= maxVal;
                };
                attr.$observe(
                    'max',
                    function (val) {
                        maxVal = parseObservedDateValue(val);
                        ctrl.$validate();
                    }
                );
            }
        };
    }

    function numberInputType(scope, element, attr, ctrl, $browser) {
        var minVal,
            maxVal;

        badInputChecker(scope, element, attr, ctrl);
        baseInputType(scope, element, attr, ctrl, $browser);

        ctrl.$$parserName = 'number';
        ctrl.$parsers.push(
            function (value) {
                if (ctrl.$isEmpty(value)) { return null; }
                if (NUMBER_REGEXP.test(value)) { return parseFloat(value); }
                return undefined;
            }
        );

        ctrl.$formatters.push(
            function (value) {
                if (!ctrl.$isEmpty(value)) {
                    if (!_.isNumber(value)) {
                        throw $ngModelMinErr('numfmt', 'Expected `{0}` to be a number', value);
                    }
                    value = value.toString();
                }
                return value;
            }
        );

        if (attr.min || attr.ngMin) {
            ctrl.$validators.min = function (value) {
                return ctrl.$isEmpty(value) || _.isUndefined(minVal) || value >= minVal;
            };

            attr.$observe(
                'min',
                function (val) {
                    if (isDefined(val) && !_.isNumber(val)) {
                        val = parseFloat(val, 10);
                    }

                    minVal = _.isNumber(val) && !isNaN(val) ? val : undefined;

                    ctrl.$validate();
                }
            );
        }

        if (attr.max || attr.ngMax) {
            ctrl.$validators.max = function (value) {
                return ctrl.$isEmpty(value) || _.isUndefined(maxVal) || value <= maxVal;
            };

            attr.$observe(
                'max',
                function (val) {
                    if (isDefined(val) && !_.isNumber(val)) {
                        val = parseFloat(val, 10);
                    }

                    maxVal = _.isNumber(val) && !isNaN(val) ? val : undefined;

                    ctrl.$validate();
                }
            );
        }
    }

    function urlInputType(scope, element, attr, ctrl, $browser) {
        // Note: no badInputChecker here by purpose as `url` is only a validation
        // in browsers, i.e. we can always read out input.value even if it is not valid!
        baseInputType(scope, element, attr, ctrl, $browser);
        stringBasedInputType(ctrl);

        ctrl.$$parserName = 'url';
        ctrl.$validators.url = function (modelValue, viewValue) {
            var value = modelValue || viewValue;
            return ctrl.$isEmpty(value) || URL_REGEXP.test(value);
        };
    }

    function emailInputType(scope, element, attr, ctrl, $browser) {
        // Note: no badInputChecker here by purpose as `url` is only a validation
        // in browsers, i.e. we can always read out input.value even if it is not valid!
        baseInputType(scope, element, attr, ctrl, $browser);
        stringBasedInputType(ctrl);

        ctrl.$$parserName = 'email';
        ctrl.$validators.email = function (modelValue, viewValue) {
            var value = modelValue || viewValue;
            return ctrl.$isEmpty(value) || EMAIL_REGEXP.test(value);
        };
    }

    function radioInputType(scope, element, attr, ctrl) {
        // make the name unique, if not defined
        if (_.isUndefined(attr.name)) {
            element.attr('name', nextUid());
        }

        var listener = function (ev) {
                if (element[0].checked) {
                    ctrl.$setViewValue(attr.value, ev && ev.type);
                }
            };

        element.on('click', listener);

        ctrl.$render = function () {
            var value = attr.value;
            element[0].checked = (value === ctrl.$viewValue);
        };

        attr.$observe('value', ctrl.$render);
    }

    function parseConstantExpr($parse, context, name, expression, fallback) {
        var parseFn;
        if (isDefined(expression)) {
            parseFn = $parse(expression);
            if (!parseFn.constant) {
                throw minErr('ngModel')(
                    'constexpr',
                    'Expected constant expression for `{0}`, but saw `{1}`.',
                    name,
                    expression
                );
            }
            return parseFn(context);
        }
        return fallback;
    }

    function checkboxInputType(scope, element, attr, ctrl, $browser, $filter, $parse) {
        var trueValue = parseConstantExpr($parse, scope, 'ngTrueValue', attr.ngTrueValue, true),
            falseValue = parseConstantExpr($parse, scope, 'ngFalseValue', attr.ngFalseValue, false),
            listener = function (ev) {
                ctrl.$setViewValue(element[0].checked, ev && ev.type);
            };

        element.on('click', listener);

        ctrl.$render = function () {
            element[0].checked = ctrl.$viewValue;
        };

        // Override the standard `$isEmpty` because the $viewValue of an empty checkbox is always set to `false`
        // This is because of the parser below, which compares the `$modelValue` with `trueValue` to convert it to a boolean.
        ctrl.$isEmpty = function (value) {
            return value === false;
        };

        ctrl.$formatters.push(function (value) {
            return equals(value, trueValue);
        });

        ctrl.$parsers.push(function (value) {
            return value ? trueValue : falseValue;
        });
    }

    inputType = {

        'text': textInputType,

        'date': createDateInputType('date', DATE_REGEXP, createDateParser(DATE_REGEXP, ['yyyy', 'MM', 'dd']), 'yyyy-MM-dd'),

        'datetime-local': createDateInputType('datetimelocal', DATETIMELOCAL_REGEXP, createDateParser(DATETIMELOCAL_REGEXP, ['yyyy', 'MM', 'dd', 'HH', 'mm', 'ss', 'sss']), 'yyyy-MM-ddTHH:mm:ss.sss'),

        'time': createDateInputType('time', TIME_REGEXP, createDateParser(TIME_REGEXP, ['HH', 'mm', 'ss', 'sss']), 'HH:mm:ss.sss'),

        'week': createDateInputType('week', WEEK_REGEXP, weekParser, 'yyyy-Www'),

        'month': createDateInputType('month', MONTH_REGEXP, createDateParser(MONTH_REGEXP, ['yyyy', 'MM']), 'yyyy-MM'),

        'number': numberInputType,

        'url': urlInputType,

        'email': emailInputType,

        'radio': radioInputType,

        'checkbox': checkboxInputType,

        'hidden': noop,
        'button': noop,
        'submit': noop,
        'reset': noop,
        'file': noop
    };

    inputDirective = ['$browser', '$filter', '$parse',
        function ($browser, $filter, $parse) {
            return {
                restrict: 'E',
                require: ['?ngModel'],
                link: {
                    pre: function (scope, element, attr, ctrls) {
                        if (ctrls[0]) {
                            (inputType[lowercase(attr.type)] || inputType.text)(scope, element, attr, ctrls[0], $browser, $filter, $parse);
                        }
                    }
                }
            };
        }
    ];

    $ngModelMinErr = minErr('ngModel');

    NgModelController = ['$scope', '$attrs', '$element', '$parse', '$animate', '$timeout', '$rootScope', '$q', '$interpolate',
        function ($scope, $attr, $element, $parse, $animate, $timeout, $rootScope, $q, $interpolate) {
            this.$viewValue = Number.NaN;
            this.$modelValue = Number.NaN;
            this.$$rawModelValue = undefined;   // stores the parsed modelValue / model set from scope regardless of validity.
            this.$validators = {};
            this.$asyncValidators = {};
            this.$parsers = [];
            this.$formatters = [];
            this.$viewChangeListeners = [];
            this.$untouched = true;
            this.$touched = false;
            this.$pristine = true;
            this.$dirty = false;
            this.$valid = true;
            this.$invalid = false;
            this.$error = {};           // keep invalid keys here
            this.$$success = {};        // keep valid keys here
            this.$pending = undefined;  // keep pending keys here
            this.$name = $interpolate($attr.name || '', false)($scope);

        var temp_nmc = 'ng - NgModelController',
            parsedNgModel = $parse($attr.ngModel),
            parsedNgModelAssign = parsedNgModel.assign,
            ngModelGet = parsedNgModel,
            ngModelSet = parsedNgModelAssign,
            pendingDebounce = null,
            ctrl = this,
            parentForm,
            currentValidationRunId = 0;

        this.$$setOptions = function (options) {
            ctrl.$options = options;

            if (options && options.getterSetter) {
                var invokeModelGetter = $parse($attr.ngModel + '()'),
                    invokeModelSetter = $parse($attr.ngModel + '($$$p)');

                ngModelGet = function ($scope) {
                    var modelValue = parsedNgModel($scope);

                    if (_.isFunction(modelValue)) {
                        modelValue = invokeModelGetter($scope);
                    }
                    return modelValue;
                };

                ngModelSet = function ($scope, model_value) {
                    if (_.isFunction(parsedNgModel($scope))) {
                        invokeModelSetter($scope, { $$$p: model_value });
                    } else {
                        parsedNgModelAssign($scope, model_value);
                    }
                };

            } else if (!parsedNgModel.assign) {
                throw $ngModelMinErr(
                    'nonassign',
                    "Expression '{0}' is non-assignable. Element: {1}",
                    $attr.ngModel,
                    startingTag($element)
                );
            }
        };

        this.$render = noop;

        this.$isEmpty = function (value) {
            return _.isUndefined(value) || value === '' || value === null || value !== value;
        };

        this.$setPristine = function () {
            ctrl.$dirty = false;
            ctrl.$pristine = true;
            $animate.removeClass($element, DIRTY_CLASS);
            $animate.addClass($element, PRISTINE_CLASS);
        };

        this.$setDirty = function () {
            ctrl.$dirty = true;
            ctrl.$pristine = false;
            $animate.removeClass($element, PRISTINE_CLASS);
            $animate.addClass($element, DIRTY_CLASS);
            parentForm.$setDirty();
        };

        this.$setUntouched = function () {
            ctrl.$touched = false;
            ctrl.$untouched = true;
            $animate.setClass($element, UNTOUCHED_CLASS, TOUCHED_CLASS);
        };

        this.$setTouched = function () {
            ctrl.$touched = true;
            ctrl.$untouched = false;
            $animate.setClass($element, TOUCHED_CLASS, UNTOUCHED_CLASS);
        };

        this.$rollbackViewValue = function () {
            $timeout.cancel(pendingDebounce);
            ctrl.$viewValue = ctrl.$$lastCommittedViewValue;
            ctrl.$render();
        };

        this.$validate = function () {
            // ignore $validate before model is initialized
            if (_.isNumber(ctrl.$modelValue) && isNaN(ctrl.$modelValue)) { return; }

            // Note: we use the $$rawModelValue as $modelValue might have been
            // set to undefined during a view -> model update that found validation
            // errors. We can't parse the view here, since that could change
            // the model although neither viewValue nor the model on the scope changed
            var viewValue = ctrl.$$lastCommittedViewValue,
                modelValue = ctrl.$$rawModelValue,
                parserName = ctrl.$$parserName || 'parse',
                parserValid = ctrl.$error[parserName] ? false : undefined,
                prevValid = ctrl.$valid,
                prevModelValue = ctrl.$modelValue,
                allowInvalid = ctrl.$options && ctrl.$options.allowInvalid;

            ctrl.$$runValidators(
                parserValid,
                modelValue,
                viewValue,
                function (allValid) {
                    // If there was no change in validity, don't update the model
                    // This prevents changing an invalid modelValue to undefined
                    if (!allowInvalid && prevValid !== allValid) {
                        // Note: Don't check ctrl.$valid here, as we could have
                        // external validators (e.g. calculated on the server),
                        // that just call $setValidity and need the model value
                        // to calculate their validity.
                        ctrl.$modelValue = allValid ? modelValue : undefined;

                        if (ctrl.$modelValue !== prevModelValue) {
                            ctrl.$$writeModelToScope();
                        }
                    }
                }
            );
        };

        this.$$runValidators = function (parseValid, modelValue, viewValue, doneCallback) {
            currentValidationRunId += 1;

            var localValidationRunId = currentValidationRunId;

            function validationDone(allValid) {
                if (localValidationRunId === currentValidationRunId) {
                    doneCallback(allValid);
                }
            }

            function setValidity(name, isValid) {
                if (localValidationRunId === currentValidationRunId) {
                    ctrl.$setValidity(name, isValid);
                }
            }

            function processParseErrors(parseValid) {
                var errorKey = ctrl.$$parserName || 'parse';

                if (parseValid === undefined) {
                    setValidity(errorKey, null);
                } else {
                    setValidity(errorKey, parseValid);

                    if (!parseValid) {
                        forEach(
                            ctrl.$validators,
                            function (v, name) {
                                setValidity(name, null);
                            }
                        );
                        forEach(
                            ctrl.$asyncValidators,
                            function (v, name) {
                                setValidity(name, null);
                            }
                        );
                        return false;
                    }
                }
                return true;
            }

            function processSyncValidators() {
                var syncValidatorsValid = true;

                forEach(
                    ctrl.$validators,
                    function (validator, name) {
                        var result = validator(modelValue, viewValue);

                        syncValidatorsValid = syncValidatorsValid && result;
                        setValidity(name, result);
                    }
                );

                if (!syncValidatorsValid) {
                    forEach(
                        ctrl.$asyncValidators,
                        function (v, name) {
                            setValidity(name, null);
                        }
                    );
                    return false;
                }
                return true;
            }

            function processAsyncValidators() {
                var validatorPromises = [],
                    allValid = true;

                forEach(
                    ctrl.$asyncValidators,
                    function (validator, name) {
                        var promise = validator(modelValue, viewValue);

                        if (!isPromiseLike(promise)) {
                            throw $ngModelMinErr(
                                "$asyncValidators",
                                "Expected asynchronous validator to return a promise but got '{0}' instead.",
                                promise
                            );
                        }

                        setValidity(name, undefined);

                        validatorPromises.push(
                            promise.then(
                                function () {
                                    setValidity(name, true);
                                },
                                function (e) {
                                    allValid = false;
                                    setValidity(name, false);
                                    msos.console.error(temp_nmc + ' - $$runValidators - processAsyncValidators -> error:', e);
                                }
                            )
                        );
                    }
                );

                if (!validatorPromises.length) {
                    validationDone(true);
                } else {
                    $q.all($q.defer('all_processAsyncValidators'), validatorPromises).then(
                        function () {
                            validationDone(allValid);
                        },
                        noop
                    );
                }
            }

            // check parser error
            if (!processParseErrors(parseValid)) {
                validationDone(false);
                return;
            }

            if (!processSyncValidators()) {
                validationDone(false);
                return;
            }

            processAsyncValidators();
        };

        this.$commitViewValue = function () {
            var viewValue = ctrl.$viewValue;

            $timeout.cancel(pendingDebounce);

            // If the view value has not changed then we should just exit, except in the case where there is
            // a native validator on the element. In this case the validation state may have changed even though
            // the viewValue has stayed empty.
            if (ctrl.$$lastCommittedViewValue === viewValue && (viewValue !== '' || !ctrl.$$hasNativeValidators)) {
                return;
            }

            ctrl.$$lastCommittedViewValue = viewValue;

            // change to dirty
            if (ctrl.$pristine) {
                this.$setDirty();
            }

            this.$$parseAndValidate();
        };

        this.$$parseAndValidate = function () {
            var viewValue = ctrl.$$lastCommittedViewValue,
                modelValue = viewValue,
                parserValid = _.isUndefined(modelValue) ? undefined : true,
                i = 0,
                prevModelValue,
                allowInvalid;

            function writeToModelIfNeeded() {
                if (ctrl.$modelValue !== prevModelValue) {
                    ctrl.$$writeModelToScope();
                }
            }

            if (parserValid) {
                for (i = 0; i < ctrl.$parsers.length; i += 1) {
                    modelValue = ctrl.$parsers[i](modelValue);

                    if (_.isUndefined(modelValue)) {
                        parserValid = false;
                        break;
                    }
                }
            }

            if (_.isNumber(ctrl.$modelValue) && isNaN(ctrl.$modelValue)) {
                // ctrl.$modelValue has not been touched yet...
                ctrl.$modelValue = ngModelGet($scope);
            }

            prevModelValue = ctrl.$modelValue;
            allowInvalid = ctrl.$options && ctrl.$options.allowInvalid;
            ctrl.$$rawModelValue = modelValue;

            if (allowInvalid) {
                ctrl.$modelValue = modelValue;
                writeToModelIfNeeded();
            }

            // Pass the $$lastCommittedViewValue here, because the cached viewValue might be out of date.
            // This can happen if e.g. $setViewValue is called from inside a parser
            ctrl.$$runValidators(
                parserValid,
                modelValue,
                ctrl.$$lastCommittedViewValue,
                function (allValid) {
                    if (!allowInvalid) {
                        ctrl.$modelValue = allValid ? modelValue : undefined;
                        writeToModelIfNeeded();
                    }
                }
            );
        };

        this.$$writeModelToScope = function () {
            ngModelSet($scope, ctrl.$modelValue);

            forEach(
                ctrl.$viewChangeListeners,
                function (listener) {
                    try {
                        listener();
                    } catch (e) {
                        msos.console.error(temp_nmc + ' - $$writeModelToScope -> failed:', e);
                    }
                }
            );
        };

        this.$setViewValue = function (value, trigger) {
            ctrl.$viewValue = value;
            if (!ctrl.$options || ctrl.$options.updateOnDefault) {
                ctrl.$$debounceViewValueCommit(trigger);
            }
        };

        this.$$debounceViewValueCommit = function (trigger) {
            var temp_dv = ' - $$debounceViewValueCommit -> ',
                deb_db = '',
                debounceDelay = 0,
                options = ctrl.$options,
                debounce;

            if (msos.config.verbose === 'debounce') {
                msos.console.debug(temp_nmc + temp_dv + 'start.');
            }

            if (options && isDefined(options.debounce)) {
                debounce = options.debounce;
                if (_.isNumber(debounce)) {
                    debounceDelay = debounce;
                } else if (_.isNumber(debounce[trigger])) {
                    debounceDelay = debounce[trigger];
                } else if (_.isNumber(debounce['default'])) {
                    debounceDelay = debounce['default'];
                }
            }

            $timeout.cancel(pendingDebounce);

            if (debounceDelay) {
                pendingDebounce = $timeout(
                    function () {
                        ctrl.$commitViewValue();
                    },
                    debounceDelay
                );
                deb_db = 'pending commit view';
            } else if ($rootScope.$$phase) {
                ctrl.$commitViewValue();
                deb_db = 'commit view';
            } else {
                $scope.$apply(
                    function () {
                        ctrl.$commitViewValue();
                    }
                );
                deb_db = '$apply commit view (func)';
            }

            if (msos.config.verbose === 'debounce') {
                msos.console.debug(temp_nmc + temp_dv + 'done, delay: ' + debounceDelay + ', for ' + deb_db);
            }
        };

        parentForm = $element.inheritedData('$formController') || nullFormCtrl;

        addSetValidityMethod(
            {
                ctrl: this,
                $element: $element,
                set: function (object, property) {
                    object[property] = true;
                },
                unset: function (object, property) {
                    delete object[property];
                },
                parentForm: parentForm,
                $animate: $animate
            }
        );

        // model -> value
        $scope.$watch(
            function ngModelWatch() {
                var modelValue = ngModelGet($scope),
                    formatters,
                    idx,
                    viewValue;

                // if scope model value and ngModel value are out of sync
                if (modelValue !== ctrl.$modelValue) {

                    ctrl.$modelValue = ctrl.$$rawModelValue = modelValue;

                    formatters = ctrl.$formatters;
                    idx = formatters.length;
                    viewValue = modelValue;

                    while (idx) {
                        idx -= 1;
                        viewValue = formatters[idx](viewValue);
                    }

                    if (ctrl.$viewValue !== viewValue) {
                        ctrl.$viewValue = ctrl.$$lastCommittedViewValue = viewValue;
                        ctrl.$render();

                        ctrl.$$runValidators(undefined, modelValue, viewValue, noop);
                    }
                }

                return modelValue;
            }
        );
    }];

    ngModelDirective = ['$rootScope', function ($rootScope) {
        return {
            restrict: 'A',
            require: ['ngModel', '^?form', '^?ngModelOptions'],
            controller: NgModelController,

            // Prelink needs to run before any input directive
            // so that we can set the NgModelOptions in NgModelController
            // before anyone else uses it.
            priority: 1,
            compile: function ngModelCompile(element) {
                var temp_cp = 'ng - ngModelDirective - compile';
                // Setup initial state of the control
                element.addClass(PRISTINE_CLASS).addClass(UNTOUCHED_CLASS).addClass(VALID_CLASS);

                return {
                    pre: function ngModelPreLink(scope, element, attr, ctrls) {
                        var modelCtrl = ctrls[0],
                            formCtrl = ctrls[1] || nullFormCtrl;

                        modelCtrl.$$setOptions(ctrls[2] && ctrls[2].$options);

                        // notify others, especially parent forms
                        formCtrl.$addControl(modelCtrl);

                        attr.$observe(
                            'name',
                            function (newValue) {
                                if (modelCtrl.$name !== newValue) {
                                    formCtrl.$$renameControl(modelCtrl, newValue);
                                }
                            }
                        );

                        scope.$on(
                            '$destroy',
                            function () {
                                formCtrl.$removeControl(modelCtrl);
                            }
                        );
                    },
                    post: function ngModelPostLink(scope, element, attr, ctrls) {
                        var temp_pt = temp_cp + ' - post - ngModelPostLink',
                            modelCtrl = ctrls[0];

                        if (modelCtrl.$options && modelCtrl.$options.updateOn) {
                            element.on(
                                modelCtrl.$options.updateOn,
                                function (ev) {
                                    modelCtrl.$$debounceViewValueCommit(ev && ev.type);
                                }
                            );
                        }

                        element.on(
                            'blur',
                            function () {
                                var temp_ob = ' - on:blur -> ';

                                msos.console.debug(temp_pt + temp_ob + 'start.');

                                if (modelCtrl.$touched) {
                                    msos.console.info(temp_pt + temp_ob + 'done, for $touched!');
                                    return;
                                }

                                if ($rootScope.$$phase) {
                                    scope.$evalAsync(
                                        modelCtrl.$setTouched,
                                        { directive_name: 'ngModelDirective' }
                                    );
                                } else {
                                    scope.$apply(modelCtrl.$setTouched);
                                }

                                msos.console.debug(temp_pt + temp_ob + 'done!');
                            }
                        );
                    }
                };
            }
        };
    }];

    ngChangeDirective = valueFn({
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ctrl) {
            ctrl.$viewChangeListeners.push(function () {
                scope.$eval(attr.ngChange);
            });
        }
    });

    requiredDirective = function () {
            return {
                restrict: 'A',
                require: '?ngModel',
                link: function (scope, elm, attr, ctrl) {
                    if (!ctrl) { return; }
                    attr.required = true; // force truthy in case we are on non input element

                    ctrl.$validators.required = function (modelValue, viewValue) {
                        return !attr.required || !ctrl.$isEmpty(viewValue);
                    };

                    attr.$observe(
                        'required',
                        function () {
                            ctrl.$validate();
                        }
                    );
                }
            };
        };

    patternDirective = function () {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, elm, attr, ctrl) {
                if (!ctrl) { return; }

                var regexp,
                    patternExp = attr.ngPattern || attr.pattern;

                attr.$observe('pattern', function (regex) {
                    if (_.isString(regex) && regex.length > 0) {
                        regex = new RegExp('^' + regex + '$');
                    }

                    if (regex && !regex.test) {
                        throw minErr('ngPattern')(
                            'noregexp',
                            'Expected {0} to be a RegExp but was {1}. Element: {2}',
                            patternExp,
                            regex,
                            startingTag(elm)
                        );
                    }

                    regexp = regex || undefined;
                    ctrl.$validate();
                });

                ctrl.$validators.pattern = function (value) {
                    return ctrl.$isEmpty(value) || _.isUndefined(regexp) || regexp.test(value);
                };
            }
        };
    };

    maxlengthDirective = function () {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, elm, attr, ctrl) {
                if (!ctrl) { return; }

                var maxlength = -1;

                attr.$observe('maxlength', function (value) {
                    var intVal = parseInt(value, 10);

                    maxlength = isNaN(intVal) ? -1 : intVal;
                    ctrl.$validate();
                });

                ctrl.$validators.maxlength = function(modelValue, viewValue) {
                    return (maxlength < 0) || ctrl.$isEmpty(viewValue) || (viewValue.length <= maxlength);
                };
            }
        };
    };

    minlengthDirective = function () {
            return {
                restrict: 'A',
                require: '?ngModel',
                link: function (scope, elm, attr, ctrl) {
                    if (!ctrl) { return; }

                    var minlength = 0;
                    attr.$observe('minlength', function (value) {
                        minlength = parseInt(value, 10) || 0;
                        ctrl.$validate();
                    });
                    ctrl.$validators.minlength = function (modelValue, viewValue) {
                        return ctrl.$isEmpty(viewValue) || viewValue.length >= minlength;   // Back to what was in v1.3.0-rc1
                    };
                }
            };
        };

    ngListDirective = function () {
            return {
                restrict: 'A',
                priority: 100,
                require: 'ngModel',
                link: function (scope, element, attr, ctrl) {
                    // We want to control whitespace trimming so we use this convoluted approach
                    // to access the ngList attribute, which doesn't pre-trim the attribute
                    var ngList = element.attr(attr.$attr.ngList) || ', ',
                        trimValues = attr.ngTrim !== 'false',
                        separator = trimValues ? trim(ngList) : ngList,
                        parse = function (viewValue) {
                            // If the viewValue is invalid (say required but empty) it will be `undefined`
                            if (_.isUndefined(viewValue)) { return undefined; }

                            var list = [];

                            if (viewValue) {
                                forEach(viewValue.split(separator), function (value) {
                                    if (value) { list.push(trimValues ? trim(value) : value); }
                                });
                            }

                            return list;
                        };

                    ctrl.$parsers.push(parse);
                    ctrl.$formatters.push(function (value) {
                        if (_.isArray(value)) {
                            return value.join(ngList);
                        }

                        return undefined;
                    });

                    // Override the standard $isEmpty because an empty array means the input is empty.
                    ctrl.$isEmpty = function (value) {
                        return !value || !value.length;
                    };
                }
            };
        };

    ngValueDirective = function () {
        return {
            restrict: 'A',
            priority: 100,
            compile: function (tpl, tplAttr) {
                if (CONSTANT_VALUE_REGEXP.test(tplAttr.ngValue)) {
                    return function ngValueConstantLink(scope, elm, attr) {
                        attr.$set('value', scope.$eval(attr.ngValue));
                    };
                }

                return function ngValueLink(scope, elm, attr) {
                    scope.$watch(attr.ngValue, function valueWatchAction(value) {
                        attr.$set('value', value);
                    });
                };
            }
        };
    };

    ngModelOptionsDirective = function () {
        return {
            restrict: 'A',
            controller: ['$scope', '$attrs', function ($scope, $attrs) {
                var that = this;
                this.$options = $scope.$eval($attrs.ngModelOptions);
                // Allow adding/overriding bound events
                if (this.$options.updateOn !== undefined) {
                    this.$options.updateOnDefault = false;
                    // extract "default" pseudo-event from list of events that can trigger a model update
                    this.$options.updateOn = trim(this.$options.updateOn.replace(DEFAULT_REGEXP, function () {
                        that.$options.updateOnDefault = true;
                        return ' ';
                    }));
                } else {
                    this.$options.updateOnDefault = true;
                }
            }]
        };
    };

    ngBindDirective = ['$compile', function($compile) {
        return {
            restrict: 'AC',
            compile: function ngBindCompile(templateElement) {
                $compile.$$addBindingClass(templateElement);

                return function ngBindLink(scope, element, attr) {
                    $compile.$$addBindingInfo(element, attr.ngBind);
                    element = element[0];

                    scope.$watch(
                        attr.ngBind,
                        function ngBindWatchAction(value) {
                            element.textContent = value === undefined ? '' : value;
                        }
                    );
                };
            }
        };
    }];

    ngBindTemplateDirective = ['$interpolate', '$compile', function($interpolate, $compile) {
        return {
            compile: function ngBindTemplateCompile(templateElement) {

                $compile.$$addBindingClass(templateElement);

                return function ngBindTemplateLink(scope, element, attr) {
                    var interpolateFn = $interpolate(element.attr(attr.$attr.ngBindTemplate));

                    $compile.$$addBindingInfo(element, interpolateFn.expressions);
                    element = element[0];

                    attr.$observe(
                        'ngBindTemplate',
                        function (value) {
                            element.textContent = value === undefined ? '' : value;
                        }
                    );
                };
            }
        };
    }];

    ngBindHtmlDirective = ['$sce', '$parse', '$compile', function ($sce, $parse, $compile) {
        return {
            restrict: 'A',
            compile: function ngBindHtmlCompile(tElement, tAttrs) {
                var ngBindHtmlGetter = $parse(tAttrs.ngBindHtml),
                    ngBindHtmlWatch = $parse(
                        tAttrs.ngBindHtml,
                        function getStringValue(value) {
                            return (value || '').toString();
                        }
                    );

                $compile.$$addBindingClass(tElement);

                return function ngBindHtmlLink(scope, element, attr) {
                    $compile.$$addBindingInfo(element, attr.ngBindHtml);

                    scope.$watch(
                        ngBindHtmlWatch,
                        function ngBindHtmlWatchAction() {
                            // we re-evaluate the expr because we want a TrustedValueHolderType
                            // for $sce, not a string
                            element.html($sce.getTrustedHtml(ngBindHtmlGetter(scope)) || '');
                        }
                    );
                };
            }
        };
    }];

    function classDirective(name, selector) {
        name = 'ngClass' + name;
        return ['$animate', function ($animate) {

            function arrayDifference(tokens1, tokens2) {
                var values = [],
                    i = 0,
                    token,
                    j = 0;

                outer: for (i = 0; i < tokens1.length; i += 1) {
                    token = tokens1[i];
                    for (j = 0; j < tokens2.length; j += 1) {
                        if (token === tokens2[j]) { continue outer; }
                    }
                    values.push(token);
                }
                return values;
            }

            function arrayClasses(classVal) {
                if (_.isArray(classVal)) {
                    return classVal;
                }

                if (_.isString(classVal)) {
                    return classVal.split(' ');
                }

                if (_.isObject(classVal)) {
                    var classes = [];
                    forEach(classVal, function (v, k) {
                        if (v) {
                            classes = classes.concat(k.split(' '));
                        }
                    });
                    return classes;
                }

                return classVal;
            }

            return {
                restrict: 'AC',
                link: function (scope, element, attr) {
                    var oldVal;

                    function digestClassCounts(classes, count) {
                        var classCounts = element.data('$classCounts') || {},
                            classesToUpdate = [];

                        forEach(classes, function (className) {
                            if (count > 0 || classCounts[className]) {
                                classCounts[className] = (classCounts[className] || 0) + count;
                                if (classCounts[className] === +(count > 0)) {
                                    classesToUpdate.push(className);
                                }
                            }
                        });
                        element.data('$classCounts', classCounts);
                        return classesToUpdate.join(' ');
                    }

                    function addClasses(classes) {
                        var newClasses = digestClassCounts(classes, 1);
                        attr.$addClass(newClasses);
                    }

                    function removeClasses(classes) {
                        var newClasses = digestClassCounts(classes, -1);
                        attr.$removeClass(newClasses);
                    }

                    function updateClasses(oldClasses, newClasses) {
                        var toAdd = arrayDifference(newClasses, oldClasses),
                            toRemove = arrayDifference(oldClasses, newClasses);

                        toAdd = digestClassCounts(toAdd, 1);
                        toRemove = digestClassCounts(toRemove, -1);

                        if (toAdd && toAdd.length) {
                            $animate.addClass(element, toAdd);
                        }

                        if (toRemove && toRemove.length) {
                            $animate.removeClass(element, toRemove);
                        }
                    }

                    function ngClassWatchAction(newVal) {
                        var newClasses = [],
                            oldClasses = [];

                        if (selector === true || scope.$index % 2 === selector) {
                            newClasses = arrayClasses(newVal || []);
                            if (!oldVal) {
                                addClasses(newClasses);
                            } else if (!equals(newVal, oldVal)) {
                                oldClasses = arrayClasses(oldVal);
                                updateClasses(oldClasses, newClasses);
                            }
                        }
                        oldVal = shallowCopy(newVal);
                    }

                    scope.$watch(attr[name], ngClassWatchAction, true);

                    attr.$observe('class', function (value) {
                        ngClassWatchAction(scope.$eval(attr[name]));
                    });

                    if (name !== 'ngClass') {
                        scope.$watch('$index', function ($index, old$index) {
                            var mod = $index & 1,
                                classes;
                            if (mod !== (old$index & 1)) {
                                classes = arrayClasses(scope.$eval(attr[name]));
                                if (mod === selector) {
                                    addClasses(classes);
                                } else {
                                    removeClasses(classes);
                                }
                            }
                        });
                    }
                }
            };
        }];
    }

    ngClassDirective = classDirective('', true);

    ngClassOddDirective = classDirective('Odd', 0);

    ngClassEvenDirective = classDirective('Even', 1);

    ngCloakDirective = ngDirective({
        compile: function (element, attr) {
            attr.$set('ngCloak', undefined);
            element.removeClass('ng-cloak');
        }
    });

    ngControllerDirective = [function () {
        return {
            restrict: 'A',
            scope: true,
            controller: '@',
            priority: 500
        };
    }];

    forEach(['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'mousemove', 'mouseenter', 'mouseleave', 'keydown', 'keyup', 'keypress', 'submit', 'focus', 'blur', 'copy', 'cut', 'paste'],
        function(eventName) {
            var vc = msos.config.verbose,
                directiveName = directiveNormalize('ng-' + eventName);

            ngEventDirectives[directiveName] = ['$parse', '$rootScope', function ($parse, $rootScope) {
                return {
                    restrict: 'A',
                    compile: function ($element, attr) {
                        var temp_ev = directiveName + ' - compile - ngEventHandler -> ',
                            fn = $parse(attr[directiveName], null, true);

                        return function ngEventHandler(scope, element) {
                            element.on(
                                eventName,
                                function (event) {
                                    var callback = function () {
                                            fn(scope, { $event:event });
                                        };

                                    if (vc === 'events') {
                                        msos.console.info(temp_ev + 'start.');
                                    }

                                    if (forceAsyncEvents[eventName] && $rootScope.$$phase) {
                                        scope.$evalAsync(
                                            callback,
                                            { directive_name: directiveName }
                                        );
                                    } else {
                                        scope.$apply(callback);
                                    }

                                    if (vc === 'events') {
                                        msos.console.info(temp_ev + 'done!');
                                    }
                                }
                            );
                        };
                    }
                };
            }];
        }
    );

    if (msos.config.verbose) {
        msos.console.debug('ng - ngEventDirectives -> created:', _.keys(ngEventDirectives));
    }

    ngIfDirective = ['$animate', function ($animate) {
        return {
            multiElement: true,
            transclude: 'element',
            priority: 600,
            terminal: true,
            restrict: 'A',
            $$tlb: true,
            link: function ($scope, $element, $attr, ctrl, $transclude) {
                var block, childScope, previousElements;
                $scope.$watch($attr.ngIf, function ngIfWatchAction(value) {

                    if (value) {
                        if (!childScope) {
                            $transclude(function (clone, newScope) {
                                childScope = newScope;
                                // was: clone[clone.length++] -> ambiguous use of ++
                                clone[clone.length] = document.createComment(' end ngIf: ' + $attr.ngIf + ' ');
                                // Note: We only need the first/last node of the cloned nodes.
                                // However, we need to keep the reference to the jqlite wrapper as it might be changed later
                                // by a directive with templateUrl when its template arrives.
                                block = {
                                    clone: clone
                                };
                                $animate.enter(clone, $element.parent(), $element);
                            });
                        }
                    } else {
                        if (previousElements) {
                            previousElements.remove();
                            previousElements = null;
                        }
                        if (childScope) {
                            childScope.$destroy();
                            childScope = null;
                        }
                        if (block) {
                            previousElements = getBlockNodes(block.clone);
                            $animate.leave(previousElements).then(function () {
                                previousElements = null;
                            });
                            block = null;
                        }
                    }
                });
            }
        };
    }];

    ngIncludeDirective = ['$templateRequest', '$anchorScroll', '$animate', '$sce',
                  function($templateRequest,   $anchorScroll,   $animate,   $sce) {
        return {
            restrict: 'ECA',
            priority: 400,
            terminal: true,
            transclude: 'element',
            controller: noop,
            compile: function (element, attr) {
                var srcExp = attr.ngInclude || attr.src,
                    onloadExp = attr.onload || '',
                    autoScrollExp = attr.autoscroll;

                return function (scope, $element, $attr, ctrl, $transclude) {
                    var changeCounter = 0,
                        currentScope,
                        previousElement,
                        currentElement,
                        cleanupLastIncludeContent = function () {
                            if (previousElement) {
                                previousElement.remove();
                                previousElement = null;
                            }
                            if (currentScope) {
                                currentScope.$destroy();
                                currentScope = null;
                            }

                            if (currentElement) {
                                $animate.leave(currentElement).then(function () {
                                    previousElement = null;
                                });
                                previousElement = currentElement;
                                currentElement = null;
                            }
                        };

                    scope.$watch($sce.parseAsResourceUrl(srcExp), function ngIncludeWatchAction(src) {

                        changeCounter += 1;

                        var afterAnimation = function () {
                                if (isDefined(autoScrollExp) && (!autoScrollExp || scope.$eval(autoScrollExp))) {
                                    $anchorScroll();
                                }
                            },
                            thisChangeId = changeCounter;

                        if (src) {
                            $templateRequest(src).then(
                                function (response) {
                                    if (thisChangeId !== changeCounter) { return; }

                                    var newScope = scope.$new(),
                                        clone;

                                    ctrl.template = response;

                                    clone = $transclude(
                                        newScope,
                                        function (clone) {
                                            cleanupLastIncludeContent();
                                            $animate.enter(clone, null, $element).then(afterAnimation);
                                        }
                                    );

                                    currentScope = newScope;
                                    currentElement = clone;

                                    currentScope.$emit('$includeContentLoaded', src);
                                    scope.$eval(onloadExp);
                                },
                                function () {
                                    if (thisChangeId === changeCounter) {
                                        cleanupLastIncludeContent();
                                        scope.$emit('$includeContentError', src);
                                    }
                                }
                            );

                            scope.$emit('$includeContentRequested', src);
                        } else {
                            cleanupLastIncludeContent();
                            ctrl.template = null;
                        }
                    });
                };
            }
        };
    }];

    ngIncludeFillContentDirective = ['$compile', function ($compile) {

        return {
            restrict: 'ECA',
            priority: -400,
            require: 'ngInclude',
            link: function (scope, $element, $attr, ctrl) {

                if (/SVG/.test($element[0].toString())) {
                    msos.console.error('ng - ngIncludeFillContentDirective -> SVG support needs ng.util.includeSVG directive.');
                } else {
                    $element.html(ctrl.template);
                    $compile($element.contents())(scope);
                }
            }
        };
    }];

    ngInitDirective = ngDirective({
        priority: 450,
        compile: function () {
            return {
                pre: function (scope, element, attrs) {
                    scope.$eval(attrs.ngInit);
                }
            };
        }
    });

    ngNonBindableDirective = ngDirective({
        terminal: true,
        priority: 1000
    });

    ngPluralizeDirective = ['$locale', '$interpolate', function ($locale, $interpolate) {
        var BRACE = /\{\}/g,
            IS_WHEN = /^when(Minus)?(.+)$/;

        return {
            restrict: 'EA',
            link: function (scope, element, attr) {
                var numberExp = attr.count,
                    whenExp = attr.$attr.when && element.attr(attr.$attr.when),     // we have {{}} in attrs
                    offset = attr.offset || 0,
                    whens = scope.$eval(whenExp) || {},
                    whensExpFns = {},
                    startSymbol = $interpolate.startSymbol(),
                    endSymbol = $interpolate.endSymbol(),
                    braceReplacement = startSymbol + numberExp + '-' + offset + endSymbol,
                    watchRemover = noop,
                    lastCount;

                function updateElementText(newText) {
                    element.text(newText || '');
                }

                forEach(
                    attr,
                    function (expression, attributeName) {
                        var tmpMatch = IS_WHEN.exec(attributeName),
                            whenKey;

                        if (tmpMatch) {
                            whenKey = (tmpMatch[1] ? '-' : '') + lowercase(tmpMatch[2]);
                            whens[whenKey] = element.attr(attr.$attr[attributeName]);
                        }
                    }
                );

                forEach(
                    whens,
                    function (expression, key) {
                        whensExpFns[key] = $interpolate(expression.replace(BRACE, braceReplacement));
                    }
                );

                scope.$watch(
                    numberExp,
                    function ngPluralizeWatchAction(newVal) {
                        var count = parseFloat(newVal),
                            countIsNaN = isNaN(count);

                        if (!countIsNaN && !whens.hasOwnProperty(count)) {
                            // If an explicit number rule such as 1, 2, 3... is defined, just use it.
                            // Otherwise, check it against pluralization rules in $locale service.
                            count = $locale.pluralCat(count - offset);
                        }

                        // If both `count` and `lastCount` are NaN, we don't need to re-register a watch.
                        // In JS `NaN !== NaN`, so we have to exlicitly check.
                        if ((count !== lastCount) && !(countIsNaN && isNaN(lastCount))) {
                            watchRemover();
                            watchRemover = scope.$watch(whensExpFns[count], updateElementText);
                            lastCount = count;
                        }
                    }
                );
            }
        };
    }];

    ngRepeatDirective = ['$parse', '$animate', function ($parse, $animate) {
        var NG_REMOVED = '$$NG_REMOVED',
            ngRepeatMinErr = minErr('ngRepeat'),
            updateScope = function (scope, index, valueIdentifier, value, keyIdentifier, key, arrayLength) {
                scope[valueIdentifier] = value;
                if (keyIdentifier) { scope[keyIdentifier] = key; }
                scope.$index = index;
                scope.$first = (index === 0);
                scope.$last = (index === (arrayLength - 1));
                scope.$middle = !(scope.$first || scope.$last);
                // jshint bitwise: false
                scope.$even = (index & 1);
                scope.$odd = (scope.$even !== 0);
                // jshint bitwise: true
            },
            getBlockStart = function (block) {
                return block.clone[0];
            },
            getBlockEnd = function (block) {
                return block.clone[block.clone.length - 1];
            };

        return {
            restrict: 'A',
            multiElement: true,
            transclude: 'element',
            priority: 1000,
            terminal: true,
            $$tlb: true,
            compile: function ngRepeatCompile($element, $attr) {
                
                var expression = $attr.ngRepeat,
                    ngRepeatEndComment = document.createComment(' end ngRepeat: ' + expression + ' '),
                    match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/),
                    lhs,
                    rhs,
                    aliasAs,
                    trackByExp,
                    valueIdentifier,
                    keyIdentifier,
                    trackByExpGetter,
                    trackByIdExpFn,
                    trackByIdArrayFn,
                    trackByIdObjFn,
                    hashFnLocals = {};

                if (!match) {
                    throw ngRepeatMinErr('iexp', "Expected expression in form of '_item_ in _collection_[ track by _id_]' but got '{0}'.", expression);
                }

                lhs = match[1];
                rhs = match[2];
                aliasAs = match[3];
                trackByExp = match[4];

                match = lhs.match(/^(?:(\s*[\$\w]+)|\(\s*([\$\w]+)\s*,\s*([\$\w]+)\s*\))$/);

                if (!match) {
                    throw ngRepeatMinErr('iidexp', "'_item_' in '_item_ in _collection_' should be an identifier or '(_key_, _value_)' expression, but got '{0}'.", lhs);
                }

                valueIdentifier = match[3] || match[1];
                keyIdentifier = match[2];

                if (aliasAs && (!/^[$a-zA-Z_][$a-zA-Z0-9_]*$/.test(aliasAs) || /^(null|undefined|this|\$index|\$first|\$middle|\$last|\$even|\$odd|\$parent|\$root|\$id)$/.test(aliasAs))) {
                    throw ngRepeatMinErr(
                        'badident',
                        "alias '{0}' is invalid --- must be a valid JS identifier which is not a reserved name.",
                        aliasAs
                    );
                }

                hashFnLocals = {
                    $id: hashKey
                };

                if (trackByExp) {
                    trackByExpGetter = $parse(trackByExp);
                } else {
                    trackByIdArrayFn = function (key, value) {
                        return hashKey(value);
                    };
                    trackByIdObjFn = function (key) {
                        return key;
                    };
                }

                return function ngRepeatLink($scope, $element, $attr, ctrl, $transclude) {

                    if (trackByExpGetter) {
                        trackByIdExpFn = function (key, value, index) {
                            // assign key, value, and $index to the locals so that they can be used in hash functions
                            if (keyIdentifier) { hashFnLocals[keyIdentifier] = key; }
                            hashFnLocals[valueIdentifier] = value;
                            hashFnLocals.$index = index;
                            return trackByExpGetter($scope, hashFnLocals);
                        };
                    }

                    // Store a list of elements from previous run. This is a hash where key is the item from the
                    // iterator, and the value is objects with following properties.
                    //   - scope: bound scope
                    //   - element: previous element.
                    //   - index: position
                    //
                    // We are using no-proto object so that we don't need to guard against inherited props via
                    // hasOwnProperty.
                    var lastBlockMap = createMap();

                    //watch props
                    $scope.$watchCollection(rhs, function ngRepeatAction(collection) {
                        var index, length, previousNode = $element[0],
                            // node that cloned nodes should be inserted after
                            // initialized to the comment node anchor
                            nextNode,
                            // Same as lastBlockMap but it has the current state. It will become the
                            // lastBlockMap on the next iteration.
                            nextBlockMap = createMap(),
                            collectionLength, key, value, // key/value of iteration
                            trackById, trackByIdFn, collectionKeys, block, // last object information {scope, element, id}
                            nextBlockOrder,
                            elementsToRemove,
                            itemKey,
                            blockKey;

                        if (aliasAs) {
                            $scope[aliasAs] = collection;
                        }

                        if (isArrayLike(collection)) {
                            collectionKeys = collection;
                            trackByIdFn = trackByIdExpFn || trackByIdArrayFn;
                        } else {
                            trackByIdFn = trackByIdExpFn || trackByIdObjFn;
                            // if object, extract keys, sort them and use to determine order of iteration over obj props
                            collectionKeys = [];
                            for (itemKey in collection) {
                                if (collection.hasOwnProperty(itemKey) && itemKey.charAt(0) !== '$') {
                                    collectionKeys.push(itemKey);
                                }
                            }
                            collectionKeys.sort();
                        }

                        collectionLength = collectionKeys.length;
                        nextBlockOrder = new Array(collectionLength);

                        // locate existing items
                        for (index = 0; index < collectionLength; index += 1) {
                            key = (collection === collectionKeys) ? index : collectionKeys[index];
                            value = collection[key];
                            trackById = trackByIdFn(key, value, index);
                            if (lastBlockMap[trackById]) {
                                // found previously seen block
                                block = lastBlockMap[trackById];
                                delete lastBlockMap[trackById];
                                nextBlockMap[trackById] = block;
                                nextBlockOrder[index] = block;
                            } else {
                                if (nextBlockMap[trackById]) {
                                    // if collision detected. restore lastBlockMap and throw an error
                                    /* jshint ignore:start */
                                    forEach(nextBlockOrder, function (block) {
                                        if (block && block.scope) { lastBlockMap[block.id] = block; }
                                    });
                                    /* jshint ignore:end */
                                    throw ngRepeatMinErr(
                                        'dupes',
                                        "Duplicates in a repeater are not allowed. Use 'track by' expression to specify unique keys. Repeater: {0}, Duplicate key: {1}, Duplicate value: {2}",
                                        expression,
                                        trackById,
                                        value
                                    );
                                }
                                // new never before seen block
                                nextBlockOrder[index] = {
                                    id: trackById,
                                    scope: undefined,
                                    clone: undefined
                                };
                                nextBlockMap[trackById] = true;
                            }
                        }

                        // remove leftover items
                        for (blockKey in lastBlockMap) {

                            block = lastBlockMap[blockKey];
                            elementsToRemove = getBlockNodes(block.clone);
                            $animate.leave(elementsToRemove);

                            if (elementsToRemove[0].parentNode) {
                                // if the element was not removed yet because of pending animation, mark it as deleted
                                // so that we can ignore it later
                                for (index = 0, length = elementsToRemove.length; index < length; index += 1) {
                                    elementsToRemove[index][NG_REMOVED] = true;
                                }
                            }
                            block.scope.$destroy();
                        }

                        // we are not using forEach for perf reasons (trying to avoid #call)
                        for (index = 0; index < collectionLength; index += 1) {
                            key = (collection === collectionKeys) ? index : collectionKeys[index];
                            value = collection[key];
                            block = nextBlockOrder[index];

                            if (block.scope) {
                                // if we have already seen this object, then we need to reuse the
                                // associated scope/element
                                nextNode = previousNode;

                                // skip nodes that are already pending removal via leave animation
                                do {
                                    nextNode = nextNode.nextSibling;
                                } while (nextNode && nextNode[NG_REMOVED]);

                                if (getBlockStart(block) !== nextNode) {
                                    // existing item which got moved
                                    $animate.move(getBlockNodes(block.clone), null, jqLite(previousNode));
                                }

                                previousNode = getBlockEnd(block);
                                updateScope(block.scope, index, valueIdentifier, value, keyIdentifier, key, collectionLength);
                            } else {
                                // new item which we don't know about
                                /* jshint ignore:start */
                                $transclude(
                                    function ngRepeatTransclude(clone, scope) {
                                        block.scope = scope;
                                        // http://jsperf.com/clone-vs-createcomment
                                        var endNode = ngRepeatEndComment.cloneNode(false);

                                        clone[clone.length] = endNode;  // was: clone[clone.length++] = endNode;
                                        clone.length += 1;

                                        $animate.enter(clone, null, jqLite(previousNode));
                                        previousNode = endNode;
                                        // Note: We only need the first/last node of the cloned nodes.
                                        // However, we need to keep the reference to the jqlite wrapper as it might be changed later
                                        // by a directive with templateUrl when its template arrives.
                                        block.clone = clone;
                                        nextBlockMap[block.id] = block;
                                        updateScope(block.scope, index, valueIdentifier, value, keyIdentifier, key, collectionLength);
                                    }
                                );
                                /* jshint ignore:end */
                            }
                        }
                        lastBlockMap = nextBlockMap;
                    });
                };
            }
        };
    }];

    ngShowDirective = ['$animate', function ($animate) {
        return {
            restrict: 'A',
            multiElement: true,
            link: function (scope, element, attr) {
                scope.$watch(
                    attr.ngShow,
                    function ngShowWatchAction(value) {
                        msos.console.debug('ng - ngShowDirective - ngShowWatchAction -> for: ' + value);
                        $animate[value ? 'removeClass' : 'addClass'](
                            element,
                            NG_HIDE_CLASS,
                            { tempClasses: NG_HIDE_IN_PROGRESS_CLASS }
                        );
                    }
                );
            }
        };
    }];

    ngHideDirective = ['$animate', function ($animate) {
        return {
            restrict: 'A',
            multiElement: true,
            link: function (scope, element, attr) {
                scope.$watch(
                    attr.ngHide,
                    function ngHideWatchAction(value) {
                        msos.console.debug('ng - ngHideDirective - ngHideWatchAction -> for: ' + value);
                        $animate[value ? 'addClass' : 'removeClass'](
                            element,
                            NG_HIDE_CLASS,
                            { tempClasses: NG_HIDE_IN_PROGRESS_CLASS }
                        );
                    }
                );
            }
        };
    }];

    ngStyleDirective = ngDirective(function (scope, element, attr) {
        scope.$watchCollection(
            attr.ngStyle,
            function ngStyleWatchAction(newStyles, oldStyles) {
                if (oldStyles && (newStyles !== oldStyles)) {
                    forEach(
                        oldStyles,
                        function(val, style) { element.css(style, '');});
                }
                if (newStyles) { element.css(newStyles); }
            }
        );
    });

    ngSwitchDirective = ['$animate', function ($animate) {
        return {
            restrict: 'EA',
            require: 'ngSwitch',

            // asks for $scope to fool the BC controller module
            controller: ['$scope', function ngSwitchController() {
                this.cases = {};
            }],
            link: function (scope, element, attr, ngSwitchController) {
                var watchExpr = attr.ngSwitch || attr.on,
                    selectedTranscludes = [],
                    selectedElements = [],
                    previousLeaveAnimations = [],
                    selectedScopes = [],
                    spliceFactory = function (array, index) {
                        return function () { array.splice(index, 1); };
                    };

                scope.$watch(
                    watchExpr,
                    function ngSwitchWatchAction(value) {
                        var i,
                            ii,
                            selected,
                            promise;

                        for (i = 0, ii = previousLeaveAnimations.length; i < ii; i += 1) {
                            $animate.cancel(previousLeaveAnimations[i]);
                        }

                        previousLeaveAnimations.length = 0;

                        for (i = 0, ii = selectedScopes.length; i < ii; i += 1) {
                            selected = getBlockNodes(selectedElements[i].clone);
                            selectedScopes[i].$destroy();
                            promise = previousLeaveAnimations[i] = $animate.leave(selected);
                            promise.then(spliceFactory(previousLeaveAnimations, i));
                        }

                        selectedElements.length = 0;
                        selectedScopes.length = 0;

                    selectedTranscludes = ngSwitchController.cases['!' + value];

                    if (selectedTranscludes || ngSwitchController.cases['?']) {
                        forEach(selectedTranscludes, function (selectedTransclude) {
                            selectedTransclude.transclude(function (caseElement, selectedScope) {
                                selectedScopes.push(selectedScope);
                                var anchor = selectedTransclude.element,
                                    block = {};

                                caseElement[caseElement.length] = document.createComment(' end ngSwitchWhen: ');

                                block = {
                                    clone: caseElement
                                };

                                selectedElements.push(block);
                                $animate.enter(caseElement, anchor.parent(), anchor);
                            });
                        });
                    }
                });
            }
        };
    }];

    ngSwitchWhenDirective = ngDirective({
        transclude: 'element',
        priority: 1200,
        require: '^ngSwitch',
        multiElement: true,
        link: function (scope, element, attrs, ctrl, $transclude) {
            ctrl.cases['!' + attrs.ngSwitchWhen] = (ctrl.cases['!' + attrs.ngSwitchWhen] || []);
            ctrl.cases['!' + attrs.ngSwitchWhen].push({
                transclude: $transclude,
                element: element
            });
        }
    });

    ngSwitchDefaultDirective = ngDirective({
        transclude: 'element',
        priority: 1200,
        require: '^ngSwitch',
        multiElement: true,
        link: function (scope, element, attr, ctrl, $transclude) {
            ctrl.cases['?'] = (ctrl.cases['?'] || []);
            ctrl.cases['?'].push({
                transclude: $transclude,
                element: element
            });
        }
    });

    ngTranscludeDirective = ngDirective({
        restrict: 'EAC',
        link: function ($scope, $element, $attrs, controller, $transclude) {
            if (!$transclude) {
                throw minErr('ngTransclude')('orphan', 'Illegal use of ngTransclude directive in the template! ' + 'No parent directive that requires a transclusion found. ' + 'Element: {0}', startingTag($element));
            }

            $transclude(function (clone) {
                $element.empty();
                $element.append(clone);
            });
        }
    });

    scriptDirective = ['$templateCache', function ($templateCache) {
        return {
            restrict: 'E',
            terminal: true,
            compile: function (element, attr) {
                if (attr.type === 'text/ng-template') {
                    var templateUrl = attr.id,
                        // IE is not consistent, in scripts we have to read .text but in other nodes we have to read .textContent
                        text = element[0].text;

                    $templateCache.put(templateUrl, text);
                }
            }
        };
    }];

    ngOptionsMinErr = minErr('ngOptions');

    ngOptionsDirective = valueFn({
        restrict: 'A',
        terminal: true
    });

    selectDirective = ['$compile', '$parse', function ($compile,   $parse) {
        var temp_sd = 'ng - selectDirective',
            NG_OPTIONS_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/,
            nullModelCtrl = { $setViewValue: noop };

        return {
            restrict: 'E',
            require: ['select', '?ngModel'],
            controller: ['$element', '$scope', '$attrs', function ($element, $scope, $attrs) {
                var self = this,
                    optionsMap = {},
                    ngModelCtrl = nullModelCtrl,
                    unknownOption;

                self.databound = $attrs.ngModel;

                self.init = function (ngModelCtrl_, unknownOption_) {
                    ngModelCtrl = ngModelCtrl_;
                    unknownOption = unknownOption_;
                };

                self.addOption = function (value, element) {
                    assertNotHasOwnProperty(value, '"option value"');
                    optionsMap[value] = true;

                    if (ngModelCtrl.$viewValue === value) {
                        $element.val(value);
                        if (unknownOption.parent()) {
                            unknownOption.remove();
                        }
                    }

                    if (element && element[0].hasAttribute('selected')) {
                        element[0].selected = true;
                    }
                };

                self.removeOption = function (value) {
                    if (this.hasOption(value)) {
                        delete optionsMap[value];
                        if (ngModelCtrl.$viewValue === value) {
                            this.renderUnknownOption(value);
                        }
                    }
                };

                self.renderUnknownOption = function (val) {
                    var unknownVal = '? ' + hashKey(val) + ' ?';

                    unknownOption.val(unknownVal);
                    $element.prepend(unknownOption);
                    $element.val(unknownVal);
                    unknownOption.prop('selected', true);       // needed for IE
                };

                self.hasOption = function (value) {
                    return optionsMap.hasOwnProperty(value);
                };

                $scope.$on('$destroy', function () {
                    // disable unknown option so that we don't do work when the whole select is being destroyed
                    self.renderUnknownOption = noop;
                });
            }],

            link: function (scope, element, attr, ctrls) {
                // if ngModel is not defined, we don't need to do anything
                if (!ctrls[1]) { return; }

                var temp_ln = temp_sd + ' - link',
                    selectCtrl = ctrls[0],
                    ngModelCtrl = ctrls[1],
                    multiple = attr.multiple,
                    optionsExp = attr.ngOptions,
                    nullOption = false,     // if false, user will not be able to select it (used by ngOptions)
                    emptyOption,
                    renderScheduled = false,
                    optionTemplate = jqLite(document.createElement('option')),
                    optGroupTemplate =jqLite(document.createElement('optgroup')),
                    unknownOption = optionTemplate.clone(),
                    i = 0,
                    children;

                function setupAsSingle(scope, selectElement, ngModelCtrl, selectCtrl) {

                    ngModelCtrl.$render = function () {
                        var viewValue = ngModelCtrl.$viewValue;

                        if (selectCtrl.hasOption(viewValue)) {
                            if (unknownOption.parent()) { unknownOption.remove(); }
                            selectElement.val(viewValue);
                            if (viewValue === '') { emptyOption.prop('selected', true); } // to make IE9 happy
                        } else {
                            if (_.isUndefined(viewValue) && emptyOption) {
                                selectElement.val('');
                            } else {
                                selectCtrl.renderUnknownOption(viewValue);
                            }
                        }
                    };

                    selectElement.on(
                        'change',
                        function () {
                            var temp_so = ' - setupAsSingle - selectElement.on:change -> ';

                            msos.console.info(temp_ln + temp_so + 'start.');

                            scope.$apply(
                                function () {
                                    if (unknownOption.parent()) {
                                        unknownOption.remove();
                                    }
                                    ngModelCtrl.$setViewValue(selectElement.val());
                                }
                            );

                            msos.console.info(temp_ln + temp_so + 'done!');
                        }
                    );
                }

                function setupAsMultiple(scope, selectElement, ctrl) {
                    var lastView;

                    ctrl.$render = function () {
                        var items = new HashMap(ctrl.$viewValue);

                        forEach(
                            selectElement.find('option'),
                            function (option) {
                                option.selected = isDefined(items.get(option.value));
                            }
                        );
                    };

                    // we have to do it on each watch since ngModel watches reference, but
                    // we need to work on an array, so we need to see if anything was inserted/removed
                    scope.$watch(
                        function selectMultipleWatch() {
                            if (!equals(lastView, ctrl.$viewValue)) {
                                lastView = shallowCopy(ctrl.$viewValue);
                                ctrl.$render();
                            }
                        }
                    );

                    selectElement.on(
                        'change',
                        function () {
                            var temp_soc = ' - setupAsMultiple - selectElement.on:change -> ';

                            msos.console.info(temp_ln + temp_soc + 'start.');

                            scope.$apply(
                                function () {
                                    var array = [];

                                    forEach(
                                        selectElement.find('option'),
                                        function (option) {
                                            if (option.selected) {
                                                array.push(option.value);
                                            }
                                        }
                                    );

                                    ctrl.$setViewValue(array);
                                }
                            );

                            msos.console.info(temp_ln + temp_soc + 'done!');
                        }
                    );
                }

                function setupAsOptions(scope, selectElement, ctrl) {
                    var temp_sa = ' - setupAsOptions',
                        match = optionsExp.match(NG_OPTIONS_REGEXP),
                        displayFn,
                        valueName,
                        selectAs,
                        selectAsFn,
                        keyName,
                        groupByFn,
                        valFn,
                        valuesFn,
                        track,
                        trackFn,
                        trackKeysCache = {},
                        optionGroupsCache = [],
                        locals = {};

                    if (!match) {
                        throw ngOptionsMinErr(
                            'iexp',
                            "Expected expression in form of '_select_ (as _label_)? for (_key_,)?_value_ in _collection_' but got '{0}'. Element: {1}",
                            optionsExp,
                            startingTag(selectElement)
                        );
                    }

                    displayFn = $parse(match[2] || match[1]);
                    valueName = match[4] || match[6];
                    selectAs = / as /.test(match[0]) && match[1];
                    selectAsFn = selectAs ? $parse(selectAs) : null;
                    keyName = match[5];
                    groupByFn = $parse(match[3] || '');
                    valFn = $parse(match[2] ? match[1] : valueName);
                    valuesFn = $parse(match[7]);
                    track = match[8];
                    trackFn = track ? $parse(match[8]) : null;
                    optionGroupsCache = [
                        [
                            {
                                element: selectElement,
                                label: ''
                            }
                        ]
                    ];

                    function callExpression(exprFn, key, value) {
                        locals[valueName] = value;
                        if (keyName) { locals[keyName] = key; }
                        return exprFn(scope, locals);
                    }

                    function getViewValue(key, value) {
                        var viewValueFn;

                        if (key === '?') { return undefined; }

                        if (key === '') { return null; }

                        viewValueFn = selectAsFn || valFn;
                        return callExpression(viewValueFn, key, value);
                    }

                    function getLabels() {
                        var values = valuesFn(scope),
                            toDisplay,
                            k = 0,
                            prop;

                        if (values && _.isArray(values)) {

                            toDisplay = new Array(values.length);

                            for (k = 0; k < values.length; k += 1) {
                                toDisplay[k] = callExpression(displayFn, k, values[k]);
                            }

                            return toDisplay;

                        }

                        if (values) {

                            toDisplay = {};

                            for (prop in values) {
                                if (values.hasOwnProperty(prop)) {
                                    toDisplay[prop] = callExpression(displayFn, prop, values[prop]);
                                }
                            }
                        }

                        return toDisplay;
                    }

                    function createIsSelectedFn(viewValue) {
                        var selectedSet,
                            trackIndex = 0;

                        if (multiple) {
                            if (trackFn && _.isArray(viewValue)) {

                                selectedSet = new HashMap([]);

                                for (trackIndex = 0; trackIndex < viewValue.length; trackIndex += 1) {
                                    // tracking by key
                                    selectedSet.put(callExpression(trackFn, null, viewValue[trackIndex]), true);
                                }

                            } else {
                                selectedSet = new HashMap(viewValue);
                            }

                        } else if (trackFn) {
                            viewValue = callExpression(trackFn, null, viewValue);
                        }

                        return function isSelected(key, value) {
                            var compareValueFn;

                            if (trackFn) {
                                compareValueFn = trackFn;
                            } else if (selectAsFn) {
                                compareValueFn = selectAsFn;
                            } else {
                                compareValueFn = valFn;
                            }

                            if (multiple) {
                                return isDefined(selectedSet.remove(callExpression(compareValueFn, key, value)));
                            }

                            return viewValue === callExpression(compareValueFn, key, value);
                        };
                    }

                    function updateLabelMap(labelMap, label, added) {
                        labelMap[label] = labelMap[label] || 0;
                        labelMap[label] += (added ? 1 : -1);
                    }

                    function render() {
                        renderScheduled = false;

                        // Temporary location for the option groups before we render them
                        var optionGroups = {
                                '': []
                            },
                            optionGroupNames = [''],
                            optionGroupName,
                            optionGroup,
                            option,
                            existingParent,
                            existingOptions,
                            existingOption,
                            viewValue = ctrl.$viewValue,
                            values = valuesFn(scope) || [],
                            keys = keyName ? sortedKeys(values) : values,
                            key,
                            value,
                            groupIndex,
                            index,
                            labelMap = {},
                            selected,
                            isSelected = createIsSelectedFn(viewValue),
                            anySelected = false,
                            lastElement,
                            element_r,
                            label,
                            optionId;

                        trackKeysCache = {};

                        function selectCtrlbyCount(count, label) {
                            if (count > 0) {
                                selectCtrl.addOption(label);
                            } else if (count < 0) {
                                selectCtrl.removeOption(label);
                            }
                        }

                        // We now build up the list of options we need (we merge later)
                        for (index = 0; index < keys.length; index += 1) {
                            key = index;

                            if (keyName) {
                                key = keys[index];
                                if (key.charAt(0) === '$') { continue; }
                            }
    
                            value = values[key];

                            optionGroupName = callExpression(groupByFn, key, value) || '';

                            optionGroup = optionGroups[optionGroupName];

                            if (!optionGroup) {
                                optionGroup = optionGroups[optionGroupName] = [];
                                optionGroupNames.push(optionGroupName);
                            }

                            selected = isSelected(key, value);
                            anySelected = anySelected || selected;

                            label = callExpression(displayFn, key, value); // what will be seen by the user

                            // doing displayFn(scope, locals) || '' overwrites zero values
                            label = isDefined(label) ? label : '';
                            optionId = trackFn ? trackFn(scope, locals) : (keyName ? keys[index] : index);

                            if (trackFn) {
                                trackKeysCache[optionId] = key;
                            }

                            optionGroup.push({
                                id: optionId,
                                label: label,
                                selected: selected
                            });
                        }

                        if (!multiple) {
                            if (nullOption || viewValue === null) {
                                // insert null option if we have a placeholder, or the model is null
                                optionGroups[''].unshift({
                                    id: '',
                                    label: '',
                                    selected: !anySelected
                                });
                            } else if (!anySelected) {
                                // option could not be found, we have to insert the undefined item
                                optionGroups[''].unshift({
                                    id: '?',
                                    label: '',
                                    selected: true
                                });
                            }
                        }

                        // Now we need to update the list of DOM nodes to match the optionGroups we computed above
                        for (groupIndex = 0; groupIndex < optionGroupNames.length; groupIndex += 1) {
                            // current option group name or '' if no group
                            optionGroupName = optionGroupNames[groupIndex];

                            // list of options for that group. (first item has the parent)
                            optionGroup = optionGroups[optionGroupName];

                            if (optionGroupsCache.length <= groupIndex) {
                                // we need to grow the optionGroups
                                existingParent = {
                                    element: optGroupTemplate.clone().attr('label', optionGroupName),
                                    label: optionGroup.label
                                };

                                existingOptions = [existingParent];
                                optionGroupsCache.push(existingOptions);
                                selectElement.append(existingParent.element);

                            } else {
                                existingOptions = optionGroupsCache[groupIndex];
                                existingParent = existingOptions[0];  // either SELECT (no group) or OPTGROUP element

                                // update the OPTGROUP label if not the same.
                                if (existingParent.label !== optionGroupName) {
                                    existingParent.label = optionGroupName;
                                    existingParent.element.attr('label', existingParent.label);
                                }
                            }

                            lastElement = null;  // start at the beginning

                            for (index = 0; index < optionGroup.length; index += 1) {
                                option = optionGroup[index];

                                existingOption = existingOptions[index+1];

                                if (existingOption) {
                                    // reuse elements
                                    lastElement = existingOption.element;

                                    if (existingOption.label !== option.label) {
                                        updateLabelMap(labelMap, existingOption.label, false);
                                        updateLabelMap(labelMap, option.label, true);
                                        existingOption.label = option.label;
                                        lastElement.text(existingOption.label);
                                        lastElement.prop('label', existingOption.label);
                                    }

                                    if (existingOption.id !== option.id) {
                                        existingOption.id = option.id;
                                        lastElement.val(existingOption.id);
                                    }

                                    // lastElement.prop('selected') provided by jQuery has side-effects
                                    if (lastElement[0].selected !== option.selected) {
                                        existingOption.selected = option.selected;
                                        lastElement.prop('selected', existingOption.selected);

                                        if (msie) {
                                            lastElement.prop('selected', existingOption.selected);
                                        }
                                    }
                                } else {
                                    // grow elements

                                    // if it's a null option
                                    if (option.id === '' && nullOption) {
                                        // put back the pre-compiled element
                                        element_r = nullOption;
                                    } else {
                                        element_r = optionTemplate.clone();
                                        element_r
                                            .val(option.id)
                                            .prop('selected', option.selected)
                                            .attr('selected', option.selected)
                                            .prop('label', option.label)
                                            .text(option.label);
                                    }

                                    existingOption = {
                                        element: element_r,
                                        label: option.label,
                                        id: option.id,
                                        selected: option.selected
                                    };

                                    existingOptions.push(existingOption);

                                    updateLabelMap(labelMap, option.label, true);

                                    if (lastElement) {
                                        lastElement.after(element_r);
                                    } else {
                                        existingParent.element.append(element_r);
                                    }
                                    lastElement = element_r;
                                }
                            }
                            // remove any excessive OPTIONs in a group
                            // increment since the existingOptions[0] is parent
                            // element, not OPTION
                            index += 1;

                            while (existingOptions.length > index) {
                                option = existingOptions.pop();
                                updateLabelMap(labelMap, option.label, false);
                                option.element.remove();
                            }
                        }

                        // remove any excessive OPTGROUPs from select
                        while (optionGroupsCache.length > groupIndex) {
                            // remove all the labels in the option group
                            optionGroup = optionGroupsCache.pop();

                            for (index = 1; index < optionGroup.length; index += 1) {
                                updateLabelMap(labelMap, optionGroup[index].label, false);
                            }

                            optionGroup[0].element.remove();
                        }

                        forEach(
                            labelMap,
                            selectCtrlbyCount
                        );
                    }

                    function selectionChanged() {

                        msos.console.debug(temp_ln + temp_sa + ' - selectionChanged -> start.');

                        scope.$apply(
                            function () {
                                var collection = valuesFn(scope) || [],
                                    viewValue = [],
                                    selectedKey;

                                if (multiple) {
                                    forEach(
                                        selectElement.val(),
                                        function (selectedKey) {
                                            selectedKey = trackFn ? trackKeysCache[selectedKey] : selectedKey;
                                            viewValue.push(getViewValue(selectedKey, collection[selectedKey]));
                                        }
                                    );
                                } else {
                                    selectedKey = trackFn ? trackKeysCache[selectElement.val()] : selectElement.val();
                                    viewValue = getViewValue(selectedKey, collection[selectedKey]);
                                }

                                ctrl.$setViewValue(viewValue);
                                render();
                            }
                        );
                        msos.console.debug(temp_ln + temp_sa + ' - selectionChanged -> done!');
                    }

                    function scheduleRendering() {
                        if (!renderScheduled) {
                            scope.$$postDigest(render);
                            renderScheduled = true;
                        }
                    }

                    if (nullOption) {
                        // compile the element since there might be bindings in it
                        $compile(nullOption)(scope);

                        // remove the class, which is added automatically because we recompile the element and it
                        // becomes the compilation root
                        nullOption.removeClass('ng-scope');

                        // we need to remove it before calling selectElement.empty() because otherwise IE will
                        // remove the label from the element. wtf?
                        nullOption.remove();
                    }

                    // clear contents, we'll add what's needed based on the model
                    selectElement.empty();

                    selectElement.on('change', selectionChanged);

                    ctrl.$render = render;

                    scope.$watchCollection(valuesFn, scheduleRendering);
                    scope.$watchCollection(getLabels, scheduleRendering);

                    if (multiple) {
                        scope.$watchCollection(
                            function () {
                                return ctrl.$modelValue;
                            },
                            scheduleRendering
                        );
                    }
                }

                // find "null" option
                children = element.children();

                for (i = 0; i < children.length; i += 1) {
                    if (children[i].value === '') {
                        emptyOption = nullOption = children.eq(i);
                        break;
                    }
                }

                selectCtrl.init(ngModelCtrl, unknownOption);

                // required validator
                if (multiple) {
                    ngModelCtrl.$isEmpty = function (value) {
                        return !value || value.length === 0;
                    };
                }

                if (optionsExp)     { setupAsOptions(scope, element, ngModelCtrl); }
                else if (multiple)  { setupAsMultiple(scope, element, ngModelCtrl); }
                else                { setupAsSingle(scope, element, ngModelCtrl, selectCtrl); }
            }
        };
    }];

    optionDirective = ['$interpolate', function ($interpolate) {
        var nullSelectCtrl = {
            addOption: noop,
            removeOption: noop
        };

        return {
            restrict: 'E',
            priority: 100,
            compile: function (element, attr) {
                var interpolateFn;

                if (_.isUndefined(attr.value)) {
                    interpolateFn = $interpolate(element.text(), true);

                    if (!interpolateFn) {
                        attr.$set('value', element.text());
                    }
                }

                return function (scope, element, attr) {
                    var selectCtrlName = '$selectController',
                        parent = element.parent(),
                        selectCtrl = parent.data(selectCtrlName) || parent.parent().data(selectCtrlName); // in case we are in optgroup

                    if (!selectCtrl || !selectCtrl.databound) {
                        selectCtrl = nullSelectCtrl;
                    }

                    if (interpolateFn) {
                        scope.$watch(
                            interpolateFn,
                            function interpolateWatchAction(newVal, oldVal) {
                                attr.$set('value', newVal);

                                if (oldVal !== newVal) {
                                    selectCtrl.removeOption(oldVal);
                                }

                                selectCtrl.addOption(newVal, element);
                            }
                        );
                    } else {
                        selectCtrl.addOption(attr.value, element);
                    }

                    element.on(
                        '$destroy',
                        function() {
                            selectCtrl.removeOption(attr.value);
                        }
                    );
                };
            }
        };
    }];

    styleDirective = valueFn({
        restrict: 'E',
        terminal: false
    });

    function publishExternalAPI(angular) {

        var temp_pe = 'ng - publishExternalAPI';

        msos.console.debug(temp_pe + ' -> start.');

        extend(angular, {
            'bootstrap': bootstrap,
            'copy': copy,
            'extend': extend,
            'equals': equals,
            'element': jqLite,
            'forEach': forEach,
            'injector': createInjector,
            'noop': noop,
            'bind': _.bind,
            'toJson': toJson,
            'fromJson': fromJson,
            'identity': identity,
            'isUndefined': _.isUndefined,
            'isDefined': isDefined,
            'isString': _.isString,
            'isFunction': _.isFunction,
            'isObject': isObject,           // Watch this, not the same as _.isObject
            'isNumber': _.isNumber,
            'isElement': isElement,
            'isArray': _.isArray,
            'version': version,
            'isDate': _.isDate,
            'lowercase': lowercase,
            'uppercase': uppercase,
            'callbacks': {
                counter: 0
            },
            '$$minErr': minErr,
            'getTestability': getTestability,
            'reloadWithDebugInfo': reloadWithDebugInfo
        });

        angularModule = setupModuleLoader(window);

        // Load internal ngLocale (was try -> then internal, but we can load with ng.util.postloader instead)
        angularModule('ngLocale', []).provider('$locale', $LocaleProvider);

        angularModule('ng', ['ngLocale'], ['$provide', function ngModule($provide) {

            msos.console.debug(temp_pe + ' - ngModule -> start.');

            // $$sanitizeUriProvider needs to be before $compileProvider as it is used by it.
            $provide.provider({
                $$sanitizeUri: $$SanitizeUriProvider
            });

            $provide.provider('$compile', $CompileProvider).
            directive({
                a: htmlAnchorDirective,
                input: inputDirective,
                textarea: inputDirective,
                form: formDirective,
                script: scriptDirective,
                select: selectDirective,
                style: styleDirective,
                option: optionDirective,
                ngBind: ngBindDirective,
                ngBindHtml: ngBindHtmlDirective,
                ngBindTemplate: ngBindTemplateDirective,
                ngClass: ngClassDirective,
                ngClassEven: ngClassEvenDirective,
                ngClassOdd: ngClassOddDirective,
                ngCloak: ngCloakDirective,
                ngController: ngControllerDirective,
                ngForm: ngFormDirective,
                ngHide: ngHideDirective,
                ngIf: ngIfDirective,
                ngInclude: ngIncludeDirective,
                ngInit: ngInitDirective,
                ngNonBindable: ngNonBindableDirective,
                ngPluralize: ngPluralizeDirective,
                ngRepeat: ngRepeatDirective,
                ngShow: ngShowDirective,
                ngStyle: ngStyleDirective,
                ngSwitch: ngSwitchDirective,
                ngSwitchWhen: ngSwitchWhenDirective,
                ngSwitchDefault: ngSwitchDefaultDirective,
                ngOptions: ngOptionsDirective,
                ngTransclude: ngTranscludeDirective,
                ngModel: ngModelDirective,
                ngList: ngListDirective,
                ngChange: ngChangeDirective,
                pattern: patternDirective,
                ngPattern: patternDirective,
                required: requiredDirective,
                ngRequired: requiredDirective,
                minlength: minlengthDirective,
                ngMinlength: minlengthDirective,
                maxlength: maxlengthDirective,
                ngMaxlength: maxlengthDirective,
                ngValue: ngValueDirective,
                ngModelOptions: ngModelOptionsDirective
            }).
            directive({
                ngInclude: ngIncludeFillContentDirective
            }).
            directive(ngAttributeAliasDirectives).
            directive(ngEventDirectives);
            $provide.provider({
                $anchorScroll: $AnchorScrollProvider,
                $animate: $AnimateProvider,
                $browser: $BrowserProvider,
                $cacheFactory: $CacheFactoryProvider,
                $controller: $ControllerProvider,
                $document: $DocumentProvider,
                $exceptionHandler: $ExceptionHandlerProvider,
                $filter: $FilterProvider,
                $interpolate: $InterpolateProvider,
                $interval: $IntervalProvider,
                $http: $HttpProvider,
                $httpBackend: $HttpBackendProvider,
                $location: $LocationProvider,
                $log: $LogProvider,
                $parse: $ParseProvider,
                $rootScope: $RootScopeProvider,
                $q: $QProvider,
                $$q: $$QProvider,
                $sce: $SceProvider,
                $sceDelegate: $SceDelegateProvider,
                $templateCache: $TemplateCacheProvider,
                $templateRequest: $TemplateRequestProvider,
                $$testability: $$TestabilityProvider,
                $timeout: $TimeoutProvider,
                $window: $WindowProvider,
                $$rAF: $$RAFProvider,
                $$asyncCallback: $$AsyncCallbackProvider
            });

            msos.console.debug(temp_pe + ' - ngModule -> done!');
        }]);

        msos.console.debug(temp_pe + ' -> done!');
    }

    // Run this puppy...
    bindJQuery();

    publishExternalAPI(angular);

}(window, document));


msos.console.info('ng/v1313_msos -> done!');
msos.console.timeEnd('ng');