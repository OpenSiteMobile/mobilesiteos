/**
 * @license AngularJS v1.3.0-beta.11
 * (c) 2010-2015 Google, Inc. http://angularjs.org
 * License: MIT
 *
 * Originally derived from  v1.3.0-beta.11,
 *       with updates from  v1.3.0-beta.18, v1.3.0-beta.19, v1.3.0-rc.1, v1.3.1, v1.3.2, v1.3.3,
 *                          v1.3.4, v1.3.5, v1.3.7, v1.3.8, v1.3.9, v1.3.10, v1.3.13, v1.3.14,
 *                          v1.3.15, v1.3.16, v1.4.1, v1.4.2, v1.4.5, v1.4.6, v1.4.7, v1.4.8, v1.5.0
 *       ...plus improvements for MobileSiteOS ;)
 */

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false
*/

msos.console.info('ng/v150_msos -> start.');
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
            full: '1.5.0',
            major: 1,
            minor: 5,
            dot: 0,
            codeName: 'ennoblement_facilitation_msos'
        },
        verbose = msos.config.verbose,
        msos_debug = msos.console.debug,
        NODE_TYPE_ELEMENT = 1,
        NODE_TYPE_TEXT = 3,
        NODE_TYPE_COMMENT = 8,
        NODE_TYPE_DOCUMENT = 9,
        NODE_TYPE_DOCUMENT_FRAGMENT = 11,
        SPACE = /\s+/,
        NOT_EMPTY = /\S+/,
        ALL_COLONS = /:/g,
        TYPED_ARRAY_REGEXP = /^\[object (?:Uint8|Uint8Clamped|Uint16|Uint32|Int8|Int16|Int32|Float32|Float64)Array\]$/,
        REGEX_STRING_REGEXP = /^\/(.+)\/([a-z]*)$/,
        SNAKE_CASE_REGEXP = /[A-Z]/g,
        SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g,
        MOZ_HACK_REGEXP = /^moz([A-Z])/,
        HTML_REGEXP = /<|&#?\w+;/,
        TAG_NAME_REGEXP = /<([\w:-]+)/,
        XHTML_TAG_REGEXP = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,
        ARROW_ARG = /^([^\(]+?)=>/,
        FN_ARGS = /^[^\(]*\(\s*([^\)]*)\)/m,
        FN_ARG_SPLIT = /,/,
        FN_ARG = /^\s*(_?)(\S+?)\1\s*$/,
        STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
        PREFIX_REGEXP = /^((?:x|data)[\:\-_])/i,
        PATH_MATCH = /^([^\?#]*)(\?([^#]*))?(#(.*))?$/,
        DATE_FORMATS_SPLIT = /((?:[^yMdHhmsaZEwG']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z|G+|w+))(.*)/,
        NUMBER_STRING = /^-?\d+$/,
        ISO_DATE_REGEXP = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+\-][0-2]\d:[0-5]\d|Z)/,
        R_ISO8601_STR = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+\-])(\d\d):?(\d\d))?)?$/,
        URL_REGEXP = /^[a-z][a-z\d.+-]*:\/*(?:[^:@]+(?::[^@]+)?@)?(?:[^\s:/?#]+|\[[a-f\d:]+\])(?::\d+)?(?:\/[^?#]*)?(?:\?[^#]*)?(?:#.*)?$/i,
        EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?\^_`{|}~.\-]+@[a-z0-9]([a-z0-9\-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9\-]*[a-z0-9])?)*$/i,
        NUMBER_REGEXP = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))([eE][+\-]?\d+)?\s*$/,
        DATE_REGEXP = /^(\d{4})-(\d{2})-(\d{2})$/,
        DATETIMELOCAL_REGEXP = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/,
        WEEK_REGEXP = /^(\d{4})-W(\d\d)$/,
        MONTH_REGEXP = /^(\d{4})-(\d\d)$/,
        TIME_REGEXP = /^(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/,
        DEFAULT_REGEXP = /(\s+|^)default(\s+|$)/,
        CONSTANT_VALUE_REGEXP = /^(true|false|\d+)$/,
        CNTRL_REG = /^(\S+)(\s+as\s+([\w$]+))?$/,
        NG_OPTIONS_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?(?:\s+disable\s+when\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/,
        DATE_FORMATS = {},
        MAX_DIGITS = 22,
        DECIMAL_SEP = '.',
        ZERO_CHAR = '0',
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
            '[': /\]$/,
            '{': /\}$/
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
        EMPTY_CLASS = 'ng-empty',
        NOT_EMPTY_CLASS = 'ng-not-empty',
        SUBMITTED_CLASS = 'ng-submitted',
        NG_HIDE_CLASS = 'ng-hide',
        NG_HIDE_IN_PROGRESS_CLASS = 'ng-hide-animate',
        NG_ANIMATE_CLASSNAME = 'ng-animate',
        slice = [].slice,
        splice = [].splice,
        disallowed = ': referencing in Angular expressions is disallowed! Expression: {0}',
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
        getPrototypeOf = Object.getPrototypeOf,
        urlParsingNode = document.createElement("a"),
        originUrl,
        base_href = jQuery('base').attr('href') || '',
        baseHref = base_href ? base_href.replace(/^(https?\:)?\/\/[^\/]*/, '') : '',
        msie = document.documentMode,
        android = parseInt((/android (\d+)/.exec(lowercase((window.navigator || {}).userAgent)) || [])[1], 10),
        jqLite,
        ngMinErr = null,
        ngModelMinErr = null,
        ngTranscludeMinErr = null,
        $injectorMinErr = null,
        $animateMinErr = null,
        $compileMinErr = null,
        $interpolateMinErr = null,
        $locationMinErr = null,
        $parseMinErr = null,
        $sceMinErr = null,
        $ngOptionsMinErr = null,
        $controllerMinErr = null,
        $AnimateProvider = [],
        $$AnimateAsyncRunFactoryProvider = null,
        $$AnimateRunnerFactoryProvider = null,
        $$HashMapProvider = [],
        $CoreAnimateCssProvider = null,
        $$CoreAnimateJsProvider = null,
        $$CoreAnimateQueueProvider = null,
        trim = function (value) {
            return _.isString(value) ? jQuery.trim(value) : value;
        },
        escapeForRegexp = function (s) {
            return _.isString(s) ? s.replace(/([\-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').replace(/\x08/g, '\\x08') : String(s);
        },
        angularModule,
        nodeName_ = function (element) {
            return lowercase(element.nodeName || (element[0] && element[0].nodeName));
        },
        uid = 0,
        bindJQueryFired = false,
        bindbootstrapFired = false,
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
        OPERATORS = {},
        Lexer = null,
        AST = null,
        locationPrototype,
        NgModelController,
        noopNgModelController,
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
        SelectController,
        selectDirective,
        optionDirective,
        styleDirective;

    window.angular = angular;

    if ('i' !== 'I'.toLowerCase()) {
        lowercase = manualLowercase;
        uppercase = manualUppercase;
    }

    // Not the same as _.isObject
    //  _.isObject = function (obj) {
    //                  var type = typeof obj;
    //                  return type === 'function' || type === 'object' && !!obj;
    //  };
    function isObject(value) {
        return value !== null && typeof value === 'object';
    }

    function isBlankObject(value) {
        return value !== null && typeof value === 'object' && !getPrototypeOf(value);
    }

    function isDefined(value) {
        return value !== undefined;
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

    function isArrayBuffer(obj) {
        return ngto_string.call(obj) === '[object ArrayBuffer]';
    }

    function isTypedArray(value) {
        return value && _.isNumber(value.length) && TYPED_ARRAY_REGEXP.test(ngto_string.call(value));
    }

    function isElement(node) {
        return !!(node && (node.nodeName || (node.prop && node.attr && node.find)));
    }

    function toJsonReplacer(key, value) {
        var val = value;

        if (typeof key === 'string' && key.charAt(0) === '$' && key.charAt(1) === '$') {
            val = undefined;
        } else if (jQuery.isWindow(value)) {
            val = '$WINDOW';
        } else if (value && document === value) {
            val = '$DOCUMENT';
        } else if (isScope(value)) {
            val = '$SCOPE';
        }

        return val;
    }

    function escape_string(str) {
        // Same code as 'dojo.string.escapeString' from dojo.string.extras, Dojo v0.4.2
        return ("\"" + str.replace(/(["\\])/g, "\\$1") + "\"").replace(/[\f]/g, "\\f").replace(/[\b]/g, "\\b").replace(/[\n]/g, "\\n").replace(/[\t]/g, "\\t").replace(/[\r]/g, "\\r");
    }

    function toJson(obj, pretty) {
        if (_.isUndefined(obj))     { return undefined; }
        if (!_.isNumber(pretty))    { pretty = pretty ? 2 : null; }

        return JSON.stringify(obj, toJsonReplacer, pretty);
    }

    function fromJson(json) {
        return _.isString(json) ? JSON.parse(json) : json;
    }

    function timezoneToOffset(timezone, fallback) {
        // IE/Edge do not "understand" colon (`:`) in timezone
        timezone = timezone.replace(ALL_COLONS, '');

        var requestedTimezoneOffset = Date.parse('Jan 01, 1970 00:00:00 ' + timezone) / 60000;

        return isNaN(requestedTimezoneOffset) ? fallback : requestedTimezoneOffset;
    }

    function addDateMinutes(date, minutes) {
        date = new Date(date.getTime());
        date.setMinutes(date.getMinutes() + minutes);
        return date;
    }

    function convertTimezoneToLocal(date, timezone, reverse) {
        reverse = reverse ? -1 : 1;

        var dateTimezoneOffset = date.getTimezoneOffset(),
            timezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);

        return addDateMinutes(date, reverse * (timezoneOffset - dateTimezoneOffset));
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
                    if (seen.indexOf(val) >= 0) { return '...'; }
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
            var SKIP_INDEXES = 2,
                templateArgs = Array.prototype.slice.call(arguments) || [],
                code = templateArgs[0] || 'missing code',
                message = '[' + (module ? module + ':' : '') + code + '] ',
                template = templateArgs[1]  || 'missing template',
                paramPrefix,
                i;

            message += template.replace(/\{\d+\}/g, function (match) {
                var index = +match.slice(1, -1),
                    shiftedIndex = index + SKIP_INDEXES;

                    if (shiftedIndex < templateArgs.length) {
                        return toDebugString(templateArgs[shiftedIndex]);
                    }

                    return match;
                }
            );

            message += '\nhttp://errors.angularjs.org/1.5.0/' +
                (module ? module + '/' : '') + code;

            for (i = SKIP_INDEXES, paramPrefix = '?'; i < templateArgs.length; i += 1, paramPrefix = '&') {
                message += paramPrefix + 'p' + (i - SKIP_INDEXES) + '=' +
                    encodeURIComponent(toDebugString(templateArgs[i]));
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

        if (verbose) {
            msos_debug('ng - urlResolve -> start,\n     url: ' + url + (note ? ',\n     ref: ' + note : ''));
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
                params: purlFn.param()
            };

        if (verbose) {
            msos_debug('ng - urlResolve -> done,\n     output:', output);
        }

        return output;
    }

    originUrl = urlResolve(window.location.href, 'set original');

    function urlIsSameOrigin(requestUrl) {
        var parsed = (_.isString(requestUrl)) ? urlResolve(requestUrl, 'check same origin') : requestUrl;
        return (parsed.protocol === originUrl.protocol && parsed.host === originUrl.host);
    }

    function isArrayLike(obj) {

        if (!obj
          || obj === null
          || obj === undefined
          || jQuery.isWindow(obj)) {
            return false;
        }

        if (_.isString(obj) || _.isArray(obj) || (jqLite && obj instanceof jqLite)) { return true; }

        // Support: iOS 8.2 (not reproducible in simulator)
        // "length" in obj used to prevent JIT error (gh-11508)
        var length = "length" in Object(obj) && obj.length;

        // NodeList objects (with `item` method) and
        // other objects with suitable length characteristics are array-like
        return _.isNumber(length) && ((length >= 0 && ((length - 1) in obj || obj instanceof Array)) || typeof obj.item === 'function');
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
            } else if (isBlankObject(obj)) {
                // createMap() fast path --- Safe to avoid hasOwnProperty check because prototype chain is empty
                for (key in obj) {
                    iterator.call(context, obj[key], key, obj);
                }
            } else if (typeof obj.hasOwnProperty === 'function') {
                // Slow path for objects inheriting Object.prototype, hasOwnProperty check needed
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        iterator.call(context, obj[key], key, obj);
                    }
                }
            } else {
                // Slow path for objects which do not have a method `hasOwnProperty`
                for (key in obj) {
                    if (hasOwnProperty.call(obj, key)) {
                        iterator.call(context, obj[key], key, obj);
                    }
                }
            }
        }
        return obj;
    }

    function forEachSorted(obj, iterator, context) {
        var i = 0,
            keys = Object.keys(obj).sort();

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

    function baseExtend(dst, objs, deep) {
        var h = dst.$$hashKey,
            i = 0,
            ii = 0,
            j = 0,
            jj = 0,
            obj,
            keys,
            key,
            src;

        for (i = 0, ii = objs.length; i < ii; i += 1) {

            obj = objs[i];

            // Note: this first one uses underscore.js _.isObject!
            if (_.isObject(obj)) {

                keys = Object.keys(obj);

                for (j = 0, jj = keys.length; j < jj; j += 1) {

                    key = keys[j];
                    src = obj[key];

                    if (deep && isObject(src)) {
                        if (_.isDate(src)) {
                            dst[key] = new Date(src.valueOf());
                        } else if (_.isRegExp(src)) {
                            dst[key] = new RegExp(src);
                        } else if (src.nodeName) {
                            dst[key] = src.cloneNode(true);
                        } else if (isElement(src)) {
                            dst[key] = src.clone();
                        } else {
                            if (!isObject(dst[key])) { dst[key] = _.isArray(src) ? [] : {}; }
                            baseExtend(dst[key], [src], true);
                        }
                    } else {
                        dst[key] = src;
                    }
                }
            }
        }

        setHashKey(dst, h);
        return dst;
    }

    function extend(dst) {
        return baseExtend(dst, slice.call(arguments, 1), false);
    }

    function merge(dst) {
        return baseExtend(dst, slice.call(arguments, 1), true);
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

    function hasCustomToString(obj) {
        return _.isFunction(obj.toString) && obj.toString !== Object.prototype.toString;
    }

    function makeMap(arry) {
        var obj = {},
            i;

        if (_.isArray(arry)) {
            for (i = 0; i < arry.length; i += 1) {
                obj[arry[i]] = true;
            }
        } else {
            msos.console.error('ng - makeMap -> input not an array.');
        }

        return obj;
    }

    function arrayRemove(array, value) {
        var index = _.indexOf(array, value);

        if (index >= 0) {
            array.splice(index, 1);
        }
        return index;
    }

    function copy(source, destination) {
        var stackSource = [],
            stackDest = [];

        function copyType(source) {
            var copied,
                re;

            switch (ngto_string.call(source)) {

                case '[object Int8Array]':
                case '[object Int16Array]':
                case '[object Int32Array]':
                case '[object Float32Array]':
                case '[object Float64Array]':
                case '[object Uint8Array]':
                case '[object Uint8ClampedArray]':
                case '[object Uint16Array]':
                case '[object Uint32Array]':
                    return new source.constructor(copyElement(source.buffer));

                case '[object ArrayBuffer]':
                    // Support: IE10
                    if (!source.slice) {
                        copied = new ArrayBuffer(source.byteLength);
                        new Uint8Array(copied).set(new Uint8Array(source));
                        return copied;
                    }
                    return source.slice(0);

                case '[object Boolean]':
                case '[object Number]':
                case '[object String]':
                case '[object Date]':
                  return new source.constructor(source.valueOf());

                case '[object RegExp]':
                    re = new RegExp(source.source, source.toString().match(/[^\/]*$/)[0]);
                    re.lastIndex = source.lastIndex;
                    return re;
            }

            if (_.isFunction(source.cloneNode)) {
                return source.cloneNode(true);
            }

            return undefined;
        }

        function copyElement(source) {
            // Simple values
            if (!isObject(source)) { return source; }

            // Already copied values
            var index = stackSource.indexOf(source),
                needsRecurse = false,
                destination;

            if (index !== -1) {
                return stackDest[index];
            }

            if (jQuery.isWindow(source) || isScope(source)) {
                throw ngMinErr(
                    'cpws',
                    "Can't copy! Making copies of Window or Scope instances is not supported."
                );
            }

            destination = copyType(source);

            if (destination === undefined) {
                destination = _.isArray(source) ? [] : Object.create(getPrototypeOf(source));
                needsRecurse = true;
            }

            stackSource.push(source);
            stackDest.push(destination);

            return needsRecurse ? copyRecurse(source, destination) : destination;
        }

        function copyRecurse(source, destination) {
            var h = destination.$$hashKey,
                key,
                i = 0;

            if (_.isArray(source)) {
                for (i = 0; i < source.length; i += 1) {
                    destination.push(copyElement(source[i]));
                }
            } else if (isBlankObject(source)) {
                // createMap() fast path --- Safe to avoid hasOwnProperty check because prototype chain is empty
                for (key in source) {
                    destination[key] = copyElement(source[key]);
                }
            } else if (source && typeof source.hasOwnProperty === 'function') {
                // Slow path, which must rely on hasOwnProperty
                for (key in source) {
                    if (source.hasOwnProperty(key)) {
                        destination[key] = copyElement(source[key]);
                    }
                }
            } else {
                // Slowest path --- hasOwnProperty can't be called as a method
                for (key in source) {
                    if (hasOwnProperty.call(source, key)) {
                        destination[key] = copyElement(source[key]);
                    }
                }
            }

            setHashKey(destination, h);
            return destination;
        }

        if (destination) {

            if (isTypedArray(destination) || isArrayBuffer(destination)) {
                throw ngMinErr(
                    'cpta',
                    "Can't copy! TypedArray destination cannot be mutated."
                );
            }

            if (source === destination) {
                throw ngMinErr('cpi', "Can't copy! Source and destination are identical.");
            }

            // Empty the destination object
            if (_.isArray(destination)) {
                destination.length = 0;
            } else {
                forEach(
                    destination,
                    function (value_na, key) {
                        if (key !== '$$hashKey') {
                            delete destination[key];
                        }
                    }
                );
            }

            stackSource.push(source);
            stackDest.push(destination);

            return copyRecurse(source, destination);
        }

        return copyElement(source);
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

    function createMap() {
        return Object.create(null);
    }

    function equals(o1, o2) {

        if (o1 === o2)                  { return true; }    // Same object ref.
        if (o1 === null || o2 === null) { return false; }   // Hell no!
        if (o1 !== o1 && o2 !== o2)     { return true; }    // catch NaN === NaN

        var t1 = typeof o1,
            t2 = typeof o2,
            length,
            key,
            keySet;

        if (t1 === t2 && t1 === 'object') {

            if (_.isArray(o1)) {
                if (!_.isArray(o2)) { return false; }
                length = o1.length;
                if (o1.length === o2.length) {
                    for (key = 0; key < length; key += 1) {
                        if (!equals(o1[key], o2[key])) { return false; }
                    }
                    return true;
                }
                return false;
            }

            if (_.isDate(o1)) {
                if (!_.isDate(o2)) { return false; }
                return equals(o1.getTime(), o2.getTime());
            }

            if (_.isRegExp(o1)) {
                if (!_.isRegExp(o2)) { return false; }
                return o1.toString() === o2.toString();
            }

            if (isScope(o1) || isScope(o2) || jQuery.isWindow(o1) || jQuery.isWindow(o2) || _.isArray(o2) || _.isDate(o2) || _.isRegExp(o2)) { return false; }
            keySet = createMap();

            for (key in o1) {
                if (key.charAt(0) === '$' || _.isFunction(o1[key])) { continue; }
                if (!equals(o1[key], o2[key])) { return false; }
                keySet[key] = true;
            }

            for (key in o2) {
                if (!(key in keySet) && (key.charAt(0) !== '$') && isDefined(o2[key]) && !_.isFunction(o2[key])) { return false; }
            }

            return true;
        }
        return false;
    }

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
                    function (match_na, nodeName) {
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

    function jqLiteWrapNode(node, wrapper) {
        var parent = node.parentNode;

        if (parent) { parent.replaceChild(wrapper, node); }

        wrapper.appendChild(node);
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

        msos_debug(temp_bj + 'start.');

        if (bindJQueryFired) {
            msos.console.warn(temp_bj + 'jQuery already bound!');
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

                for (i = 0; elems[i] != null; i += 1) {     // jshint ignore:line
                    // must be "!=" and not "!==" null
                    events = jQuery._data(elems[i], "events");
                    if (events && events.$destroy) {
                        jQuery(elems[i]).triggerHandler('$destroy');
                    }
                }
                originalCleanData(elems);
            };

        } else {
            msos.console.error(temp_bj + 'jQuery is missing!');
        }

        angular.element = jqLite;

        msos_debug(temp_bj + 'done!');
        // Prevent double-proxying.
        bindJQueryFired = true;
    }

    function assertArg(arg, name, reason) {
        if (!arg) {
            throw ngMinErr('assert_arg_req', "Argument '{0}' is {1}", (name || '?'), (reason || "required"));
        }
        return arg;
    }

    function assertArgFn(arg, name, acceptArrayAnnotation) {
        var dbug = 'fn notation';

        if (acceptArrayAnnotation && _.isArray(arg)) {
            arg = arg[arg.length - 1];
            dbug = 'array notation';
        }

        assertArg(
            _.isFunction(arg),
            name + ' (' + dbug + ')',
            'not a function, is ' + (arg && typeof arg === 'object' ? arg.constructor.name || 'Object' : typeof arg)
        );

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
            blockNodes,
            i = 0;

        for (i = 1; node !== endNode && (node = node.nextSibling); i += 1) {
            if (blockNodes || nodes[i] !== node) {
                if (!blockNodes) {
                    blockNodes = jqLite(slice.call(nodes, 0, i));
                }
                blockNodes.push(node);
            }
        }

        return blockNodes || nodes;
    }

    function setupModuleLoader(window) {

        var temp_sm = 'ng - setupModuleLoader',
            angular_module = {};

        msos_debug(temp_sm + ' -> start.');

        function ensure(obj, e_name, factory) {
            var debug = 'exists';

            if (!obj[e_name]) {
                obj[e_name] = factory();
                debug = 'created';
            }

            if (verbose) {
                msos_debug(temp_sm + ' - ensure -> ' + e_name + ', (' + debug + ')');
            }

            return obj[e_name];
        }

        angular = ensure(window, 'angular', Object);

        // Store a list of angular.module() calls
        angular.modulelist = [];

        angular_module = ensure(angular, 'module', function () {

            var modules = {};

            return function module(m_name, requires, configFn) {

                if (verbose) {
                    msos_debug(temp_sm + ' - module -> start: ' + m_name);
                }

                angular.modulelist.push(m_name.replace(/\./g, '_'));

                assertNotHasOwnProperty(m_name, 'module');

                if (requires && modules.hasOwnProperty(m_name)) {
                    modules[m_name] = null;
                }

                if (verbose) {
                    msos_debug(temp_sm + ' - module ->  done: ' + m_name);
                }

                return ensure(modules, m_name, function () {

                    if (!requires) {
                        throw $injectorMinErr('nomod', "Required module '{0}' is not available!", m_name);
                    }

                    var temp_em = ' - module - factory',
                        invokeQueue = [],
                        configBlocks = [],
                        runBlocks = [],
                        config,
                        moduleInstance = {};

                    if (verbose) {
                        msos_debug(temp_sm + temp_em + ' -> start: ' + m_name);
                    }

                    function invokeLater(provider, method, insertMethod, queue) {
                        if (!queue) { queue = invokeQueue; }
                        return function () {
                            if (verbose) {
                                msos_debug(temp_sm + temp_em + ' -> invokeLater,\n     for: ' + m_name + '::' + method);
                            }
                            queue[insertMethod || 'push']([provider, method, arguments]);
                            return moduleInstance;
                        };
                    }

                    function invokeLaterAndSetModuleName(provider, method) {
                        return function (recipeName, factoryFunction) {
                            if (verbose) {
                                msos_debug(temp_sm + temp_em + ' -> invokeLaterAndSetModuleName,\n     for: ' + m_name + '::' + recipeName + '::' + method);
                            }
                            if (factoryFunction && _.isFunction(factoryFunction)) { factoryFunction.$$moduleName = m_name; }
                            invokeQueue.push([provider, method, arguments]);
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
                        name: m_name,

                        provider:   invokeLaterAndSetModuleName('$provide', 'provider'),
                        factory:    invokeLaterAndSetModuleName('$provide', 'factory'),
                        service:    invokeLaterAndSetModuleName('$provide', 'service'),
                        value:      invokeLater('$provide', 'value'),
                        constant:   invokeLater('$provide', 'constant', 'unshift'),
                        decorator:  invokeLaterAndSetModuleName('$provide', 'decorator'),
                        animation:  invokeLaterAndSetModuleName('$animateProvider', 'register'),
                        filter:     invokeLaterAndSetModuleName('$filterProvider', 'register'),
                        controller: invokeLaterAndSetModuleName('$controllerProvider', 'register'),
                        directive:  invokeLaterAndSetModuleName('$compileProvider', 'directive'),
                        component:  invokeLaterAndSetModuleName('$compileProvider', 'component'),

                        config: config,

                        run: function (block) {
                            runBlocks.push(block);
                            return this;
                        }
                    };

                    if (configFn) { config(configFn); }

                    if (verbose) {
                        msos_debug(temp_sm + temp_em + ' ->  done: ' + m_name);
                    }

                    return moduleInstance;
                });
            };
        });

        msos_debug(temp_sm + ' -> done!');

        return angular_module;
    }

    function camelCase(cc_name) {
        if (_.isString(cc_name)) {
            cc_name = cc_name.replace(
                    SPECIAL_CHARS_REGEXP,
                    function (underscore_na, separator_na, letter, offset) { return offset ? letter.toUpperCase() : letter; }
                ).replace(MOZ_HACK_REGEXP, 'Moz$1');
        } else {
            msos.console.error('ng - camelCase -> not a string:', cc_name);
        }
        return cc_name;
    }

    function jqLiteIsTextNode(html) {
        return !HTML_REGEXP.test(html);
    }

    function jqLiteClone(element) {
        return element.cloneNode(true);
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
                if (isDefined(value)) { return value; }
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

    function getAliasedAttrName(name) {
        return ALIASED_ATTR[name];
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

            if (_.isUndefined((fn.length === 2 && fn !== jqLiteController) ? arg1 : arg2)) {

                if (_.isObject(arg1)) {

                    for (i = 0; i < nodeCount; i += 1) {
                        for (key in arg1) {
                            fn(this[i], key, arg1[key]);
                        }
                    }

                    return this;
                }

                value = fn.$dv;
                jj = (_.isUndefined(value)) ? Math.min(nodeCount, 1) : nodeCount;

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

    // Provider for private $$jqLite service
    function $$jqLiteProvider() {

        function jqLiteHasClass(element, selector) {
            if (!element.getAttribute) { return false; }
            return ((" " + (element.getAttribute('class') || '') + " ").replace(/[\n\t]/g, " ").indexOf(" " + selector + " ") > -1);
        }

        function jqLiteRemoveClass(element, cssClasses) {
            if (cssClasses && element.setAttribute) {
                forEach(
                    cssClasses.split(' '),
                    function (cssClass) {
                        element.setAttribute(
                            'class',
                            trim(
                                (" " + (element.getAttribute('class') || '') + " ")
                                    .replace(/[\n\t]/g, " ")
                                    .replace(" " + trim(cssClass) + " ", " ")
                            )
                        );
                    }
                );
            }
        }

        function jqLiteAddClass(element, cssClasses) {
            if (cssClasses && element.setAttribute) {
                var existingClasses = (' ' + (element.getAttribute('class') || '') + ' ')
                    .replace(/[\n\t]/g, " ");

                forEach(
                    cssClasses.split(' '),
                    function (cssClass) {
                        cssClass = trim(cssClass);
                        if (existingClasses.indexOf(' ' + cssClass + ' ') === -1) {
                            existingClasses += cssClass + ' ';
                        }
                    }
                );

                element.setAttribute('class', trim(existingClasses));
            }
        }

        this.$get = function $$jqLite() {
            return extend(
                JQLite,
                {
                    hasClass: function (node, classes) {
                        if (node.attr) { node = node[0]; }
                        return jqLiteHasClass(node, classes);
                    },
                    addClass: function (node, classes) {
                        if (node.attr) { node = node[0]; }
                        return jqLiteAddClass(node, classes);
                    },
                    removeClass: function (node, classes) {
                        if (node.attr) { node = node[0]; }
                        return jqLiteRemoveClass(node, classes);
                    }
                }
            );
        };
    }

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

    $$HashMapProvider = [function () {
        this.$get = [function () {
            return HashMap;
        }];
    }];

    function extractArgs(fn) {
        var fnText = fn.toString().replace(STRIP_COMMENTS, ''),
            args = fnText.match(ARROW_ARG) || fnText.match(FN_ARGS);

        return args;
    }

    function anonFn(fn) {
        var args = extractArgs(fn);

        if (args) { return 'function (' + (args[1] || '').replace(/[\s\r\n]+/, ' ') + ')'; }

        return 'fn';
    }

    function annotate(fn, strictDi, name) {
        var temp_a = 'ng - annotate -> ',
            debug = '',
            $inject,
            argDecl,
            last;

        if (verbose === 'injector') {
            msos_debug(temp_a + 'start.');
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
                    argDecl = extractArgs(fn);
                    forEach(
                        argDecl[1].split(FN_ARG_SPLIT),
                        function (arg) {
                            arg.replace(
                                FN_ARG,
                                function (all_na, underscore_na, name) {
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

        if (verbose === 'injector') {
            msos_debug(temp_a + 'done, for ' + debug + (name ? ', name: ' + name : ''));
        }
        return $inject;
    }

    function createInjector(modulesToLoad, strictDi) {

        strictDi = (strictDi === true);

        var temp_ci = 'ng - createInjector',
            INSTANTIATING = {},
            providerSuffix = 'Provider',
            path = [],
            loadedModules = new HashMap([], true),
            providerCache = {},
            instanceCache = {},
            providerInjector = null,
            protoInstanceInjector = null,
            instanceInjPre = null,
            instanceInjector = null,
            lm_runBlocks = [];

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

            if (verbose) {
                msos_debug(temp_ci + ' - provider -> start: ' + db_out);
            }

            assertNotHasOwnProperty(name, 'service');

            if (_.isFunction(provider_input) || _.isArray(provider_input)) {
                provider_input = providerInjector.instantiate(provider_input);
            }

            if (!provider_input.$get) {
                throw $injectorMinErr(
                    'pget',
                    "Provider '{0}' must define $get factory method.",
                    name
                );
            }

            if (verbose) {
                msos_debug(temp_ci + ' - provider ->  done: ' + db_out);
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
            if (verbose) {
                msos_debug(temp_ci + ' - service -> called: ' + name);
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
            if (verbose) {
                msos_debug(temp_ci + ' - decorator -> called: ' + serviceName + providerSuffix);
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

            if (verbose === 'injector') {
                msos_debug(temp_ci + temp_cii + ' -> start.');
            }

            function getService(serviceName, caller) {
                var debug_out = ',\n     name: ' + serviceName + (caller ? ', caller: ' + caller : '');

                if (verbose === 'injector') {
                    msos_debug(temp_ci + temp_cii + ' - getService -> start' + debug_out);
                }

                if (cache.hasOwnProperty(serviceName)) {
                    if (cache[serviceName] === INSTANTIATING) {
                        throw $injectorMinErr('cdep', 'Circular dependency found: {0}', serviceName + ' <- ' + path.join(' <- '));
                    }
                    if (verbose === 'injector') {
                        msos_debug(temp_ci + temp_cii + ' - getService ->  done (exists)' + debug_out);
                    }
                    return cache[serviceName];
                }

                path.unshift(serviceName);

                cache[serviceName] = INSTANTIATING;
                cache[serviceName] = factory(serviceName, caller);

                path.shift();

                if (verbose === 'injector') {
                    msos_debug(temp_ci + temp_cii + ' - getService ->  done (created)' + debug_out);
                }

                return cache[serviceName];
            }

            function injectionArgs(fn, locals, serviceName) {
                var args = [],
                    $inject = createInjector.$$annotate(fn, strictDi, serviceName),
                    i = 0,
                    length = $inject.length,
                    key;

                for (i = 0; i < length; i += 1) {
                    key = $inject[i];

                    if (typeof key !== 'string') {
                        throw $injectorMinErr(
                            'itkn',
                            'Incorrect injection token! Expected service name as string, got {0}',
                            key
                        );
                    }

                    args.push(locals && locals.hasOwnProperty(key) ? locals[key] : getService(key, serviceName));
                }
                return args;
            }

            function isClass(func) {
                // IE 9-11 do not support classes and IE9 leaks with the code below.
                if (msie <= 11) { return false; }
                // Workaround for MS Edge, https://connect.microsoft.com/IE/Feedback/Details/2211653
                return typeof func === 'function' && /^(?:class\s|constructor\()/.test(Function.prototype.toString.call(func));
            }

            function invoke(fn, self, locals, serviceName) {
                var invoke_name = '',
                    args = [],
                    FProBA;

                if (locals && typeof locals === 'string') {
                    serviceName = locals;
                    locals = null;
                }

                if (verbose === 'injector') {
                    if (!serviceName) {
                        invoke_name = (_.isArray(fn) && _.isString(fn[0]) ? ', provider: ' + fn[0] : ', function');
                    } else {
                        invoke_name = ', service: ' + serviceName;
                    }
                    msos_debug(temp_ci + temp_cii + ' - invoke -> start' + invoke_name);
                }

                args = injectionArgs(fn, locals, serviceName);

                if (_.isArray(fn)) { fn = fn[fn.length - 1]; }

                if (!isClass(fn)) {
                    // http://jsperf.com/angularjs-invoke-apply-vs-switch, #5388
                    if (verbose === 'injector') {
                        msos_debug(temp_ci + temp_cii + ' - invoke ->  done, not class' + invoke_name);
                    }
                    return fn.apply(self, args);
                }

                // Applying a constructor without immediate parentheses is the point here.
                 args.unshift(null);

                if (verbose === 'injector') {
                    msos_debug(temp_ci + temp_cii + ' - invoke ->  done, new class' + invoke_name);
                }

                FProBA = Function.prototype.bind.apply(fn, args);

                return new FProBA();
            }

            function instantiate(Type, locals, serviceName) {
                // Check if Type is annotated and use just the given function at n-1 as parameter
                // e.g. someModule.factory('greeter', ['$window', function (renamed$window) {}]);
                var ctor = (_.isArray(Type) ? Type[Type.length - 1] : Type),
                    args = injectionArgs(Type, locals, serviceName),
                    FProBA;

                if (verbose === 'injector') {
                    msos_debug(temp_ci + temp_cii + ' - instantiate -> called.');
                }

                // Empty object at position 0 is ignored for invocation with `new`, but required.
                args.unshift(null);

                FProBA = Function.prototype.bind.apply(ctor, args);

                return new FProBA();
            }

            if (verbose === 'injector') {
                msos_debug(temp_ci + temp_cii + ' ->  done!');
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

        if (verbose) {
            msos_debug(temp_ci + ' ===> create providerInjector.');
        }

        providerInjector = (
            providerCache.$injector = createInternalInjector(
                providerCache,
                function (serviceName, caller) {
                    var temp_pc = temp_ci + ' - providerCache.$injector -> unregistered provider, service name: ' + serviceName + ', call path: {0}';

                    if (_.isString(caller)) { path.push(caller); }

                    throw $injectorMinErr(
                        'unpr',
                        temp_pc,
                        path.join(' <- ')
                    );
                }
            )
        );

        if (verbose) {
            msos_debug(temp_ci + ' ===> create instanceInjector.');
        }

        protoInstanceInjector = createInternalInjector(
            instanceCache,
            function (serviceName, caller) {
                var provid_inject = providerInjector.get(serviceName + providerSuffix, caller);

                return instanceInjPre.invoke(provid_inject.$get, provid_inject, undefined, serviceName);
            }
        );

        providerCache['$injector' + providerSuffix] = { $get: valueFn(protoInstanceInjector) };

        instanceInjPre = protoInstanceInjector;


        ////////////////////////////////////
        // Module Loading
        ////////////////////////////////////
        function loadModules(modulesToLoad) {

            var temp_lm = ' - loadModules -> ',
                runBlocks = [],
                moduleFn;

            msos_debug(temp_ci + temp_lm + 'start:', modulesToLoad);

            if (!_.isArray(modulesToLoad)) {
                msos.console.warn(temp_ci + temp_lm + ' done: input not array!', modulesToLoad);
                return runBlocks;
            }

            if (modulesToLoad.length === 0) {
                msos_debug(temp_ci + temp_lm + ' done, no input.');
                return runBlocks;
            }

            function runInvokeQueue(queue) {
                var temp_ri = ' - runInvokeQueue -> ',
                    i = 0,
                    invokeArgs,
                    riq_provider;

                if (verbose) {
                    msos_debug(temp_ci + temp_ri + 'start, queue: ' + queue.length);
                }

                for (i = 0; i < queue.length; i += 1) {
                    invokeArgs = queue[i];

                    riq_provider = providerInjector.get(invokeArgs[0]);
                    riq_provider[invokeArgs[1]].apply(riq_provider, invokeArgs[2]);
                }

                if (verbose) {
                    msos_debug(temp_ci + temp_ri + 'done!');
                }
            }

            forEach(
                modulesToLoad,
                function (module) {
                    var module_name,
                        debug_note = [];

                    module_name = _.isArray(module) ? module[0] : module;

                    if (verbose) {
                        msos_debug(temp_ci + temp_lm + '(foreach) start, module: ' + module_name);
                    }
    
                    if (!loadedModules.get(module)) {

                        loadedModules.put(module, true);

                        try {
                            if (_.isString(module)) {
                                debug_note.push('as string');
                                moduleFn = angularModule(module);

                                if (moduleFn.requires.length) {
                                    runBlocks = runBlocks.concat(loadModules(moduleFn.requires)).concat(moduleFn._runBlocks);
                                } else {
                                    runBlocks = runBlocks.concat(moduleFn._runBlocks);
                                }

                                runInvokeQueue(moduleFn._invokeQueue);
                                runInvokeQueue(moduleFn._configBlocks);
                            } else if (_.isFunction(module)) {
                                debug_note.push('as function');
                                runBlocks.push(providerInjector.invoke(module));
                            } else if (_.isArray(module)) {
                                debug_note.push('as array');
                                runBlocks.push(providerInjector.invoke(module));
                            } else {
                                debug_note.push('as arg function');
                                assertArgFn(module, 'module');
                            }

                        } catch (e) {

                            debug_note.push('no, failed');
                            msos.console.error(temp_ci + temp_lm + '(foreach) failed:', e);
                        }

                    } else {

                        debug_note.push('already loaded');
                    }

                    if (verbose) {
                        msos_debug(temp_ci + temp_lm + '(foreach)  done, module: ' + module_name + ', ' + debug_note.join(', '));
                    }
                }
            );

            msos_debug(temp_ci + temp_lm + ' done:', modulesToLoad);

            return runBlocks;
        }

        lm_runBlocks = loadModules(modulesToLoad);

        instanceInjector = protoInstanceInjector.get('$injector');
        instanceInjector.strictDi = strictDi;

        forEach(
            lm_runBlocks,
            function (fn) {
                if (fn) { instanceInjector.invoke(fn); }
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
            bs_injector;

        config = extend(defaultConfig, config);

        msos_debug(temp_b + ' 8==> start, config:', config);

        if (bindbootstrapFired) {
            msos.console.warn(temp_b + ' 8==> done, already fired!');
            return undefined;
        }

        bindbootstrapFired = true;

        doBootstrap = function () {

            var temp_db = ' - doBootstrap',
                tag = '',
                injector = null;

            element = jqLite(element);

            tag = (element[0] === document) ? 'document' : nodeName_(element);

            msos_debug(temp_b + temp_db + ' 8==>~ start, attached to: ' + tag);

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
                msos.console.info(temp_b + temp_db + ' - bootstrapApply 8==>~.. start, node: ' + nodeName_(element) + (element[0].id ? '#' + element[0].id : ''));

                scope.$apply(
                    function () {
                        element.data('$injector', injector);
                        compile(element)(scope);
                    }
                );

                msos.console.info(temp_b + temp_db + ' - bootstrapApply 8==>~..  done!');
            }]);

            msos_debug(temp_b + ' - doBootstrap 8==>~ done!');
            return injector;
        };

        bs_injector = doBootstrap();

        msos_debug(temp_b + ' 8==> done!');
        return bs_injector;
    }

    function $AnchorScrollProvider() {

        var autoScrollingEnabled = true;

        this.disableAutoScrolling = function () {
            autoScrollingEnabled = false;
        };

        this.$get = ['$window', '$location', '$rootScope', function ($window, $location, $rootScope) {
            var temp_asg = 'ng - $AnchorScrollProvider - $get';

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

            function scroll(hash) {
                hash = _.isString(hash) ? hash : $location.hash();

                var ng_win_doc = $window.document,
                    elm;

                msos_debug(temp_asg + ' - scroll -> called, hash: ' + (hash || 'na'));

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
                        msos_debug(temp_asg + ' - autoScrollWatch -> called.');
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

    function mergeClasses(a, b) {
        if (!a && !b)   { return ''; }
        if (!a)         { a = ''; }
        if (!b)         { b = ''; }
        if (_.isArray(a)) { a = a.join(' '); }
        if (_.isArray(b)) { b = b.join(' '); }
        return a + (b ? (a ? ' ' : '') + b : '');
    }

    function extractElementNode(element) {
        var i = 0,
            elm;

        for (i = 0; i < element.length; i += 1) {
            elm = element[i];

            if (elm.nodeType === NODE_TYPE_ELEMENT) { return elm; }
        }

        return undefined;
    }

    function splitClasses(classes) {
        var obj = createMap(),
            classes_arry = [];

        if (_.isString(classes)) {
            classes_arry = classes.split(SPACE);
        } else if (_.isArray(classes)) {
            classes_arry = classes;
        }

        forEach(
            classes_arry,
            function (klass) {
                if (klass.length) { obj[klass] = true; }
            }
        );

        return obj;
    }

    function prepareAnimateOptions(options) {
        return isObject(options) ? options : {};
    }

    $$CoreAnimateJsProvider = function () {
        this.$get = function () {};
    };

    $$CoreAnimateQueueProvider = function () {
        var postDigestQueue = new HashMap(),
            postDigestElements = [];

        this.$get = ['$$AnimateRunner', '$rootScope',
            function ($$AnimateRunner,   $rootScope) {

                function updateData(data, classes, value) {
                    var changed = false;

                    if (classes) {
                        classes = _.isString(classes) ? classes.split(' ') : _.isArray(classes) ? classes : [];

                        forEach(
                            classes,
                            function (className) {
                                if (className) {
                                    changed = true;
                                    data[className] = value;
                                }
                            }
                        );
                    }
                    return changed;
                }

                function handleCSSClassChanges() {

                    forEach(
                        postDigestElements,
                        function (element) {
                            var data = postDigestQueue.get(element),
                                existing = splitClasses(element.attr('class')),
                                toAdd = '',
                                toRemove = '';

                            if (data) {

                                forEach(
                                    data,
                                    function (status, className) {
                                        var hasClass = !!existing[className];

                                        if (status !== hasClass) {
                                            if (status) {
                                                toAdd += (toAdd.length ? ' ' : '') + className;
                                            } else {
                                                toRemove += (toRemove.length ? ' ' : '') + className;
                                            }
                                        }
                                    }
                                );
        
                                forEach(
                                    element,
                                    function (elm) {
                                            if (toAdd)      { jqLite(elm).addClass(toAdd); }
                                            if (toRemove)   { jqLite(elm).removeClass(toRemove); }
                                    }
                                );

                                postDigestQueue.remove(element);
                            }
                        }
                    );
                    postDigestElements.length = 0;
                }
    
                function addRemoveClassesPostDigest(element, add, remove) {
                    var data = postDigestQueue.get(element) || {},
                        classesAdded = updateData(data, add, true),
                        classesRemoved = updateData(data, remove, false);
    
                    if (classesAdded || classesRemoved) {
    
                        postDigestQueue.put(element, data);
                        postDigestElements.push(element);
    
                        if (postDigestElements.length === 1) {
                            $rootScope.$$postDigest(handleCSSClassChanges);
                        }
                    }
                }

                return {
                    enabled: noop,
                    on: noop,
                    off: noop,
                    pin: noop,

                    push: function (element, event_na, options, domOperation) {

                        if (domOperation) { domOperation(); }

                        options = options || {};

                        if (options.from)   { element.css(options.from); }
                        if (options.to)     { element.css(options.to); }
    
                        if (options.addClass || options.removeClass) {
                            addRemoveClassesPostDigest(element, options.addClass, options.removeClass);
                        }

                        var runner = new $$AnimateRunner(); // jshint ignore:line

                        // since there are no animations to run the runner needs to be
                        // notified that the animation call is complete.
                        runner.complete();
                        return runner;
                    }
                };
            }
        ];
    };

    $animateMinErr = minErr('$animate');

    $AnimateProvider = ['$provide', function ($provide) {
        var provider = this,
            temp_ap = 'ng - $AnimateProvider';

        this.$$registeredAnimations = Object.create(null);

        this.register = function (name, factory) {
            var key = '';

            msos_debug(temp_ap + ' - register -> called, for: ' + (name || "'' (empty string)"));

            if (name && name.charAt(0) !== '.') {
                throw $animateMinErr(
                    'notcsel',
                    "Expecting class selector starting with '.' got '{0}'.",
                    name
                );
            }

            key = name + '-animation';

            provider.$$registeredAnimations[name.substr(1)] = key;
            $provide.factory(key, factory);
        };

        this.classNameFilter = function (expression) {
            var reservedRegex;

            if (arguments.length === 1) {
                this.$$classNameFilter = (expression instanceof RegExp) ? expression : null;

                if (this.$$classNameFilter) {
                    reservedRegex = new RegExp("(\\s+|\\/)" + NG_ANIMATE_CLASSNAME + "(\\s+|\\/)");

                    if (reservedRegex.test(this.$$classNameFilter.toString())) {
                        throw $animateMinErr(
                            'nongcls',
                            '$animateProvider.classNameFilter(regex) prohibits accepting a regex value which matches/contains the "{0}" CSS class.',
                            NG_ANIMATE_CLASSNAME
                        );
                    }
                }
            }
            return this.$$classNameFilter;
        };

        this.$get = ['$$animateQueue', function ($$animateQueue) {

            function domInsert(element, parentElement, afterElement) {

                if (afterElement) {
                    var afterNode = extractElementNode(afterElement);

                    if (afterNode && !afterNode.parentNode && !afterNode.previousElementSibling) {
                        afterElement = null;
                    }
                }

                if (afterElement)   { afterElement.after(element); }
                else                { parentElement.prepend(element); }
            }

            return {

                on: $$animateQueue.on,
                off: $$animateQueue.off,
                pin: $$animateQueue.pin,
                enabled: $$animateQueue.enabled,

                cancel: function (runner) {
                    if (runner.end) { runner.end(); }
                },

                enter: function (element, parent, after, options) {
                    if (parent) { parent = jqLite(parent); }
                    if (after)  { after = jqLite(after); }

                    parent = parent || after.parent();
                    domInsert(element, parent, after);

                    return $$animateQueue.push(element, 'enter', prepareAnimateOptions(options));
                },

                move: function (element, parent, after, options) {
                    if (parent) { parent = jqLite(parent); }
                    if (after)  { after = jqLite(after); }

                    parent = parent || after.parent();
                    domInsert(element, parent, after);

                    return $$animateQueue.push(element, 'move', prepareAnimateOptions(options));
                },

                leave: function (element, options) {
                    return $$animateQueue.push(element, 'leave', prepareAnimateOptions(options), function () {
                        element.remove();
                    });
                },

                addClass: function (element, className, options) {
                    options = prepareAnimateOptions(options);
                    options.addClass = mergeClasses(options.addclass, className);

                    return $$animateQueue.push(element, 'addClass', options);
                },

                removeClass: function (element, className, options) {
                    options = prepareAnimateOptions(options);
                    options.removeClass = mergeClasses(options.removeClass, className);

                    return $$animateQueue.push(element, 'removeClass', options);
                },

                setClass: function (element, add, remove, options) {
                    options = prepareAnimateOptions(options);
                    options.addClass = mergeClasses(options.addClass, add);
                    options.removeClass = mergeClasses(options.removeClass, remove);

                    return $$animateQueue.push(element, 'setClass', options);
                },

                animate: function (element, from, to, className, options) {
                    options = prepareAnimateOptions(options);
                    options.from = options.from ? extend(options.from, from) : from;
                    options.to   = options.to   ? extend(options.to, to)     : to;

                    className = className || 'ng-inline-animate';
                    options.tempClasses = mergeClasses(options.tempClasses, className);

                    return $$animateQueue.push(element, 'animate', options);
                }
            };
        }];
    }];

    $$AnimateAsyncRunFactoryProvider = function () {
        this.$get = ['$$rAF', function ($$rAF) {
            var waitQueue = [];

            function waitForTick(fn) {

                waitQueue.push(fn);

                if (waitQueue.length > 1) { return; }

                $$rAF(
                    function () {
                        var i = 0;

                        for (i = 0; i < waitQueue.length; i += 1) { waitQueue[i](); }
                        waitQueue = [];
                    }
                );
            }

            return function () {
                var passed = false;

                waitForTick(function () { passed = true; });

                return function (callback) {
                    if (passed) { callback(); }
                    else        { waitForTick(callback); }
                };
            };
        }];
    };

    $$AnimateRunnerFactoryProvider = function () {
        this.$get = ['$q', '$$animateAsyncRun', '$document', '$timeout',
            function ($q,   $$animateAsyncRun,   $document,   $timeout) {
                var INITIAL_STATE = 0,
                    DONE_PENDING_STATE = 1,
                    DONE_COMPLETE_STATE = 2,
                    temp_ar = 'ng - $$AnimateRunnerFactoryProvider - $get';

                function AnimateRunner(host) {
                    this.setHost(host);

                    var rafTick = $$animateAsyncRun(),
                        timeoutTick = function (fn) { $timeout(fn, 0, false); };

                    this._doneCallbacks = [];
                    this._tick = function (fn) {
                        var doc = $document[0];
                        // the document may not be ready or attached
                        // to the module for some internal tests
                        if (doc && doc.hidden)  { timeoutTick(fn); }
                        else                    { rafTick(fn); }
                    };
                    this._state = 0;
                }

                AnimateRunner.prototype = {
                    setHost: function (host) {
                        this.host = host || {};
                    },
                    done: function (fn) {
                        if (this._state === DONE_COMPLETE_STATE) {
                            fn();
                        } else {
                            this._doneCallbacks.push(fn);
                        }
                    },
                    progress: noop,
                    getPromise: function () {
                        msos_debug(temp_ar + ' getPromise -> called.');

                        if (!this.promise) {
                            var self = this;
                            this.promise = $q(
                                function (resolve, reject) {
                                    self.done(
                                        function (status) {
                                            if (status === false)   { reject(); }
                                            else                    { resolve(); }
                                        }
                                    );
                                }
                            );
                        }

                        return this.promise;
                    },
                    then: function (resolveHandler, rejectHandler) {
                        msos_debug(temp_ar + ' then -> called.');

                        return this.getPromise().then(resolveHandler, rejectHandler);
                    },
                    'catch': function (handler) {
                        return this.getPromise()['catch'](handler);
                    },
                    'finally': function (handler) {
                        return this.getPromise()['finally'](handler);
                    },
                    pause: function () {
                        if (this.host.pause)    { this.host.pause(); }
                    },
                    resume: function () {
                        if (this.host.resume)   { this.host.resume(); }
                    },
                    end: function () {
                        if (this.host.end)      { this.host.end(); }
                        this._resolve(true);
                    },
                    cancel: function () {
                        if (this.host.cancel)   { this.host.cancel(); }
                        this._resolve(false);
                    },
                    complete: function (response) {
                        var self = this;

                        if (self._state === INITIAL_STATE) {
                            self._state = DONE_PENDING_STATE;
                            self._tick(
                                function () { self._resolve(response); }
                            );
                        }
                    },
                    _resolve: function (response) {
                        if (this._state !== DONE_COMPLETE_STATE) {
                            forEach(
                                this._doneCallbacks,
                                function (fn) { fn(response); }
                            );

                            this._doneCallbacks.length = 0;
                            this._state = DONE_COMPLETE_STATE;
                        }
                    }
                };

                AnimateRunner.chain = function (chain, callback) {
                    var index = 0;

                    function next() {

                        if (index === chain.length) {
                            callback(true);
                            return;
                        }

                        chain[index](
                            function (response) {
                                if (response === false) {
                                    callback(false);
                                    return;
                                }
                                index += 1;
                                next();
                            }
                        );
                    }

                    next();
                };

                AnimateRunner.all = function (runners, callback) {
                    var count = 0,
                        status = true;

                    function onProgress(response) {
                        status = status && response;

                        count += 1;
                        if (count === runners.length) { callback(status); }
                    }

                    forEach(
                        runners,
                        function (runner) { runner.done(onProgress); }
                    );
                };

                return AnimateRunner;
            }
        ];
    };

    function stripHash(url) {
        var index = url.indexOf('#');
        return index === -1 ? url : url.substr(0, index);
    }

    function trimEmptyHash(url) {
        return url.replace(/(#.+)|#$/, '$1');
    }

    function Browser(window) {
        var temp_br = 'ng - Browser',
            self = this,
            location = window.location,
            history = window.history,
            setTimeout = window.setTimeout,
            clearTimeout = window.clearTimeout,
            pendingDeferIds = {},
            outstandingRequestCount = 0,
            outstandingRequestCallbacks = [],
            lastBrowserUrl = location.href,
            urlChangeListeners = [],
            urlChangeInit = false,
            pendingLocation = null,
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
                            msos.console.error('ng - Browser - completeOutstandingRequest -> error:', e);
                        }
                    }
                }
            }
        }

        function getHash(url) {
            var index = url.indexOf('#');

            return index === -1 ? '' : url.substr(index);
        }

        self.$$completeOutstandingRequest = completeOutstandingRequest;
        self.$$incOutstandingRequestCount = function () {
            outstandingRequestCount += 1;
        };

        self.notifyWhenNoOutstandingRequests = function (callback) {

            if (outstandingRequestCount === 0) {
                callback();
            } else {
                outstandingRequestCallbacks.push(callback);
            }
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

            if (verbose) {
                msos_debug(temp_br + ' - url -> ' + (url ? 'setter start,\n     ' + url + ',' : 'getter start.'));
            }

            // setter
            if (url) {
                sameState = lastHistoryState === state;

                if (lastBrowserUrl === url && (!Modernizr.history || sameState)) {
                    if (verbose) {
                        msos_debug(temp_br + ' - url -> setter done, no change!');
                    }
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
                    if (!sameBase || pendingLocation) {
                        pendingLocation = url;
                    }

                    if (replace) {
                        if (verbose) {
                            msos_debug(temp_br + ' - url -> setter done, replace url: ' + url);
                        }

                        location.replace(url);

                    } else if (!sameBase) {
                        if (msos.config.debug) {
                            alert(temp_br + ' - url -> setter done, not same base: ' + url);
                        }

                        location.href = url;
                    } else {

                        location.hash = getHash(url);
                    }
                    if (location.href !== url) {

                        pendingLocation = url;
                    }
                }

                if (verbose) {
                    msos_debug(temp_br + ' - url -> setter done!');
                }
                return self;
            }

            out_url = pendingLocation || window.location.href.replace(/%27/g,"'");

            if (verbose) {
                msos_debug(temp_br + ' - url -> getter done (Larry the Cable Guy),\n     url: ' + out_url);
            }

            return out_url;
        };

        self.state = function () {
            return cachedState;
        };

        function cacheStateAndFireUrlChange() {
            var temp_cs = ' - cacheStateAndFireUrlChange -> ';

            msos_debug(temp_br + temp_cs + 'start.');

            cacheState();
            self.$$checkUrlChange();

            msos_debug(temp_br + temp_cs + 'done!');
        }

        self.onUrlChange = function (callback) { urlChangeListeners.push(callback); };

        self.$$applicationDestroyed = function () {

            msos_debug(temp_br + ' - $$applicationDestroyed -> called.');

            jqLite(window).off('hashchange popstate', cacheStateAndFireUrlChange);
        };

        self.$$checkUrlChange = function () {
            var check_url;

            msos_debug(temp_br + ' - $$checkUrlChange -> start.');

            check_url = self.url();

            if (lastBrowserUrl === check_url
             && lastHistoryState === cachedState) {
                msos_debug(temp_br + ' - $$checkUrlChange -> done, no change!');
                return;
            }

            msos_debug(temp_br + ' - $$checkUrlChange -> update for new url:\n     ' + check_url);

            lastBrowserUrl = check_url;
            lastHistoryState = cachedState;

            forEach(
                urlChangeListeners,
                function (listener) { listener(check_url, cachedState); }
            );

            msos_debug(temp_br + ' - $$checkUrlChange -> done!');
        };

        self.defer = function (fn, delay) {
            var timeoutId;

            delay = delay || 0;

            msos_debug(temp_br + ' - defer -> start, delay: ' + delay);

            outstandingRequestCount += 1;

            timeoutId = setTimeout(
                function () {
                    delete pendingDeferIds[timeoutId];
                    completeOutstandingRequest(fn);
                },
                delay
            );

            pendingDeferIds[timeoutId] = true;

            msos_debug(temp_br + ' - defer -> done, outstanding requests: ' + outstandingRequestCount);

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

        if (!urlChangeInit) {
            // html5 history api - popstate event
            if (Modernizr.history) {
                jqLite(window).on('popstate', cacheStateAndFireUrlChange);
            }
            // hashchange event
            jqLite(window).on('hashchange', cacheStateAndFireUrlChange);

            urlChangeInit = true;
        }
    }

    function $BrowserProvider() {
        this.$get = ['$window', '$document',
            function ($window, $document) {
                return new Browser($window, $document);
            }
        ];
    }

    $CoreAnimateCssProvider = function () {
        this.$get = ['$$rAF', '$$AnimateRunner',
            function ($$rAF,   $$AnimateRunner) {

                return function (element, initialOptions) {
                    var options = initialOptions || {},
                        closed,
                        runner;

                    function applyAnimationContents() {
                        if (options.addClass) {
                            element.addClass(options.addClass);
                            options.addClass = null;
                        }
                        if (options.removeClass) {
                            element.removeClass(options.removeClass);
                            options.removeClass = null;
                        }
                        if (options.to) {
                            element.css(options.to);
                            options.to = null;
                        }
                    }

                    function run() {
                        $$rAF(
                            function () {
                                applyAnimationContents();

                                if (!closed) { runner.complete(); }
                                closed = true;
                            }
                        );
                        return runner;
                    }

                    if (!options.$$prepared) {
                        options = copy(options);
                    }

                    if (options.cleanupStyles) {
                        options.from = options.to = null;
                    }

                    if (options.from) {
                        element.css(options.from);
                        options.from = null;
                    }

                    runner = new $$AnimateRunner();     // jshint newcap: false

                    return {
                        start: run,
                        end: run
                    };
                };
            }
        ];
    };

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
                    data = createMap(),
                    capacity = (options && options.capacity) || Number.MAX_VALUE,
                    lruHash = createMap(),
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

                        if (_.isUndefined(value)) { return undefined; }

                        if (capacity < Number.MAX_VALUE) {
                            if (lruHash[key]) {
                                lruEntry = lruHash[key];
                            } else {
                                lruHash[key] = { key: key };
                                lruEntry = lruHash[key];
                            }
                            refresh(lruEntry);
                        }

                        if (!(key in data)) { cfp_size += 1; }  // hasOwnProperty na in data

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

                        if (!(key in data))  { return; }  // hasOwnProperty na in data

                        delete data[key];
                        cfp_size -= 1;
                    },

                    removeAll: function () {
                        data = createMap();
                        cfp_size = 0;
                        lruHash = createMap();
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

    function identifierForController(controller, ident) {
        if (ident && _.isString(ident)) { return ident; }

        if (_.isString(controller)) {
            var match = CNTRL_REG.exec(controller);
            if (match) { return match[3]; }
        }

        return undefined;
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
            vc = (verbose === 'compile');

        function parseIsolateBindings(scope, directiveName, isController) {
            var LOCAL_REGEXP = /^\s*([@&<]|=(\*?))(\??)\s*(\w*)\s*$/,
                bindings = {};

            forEach(
                scope,
                function (definition, scopeName) {
                    var match = definition.match(LOCAL_REGEXP);

                    if (!match) {
                        throw $compileMinErr(
                            'iscp',
                            "Invalid {3} for directive '{0}'. Definition: {... {1}: '{2}' ...}",
                            directiveName,
                            scopeName,
                            definition,
                            (isController ? "controller bindings definition" : "isolate scope definition")
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

        function parseDirectiveBindings(directive, directiveName) {
            var bindings = {
                    isolateScope: null,
                    bindToController: null
                },
                controller,
                controllerAs;

            if (isObject(directive.scope)) {
                if (directive.bindToController === true) {
                    bindings.bindToController = parseIsolateBindings(directive.scope, directiveName, true);
                    bindings.isolateScope = {};
                } else {
                    bindings.isolateScope = parseIsolateBindings(directive.scope, directiveName, false);
                }
            }

            if (isObject(directive.bindToController)) {
                bindings.bindToController = parseIsolateBindings(directive.bindToController, directiveName, true);
            }

            if (isObject(bindings.bindToController)) {
                controller = directive.controller;
                controllerAs = directive.controllerAs;

                if (!controller) {
                    // There is no controller, there may or may not be a controllerAs property
                    throw $compileMinErr(
                        'noctrl',
                        "Cannot bind to controller without directive '{0}'s controller.",
                        directiveName
                    );
                } else if (!identifierForController(controller, controllerAs)) {
                    // There is a controller, but no identifier or controllerAs property
                    throw $compileMinErr(
                        'noident',
                        "Cannot bind to controller without identifier for directive '{0}'.",
                        directiveName
                    );
                }
            }
            return bindings;
        }

        function assertValidDirectiveName(name) {
            var letter = name.charAt(0);

            if (!letter || letter !== lowercase(letter)) {
                throw $compileMinErr(
                    'baddir',
                    "Directive name '{0}' is invalid. The first character must be a lowercase letter",
                    name
                );
            }

            if (name !== trim(name)) {
                throw $compileMinErr(
                    'baddir',
                    "Directive name '{0}' is invalid. The name should not contain leading or trailing whitespaces",
                    name
                );
            }
        }
  
        this.directive = function registerDirective(name, directiveFactory) {

            assertNotHasOwnProperty(name, 'directive');

            if (_.isString(name)) {

                if (vc) {
                    msos_debug(temp_cp + ' - directive -> start: ' + name);
                }

                assertValidDirectiveName(name);
                assertArg(directiveFactory, 'directiveFactory');

                if (!hasDirectives.hasOwnProperty(name)) {
                    hasDirectives[name] = [];
                    $provide.factory(name + Suffix, ['$injector', function ($injector) {
                        var directives = [];

                        forEach(hasDirectives[name], function (directiveFactory, index) {
                            var hd_bindings,
                                directive;

                                directive = $injector.invoke(directiveFactory);

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
                                // New part (v1.4.1)
                                hd_bindings = directive.$$bindings = parseDirectiveBindings(directive, directive.name);
                                if (isObject(hd_bindings.isolateScope)) {
                                    directive.$$isolateBindings = hd_bindings.isolateScope;
                                }
                                directive.$$moduleName = directiveFactory.$$moduleName;

                                directives.push(directive);
                        });
                        return directives;
                    }]);
                }
                hasDirectives[name].push(directiveFactory);

                if (vc) {
                    msos_debug(temp_cp + ' - directive ->  done: ' + name);
                }

            } else {
                if (vc) {
                    msos_debug(temp_cp + ' - directive -> start, reverseParams:', name);
                }

                forEach(name, reverseParams(registerDirective));

                if (vc) {
                    msos_debug(temp_cp + ' - directive ->  done, reverseParams:', name);
                }
            }

            return this;
        };

        this.component = function registerComponent(name, options) {
            var controller = options.controller || function () {};

            function factory($injector) {

                function makeInjectable(fn) {
                    if (_.isFunction(fn) || _.isArray(fn)) {
                        return function (tElement, tAttrs) {
                            return $injector.invoke(
                                        fn,
                                        this,
                                        { $element: tElement, $attrs: tAttrs }
                                    );
                        };
                    }

                    return fn;
                }

                var template = (!options.template && !options.templateUrl ? '' : options.template);

                return {
                    controller: controller,
                    controllerAs: identifierForController(options.controller) || options.controllerAs || '$ctrl',
                    template: makeInjectable(template),
                    templateUrl: makeInjectable(options.templateUrl),
                    transclude: options.transclude,
                    scope: {},
                    bindToController: options.bindings || {},
                    restrict: 'E',
                    require: options.require
                };
            }

            // Copy any annotation properties (starting with $) over to the factory function
            // These could be used by libraries such as the new component router
            forEach(
                options,
                function (val, key) {
                    if (key.charAt(0) === '$') { factory[key] = val; }
                }
            );

            factory.$inject = ['$injector'];

            return this.directive(name, factory);
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
            function ($injector, $interpolate, $templateRequest, $parse,
                     $controller, $rootScope, $sce, $animate, $$sanitizeUri) {

            var SIMPLE_ATTR_NAME = /^\w/,
                specialAttrHolder = document.createElement('div'),
                Attributes = function (element, attributesToCopy) {
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
                denormalizeTemplate = (startSymbol === '{{' && endSymbol === '}}')
                    ? identity
                    : function denormalizeTemplate(template) {
                        return template.replace(/\{\{/g, startSymbol).replace(/}}/g, endSymbol);
                    },
                NG_ATTR_BINDING = /^ngAttr[A-Z]/,
                MULTI_ELEMENT_DIR_RE = /^(.+)Start$/,
                applyDirectivesToNode = null,
                compile = null,
                compile_nodes_cnt = 0;

            msos_debug(temp_cp + ' - $get -> start.');

            function setSpecialAttr(element, attrName, value) {
                // Attributes names that do not start with letters (such as `(click)`) cannot be set using `setAttribute`
                // so we have to jump through some hoops to get such an attribute
                // https://github.com/angular/angular.js/pull/13318
                specialAttrHolder.innerHTML = "<span " + attrName + ">";

                var attributes = specialAttrHolder.firstChild.attributes,
                    attribute = attributes[0];

                // We have to remove the attribute from its container element before we can add it to the destination element
                attributes.removeNamedItem(attribute.name);
                attribute.value = value;
                element.attributes.setNamedItem(attribute);
            }

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

                    var temp_st = ' - $get - Attributes.$set -> ',
                        node = this.$$element[0],
                        booleanKey = getBooleanAttrName(node, key),
                        aliasedKey = getAliasedAttrName(key),
                        observer = key,
                        $$observers,
                        nodeName = nodeName_(this.$$element),
                        db_name_attr = ', node: ' + nodeName + ' attribute: ' + key,
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

                    if (vc) {
                        msos_debug(temp_cp + temp_st + 'start' + db_name_attr);
                    }

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

                    if ((nodeName === 'a' && (key === 'href' || key === 'xlinkHref'))
                     || (nodeName === 'img' && key === 'src')) {

                        if (vc) {
                            msos_debug(temp_cp + temp_st + 'unchecked' + db_name_attr + ': ' + value);
                        }

                        if (!(value === null || value === undefined)) {     // Skip since they null/undef are safe
                            // sanitize a[href] and img[src] values
                            this[key] = value = $$sanitizeUri(value, key === 'src');
                        }

                    } else if (nodeName === 'img' && key === 'srcset') {
                        // sanitize img[srcset] values
                        if (vc) {
                            msos_debug(temp_cp + temp_st + 'unchecked' + db_name_attr + ': ' + value);
                        }

                        if (!(value === null || value === undefined)) {     // Skip since they null/undef are safe
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
                    }

                    if (writeAttr !== false) {
                        if (value === null || _.isUndefined(value)) {
                            if (vc) {
                                msos_debug(temp_cp + temp_st + 'remove attribute' + db_name_attr);
                            }
                            this.$$element.removeAttr(attrName);
                        } else {
                            if (SIMPLE_ATTR_NAME.test(attrName)) {
                                this.$$element.attr(attrName, value);
                            } else {
                                setSpecialAttr(this.$$element[0], attrName, value);
                            }
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
                                    msos.console.error(temp_cp + temp_st + 'failed' + db_name_attr, e);
                                }
                            }
                        );
                    }

                    if (vc) {
                        msos_debug(temp_cp + temp_st + ' done' + db_name_attr);
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
                            if (!listeners.$$inter && attrs.hasOwnProperty(key) && !_.isUndefined(attrs[key])) {
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

                return nodeName_(node) !== 'foreignobject' && ngto_string.call(node).match(/SVG/) ? 'svg' : 'html';
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
                    },
                    boundSlots = boundTranscludeFn.$$slots = createMap(),
                    slotName;

                // We need  to attach the transclusion slots onto the `boundTranscludeFn`
                // so that they are available inside the `controllersBoundTransclude` function 
                for (slotName in transcludeFn.$$slots) {
                    if (transcludeFn.$$slots[slotName]) {
                        boundSlots[slotName] = createBoundTranscludeFn(
                            scope,
                            transcludeFn.$$slots[slotName],
                            previousBoundTranscludeFn
                        );
                    } else {
                        boundSlots[slotName] = null;
                    }
                }

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
            function addDirective(tDirectives, tAdded_directives, name, location, maxPriority, ignoreDirective, startAttrName, endAttrName) {

                var temp_ad = ' - $get - addDirective -> ',
                    db_out =  ' name: ' + name + ', for: ' + location,
                    match = null,
                    directive,
                    directives,
                    i = 0;

                if (vc) {
                    msos_debug(temp_cp + temp_ad + 'start,' + db_out, _.keys(tAdded_directives));
                }

                if (name === ignoreDirective) {
                    if (vc) {
                        msos_debug(temp_cp + temp_ad + ' done,' + db_out + ' ignored.');
                    }
                    return null;
                }

                if (hasDirectives.hasOwnProperty(name)) {

                    directives = $injector.get(name + Suffix);

                    for (i = 0; i < directives.length; i += 1) {

                        directive = directives[i];

                        if ((_.isUndefined(maxPriority) || maxPriority > directive.priority) && directive.restrict.indexOf(location) !== -1) {

                            if (startAttrName) {
                                directive = inherit(directive, {
                                    $$start: startAttrName,
                                    $$end: endAttrName
                                });
                            }

                            if (!tAdded_directives[directive.name]) {

                                tDirectives.push(directive);
                                match = directive;

                                // Record as an object
                                tAdded_directives[directive.name] = true;

                            } else {
                                db_out += ', already assigned.';
                            }
                        }
                    }

                    if (vc) {
                        msos_debug(temp_cp + temp_ad + ' done,' + db_out, _.keys(tAdded_directives));
                    }
                } else {
                    if (vc) {
                        msos_debug(temp_cp + temp_ad + ' done,' + db_out + ' is not available.');
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
                var temp_ai = ' - $get - addAttrInterpolateDirective -> ';

                if (vc) {
                    msos_debug(temp_cp + temp_ai + 'start, name: ' + name);
                }

                allOrNothing = ALL_OR_NOTHING_ATTRS[name] || allOrNothing;

                var trustedContext = getTrustedContext(node, name),
                    interpolateFn = $interpolate(value, true, trustedContext, allOrNothing);

                // no interpolation found -> ignore
                if (!interpolateFn) {
                    if (vc) {
                        msos_debug(temp_cp + temp_ai + ' done, name: ' + name + ', no interpolation function.');
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
                            pre: function attrInterpolatePreLinkFn(scope, element_na, attr) {
                                var $$observers,
                                    watch_scope,
                                    newValue;

                                if (!attr.$$observers) { attr.$$observers = createMap(); }

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
                                    if (newValue
                                     && newValue.length
                                     && NOT_EMPTY.test(newValue) === true) {
                                        interpolateFn = $interpolate(newValue, true, trustedContext, allOrNothing);
                                    }
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
                    msos_debug(temp_cp + temp_ai + ' done, name: ' + name);
                }
            }

            function addTextInterpolateDirective(directives, text) {
                var temp_at = ' - $get - addTextInterpolateDirective -> ',
                    interpolateFn;

                if (vc) {
                    msos_debug(temp_cp + temp_at + 'start.');
                }

                // Note: we only get here for non-whitespace character strings (works for 'true')
                interpolateFn = $interpolate(text, true);

                if (interpolateFn) {

                    if (vc) {
                        msos_debug(temp_cp + temp_at + 'add directive.');
                    }

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
                    msos_debug(temp_cp + temp_at + 'done!');
                }
            }

            function byPriority(a, b) {
                var diff = b.priority - a.priority;
                if (diff !== 0) { return diff; }
                if (a.name !== b.name) { return (a.name < b.name) ? -1 : 1; }
                return a.index - b.index;
            }

            function collectDirectives(node, node_directives, node_attrs, maxPriority, ignoreDirective) {

                var temp_cd = ' - $get - collectDirectives -> ',
                    node_type = node.nodeType,
                    node_name = nodeName_(node),
                    node_attrs_array,
                    node_ng_attrs_array = [],
                    node_added_directives = {},
                    node_norm_name = directiveNormalize(node_name),
                    node_class_name,
                    node_attrs_map = node_attrs.$attr,
                    attr,
                    at_name,
                    at_value,
                    at_ignore = false,
                    at_start_name = false,
                    at_end_name = false,
                    at_ng_name,
                    at_is_ng,
                    at_ng_name_final,
                    at_ng_name_class,
                    at_ng_name_comment,
                    j = 0,
                    jj = 0,
                    node_at_value,
                    multiElementMatch,
                    match,
                    directive_names = [];

                if (verbose) {
                    msos_debug(temp_cp + temp_cd + 'start, for: ' + node_norm_name);
                }

                switch (node_type) {

                    case NODE_TYPE_ELEMENT:
                        /* Element */
                        // use the node name: <directive>
//                        node_norm_name = directiveNormalize(node_name);

                        if (vc) {
                            msos_debug(temp_cp + temp_cd + 'type element, normalized name: ' + node_norm_name);
                        }

                        node_attrs_array = node.attributes;

                        if (node_attrs_array && node_attrs_array.length) { jj = node_attrs_array.length; }

                        for (j = 0; j < jj; j += 1) {

                            at_start_name = false;
                            at_end_name = false;

                            attr = node_attrs_array[j];

                            at_name = attr.name;
                            at_value = trim(attr.value);

                            // support ngAttr attribute binding
                            at_ng_name = directiveNormalize(at_name);

                            if (at_ng_name === 'ngIgnore') {
                                at_ignore = true;
                                // Set this so we can stop child elements too.
                                node_attrs_map[at_ng_name] = at_name;
                            }

                            if (!at_ignore) {   // Don't bother if ngIgnore

                                at_is_ng = NG_ATTR_BINDING.test(at_ng_name);
    
                                if (at_is_ng) {
                                    at_name = at_name.replace(
                                        PREFIX_REGEXP,
                                        ''
                                    ).substr(8).replace(
                                        /_(.)/g,
                                        function (match_na, letter) {
                                            return letter.toUpperCase();
                                        }
                                    );
                                }

                                multiElementMatch = at_ng_name.match(MULTI_ELEMENT_DIR_RE);

                                if (multiElementMatch
                                 && directiveIsMultiElement(multiElementMatch[1])) {
                                    at_start_name = at_name;
                                    at_end_name = at_name.substr(0, at_name.length - 5) + 'end';
                                    at_name = at_name.substr(0, at_name.length - 6);
                                }

                                // Get the final ng name (if mutiple element)
                                at_ng_name_final = directiveNormalize(at_name.toLowerCase());

                                node_attrs_map[at_ng_name_final] = at_name;

                                if (at_is_ng || !node_attrs.hasOwnProperty(at_ng_name_final)) {
                                    node_attrs[at_ng_name_final] = at_value;
                                    if (getBooleanAttrName(node, at_ng_name_final)) {
                                        node_attrs[at_ng_name_final] = true; // presence means true
                                    }
                                }

                                // Group our attribute names/values
                                node_ng_attrs_array.push({
                                    name:           at_name,
                                    value:          at_value,
                                    start_name:     at_start_name,
                                    end_name:       at_end_name,
                                    ng_name_final:  at_ng_name_final,
                                    is_ng:          at_is_ng
                                });
                            }
                        }

                        if (!at_ignore) {

                            if (vc) {
                                msos_debug(temp_cp + temp_cd + 'type element, add element name directive: ' + at_ng_name_final + ':' + node_norm_name);
                            }

                            addDirective(
                                node_directives,
                                node_added_directives,
                                node_norm_name,
                                'E',
                                maxPriority,
                                ignoreDirective
                            );

                            for (j = 0; j < jj; j += 1) {

                                if (vc) {
                                    msos_debug(temp_cp + temp_cd + 'type element, add attribute directive: ' + at_ng_name_final + ', at_is_ng: ' + at_is_ng);
                                }

                                if (node_ng_attrs_array[j].value
                                 && node_ng_attrs_array[j].value.length
                                 && NOT_EMPTY.test(node_ng_attrs_array[j].value) === true) {
                                    addAttrInterpolateDirective(
                                        node,
                                        node_directives,
                                        node_ng_attrs_array[j].value,
                                        node_ng_attrs_array[j].ng_name_final,
                                        node_ng_attrs_array[j].is_ng
                                    );
                                }

                                addDirective(
                                    node_directives,
                                    node_added_directives,
                                    node_ng_attrs_array[j].ng_name_final,
                                    'A',
                                    maxPriority,
                                    ignoreDirective,
                                    node_ng_attrs_array[j].start_name,
                                    node_ng_attrs_array[j].end_name
                                );
                            }

                            // Use class as directive
                            node_class_name = node.className;

                            if (_.isObject(node_class_name)) {
                                // Maybe SVGAnimatedString
                                node_class_name = node_class_name.animVal;
                            }

                            if (_.isString(node_class_name) && node_class_name !== '') {
                                // initial value
                                match = CLASS_DIRECTIVE_REGEXP.exec(node_class_name);

                                while (match) {
                                    at_ng_name_class = directiveNormalize(match[2]);

                                    if (addDirective(node_directives, node_added_directives, at_ng_name_class, 'C', maxPriority, ignoreDirective)) {

                                        node_attrs[at_ng_name_class] = trim(match[3]);
                                    }

                                    node_class_name = node_class_name.substr(match.index + match[0].length);

                                    // for next interation
                                    match = CLASS_DIRECTIVE_REGEXP.exec(node_class_name);
                                }
                            }
                        } else {
                            msos_debug(temp_cp + temp_cd + 'type element, skipped: ' + node_name + ', for: ngIgnore');
                        }
                    break;

                    case NODE_TYPE_TEXT:
                        /* Text Node */
                        if (msie === 11) {
                            // Workaround for #11781 (still dealing with ie shit even a v11!)
                            while (node.parentNode && node.nextSibling && node.nextSibling.nodeType === NODE_TYPE_TEXT) {
                                node.nodeValue = node.nodeValue + node.nextSibling.nodeValue;
                                node.parentNode.removeChild(node.nextSibling);
                            }
                        }

                        // Ckeck for some non-whitespace charaters
                        if (node.nodeValue.length && NOT_EMPTY.test(node.nodeValue) === true) {
                            addTextInterpolateDirective(node_directives, node.nodeValue);
                        }
                    break;

                    case NODE_TYPE_COMMENT:
                        /* Comment */
                        try {
                            match = COMMENT_DIRECTIVE_REGEXP.exec(node.nodeValue);
                            if (match) {
                                at_ng_name_comment = directiveNormalize(match[1]);

                                if (addDirective(node_directives, node_added_directives, at_ng_name_comment, 'M', maxPriority, ignoreDirective)) {

                                    node_attrs[at_ng_name_comment] = trim(match[2]);
                                }
                            }
                        } catch (ignore) {
                            // turns out that under some circumstances IE9 throws errors when one attempts to read comment's node value.
                            msos.console.warn(temp_cp + temp_cd + 'failed to read comment node (IE9???)');
                        }
                    break;
                }

                node_directives.sort(byPriority);

                if (verbose) {
                    forEach(
                        node_directives,
                        function (d_obj) { directive_names.push(d_obj.name || (d_obj.compile ? 'compile' : 'na')); }
                    );
                    msos_debug(temp_cp + temp_cd + ' done, for: ' + node_name + ', directives:', directive_names);
                }

                return node_directives;
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

            function compilationGenerator(eager, $compileNodes, transcludeFn, maxPriority, ignoreDirective, previousCompileContext) {
                var compiled;

                if (eager) {
                    return compile(
                        $compileNodes,
                        transcludeFn,
                        maxPriority,
                        ignoreDirective,
                        previousCompileContext
                    );
                }

                return function () {
                    if (!compiled) {
                        compiled = compile(
                            $compileNodes,
                            transcludeFn,
                            maxPriority,
                            ignoreDirective,
                            previousCompileContext
                        );

                        // Null out all of these references in order to make them eligible for garbage collection
                        // since this is a potentially long lived closure
                        $compileNodes = transcludeFn = previousCompileContext = null;
                    }

                    return compiled.apply(this, arguments);
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

            function markDirectiveScope(directives, isolateScope, newScope) {
                var j = 0,
                    jj = 0;

                for (j = 0, jj = directives.length; j < jj; j += 1) {
                    directives[j] = inherit(
                        directives[j],
                        {
                            $$isolateScope: isolateScope,
                            $$newScope: newScope
                        }
                    );
                }
            }

            function assertNoDuplicate(what, previousDirective, directive, element) {
                var temp_an = ' - $get - assertNoDuplicate -> ',
                    output_err;

                if (verbose) {
                    msos_debug(temp_cp + temp_an + 'called, directive: ' + directive.name + ' vs. previous: ' + (previousDirective ? previousDirective.name : 'na') + ', for: ' + what);
                }

                function wrapModuleNameIfDefined(moduleName) {
                    return moduleName ? (' (module: ' + moduleName + ')') : '';
                }

                if (previousDirective) {
                    output_err = $compileMinErr(
                        'multidir',
                        'Multiple directives [{0}{1}, {2}{3}] asking for {4} on: {5}',
                        previousDirective.name,
                        wrapModuleNameIfDefined(previousDirective.$$moduleName),
                        directive.name,
                        wrapModuleNameIfDefined(directive.$$moduleName),
                        what,
                        startingTag(element)
                    );

                    msos.console.error(temp_cp + temp_an + what + '\n' + output_err);
                }
            }

            function invokeLinkFn(linkFn, scope, $element, attrs, controllers, transcludeFn, pre_post) {
                try {
                    linkFn(scope, $element, attrs, controllers, transcludeFn);
                } catch (e) {
                    msos.console.error(temp_cp + ' - $get - invokeLinkFn -> ' + pre_post + ' failed, tag: ' + startingTag($element), e);
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
                    fragment;

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

                // Append all the `elementsToRemove` to a fragment. This will...remove them from the DOM, allow them to still be traversed with .nextSibling
                // and allow a single fragment.qSA to fetch all elements being removed
                fragment = document.createDocumentFragment();

                for (i = 0; i < removeCount; i += 1) {
                    fragment.appendChild(elementsToRemove[i]);
                }

                if (jqLite.hasData(firstElementToRemove)) {
                    jqLite.data(newNode, jqLite.data(firstElementToRemove));
                    jqLite(firstElementToRemove).off('$destroy');
                }

                // Cleanup any data/listeners on the elements and children.
                // This includes invoking the $destroy event on any elements with listeners.
                jqLite.cleanData(fragment.querySelectorAll('*'));

                // Update the jqLite collection to only contain the `newNode`
                for (i = 1; i < removeCount; i += 1) {
                    delete elementsToRemove[i];
                }

                elementsToRemove[0] = newNode;
                elementsToRemove.length = 1;
            }

            function compileNodes(nodeList, transcludeFn, $rootElement, maxPriority, ignoreDirective, previousCompileContext_cn) {

                compile_nodes_cnt += 1;

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
                    node_name,
                    l = 0,
                    m = String(compile_nodes_cnt);

                if (verbose) {
                    msos_debug(temp_cp + temp_cn + 'start, iteration: ' + m);
                }

                for (l = 0; l < nodeList.length; l += 1) {

                    node_name = nodeName_(nodeList[l]);

                    // We don't want to process these, ever!
                    if (node_name !== 'head') {

                        attrs = new Attributes();

                        // we must always refer to nodeList[l] since the nodes can be replaced underneath us.
                        directives = collectDirectives(nodeList[l], [], attrs, l === 0 ? maxPriority : undefined, ignoreDirective);

                        nodeLinkFn_cN = (directives.length)
                            ? applyDirectivesToNode(
                                directives,
                                nodeList[l],
                                attrs,
                                transcludeFn,
                                $rootElement,
                                null,
                                [],
                                [],
                                previousCompileContext_cn
                            )
                            : null;

                        if (nodeLinkFn_cN && nodeLinkFn_cN.scope) {
                            if (vc) {
                                debug_cn.push(node_name + ' - add scope class (node: ' + l + ')');
                            }
                            compile.$$addScopeClass(attrs.$$element);
                        }

                        childNodes = nodeList[l].childNodes;

                        childLinkFn_cN = (attrs.$attr.ngIgnore || (nodeLinkFn_cN && nodeLinkFn_cN.terminal) || !childNodes || !childNodes.length)
                            ? null
                            : compileNodes(
                                childNodes,
                                nodeLinkFn_cN
                                    ? ((nodeLinkFn_cN.transcludeOnThisElement || !nodeLinkFn_cN.templateOnThisElement) && nodeLinkFn_cN.transclude)
                                    : transcludeFn
                            );

                        if (nodeLinkFn_cN || childLinkFn_cN) {
                            if (vc) {
                                debug_cn.push(node_name + ' - node or child link func. (node: ' + l + ')');
                            }
                            linkFns.push(l, nodeLinkFn_cN, childLinkFn_cN);
                            linkFnFound = true;
                            nodeLinkFnFound = nodeLinkFnFound || nodeLinkFn_cN;
                        }

                        // use the previous context only for the first element in the virtual group
                        previousCompileContext_cn = {};   // ???? {}
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
                                    scope, nodeLinkFn_cLF.transclude, parentBoundTranscludeFn
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

                if (verbose) {
                        msos_debug(temp_cp + temp_cn + ' done, iteration: ' + m + (debug_cn.length ? ',\n     ' + debug_cn.join(',\n     ') : ''));
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

                msos_debug(temp_cp + temp_ct + ' -> start.');

                $compileNode.empty();

                $templateRequest(templateUrl).then(
                    function (content) {
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

                        msos_debug(temp_cp + temp_ct + ' - $templateRequest (then) -> start,\n     template: ' + templateUrl);

                        content = denormalizeTemplate(content);

                        if (origAsyncDirective.replace) {
                            msos_debug(temp_cp + temp_ct + ' - $templateRequest (then) -> replace');

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
                                // the original directive that caused the template to be loaded async required
                                // an isolate scope
                                markDirectiveScope(templateDirectives_suc, true);
                            }
                            directives = templateDirectives_suc.concat(directives);
                            mergeTemplateAttributes(tAttrs, tempTemplateAttrs);
                        } else {
                            msos_debug(temp_cp + temp_ct + ' - $templateRequest (then) -> insert content');

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
                            afterTemplateNodeLinkFn(
                                afterTemplateChildLinkFn,
                                scope,
                                linkNode,
                                $rootElement,
                                childBoundTranscludeFn
                            );
                        }

                        linkQueue = null;

                        msos_debug(temp_cp + temp_ct + ' - $templateRequest (then) ->  done,\n     template: ' + templateUrl);
                    }
                );

                msos_debug(temp_cp + temp_ct + ' -> done!');

                return function delayedNodeLinkFn(ignoreChildLinkFn_na, scope, node, rootElement, boundTranscludeFn) {
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

                        afterTemplateNodeLinkFn(
                            afterTemplateChildLinkFn,
                            scope,
                            node,
                            rootElement,
                            childBoundTranscludeFn
                        );
                    }
                };
            }

            // Using var applyDirectivesToNode is way faster since order of declaration is correct
            applyDirectivesToNode = function (directives, compileNode, templateAttrs, transcludeFn, jqCollection, originalReplaceDirective, preLinkFns, postLinkFns, previousCompileContext_apply) {

                previousCompileContext_apply = previousCompileContext_apply || {};

                var temp_ap = ' - $get - applyDirectivesToNode',
                    $compileNode = jqLite(compileNode),
                    comp_node_class = compileNode.classList && compileNode.classList.length ? ' (' + compileNode.classList + ')' : '',
                    comp_node_name = lowercase(compileNode.nodeName) + comp_node_class,
                    i = 0,
                    ii = 0,
                    terminalPriority = -Number.MAX_VALUE,
                    newScopeDirective = previousCompileContext_apply.newScopeDirective,
                    controllerDirectives = previousCompileContext_apply.controllerDirectives,
                    newIsolateScopeDirective = previousCompileContext_apply.newIsolateScopeDirective,
                    templateDirective = previousCompileContext_apply.templateDirective,
                    nonTlbTranscludeDirective = previousCompileContext_apply.nonTlbTranscludeDirective,
                    hasTranscludeDirective = false,
                    hasTemplate = false,
                    hasElementTranscludeDirective = previousCompileContext_apply.hasElementTranscludeDirective,
                    directive,
                    directiveName,
                    $template,
                    replaceDirective = originalReplaceDirective,
                    childTranscludeFn = transcludeFn,
                    linkFn,
                    didScanForMultipleTransclusion = false,
                    mightHaveMultipleTransclusionError = false,
                    candidateDirective,
                    scanningIndex,
                    directiveValue,
                    attrStart,
                    attrEnd,
                    newTemplateAttrs,
                    templateDirectives,
                    unprocessedDirectives,
                    slots,
                    slotMap,
                    filledSlots,
                    slotName;

                msos_debug(temp_cp + temp_ap + ' -> start, node: ' + comp_node_name + ', context:', previousCompileContext_apply);

                templateAttrs.$$element = $compileNode;

                // executes all directives on the current element
                ii = directives.length;

                // Start: defining functions for applyDirectivesToNode
                function getControllers(directiveName, require, $element, elementControllers) {
                    var value,
                        match,
                        name,
                        inheritType,
                        optional,
                        dataName,
                        i = 0;

                    if (_.isString(require)) {

                        match = require.match(REQUIRE_PREFIX_REGEXP);
                        name = require.substring(match[0].length);
                        inheritType = match[1] || match[3];
                        optional = match[2] === '?';

                        // If only parents then start at the parent element
                        if (inheritType === '^^') {
                            $element = $element.parent();
                            // Otherwise attempt getting the controller from elementControllers in case
                            // the element is transcluded (and has no data) and to avoid .data if possible
                        } else {
                            if (elementControllers)         { value = elementControllers[name] || ''; }
                            if (value && value.instance)    { value = value.instance; }
                        }

                        if (!value) {
                            dataName = '$' + name + 'Controller';
                            value = inheritType ? $element.inheritedData(dataName) : $element.data(dataName);
                        }

                        if (!value && !optional) {
                            throw $compileMinErr(
                                'ctreq',
                                "Controller '{0}', required by directive '{1}', can't be found!",
                                name,
                                directiveName
                            );
                        }

                    } else if (_.isArray(require)) {
                        value = [];

                        for (i = 0; i < require.length; i += 1) {
                            value[i] = getControllers(directiveName, require[i], $element, elementControllers);
                        }
                    } else if (isObject(require)) {
                        value = {};

                        forEach(
                            require,
                            function (controller, property) {
                                value[property] = getControllers(
                                    directiveName,
                                    controller,
                                    $element,
                                    elementControllers
                                );
                            }
                        );
                    }

                    return value || null;
                }

                function setupControllers($element, attrs, transcludeFn, controllerDirectives, isolateScope, scope) {
                    var elementControllers = createMap(),
                        controllerKey,
                        directive,
                        locals = {},
                        controller,
                        controllerInstance;

                    for (controllerKey in controllerDirectives) {   // hasOwnProperty() na in controllerDirectives 

                        directive = controllerDirectives[controllerKey];
                        locals = {
                            $scope: directive === newIsolateScopeDirective || directive.$$isolateScope ? isolateScope : scope,
                            $element: $element,
                            $attrs: attrs,
                            $transclude: transcludeFn
                        };

                        controller = directive.controller;

                        if (controller === '@') { controller = attrs[directive.name]; }

                        controllerInstance = $controller(controller, locals, true, directive.controllerAs);

                        elementControllers[directive.name] = controllerInstance;

                        if (!hasElementTranscludeDirective) {
                            $element.data('$' + directive.name + 'Controller', controllerInstance.instance);
                        }
                    }

                    return elementControllers;
                }

                // Set up $watches for isolate scope and controller bindings. This process
                // only occurs for isolate scopes and new scopes with controllerAs.
                function initializeDirectiveBindings(scope, attrs, destination, bindings, directive) {
                    var removeWatchCollection = [];

                    forEach(bindings, function (definition, scopeName) {
                        var attrName = definition.attrName,
                            optional = definition.optional,
                            mode = definition.mode, // @, =, or &
                            lastValue,
                            parentGet,
                            parentSet,
                            compare,
                            parentValueWatch,
                            removeWatch;

                        switch (mode) {

                            case '@':
                                if (!optional && !hasOwnProperty.call(attrs, attrName)) {
                                    destination[scopeName] = attrs[attrName] = void 0;
                                }

                                attrs.$observe(attrName, function (value) {
                                    if (_.isString(value)) {
                                        destination[scopeName] = value;
                                    }
                                });

                                attrs.$$observers[attrName].$$scope = scope;
                                lastValue = attrs[attrName];

                                if (_.isString(lastValue)) {
                                    // If the attribute has been provided then we trigger an interpolation to ensure
                                    // the value is there for use in the link fn
                                    destination[scopeName] = $interpolate(lastValue)(scope);
                                } else if (_.isBoolean(lastValue)) {
                                    // If the attributes is one of the BOOLEAN_ATTR then Angular will have converted
                                    // the value to boolean rather than a string, so we special case this situation
                                    destination[scopeName] = lastValue;
                                }
                            break;

                            case '=':

                                if (!hasOwnProperty.call(attrs, attrName)) {
                                    if (optional) { break; }
                                    attrs[attrName] = void 0;
                                }

                                if (optional && !attrs[attrName]) { break; }

                                parentGet = $parse(attrs[attrName]);

                                if (parentGet.literal) {
                                    compare = equals;
                                } else {
                                    compare = function (a, b) { return a === b || (a !== a && b !== b); };
                                }

                                parentSet = parentGet.assign || function () {
                                    // reset the change, or we will throw this exception on every $digest
                                    lastValue = destination[scopeName] = parentGet(scope);

                                    throw $compileMinErr(
                                        'nonassign',
                                        "Expression '{0}' in attribute '{1}' used with directive '{2}' is non-assignable!",
                                        attrs[attrName],
                                        attrName,
                                        directive.name
                                    );
                                };

                                lastValue = destination[scopeName] = parentGet(scope);

                                parentValueWatch = function parentValueWatch (parentValue) {
                                    if (!compare(parentValue, destination[scopeName])) {
                                        // we are out of sync and need to copy
                                        if (!compare(parentValue, lastValue)) {
                                            // parent changed and it has precedence
                                            destination[scopeName] = parentValue;
                                        } else {
                                            // if the parent can be assigned then do so
                                            parentSet(scope, parentValue = destination[scopeName]);
                                        }
                                    }

                                    lastValue = parentValue;

                                    return lastValue;
                                };

                                parentValueWatch.$stateful = true;

                                if (definition.collection) {
                                    removeWatch = scope.$watchCollection(attrs[attrName], parentValueWatch);
                                } else {
                                    removeWatch = scope.$watch($parse(attrs[attrName], parentValueWatch), null, parentGet.literal);
                                }

                                removeWatchCollection.push(removeWatch);
                            break;

                            case '<':
                                if (!hasOwnProperty.call(attrs, attrName)) {
                                    if (optional) break;
                                    attrs[attrName] = void 0;
                                }

                                if (optional && !attrs[attrName]) { break; }

                                parentGet = $parse(attrs[attrName]);
                                destination[scopeName] = parentGet(scope);

                                removeWatch = scope.$watch(
                                    parentGet,
                                    function parentValueWatchAction(newParentValue) {
                                        destination[scopeName] = newParentValue;
                                    },
                                    parentGet.literal
                                );

                                removeWatchCollection.push(removeWatch);
                            break;

                            case '&':
                                // Don't assign Object.prototype method to scope
                                parentGet = attrs.hasOwnProperty(attrName) ? $parse(attrs[attrName]) : noop;

                                // Don't assign noop to destination if expression is not valid
                                if (parentGet === noop && optional) { break; }

                                destination[scopeName] = function (locals) {
                                    return parentGet(scope, locals);
                                };
                            break;
                        }
                    });

                    return removeWatchCollection.length && function removeWatches() {
                        var i = 0,
                            ii = 0;

                        for (i = 0, ii = removeWatchCollection.length; i < ii; i += 1) {
                            removeWatchCollection[i]();
                        }
                    };
                }

                function nodeLinkFn(childLinkFn, scope, linkNode, $rootElement_na, boundTranscludeFn) {
                    var k = 0,
                        kk = 0,
                        linkFn_nLF,
                        isolateScope,
                        controllerScope,
                        elementControllers,
                        transcludeFn_nLF,
                        $element,
                        attrs,
                        removeScopeBindingWatches,
                        removeControllerBindingWatches,
                        ctrlr_key,
                        controllerDirective,
                        controller,
                        bindings,
                        controllerResult,
                        scopeToChild;

                    // This is the function that is injected as `$transclude`.
                    // Note: all arguments are optional!
                    function controllersBoundTransclude(scope, cloneAttachFn, futureParentElement, cbt_slotName) {
                        var transcludeControllers,
                            slotTranscludeFn;

                        // No scope passed in:
                        if (!isScope(scope)) {
                            cbt_slotName = futureParentElement;
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

                        if (cbt_slotName) {
                            // slotTranscludeFn can be one of three things:
                            //  * a transclude function - a filled slot, `null` - an optional slot that was not filled, `undefined` - a slot that was not declared (i.e. invalid)
                            slotTranscludeFn = boundTranscludeFn.$$slots[cbt_slotName];

                            if (slotTranscludeFn) {
                                return slotTranscludeFn(
                                        scope,
                                        cloneAttachFn,
                                        transcludeControllers,
                                        futureParentElement,
                                        scopeToChild
                                    );
                            }

                            if (_.isUndefined(slotTranscludeFn)) {
                                throw $compileMinErr(
                                        'noslot',
                                        'No parent directive that requires a transclusion with slot name "{0}". ' + 'Element: {1}',
                                        cbt_slotName,
                                        startingTag($element)
                                    );
                            }
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

                    controllerScope = scope;

                    if (newIsolateScopeDirective) {
                        isolateScope = scope.$new(true);
                    } else if (newScopeDirective) {
                        controllerScope = scope.$parent;
                    }

                    if (boundTranscludeFn) {
                        // track `boundTranscludeFn` so it can be unwrapped if `transcludeFn`
                        // is later passed as `parentBoundTranscludeFn` to `publicLinkFn`
                        transcludeFn_nLF = controllersBoundTransclude;
                        transcludeFn_nLF.$$boundTransclude = boundTranscludeFn;
                        // expose the slots on the `$transclude` function
                        transcludeFn_nLF.isSlotFilled = function (nLF_slotName) {
                            return !!boundTranscludeFn.$$slots[nLF_slotName];
                        };
                    }

                    if (controllerDirectives) {
                        elementControllers = setupControllers($element, attrs, transcludeFn_nLF, controllerDirectives, isolateScope, scope);
                    }

                    if (newIsolateScopeDirective) {
                        // Initialize isolate scope bindings for new isolate scope directive.
                        compile.$$addScopeInfo($element, isolateScope, true, !(templateDirective && (templateDirective === newIsolateScopeDirective || templateDirective === newIsolateScopeDirective.$$originalDirective)));

                        compile.$$addScopeClass($element, true);

                        isolateScope.$$isolateBindings = newIsolateScopeDirective.$$isolateBindings;

                        removeScopeBindingWatches = initializeDirectiveBindings(
                            scope,
                            attrs,
                            isolateScope,
                            isolateScope.$$isolateBindings,
                            newIsolateScopeDirective
                        );

                        if (removeScopeBindingWatches) {
                            isolateScope.$on('$destroy', removeScopeBindingWatches);
                        }
                    }

                    // Initialize bindToController bindings
                    for (ctrlr_key in elementControllers) {     // hasOwnProperty() na in elementControllers

                        controllerDirective = controllerDirectives[ctrlr_key];
                        controller = elementControllers[ctrlr_key];
                        bindings = controllerDirective.$$bindings.bindToController;

                        if (controller.identifier && bindings) {
                            removeControllerBindingWatches = initializeDirectiveBindings(
                                controllerScope,
                                attrs,
                                controller.instance,
                                bindings,
                                controllerDirective
                            );
                        }

                        controllerResult = controller();

                        if (controllerResult !== controller.instance) {
                            // If the controller constructor has a return value, overwrite the instance
                            // from setupControllers
                            controller.instance = controllerResult;
                            $element.data('$' + controllerDirective.name + 'Controller', controllerResult);

                            if (removeControllerBindingWatches) { removeControllerBindingWatches(); }

                            removeControllerBindingWatches = initializeDirectiveBindings(
                                controllerScope,
                                attrs,
                                controller.instance,
                                bindings,
                                controllerDirective
                            );
                        }
                    }

                    // Bind the required controllers to the controller, if `require` is an object and `bindToController` is truthy
                    forEach(
                        controllerDirectives,
                        function (controllerDirective, name) {
                            var require = controllerDirective.require;

                            if (controllerDirective.bindToController
                              && !_.isArray(require)
                              && isObject(require)) {
                                extend(
                                    elementControllers[name].instance,
                                    getControllers(name, require, $element, elementControllers)
                                );
                            }
                        }
                    );

                    // Trigger the `$onInit` method on all controllers that have one
                    forEach(
                        elementControllers,
                        function (controller) {
                            if (_.isFunction(controller.instance.$onInit)) {
                                controller.instance.$onInit();
                            }
                        }
                    );

                    // PRELINKING
                    for (k = 0, kk = preLinkFns.length; k < kk; k += 1) {
                        linkFn_nLF = preLinkFns[k];

                        invokeLinkFn(
                            linkFn_nLF,
                            linkFn_nLF.isolateScope ? isolateScope : scope,
                            $element,
                            attrs,
                            linkFn_nLF.require && getControllers(
                                linkFn_nLF.directiveName,
                                linkFn_nLF.require,
                                $element,
                                elementControllers
                            ),
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
                        msos_debug(temp_cp + temp_ap + ' -> processing directive value.');

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

                    // If we encounter a condition that can result in transclusion on the directive,
                    // then scan ahead in the remaining directives for others that may cause a multiple
                    // transclusion error to be thrown during the compilation process.  If a matching directive
                    // is found, then we know that when we encounter a transcluded directive, we need to eagerly
                    // compile the `transclude` function rather than doing it lazily in order to throw
                    // exceptions at the correct time
                    if (!didScanForMultipleTransclusion
                     && ((directive.replace && (directive.templateUrl || directive.template))
                     || (directive.transclude && !directive.$$tlb))) {

                        for (scanningIndex = i + 1; scanningIndex < directives.length; scanningIndex += 1) {
                            candidateDirective = directives[scanningIndex];

                            if ((candidateDirective.transclude && !candidateDirective.$$tlb)
                             || (candidateDirective.replace && (candidateDirective.templateUrl || candidateDirective.template))) {
                                mightHaveMultipleTransclusionError = true;
                                break;
                            }
                        }

                        didScanForMultipleTransclusion = true;
                    }

                    if (!directive.templateUrl && directive.controller) {
                        directiveValue = directive.controller;
                        controllerDirectives = controllerDirectives || createMap();

                        msos_debug(temp_cp + temp_ap + ' -> waiting for template, controller ready: ' + directiveName);

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

                        msos_debug(temp_cp + temp_ap + ' -> processing transclusion: ' + directiveName);

                        if (!directive.$$tlb) {

                            msos_debug(temp_cp + temp_ap + ' -> processing $$tlb (false): ' + directiveName);

                            assertNoDuplicate(
                                'transclusion $$tlb (false)',
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

                            msos_debug(temp_cp + temp_ap + ' -> processing template (element): ' + directiveName);

                            childTranscludeFn = compilationGenerator(
                                mightHaveMultipleTransclusionError,
                                $template,
                                transcludeFn,
                                terminalPriority,
                                replaceDirective && replaceDirective.name,
                                { nonTlbTranscludeDirective: nonTlbTranscludeDirective }
                            );

                        } else {

                            msos_debug(temp_cp + temp_ap + ' -> processing template (contents): ' + directiveName);

                            slots = createMap();

                            $template = jqLite(jqLiteClone(compileNode)).contents();

                            if (_.isObject(directiveValue)) {

                                // We have transclusion slots, collect them up, compile them and store their transclusion functions
                                $template = [];

                                slotMap = createMap();
                                filledSlots = createMap();

                                // Parse the element selectors
                                forEach(
                                    directiveValue,
                                    function (elementSelector, in_slot_name) {
                                        // If an element selector starts with a ? then it is optional
                                        var optional = (elementSelector.charAt(0) === '?');

                                        elementSelector = optional ? elementSelector.substring(1) : elementSelector;

                                        slotMap[elementSelector] = in_slot_name;

                                        // We explicitly assign `null` since this implies that a slot was defined but not filled.
                                        // Later when calling boundTransclusion functions with a slot name we only error if the
                                        // slot is `undefined`
                                        slots[in_slot_name] = null;

                                        // filledSlots contains `true` for all slots that are either optional or have been
                                        // filled. This is used to check that we have not missed any required slots
                                        filledSlots[in_slot_name] = optional;
                                    }
                                );

                                // Add the matching elements into their slot
                                forEach(
                                    $compileNode.contents(),
                                    function (node) {
                                        var cnc_slot_name = slotMap[directiveNormalize(nodeName_(node))];

                                        if (cnc_slot_name) {
                                            filledSlots[cnc_slot_name] = true;
                                            slots[cnc_slot_name] = slots[cnc_slot_name] || [];
                                            slots[cnc_slot_name].push(node);
                                        } else {
                                            $template.push(node);
                                        }
                                    }
                                );

                                // Check for required slots that were not filled
                                forEach(
                                    filledSlots,
                                    function (filled, fill_slot_name) {
                                        if (!filled) {
                                            throw $compileMinErr(
                                                'reqslot',
                                                'Required transclusion slot `{0}` was not filled.',
                                                fill_slot_name
                                            );
                                        }
                                    }
                                );

                                for (slotName in slots) {
                                    if (slots[slotName]) {
                                        // Only define a transclusion function if the slot was filled
                                        slots[slotName] = compilationGenerator(mightHaveMultipleTransclusionError, slots[slotName], transcludeFn);
                                    }
                                }
                            }

                            $compileNode.empty();   // clear contents

                            childTranscludeFn = compilationGenerator(
                                mightHaveMultipleTransclusionError,
                                $template,
                                transcludeFn,
                                undefined,
                                undefined,
                                { needsNewScope: directive.$$isolateScope || directive.$$newScope }
                            );

                            childTranscludeFn.$$slots = slots;
                        }
                    }

                    if (directive.template) {
                        hasTemplate = true;

                        msos_debug(temp_cp + temp_ap + ' -> processing template (script): ' + directiveName);

                        if (!assertNoDuplicate('template (script)', templateDirective, directive, $compileNode)) {
                            templateDirective = directive;
                        }

                        directiveValue = (_.isFunction(directive.template))
                            ? directive.template($compileNode, templateAttrs)
                            : directive.template;

                        directiveValue = denormalizeTemplate(directiveValue);

                        if (directive.replace) {
                            replaceDirective = directive;
                            if (jqLiteIsTextNode(directiveValue)) {
                                $template = [];
                            } else {
                                $template = removeComments(
                                    wrapTemplate(directive.templateNamespace, trim(directiveValue))
                                );
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

                            msos_debug(temp_cp + temp_ap + ' -> template directives:', templateDirectives);

                            unprocessedDirectives = directives.splice(i + 1, directives.length - (i + 1));

                            if (newIsolateScopeDirective || newScopeDirective) {
                                markDirectiveScope(
                                    templateDirectives,
                                    newIsolateScopeDirective,
                                    newScopeDirective
                                );
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

                        msos_debug(temp_cp + temp_ap + ' -> processing template (url): ' + directiveName);

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
                                newScopeDirective:          (newScopeDirective !== directive) && newScopeDirective,
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
                            msos.console.error(temp_cp + temp_ap + ' -> failed, tag: ' + startingTag($compileNode) + ', directive: ' + directiveName, e);
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
                nodeLinkFn.templateOnThisElement = hasTemplate;
                nodeLinkFn.transclude = childTranscludeFn;

                previousCompileContext_apply.hasElementTranscludeDirective = hasElementTranscludeDirective;

                msos_debug(temp_cp + temp_ap + ' ->  done, node: ' + comp_node_name);

                // might be normal or delayed nodeLinkFn depending on if templateUrl is present
                return nodeLinkFn;
            };

            compile = function ($compileNodes, transcludeFn, maxPriority, ignoreDirective, previousCompileContext_compile) {
                var temp_c = ' - $get - compile -> ',
                    i = 0,
                    domNode,
                    compositeLinkFn_cpl,
                    namespace = null,
                    debug_out = [];

                msos.console.info(temp_cp + temp_c + 'start.');

                if (previousCompileContext_compile) {
                    msos_debug(temp_cp + temp_c + 'prev. context:', previousCompileContext_compile);
                }

                if (!($compileNodes instanceof jqLite)) {
                    $compileNodes = jqLite($compileNodes);
                }

                // We can not compile top level text elements since text nodes can be merged and we will
                // not be able to attach scope data to them, so we will wrap them in <span>
                for (i = 0; i < $compileNodes.length; i += 1) {
                    domNode = $compileNodes[i];

                    if (domNode.nodeType === NODE_TYPE_TEXT
                     && NOT_EMPTY.test(domNode.nodeValue) === true) {

                        $compileNodes[i] = document.createElement('span');

                        jqLiteWrapNode(
                            domNode,
                            $compileNodes[i]
                        );
                    }

                    debug_out.push(nodeName_(domNode));
                }

                msos.console.info(temp_cp + temp_c + 'do node(s): ' + debug_out.join(', '));

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

                msos.console.info(temp_cp + temp_c + 'done!');

                return function publicLinkFn(scope, cloneConnectFn, options) {

                    assertArg(scope, 'scope');

                    if (previousCompileContext_compile
                     && previousCompileContext_compile.needsNewScope) {
                        scope = scope.$parent.$new();
                    }

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
                    if (parentBoundTranscludeFn
                     && parentBoundTranscludeFn.$$boundTransclude) {
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
                        for (controllerName in transcludeControllers) {     // hasOwnProperty() na in transcludeControllers
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

            msos_debug(temp_cp + ' - $get -> done!');

            return compile;
        }];
    }

    $controllerMinErr = minErr('$controller');

    $CompileProvider.$inject = ['$provide', '$$sanitizeUriProvider'];

    function $ControllerProvider() {
        var temp_cp = 'ng - $ControllerProvider',
            controllers = {},
            globals = false;

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

                msos_debug(temp_cp + ' - $get - addIdentifier -> called for controller: ' + name + ', identifierf: ' + identifier);

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
                    controllerPrototype,
                    instantiate;

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

                    msos_debug(
                        temp_cp + ' - $get -> start, "' + expression + '"'
                      + (constructor ? ', constructor: ' + constructor : '')
                      + (identifier  ? ', identifier: '  + identifier  : '')
                      + ', later flag: ' + later
                    );

                    expression = controllers.hasOwnProperty(constructor)
                        ? controllers[constructor]
                        : getter(locals.$scope, constructor, true)
                            || (globals ? getter($window, constructor, true) : undefined);

                    assertArgFn(expression, constructor, true);

                } else {
                    msos_debug(temp_cp + ' - $get -> start, for expression object, later flag: ' + later);
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

                    instantiate = extend(
                        function () {
                            var result = $injector.invoke(expression, instance, locals, constructor);

                            msos_debug(temp_cp + ' - $get - instantiate -> called.');

                            if (result !== instance && (_.isObject(result))) {
                                instance = result;
                                if (identifier) {
                                    // If result changed, re-assign controllerAs value to scope.
                                    addIdentifier(locals, identifier, instance, constructor || expression.name);
                                }
                            }

                            return instance;
                        }, {
                            instance: instance,
                            identifier: identifier
                        }
                    );

                    msos_debug(temp_cp + ' - $get ->  done, later flag: ' + later);
                    return instantiate;
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

                msos_debug(temp_cp + ' - $get ->  done, later flag: ' + later);
                return instance;
            };
        }];
    }

    function $DocumentProvider() {
        this.$get = ['$window', function ($window) {
            return jqLite($window.document);
        }];
    }

    function $ExceptionHandlerProvider() {
        this.$get = ['$log', function ($log) {
            return function () {
                $log.error.apply($log, arguments);
            };
        }];
    }

    function $$ForceReflowProvider() {
        this.$get = ['$document', function ($document) {
            return function (domNode) {
                if (domNode) {
                    if (!domNode.nodeType && domNode instanceof jQuery) {
                        domNode = domNode[0];
                    }
                } else {
                    domNode = $document[0].body;
                }

                return domNode.offsetWidth + 1;
            };
        }];
    }

    function serializeValue(v) {
        if (isObject(v)) {
            return _.isDate(v) ? v.toISOString() : toJson(v);
        }

        return v;
    }

    function $HttpParamSerializerProvider() {

        this.$get = function () {
            return function ngParamSerializer(params) {
                if (!params) { return ''; }

                var parts = [];

                forEachSorted(params, function (value, key) {
                    if (value === null || _.isUndefined(value)) { return; }

                    if (_.isArray(value)) {
                        forEach(value, function (v, k_na) {
                            parts.push(encodeUriQuery(key)  + '=' + encodeUriQuery(serializeValue(v)));
                        });
                    } else {
                        parts.push(encodeUriQuery(key) + '=' + encodeUriQuery(serializeValue(value)));
                    }
                });

                return parts.join('&');
            };
        };
    }

    function $HttpParamSerializerJQLikeProvider() {

        this.$get = function () {

            return function jQueryLikeParamSerializer(params) {
                var parts = [];

                if (!params) { return ''; }

                function serialize(toSerialize, prefix, topLevel) {
                    if (toSerialize === null || _.isUndefined(toSerialize)) { return; }
    
                    if (_.isArray(toSerialize)) {
                        forEach(toSerialize, function (value, index) {
                            serialize(value, prefix + '[' + (isObject(value) ? index : '') + ']');
                        });
                    } else if (isObject(toSerialize) && !_.isDate(toSerialize)) {
                        forEachSorted(toSerialize, function (value, key) {
                            serialize(value, prefix + (topLevel ? '' : '[') + key + (topLevel ? '' : ']'));
                        });
                    } else {
                        parts.push(encodeUriQuery(prefix) + '=' + encodeUriQuery(serializeValue(toSerialize)));
                    }
                }

                serialize(params, '', true);

                return parts.join('&');
            };
        };
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
        var parsed = createMap();

        function fillInParsed(key, val) {
            if (key) {
                parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
            }
        }

        if (_.isString(headers)) {

            forEach(headers.split('\n'), function (line) {
                var i = line.indexOf(':');

                fillInParsed(lowercase(trim(line.substr(0, i))), trim(line.substr(i + 1)));
            });

        } else if (isObject(headers)) {
            forEach(headers, function (headerVal, headerKey) {
                fillInParsed(lowercase(headerKey), trim(headerVal));
            });
        }

        return parsed;
    }

    function headersGetter(headers) {
        var headersObj;

        return function (name) {
            var value;

            if (!headersObj) { headersObj =  parseHeaders(headers); }

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
                post:   shallowCopy(CONTENT_TYPE_APPLICATION_JSON),
                put:    shallowCopy(CONTENT_TYPE_APPLICATION_JSON),
                patch:  shallowCopy(CONTENT_TYPE_APPLICATION_JSON)
            },

            xsrfCookieName: 'XSRF-TOKEN',
            xsrfHeaderName: 'X-XSRF-TOKEN',

            paramSerializer: '$httpParamSerializer'
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
            '$httpBackend', '$$cookieReader', '$cacheFactory', '$rootScope', '$q', '$injector',
            function ($httpBackend, $$cookieReader, $cacheFactory, $rootScope, $q, $injector) {

                var defaultCache = $cacheFactory('$http'),
                    reversedInterceptors = [];

                msos_debug(temp_hp + ' - $get -> start.');

                defaults.paramSerializer = _.isString(defaults.paramSerializer) ? $injector.get(defaults.paramSerializer) : defaults.paramSerializer;

                function buildUrl(url, serializedParams) {
                    if (serializedParams.length > 0) {
                        url += ((url.indexOf('?') === -1) ? '?' : '&') + serializedParams;
                    }

                    return url;
                }

                function $http(requestConfig) {
                    var temp_tt = ' - $get - $http';

                    if (!_.isObject(requestConfig)) {
                        throw minErr('$http')(
                            'badreq',
                            'Http request configuration must be an object. Received: {0}',
                            requestConfig
                        );
                    }
                    if (!_.isString(requestConfig.url)) {
                        throw minErr('$http')(
                            'badreq',
                            'Http request configuration url must be a string. Received: {0}',
                            requestConfig.url
                        );
                    }

                    msos_debug(temp_hp + temp_tt + ' -> start,\n    url: ' + requestConfig.url);

                    function executeHeaderFns(headers, config) {
                        var headerContent,
                            processedHeaders = {};

                        forEach(
                            headers,
                            function (headerFn, header) {
                                if (_.isFunction(headerFn)) {
                                    headerContent = headerFn(config);
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
                        var temp_mh = temp_tt + ' - mergeHeaders -> ',
                            defHeaders = defaults.headers,
                            reqHeaders = extend({}, config.headers),
                            defHeaderName,
                            lowercaseDefHeaderName,
                            reqHeaderName;

                        defHeaders = extend({}, defHeaders.common, defHeaders[lowercase(config.method)]);

                        // using for-in instead of forEach to avoid unecessary iteration after header has been found
                        defaultHeadersIteration: for (defHeaderName in defHeaders) {
                            if (defHeaders.hasOwnProperty(defHeaderName)) {

                                lowercaseDefHeaderName = lowercase(defHeaderName);

                                for (reqHeaderName in reqHeaders) {
                                    if (reqHeaders.hasOwnProperty(reqHeaderName)) {
                                        if (lowercase(reqHeaderName) === lowercaseDefHeaderName) {
                                            continue defaultHeadersIteration;
                                        }
                                    } else {
                                        msos.console.warn(temp_hp + temp_mh + 'skipped request header proto for: ' + reqHeaderName);
                                    }
                                }

                                reqHeaders[defHeaderName] = defHeaders[defHeaderName];

                            } else {
                                msos.console.warn(temp_hp + temp_mh + 'skipped proto for: ' + defHeaderName);
                            }
                        }

                        // execute if header value is a function for merged headers
                        return executeHeaderFns(reqHeaders, shallowCopy(config));
                    }

                    var config = extend(
                            {
                                method: 'get',
                                transformRequest: defaults.transformRequest,
                                transformResponse: defaults.transformResponse,
                                paramSerializer: defaults.paramSerializer
                            },
                            requestConfig
                        ),
                        serverRequest,
                        chain,
                        promise_$http,
                        chain_cnt = 0,
                        thenFn,
                        rejectFn;

                    config.headers = mergeHeaders(requestConfig);
                    config.method = uppercase(config.method);
                    config.paramSerializer = _.isString(config.paramSerializer) ? $injector.get(config.paramSerializer) : config.paramSerializer;

                    function transformResponse(response) {
                        // make a copy since the response must be cacheable
                        var resp = extend({}, response);

                        msos_debug(temp_hp + temp_tt + ' - transformResponse -> called.');

                        resp.data = transformData(response.data, response.headers, response.status, config.transformResponse);

                        return (isSuccess(response.status)) ? resp : $q.reject($q.defer('ng_reject_transformResponse'), resp);
                    }

                    serverRequest = function (config) {
                        var headers = config.headers,
                            reqData = transformData(config.data, headersGetter(headers), undefined, config.transformRequest);

                        // strip content-type if data is undefined
                        if (_.isUndefined(reqData)) {
                            forEach(
                                headers,
                                function (value_na, header) {
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

                            var deferred = $q.defer('ng_sendReq'),
                                promise_srq = deferred.promise,
                                cache,
                                cachedResp,
                                reqHeaders = config.headers,
                                url = buildUrl(config.url, config.paramSerializer(config.params)),
                                xsrfValue,
                                temp_sr = temp_tt + ' - serverRequest - sendReq';

                            msos_debug(temp_hp + temp_sr + ' -> start,\n     url: ' + url);

                            function resolvePromise(response, status, headers, statusText) {

                                msos_debug(temp_hp + temp_sr + ' - resolvePromise -> called.');

                                //status: HTTP response status code, 0, -1 (aborted by timeout / promise)
                                status = status >= -1 ? status : 0;

                                (isSuccess(status) ? deferred.resolve : deferred.reject)({
                                    data: response,
                                    status: status,
                                    headers: headersGetter(headers),
                                    config: config,
                                    statusText: statusText
                                });
                            }

                            function resolvePromiseWithResult(result) {
                                msos_debug(temp_hp + temp_sr + ' - resolvePromiseWithResult -> called.');

                                resolvePromise(
                                    result.data,
                                    result.status,
                                    shallowCopy(result.headers()),
                                    result.statusText
                                );
                            }

                            function done(status, response, headersString, statusText) {
                                var db_done = '';

                                msos.console.info(temp_hp + temp_sr + ' - done -> start,\n     url: ' + url + ',\n     phase: ' + $rootScope.$$phase);

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
                                msos.console.info(temp_hp + temp_sr + ' - done ->  done,\n     url: ' + url + ',\n     by: ' + db_done);
                            }

                            function removePendingReq() {

                                msos_debug(temp_hp + temp_sr + ' - removePendingReq -> called.');

                                var idx = $http.pendingRequests.indexOf(config);

                                if (idx !== -1) { $http.pendingRequests.splice(idx, 1); }
                            }

                            $http.pendingRequests.push(config);

                            msos_debug(temp_hp + temp_sr + ' -> set: promise_srq.then');

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
                                xsrfValue = urlIsSameOrigin(config.url) ? $$cookieReader()[config.xsrfCookieName || defaults.xsrfCookieName] : undefined;

                                if (xsrfValue) {
                                    reqHeaders[(config.xsrfHeaderName || defaults.xsrfHeaderName)] = xsrfValue;
                                }

                                $httpBackend(config.method, url, reqData, done, reqHeaders, config.timeout, config.withCredentials, config.responseType);
                            }

                            msos_debug(temp_hp + temp_sr + ' -> done!');

                            return promise_srq;
                        }

                        // send request
                        return sendReq(config, reqData).then(transformResponse, transformResponse);
                    };

                    chain = [serverRequest, undefined];

                    // apply interceptors
                    forEach(
                        reversedInterceptors,
                        function (interceptor) {
                            if (interceptor.request || interceptor.requestError) {
                                chain.unshift(interceptor.request, interceptor.requestError);
                            }
                            if (interceptor.response || interceptor.responseError) {
                                chain.push(interceptor.response, interceptor.responseError);
                            }
                        }
                    );

                    while (chain.length) {

                        chain_cnt += 1;

                        thenFn = chain.shift();
                        rejectFn = chain.shift();

                        if (!promise_$http) {
                            promise_$http = $q.when($q.defer('ng_when_$http'), config, thenFn, rejectFn);
                        } else {
                            promise_$http = promise_$http.then(thenFn, rejectFn);
                        }
                    }

                    promise_$http.success = function () {
                        throw new Error('promise_$http.success is gone!');
                    };

                    promise_$http.error = function () {
                        throw new Error('promise_$http.error is gone!');
                    };

                    msos_debug(temp_hp + ' - $get - $http ->  done: ' + promise_$http.$$state.name + ', chain count:' + chain_cnt);
                    return promise_$http;
                }

                function createShortMethods() {
                    forEach(arguments, function (name) {
                        $http[name] = function (url, config) {
                            msos.console.info(temp_hp + ' - $get - $http.' + name + ' -> start.');
                            var $http_out = $http(
                                extend(
                                    {},
                                    config || {},
                                    { method: name, url: url }
                                )
                            );

                            msos.console.info(temp_hp + ' - $get - $http.' + name + ' ->  done: ' + $http_out.$$state.name);
                            return $http_out;
                        };
                    });
                }

                function createShortMethodsWithData() {
                    forEach(arguments, function (name) {
                        $http[name] = function (url, data, config) {
                            msos.console.info(temp_hp + ' - $get - $http.' + name + ' -> start.');
                            var $http_out = $http(
                                extend(
                                    {},
                                    config || {},
                                    { method: name, url: url, data: data }
                                )
                            );

                            msos.console.info(temp_hp + ' - $get - $http.' + name + ' ->  done: ' + $http_out.$$state.name);
                            return $http_out;
                        };
                    });
                }

                forEach(
                    interceptorFactories,
                    function (interceptorFactory) {
                        reversedInterceptors.unshift(_.isString(interceptorFactory) ? $injector.get(interceptorFactory) : $injector.invoke(interceptorFactory));
                    }
                );

                $http.pendingRequests = [];

                createShortMethods('get', 'delete', 'head', 'jsonp');
                createShortMethodsWithData('post', 'put', 'patch');

                $http.defaults = defaults;

                msos_debug(temp_hp + ' - $get -> done!');
                return $http;
            }
        ];
    }

    function $xhrFactoryProvider() {
        this.$get = function () {
            return function createXhr() {
                return new window.XMLHttpRequest();
            };
        };
    }

    function createHttpBackend($browser, createXhr, $browserDefer, callbacks, rawDocument) {
        var temp_ch = 'ng - createHttpBackend';

        msos_debug(temp_ch + ' -> start.');

        function jsonpReq(url, callbackId, done) {
            // we can't use jQuery/jqLite here because jQuery does crazy shit with script elements, e.g.:
            // - fetches local scripts via XHR and evals them
            // - adds and immediately removes script elements from the document
            var script = rawDocument.createElement('script'),
                callback = null;

            script.type = "text/javascript";
            script.src = url;
            script.async = true;

            msos_debug(temp_ch + ' - jsonpReq -> start.');

            callback = function (event) {
                removeEventListenerFn(script, "load", callback);
                removeEventListenerFn(script, "error", callback);
                rawDocument.body.removeChild(script);
                script = null;

                var status = -1,
                    text = "unknown";

                msos_debug(temp_ch + ' - jsonpReq - callback -> start.');

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

                msos_debug(temp_ch + ' - jsonpReq - callback -> done!');
            };

            addEventListenerFn(script, "load", callback);
            addEventListenerFn(script, "error", callback);
            rawDocument.body.appendChild(script);

            msos_debug(temp_ch + ' - jsonpReq -> done!');
            return callback;
        }

        msos_debug(temp_ch + ' -> done.');

        return function (method, url, post, callback, headers, timeout, withCredentials, responseType) {
            var callbackId,
                jsonpDone,
                xhr,
                timeoutId,
                requestError;

            msos_debug(temp_ch + ' returned function -> start.');

            $browser.$$incOutstandingRequestCount();
            url = url || $browser.url();

            function timeoutRequest() {
                if (jsonpDone)  { jsonpDone(); }
                if (xhr)        { xhr.abort(); }
            }

            function completeRequest(callback, status, response, headersString, statusText) {
                // cancel timeout and subsequent timeout promise resolution
                if (isDefined(timeoutId)) {
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

                xhr = createXhr(method, url);

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

                xhr.send(_.isUndefined(post) ? null : post);
            }

            if (timeout > 0) {
                timeoutId = $browserDefer(timeoutRequest, timeout);
            } else if (isPromiseLike(timeout)) {
                timeout.then(timeoutRequest);
            }

            msos_debug(temp_ch + ' returned function -> done!');
        };
    }

    function $HttpBackendProvider() {
        this.$get = ['$browser', '$window', '$document', '$xhrFactory', function ($browser, $window, $document, $xhrFactory) {
            return createHttpBackend($browser, $xhrFactory, $browser.defer, $window.angular.callbacks, $document[0]);
        }];
    }

    $interpolateMinErr = angular.$interpolateMinErr = minErr('$interpolate');

    $interpolateMinErr.throwNoconcat = function (text) {
        throw $interpolateMinErr(
            'noconcat',
            "Error while interpolating: {0}\nStrict Contextual Escaping disallows " +
            "interpolations that concatenate multiple expressions when a trusted value is " +
            "required.  See http://docs.angularjs.org/api/ng.$sce",
            text
        );
    };

    $interpolateMinErr.interr = function (text, err) {
        return $interpolateMinErr(
            'interr',
            "Can't interpolate: {0}\n{1}",
            text,
            err.toString()
        );
    };

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

            function unescapeText(text) {
                return text.replace(escapedStartRegexp, startSymbol).replace(escapedEndRegexp, endSymbol);
            }

            function stringify(value) {
                if (value === null || value === undefined) {
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
            }

            function constantWatchDelegateIP(scope, listener, objectEquality, constantInterp) {
                var unwatch = scope.$watch(
                        function constantInterpolateWatch(scope) {
                            unwatch();
                            return constantInterp(scope);
                        },
                        listener,
                        objectEquality
                    );

                return unwatch;
            }

            function $interpolateFn(text, skip_return_interp_obj, trustedContext, allOrNothing) {

                var temp_it = '$get - $interpolateFn',
                    db_itrp = '',
                    constantInterp,
                    unescaped_text,
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
                    };

                if (verbose) {
                    msos_debug(temp_ip + temp_it + ' -> start.');
                }

                // Provide a quick exit and simplified result function for text with no interpolation
                if (!textLength || text.indexOf(startSymbol) === -1) {

                    db_itrp += 'text length: ' + textLength + ', skip constantInterp obj: ' + skip_return_interp_obj;

                    if (!skip_return_interp_obj) {
                        unescaped_text = unescapeText(text);
                        constantInterp = valueFn(unescaped_text);
                        constantInterp.exp = text;
                        constantInterp.expressions = [];
                        constantInterp.$$watchDelegate = constantWatchDelegateIP;
                    }

                    if (verbose) {
                        db_itrp += '\n     string: ' + escape_string(text);
                        msos_debug(temp_ip + temp_it + ' -> done, ' + db_itrp + '\n     constantInterp:', constantInterp);
                    }

                    return constantInterp;
                }

                allOrNothing = !!allOrNothing;

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

                        msos.console.error(temp_ip + temp_it + ' - parseStringifyInterceptor -> failed: ' + newErr, err);
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
                    $interpolateMinErr.throwNoconcat(text);
                }

                if (!skip_return_interp_obj || expressions.length) {

                    if (verbose) {
                        db_itrp += '\n     string: ' + escape_string(text);
                        msos_debug(temp_ip + temp_it + ' -> done,' + db_itrp);
                    }

                    return extend(
                        function interpolationFn_Force(context) {
                            var i = 0,
                                values = [],
                                newErr = '';

                            try {
                                for (i = 0; i < expressions.length; i += 1) {
                                    values[i] = parseFns[i](context);
                                }

                                return compute(values);

                            } catch (err) {
                                newErr = $interpolateMinErr('interr', "Can't interpolate: {0}\n", text);

                                msos.console.error(temp_ip + temp_it + ' - interpolationFn_Force -> failed: ' + newErr, err);
                            }

                            return undefined;
                        },
                        {
                            exp: text,
                            expressions: expressions,
                            $$watchDelegate: function (scope, listener) {
                                var lastValue;

                                return scope.$watchGroup(
                                    parseFns,
                                    function interpolateFnWatcher(values, oldValues) {
                                        var currValue = compute(values);
                                        if (_.isFunction(listener)) {
                                            listener.call(this, currValue, values !== oldValues ? lastValue : currValue, scope);
                                        }
                                        lastValue = currValue;
                                    }
                                );
                            }
                        }
                    );
                }

                msos_debug(temp_ip + temp_it + ' -> done, no expressions.');
                return undefined;
            }

            $interpolateFn.startSymbol = function () {
                return startSymbol;
            };

            $interpolateFn.endSymbol = function () {
                return endSymbol;
            };

            return $interpolateFn;
        }];
    }

    function $IntervalProvider() {
        this.$get = ['$rootScope', '$window', '$q', '$$q', '$browser',
            function ($rootScope,   $window,   $q,   $$q,   $browser) {
            var intervals = {},
                temp_ipg = 'ng - $IntervalProvider - $get';

            function interval(fn_in, delay_in, count, invokeApply_in) {
                var temp_in = ' - interval',
                    checked_count = isDefined(count) ? count : 0,
                    hasParams = arguments.length > 4,
                    args = hasParams ? sliceArgs(arguments, 4) : [],
                    setInterval = $window.setInterval,
                    clearInterval = $window.clearInterval,
                    iteration = 0,
                    skipApply = (isDefined(invokeApply_in) && !invokeApply_in),
                    deferred = (skipApply ? $$q : $q).defer('ng_$IntervalProvider_$get'),
                    promise = deferred.promise;

                msos.console.info(temp_ipg + temp_in + ' -> start, name: ' + promise.$$state.name + ', delay: ' + delay_in);

                function callback() {
                    if (!hasParams) {
                        fn_in(iteration);
                    } else {
                        fn_in.apply(null, args);
                    }
                }

                promise.$$intervalId = setInterval(
                    function tick() {
                        var debug_out = ', name: ' + promise.$$state.name + ', iteration: ' + iteration;

                        msos_debug(temp_ipg + temp_in + ' - tick -> start' + debug_out);

                        if (skipApply) {
                            $browser.defer(callback);
                        } else {
                            $rootScope.$evalAsync(callback);
                        }

                        deferred.notify(iteration);
                        iteration += 1;

                        if (checked_count > 0 && iteration >= checked_count) {
                            deferred.resolve(iteration);
                            clearInterval(promise.$$intervalId);
                            delete intervals[promise.$$intervalId];
                        }

                        if (!skipApply) { $rootScope.$apply(); }

                        msos_debug(temp_ipg + temp_in + ' - tick ->  done' + debug_out);
                    },
                    delay_in
                );

                intervals[promise.$$intervalId] = deferred;

                msos.console.info(temp_ipg + temp_in + ' ->  done, name: ' + promise.$$state.name);

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
                    shortTime: 'h:mm a',
                    ERANAMES: ["Before Christ", "Anno Domini"],
                    ERAS: ["BC", "AD"]
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
            match,
            param;

        // Always make it something (ie: /)
        if (prefixed) {
            relativeUrl = '/' + relativeUrl;
        }

        msos_debug(temp_pa + 'start, relative url: ' + relativeUrl + ', prefixed: ' + prefixed);

        match = urlResolve(relativeUrl, 'parseAppUrl');

        for (param in match.params) {
            if (match.params[param] === "") {
                match.params[param] = true;    // Default is "true" for key only parameter in url
            }
        }

        locationObj.$$path = decodeURIComponent(prefixed && match.pathname.charAt(0) === '/' ? match.pathname.substring(1) : match.pathname);
        locationObj.$$search = match.params;
        locationObj.$$hash = decodeURIComponent(match.hash);

        // make sure path starts with '/';
        if (locationObj.$$path && locationObj.$$path.charAt(0) !== '/') {
            locationObj.$$path = '/' + locationObj.$$path;
        }

        msos_debug(temp_pa + 'done, Location Object:', locationObj);
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

    function LocationHtml5Url(appBase, appBaseNoFile, basePrefix) {

        this.$$html5 = true;
        basePrefix = basePrefix || '';

        var temp_lh5 = 'ng - LocationHtml5Url';

        msos_debug(temp_lh5 + ' -> start,\n     app base: ' + appBase + (basePrefix ? ', base prefix: ' + basePrefix : ''));

        this.$$protocol = originUrl.protocol;
        this.$$host = originUrl.hostname;
        this.$$port = parseInt(originUrl.port, 10) || DEFAULT_PORTS[originUrl.protocol] || null;

        this.$$parse = function (url) {

            msos_debug(temp_lh5 + ' - $$parse -> start,\n     url: ' + url);

            var pathUrl = beginsWith(appBaseNoFile, url);

            if (!_.isString(pathUrl)) {
                throw $locationMinErr('ipthprfx', 'Invalid url "{0}", missing path prefix "{1}".', url, appBaseNoFile);
            }

            parseAppUrl(pathUrl, this);

            if (!this.$$path) {
                this.$$path = '/';
            }

            this.$$compose();

            msos_debug(temp_lh5 + ' - $$parse -> done!');
        };

        this.$$compose = function () {
            var search = toKeyValue(this.$$search),
                hash = this.$$hash ? '#' + encodeUriSegment(this.$$hash) : '';

            this.$$url = encodePath(this.$$path) + (search ? '?' + search : '') + hash;
            this.$$absUrl = appBaseNoFile + this.$$url.substr(1); // first char is always '/'
        };

        this.$$parseLinkUrl = function (url, relHref) {

            msos_debug(temp_lh5 + ' - $$parseLinkUrl -> start.');

            if (relHref && relHref[0] === '#') {
                // special case for links to hash fragments:
                // keep the old url and only replace the hash fragment
                this.hash(relHref.slice(1));

                msos_debug(temp_lh5 + ' - $$parseLinkUrl -> done, for #');
                return true;
            }

            var appUrl = beginsWith(appBase, url),
                appUrlNF = beginsWith(appBaseNoFile, url),
                prevAppUrl,
                rewrittenUrl;
            
            if (isDefined(appUrl)) {
                prevAppUrl = appUrl;

                appUrl = beginsWith(basePrefix, appUrl);

                if (isDefined(appUrl)) {
                    rewrittenUrl = appBaseNoFile + (beginsWith('/', appUrl) || appUrl);
                } else {
                    rewrittenUrl = appBase + prevAppUrl;
                }
            } else if (isDefined(appUrlNF)) {
                rewrittenUrl = appBaseNoFile + appUrlNF;
            } else if (appBaseNoFile === url + '/') {
                rewrittenUrl = appBaseNoFile;
            }

            if (rewrittenUrl) {
                this.$$parse(rewrittenUrl);
            }

            msos_debug(temp_lh5 + ' - $$parseLinkUrl -> done, rewritten: ' + !!rewrittenUrl);
            return !!rewrittenUrl;
        };

        msos_debug(temp_lh5 + ' -> done!');
    }

    function LocationHashbangUrl(appBase, appBaseNoFile, hashPrefix) {

        var temp_hb = 'ng - LocationHashbangUrl';

        msos_debug(temp_hb + ' -> start,\n     app base: ' + appBase + (hashPrefix ? ', hash prefix: ' + hashPrefix : ''));

        this.$$protocol = originUrl.protocol;
        this.$$host = originUrl.hostname;
        this.$$port = parseInt(originUrl.port, 10) || DEFAULT_PORTS[originUrl.protocol] || null;

        this.$$parse = function (url) {

            msos_debug(temp_hb + ' - $$parse -> start,\n     url: ' + url);
    
            var withoutBaseUrl = beginsWith(appBase, url) || beginsWith(appBaseNoFile, url),
                withoutHashUrl;

            if (!_.isUndefined(withoutBaseUrl) && withoutBaseUrl.charAt(0) === '#') {
                withoutHashUrl = beginsWith(hashPrefix, withoutBaseUrl);
                if (_.isUndefined(withoutHashUrl)) {
                    withoutHashUrl = withoutBaseUrl;
                }
            } else {
                if (this.$$html5) {
                    withoutHashUrl = withoutBaseUrl;
                } else {
                    withoutHashUrl = '';
                    if (_.isUndefined(withoutBaseUrl)) {
                        appBase = url;
                        this.replace();
                    }
                }
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

            msos_debug(temp_hb + ' - $$parse -> done!');
        };

        this.$$compose = function () {
            var search = toKeyValue(this.$$search),
                hash = this.$$hash ? '#' + encodeUriSegment(this.$$hash) : '';

            this.$$url = encodePath(this.$$path) + (search ? '?' + search : '') + hash;
            this.$$absUrl = appBase + (this.$$url ? hashPrefix + this.$$url : '');
        };

        this.$$parseLinkUrl = function (url) {
            var temp_pu = ' - $$parseLinkUrl -> ';

            msos_debug(temp_hb + temp_pu + 'start.');

            if (stripHash(appBase) === stripHash(url)) {
                this.$$parse(url);
    
                msos_debug(temp_hb + temp_pu + 'done: true');
                return true;
            }

            msos_debug(temp_hb + temp_pu + 'done: false');
            return false;
        };

        msos_debug(temp_hb + ' -> done!');
    }

    function LocationHashbangInHtml5Url(appBase, appBaseNoFile, hashPrefix) {
        this.$$html5 = true;
    
        var temp_5u = 'ng - LocationHashbangInHtml5Url';

        msos_debug(temp_5u + ' -> start.');

        LocationHashbangUrl.apply(this, arguments);

        this.$$parseLinkUrl = function (url, relHref) {
            var temp_pl = ' - $$parseLinkUrl -> ',
                rewrittenUrl,
                appUrl;

            msos_debug(temp_5u + temp_pl + 'start.');
    
            if (relHref && relHref[0] === '#') {
                // special case for links to hash fragments:
                // keep the old url and only replace the hash fragment
                this.hash(relHref.slice(1));
                return true;
            }

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

            msos_debug(temp_5u + temp_pl + 'done, rewritten: ' + !!rewrittenUrl);

            return !!rewrittenUrl;
        };

        this.$$compose = function () {
            var search = toKeyValue(this.$$search),
                hash = this.$$hash ? '#' + encodeUriSegment(this.$$hash) : '';

            this.$$url = encodePath(this.$$path) + (search ? '?' + search : '') + hash;
            // include hashPrefix in $$absUrl when $$url is empty so IE8 & 9 do not reload page because of removal of '#'
            this.$$absUrl = appBase + hashPrefix + this.$$url;
        };

        msos_debug(temp_5u + ' -> done!');
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

            msos_debug('ng - locationPrototype - url -> called, output:', this);
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
            var temp_sr = 'ng - locationPrototype - search -> ',
                checked_srch;

            msos_debug(temp_sr + 'start, srch: ' + srch + (paramValue ? ', paramValue: ' + paramValue : ''));

            switch (arguments.length) {

                case 0:
                    msos_debug(temp_sr + ' done, srch: ' + srch + ', case: 0', this.$$search);
                    return this.$$search;

                case 1:
                    if (_.isString(srch) || _.isNumber(srch)) {
                        checked_srch = srch.toString();
                        this.$$search = msos.parse_string(checked_srch);
                    } else if (_.isObject(srch)) {
                        checked_srch = copy(srch, {});
                        // remove object undefined or null properties
                        forEach(
                            checked_srch,
                            function (value, key) {
                                if (value === null) { delete checked_srch[key]; }
                            }
                        );

                        this.$$search = checked_srch;
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
                        msos_debug(temp_sr + 'case: default, delete $$search key: ' + srch);
                    } else {
                        this.$$search[srch] = paramValue;
                        msos_debug(temp_sr + 'case: default, set $$search key: ' + srch + ' to ' + paramValue);
                    }
            }

            this.$$compose();

            msos_debug(temp_sr + ' done, srch: ' + srch + ', case: ' + arguments.length + ', $$search: ', this.$$search);
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

        msos_debug(temp_lp + ' -> start.');

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

        this.$get = ['$rootScope', '$browser', '$rootElement', '$window', function ($rootScope, $browser, $rootElement, $window) {

            var $location_LP,
                LocationMode,
                initialUrl = originUrl.source,
                IGNORE_URI_REGEXP = /^\s*(javascript|mailto):/i,
                appBase,
                appBaseNoFile,
                initializing = true,
                rewrite_url,
                location_watch_count = 0;

            msos_debug(temp_lp + ' - $get -> start,\n     initial url: ' + initialUrl);

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

            appBaseNoFile = stripFile(appBase);

            $location_LP = new LocationMode(appBase, appBaseNoFile, '#' + hashPrefix);

            $location_LP.$$parseLinkUrl(initialUrl, initialUrl);

            $location_LP.$$state = $browser.state();

            rewrite_url = $location_LP.absUrl();

            // Rewrite hashbang url <> html5 url
            if (trimEmptyHash(rewrite_url) !== trimEmptyHash(initialUrl)) {

                msos_debug(temp_lp + ' - get -> rewrite hashbang url <> html5 url:\n     ', rewrite_url);

                $browser.url(rewrite_url, true);
            }

            function setBrowserUrlWithFallback(url, replace, state) {
                var temp_sbf = ' - $get - setBrowserUrlWithFallback -> ',
                    oldUrl,
                    oldState;

                msos_debug(temp_lp + temp_sbf + 'start.');

                oldUrl = $location_LP.url();
                oldState = $location_LP.$$state;

                try {
                    $browser.url(url, replace, state);
                    $location_LP.$$state = $browser.state();
                } catch (e) {
                    // Restore old values if pushState fails
                    $location_LP.url(oldUrl);
                    $location_LP.$$state = oldState;

                    msos.console.warn(temp_lp + temp_sbf + 'pushstate failed:', e);
                }

                msos_debug(temp_lp + temp_sbf + 'done!');
            }

            function afterLocationChange(oldUrl, oldState) {
                $rootScope.$broadcast(
                    '$locationChangeSuccess',
                    $location_LP.absUrl(),
                    oldUrl,
                    $location_LP.$$state,
                    oldState
                );
            }

            $rootElement.on(
                'click',
                function (event) {
                    var temp_re = ' - $get - $rootElement.on:click -> ',
                        debug_txt = '',
                        tar_name = event.target.id || lowercase(event.target.nodeName),
                        elm,
                        absHref,
                        relHref;

                    msos_debug(temp_lp + temp_re + 'start, target: ' + tar_name);

                    if (!html5Mode.rewriteLinks || event.ctrlKey || event.metaKey || event.shiftKey || event.which === 2 || event.button === 2) {
                        msos_debug(temp_lp + temp_re + ' done, target: ' + tar_name + ', ' + (html5Mode.rewriteLinks ? 'html5 rewrite links' : 'skipped event'));
                        return;
                    }

                    elm = jqLite(event.target);

                    // traverse the DOM up to find first A tag
                    while (nodeName_(elm[0]) !== 'a') {
                        // ignore rewriting if no A tag (reached root element, or no parent - removed from document)
                        if (elm[0] === $rootElement[0]) {
                            msos_debug(temp_lp + temp_re + ' done, target: ' + tar_name + ' na, reached root element');
                            return;
                        }

                        elm = elm.parent();

                        if (!elm || elm[0]) {
                            msos_debug(temp_lp + temp_re + ' done, target: ' + tar_name + ' na, no parent element');
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
                        msos_debug(temp_lp + temp_re + ' done, target: ' + tar_name + ' na, is js or mailto url');
                        return;
                    }

                    if (absHref && !elm.attr('target') && !event.isDefaultPrevented()) {
                        if ($location_LP.$$parseLinkUrl(absHref, relHref)) {
                            event.preventDefault();
                            // update location manually
                            if ($location_LP.absUrl() !== $browser.url()) {
                                debug_txt = ', updating location manually';
                                $rootScope.$apply();
                            }
                        }
                    }

                    msos_debug(temp_lp + temp_re + ' done, target: ' + tar_name + debug_txt);
                }
            );

            function create_eval_async_func(new_url) {

                $rootScope.$evalAsync(
                    function () {
                        var temp_re = ' - $get - $rootScope.$evalAsync -> ',
                            old_url = $location_LP.absUrl(),
                            old_state = $location_LP.$$state,
                            new_state = $browser.state(),
                            defaultPrevented;

                        new_url = trimEmptyHash(new_url);

                        msos_debug(temp_lp + temp_re + 'called (new),\n     url: ' + new_url);

                        $location_LP.$$parse(new_url);
                        $location_LP.$$state = new_state;

                        defaultPrevented = $rootScope.$broadcast(
                            '$locationChangeStart',
                            new_url,
                            old_url,
                            new_state,
                            old_state
                        ).defaultPrevented;

                        // if the location was changed by a `$locationChangeStart` handler then stop
                        // processing this location change
                        if ($location_LP.absUrl() !== new_url) {
                            msos_debug(temp_lp + temp_re + 'url already changed ($locationChangeStart)');
                            return;
                        }

                        if (defaultPrevented) {

                            msos_debug(temp_lp + temp_re + 'default prevented');

                            $location_LP.$$parse(old_url);
                            $location_LP.$$state = old_state;

                            setBrowserUrlWithFallback(old_url, false, old_state);

                        } else {

                            initializing = false;

                            msos_debug(temp_lp + temp_re + 'change success');

                            setBrowserUrlWithFallback(
                                new_url,
                                $location_LP.$$replace,
                                new_state
                            );

                            afterLocationChange(old_url, old_state);
                        }
                    },
                    { directive_name: '$LocationProvider_$rootScope_$evalAsync' }
                );
            }

            if (verbose) {
                msos_debug(temp_lp + ' - $get -> set $browser.onUrlChange');
            }

            // Update $location when $browser url changes
            $browser.onUrlChange(
                function (newUrl) {
                    var temp_bo = ' - $get - $browser.onUrlChange';

                    msos_debug(temp_lp + temp_bo + ' -> start, for new url:\n     ' + newUrl);

                    if (_.isUndefined(beginsWith(appBaseNoFile, newUrl))) {
                            // If we are navigating outside of the app then force a reload
                            if (verbose) {
                                msos.console.warn(temp_lp + temp_bo + ' -> done, leaving app for a new url:\n     ' + newUrl);
                                alert(temp_lp + temp_bo + ': Leaving the app for a new url (' + newUrl + ')');
                            }

                            $window.location.href = newUrl;
                            return;
                    }
                    create_eval_async_func(newUrl);

                    if (!$rootScope.$$phase) { $rootScope.$digest(); }

                    msos_debug(temp_lp + temp_bo + ' -> done!');
                }
            );

            if (verbose) {
                msos_debug(temp_lp + ' - $get -> set $rootScope.$watch');
            }

            // Update browser
            $rootScope.$watch(
                function $locationWatch() {
                    var temp_lw = ' - $get - $locationWatch',
                        debug_lw = 'no change',
                        oldUrl,
                        oldState,
                        newUrl = trimEmptyHash($location_LP.absUrl()),
                        urlOrStateChanged = false;

                    location_watch_count += 1;

                    msos_debug(temp_lp + temp_lw + ' -> start (' + location_watch_count + '),\n     url: ' + newUrl);

                    if (initializing) {

                        debug_lw = 'initialize';
                        create_eval_async_func(newUrl);

                    } else {

                        oldUrl = trimEmptyHash($browser.url());
                        oldState = $browser.state();
                        urlOrStateChanged = oldUrl !== newUrl || ($location_LP.$$html5 && Modernizr.history && oldState !== $location_LP.$$state);
                    }

                    if (urlOrStateChanged) {

                        debug_lw = 'state change';
                        create_eval_async_func(newUrl);
                    }

                    $location_LP.$$replace = false;

                    msos_debug(temp_lp + temp_lw + ' ->  done (' + location_watch_count + '), for: ' + debug_lw);
                }
            );

            msos_debug(temp_lp + ' - $get -> done!');

            return $location_LP;
        }];

        msos_debug(temp_lp + ' -> done!');
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
            throw $parseMinErr(
                'isecfld',
                'Attempting to access a disallowed field in Angular expressions! Expression: {0}',
                fullExpression
            );
        }
        return name;
    }

    function getStringValue(name) { return name + ''; }

    function ensureSafeObject(obj, fullExpression) {
        var temp_es = 'ng - ensureSafeObject -> ',
            debug_out = ' type: ' + (typeof obj);

        if (msos.config.debug === 'safe') {
            msos_debug(temp_es + 'start, expression: ' + fullExpression);
        }

        if (obj === null) {
            debug_out = ' skipped for "null"' + debug_out;
        } else if (typeof obj === 'object') {
            if (obj.constructor && obj.constructor === obj) {
                throw $parseMinErr('isecfn', 'Function' + disallowed, fullExpression);
            }
            if (obj.window && obj.window === obj) {
                throw $parseMinErr('isecwindow', 'Window' + disallowed, fullExpression);
            }
            if (obj.children && (obj.nodeName || (obj.prop && obj.attr && obj.find))) {
                throw $parseMinErr('isecdom', 'DOM nodes' + disallowed, fullExpression);
            }
            if (obj === Object) {
                throw $parseMinErr('isecobj', 'Object' + disallowed, fullExpression);
            }
        } else {
            debug_out = ' skipped for' + debug_out;
        }

        if (msos.config.debug === 'safe') {
            msos_debug(temp_es + ' done, expression: ' + fullExpression + ',' + debug_out);
        }
        return obj;
    }

    function ensureSafeFunction(obj, fullExpression) {
        var temp_esf = 'ng - ensureSafeFunction -> ',
            debug_out = ' type: ' + (typeof obj);

        if (msos.config.debug === 'safe') {
            msos_debug(temp_esf + 'start, expression: ' + fullExpression);
        }

        if (typeof obj === 'function') {
            if (obj.constructor && obj.constructor === obj) {
                throw $parseMinErr('isecfn', 'Function' + disallowed, fullExpression);
            }
            if (obj === CALL || obj === APPLY || obj === BIND) {
                throw $parseMinErr('isecff', 'call, bind, apply' + disallowed, fullExpression);
            }
        } else {
            debug_out = ' skipped for' + debug_out;
        }

        if (msos.config.debug === 'safe') {
            msos_debug(temp_esf + ' done, expression: ' + fullExpression + ',' + debug_out);
        }
        return obj;
    }

    function ensureSafeAssignContext(obj, fullExpression) {
        if (obj) {
            if (obj === (0).constructor
             || obj === (false).constructor
             || obj === ''.constructor
             || obj === {}.constructor
             || obj === [].constructor
             || obj === Function.constructor) {
                throw $parseMinErr(
                    'isecaf',
                    'Assigning to a constructor is disallowed! Expression: {0}',
                    fullExpression
                );
            }
        }
    }

    OPERATORS = createMap();

    forEach(['+', '-', '*', '/', '%', '===', '!==', '==', '!=', '<', '>', '<=', '>=', '&&', '||', '!', '=', '|'], function (operator) { OPERATORS[operator] = true; });

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
                }

                string += ch;

                this.index += 1;
            }

            this.throwError(
                'Unterminated quote',
                start
            );
        }
    };

    AST = function (lexer, options) {
        this.lexer = lexer;
        this.options = options;
    };

    AST.Program = 'Program';
    AST.ExpressionStatement = 'ExpressionStatement';
    AST.AssignmentExpression = 'AssignmentExpression';
    AST.ConditionalExpression = 'ConditionalExpression';
    AST.LogicalExpression = 'LogicalExpression';
    AST.BinaryExpression = 'BinaryExpression';
    AST.UnaryExpression = 'UnaryExpression';
    AST.CallExpression = 'CallExpression';
    AST.MemberExpression = 'MemberExpression';
    AST.Identifier = 'Identifier';
    AST.Literal = 'Literal';
    AST.ArrayExpression = 'ArrayExpression';
    AST.Property = 'Property';
    AST.ObjectExpression = 'ObjectExpression';
    AST.ThisExpression = 'ThisExpression';
    AST.LocalsExpression = 'LocalsExpression';

    // Internal use only
    AST.NGValueParameter = 'NGValueParameter';

    AST.prototype = {
        ast: function (text) {
            this.text = text;
            this.tokens = this.lexer.lex(text);

            var value = this.program();

            if (this.tokens.length !== 0) {
                this.throwError('is an unexpected token', this.tokens[0]);
            }

            return value;
        },

        program: function () {
            var body = [];

            while (true) {
                if (this.tokens.length > 0 && !this.peek('}', ')', ';', ']')) { body.push(this.expressionStatement()); }

                if (!this.expect(';')) {
                    return { type: AST.Program, body: body};
                }
            }
        },

        expressionStatement: function () {
            return { type: AST.ExpressionStatement, expression: this.filterChain() };
        },

        filterChain: function () {
            var left = this.expression(),
                token;

            while ((token = this.expect('|'))) {
                left = this.filter(left);
            }
            return left;
        },

        expression: function () {
            return this.assignment();
        },

        assignment: function () {
            var result = this.ternary();

            if (this.expect('=')) {
                result = { type: AST.AssignmentExpression, left: result, right: this.assignment(), operator: '='};
            }

            return result;
        },

        ternary: function () {
            var test = this.logicalOR(),
                alternate,
                consequent;

            if (this.expect('?')) {
                alternate = this.expression();
                if (this.consume(':')) {
                    consequent = this.expression();
                    return { type: AST.ConditionalExpression, test: test, alternate: alternate, consequent: consequent};
                }
            }

            return test;
        },

        logicalOR: function () {
            var left = this.logicalAND();

            while (this.expect('||')) {
                left = { type: AST.LogicalExpression, operator: '||', left: left, right: this.logicalAND() };
            }

            return left;
        },

        logicalAND: function () {
            var left = this.equality();

            while (this.expect('&&')) {
                left = { type: AST.LogicalExpression, operator: '&&', left: left, right: this.equality()};
            }

            return left;
        },

        equality: function () {
            var left = this.relational(),
                token;

            while ((token = this.expect('==','!=','===','!=='))) {
                left = { type: AST.BinaryExpression, operator: token.text, left: left, right: this.relational() };
            }

            return left;
        },

        relational: function () {
            var left = this.additive(),
                token;

            while ((token = this.expect('<', '>', '<=', '>='))) {
                left = { type: AST.BinaryExpression, operator: token.text, left: left, right: this.additive() };
            }

            return left;
        },

        additive: function () {
            var left = this.multiplicative(),
                token;

            while ((token = this.expect('+','-'))) {
                left = { type: AST.BinaryExpression, operator: token.text, left: left, right: this.multiplicative() };
            }

            return left;
        },

        multiplicative: function () {
            var left = this.unary(),
            token;

            while ((token = this.expect('*','/','%'))) {
                left = { type: AST.BinaryExpression, operator: token.text, left: left, right: this.unary() };
            }

            return left;
        },

        unary: function () {
            var token = this.expect('+', '-', '!');

            if (token) {
                return { type: AST.UnaryExpression, operator: token.text, prefix: true, argument: this.unary() };
            }

            return this.primary();
        },

        primary: function () {
            var primary,
                next;

            if (this.expect('(')) {
                primary = this.filterChain();
                this.consume(')');
            } else if (this.expect('[')) {
                primary = this.arrayDeclaration();
            } else if (this.expect('{')) {
                primary = this.object();
            } else if (this.constants.hasOwnProperty(this.peek().text)) {
                primary = copy(this.constants[this.consume().text]);
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
                if (verbose) {
                    msos_debug('ng - Parser - primary -> next:', next);
                }
                if (next.text === '(') {
                    primary = {type: AST.CallExpression, callee: primary, parse_args: this.parseArguments() };
                    this.consume(')');
                } else if (next.text === '[') {
                    primary = { type: AST.MemberExpression, object: primary, property: this.expression(), computed: true };
                    this.consume(']');
                } else if (next.text === '.') {
                    primary = { type: AST.MemberExpression, object: primary, property: this.identifier(), computed: false };
                } else {
                    this.throwError('IMPOSSIBLE');
                }
            }

            return primary;
        },

        filter: function (baseExpression) {
            var args = [baseExpression],
                result = {type: AST.CallExpression, callee: this.identifier(), parse_args: args, filter: true};

            while (this.expect(':')) {
                args.push(this.expression());
            }

            return result;
        },

        parseArguments: function () {
            var args = [];

            if (this.peekToken().text !== ')') {
                do {
                    args.push(this.expression());
                } while (this.expect(','));
            }

            return args;
        },

        identifier: function () {
            var token = this.consume();

            if (!token.identifier) {
                this.throwError('is not a valid identifier', token);
            }

            return { type: AST.Identifier, name: token.text };
        },

        constant: function () {
            return { type: AST.Literal, value: this.consume().value };
        },

        arrayDeclaration: function () {
            var elements = [];

            if (this.peekToken().text !== ']') {
                do {
                    if (this.peek(']')) {
                        // Support trailing commas per ES5.1.
                        break;
                    }
                    elements.push(this.expression());
                } while (this.expect(','));
            }

            this.consume(']');

            return { type: AST.ArrayExpression, elements: elements };
        },

        object: function () {
            var properties = [], property;

            if (this.peekToken().text !== '}') {
                do {
                    if (this.peek('}')) {
                        // Support trailing commas per ES5.1.
                        break;
                    }

                    property = {type: AST.Property, kind: 'init'};
                    if (this.peek().constant) {
                        property.key = this.constant();
                    } else if (this.peek().identifier) {
                        property.key = this.identifier();
                    } else {
                        this.throwError("invalid key", this.peek());
                    }

                    this.consume(':');
                    property.value = this.expression();
                    properties.push(property);
                } while (this.expect(','));
            }

            this.consume('}');

            return { type: AST.ObjectExpression, properties: properties };
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
                this.throwError('is unexpected, expecting [' + e1 + ']', this.peek());
            }

            return token;
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

        /* `undefined` is not a constant, it is an identifier,
         * but using it as an identifier is not supported
         */
        constants: {
            'true':         { type: AST.Literal, value: true },
            'false':        { type: AST.Literal, value: false },
            'null':         { type: AST.Literal, value: null },
            'undefined':    { type: AST.Literal, value: undefined },
            'this':         { type: AST.ThisExpression },
            '$locals':      { type: AST.LocalsExpression }
        }
    };

    function plusFn(l, r) {
        if (l === undefined) { return r; }
        if (r === undefined) { return l; }

        return l + r;
    }

    function isStateless($filter, filterName) {
        var fn = $filter(filterName);

        return !fn.$stateful;
    }

    function findConstantAndWatchExpressions(ast, $filter) {
        var allConstants,
            argsToWatch;

        switch (ast.type) {
            case AST.Program:
                allConstants = true;
                forEach(
                    ast.body,
                    function (expr) {
                        findConstantAndWatchExpressions(expr.expression, $filter);
                        allConstants = allConstants && expr.expression.constant;
                    }
                );
                ast.constant = allConstants;
            break;
            case AST.Literal:
                ast.constant = true;
                ast.toWatch = [];
            break;
            case AST.UnaryExpression:
                findConstantAndWatchExpressions(ast.argument, $filter);
                ast.constant = ast.argument.constant;
                ast.toWatch = ast.argument.toWatch;
            break;
            case AST.BinaryExpression:
                findConstantAndWatchExpressions(ast.left, $filter);
                findConstantAndWatchExpressions(ast.right, $filter);
                ast.constant = ast.left.constant && ast.right.constant;
                ast.toWatch = ast.left.toWatch.concat(ast.right.toWatch);
            break;
            case AST.LogicalExpression:
                findConstantAndWatchExpressions(ast.left, $filter);
                findConstantAndWatchExpressions(ast.right, $filter);
                ast.constant = ast.left.constant && ast.right.constant;
                ast.toWatch = ast.constant ? [] : [ast];
            break;
            case AST.ConditionalExpression:
                findConstantAndWatchExpressions(ast.test, $filter);
                findConstantAndWatchExpressions(ast.alternate, $filter);
                findConstantAndWatchExpressions(ast.consequent, $filter);
                ast.constant = ast.test.constant && ast.alternate.constant && ast.consequent.constant;
                ast.toWatch = ast.constant ? [] : [ast];
            break;
            case AST.Identifier:
                ast.constant = false;
                ast.toWatch = [ast];
            break;
            case AST.MemberExpression:
                findConstantAndWatchExpressions(ast.object, $filter);
                if (ast.computed) {
                    findConstantAndWatchExpressions(ast.property, $filter);
                }
                ast.constant = ast.object.constant && (!ast.computed || ast.property.constant);
                ast.toWatch = [ast];
            break;
            case AST.CallExpression:
                allConstants = ast.filter ? isStateless($filter, ast.callee.name) : false;
                argsToWatch = [];

                forEach(
                    ast.parse_args,
                    function (expr) {
                        findConstantAndWatchExpressions(expr, $filter);
                        allConstants = allConstants && expr.constant;
                        if (!expr.constant) {
                            argsToWatch.push.apply(argsToWatch, expr.toWatch);
                        }
                    }
                );

                ast.constant = allConstants;
                ast.toWatch = ast.filter && isStateless($filter, ast.callee.name) ? argsToWatch : [ast];
            break;
            case AST.AssignmentExpression:
                findConstantAndWatchExpressions(ast.left, $filter);
                findConstantAndWatchExpressions(ast.right, $filter);
                ast.constant = ast.left.constant && ast.right.constant;
                ast.toWatch = [ast];
            break;
            case AST.ArrayExpression:
                allConstants = true;
                argsToWatch = [];
                forEach(
                    ast.elements,
                    function (expr) {
                        findConstantAndWatchExpressions(expr, $filter);
                        allConstants = allConstants && expr.constant;
                        if (!expr.constant) {
                            argsToWatch.push.apply(argsToWatch, expr.toWatch);
                        }
                    }
                );
                ast.constant = allConstants;
                ast.toWatch = argsToWatch;
            break;
            case AST.ObjectExpression:
                allConstants = true;
                argsToWatch = [];
                forEach(
                    ast.properties,
                    function (property) {
                        findConstantAndWatchExpressions(property.value, $filter);
                        allConstants = allConstants && property.value.constant;
                        if (!property.value.constant) {
                            argsToWatch.push.apply(argsToWatch, property.value.toWatch);
                        }
                    }
                );
                ast.constant = allConstants;
                ast.toWatch = argsToWatch;
            break;
            case AST.ThisExpression:
                ast.constant = false;
                ast.toWatch = [];
            break;
            case AST.LocalsExpression:
                ast.constant = false;
                ast.toWatch = [];
            break;
        }
    }

    function getInputs(body) {
        if (body.length !== 1) { return undefined; }

        var lastExpression = body[0].expression,
            candidate = lastExpression.toWatch;

        if (candidate.length !== 1) { return candidate; }

        return candidate[0] !== lastExpression ? candidate : undefined;
    }

    function isAssignable(ast) {
        return ast.type === AST.Identifier || ast.type === AST.MemberExpression;
    }

    function assignableAST(ast) {
        if (ast.body.length === 1 && isAssignable(ast.body[0].expression)) {
            return {
                type: AST.AssignmentExpression,
                left: ast.body[0].expression,
                right: { type: AST.NGValueParameter },
                operator: '='
            };
        }
        
        return undefined;
    }

    function isLiteral(ast) {
        return ast.body.length === 0
            || (ast.body.length === 1 && (ast.body[0].expression.type === AST.Literal || ast.body[0].expression.type === AST.ArrayExpression || ast.body[0].expression.type === AST.ObjectExpression));
    }

    function isConstant(ast) {
        return ast.constant;
    }

    function ASTInterpreter(astBuilder, $filter) {
        this.astBuilder = astBuilder;
        this.$filter = $filter;
    }

    ASTInterpreter.prototype = {
        compile: function (expression) {
            var self = this,
                ast = this.astBuilder.ast(expression),
                assignable,
                assign,
                toWatch,
                inputs,
                expressions = [],
                fn;

            this.expression = expression;

            findConstantAndWatchExpressions(ast, self.$filter);

            assignable = assignableAST(ast);

            if (assignable) {
                assign = this.recurse(assignable);
            }

            toWatch = getInputs(ast.body);

            if (toWatch) {
                inputs = [];

                forEach(
                    toWatch,
                    function (watch, key) {
                        var input = self.recurse(watch);

                        watch.input = input;
                        inputs.push(input);
                        watch.watchId = key;
                    }
                );
            }

            forEach(
                ast.body,
                function (expression) {
                    expressions.push(self.recurse(expression.expression));
                }
            );

            fn = ast.body.length === 0
                ? function () {}
                : ast.body.length === 1
                    ? expressions[0]
                    : function (scope, locals) {
                        var lastValue;

                        forEach(
                            expressions,
                            function (exp) {
                                lastValue = exp(scope, locals);
                            }
                        );

                        return lastValue;
                    };

            if (assign) {
                fn.assign = function (scope, value, locals) {
                    return assign(scope, locals, value);
                };
            }

            if (inputs) { fn.inputs = inputs; }

            fn.literal = isLiteral(ast);
            fn.constant = isConstant(ast);

            return fn;
        },

        recurse: function (ast, context, create) {
            var left,
                right,
                self = this,
                args;

            if (ast.input) {
                return this.inputs(ast.input, ast.watchId);
            }

            switch (ast.type) {
                case AST.Literal:
                    return this.value(ast.value, context);
                case AST.UnaryExpression:
                    right = this.recurse(ast.argument);
                    return this['unary' + ast.operator](right, context);
                case AST.BinaryExpression:
                    left = this.recurse(ast.left);
                    right = this.recurse(ast.right);
                    return this['binary' + ast.operator](left, right, context);
                case AST.LogicalExpression:
                    left = this.recurse(ast.left);
                    right = this.recurse(ast.right);
                    return this['binary' + ast.operator](left, right, context);
                case AST.ConditionalExpression:
                    return this['ternary?:'](
                        this.recurse(ast.test),
                        this.recurse(ast.alternate),
                        this.recurse(ast.consequent),
                        context
                    );
                case AST.Identifier:
                    ensureSafeMemberName(ast.name, self.expression);
                    return self.identifier(
                        ast.name,
                        context,
                        create,
                        self.expression
                    );
                case AST.MemberExpression:
                    left = this.recurse(ast.object, false, !!create);
                    if (!ast.computed) {
                        ensureSafeMemberName(ast.property.name, self.expression);
                        right = ast.property.name;
                    }
                    if (ast.computed) { right = this.recurse(ast.property); }
                    return ast.computed
                        ? this.computedMember(left, right, context, create, self.expression)
                        : this.nonComputedMember(left, right, context, create, self.expression);
                case AST.CallExpression:
                    args = [];

                    forEach(
                        ast.parse_args,
                        function (expr) {
                            args.push(self.recurse(expr));
                        }
                    );

                    if (ast.filter) { right = this.$filter(ast.callee.name); }
                    if (!ast.filter) { right = this.recurse(ast.callee, true); }

                    return ast.filter
                        ? function (scope, locals, assign, inputs) {
                            var values = [],
                                i = 0,
                                value;

                            for (i = 0; i < args.length; i += 1) {
                                values.push(args[i](scope, locals, assign, inputs));
                            }

                            value = right.apply(undefined, values, inputs);

                            return context ? { context: undefined, name: undefined, value: value } : value;
                        }
                        : function (scope, locals, assign, inputs) {
                            var rhs = right(scope, locals, assign, inputs),
                                values = [],
                                i = 0,
                                value;

                            if (rhs.value != null) {    // Leave as is
                                ensureSafeObject(rhs.context, self.expression);
                                ensureSafeFunction(rhs.value, self.expression);

                                for (i = 0; i < args.length; i += 1) {
                                    values.push(ensureSafeObject(args[i](scope, locals, assign, inputs), self.expression));
                                }

                                value = ensureSafeObject(rhs.value.apply(rhs.context, values), self.expression);
                            }

                            return context ? { value: value } : value;
                        };
                case AST.AssignmentExpression:
                    left = this.recurse(ast.left, true, 1);
                    right = this.recurse(ast.right);
                    return function (scope, locals, assign, inputs) {
                        var lhs = left(scope, locals, assign, inputs),
                            rhs = right(scope, locals, assign, inputs);

                        ensureSafeObject(lhs.value, self.expression);
                        ensureSafeAssignContext(lhs.context);
                        lhs.context[lhs.name] = rhs;

                        return context ? {value: rhs} : rhs;
                    };
                case AST.ArrayExpression:
                    args = [];

                    forEach(
                        ast.elements,
                        function (expr) {
                            args.push(self.recurse(expr));
                        }
                    );

                    return function (scope, locals, assign, inputs) {
                        var value = [],
                            i = 0;

                        for (i = 0; i < args.length; i += 1) {
                            value.push(args[i](scope, locals, assign, inputs));
                        }

                        return context ? {value: value} : value;
                    };
                case AST.ObjectExpression:
                    args = [];

                    forEach(
                        ast.properties,
                        function (property) {
                            args.push({ key: property.key.type === AST.Identifier
                                ? property.key.name
                                : String(property.key.value),
                                value: self.recurse(property.value)
                            });
                        }
                    );

                    return function (scope, locals, assign, inputs) {
                        var value = {},
                            i = 0;

                        for (i = 0; i < args.length; i += 1) {
                            value[args[i].key] = args[i].value(scope, locals, assign, inputs);
                        }

                        return context ? {value: value} : value;
                    };
                case AST.ThisExpression:
                    return function (scope) {
                        return context ? { value: scope } : scope;
                    };
                case AST.LocalsExpression:
                    return function (scope_na, locals) {
                        return context ? { value: locals } : locals;
                    };
                case AST.NGValueParameter:
                    return function (scope_na, locals_na, assign) {
                        return context ? { value: assign } : assign;
                    };
            }

            msos.console.warn('ng - ASTInterpreter.prototype.recurse -> no matching case!');
            return '';
        },

        'unary+': function (argument, context) {
            return function (scope, locals, assign, inputs) {
                var arg = argument(scope, locals, assign, inputs);

                if (isDefined(arg)) {
                    arg = +arg;
                } else {
                    arg = 0;
                }

                return context ? { value: arg } : arg;
            };
        },
        'unary-': function (argument, context) {
            return function (scope, locals, assign, inputs) {
                var arg = argument(scope, locals, assign, inputs);

                if (isDefined(arg)) {
                    arg = -arg;
                } else {
                    arg = 0;
                }

                return context ? { value: arg } : arg;
            };
        },
        'unary!': function (argument, context) {
            return function (scope, locals, assign, inputs) {
                var arg = !argument(scope, locals, assign, inputs);

                return context ? { value: arg } : arg;
            };
        },
        'binary+': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var lhs = left(scope, locals, assign, inputs),
                    rhs = right(scope, locals, assign, inputs),
                    arg = plusFn(lhs, rhs);

                return context ? { value: arg } : arg;
            };
        },
        'binary-': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var lhs = left(scope, locals, assign, inputs),
                    rhs = right(scope, locals, assign, inputs),
                    arg = (isDefined(lhs) ? lhs : 0) - (isDefined(rhs) ? rhs : 0);

                return context ? { value: arg } : arg;
            };
        },
        'binary*': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) * right(scope, locals, assign, inputs);

                return context ? { value: arg } : arg;
            };
        },
        'binary/': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) / right(scope, locals, assign, inputs);

                return context ? { value: arg } : arg;
            };
        },
        'binary%': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) % right(scope, locals, assign, inputs);

                return context ? { value: arg } : arg;
            };
        },
        'binary===': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) === right(scope, locals, assign, inputs);

                return context ? { value: arg } : arg;
            };
        },
        'binary!==': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) !== right(scope, locals, assign, inputs);

                return context ? { value: arg } : arg;
            };
        },
        'binary==': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) == right(scope, locals, assign, inputs);

                return context ? { value: arg } : arg;
            };
        },
        'binary!=': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) != right(scope, locals, assign, inputs);

                return context ? { value: arg } : arg;
            };
        },
        'binary<': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) < right(scope, locals, assign, inputs);

                return context ? { value: arg } : arg;
            };
        },
        'binary>': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) > right(scope, locals, assign, inputs);

                return context ? { value: arg } : arg;
            };
        },
        'binary<=': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) <= right(scope, locals, assign, inputs);

                return context ? { value: arg } : arg;
            };
        },
        'binary>=': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) >= right(scope, locals, assign, inputs);

                return context ? { value: arg } : arg;
            };
        },
        'binary&&': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) && right(scope, locals, assign, inputs);

                return context ? { value: arg } : arg;
            };
        },
        'binary||': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) || right(scope, locals, assign, inputs);
                
                return context ? { value: arg } : arg;
            };
        },
        'ternary?:': function (test, alternate, consequent, context) {
            return function (scope, locals, assign, inputs) {
                var arg = test(scope, locals, assign, inputs) ? alternate(scope, locals, assign, inputs) : consequent(scope, locals, assign, inputs);
                
                return context ? { value: arg } : arg;
            };
        },
        value: function (value, context) {
            return function () { return context ? { context: undefined, name: undefined, value: value } : value; };
        },
        identifier: function (name, context, create, expression) {
            return function (scope, locals) {
                var base = locals && (locals.hasOwnProperty(name)) ? locals : scope,
                    value;

                if (create && create !== 1 && base && !(base[name])) {
                    base[name] = {};
                }

                value = base ? base[name] : undefined;

                ensureSafeObject(value, expression);

                if (context) {
                    return { context: base, name: name, value: value };
                }

                return value;
            };
        },
        computedMember: function (left, right, context, create, expression) {
            return function (scope, locals, assign, inputs) {
                var lhs = left(scope, locals, assign, inputs),
                    rhs,
                    value;

                if (lhs != null) {  // jshint ignore:line
                    rhs = right(scope, locals, assign, inputs);
                    rhs = getStringValue(rhs);

                    ensureSafeMemberName(rhs, expression);

                    if (create && create !== 1) {
                        ensureSafeAssignContext(lhs);
                        if (lhs && !(lhs[rhs])) { lhs[rhs] = {}; }
                    }

                    value = lhs[rhs];
                    ensureSafeObject(value, expression);
                }
                if (context) {
                    return { context: lhs, name: rhs, value: value };
                }

                return value;
            };
        },
        nonComputedMember: function (left, right, context, create, expression) {
            return function (scope, locals, assign, inputs) {
                var lhs = left(scope, locals, assign, inputs),
                    value;

                if (create && create !== 1) {
                    ensureSafeAssignContext(lhs);
                    if (lhs && !(lhs[right])) { lhs[right] = {}; }
                }

                value = lhs != null ? lhs[right] : undefined;   // jshint ignore:line

                ensureSafeObject(value, expression);

                if (context) {
                    return { context: lhs, name: right, value: value };
                }

                return value;
            };
        },
        inputs: function (input, watchId) {
            return function (scope, value, locals, inputs) {
                if (inputs) { return inputs[watchId]; }

                return input(scope, value, locals);
            };
        }
    };

    /**
     * @constructor
     */
    Parser = function (lexer, $filter, options) {
        this.lexer = lexer;
        this.$filter = $filter;
        this.options = options;
        this.ast = new AST(this.lexer);
        this.astCompiler = new ASTInterpreter(this.ast, $filter);
    };

    Parser.prototype = {
        constructor: Parser,

        parse: function (text) {
            return this.astCompiler.compile(text);
        }
    };

    function $ParseProvider() {
        var cacheExpensive = createMap();

        this.$get = ['$filter', function ($filter) {

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

            function inputsWatchDelegate(scope, listener, objectEquality, parsedExpression, prettyPrintExpression) {
                var inputExpressions = parsedExpression.inputs,
                    lastResult,
                    oldInputValueOf,
                    oldInputValueOfValues = [],
                    oldInputValues = [],
                    i = 0,
                    ii = 0;

                if (inputExpressions.length === 1) {
                    oldInputValueOf = expressionInputDirtyCheck; // init to something unique so that equals check fails
                    inputExpressions = inputExpressions[0];

                    return scope.$watch(
                        function expressionInputWatch(scope) {
                            var newInputValue = inputExpressions(scope);

                            if (!expressionInputDirtyCheck(newInputValue, oldInputValueOf)) {
                                lastResult = parsedExpression(scope, undefined, undefined, [newInputValue]);
                                oldInputValueOf = newInputValue && getValueOf(newInputValue);
                            }

                            return lastResult;
                        },
                        listener,
                        objectEquality,
                        prettyPrintExpression
                    );
                }

                for (i = 0, ii = inputExpressions.length; i < ii; i += 1) {
                    oldInputValueOfValues[i] = expressionInputDirtyCheck; // init to something unique so that equals check fails
                    oldInputValues[i] = null;
                }

                return scope.$watch(
                    function expressionInputsWatch(scope) {
                        var changed = false,
                            j = 0,
                            jj = 0,
                            newInputValue;

                        for (j = 0, jj = inputExpressions.length; j < jj; j += 1) {
                            newInputValue = inputExpressions[j](scope);

                            if (changed || (changed = !expressionInputDirtyCheck(newInputValue, oldInputValueOfValues[j]))) {
                                oldInputValues[j] = newInputValue;
                                oldInputValueOfValues[j] = newInputValue && getValueOf(newInputValue);
                            }
                        }

                        if (changed) {
                            lastResult = parsedExpression(scope, undefined, undefined, oldInputValues);
                        }

                        return lastResult;
                    },
                    listener,
                    objectEquality,
                    prettyPrintExpression
                );
            }

            function oneTimeWatchDelegate(scope, listener, objectEquality, parsedExpression) {
                var unwatch,
                    lastValue;

                unwatch = scope.$watch(
                    function oneTimeWatch(scope) {
                        return parsedExpression(scope);
                    },
                    function oneTimeListener(value, old_na, scope) {
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
                    forEach(value, function (val) {
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

            function constantWatchDelegatePP(scope, listener, objectEquality, parsedExpression) {
                var unwatch = scope.$watch(
                        function constantWatch(scope) {
                            unwatch();
                            return parsedExpression(scope);
                        },
                        listener,
                        objectEquality
                    );

                return unwatch;
            }

            function addInterceptor(parsedExpression, interceptorFn) {

                if (!interceptorFn) { return parsedExpression; }

                var watchDelegate = parsedExpression.$$watchDelegate,
                    useInputs = false,
                    regularWatch = watchDelegate !== oneTimeLiteralWatchDelegate && watchDelegate !== oneTimeWatchDelegate,
                    fn = regularWatch
                        ? function regularInterceptedExpression(scope, locals, assign, inputs) {
                            var value = useInputs && inputs ? inputs[0] : parsedExpression(scope, locals, assign, inputs);

                            return interceptorFn(value, scope, locals);
                        }
                        : function oneTimeInterceptedExpression(scope, locals, assign, inputs) {
                            var value = parsedExpression(scope, locals, assign, inputs),
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
                    useInputs = !parsedExpression.inputs;
                    fn.inputs = parsedExpression.inputs || [parsedExpression];
                }

                return fn;
            }

            function expensiveChecksInterceptor(fn) {
                var i = 0;

                if (!fn || typeof fn !== 'function') { return fn; }

                function expensiveCheckFn(scope, locals, assign, inputs) {
                    var fn_output;

                    try {
                        fn_output = fn(scope, locals, assign, inputs);
                    } catch (e) {
                        msos.console.error('ng - $ParseProvider - $get - expensiveCheckFn -> failed, inputs: ' + inputs, e);
                    }

                    return fn_output;
                }

                expensiveCheckFn.$$watchDelegate = fn.$$watchDelegate;
                expensiveCheckFn.assign = expensiveChecksInterceptor(fn.assign);
                expensiveCheckFn.constant = fn.constant;
                expensiveCheckFn.literal = fn.literal;

                for (i = 0; fn.inputs && i < fn.inputs.length; ++i) {
                    fn.inputs[i] = expensiveChecksInterceptor(fn.inputs[i]);
                }

                expensiveCheckFn.inputs = fn.inputs;

                return expensiveCheckFn;
            }

            function $parse(exp, interceptorFn) {
                var parsedExpression,
                    oneTime,
                    cacheKey,
                    cache,
                    lexer,
                    parser;

                switch (typeof exp) {

                    case 'string':
                        exp = exp.trim();
                        cacheKey = exp;

                        cache = cacheExpensive;
                        parsedExpression = cache[cacheKey];

                        if (!parsedExpression) {
                            if (exp.charAt(0) === ':' && exp.charAt(1) === ':') {
                                oneTime = true;
                                exp = exp.substring(2);
                            }

                            lexer = new Lexer();
                            parser = new Parser(lexer, $filter);

                            parsedExpression = parser.parse(exp);

                            if (parsedExpression.constant) {
                                parsedExpression.$$watchDelegate = constantWatchDelegatePP;
                            } else if (oneTime) {
                                parsedExpression.$$watchDelegate = parsedExpression.literal
                                    ? oneTimeLiteralWatchDelegate
                                    : oneTimeWatchDelegate;
                            } else if (parsedExpression.inputs) {
                                parsedExpression.$$watchDelegate = inputsWatchDelegate;
                            }

                            // Add v1.5.0, expensiveChecksInterceptor()
                            parsedExpression = expensiveChecksInterceptor(parsedExpression);
                            cache[cacheKey] = parsedExpression;
                        }

                        return addInterceptor(parsedExpression, interceptorFn);

                    case 'function':
                        return addInterceptor(exp, interceptorFn);

                    default:
                        return addInterceptor(noop, interceptorFn);
                }
            }

            $parse.$$runningExpensiveChecks = function () { return true; };

            return $parse;
        }];
    }

    function qFactory(nextTick, pvdr) {
        var temp_qf = 'ng - ' + pvdr + ' - qFactory',
            $qMinErr = minErr('$q', TypeError),
            count = 0,
            pq_cnt = 0,
            defer_qf,
            reject_qf,
            when_qf,
            resolve_qf,
            all_qf,
            $Q;

        function processQueue(state) {
            var temp_pq = temp_qf + ' - processQueue -> ',
                fn,
                deferred_pq,
                pending = state.pending,
                i = 0,
                ii = pending.length,
                pq_debug = '';

            msos_debug(temp_pq + 'start, ' + state.name + ', status: ' + state.status);

            pq_cnt += 1;

            for (i = 0; i < ii; i += 1) {

                deferred_pq = pending[i][0];
                fn = pending[i][state.status];

                pq_debug += ', index: ' + i + ', ';

                try {

                    if (_.isFunction(fn)) {
                        pq_debug += 'for a function';
                        deferred_pq.resolve(fn(state.value));
                    } else if (state.status === 1) {
                        pq_debug += 'for status: 1';
                        deferred_pq.resolve(state.value);
                    } else {
                        pq_debug += 'for status: ' + state.status;
                        deferred_pq.reject(state.value);
                    }

                } catch (e) {
                    msos.console.error(temp_pq + 'failed' + pq_debug + ' 8===> ', e);
                    deferred_pq.reject(e);
                }
            }

            state.processScheduled = false;
            state.pending = [];

            msos_debug(temp_pq + ' done, ' + state.name + pq_debug);
        }

        function scheduleProcessQueue(state) {
            var temp_sp = temp_qf + ' - scheduleProcessQueue',
                debug_out = ', ' + state.name + ', status: ' + state.status;

            msos_debug(temp_sp + ' -> start' + debug_out);

            if (state.processScheduled) {
                msos_debug(temp_sp + ' ->  done' + debug_out + ' >> is already scheduled!');
                return;
            }

            state.processScheduled = true;

            nextTick(
                function () { processQueue(state); },
                state.name
            );

            msos_debug(temp_sp + ' ->  done' + debug_out + ' nextTick called!');
        }

        function Promise(type) {

            count += 1;

            this.$$state = {
                status: 0,
                name: type + ':' + count,
                processScheduled: false,
                pending: []
            };
        }

        function Deferred(type) {
            this.promise = new Promise(type);
        }

        extend(
            Promise.prototype,
            {
                then: function (onFulfilled, onRejected, progressBack) {
                    var temp_t = ' - Promise.then -> ',
                        t_name = this.$$state.name,
                        result;

                    msos_debug(temp_qf + temp_t + 'start: ' + t_name);

                    if (_.isUndefined(onFulfilled)
                     && _.isUndefined(onRejected)
                     && _.isUndefined(progressBack)) {
                        msos_debug(temp_qf + temp_t + 'done, no inputs: ' + t_name);
                        return this;
                    }

                    result = new Deferred(t_name);

                    this.$$state.pending.push([result, onFulfilled, onRejected, progressBack]);

                    if (this.$$state.status > 0) {
                        scheduleProcessQueue(this.$$state);
                    }

                    msos_debug(temp_qf + temp_t + ' done: ' + t_name);

                    return result.promise;
                },
                'catch': function (callback) {
                    return this.then(null, callback);
                },
                'finally': function (callback, progressBack) {

                    function makePromise(value, resolved, type) {

                        var result = new Deferred('ng_Promise_finally_' + type);

                        if (resolved)   { result.resolve(value); }
                        else            { result.reject(value);  }

                        return result.promise;
                    }

                    function handleCallback(value, isResolved, callback) {
                        var callbackOutput = null;

                        try {
                            if (_.isFunction(callback)) { callbackOutput = callback(); }
                        } catch (e) {
                            return makePromise(e, false, 'catch_error');
                        }

                        if (isPromiseLike(callbackOutput)) {
                            return callbackOutput.then(
                                function () {
                                    return makePromise(value, isResolved, 'promise_like_success');
                                },
                                function (error) {
                                    return makePromise(error, false, 'promise_like_fail');
                                }
                            );
                        }

                        return makePromise(value, isResolved, 'resolved');
                    }

                    return this.then(
                        function (value) {
                            return handleCallback(value, true, callback);
                        },
                        function (error) {
                            return handleCallback(error, false, callback);
                        },
                        progressBack
                    );
                }
            }
        );

        Deferred.prototype = {

            resolve: function (val) {
                var temp_r = ' - Deferred.resolve -> ',
                    self = this,
                    ps = self.promise.$$state,
                    r_name = ps.name,
                    r_stat = ps.status;

                if (verbose) {
                    msos_debug(temp_qf + temp_r + 'start: ' + r_name);
                }

                if (r_stat) {
                    if (verbose) {
                        msos_debug(temp_qf + temp_r + ' done: ' + r_name + ', for status: ' + r_stat);
                    }
                    return;
                }

                if (val === self.promise) {
                    self.$$reject('Resolve input object === Promise object');
                } else {
                    self.$$resolve(val);
                }

                if (verbose) {
                    msos_debug(temp_qf + temp_r + ' done: ' + r_name);
                }
            },

            $$resolve: function (val) {
                var temp_rr = ' - Deferred.$$resolve -> ',
                    self = this,
                    ps = self.promise.$$state,
                    r_name = ps.name,
                    r_dbug = 'error',
                    then,
                    done = false;

                if (verbose) {
                    msos_debug(temp_qf + temp_rr + 'start: ' + r_name);
                }

                function resolvePromise(val) {
                    if (done) { return; }
                    done = true;
                    self.$$resolve(val);
                }

                function rejectPromise(val) {
                    if (done) { return; }
                    done = true;
                    self.$$reject(val);
                }

                try {

                    if ((_.isObject(val) || _.isFunction(val))) {
                        then = val && val.then;
                    }

                    if (_.isFunction(then)) {
                        ps.status = -1;
                        then.call(val, resolvePromise, rejectPromise, _.bind(self.notify, self));
                        r_dbug = 'status: -1, then.call';
                    } else {
                        ps.value = val;
                        ps.status = 1;
                        if (ps.pending.length) { scheduleProcessQueue(ps); }

                        r_dbug = 'status: 1, pending: ' + ps.pending.length;
                    }

                } catch (e) {
                    msos.console.error(temp_qf + temp_rr + 'failed:', e);
                    rejectPromise(e);
                }

                if (verbose) {
                    msos_debug(temp_qf + temp_rr + ' done: ' + r_name + ', ' + r_dbug);
                }
            },

            reject: function (reason) {
                var temp_j = ' - Deferred.reject -> ',
                    self = this,
                    ps = self.promise.$$state,
                    j_name = ps.name,
                    j_stat = ps.status;

                msos_debug(temp_qf + temp_j + 'start: ' + j_name);

                if (j_stat) {
                    msos_debug(temp_qf + temp_j + ' done: ' + j_name + ', for status: ' + j_stat);
                    return;
                }

                self.$$reject(reason);

                msos_debug(temp_qf + temp_j + ' done: ' + j_name + ', for status: ' + j_stat);
            },

            $$reject: function (reason) {
                var temp_jj = ' - Deferred.$$reject -> ',
                    self = this,
                    ps = self.promise.$$state,
                    j_name = ps.name,
                    j_stat = ps.status;

                msos_debug(temp_qf + temp_jj + 'start: ' + j_name);

                ps.value = reason;
                ps.status = 2;
                scheduleProcessQueue(ps);

                msos_debug(temp_qf + temp_jj + ' done: ' + j_name + ', for status: ' + j_stat);
            },

            notify: function (progress) {
                var temp_n = ' - Deferred.notify',
                    self = this,
                    ps = self.promise.$$state,
                    n_name = ps.name,
                    n_stat = ps.status,
                    callbacks = ps.pending,
                    db_n = '';

                msos_debug(temp_qf + temp_n + ' -> start: ' + n_name + ', progress: ' + progress);

                if ((n_stat <= 0) && callbacks && callbacks.length) {
                    db_n = ' process nextTick';
                    nextTick(
                        function () {
                            var temp_nt = ' - (nextTick) callbacks -> ',
                                callback,
                                result,
                                i = 0;

                            if (verbose) {
                                msos_debug(temp_qf + temp_n + temp_nt + 'start.');
                            }

                            for (i = 0; i < callbacks.length; i += 1) {
                                result = callbacks[i][0];
                                callback = callbacks[i][3];
                                try {
                                    result.notify(_.isFunction(callback) ? callback(progress) : progress);
                                } catch (e) {
                                    msos.console.error(temp_qf + temp_n + temp_nt + 'failed:', e);
                                }
                            }

                            if (verbose) {
                                msos_debug(temp_qf + temp_n + temp_nt + 'done!');
                            }
                        },
                        n_name
                    );
                }

                msos_debug(temp_qf + temp_n + ' ->  done: ' + n_name + db_n + ', for status: ' + n_stat);
            }
        };

        defer_qf = function (origin) {
            var d = new Deferred(origin);

            // Necessary to support unbound execution :/
            d.resolve = _.bind(d.resolve, d);
            d.reject =  _.bind(d.reject, d);
            d.notify =  _.bind(d.notify, d);

            return d;
        };

        reject_qf = function (d, reason) {
            d.reject(reason);
            return d.promise;
        };

        when_qf = function (d, value, callback, errback, progressBack) {
            if (verbose) { msos_debug(temp_qf + ' - when_qf -> start.'); }

            d.resolve(value);

            var d_prom_out = d.promise.then(callback, errback, progressBack);

            if (verbose) { msos_debug(temp_qf + ' - when_qf -> done!'); }
            return d_prom_out;
        };

        resolve_qf = when_qf;

        all_qf = function (d, promises) {
            var counter = 0,
                results = _.isArray(promises) ? [] : {};

            msos_debug(temp_qf + ' - all_qf -> start, promises: ' + promises.length);

            forEach(
                promises,
                function (promise, key) {
                    counter += 1;

                    when_qf(defer_qf('ng_all_when_qFactory_' + key), promise).then(
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

            msos_debug(temp_qf + ' - all_qf -> done!');
            return d.promise;
        };

        $Q = function Q(q_resolver) {

            if (!_.isFunction(q_resolver)) {
                throw $qMinErr(
                    'norslvr',
                    "Expected resolverFn, got '{0}'",
                    q_resolver
                );
            }

            var deferred_Q = new Deferred('ng_$Q');

            function resolveFn_Q(value) { deferred_Q.resolve(value); }

            function rejectFn_Q(reason) { deferred_Q.reject(reason); }

            q_resolver(resolveFn_Q, rejectFn_Q);

            return deferred_Q.promise;
        };

        // Let's make the instanceof operator work for promises, so that
        // `new $q(fn) instanceof $q` would evaluate to true.
        $Q.prototype = Promise.prototype;

        $Q.defer = defer_qf;
        $Q.reject = reject_qf;
        $Q.when = when_qf;
        $Q.resolve = resolve_qf;
        $Q.all = all_qf;

        return $Q;
    }

    function $QProvider() {
        var temp_qp = 'ng - $QProvider';

        msos_debug(temp_qp + ' -> start');

        this.$get = ['$rootScope', function ($rootScope) {
            return qFactory(
                    function (callback, state_name) {
                        var temp_rs = ' - $rootScope.$evalAsync -> ';

                        if (verbose) { msos_debug(temp_qp + temp_rs + 'start, state name: ' + state_name); }
    
                        $rootScope.$evalAsync(
                            callback,
                            { directive_name: '$Q_' + state_name }
                        );

                        if (verbose) { msos_debug(temp_qp + temp_rs + ' done, state name: ' + state_name); }
                    },
                    '$q'
                );
            }
        ];

        msos_debug(temp_qp + ' -> done!');
    }

    function $$QProvider() {
        var temp_qqp = 'ng - $$QProvider';
        
        msos_debug(temp_qqp + ' -> start');

        this.$get = ['$browser', function ($browser) {
            return qFactory(
                    function (callback) {
                        if (verbose) {
                            msos_debug(temp_qqp + ' - $browser.defer -> start.');
                        }

                        $browser.defer(callback);

                        if (verbose) {
                            msos_debug(temp_qqp + ' - $browser.defer -> done!');
                        }
                    },
                    '$$q'
                );
            }
        ];

        msos_debug(temp_qqp + ' -> done!');
    }

    function $$RAFProvider() { //rAF
        this.$get = ['$window', '$timeout', function ($window, $timeout) {
            var requestAnimationFrame = $window.requestAnimationFrame
                                     || $window.webkitRequestAnimationFrame,
                cancelAnimationFrame = $window.cancelAnimationFrame
                                    || $window.webkitCancelAnimationFrame
                                    || $window.webkitCancelRequestAnimationFrame,
                rafSupported = !!requestAnimationFrame,
                raf;

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
            applyAsyncId = null,
            rvs = (verbose === 'scope');

        this.digestTtl = function (value) {
            if (arguments.length) {
                TTL = value;
            }
            return TTL;
        };

        function createChildScopeClass(parent) {
            function ChildScope() {
                this.$$watchers = this.$$nextSibling = this.$$childHead = this.$$childTail = null;
                this.$$listeners = {};
                this.$$listenerCount = {};
                this.$$watchersCount = 0;
                this.$id = nextUid();
                this.$$ChildScope = null;
            }

            ChildScope.prototype = parent;
            return ChildScope;
        }

        this.$get = ['$parse', '$browser', function ($parse, $browser) {

            var $rootScope_P,
                asyncQueue = [],
                postDigestQueue = [],
                applyAsyncQueue = [];

            msos_debug(temp_rsp + '$get -> start.');

            function destroyChildScope($event) {
                $event.currentScope.$$destroyed = true;
            }

            function cleanUpScope($scope) {
                if (msie === 9) {
                    // See issue https://github.com/angular/angular.js/issues/10706
                    if ($scope.$$childHead)     { cleanUpScope($scope.$$childHead); }
                    if ($scope.$$nextSibling)   { cleanUpScope($scope.$$nextSibling); }
                }

                $scope.$parent = $scope.$$nextSibling = $scope.$$prevSibling = $scope.$$childHead =
                    $scope.$$childTail = $scope.$root = $scope.$$watchers = null;
            }

            function incrementWatchersCount(current, increment, name) {
                var temp_il = temp_rsp + '$get - incrementWatchersCount -> ';

                if (rvs) {
                    msos_debug(temp_il + 'called, by: ' + name + ', increment by: ' + increment);
                }

                do {
                    current.$$watchersCount += increment;
                } while ((current = current.$parent));
            }

            function decrementListenerCount(current, increment, ev_name) {

                var temp_dl = temp_rsp + '$get - decrementListenerCount -> ';

                msos_debug(temp_dl + 'called, event: ' + ev_name + ', increment: ' + increment);

                do {
                    current.$$listenerCount[ev_name] -= increment;

                    if (current.$$listenerCount[ev_name] === 0) {
                        delete current.$$listenerCount[ev_name];
                        msos_debug(temp_dl + 'done, scope: ' + current.$id);
                    }
                } while ((current = current.$parent));
            }

            function initWatchVal() { return undefined; }

            function flushApplyAsync() {
                var temp_fa = '$get - flushApplyAsync -> ',
                    db_note;

                msos.console.info(temp_rsp + temp_fa + 'start, applyAsyncQueue: ' + applyAsyncQueue.length);

                while (applyAsyncQueue.length) {
                    try {
                        applyAsyncQueue.shift()();
                    } catch (e) {
                        db_note += ' at index ' + (applyAsyncQueue.length + 1) + ':';

                        msos.console.error(temp_rsp + temp_fa + 'failed' + db_note, e);
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
                this.$$watchersCount = 0;
                this.$$isolateBindings = null;
            }

            Scope.prototype = {

                constructor: Scope,

                $new: function (isolate, parent) {
                    var child;

                    parent = parent || this;

                    if (isolate) {
                        child = new Scope();
                        child.$root = this.$root;
                    } else {
                        // Only create a child scope class if somebody asks for one,
                        // but cache it to allow the VM to optimize lookups.
                        if (!this.$$ChildScope) {
                            this.$$ChildScope = createChildScopeClass(this);
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

                    // When the new scope is not isolated or we inherit from `this`, and
                    // the parent scope is destroyed, the property `$$destroyed` is inherited
                    // prototypically. In all other cases, this property needs to be set
                    // when the parent scope is destroyed.
                    // The listener needs to be added after the parent is set
                    if (isolate || parent != this) { child.$on('$destroy', destroyChildScope); }    // Leave as is.

                    return child;
                },

                $watch: function (watchExp, listener, objectEquality, prettyPrintExpression) {

                    var scope = this,
                        array = [],
                        watcher = {},
                        get = $parse(watchExp),
                        expr_name;

                    if (rvs) {
                        expr_name = _.isFunction(watchExp)
                                ? 'fn: ' + (watchExp.name || watchExp.toString())
                                : watchExp;

                        msos_debug(temp_rsp + '$get - Scope.$watch -> start, for: ' + expr_name);
                    }

                    if (get.$$watchDelegate) {

                        if (rvs) {
                            msos_debug(temp_rsp + '$get - Scope.$watch ->  done, use get.$$watchDelegate');
                        }

                        return get.$$watchDelegate(this, listener, objectEquality, get, watchExp);
                    }

                    array = scope.$$watchers;

                    watcher = {
                        fn: listener,
                        last: initWatchVal,
                        get: get,
                        exp: prettyPrintExpression || watchExp,
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
                    incrementWatchersCount(this, 1, '$watch');

                    if (rvs) {
                        msos_debug(temp_rsp + '$get - Scope.$watch ->  done!');
                    }

                    return function deregisterWatch() {
                        if (rvs) {
                            msos_debug(temp_rsp + '$get - Scope.$watch - deregisterWatch -> called.');
                        }
                        if (arrayRemove(array, watcher) >= 0) {
                            incrementWatchersCount(scope, -1, '$watch');
                        }
                        lastDirtyWatch = null;
                    };
                },

                $watchGroup: function (watchExpressions, listener) {
                    var oldValues = new Array(watchExpressions.length),     // Leave as is, (empty array, w/ length of watchExpressions.length )
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
                                if (hasOwnProperty.call(newValue, key)) {
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
                                    if (!hasOwnProperty.call(newValue, key)) {
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
                    var temp_dg = '$get - Scope - $digest ~~~> ',
                        db_note = '',
                        watch,
                        value,
                        last,
                        fn,
                        get,
                        watchers,
                        check_nan,
                        length,
                        dirty = false,
                        ttl = TTL,
                        next,
                        current,
                        target = this,
                        watchLog = [],
                        logIdx,
                        asyncTask,
                        process_async_queue = 0,
                        process_post_queue = 0;

                    msos_debug(temp_rsp + temp_dg + 'start, asyncQueue: ' + asyncQueue.length + ', postDigestQueue: ' + postDigestQueue.length);

                    if ($rootScope_P.$$phase) {

                        msos.console.warn(temp_rsp + temp_dg + 'already in progress, phase: ' + $rootScope_P.$$phase);
                        return;
                    }

                    $rootScope_P.$$phase = '$digest';

                    // Check for changes to browser url that happened in sync before the call to $digest
                    $browser.$$checkUrlChange();

                    if (this === $rootScope_P && applyAsyncId !== null) {

                        msos_debug(temp_rsp + temp_dg + 'for root scope and applyAsyncId, cancel $browser.defer');

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
                            process_async_queue += 1;
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
                                            get = watch.get;
                                            if (
                                                (value = get(current)) !== (last = watch.last)
                                             && !(watch.eq ? equals(value, last) : (typeof value === 'number' && typeof last === 'number' && isNaN(value) && isNaN(last)))
                                            ) {
                                                dirty = true;
                                                lastDirtyWatch = watch;
                                                watch.last = watch.eq ? copy(value, null) : value;
                                                fn = watch.fn;
                                                fn(value, ((last === initWatchVal) ? value : last), current);

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
                                    } catch (err) {
                                        db_note = ' at index ' + length + ' (' + (_.isFunction(watch.exp) ? 'fn: ' + (watch.exp.name || watch.exp.toString()) : watch.exp) + '):\n';

                                        msos.console.error(temp_rsp + temp_dg + 'traverseScopesLoop, failed' + db_note, err);
                                    }
                                }
                            }

                            if (!(next = ((current.$$watchersCount && current.$$childHead) || (current !== target && current.$$nextSibling)))) {
                                while (current !== target && !(next = current.$$nextSibling)) {
                                    current = current.$parent;
                                }
                            }

                        } while ((current = next));

                        // `break traverseScopesLoop;` takes us to here
                        if ((dirty || asyncQueue.length) && !(ttl--)) {     // ttl-- is written as needed
                            // clearPhase
                            $rootScope_P.$$phase = null;

                            db_note = $rootScopeMinErr(
                                'infdig',
                                '{0} $digest() iterations reached. Aborting!\n' +
                                'Watchers from last 5 iterations:',
                                TTL
                            );

                            flushApplyAsync();

                            // Probably bad, so show as error
                            msos.console.error(temp_rsp + temp_dg + db_note, watchLog);
                            return;
                        }

                    } while (dirty || asyncQueue.length);

                    // clearPhase
                    $rootScope_P.$$phase = null;

                    while (postDigestQueue.length) {
                        try {
                            postDigestQueue.shift()();
                        } catch (ignore) {
                            db_note = ' at index ' + (postDigestQueue.length + 1) + ':';

                            msos.console.error(temp_rsp + temp_dg + 'failed' + db_note, ignore);
                        }
                        process_post_queue += 1;
                    }

                    msos_debug(temp_rsp + temp_dg + 'done, processed - async queue: ' + process_async_queue + ', post digest queue: ' + process_post_queue);
                },

                $destroy: function () {

                    if (verbose) {
                        msos_debug(temp_rsp + '$get - Scope - $destroy -> called.');
                    }

                    // we can't destroy the root scope or a scope that has been already destroyed
                    if (this.$$destroyed) { return; }

                    var parent = this.$parent,
                        eventName;

                    this.$broadcast('$destroy');
                    this.$$destroyed = true;

                    if (this === $rootScope_P) {
                        // Remove handlers attached to window when $rootScope is removed
                        $browser.$$applicationDestroyed();
                    }

                    incrementWatchersCount(this, -this.$$watchersCount, '$destroy');

                    for (eventName in this.$$listenerCount) {
                        if (this.$$listenerCount.hasOwnProperty(eventName)) {
                            decrementListenerCount(this, this.$$listenerCount[eventName], eventName);
                        } else {
                            msos.console.warn(temp_rsp + '$get - Scope - $destroy -> skipped proto for: ' + eventName);
                        }
                    }

                    // sever all the references to parent scopes (after this cleanup, the current scope should
                    // not be retained by any of our references and should be eligible for garbage collection)
                    if (parent && parent.$$childHead === this) { parent.$$childHead = this.$$nextSibling; }
                    if (parent && parent.$$childTail === this) { parent.$$childTail = this.$$prevSibling; }
                    if (this.$$prevSibling) { this.$$prevSibling.$$nextSibling = this.$$nextSibling; }
                    if (this.$$nextSibling) { this.$$nextSibling.$$prevSibling = this.$$prevSibling; }

                    // Disable listeners, watchers and apply/digest methods
                    this.$destroy = this.$digest = this.$apply = this.$evalAsync = this.$applyAsync = noop;
                    this.$on = this.$watch = this.$watchGroup = function () { return noop; };
                    this.$$listeners = {};

                    // Disconnect the next sibling to prevent `cleanUpScope` destroying those too
                    this.$$nextSibling = null;
                    cleanUpScope(this);
                },

                $eval: function (expr, locals) {
                    return $parse(expr)(this, locals);
                },

                $evalAsync: function (expr, locals) {
                    var temp_sy = '$get - Scope - $evalAsync -> ',
                        queue_obj = {};

                    if (verbose) {
                        msos_debug(temp_rsp + temp_sy + 'start, asyncQueue: ' + asyncQueue.length);
                    }

                    // if we are outside of an $digest loop and this is the first time we are scheduling async
                    // task also schedule async auto-flush
                    if (!$rootScope_P.$$phase && !asyncQueue.length) {
                        $browser.defer(
                            function () {
                                msos_debug(temp_rsp + temp_sy + '$browser.defer -> called, asyncQueue: ' + asyncQueue.length);

                                if (asyncQueue.length) {
                                    $rootScope_P.$digest();
                                }
                            }
                        );
                    }

                    queue_obj = {
                        scope: this,
                        expression: $parse(expr),
                        locals: locals
                    };

                    asyncQueue.push(queue_obj);

                    if (verbose) {
                        msos_debug(temp_rsp + temp_sy + ' done, asyncQueue: ' + asyncQueue.length + ', added: ' + (queue_obj.locals.directive_name || 'na'));
                    }
                },

                $$postDigest: function (fn) {
                    postDigestQueue.push(fn);
                },

                $apply: function (expr) {
                    var temp_ap = '$get - Scope - $apply #==> ',
                        dbug_app = ', for phase: ';

                    if (!$rootScope_P.$$phase) {
                        $rootScope_P.$$phase = '$apply';
                        dbug_app = ', initiated phase: ';
                    }

                    dbug_app += $rootScope_P.$$phase;

                    if (expr) {
                        dbug_app += ', with input ' + typeof expr;
                    }

                    msos.console.info(temp_rsp + temp_ap + 'start' + dbug_app);

                    try {

                        return this.$eval(expr);

                    } catch (ignore) {

                        msos.console.error(temp_rsp + temp_ap + 'error' + dbug_app, ignore);

                    } finally {

                        // clearPhase
                        $rootScope_P.$$phase = null;
                        $rootScope_P.$digest();

                        msos.console.info(temp_rsp + temp_ap + ' done' + dbug_app);
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

                    expr = $parse(expr);
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

            msos_debug(temp_rsp + '$get -> done!');

            return $rootScope_P;
        }];
    }

    function $$SanitizeUriProvider() {
        var aHrefSanitizationWhitelist = /^\s*(https?|ftp|mailto|tel|file):/,
            imgSrcSanitizationWhitelist = /^\s*((https?|ftp|file|blob):|data:image\/)/,
            temp_su = 'ng - $$SanitizeUriProvider';

        if (verbose) {
            msos_debug(temp_su + ' -> start.');
        }

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

                msos_debug(temp_su + ' - $get - sanitizeUri -> start, uri: ' + uri);

                var regex = isImage ? imgSrcSanitizationWhitelist : aHrefSanitizationWhitelist,
                    normalizedVal = urlResolve(uri, '$$SanitizeUriProvider - $get').href;

                if (normalizedVal !== '' && !normalizedVal.match(regex)) {
                    msos.console.warn(temp_su + ' - $get - sanitizeUri -> unsafe done, normalized: ' + normalizedVal);
                    return 'unsafe:' + normalizedVal;
                }

                msos_debug(temp_su + ' - $get - sanitizeUri ->  done, uri: ' + uri);
                return uri;
            };
        };

        if (verbose) {
            msos_debug(temp_su + ' -> done!');
        }
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

        msos_debug(temp_sd + ' -> start.');

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

            msos_debug(temp_sd + ' - $get -> start.');

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
                if (trustedValue === null || _.isUndefined(trustedValue) || trustedValue === '') {
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

                msos_debug(temp_sd + temp_gt + 'start,\n     type: ' + type + (maybeTrusted ? ', context: ' + maybeTrusted : ''));

                if (maybeTrusted === null || _.isUndefined(maybeTrusted) || maybeTrusted === '') {
                    msos_debug(temp_sd + temp_gt + 'done, for: ' + (maybeTrusted === null ? 'null' : 'undefined'));
                    return maybeTrusted;
                }

                constructor = (byType.hasOwnProperty(type) ? byType[type] : null);

                if (constructor && maybeTrusted instanceof constructor) {
                    msos_debug(temp_sd + temp_gt + 'done, constructor');
                    return maybeTrusted.$$unwrapTrustedValue();
                }
                // If we get here, then we may only take one of two actions.
                // 1. sanitize the value for the requested type, or
                // 2. throw an exception.
                if (type === SCE_CONTEXTS.RESOURCE_URL) {
                    if (isResourceUrlAllowedByPolicy(maybeTrusted)) {
                        msos_debug(temp_sd + temp_gt + 'done, policy');
                        return maybeTrusted;
                    }

                    throw $sceMinErr('insecurl', 'Blocked loading resource from url not allowed by $sceDelegate policy.  URL: {0}', maybeTrusted.toString());
                }

                if (type === SCE_CONTEXTS.HTML) {
                    msos_debug(temp_sd + temp_gt + 'done, sanitizer');
                    return htmlSanitizer(maybeTrusted);
                }

                throw $sceMinErr('unsafe', 'Attempting to use an unsafe value in a safe context.');
            }

            msos_debug(temp_sd + ' - $get -> done!');

            return {
                trustAs: trustAs,
                getTrusted: getTrusted,
                valueOf: valueOf
            };
        }];

        msos_debug(temp_sd + ' -> done!');
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
                sce.trustAs = sce.getTrusted = function (type_na, value) {
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
        var httpOptions;

        this.httpOptions = function (val) {
            if (val) {
                httpOptions = val;
                return this;
            }
            return httpOptions;
        };

        this.$get = ['$templateCache', '$http', '$q', '$sce', function ($templateCache, $http, $q, $sce) {
            var temp_tg = 'ng - $TemplateRequestProvider - $get';

            function handleRequestFn(tpl) {
                var transformResponse;

                handleRequestFn.totalPendingRequests += 1;

                if (!_.isString(tpl) || !$templateCache.get(tpl)) {
                    tpl = $sce.getTrustedResourceUrl(tpl);
                }

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

                function handleError(resp) {
                    if (msos.config.debug) {
                        throw $compileMinErr(
                            'tpload',
                            'Failed to load template: {0} (HTTP status: {1} {2})',
                            tpl,
                            resp.status,
                            resp.statusText
                        );
                    } else {
                        msos.console.warn(temp_tg + ' - handleRequestFn -> failed, template: ' + tpl);
                    }
                    return $q.reject($q.defer('ng_reject_handleRequestFn'), resp);
                }

                return $http.get(
                        tpl,
                        extend(
                            {
                                cache: $templateCache,
                                transformResponse: transformResponse
                            },
                            httpOptions
                        )
                    )['finally'](
                        function () {
                            handleRequestFn.totalPendingRequests -= 1;
                        }
                    ).then(
                        function (response) {
                            msos_debug(temp_tg + ' - handleRequestFn (then) -> called.');
                            $templateCache.put(tpl, response.data);
                            return response.data;
                        },
                        handleError
                    );
            }

            handleRequestFn.totalPendingRequests = 0;

            return handleRequestFn;
        }];
    }

    function $TimeoutProvider() {
        var temp_tp = 'ng - $TimeoutProvider';

        this.$get = ['$rootScope', '$browser', '$q', '$$q',
            function ($rootScope,   $browser,   $q,   $$q) {
                var deferreds = {};

                function timeout(fn_to, delay_to, invokeApply_to) {

                    if (!_.isFunction(fn_to)) {
                        invokeApply_to = delay_to;
                        delay_to = fn_to;
                        fn_to = noop;
                    }

                    var temp_to = ' - $get - timeout -> ',
                        args = sliceArgs(arguments, 3),
                        skipApply = (isDefined(invokeApply_to) && !invokeApply_to),
                        deferred = (skipApply ? $$q : $q).defer('ng_$TimeoutProvider_$get'),
                        promise = deferred.promise,
                        timeoutId;

                    msos_debug(temp_tp + temp_to + 'start, name: ' + promise.$$state.name + ', delay: ' + delay_to + ', invoke apply:', invokeApply_to);

                    timeoutId = $browser.defer(
                        function () {
                            try {
                                deferred.resolve(fn_to.apply(null, args));
                            } catch (e) {
                                msos.console.error(temp_tp + temp_to + 'failed:', e);
                                deferred.reject(e);
                            }
                            finally {
                                delete deferreds[promise.$$timeoutId];
                            }
    
                            if (!skipApply) { $rootScope.$apply(); }
                        },
                        delay_to
                    );

                    promise.$$timeoutId = timeoutId;
                    deferreds[timeoutId] = deferred;

                    msos_debug(temp_tp + temp_to + ' done, name: ' + promise.$$state.name);
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
            }
        ];
    }

    function $WindowProvider() {
        this.$get = valueFn(window);
    }

    function $$CookieReader($document) {
        var rawDocument = $document[0] || {},
            lastCookies = {},
            lastCookieString = '';

        function safeDecodeURIComponent(str) {
            try {
                return decodeURIComponent(str);
            } catch (e) {
                return str;
            }
        }

        return function () {
            var cookieArray,
                cookie,
                i,
                index,
                name,
                currentCookieString = rawDocument.cookie || '';

            if (currentCookieString !== lastCookieString) {
                lastCookieString = currentCookieString;
                cookieArray = lastCookieString.split('; ');
                lastCookies = {};

                for (i = 0; i < cookieArray.length; i+= 1) {
                    cookie = cookieArray[i];

                    index = cookie.indexOf('=');

                    if (index > 0) { //ignore nameless cookies
                        name = safeDecodeURIComponent(cookie.substring(0, index));

                        if (_.isUndefined(lastCookies[name])) {
                            lastCookies[name] = safeDecodeURIComponent(cookie.substring(index + 1));
                        }
                    }
                }
            }
            return lastCookies;
        };
    }

    $$CookieReader.$inject = ['$document'];

    function $$CookieReaderProvider() {
        this.$get = $$CookieReader;
    }

    function orderByFilter($parse) {

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

        function compare(v1, v2) {
            var result = 0;

            if (v1.type === v2.type) {
                if (v1.value !== v2.value) {
                    result = v1.value < v2.value ? -1 : 1;
                }
            } else {
                result = v1.type < v2.type ? -1 : 1;
            }

            return result;
        }

        function objectValue(value, index) {
            // If `valueOf` is a valid function use that
            if (typeof value.valueOf === 'function') {
                value = value.valueOf();
                if (isPrimitive(value)) { return value; }
            }
            // If `toString` is a valid function and not the one from `Object.prototype` use that
            if (hasCustomToString(value)) {
                value = value.toString();
                if (isPrimitive(value)) { return value; }
            }
            // We have a basic object so we use the position of the object in the collection
            return index;
        }

        function getPredicateValue(value, index) {
            var type = typeof value;

            if (value === null) {
                type = 'string';
                value = 'null';
            } else if (type === 'string') {
                value = value.toLowerCase();
            } else if (type === 'object') {
                value = objectValue(value, index);
            }

            return { value: value, type: type };
        }

        function processPredicates(sortPredicate, reverseOrder) {
            reverseOrder = reverseOrder ? -1 : 1;

            return sortPredicate.map(
                function (predicate) {
                    var descending = 1,
                        get = identity,
                        key;

                    if (_.isFunction(predicate)) {
                        get = predicate;
                    } else if (_.isString(predicate)) {
                        if ((predicate.charAt(0) === '+' || predicate.charAt(0) === '-')) {
                            descending = predicate.charAt(0) === '-' ? -1 : 1;
                            predicate = predicate.substring(1);
                        }
                        if (predicate !== '') {
                            get = $parse(predicate);
                            if (get.constant) {
                                key = get();
                                get = function (value) { return value[key]; };
                            }
                        }
                    }

                    return { get: get, descending: descending * reverseOrder };
                }
            );
        }
  
        return function (array, sortPredicate, reverseOrder) {
            var compareValues,
                predicates;

            if (array == null) { return array; }    // jshint ignore:line

            if (!isArrayLike(array)) {
                throw minErr('orderBy')(
                    'notarray',
                    'Expected array but received: {0}',
                    array
                );
            }

            function getComparisonObject(value, index) {
                return {
                    value: value,
                    predicateValues: predicates.map(
                        function (predicate) {
                            return getPredicateValue(predicate.get(value), index);
                        }
                    )
                };
            }

            function doComparison(v1, v2) {
                var result = 0,
                    index = 0;

                for (index = 0; index < predicates.length; index += 1) {
                    result = compare(v1.predicateValues[index], v2.predicateValues[index]) * predicates[index].descending;
                    if (result) { break; }
                }

                return result;
            }

            if (!_.isArray(sortPredicate))  { sortPredicate = [sortPredicate]; }
            if (sortPredicate.length === 0) { sortPredicate = ['+']; }

            predicates = processPredicates(sortPredicate, reverseOrder);
            predicates.push({ get: function () { return {}; }, descending: reverseOrder ? -1 : 1});

            // Swartzian Transform idiom from Perl (still just catching up to Perl...progress?)
            compareValues = Array.prototype.map.call(array, getComparisonObject);
            compareValues.sort(doComparison);

            array = compareValues.map(function (item) { return item.value; });

            return array;
        };
    }

    function getTypeForFilter(val) {
        return (val === null) ? 'null' : typeof val;
    }

    orderByFilter.$inject = ['$parse'];

    function deepCompare(actual, expected, comparator, matchAgainstAnyProp, dontMatchWholeObject) {
        var actualType = getTypeForFilter(actual),
            expectedType = getTypeForFilter(expected),
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

                    if (_.isFunction(expectedVal) || _.isUndefined(expectedVal)) { continue; }

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
            comparator = function (actual, expected) {

                if (_.isUndefined(actual)) {
                    // No substring matching against `undefined`
                    return false;
                }
                if ((actual === null) || (expected === null)) {
                    // No substring matching against `null`; only match against `null`
                    return actual === expected;
                }
                if (_.isObject(expected) || (_.isObject(actual) && !hasCustomToString(actual))) {
                    // Should not compare primitives against objects, unless they have custom `toString` method
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

            if (!isArrayLike(array)) {
                if (array === null || array === undefined) {
                    return array;
                }

                throw minErr('filter')(
                    'notarray',
                    'Expected array but received: {0}',
                    array
                );
            }

            var expressionType = getTypeForFilter(expression),
                predicateFn,
                matchAgainstAnyProp;

            switch (expressionType) {
                case 'function':
                    predicateFn = expression;
                    break;
                case 'boolean':
                case 'null':
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

            return Array.prototype.filter.call(array, predicateFn);
        };
    }

    function parseNumber(numStr) {
        var exponent = 0,
            digits,
            numberOfIntegerDigits = numStr.indexOf(DECIMAL_SEP),
            i = 0,
            j = 0,
            k = numStr.search(/e/i),
            zeros = 0;

        // Decimal point?
        if (numberOfIntegerDigits > -1) { numStr = numStr.replace(DECIMAL_SEP, ''); }

        // Exponential form?
        if (k > 0) {
            // Work out the exponent.
            if (numberOfIntegerDigits < 0) { numberOfIntegerDigits = k; }

            numberOfIntegerDigits += +numStr.slice(k + 1);
            numStr = numStr.substring(0, k);

        // Integer form?
        } else if (numberOfIntegerDigits < 0) {

            numberOfIntegerDigits = numStr.length;
        }

        // Count the number of leading zeros.
        while (numStr.charAt(i) === ZERO_CHAR) { i += 1; }

        zeros = numStr.length;

        if (i === zeros) {
            // The digits are all zero.
            digits = [0];
            numberOfIntegerDigits = 1;
        } else {
            // Count the number of trailing zeros
            zeros -= 1;

            while (numStr.charAt(zeros) === ZERO_CHAR) { zeros -= 1; }

            // Trailing zeros are insignificant so ignore them
            numberOfIntegerDigits -= i;
            digits = [];

            // Convert string to array of digits without leading/trailing zeros.
            for (j = 0; i <= zeros; i += 1, j += 1) {
                digits[j] = +numStr.charAt(i);
            }
        }

        // If the number overflows the maximum allowed digits then use an exponent.
        if (numberOfIntegerDigits > MAX_DIGITS) {
            digits = digits.splice(0, MAX_DIGITS - 1);
            exponent = numberOfIntegerDigits - 1;
            numberOfIntegerDigits = 1;
        }

        return { d: digits, e: exponent, i: numberOfIntegerDigits };
    }

    function roundNumber(parsedNumber, fractionSize, minFrac, maxFrac) {
        var digits = parsedNumber.d,
            fractionLen = digits.length - parsedNumber.i,
            roundAt,
            digit,
            i = 0,
            j = 0,
            carry;

        // determine fractionSize if it is not specified; `+fractionSize` converts it to a number
        fractionSize = (_.isUndefined(fractionSize)) ? Math.min(Math.max(minFrac, fractionLen), maxFrac) : +fractionSize;

        // The index of the digit to where rounding is to occur
        roundAt = fractionSize + parsedNumber.i;
        digit = digits[roundAt];

        if (roundAt > 0) {
            digits.splice(roundAt);
        } else {
            // We rounded to zero so reset the parsedNumber
            parsedNumber.i = 1;
            digits.length = roundAt = fractionSize + 1;
            for (i = 0; i < roundAt; i += 1) { digits[i] = 0; }
        }

        if (digit >= 5) { digits[roundAt - 1] += 1; }

        // Pad out with zeros to get the required fraction length
        for (j = fractionLen; j < fractionSize; j += 1) { digits.push(0); }

        // Do any carrying, e.g. a digit was rounded up to 10
        carry = digits.reduceRight(
            function (cry, d, i, dgts) {
                d = d + cry;
                dgts[i] = d % 10;
                return Math.floor(d / 10);
            },
            0
        );

        if (carry) {
            digits.unshift(carry);
            parsedNumber.i += 1;
        }
    }

    function formatNumber(number, pattern, groupSep, decimalSep, fractionSize) {

        if (!(_.isString(number) || _.isNumber(number)) || _.isNaN(number)) { return ''; }

        var isInfinity = !isFinite(number),
            isZero = false,
            numStr = Math.abs(number) + '',
            formattedText = '',
            parsedNumber,
            digits,
            integerLen,
            exponent,
            decimals = [],
            groups = [];

        if (isInfinity) {
            formattedText = '\u221e';
        } else {
            parsedNumber = parseNumber(numStr);

            roundNumber(parsedNumber, fractionSize, pattern.minFrac, pattern.maxFrac);

            digits = parsedNumber.d;
            integerLen = parsedNumber.i;
            exponent = parsedNumber.e;

            isZero = digits.reduce(
                function (isZ, d) { return isZ && !d; },
                true
            );

            // Pad zeros for small numbers
            while (integerLen < 0) {
                digits.unshift(0);
                integerLen += 1;
            }

            // extract decimals digits
            if (integerLen > 0) {
                decimals = digits.splice(integerLen);
            } else {
                decimals = digits;
                digits = [0];
            }

            // format the integer digits with grouping separators
            if (digits.length > pattern.lgSize) {
                groups.unshift(digits.splice(-pattern.lgSize).join(''));
            }

            while (digits.length > pattern.gSize) {
                groups.unshift(digits.splice(-pattern.gSize).join(''));
            }

            if (digits.length) {
                groups.unshift(digits.join(''));
            }

            formattedText = groups.join(groupSep);

            // append the decimal digits
            if (decimals.length) {
                formattedText += decimalSep + decimals.join('');
            }

            if (exponent) {
                formattedText += 'e+' + exponent;
            }
        }

        if (number < 0 && !isZero) {
            return pattern.negPre + formattedText + pattern.negSuf;
        }

        return pattern.posPre + formattedText + pattern.posSuf;
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
        return function (input, limit, begin) {
            if (Math.abs(Number(limit)) === Infinity) {
                limit = Number(limit);
            } else {
                limit = parseInt(limit, 10);
            }
            if (isNaN(limit)) { return input; }

            if (_.isNumber(input)) { input = input.toString(); }
            if (!_.isArray(input) && !_.isString(input)) { return input; }

            begin = (!begin || isNaN(begin)) ? 0 : parseInt(begin, 10);
            begin = (begin < 0) ? Math.max(0, input.length + begin) : begin;

            if (limit >= 0) {
                return input.slice(begin, begin + limit);
            }
            if (begin === 0) {
                return input.slice(limit, input.length);
            }
            return input.slice(Math.max(0, begin + limit), begin);
        };
    }

    function padNumber(num, digits, trim_flag) {
        var neg = '';

        if (num < 0) {
            neg = '-';
            num = -num;
        }

        num = String(num);

        while (num.length < digits) { num = ZERO_CHAR + num; }

        if (trim_flag) { num = num.substr(num.length - digits); }

        return neg + num;
    }

    function dateGetter(name, size, offset, trim_flag) {
        offset = offset || 0;
        return function (date) {
            var value = date['get' + name]();
            if (offset > 0 || value > -offset) { value += offset; }
            if (value === 0 && offset === -12) { value = 12; }
            return padNumber(value, size, trim_flag);
        };
    }

    function dateStrGetter(name, shortForm) {
        return function (date, formats) {
            var value = date['get' + name](),
                get = uppercase(shortForm ? ('SHORT' + name) : name);

            return formats[get][value];
        };
    }

    function timeZoneGetter(date_na, formats_na, offset) {
        var zone = -1 * offset,
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

    function eraGetter(date, formats) {
        return date.getFullYear() <= 0 ? formats.ERAS[0] : formats.ERAS[1];
    }

    function longEraGetter(date, formats) {
        return date.getFullYear() <= 0 ? formats.ERANAMES[0] : formats.ERANAMES[1];
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
        w: weekGetter(1),
        G: eraGetter,
        GG: eraGetter,
        GGG: eraGetter,
        GGGG: longEraGetter
    };

    function dateFilter($locale) {

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
                    tzMin =  parseInt(match[9] + match[11], 10);
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
                fn,
                match,
                dateTimezoneOffset;

            format = format || 'mediumDate';
            format = $locale.DATETIME_FORMATS[format] || format;

            if (_.isString(date)) {
                date = NUMBER_STRING.test(date) ? parseInt(date, 10) : jsonStringToDate(date);
            }

            if (_.isNumber(date)) {
                date = new Date(date);
            }

            if (!_.isDate(date) || !_.isFinite(date.getTime())) {
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

            dateTimezoneOffset = date.getTimezoneOffset();

            if (timezone) {
                dateTimezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
                date = convertTimezoneToLocal(date, timezone, true);
            }

            forEach(parts, function (value) {
                fn = DATE_FORMATS[value];
                text += fn ? fn(date, $locale.DATETIME_FORMATS, dateTimezoneOffset) : value === "''" ? "'" : value.replace(/(^'|'$)/g, '').replace(/''/g, "'");
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
        compile: function (element_na, attr) {

            if (!attr.href && !attr.xlinkHref) {
                return function (scope_na, element) {

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

        var normalized = directiveNormalize('ng-' + attrName),
            linkFn;

        function defaultLinkFn(scope, element_na, attr) {
            scope.$watch(
                attr[normalized],
                function ngBooleanAttrWatchAction(value) {
                    attr.$set(attrName, !!value);
                }
            );
        }

        if (propName === 'checked') {
            linkFn = function (scope, element, attr) {
                // ensuring ngChecked doesn't interfere with ngModel when both are set on the same input
                if (attr.ngModel !== attr[normalized]) {
                    defaultLinkFn(scope, element, attr);
                }
            };
        } else {
            linkFn = defaultLinkFn;
        }
  
        ngAttributeAliasDirectives[normalized] = function () {
            return {
                restrict: 'A',
                priority: 100,
                link: linkFn
            };
        };
    });

    // aliased input attrs are evaluated
    forEach(ALIASED_ATTR, function (htmlAttr_na, ngAttr) {
        ngAttributeAliasDirectives[ngAttr] = function () {
            return {
                priority: 100,
                link: function (scope, element_na, attr) {
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
                link: function (scope_na, element, attr) {
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

    if (verbose) {
        msos_debug('ng - ngAttributeAliasDirectives -> created,\n     directives:', _.keys(ngAttributeAliasDirectives));
    }

    function isObjectEmpty(obj) {
        var prop;

        if (obj) {
            for (prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    return false;
                }
            }
        }

        return true;
    }

    function addSetValidityMethod(context) {
        var ctrl = context.ctrl,
            $element = context.$element,
            classCache = {},
            set = context.set,
            unset = context.unset,
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

            if (_.isUndefined(state)) {
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
            ctrl.$$parentForm.$setValidity(validationErrorKey, combinedState, ctrl);
        }

        classCache[VALID_CLASS] = $element.hasClass(VALID_CLASS);
        classCache[INVALID_CLASS] = !classCache[VALID_CLASS];

        ctrl.$setValidity = setValidity;
    }

    function FormController(element, attrs, $scope, $animate, $interpolate) {
        var form = this,
            controls = [];

        // init state
        form.$error = {};
        form.$$success = {};
        form.$pending = undefined;
        form.$name = $interpolate(attrs.name || attrs.ngForm || '')($scope);
        form.$dirty = false;
        form.$pristine = true;
        form.$valid = true;
        form.$invalid = false;
        form.$submitted = false;
        form.$$parentForm = nullFormCtrl;

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

            control.$$parentForm = form;
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
            forEach(form.$pending, function (value_na, name) {
                form.$setValidity(name, null, control);
            });
            forEach(form.$error, function (value_na, name) {
                form.$setValidity(name, null, control);
            });
            forEach(form.$$success, function (value_na, name) {
                form.$setValidity(name, null, control);
            });

            arrayRemove(controls, control);
            control.$$parentForm = nullFormCtrl;
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
                $animate: $animate
            }
        );

        form.$setDirty = function () {
            $animate.removeClass(element, PRISTINE_CLASS);
            $animate.addClass(element, DIRTY_CLASS);
            form.$dirty = true;
            form.$pristine = false;
            form.$$parentForm.$setDirty();
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
            form.$$parentForm.$setSubmitted();
        };
    }

    FormController.$inject = ['$element', '$attrs', '$scope', '$animate', '$interpolate'];

    formDirectiveFactory = function (isNgForm) {
        var temp_fd = 'ng - formDirectiveFactory';

        return ['$timeout', '$parse', function ($timeout, $parse) {

            function getSetter(expression) {
                if (expression === '') {
                    // Create an assignable expression, so forms with an empty name can be renamed later
                    return $parse('this[""]').assign;
                }
                return $parse(expression).assign || noop;
            }

            var formDirective_F = {
                name: 'form',
                restrict: isNgForm ? 'EAC' : 'E',
                require: ['form', '^^?form'],   // First is the form's own ctrl, second is an optional parent form
                controller: FormController,
                compile: function ngFormCompile(formElement, attr) {
                    // Setup initial state of the control
                    formElement.addClass(PRISTINE_CLASS).addClass(VALID_CLASS);

                    var nameAttr = attr.name ? 'name' : (isNgForm && attr.ngForm ? 'ngForm' : false);

                    return {
                        pre: function ngFormPreLink(scope, formElement, attr, ctrls) {
                            var controller = ctrls[0],
                                handleFormSubmission,
                                parentFormCtrl,
                                setter;

                            if (!attr.hasOwnProperty('action')) {

                                handleFormSubmission = function (event) {
                                    var temp_hf = ' - compile - ngFormPreLink - handleFormSubmission -> ',
                                        tar_name = event.target.id || lowercase(event.target.nodeName);

                                    msos_debug(temp_fd + temp_hf + 'start, target: ' + tar_name);

                                    scope.$apply(
                                        function () {
                                            controller.$commitViewValue();
                                            controller.$setSubmitted();
                                        }
                                    );

                                    event.preventDefault();
                                    msos_debug(temp_fd + temp_hf + 'done!');
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

                            parentFormCtrl = ctrls[1] || controller.$$parentForm;
                            parentFormCtrl.$addControl(controller);

                            setter = nameAttr ? getSetter(controller.$name) : noop;

                            if (nameAttr) {

                                setter(scope, controller);

                                attr.$observe(
                                    nameAttr,
                                    function (newValue) {
                                        if (controller.$name === newValue) { return; }

                                        setter(scope, undefined);
                                        controller.$$parentForm.$$renameControl(controller, newValue);
                                        setter = getSetter(controller.$name);
                                        setter(scope, controller);
                                    }
                                );
                            }

                            formElement.on(
                                '$destroy',
                                function () {
                                    controller.$$parentForm.$removeControl(controller);
                                    setter(scope, undefined);
                                    extend(controller, nullFormCtrl);   // Stop propagating child destruction handlers upwards
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

    function baseInputType(element, attr, ctrl) {
        var type = lowercase(element[0].type),
            listener,
            composing = false;

        listener = function (ev) {

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

        element.on('input', listener);

        if (!Modernizr.hasEvent('input')) {
            msos.console.error('ng - baseInputType -> failure, no onInput event support (bad browser, bad, bad, bad)!');
        }

        // if user paste into input using mouse on older browser
        // or form autocomplete on newer browser, we need "change" event to catch it
        element.on('change', listener);

        ctrl.$render = function () {
            // Workaround for Firefox validation #12102.
            var value = ctrl.$isEmpty(ctrl.$viewValue) ? '' : ctrl.$viewValue;

            if (element.val() !== value) { element.val(value);  }
        };
    }

    function textInputType(scope_na, element, attr, ctrl) {
        baseInputType(element, attr, ctrl);
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
        return function (iso, date) {
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

    function badInputChecker(element, attr_na, ctrl) {
        var node = element[0],
            nativeValidation = ctrl.$$hasNativeValidators = _.isObject(node.validity);

        if (nativeValidation) {
            ctrl.$parsers.push(
                function (value) {
                    var validity = element.prop(VALIDITY_STATE_PROPERTY) || {};
                    
                    return validity.badInput || validity.typeMismatch ? undefined : value;
                }
            );
        }
    }

    function createDateInputType(type, regexp, parseDate, format) {
        return function dynamicDateInputType(scope_na, element, attr, ctrl, $filter) {

            badInputChecker(element, attr, ctrl);
            baseInputType(element, attr, ctrl);

            var timezone = ctrl && ctrl.$options && ctrl.$options.timezone,
                previousDate,
                minVal,
                maxVal;

            function isValidDate(value) {
                // Invalid Date: getTime() returns NaN
                return value && !(value.getTime && value.getTime() !== value.getTime());
            }

            function parseObservedDateValue(val) {
                return isDefined(val) && !_.isDate(val) ? parseDate(val) || undefined : val;
            }

            ctrl.$$parserName = type;

            ctrl.$parsers.push(
                function (value) {
                    var parsedDate;

                    if (ctrl.$isEmpty(value)) { return null; }

                    if (regexp.test(value)) {
                        // Note: We cannot read ctrl.$modelValue, as there might be a different
                        // parser/formatter in the processing chain so that the model
                        // contains some different data format!
                        parsedDate = parseDate(value, previousDate);

                        if (timezone) {
                            parsedDate = convertTimezoneToLocal(parsedDate, timezone);
                        }

                        return parsedDate;
                    }
                    return undefined;
                }
            );

            ctrl.$formatters.push(
                function (value) {
                    if (value && !_.isDate(value)) {
                        throw ngModelMinErr(
                            'datefmt',
                            'Expected `{0}` to be a date',
                            value
                        );
                    }

                    if (isValidDate(value)) {

                        previousDate = value;

                        if (previousDate && timezone) {
                            previousDate = convertTimezoneToLocal(previousDate, timezone, true);
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

    function numberInputType(scope_na, element, attr, ctrl) {
        var minVal,
            maxVal;

        badInputChecker(element, attr, ctrl);
        baseInputType(element, attr, ctrl);

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
                        throw ngModelMinErr('numfmt', 'Expected `{0}` to be a number', value);
                    }
                    value = value.toString();
                }
                return value;
            }
        );

        if (isDefined(attr.min) || attr.ngMin) {
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

        if (isDefined(attr.max) || attr.ngMax) {
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

    function urlInputType(scope_na, element, attr, ctrl) {
        // Note: no badInputChecker here by purpose as `url` is only a validation
        // in browsers, i.e. we can always read out input.value even if it is not valid!
        baseInputType(element, attr, ctrl);
        stringBasedInputType(ctrl);

        ctrl.$$parserName = 'url';
        ctrl.$validators.url = function (modelValue, viewValue) {
            var value = modelValue || viewValue;
            return ctrl.$isEmpty(value) || URL_REGEXP.test(value);
        };
    }

    function emailInputType(scope_na, element, attr, ctrl) {
        // Note: no badInputChecker here by purpose as `url` is only a validation
        // in browsers, i.e. we can always read out input.value even if it is not valid!
        baseInputType(element, attr, ctrl);
        stringBasedInputType(ctrl);

        ctrl.$$parserName = 'email';
        ctrl.$validators.email = function (modelValue, viewValue) {
            var value = modelValue || viewValue;
            return ctrl.$isEmpty(value) || EMAIL_REGEXP.test(value);
        };
    }

    function radioInputType(scope_na, element, attr, ctrl) {
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

    function parseConstantExpr($parse, context_scope, name, expression, fallback) {
        var parseFn;
        if (isDefined(expression)) {
            parseFn = $parse(expression);
            if (!parseFn.constant) {
                throw ngModelMinErr(
                    'constexpr',
                    'Expected constant expression for `{0}`, but saw `{1}`.',
                    name,
                    expression
                );
            }
            return parseFn(context_scope);
        }
        return fallback;
    }

    function checkboxInputType(scope, element, attr, ctrl, $filter_na, $parse) {
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

    inputDirective =
                ['$filter', '$parse',
        function ($filter,   $parse) {
            return {
                restrict: 'E',
                require: ['?ngModel'],
                link: {
                    pre: function (scope, element, attr, ctrls) {
                        if (ctrls[0]) {
                            (inputType[lowercase(attr.type)] || inputType.text)(scope, element, attr, ctrls[0], $filter, $parse);
                        }
                    }
                }
            };
        }
    ];

    ngModelMinErr = minErr('ngModel');

    NgModelController = ['$scope', '$attrs', '$element', '$parse', '$animate', '$timeout', '$rootScope', '$q', '$interpolate',
        function ($scope, $attr, $element, $parse, $animate, $timeout, $rootScope, $q, $interpolate) {

        this.$viewValue = Number.NaN;   // Leave as is (is correct)
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
        this.$$parentForm = nullFormCtrl;

        var temp_nmc = 'ng - NgModelController',
            parsedNgModel = $parse($attr.ngModel),
            parsedNgModelAssign = parsedNgModel.assign,
            ngModelGet = parsedNgModel,
            ngModelSet = parsedNgModelAssign,
            pendingDebounce = null,
            parserValid,
            ctrl = this,
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
                throw ngModelMinErr(
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

        this.$$updateEmptyClasses = function (value) {
            if (ctrl.$isEmpty(value)) {
                $animate.removeClass($element, NOT_EMPTY_CLASS);
                $animate.addClass($element, EMPTY_CLASS);
            } else {
                $animate.removeClass($element, EMPTY_CLASS);
                $animate.addClass($element, NOT_EMPTY_CLASS);
            }
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
            ctrl.$$parentForm.$setDirty();
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
                prevValid = ctrl.$valid,
                prevModelValue = ctrl.$modelValue,
                allowInvalid = ctrl.$options && ctrl.$options.allowInvalid;

            ctrl.$$runValidators(
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

        this.$$runValidators = function (modelValue, viewValue, doneCallback) {
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

            function processParseErrors() {
                var errorKey = ctrl.$$parserName || 'parse';

                if (_.isUndefined(parserValid)) {
                    setValidity(errorKey, null);
                } else {
                    if (!parserValid) {
                        forEach(ctrl.$validators, function (value_na, name) {
                            setValidity(name, null);
                        });
                        forEach(ctrl.$asyncValidators, function (value_na, name) {
                            setValidity(name, null);
                        });
                    }
                    // Set the parse error last, to prevent unsetting it, should a $validators key == parserName
                    setValidity(errorKey, parserValid);
                    return parserValid;
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
                        function (value_na, name) {
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
                        var promise,
                            temp_rv = ' - $$runValidators - processAsyncValidators';

                        msos_debug(temp_nmc + temp_rv + '-> start: ' + name);

                        promise = validator(modelValue, viewValue);

                        if (!isPromiseLike(promise)) {
                            throw ngModelMinErr(
                                'nopromise',
                                "Expected asynchronous validator to return a promise but got '{0}' instead.",
                                promise
                            );
                        }

                        setValidity(name, undefined);

                        validatorPromises.push(
                            promise.then(
                                function () {
                                    msos_debug(temp_nmc + temp_rv + ' (then) -> called: ' + name);
                                    setValidity(name, true);
                                },
                                function (e) {
                                    allValid = false;
                                    setValidity(name, false);
                                    msos.console.error(temp_nmc + temp_rv + ' (then) -> error:', e);
                                }
                            )
                        );

                        msos_debug(temp_nmc + temp_rv + '->  done: ' + name);
                    }
                );

                if (!validatorPromises.length) {
                    validationDone(true);
                } else {
                    $q.all($q.defer('ng_all_processAsyncValidators'), validatorPromises).then(
                        function () {
                            validationDone(allValid);
                        },
                        noop
                    );
                }
            }

            // check parser error
            if (!processParseErrors()) {
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

            ctrl.$$updateEmptyClasses(viewValue);
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
                i = 0,
                prevModelValue,
                allowInvalid;

            parserValid = _.isUndefined(modelValue) ? undefined : true;

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

            if (verbose === 'debounce') {
                msos_debug(temp_nmc + temp_dv + 'start.');
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

            if (verbose === 'debounce') {
                msos_debug(temp_nmc + temp_dv + 'done, delay: ' + debounceDelay + ', for ' + deb_db);
            }
        };

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
                if (modelValue !== ctrl.$modelValue
                 && (ctrl.$modelValue === ctrl.$modelValue || modelValue === modelValue)) {

                    ctrl.$modelValue = ctrl.$$rawModelValue = modelValue;

                    parserValid = undefined;

                    formatters = ctrl.$formatters;
                    idx = formatters.length;
                    viewValue = modelValue;

                    while (idx) {
                        idx -= 1;
                        viewValue = formatters[idx](viewValue);
                    }

                    if (ctrl.$viewValue !== viewValue) {
                        ctrl.$$updateEmptyClasses(viewValue);
                        ctrl.$viewValue = ctrl.$$lastCommittedViewValue = viewValue;
                        ctrl.$render();

                        ctrl.$$runValidators(modelValue, viewValue, noop);
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
                    pre: function ngModelPreLink(scope, element_na, attr, ctrls) {
                        var modelCtrl = ctrls[0],
                            formCtrl =  ctrls[1] || modelCtrl.$$parentForm;

                        modelCtrl.$$setOptions(ctrls[2] && ctrls[2].$options);

                        // notify others, especially parent forms
                        formCtrl.$addControl(modelCtrl);

                        attr.$observe(
                            'name',
                            function (newValue) {
                                if (modelCtrl.$name !== newValue) {
                                    modelCtrl.$$parentForm.$$renameControl(modelCtrl, newValue);
                                }
                            }
                        );

                        scope.$on(
                            '$destroy',
                            function () {
                                modelCtrl.$$parentForm.$removeControl(modelCtrl);
                            }
                        );
                    },
                    post: function ngModelPostLink(scope, element, attr_na, ctrls) {
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

                                msos_debug(temp_pt + temp_ob + 'start.');

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

                                msos_debug(temp_pt + temp_ob + 'done!');
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
        link: function (scope, element_na, attr, ctrl) {
            ctrl.$viewChangeListeners.push(function () {
                scope.$eval(attr.ngChange);
            });
        }
    });

    requiredDirective = function () {
            return {
                restrict: 'A',
                require: '?ngModel',
                link: function (scope_na, elm_na, attr, ctrl) {
                    if (!ctrl) { return; }
                    attr.required = true; // force truthy in case we are on non input element

                    ctrl.$validators.required = function (modelValue_na, viewValue) {
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
            link: function (scope_na, elm, attr, ctrl) {
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

                ctrl.$validators.pattern = function (modelValue_na, viewValue) {
                    // HTML5 pattern constraint validates the input value, so we validate the viewValue
                    return ctrl.$isEmpty(viewValue) || _.isUndefined(regexp) || regexp.test(viewValue);
                };
            }
        };
    };

    maxlengthDirective = function () {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope_na, elm_na, attr, ctrl) {
                if (!ctrl) { return; }

                var maxlength = -1;

                attr.$observe('maxlength', function (value) {
                    var intVal = parseInt(value, 10);

                    maxlength = isNaN(intVal) ? -1 : intVal;
                    ctrl.$validate();
                });

                ctrl.$validators.maxlength = function (modelValue_na, viewValue) {
                    return (maxlength < 0) || ctrl.$isEmpty(viewValue) || (viewValue.length <= maxlength);
                };
            }
        };
    };

    minlengthDirective = function () {
            return {
                restrict: 'A',
                require: '?ngModel',
                link: function (scope_na, elm_na, attr, ctrl) {
                    if (!ctrl) { return; }

                    var minlength = 0;
                    attr.$observe('minlength', function (value) {
                        minlength = parseInt(value, 10) || 0;
                        ctrl.$validate();
                    });
                    ctrl.$validators.minlength = function (modelValue_na, viewValue) {
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
                link: function (scope_na, element, attr, ctrl) {
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
            compile: function (tpl_na, tplAttr) {
                if (CONSTANT_VALUE_REGEXP.test(tplAttr.ngValue)) {
                    return function ngValueConstantLink(scope, elm_na, attr) {
                        attr.$set('value', scope.$eval(attr.ngValue));
                    };
                }

                return function ngValueLink(scope, elm_na, attr) {
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

                this.$options = copy($scope.$eval($attrs.ngModelOptions));

                // Allow adding/overriding bound events
                if (isDefined(this.$options.updateOn)) {
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

    ngBindDirective = ['$compile', function ($compile) {
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
                            element.textContent = _.isUndefined(value) ? '' : value;
                        }
                    );
                };
            }
        };
    }];

    ngBindTemplateDirective = ['$interpolate', '$compile', function ($interpolate, $compile) {
        return {
            compile: function ngBindTemplateCompile(templateElement) {

                $compile.$$addBindingClass(templateElement);

                return function ngBindTemplateLink(scope_na, element, attr) {
                    var interpolateFn = $interpolate(element.attr(attr.$attr.ngBindTemplate));

                    $compile.$$addBindingInfo(element, interpolateFn.expressions);
                    element = element[0];

                    attr.$observe(
                        'ngBindTemplate',
                        function (value) {
                            element.textContent = _.isUndefined(value) ? '' : value;
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
                var classes = [];

                if (_.isArray(classVal)) {
                    forEach(
                        classVal,
                        function (v) {
                            classes = classes.concat(arrayClasses(v));
                        }
                    );
                    return classes;
                }

                if (_.isString(classVal)) {
                    return classVal.split(SPACE);
                }

                if (_.isObject(classVal)) {
                    forEach(
                        classVal,
                        function (v, k) {
                            if (v) {
                                classes = classes.concat(k.split(SPACE));
                            }
                        }
                    );
                    return classes;
                }

                return classVal;
            }

            return {
                restrict: 'AC',
                link: function (scope, element, attr) {
                    var oldVal;

                    function digestClassCounts(classes, count) {
                        var classCounts = element.data('$classCounts') || createMap(),
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

                    attr.$observe('class', function () {
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
        function (eventName) {
            var vc = verbose,
                directiveName = directiveNormalize('ng-' + eventName);

            ngEventDirectives[directiveName] = ['$parse', '$rootScope', function ($parse, $rootScope) {
                return {
                    restrict: 'A',
                    compile: function ($element_na, attr) {
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

    if (verbose) {
        msos_debug('ng - ngEventDirectives -> created,\n     directives:', _.keys(ngEventDirectives));
    }

    ngIfDirective = ['$animate', function ($animate) {
        return {
            multiElement: true,
            transclude: 'element',
            priority: 600,
            terminal: true,
            restrict: 'A',
            $$tlb: true,
            link: function ($scope, $element, $attr, ctrl_na, $transclude) {
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

    ngIncludeDirective = ['$templateRequest', '$anchorScroll', '$animate',
        function ($templateRequest,   $anchorScroll,   $animate) {
            return {
                restrict: 'ECA',
                priority: 400,
                terminal: true,
                transclude: 'element',
                controller: noop,
                compile: function (element_na, attr) {
                    var temp_id = 'ng - ngIncludeDirective - compile (return)',
                        srcExp = attr.ngInclude || attr.src,
                        onloadExp = attr.onload || '',
                        autoScrollExp = attr.autoscroll;

                    return function (scope, $element, $attr_na, ctrl, $transclude) {
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

                        scope.$watch(srcExp, function ngIncludeWatchAction(src) {

                            msos_debug(temp_id + ' - scope.$watch - ngIncludeWatchAction -> start.');

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

                                        if (scope.$$destroyed) { return; }
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
                                        if (scope.$$destroyed) { return; }
    
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

                            msos_debug(temp_id + ' - scope.$watch - ngIncludeWatchAction -> done!');
                        });
                    };
                }
            };
        }
    ];

    ngIncludeFillContentDirective = ['$compile', function ($compile) {

        return {
            restrict: 'ECA',
            priority: -400,
            require: 'ngInclude',
            link: function (scope, $element, $attr_na, ctrl) {

                if (ngto_string.call($element[0]).match(/SVG/)) {
                    $element.empty();
                    $compile(jQuery.buildFragment(ctrl.template, document).childNodes)(
                        scope,
                        function namespaceAdaptedClone(clone) { $element.append(clone); },
                        { futureParentElement: $element }
                    );
                    return;
                }

                $element.html(ctrl.template);
                $compile($element.contents())(scope);
            }
        };
    }];

    ngInitDirective = ngDirective({
        priority: 450,
        compile: function () {
            return {
                pre: function (scope, element_na, attrs) {
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
                    function (expression_na, attributeName) {
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
                            countIsNaN = isNaN(count),
                            whenExpFn;

                        if (!countIsNaN && !whens.hasOwnProperty(count)) {
                            // If an explicit number rule such as 1, 2, 3... is defined, just use it.
                            // Otherwise, check it against pluralization rules in $locale service.
                            count = $locale.pluralCat(count - offset);
                        }

                        // If both `count` and `lastCount` are NaN, we don't need to re-register a watch.
                        // In JS `NaN !== NaN`, so we have to exlicitly check.
                        if ((count !== lastCount) && !(countIsNaN && _.isNumber(lastCount) && isNaN(lastCount))) {
                            watchRemover();
                            whenExpFn = whensExpFns[count];

                            if (_.isUndefined(whenExpFn)) {
                                if (newVal !== null && newVal !== undefined) {
                                    msos.console.warn("ng - ngPluralizeDirective - ngPluralizeWatchAction -> no rule defined for '" + count + "' in " + whenExp);
                                }
                                watchRemover = noop;
                                updateElementText();
                            } else {
                                watchRemover = scope.$watch(whenExpFn, updateElementText);
                            }
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
            compile: function ngRepeatCompile($element_na, $attr) {
                
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
                    trackByIdArrayFn = function (key_na, value) {
                        return hashKey(value);
                    };
                    trackByIdObjFn = function (key) {
                        return key;
                    };
                }

                return function ngRepeatLink($scope, $element, $attr_na, ctrl_na, $transclude) {

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
                            // if object, extract keys, in enumeration order, unsorted
                            collectionKeys = [];
                            for (itemKey in collection) {
                                if (hasOwnProperty.call(collection, itemKey) && itemKey.charAt(0) !== '$') {
                                    collectionKeys.push(itemKey);
                                }
                            }
                        }

                        collectionLength = collectionKeys.length;
                        nextBlockOrder = new Array(collectionLength);   // Leave this as is (empty array, w/ length of collectionLength)

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
                        msos_debug('ng - ngShowDirective - ngShowWatchAction -> for: ' + value);
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
                        msos_debug('ng - ngHideDirective - ngHideWatchAction -> for: ' + value);
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
        scope.$watch(
            attr.ngStyle,
            function ngStyleWatchAction(newStyles, oldStyles) {
                if (oldStyles && (newStyles !== oldStyles)) {
                    forEach(
                        oldStyles,
                        function (value_na, style) { element.css(style, ''); }
                    );
                }
                if (newStyles) { element.css(newStyles); }
            },
            true
        );
    });

    ngSwitchDirective = ['$animate', function ($animate) {
        var temp_sd = 'ng - ngSwitchDirective';

        return {
            require: 'ngSwitch',

            // asks for $scope to fool the BC controller module
            controller: ['$scope', function ngSwitchController() {
                this.cases = {};
            }],
            link: function (scope, element_na, attr, ngSwitchController) {
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
                        var temp_sw = ' - scope.$watch - ngSwitchWatchAction -> ',
                            i,
                            ii,
                            selected,
                            promise;

                        msos_debug(temp_sd + temp_sw + 'start.');

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

                        msos_debug(temp_sd + temp_sw + 'done!');
                    }
                );
            }
        };
    }];

    ngSwitchWhenDirective = ngDirective({
        transclude: 'element',
        priority: 1200,
        require: '^ngSwitch',
        multiElement: true,
        link: function (scope_na, element, attrs, ctrl, $transclude) {
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
        link: function (scope_na, element, attr_na, ctrl, $transclude) {
            ctrl.cases['?'] = (ctrl.cases['?'] || []);
            ctrl.cases['?'].push({
                transclude: $transclude,
                element: element
            });
        }
    });

    ngTranscludeMinErr = minErr('ngTransclude');

    ngTranscludeDirective = ngDirective({
        restrict: 'EAC',
        link: function ($scope_na, $element, $attrs, controller_na, $transclude) {
            var slotName;

            if ($attrs.ngTransclude === $attrs.$attr.ngTransclude) { $attrs.ngTransclude = ''; }

            function ngTranscludeCloneAttachFn(clone) {
                if (clone.length) {
                    $element.empty();
                    $element.append(clone);
                }
            }

            if (!$transclude) {
                throw ngTranscludeMinErr(
                    'orphan',
                    'Illegal use: ngTransclude dir. (template)! NA parent dir. that requires a transclusion, in element: {0}',
                    startingTag($element)
                );
            }

            // If there is no slot name defined or the slot name is not optional, then transclude the slot
            slotName = $attrs.ngTransclude || $attrs.ngTranscludeSlot;
            $transclude(ngTranscludeCloneAttachFn, null, slotName);
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

    $ngOptionsMinErr = minErr('ngOptions');

    ngOptionsDirective = ['$compile', '$parse', function ($compile, $parse) {
        var optionTemplate = document.createElement('option'),
            optGroupTemplate = document.createElement('optgroup');

        function parseOptionsExpression(optionsExp, selectElement, scope) {
            var match = optionsExp.match(NG_OPTIONS_REGEXP),
                locals = {},
                valueName = match[5] || match[7],
                keyName = match[6],
                selectAs = / as /.test(match[0]) && match[1],
                trackBy = match[9],
                valueFn = $parse(match[2] ? match[1] : valueName),
                selectAsFn = selectAs && $parse(selectAs),
                viewValueFn = selectAsFn || valueFn,
                trackByFn = trackBy && $parse(trackBy),
                getLocals = keyName
                    ? function (value, key) {
                        locals[keyName] = key;
                        locals[valueName] = value;
                        return locals;
                    }
                    : function (value) {
                        locals[valueName] = value;
                        return locals;
                    },
                getTrackByValueFn = trackBy
                    ? function (value_na, locals) { return trackByFn(scope, locals); }
                    : function getHashOfValue(value) { return hashKey(value); },
                getTrackByValue = function (value, key) {
                    return getTrackByValueFn(value, getLocals(value, key));
                },
                displayFn = $parse(match[2] || match[1]),
                groupByFn = $parse(match[3] || ''),
                disableWhenFn = $parse(match[4] || ''),
                valuesFn = $parse(match[8]);

            function Option(selectValue, viewValue, label, group, disabled) {
                this.selectValue = selectValue;
                this.viewValue = viewValue;
                this.label = label;
                this.group = group;
                this.disabled = disabled;
            }

            function getOptionValuesKeys(optionValues) {
                var optionValuesKeys,
                    itemKey;

                if (!keyName && isArrayLike(optionValues)) {
                    optionValuesKeys = optionValues;
                } else {
                    // if object, extract keys, in enumeration order, unsorted
                    optionValuesKeys = [];
                    for (itemKey in optionValues) {
                        if (optionValues.hasOwnProperty(itemKey) && itemKey.charAt(0) !== '$') {
                            optionValuesKeys.push(itemKey);
                        }
                    }
                }

                return optionValuesKeys;
            }

            if (!(match)) {
                throw $ngOptionsMinErr(
                    'iexp',
                    "Expected expression in form of '_select_ (as _label_)? for (_key_,)?_value_ in _collection_' but got '{0}'. Element: {1}",
                    optionsExp,
                    startingTag(selectElement)
                );
            }

            return {
                trackBy: trackBy,
                getTrackByValue: getTrackByValue,
                getWatchables: $parse(
                    valuesFn,
                    function (optionValues) {
                        var watchedArray = [],
                            optionValuesKeys,
                            optionValuesLength,
                            index = 0,
                            key,
                            value,
                            locals,
                            selectValue,
                            label,
                            disableWhen;

                        optionValues = optionValues || [];

                        optionValuesKeys = getOptionValuesKeys(optionValues);
                        optionValuesLength = optionValuesKeys.length;

                        for (index = 0; index < optionValuesLength; index += 1) {
                            key = (optionValues === optionValuesKeys) ? index : optionValuesKeys[index];
                            value = optionValues[key];

                            locals = getLocals(optionValues[key], key);
                            selectValue = getTrackByValueFn(optionValues[key], locals);

                            watchedArray.push(selectValue);

                            // Only need to watch the displayFn if there is a specific label expression
                            if (match[2] || match[1]) {
                                label = displayFn(scope, locals);
                                watchedArray.push(label);
                            }

                            // Only need to watch the disableWhenFn if there is a specific disable expression
                            if (match[4]) {
                                disableWhen = disableWhenFn(scope, locals);
                                watchedArray.push(disableWhen);
                            }
                        }

                        return watchedArray;
                    }
                ),

                getOptions: function () {
                    var optionItems = [],
                        selectValueMap = {},
                        optionValues = valuesFn(scope) || [],
                        optionValuesKeys,
                        optionValuesLength,
                        index = 0,
                        key,
                        value,
                        locals,
                        viewValue,
                        selectValue,
                        label,
                        group,
                        disabled,
                        optionItem;

                    optionValuesKeys = getOptionValuesKeys(optionValues);
                    optionValuesLength = optionValuesKeys.length;

                    for (index = 0; index < optionValuesLength; index += 1) {
                        key = (optionValues === optionValuesKeys) ? index : optionValuesKeys[index];
                        value = optionValues[key];
                        locals = getLocals(value, key);
                        viewValue = viewValueFn(scope, locals);
                        selectValue = getTrackByValueFn(viewValue, locals);
                        label = displayFn(scope, locals);
                        group = groupByFn(scope, locals);
                        disabled = disableWhenFn(scope, locals);
                        optionItem = new Option(selectValue, viewValue, label, group, disabled);

                        optionItems.push(optionItem);
                        selectValueMap[selectValue] = optionItem;
                    }

                    return {
                        items: optionItems,
                        selectValueMap: selectValueMap,
                        getOptionFromViewValue: function (value) {
                            return selectValueMap[getTrackByValue(value)];
                        },
                        getViewValueFromOption: function (option) {
                            // If the viewValue could be an object that may be mutated by the application,
                            // we need to make a copy and not return the reference to the value on the option.
                            return trackBy ? angular.copy(option.viewValue) : option.viewValue;
                        }
                    };
                }
            };
        }

        function ngOptionsPostLink(scope, selectElement, attr, ctrls) {
            var selectCtrl = ctrls[0],
                ngModelCtrl = ctrls[1],
                multiple = attr.multiple,
                emptyOption,
                i = 0,
                ii = 0,
                children,
                providedEmptyOption,
                unknownOption,
                options,
                ngOptions,
                renderEmptyOption,
                removeEmptyOption,
                renderUnknownOption,
                removeUnknownOption;

            for (i = 0, children = selectElement.children(), ii = children.length; i < ii; i += 1) {
                if (children[i].value === '') {
                    emptyOption = children.eq(i);
                    break;
                }
            }

            providedEmptyOption = !!emptyOption;

            unknownOption = jqLite(optionTemplate.cloneNode(false));
            unknownOption.val('?');

            ngOptions = parseOptionsExpression(attr.ngOptions, selectElement, scope);

            renderEmptyOption = function () {
                if (!providedEmptyOption) {
                    selectElement.prepend(emptyOption);
                }

                selectElement.val('');
                emptyOption.prop('selected', true); // needed for IE
                emptyOption.attr('selected', true);
            };

            removeEmptyOption = function () {
                if (!providedEmptyOption) {
                    emptyOption.remove();
                }
            };


            renderUnknownOption = function () {
                selectElement.prepend(unknownOption);
                selectElement.val('?');
                unknownOption.prop('selected', true); // needed for IE
                unknownOption.attr('selected', true);
            };

            removeUnknownOption = function () {
                unknownOption.remove();
            };

            function updateOptionElement(option, element) {
                option.element = element;
                element.disabled = option.disabled;

                if (option.label !== element.label) {
                    element.label = option.label;
                    element.textContent = option.label;
                }

                if (option.value !== element.value) { element.value = option.selectValue; }
            }

            function addOrReuseElement(parent, current, type, templateElement) {
                var element;

                // Check whether we can reuse the next element
                if (current && lowercase(current.nodeName) === type) {
                    // The next element is the right type so reuse it
                    element = current;
                } else {
                    // The next element is not the right type so create a new one
                    element = templateElement.cloneNode(false);
                    if (!current) {
                        // There are no more elements so just append it to the select
                        parent.appendChild(element);
                    } else {
                        // The next element is not a group so insert the new one
                        parent.insertBefore(element, current);
                    }
                }

                return element;
            }

            function skipEmptyAndUnknownOptions(current) {
                var emptyOption_ = emptyOption && emptyOption[0],
                    unknownOption_ = unknownOption && unknownOption[0];

                if (emptyOption_ || unknownOption_) {
                    while (current &&
                          (current === emptyOption_ ||
                           current === unknownOption_ ||
                           current.nodeType === NODE_TYPE_COMMENT ||
                          (nodeName_(current) === 'option' && current.value === ''))) {
                                current = current.nextSibling;
                    }
                }

                return current;
            }

            function updateOptions() {
                var previousValue = options && selectCtrl.readValue(),
                    groupMap = {},
                    currentElement,
                    nextValue,
                    isNotPrimitive;

                options = ngOptions.getOptions();

                currentElement = selectElement[0].firstChild;

                // Ensure that the empty option is always there if it was explicitly provided
                if (providedEmptyOption) {
                    selectElement.prepend(emptyOption);
                }

                currentElement = skipEmptyAndUnknownOptions(currentElement);

                options.items.forEach(
                    function updateOption(option) {
                        var group,
                            groupElement,
                            optionElement;

                        if (isDefined(option.group)) {
                            // This option is to live in a group
                            // See if we have already created this group
                            group = groupMap[option.group];

                            if (!group) {
                                // We have not already created this group
                                groupElement = addOrReuseElement(
                                    selectElement[0],
                                    currentElement,
                                    'optgroup',
                                    optGroupTemplate
                                );

                                // Move to the next element
                                currentElement = groupElement.nextSibling;

                                // Update the label on the group element
                                groupElement.label = option.group;

                                // Store it for use later
                                group = groupMap[option.group] = {
                                    groupElement: groupElement,
                                    currentOptionElement: groupElement.firstChild
                                };
                            }

                            // So now we have a group for this option we add the option to the group
                            optionElement = addOrReuseElement(
                                group.groupElement,
                                group.currentOptionElement,
                                'option',
                                optionTemplate
                            );

                            updateOptionElement(option, optionElement);
                            // Move to the next element
                            group.currentOptionElement = optionElement.nextSibling;

                        } else {

                            // This option is not in a group
                            optionElement = addOrReuseElement(
                                selectElement[0],
                                currentElement,
                                'option',
                                optionTemplate
                            );

                            updateOptionElement(option, optionElement);
                            // Move to the next element
                            currentElement = optionElement.nextSibling;
                        }
                    }
                );

                // Now remove all excess options and group
                Object.keys(groupMap).forEach(
                    function (key) {
                        jqLite(groupMap[key].currentOptionElement).remove();
                    }
                );

                jqLite(currentElement).remove();

                ngModelCtrl.$render();

                // Check to see if the value has changed due to the update to the options
                if (!ngModelCtrl.$isEmpty(previousValue)) {
                    nextValue = selectCtrl.readValue();
                    isNotPrimitive = ngOptions.trackBy || multiple;

                    if (isNotPrimitive ? !equals(previousValue, nextValue) : previousValue !== nextValue) {
                        ngModelCtrl.$setViewValue(nextValue);
                        ngModelCtrl.$render();
                    }
                }
            }

            // Update the controller methods for multiple selectable options
            if (!multiple) {
                selectCtrl.writeValue = function writeNgOptionsValue(value) {
                    var option = options.getOptionFromViewValue(value);

                    if (option && !option.disabled) {
                        if (selectElement[0].value !== option.selectValue) {
                            removeUnknownOption();
                            removeEmptyOption();

                            selectElement[0].value = option.selectValue;
                            option.element.selected = true;
                            option.element.setAttribute('selected', 'selected');
                        }
                    } else {
                        if (value === null || providedEmptyOption) {
                            removeUnknownOption();
                            renderEmptyOption();
                        } else {
                            removeEmptyOption();
                            renderUnknownOption();
                        }
                    }
                };

                selectCtrl.readValue = function readNgOptionsValue() {
                    var selectedOption = options.selectValueMap[selectElement.val()];

                    if (selectedOption && !selectedOption.disabled) {
                        removeEmptyOption();
                        removeUnknownOption();

                        return options.getViewValueFromOption(selectedOption);
                    }

                    return null;
                };

                // If we are using `track by` then we must watch the tracked value on the model
                // since ngModel only watches for object identity change
                if (ngOptions.trackBy) {
                    scope.$watch(
                        function () { return ngOptions.getTrackByValue(ngModelCtrl.$viewValue); },
                        function () { ngModelCtrl.$render(); }
                    );
                }

            } else {

                ngModelCtrl.$isEmpty = function (value) {
                    return !value || value.length === 0;
                };

                selectCtrl.writeValue = function writeNgOptionsMultiple(value) {
                    options.items.forEach(
                        function (option) {
                            option.element.selected = false;
                        }
                    );

                    if (value) {
                        value.forEach(
                            function (item) {
                                var option = options.getOptionFromViewValue(item);

                                if (option && !option.disabled) { option.element.selected = true; }
                            }
                        );
                    }
                };

                selectCtrl.readValue = function readNgOptionsMultiple() {
                    var selectedValues = selectElement.val() || [],
                        selections = [];

                    forEach(
                        selectedValues,
                        function (value) {
                            var option = options.selectValueMap[value];

                            if (option && !option.disabled) { selections.push(options.getViewValueFromOption(option)); }
                        }
                    );

                    return selections;
                };

                // If we are using `track by` then we must watch these tracked values on the model
                // since ngModel only watches for object identity change
                if (ngOptions.trackBy) {

                    scope.$watchCollection(
                        function () {
                            if (_.isArray(ngModelCtrl.$viewValue)) {
                                return ngModelCtrl.$viewValue.map(
                                    function (value) {
                                        return ngOptions.getTrackByValue(value);
                                    }
                                );
                            }
                            return undefined;
                        },
                        function () {
                            ngModelCtrl.$render();
                        }
                    );
                }
            }

            if (providedEmptyOption) {

                // we need to remove it before calling selectElement.empty() because otherwise IE will
                // remove the label from the element. wtf?
                emptyOption.remove();

                // compile the element since there might be bindings in it
                $compile(emptyOption)(scope);

                // remove the class, which is added automatically because we recompile the element and it
                // becomes the compilation root
                emptyOption.removeClass('ng-scope');
            } else {
                emptyOption = jqLite(optionTemplate.cloneNode(false));
            }

            // We need to do this here to ensure that the options object is defined
            // when we first hit it in writeNgOptionsValue
            updateOptions();

            // We will re-render the option elements if the option values or labels change
            scope.$watchCollection(ngOptions.getWatchables, updateOptions);
        }

        return {
            restrict: 'A',
            terminal: true,
            require: ['select', 'ngModel'],
            link: {
                pre: function ngOptionsPreLink(scope_na, selectElement_na, attr_na, ctrls) {
                    ctrls[0].registerOption = noop;
                },
                post: ngOptionsPostLink
            }
        };
    }];

    noopNgModelController = {
        $setViewValue: noop,
        $render: noop
    };

    function chromeHack(optionElement) {
        if (optionElement[0].hasAttribute('selected')) {
            optionElement[0].selected = true;
        }
    }

    SelectController = ['$element', '$scope', function ($element, $scope) {

        var self = this,
            optionsMap = new HashMap();

         // If the ngModel doesn't get provided then provide a dummy noop version to prevent errors
        self.ngModelCtrl = noopNgModelController;

        self.unknownOption = jqLite(document.createElement('option'));

        self.renderUnknownOption = function (val) {
            var unknownVal = '? ' + hashKey(val) + ' ?';

            self.unknownOption.val(unknownVal);
            $element.prepend(self.unknownOption);
            $element.val(unknownVal);
        };

        $scope.$on(
            '$destroy',
            function () {
                self.renderUnknownOption = noop;
            }
        );

        self.removeUnknownOption = function () {
            if (self.unknownOption.parent()) { self.unknownOption.remove(); }
        };

        // Read the value of the select control, the implementation of this changes depending
        // upon whether the select can have multiple values and whether ngOptions is at work.
        self.readValue = function readSingleValue() {
            self.removeUnknownOption();
            return $element.val();
        };

        // Write the value to the select control, the implementation of this changes depending
        // upon whether the select can have multiple values and whether ngOptions is at work.
        self.writeValue = function writeSingleValue(value) {
            if (self.hasOption(value)) {
                self.removeUnknownOption();
                $element.val(value);
                if (value === '') { self.emptyOption.prop('selected', true); }  // to make IE9 happy
            } else {
                if ((value === null || value === undefined) && self.emptyOption) {
                    self.removeUnknownOption();
                    $element.val('');
                } else {
                    self.renderUnknownOption(value);
                }
            }
        };

        // Tell the select control that an option, with the given value, has been added
        self.addOption = function (value, element) {
            var count = 0;

            // Skip comment nodes, as they only pollute the `optionsMap`
            if (element[0].nodeType === NODE_TYPE_COMMENT) { return; }

            assertNotHasOwnProperty(value, '"option value"');

            if (value === '') {
                self.emptyOption = element;
            }

            count = optionsMap.get(value) || 0;
            optionsMap.put(value, count + 1);
            self.ngModelCtrl.$render();
            chromeHack(element);
        };

        // Tell the select control that an option, with the given value, has been removed
        self.removeOption = function (value) {
            var count = optionsMap.get(value);

            if (count) {
                if (count === 1) {
                    optionsMap.remove(value);
                    if (value === '') {
                        self.emptyOption = undefined;
                    }
                } else {
                    optionsMap.put(value, count - 1);
                }
            }
        };

        // Check whether the select control has an option matching the given value
        self.hasOption = function (value) {
            return !!optionsMap.get(value);
        };

        self.registerOption = function (optionScope, optionElement, optionAttrs, interpolateValueFn, interpolateTextFn) {
            var oldVal;

            if (interpolateValueFn) {
                // The value attribute is interpolated
                optionAttrs.$observe(
                    'value',
                    function valueAttributeObserveAction(newVal) {
                        if (isDefined(oldVal)) {
                            self.removeOption(oldVal);
                        }
                        oldVal = newVal;
                        self.addOption(newVal, optionElement);
                    }
                );

            } else if (interpolateTextFn) {
                // The text content is interpolated
                optionScope.$watch(
                    interpolateTextFn,
                    function interpolateWatchAction(newVal, oldVal) {
                        optionAttrs.$set('value', newVal);
                        if (oldVal !== newVal) {
                            self.removeOption(oldVal);
                        }
                        self.addOption(newVal, optionElement);
                    }
                );
            } else {
                // The value attribute is static
                self.addOption(optionAttrs.value, optionElement);
            }

            optionElement.on(
                '$destroy',
                function () {
                    self.removeOption(optionAttrs.value);
                    self.ngModelCtrl.$render();
                }
            );
        };
    }];

    selectDirective = function () {

        function selectPreLink(scope, element, attr, ctrls) {

            // if ngModel is not defined, we don't need to do anything
            var ngModelCtrl = ctrls[1],
                selectCtrl,
                lastView,
                lastViewRef = NaN;

            if (!ngModelCtrl) { return; }

            selectCtrl = ctrls[0];
            selectCtrl.ngModelCtrl = ngModelCtrl;

            element.on(
                'change',
                function () {
                    scope.$apply(
                        function () { ngModelCtrl.$setViewValue(selectCtrl.readValue()); }
                    );
                }
            );

            if (attr.multiple) {

                selectCtrl.readValue = function readMultipleValue() {
                    var array = [];

                    forEach(
                        element.find('option'),
                        function (option) {
                            if (option.selected) { array.push(option.value); }
                        }
                    );

                    return array;
                };

                // Write value now needs to set the selected property of each matching option
                selectCtrl.writeValue = function writeMultipleValue(value) {
                    var items = new HashMap(value);

                    forEach(
                        element.find('option'),
                        function (option) {
                            option.selected = isDefined(items.get(option.value));
                        }
                    );
                };

                // we have to do it on each watch since ngModel watches reference, but
                // we need to work of an array, so we need to see if anything was inserted/removed
                scope.$watch(
                    function selectMultipleWatch() {
                        if (lastViewRef === ngModelCtrl.$viewValue && !equals(lastView, ngModelCtrl.$viewValue)) {
                            lastView = shallowCopy(ngModelCtrl.$viewValue);
                            ngModelCtrl.$render();
                        }
                        lastViewRef = ngModelCtrl.$viewValue;
                    }
                );

                // If we are a multiple select then value is now a collection
                // so the meaning of $isEmpty changes
                ngModelCtrl.$isEmpty = function (value) {
                    return !value || value.length === 0;
                };
            }
        }

        function selectPostLink(scope_na, element_na, attrs_na, ctrls) {
            // if ngModel is not defined, we don't need to do anything
            var selectCtrl = ctrls[0],
                ngModelCtrl = ctrls[1];

            if (!ngModelCtrl) { return; }

            ngModelCtrl.$render = function () { selectCtrl.writeValue(ngModelCtrl.$viewValue); };
        }

        return {
            restrict: 'E',
            require: ['select', '?ngModel'],
            controller: SelectController,
            priority: 1,
            link: {
                pre: selectPreLink,
                post: selectPostLink
            }
        };
    };

    optionDirective = ['$interpolate', function ($interpolate) {

        return {
            restrict: 'E',
            priority: 100,
            compile: function (element, attr) {
                var interpolateValueFn,
                    interpolateTextFn,
                    elem_txt;

                if (isDefined(attr.value)) {
                    if (attr.value.length && NOT_EMPTY.test(attr.value) === true) {
                        interpolateValueFn = $interpolate(attr.value, true);
                    }
                } else {
                    elem_txt = element.text();
                    if (elem_txt.length && NOT_EMPTY.test(elem_txt) === true) {
                        interpolateTextFn = $interpolate(elem_txt, true);
                    }
                    if (!interpolateTextFn) {
                        attr.$set('value', elem_txt);
                    }
                }

                return function (scope, element, attr) {

                    var selectCtrlName = '$selectController',
                        parent = element.parent(),
                        selectCtrl = parent.data(selectCtrlName) || parent.parent().data(selectCtrlName); // in case we are in optgroup

                    if (selectCtrl) {
                        selectCtrl.registerOption(
                            scope,
                            element,
                            attr,
                            interpolateValueFn,
                            interpolateTextFn
                        );
                    }
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

        msos_debug(temp_pe + ' ~~~> start.');

        extend(angular, {
            'bootstrap': bootstrap,
            'copy': copy,
            'extend': extend,
            'merge': merge,
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
            'mergeClasses': mergeClasses,
            'removeComments': removeComments,
            'extractElementNode': extractElementNode,
            'isPromiseLike': isPromiseLike,
            'splitClasses': splitClasses,
            'callbacks': {
                counter: 0
            },
            '$$minErr': minErr,
            '$$csp': function () { return true; }   // Always true now (we default to use csp always)
        });

        angularModule = setupModuleLoader(window);

        // Load internal ngLocale (was try -> then internal, but we can load with ng.util.postloader instead)
        angularModule('ngLocale', []).provider('$locale', $LocaleProvider);

        angularModule('ng', ['ngLocale'], ['$provide', function ngModule($provide) {

            msos_debug(temp_pe + ' - ngModule ~~~> start.');

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
                $animateCss: $CoreAnimateCssProvider,
                $$animateJs: $$CoreAnimateJsProvider,
                $$animateQueue: $$CoreAnimateQueueProvider,
                $$AnimateRunner: $$AnimateRunnerFactoryProvider,
                $$animateAsyncRun: $$AnimateAsyncRunFactoryProvider,
                $browser: $BrowserProvider,
                $cacheFactory: $CacheFactoryProvider,
                $controller: $ControllerProvider,
                $document: $DocumentProvider,
                $exceptionHandler: $ExceptionHandlerProvider,
                $filter: $FilterProvider,
                $$forceReflow: $$ForceReflowProvider,
                $interpolate: $InterpolateProvider,
                $interval: $IntervalProvider,
                $http: $HttpProvider,
                $httpParamSerializer: $HttpParamSerializerProvider,
                $httpParamSerializerJQLike: $HttpParamSerializerJQLikeProvider,
                $httpBackend: $HttpBackendProvider,
                $xhrFactory: $xhrFactoryProvider,
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
                $timeout: $TimeoutProvider,
                $window: $WindowProvider,
                $$rAF: $$RAFProvider,
                $$jqLite: $$jqLiteProvider,
                $$HashMap: $$HashMapProvider,
                $$cookieReader: $$CookieReaderProvider
            });

            msos_debug(temp_pe + ' - ngModule ~~~> done!');
        }]);

        msos_debug(temp_pe + ' ~~~> done!');
    }

    // Run this puppy...
    bindJQuery();

    publishExternalAPI(angular);

}(window, document));


msos.console.info('ng/v150_msos -> done!');
msos.console.timeEnd('ng');
