
/*
 * $Id: base64.js,v 2.15 2014/04/05 12:58:57 dankogai Exp dankogai $
 *
 *  Licensed under the MIT license.
 *    http://opensource.org/licenses/mit-license
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 */
(function(global) {
    'use strict';
    // existing version for noConflict()
    var _Base64 = global.Base64;
    var version = "2.1.9";
    // if node.js, we use Buffer
    var buffer;
    if (typeof module !== 'undefined' && module.exports) {
        try {
            buffer = require('buffer').Buffer;
        } catch (err) {}
    }
    // constants
    var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var b64tab = function(bin) {
        var t = {};
        for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
        return t;
    }(b64chars);
    var fromCharCode = String.fromCharCode;
    // encoder stuff
    var cb_utob = function(c) {
        if (c.length < 2) {
            var cc = c.charCodeAt(0);
            return cc < 0x80 ? c : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6)) + fromCharCode(0x80 | (cc & 0x3f))) : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f)) + fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) + fromCharCode(0x80 | (cc & 0x3f)));
        } else {
            var cc = 0x10000 + (c.charCodeAt(0) - 0xD800) * 0x400 + (c.charCodeAt(1) - 0xDC00);
            return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07)) + fromCharCode(0x80 | ((cc >>> 12) & 0x3f)) + fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) + fromCharCode(0x80 | (cc & 0x3f)));
        }
    };
    var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    var utob = function(u) {
        return u.replace(re_utob, cb_utob);
    };
    var cb_encode = function(ccc) {
        var padlen = [0, 2, 1][ccc.length % 3],
            ord = ccc.charCodeAt(0) << 16 | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8) | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
            chars = [
                b64chars.charAt(ord >>> 18),
                b64chars.charAt((ord >>> 12) & 63),
                padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
                padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
            ];
        return chars.join('');
    };
    var btoa = global.btoa ? function(b) {
        return global.btoa(b);
    } : function(b) {
        return b.replace(/[\s\S]{1,3}/g, cb_encode);
    };
    var _encode = buffer ? function(u) {
        return (u.constructor === buffer.constructor ? u : new buffer(u))
            .toString('base64')
    } : function(u) {
        return btoa(utob(u))
    };
    var encode = function(u, urisafe) {
        return !urisafe ? _encode(String(u)) : _encode(String(u)).replace(/[+\/]/g, function(m0) {
            return m0 == '+' ? '-' : '_';
        }).replace(/=/g, '');
    };
    var encodeURI = function(u) {
        return encode(u, true)
    };
    // decoder stuff
    var re_btou = new RegExp([
        '[\xC0-\xDF][\x80-\xBF]',
        '[\xE0-\xEF][\x80-\xBF]{2}',
        '[\xF0-\xF7][\x80-\xBF]{3}'
    ].join('|'), 'g');
    var cb_btou = function(cccc) {
        switch (cccc.length) {
            case 4:
                var cp = ((0x07 & cccc.charCodeAt(0)) << 18) | ((0x3f & cccc.charCodeAt(1)) << 12) | ((0x3f & cccc.charCodeAt(2)) << 6) | (0x3f & cccc.charCodeAt(3)),
                    offset = cp - 0x10000;
                return (fromCharCode((offset >>> 10) + 0xD800) + fromCharCode((offset & 0x3FF) + 0xDC00));
            case 3:
                return fromCharCode(
                    ((0x0f & cccc.charCodeAt(0)) << 12) | ((0x3f & cccc.charCodeAt(1)) << 6) | (0x3f & cccc.charCodeAt(2))
                );
            default:
                return fromCharCode(
                    ((0x1f & cccc.charCodeAt(0)) << 6) | (0x3f & cccc.charCodeAt(1))
                );
        }
    };
    var btou = function(b) {
        return b.replace(re_btou, cb_btou);
    };
    var cb_decode = function(cccc) {
        var len = cccc.length,
            padlen = len % 4,
            n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0) | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0) | (len > 2 ? b64tab[cccc.charAt(2)] << 6 : 0) | (len > 3 ? b64tab[cccc.charAt(3)] : 0),
            chars = [
                fromCharCode(n >>> 16),
                fromCharCode((n >>> 8) & 0xff),
                fromCharCode(n & 0xff)
            ];
        chars.length -= [0, 0, 2, 1][padlen];
        return chars.join('');
    };
    var atob = global.atob ? function(a) {
        return global.atob(a);
    } : function(a) {
        return a.replace(/[\s\S]{1,4}/g, cb_decode);
    };
    var _decode = buffer ? function(a) {
        return (a.constructor === buffer.constructor ? a : new buffer(a, 'base64')).toString();
    } : function(a) {
        return btou(atob(a))
    };
    var decode = function(a) {
        return _decode(
            String(a).replace(/[-_]/g, function(m0) {
                return m0 == '-' ? '+' : '/'
            })
            .replace(/[^A-Za-z0-9\+\/]/g, '')
        );
    };
    var noConflict = function() {
        var Base64 = global.Base64;
        global.Base64 = _Base64;
        return Base64;
    };
    // export Base64
    global.Base64 = {
        VERSION: version,
        atob: atob,
        btoa: btoa,
        fromBase64: decode,
        toBase64: encode,
        utob: utob,
        encode: encode,
        encodeURI: encodeURI,
        btou: btou,
        decode: decode,
        noConflict: noConflict
    };
    // if ES5 is available, make Base64.extendString() available
    if (typeof Object.defineProperty === 'function') {
        var noEnum = function(v) {
            return {
                value: v,
                enumerable: false,
                writable: true,
                configurable: true
            };
        };
        global.Base64.extendString = function() {
            Object.defineProperty(
                String.prototype, 'fromBase64', noEnum(function() {
                    return decode(this)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64', noEnum(function(urisafe) {
                    return encode(this, urisafe)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64URI', noEnum(function() {
                    return encode(this, true)
                }));
        };
    }
    // that's it!
    if (global['Meteor']) {
        Base64 = global.Base64; // for normal export in Meteor.js
    }
})(this);

// MD5 script
(function (factory) {
    if (typeof exports === 'object') {
        // Node/CommonJS
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(factory);
    } else {
        // Browser globals (with support for web workers)
        var glob;

        try {
            glob = window;
        } catch (e) {
            glob = self;
        }

        glob.SparkMD5 = factory();
    }
}(function (undefined) {

    'use strict';

    /*
     * Fastest md5 implementation around (JKM md5)
     * Credits: Joseph Myers
     *
     * @see http://www.myersdaily.org/joseph/javascript/md5-text.html
     * @see http://jsperf.com/md5-shootout/7
     */

    /* this function is much faster,
      so if possible we use it. Some IEs
      are the only ones I know of that
      need the idiotic second function,
      generated by an if clause.  */
    var add32 = function (a, b) {
        return (a + b) & 0xFFFFFFFF;
    },
        hex_chr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];


    function cmn(q, a, b, x, s, t) {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
    }

    function ff(a, b, c, d, x, s, t) {
        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }

    function gg(a, b, c, d, x, s, t) {
        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }

    function hh(a, b, c, d, x, s, t) {
        return cmn(b ^ c ^ d, a, b, x, s, t);
    }

    function ii(a, b, c, d, x, s, t) {
        return cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    function md5cycle(x, k) {
        var a = x[0],
            b = x[1],
            c = x[2],
            d = x[3];

        a = ff(a, b, c, d, k[0], 7, -680876936);
        d = ff(d, a, b, c, k[1], 12, -389564586);
        c = ff(c, d, a, b, k[2], 17, 606105819);
        b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897);
        d = ff(d, a, b, c, k[5], 12, 1200080426);
        c = ff(c, d, a, b, k[6], 17, -1473231341);
        b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7, 1770035416);
        d = ff(d, a, b, c, k[9], 12, -1958414417);
        c = ff(c, d, a, b, k[10], 17, -42063);
        b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7, 1804603682);
        d = ff(d, a, b, c, k[13], 12, -40341101);
        c = ff(c, d, a, b, k[14], 17, -1502002290);
        b = ff(b, c, d, a, k[15], 22, 1236535329);

        a = gg(a, b, c, d, k[1], 5, -165796510);
        d = gg(d, a, b, c, k[6], 9, -1069501632);
        c = gg(c, d, a, b, k[11], 14, 643717713);
        b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691);
        d = gg(d, a, b, c, k[10], 9, 38016083);
        c = gg(c, d, a, b, k[15], 14, -660478335);
        b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5, 568446438);
        d = gg(d, a, b, c, k[14], 9, -1019803690);
        c = gg(c, d, a, b, k[3], 14, -187363961);
        b = gg(b, c, d, a, k[8], 20, 1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467);
        d = gg(d, a, b, c, k[2], 9, -51403784);
        c = gg(c, d, a, b, k[7], 14, 1735328473);
        b = gg(b, c, d, a, k[12], 20, -1926607734);

        a = hh(a, b, c, d, k[5], 4, -378558);
        d = hh(d, a, b, c, k[8], 11, -2022574463);
        c = hh(c, d, a, b, k[11], 16, 1839030562);
        b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060);
        d = hh(d, a, b, c, k[4], 11, 1272893353);
        c = hh(c, d, a, b, k[7], 16, -155497632);
        b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4, 681279174);
        d = hh(d, a, b, c, k[0], 11, -358537222);
        c = hh(c, d, a, b, k[3], 16, -722521979);
        b = hh(b, c, d, a, k[6], 23, 76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487);
        d = hh(d, a, b, c, k[12], 11, -421815835);
        c = hh(c, d, a, b, k[15], 16, 530742520);
        b = hh(b, c, d, a, k[2], 23, -995338651);

        a = ii(a, b, c, d, k[0], 6, -198630844);
        d = ii(d, a, b, c, k[7], 10, 1126891415);
        c = ii(c, d, a, b, k[14], 15, -1416354905);
        b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6, 1700485571);
        d = ii(d, a, b, c, k[3], 10, -1894986606);
        c = ii(c, d, a, b, k[10], 15, -1051523);
        b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6, 1873313359);
        d = ii(d, a, b, c, k[15], 10, -30611744);
        c = ii(c, d, a, b, k[6], 15, -1560198380);
        b = ii(b, c, d, a, k[13], 21, 1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070);
        d = ii(d, a, b, c, k[11], 10, -1120210379);
        c = ii(c, d, a, b, k[2], 15, 718787259);
        b = ii(b, c, d, a, k[9], 21, -343485551);

        x[0] = add32(a, x[0]);
        x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]);
        x[3] = add32(d, x[3]);
    }

    function md5blk(s) {
        var md5blks = [],
            i; /* Andy King said do it this way. */

        for (i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
    }

    function md5blk_array(a) {
        var md5blks = [],
            i; /* Andy King said do it this way. */

        for (i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = a[i] + (a[i + 1] << 8) + (a[i + 2] << 16) + (a[i + 3] << 24);
        }
        return md5blks;
    }

    function md51(s) {
        var n = s.length,
            state = [1732584193, -271733879, -1732584194, 271733878],
            i,
            length,
            tail,
            tmp,
            lo,
            hi;

        for (i = 64; i <= n; i += 64) {
            md5cycle(state, md5blk(s.substring(i - 64, i)));
        }
        s = s.substring(i - 64);
        length = s.length;
        tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
        }
        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            md5cycle(state, tail);
            for (i = 0; i < 16; i += 1) {
                tail[i] = 0;
            }
        }

        // Beware that the final length might not fit in 32 bits so we take care of that
        tmp = n * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;

        tail[14] = lo;
        tail[15] = hi;

        md5cycle(state, tail);
        return state;
    }

    function md51_array(a) {
        var n = a.length,
            state = [1732584193, -271733879, -1732584194, 271733878],
            i,
            length,
            tail,
            tmp,
            lo,
            hi;

        for (i = 64; i <= n; i += 64) {
            md5cycle(state, md5blk_array(a.subarray(i - 64, i)));
        }

        // Not sure if it is a bug, however IE10 will always produce a sub array of length 1
        // containing the last element of the parent array if the sub array specified starts
        // beyond the length of the parent array - weird.
        // https://connect.microsoft.com/IE/feedback/details/771452/typed-array-subarray-issue
        a = (i - 64) < n ? a.subarray(i - 64) : new Uint8Array(0);

        length = a.length;
        tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= a[i] << ((i % 4) << 3);
        }

        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            md5cycle(state, tail);
            for (i = 0; i < 16; i += 1) {
                tail[i] = 0;
            }
        }

        // Beware that the final length might not fit in 32 bits so we take care of that
        tmp = n * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;

        tail[14] = lo;
        tail[15] = hi;

        md5cycle(state, tail);

        return state;
    }

    function rhex(n) {
        var s = '',
            j;
        for (j = 0; j < 4; j += 1) {
            s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
        }
        return s;
    }

    function hex(x) {
        var i;
        for (i = 0; i < x.length; i += 1) {
            x[i] = rhex(x[i]);
        }
        return x.join('');
    }

    // In some cases the fast add32 function cannot be used..
    if (hex(md51('hello')) !== '5d41402abc4b2a76b9719d911017c592') {
        add32 = function (x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF),
                msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        };
    }

    // ---------------------------------------------------

    function toUtf8(str) {
        if (/[\u0080-\uFFFF]/.test(str)) {
            str = unescape(encodeURIComponent(str));
        }

        return str;
    }

    function utf8Str2ArrayBuffer(str, returnUInt8Array) {
        var length = str.length,
           buff = new ArrayBuffer(length),
           arr = new Uint8Array(buff),
           i;

        for (i = 0; i < length; i++) {
            arr[i] = str.charCodeAt(i);
        }

        return returnUInt8Array ? arr : buff;
    }

    function arrayBuffer2Utf8Str(buff) {
        return String.fromCharCode.apply(null, new Uint8Array(buff));
    }

    function concatenateArrayBuffers(first, second, returnUInt8Array) {
        var result = new Uint8Array(first.byteLength + second.byteLength);

        result.set(new Uint8Array(first));
        result.set(new Uint8Array(second), first.byteLength);

        return returnUInt8Array ? result : result.buffer;
    }

    // ---------------------------------------------------

    /**
     * SparkMD5 OOP implementation.
     *
     * Use this class to perform an incremental md5, otherwise use the
     * static methods instead.
     */
    function SparkMD5() {
        // call reset to init the instance
        this.reset();
    }

    /**
     * Appends a string.
     * A conversion will be applied if an utf8 string is detected.
     *
     * @param {String} str The string to be appended
     *
     * @return {SparkMD5} The instance itself
     */
    SparkMD5.prototype.append = function (str) {
        // Converts the string to utf8 bytes if necessary
        // Then append as binary
        this.appendBinary(toUtf8(str));

        return this;
    };

    /**
     * Appends a binary string.
     *
     * @param {String} contents The binary string to be appended
     *
     * @return {SparkMD5} The instance itself
     */
    SparkMD5.prototype.appendBinary = function (contents) {
        this._buff += contents;
        this._length += contents.length;

        var length = this._buff.length,
            i;

        for (i = 64; i <= length; i += 64) {
            md5cycle(this._hash, md5blk(this._buff.substring(i - 64, i)));
        }

        this._buff = this._buff.substring(i - 64);

        return this;
    };

    /**
     * Finishes the incremental computation, reseting the internal state and
     * returning the result.
     * Use the raw parameter to obtain the raw result instead of the hex one.
     *
     * @param {Boolean} raw True to get the raw result, false to get the hex result
     *
     * @return {String|Array} The result
     */
    SparkMD5.prototype.end = function (raw) {
        var buff = this._buff,
            length = buff.length,
            i,
            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ret;

        for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= buff.charCodeAt(i) << ((i % 4) << 3);
        }

        this._finish(tail, length);
        ret = !!raw ? this._hash : hex(this._hash);

        this.reset();

        return ret;
    };

    /**
     * Resets the internal state of the computation.
     *
     * @return {SparkMD5} The instance itself
     */
    SparkMD5.prototype.reset = function () {
        this._buff = '';
        this._length = 0;
        this._hash = [1732584193, -271733879, -1732584194, 271733878];

        return this;
    };

    /**
     * Gets the internal state of the computation.
     *
     * @return {Object} The state
     */
    SparkMD5.prototype.getState = function () {
        return {
            buff: this._buff,
            length: this._length,
            hash: this._hash
        };
    };

    /**
     * Gets the internal state of the computation.
     *
     * @param {Object} state The state
     *
     * @return {SparkMD5} The instance itself
     */
    SparkMD5.prototype.setState = function (state) {
        this._buff = state.buff;
        this._length = state.length;
        this._hash = state.hash;

        return this;
    };

    /**
     * Releases memory used by the incremental buffer and other additional
     * resources. If you plan to use the instance again, use reset instead.
     */
    SparkMD5.prototype.destroy = function () {
        delete this._hash;
        delete this._buff;
        delete this._length;
    };

    /**
     * Finish the final calculation based on the tail.
     *
     * @param {Array}  tail   The tail (will be modified)
     * @param {Number} length The length of the remaining buffer
     */
    SparkMD5.prototype._finish = function (tail, length) {
        var i = length,
            tmp,
            lo,
            hi;

        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            md5cycle(this._hash, tail);
            for (i = 0; i < 16; i += 1) {
                tail[i] = 0;
            }
        }

        // Do the final computation based on the tail and length
        // Beware that the final length may not fit in 32 bits so we take care of that
        tmp = this._length * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;

        tail[14] = lo;
        tail[15] = hi;
        md5cycle(this._hash, tail);
    };

    /**
     * Performs the md5 hash on a string.
     * A conversion will be applied if utf8 string is detected.
     *
     * @param {String}  str The string
     * @param {Boolean} raw True to get the raw result, false to get the hex result
     *
     * @return {String|Array} The result
     */
    SparkMD5.hash = function (str, raw) {
        // Converts the string to utf8 bytes if necessary
        // Then compute it using the binary function
        return SparkMD5.hashBinary(toUtf8(str), raw);
    };

    /**
     * Performs the md5 hash on a binary string.
     *
     * @param {String}  content The binary string
     * @param {Boolean} raw     True to get the raw result, false to get the hex result
     *
     * @return {String|Array} The result
     */
    SparkMD5.hashBinary = function (content, raw) {
        var hash = md51(content);

        return !!raw ? hash : hex(hash);
    };

    // ---------------------------------------------------

    /**
     * SparkMD5 OOP implementation for array buffers.
     *
     * Use this class to perform an incremental md5 ONLY for array buffers.
     */
    SparkMD5.ArrayBuffer = function () {
        // call reset to init the instance
        this.reset();
    };

    /**
     * Appends an array buffer.
     *
     * @param {ArrayBuffer} arr The array to be appended
     *
     * @return {SparkMD5.ArrayBuffer} The instance itself
     */
    SparkMD5.ArrayBuffer.prototype.append = function (arr) {
        var buff = concatenateArrayBuffers(this._buff.buffer, arr, true),
            length = buff.length,
            i;

        this._length += arr.byteLength;

        for (i = 64; i <= length; i += 64) {
            md5cycle(this._hash, md5blk_array(buff.subarray(i - 64, i)));
        }

        // Avoids IE10 weirdness (documented above)
        this._buff = (i - 64) < length ? buff.subarray(i - 64) : new Uint8Array(0);

        return this;
    };

    /**
     * Finishes the incremental computation, reseting the internal state and
     * returning the result.
     * Use the raw parameter to obtain the raw result instead of the hex one.
     *
     * @param {Boolean} raw True to get the raw result, false to get the hex result
     *
     * @return {String|Array} The result
     */
    SparkMD5.ArrayBuffer.prototype.end = function (raw) {
        var buff = this._buff,
            length = buff.length,
            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            i,
            ret;

        for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= buff[i] << ((i % 4) << 3);
        }

        this._finish(tail, length);
        ret = !!raw ? this._hash : hex(this._hash);

        this.reset();

        return ret;
    };

    /**
     * Resets the internal state of the computation.
     *
     * @return {SparkMD5.ArrayBuffer} The instance itself
     */
    SparkMD5.ArrayBuffer.prototype.reset = function () {
        this._buff = new Uint8Array(0);
        this._length = 0;
        this._hash = [1732584193, -271733879, -1732584194, 271733878];

        return this;
    };

    /**
     * Gets the internal state of the computation.
     *
     * @return {Object} The state
     */
    SparkMD5.ArrayBuffer.prototype.getState = function () {
        var state = SparkMD5.prototype.getState.call(this);

        // Convert buffer to a string
        state.buff = arrayBuffer2Utf8Str(state.buff);

        return state;
    };

    /**
     * Gets the internal state of the computation.
     *
     * @param {Object} state The state
     *
     * @return {SparkMD5.ArrayBuffer} The instance itself
     */
    SparkMD5.ArrayBuffer.prototype.setState = function (state) {
        // Convert string to buffer
        state.buff = utf8Str2ArrayBuffer(state.buff, true);

        return SparkMD5.prototype.setState.call(this, state);
    };

    SparkMD5.ArrayBuffer.prototype.destroy = SparkMD5.prototype.destroy;

    SparkMD5.ArrayBuffer.prototype._finish = SparkMD5.prototype._finish;

    /**
     * Performs the md5 hash on an array buffer.
     *
     * @param {ArrayBuffer} arr The array buffer
     * @param {Boolean}     raw True to get the raw result, false to get the hex result
     *
     * @return {String|Array} The result
     */
    SparkMD5.ArrayBuffer.hash = function (arr, raw) {
        var hash = md51_array(new Uint8Array(arr));

        return !!raw ? hash : hex(hash);
    };

    return SparkMD5;
}));

/** File: strophe.js
 *  A JavaScript library for XMPP BOSH.
 *
 *  This is the JavaScript version of the Strophe library.  Since JavaScript
 *  has no facilities for persistent TCP connections, this library uses
 *  Bidirectional-streams Over Synchronous HTTP (BOSH) to emulate
 *  a persistent, stateful, two-way connection to an XMPP server.  More
 *  information on BOSH can be found in XEP 124.
 *
 *  This program is distributed under the terms of the MIT license.
 *  Please see the LICENSE file for details.
 *  Copyright 2006-2008, OGG, LLC
 */

/*global
	DOMParser: false,
    XMLHttpRequest: false,
    ActiveXObject: false,
    Base64: false,
    SparkMD5: false,
    Strophe: true,
    jQuery: false,
    msos: false,
    _: false,
    Modernizr: false,
    core_hmac_sha1: false,
    binb2str: false,
    str_hmac_sha1: false,
    b64_hmac_sha1: false,
    str_sha1: false,
    $build: true,
    $msg: true,
    $iq: true,
    $pres: true,
*/

(function (callback) {
	"use strict";

	var Strophe,
		stph_bld = 'Strophe.Builder - ',
		stph_con = 'Strophe.Connection - ',
		stph_hdl = 'Strophe.Handler - ',
		stph_rqt = 'Strophe.Request - ',
		vbs = msos.config.verbose,
		msos_db = msos.console.debug,
		m = 0;

	function $build(name, attrs)	{ return new Strophe.Builder(name, attrs);			}
	function $msg(attrs)			{ return new Strophe.Builder("message", attrs);		}
	function $iq(attrs)				{ return new Strophe.Builder("iq", attrs);			}
	function $pres(attrs)			{ return new Strophe.Builder("presence", attrs);	}

	Strophe = {

		VERSION: "1.2.3",	// originally from 1.0.2 w/ updates

		onIdle_delay: 333,

		/* XMPP Namespace Constants */
		NS: {
			HTTPBIND:		"http://jabber.org/protocol/httpbind",
			BOSH:			"urn:xmpp:xbosh",
			CLIENT:			"jabber:client",
			AUTH:			"jabber:iq:auth",
			ROSTER:			"jabber:iq:roster",
			PROFILE:		"jabber:iq:profile",
			DISCO_INFO:		"http://jabber.org/protocol/disco#info",
			DISCO_ITEMS:	"http://jabber.org/protocol/disco#items",
			MUC:			"http://jabber.org/protocol/muc",
			SASL:			"urn:ietf:params:xml:ns:xmpp-sasl",
			STREAM:			"http://etherx.jabber.org/streams",
			FRAMING:		"urn:ietf:params:xml:ns:xmpp-framing",
			BIND:			"urn:ietf:params:xml:ns:xmpp-bind",
			SESSION:		"urn:ietf:params:xml:ns:xmpp-session",
			VERSION:		"jabber:iq:version",
			STANZAS:		"urn:ietf:params:xml:ns:xmpp-stanzas",
			XHTML_IM:		"http://jabber.org/protocol/xhtml-im",
			XHTML:			"http://www.w3.org/1999/xhtml"
		},

		XHTML: {
			tags: ['a', 'blockquote', 'br', 'cite', 'em', 'img', 'li', 'ol', 'p', 'span', 'strong', 'ul', 'body'],
			attributes: {
				'a':          ['href'],
				'blockquote': ['style'],
				'br':         [],
				'cite':       ['style'],
				'em':         [],
				'img':        ['src', 'alt', 'style', 'height', 'width'],
				'li':         ['style'],
				'ol':         ['style'],
				'p':          ['style'],
				'span':       ['style'],
				'strong':     [],
				'ul':         ['style'],
				'body':       []
			},

			css: [
				'background-color', 'color',
				'font-family', 'font-size', 'font-style', 'font-weight',
				'margin-left', 'margin-right',
				'text-align', 'text-decoration'
			],

			validTag: function (tag) {
				var i = 0;
				for (i = 0; i < Strophe.XHTML.tags.length; i += 1) {
					if (tag === Strophe.XHTML.tags[i]) {
						return true;
					}
				}
				return false;
			},

			validAttribute: function (tag, attribute) {
				var i = 0;

				if (Strophe.XHTML.attributes[tag] !== undefined
				 && Strophe.XHTML.attributes[tag].length > 0) {
					for (i = 0; i < Strophe.XHTML.attributes[tag].length; i += 1) {
						if (attribute === Strophe.XHTML.attributes[tag][i]) {
							return true;
						}
					}
				}
				return false;
			},

			validCSS: function (style) {
				var i = 0;

				for (i = 0; i < Strophe.XHTML.css.length; i += 1) {
					if (style === Strophe.XHTML.css[i]) {
						return true;
					}
				}
				return false;
			}
		},

		addNamespace: function (name, value) {
			Strophe.NS[name] = value;
		},

		/* Connection Status Constants (we build Strophe.Status later) */
		status_name: [
			'ERROR', 'CONNECTING', 'CONNFAIL', 'AUTHENTICATING', 'AUTHFAIL',
			'CONNECTED', 'DISCONNECTED', 'DISCONNECTING', 'ATTACHED', 'REDIRECT'
		],
		Status: {},

		ElementType: {
			NORMAL: 1,
			TEXT: 3,
			CDATA: 4,
			FRAGMENT: 11
		},

		/* PrivateConstants: Timeout Values
		 * TIMEOUT - Math.floor(TIMEOUT * wait) seconds have elapsed, (default: 1.1, for a wait of 66 seconds).
		 * SECONDARY_TIMEOUT - Math.floor(SECONDARY_TIMEOUT * wait) seconds have elapsed, (default: 0.1, for a wait of 6 seconds).
		 */
		TIMEOUT: 1.1,
		SECONDARY_TIMEOUT: 0.1,

		_xmlGenerator: null,

		xmlGenerator: function () {
			if (!Strophe._xmlGenerator) {
				var doc = document.implementation.createDocument('jabber:client', 'strophe', null);
				Strophe._xmlGenerator = doc;
			}
			return Strophe._xmlGenerator;
		},

		xmlElement: function (name) {

			if (!name) { return null; }

			var node = Strophe.xmlGenerator().createElement(name),
				a = 0,
				i = 0,
				k = '',
				arg,
				attr;

			for (a = 1; a < arguments.length; a += 1) {
				arg = arguments[a];

				if (!msos.var_is_empty(arg)) {
					if (typeof arg === "string" ||
						typeof arg === "number") {
						node.appendChild(Strophe.xmlTextNode(arg));
					} else if (typeof arg === "object" &&
							   typeof arg.sort === "function") {
						for (i = 0; i < arg.length; i += 1) {
							attr = arg[i];
							if (typeof attr === "object" &&
								typeof attr.sort === "function" &&
								attr[1] !== undefined &&
								attr[1] !== null) {
								node.setAttribute(attr[0], attr[1]);
							}
						}
					} else if (typeof arg === "object") {
						for (k in arg) {
							if (arg.hasOwnProperty(k)) {
								if (arg[k] !== undefined &&
									arg[k] !== null) {
									node.setAttribute(k, arg[k]);
								}
							}
						}
					}
				}
			}
			return node;
		},

		xmlescape: function (text) {
			if (msos.var_is_empty(text)) {
				msos.console.warn('Strophe.xmlescape -> missing input!');
				return '';
			}
			text = text.replace(/\&/g, "&amp;");
			text = text.replace(/</g,  "&lt;");
			text = text.replace(/>/g,  "&gt;");
			text = text.replace(/'/g,  "&apos;");
			text = text.replace(/"/g,  "&quot;");

			return text;
		},

		xmlunescape: function (text) {
			if (msos.var_is_empty(text)) {
				msos.console.warn('Strophe.unxmlescape -> missing input!');
				return '';
			}
			text = text.replace(/\&amp;/g, "&");
			text = text.replace(/&lt;/g,  "<");
			text = text.replace(/&gt;/g,  ">");
			text = text.replace(/&apos;/g,  "'");
			text = text.replace(/&quot;/g,  "\"");

			return text;
		},

		xmlTextNode: function (text) {
			return Strophe.xmlGenerator().createTextNode(text);
		},

		xmlHtmlNode: function (html) {
			var node,
				parser;

			// Ensure text is escaped
			if (window.DOMParser) {
				parser = new DOMParser();
				node = parser.parseFromString(html, "text/xml");
			} else {
				node = new ActiveXObject("Microsoft.XMLDOM");
				node.async = "false";
				node.loadXML(html);
			}
			return node;
		},

		getText: function (elem) {

			if (!elem) { return null; }

			var str = '',
				i = 0;

			if (elem.childNodes.length === 0
			 && elem.nodeType === Strophe.ElementType.TEXT) {
				str += elem.nodeValue;
			}

			for (i = 0; i < elem.childNodes.length; i += 1) {
				if (elem.childNodes[i].nodeType === Strophe.ElementType.TEXT) {
					str += elem.childNodes[i].nodeValue;
				}
			}

			return Strophe.xmlescape(str);
		},

		copyElement: function (elem) {
			var i = 0,
				el;

			if (elem.nodeType === Strophe.ElementType.NORMAL) {
				el = Strophe.xmlElement(elem.tagName);

				for (i = 0; i < elem.attributes.length; i += 1) {
					el.setAttribute(
						elem.attributes[i].nodeName,
						elem.attributes[i].value
					);
				}

				for (i = 0; i < elem.childNodes.length; i += 1) {
					el.appendChild(Strophe.copyElement(elem.childNodes[i]));
				}
			} else if (elem.nodeType === Strophe.ElementType.TEXT) {
				el = Strophe.xmlGenerator().createTextNode(elem.nodeValue);
			}

			return el;
		},

		createHtml_def_length: 1000,
		createHtml_max_length: 1000,
		createHtml_cur_length: 0,

		createHtml: function (elem, flag_child) {
			var i = 0,
				el,
				j = 0,
				tag,
				attribute,
				value,
				css,
				cssAttrs,
				attr,
				cssName,
				cssValue,
				text,
				prev_length,
				next_length,
				diff_length;

			msos_db('Strophe.createHtml -> called, child: ' + (flag_child ? 'true' : 'false'));

			if (elem && elem.nodeType === Strophe.ElementType.NORMAL) {
				tag = elem.nodeName.toLowerCase();
				if (Strophe.XHTML.validTag(tag)) {
					try {
						el = Strophe.xmlElement(tag);
						for (i = 0; i < Strophe.XHTML.attributes[tag].length; i += 1) {
							attribute = Strophe.XHTML.attributes[tag][i];
							value = elem.getAttribute(attribute);
							if (!msos.var_is_empty(value) && value !== false && value !== 0) {
								if (attribute === 'style' && typeof value === 'object') {
									if (value.cssText !== undefined) {
										value = value.cssText;
									}
								}
								// filter out invalid css styles
								if (attribute === 'style') {
									css = [];
									cssAttrs = value.split(';');
									for (j = 0; j < cssAttrs.length; j += 1) {
										attr = cssAttrs[j].split(':');
										cssName = attr[0].replace(/^\s*/, "").replace(/\s*$/, "").toLowerCase();
										if (Strophe.XHTML.validCSS(cssName)) {
											cssValue = attr[1].replace(/^\s*/, "").replace(/\s*$/, "");
											css.push(cssName + ': ' + cssValue);
										}
									}
									if (css.length > 0) {
										value = css.join('; ');
										el.setAttribute(attribute, value);
									}
								} else {
									el.setAttribute(attribute, value);
								}
							}
						}

						for (i = 0; i < elem.childNodes.length; i += 1) {
							el.appendChild(Strophe.createHtml(elem.childNodes[i]), true);
						}
					} catch (e) { // invalid elements
					  el = Strophe.xmlTextNode('');
					  msos.console.warn('Strophe - createHtml -> invalid elements in: ' + tag + ', error: ' + e);
					}
				} else {
					el = Strophe.xmlGenerator().createDocumentFragment();
					for (i = 0; i < elem.childNodes.length; i += 1) {
						el.appendChild(Strophe.createHtml(elem.childNodes[i]), true);
					}
				}
			} else if (elem && elem.nodeType === Strophe.ElementType.FRAGMENT) {
				el = Strophe.xmlGenerator().createDocumentFragment();
				for (i = 0; i < elem.childNodes.length; i += 1) {
					el.appendChild(Strophe.createHtml(elem.childNodes[i]), true);
				}
			} else if (elem && elem.nodeType === Strophe.ElementType.TEXT) {
				text = elem.nodeValue;

				prev_length = Strophe.createHtml_cur_length;
				next_length = Strophe.createHtml_cur_length  + text.length;

				if (next_length > Strophe.createHtml_max_length) {
					diff_length = Strophe.createHtml_max_length - prev_length;
					Strophe.createHtml_cur_length += diff_length;

					text = text.substring(0, diff_length);
					text += '...';

					msos_db('Strophe - createHtml -> cropped total text to: ' + Strophe.createHtml_max_length);
				} else {
					Strophe.createHtml_cur_length = next_length;
				}

				el = Strophe.xmlTextNode(text);
			} else {
				msos.console.error('Strophe - createHtml -> missing input element!');
				return undefined;
			}

			// Top level node, so reset
			if (flag_child !== true) {
				Strophe.createHtml_max_length = Strophe.createHtml_def_length;
				Strophe.createHtml_cur_length = 0;
			}

			return el;
		},

		escapeNode: function (node) {
			if (msos.var_is_empty(node)) {
				msos.console.warn('Strophe.escapeNode -> missing input!');
				return '';
			}

			if (typeof node !== "string") {
				msos.console.warn('Strophe.escapeNode -> input not a string!');
				return node;
			}

			return node.replace(/^\s+|\s+$/g, '')
				.replace(/\\/g,  "\\5c")
				.replace(/ /g,   "\\20")
				.replace(/\"/g,  "\\22")
				.replace(/\&/g,  "\\26")
				.replace(/\'/g,  "\\27")
				.replace(/\//g,  "\\2f")
				.replace(/:/g,   "\\3a")
				.replace(/</g,   "\\3c")
				.replace(/>/g,   "\\3e")
				.replace(/@/g,   "\\40");
		},

		unescapeNode: function (node) {
			if (msos.var_is_empty(node)) {
				msos.console.warn('Strophe.unescapeNode -> missing input!');
				return '';
			}

			if (typeof node !== "string") {
				msos.console.warn('Strophe.unescapeNode -> input not a string!');
				return node;
			}

			return node.replace(/\\20/g, " ")
				.replace(/\\22/g, '"')
				.replace(/\\26/g, "&")
				.replace(/\\27/g, "'")
				.replace(/\\2f/g, "/")
				.replace(/\\3a/g, ":")
				.replace(/\\3c/g, "<")
				.replace(/\\3e/g, ">")
				.replace(/\\40/g, "@")
				.replace(/\\5c/g, "\\");
		},

		getNodeFromJid: function (jid) {
			var gnj = 'Strophe.getNodeFromJid -> ',
				out;

			if (vbs === 'strophe') {
				msos_db(gnj + 'start, jid: ' + jid);
			}

			if (jid.indexOf("@") < 0) {
				out = null;
			} else {
				out = jid.split("@")[0];
			}

			if (vbs === 'strophe') {
				msos_db(gnj + 'done, node: ' + out);
			}
			return out;
		},

		getDomainFromJid: function (jid) {
			var gdj = 'Strophe.getDomainFromJid -> ',
				bare,
				parts = [],
				out;

			if (vbs === 'strophe') {
				msos_db(gdj + 'start, jid: ' + jid);
			}

			bare = Strophe.getBareJidFromJid(jid);

			if (bare.indexOf("@") < 0) {
				out = bare;
			} else {
				parts = bare.split("@");
				parts.splice(0, 1);

				out = parts.join('@');
			}

			if (vbs === 'strophe') {
				msos_db(gdj + 'done, domain: ' + out);
			}
			return out;
		},

		getResourceFromJid: function (jid) {
			var temp_gr = 'Strophe.getResourceFromJid -> ',
				s = jid.split("/"),
				out;

			if (vbs === 'strophe') {
				msos_db(temp_gr + 'start, input jid: ' + jid);
			}

			if (s.length < 2) {
				out = null;
			} else {
				s.splice(0, 1);
				out = s.join('/');
			}

			if (vbs === 'strophe') {
				msos_db(temp_gr + 'done, resource: ' + out);
			}
			return out;
		},

		getBareJidFromJid: function (jid) {
			var out = jid ? jid.split("/")[0] : null;

			if (vbs === 'strophe') {
				msos_db('Strophe.getBareJidFromJid -> called, jid (in): ' + jid + ', bare (out): ' + out);
			}
			return out;
		},

		serialize: function (elem) {

			if (typeof elem.tree === "function") { elem = elem.tree(); }

			return jQuery(elem)[0].outerHTML;
		},

		_requestId: 0,

		_connectionPlugins: {},

		addConnectionPlugin: function (name, ptype) {
			Strophe._connectionPlugins[name] = ptype;
		}
	};

	// Build Strophe Status object
	for (m = 0; m < Strophe.status_name.length; m += 1) {
		Strophe.Status[Strophe.status_name[m]] = m;
	}

	Strophe.Builder = function (name, attrs) {
		// Set correct namespace for jabber:client elements
		if (name === "presence" || name === "message" || name === "iq") {
			if (attrs && !attrs.xmlns) {
				attrs.xmlns = Strophe.NS.CLIENT;
			} else if (!attrs) {
				attrs = { xmlns: Strophe.NS.CLIENT };
			}
		}

		// Holds the tree being built.
		this.nodeTree = Strophe.xmlElement(name, attrs);

		// Points to the current operation node.
		this.node = this.nodeTree;
	};

	Strophe.Builder.prototype = {

		tree: function () {
			return this.nodeTree;
		},

		toString: function () {
			return Strophe.serialize(this.nodeTree);
		},

		up: function () {
			this.node = this.node.parentNode;
			return this;
		},

		attrs: function (moreattrs) {
			var k = '';

			for (k in moreattrs) {
				if (moreattrs.hasOwnProperty(k)) {
					if (moreattrs[k] === undefined) {
						this.node.removeAttribute(k);
					} else {
						this.node.setAttribute(k, moreattrs[k]);
					}
				}
			}

			return this;
		},

		c: function (name, attrs, text) {
			var child = Strophe.xmlElement(name, attrs, text);

			this.node.appendChild(child);

			if (typeof text !== "string") {
				this.node = child;
			}
			return this;
		},

		cnode: function (elem) {
			var xmlGen = Strophe.xmlGenerator(),
				impNode = false,
				newElem;

			try {
				impNode = (xmlGen.importNode !== undefined);
			} catch (e) {
				impNode = false;
				msos.console.warn(stph_bld + 'cnode -> error: ' + e);
			}
			newElem = impNode ?
				xmlGen.importNode(elem, true) :
				Strophe.copyElement(elem);

			this.node.appendChild(newElem);
			this.node = newElem;

			return this;
		},

		t: function (text) {
			var child = Strophe.xmlTextNode(text);
			this.node.appendChild(child);
			return this;
		},

		h: function (html) {
			var fragment = document.createElement('body'),
				xhtml;

			// force the browser to try and fix any invalid HTML tags
			fragment.innerHTML = html;

			// copy cleaned html into an xml dom
			xhtml = Strophe.createHtml(fragment);

			while (xhtml.childNodes.length > 0) {
				this.node.appendChild(xhtml.childNodes[0]);
			}
			return this;
		}
	};

	Strophe.Handler = function (handler, ns, name, type, id, from) {
		this.handler = handler;
		this.ns = ns;
		this.name = name;
		this.type = type || false;
		this.id = id || false;
		this.from = from || false;

		this.user = true;
		this.describe = '';

		return this;
	};

	Strophe.Handler.prototype = {

		isMatch: function (elem) {
			var $elem = jQuery(elem),
				nsMatch = false,
				that = this;

			if (!this.ns) {
				nsMatch = true;
			} else {
				nsMatch = $elem.attr("xmlns") === this.ns;

				if (!nsMatch) {
					$elem.children().each(
						function (i, child) {
							var $child = jQuery(child);
							if ($child.attr("xmlns") === that.ns) {
								nsMatch = true;
							}
						}
					);
				}
			}

			if (nsMatch &&
				(!this.name	|| $elem.prop("tagName").toLowerCase() === this.name) &&
				(!this.type	|| (_.isArray(this.type) ? _.indexOf(this.type, $elem.attr("type")) !== -1 : $elem.attr("type") === this.type)) &&
				(!this.id	|| $elem.attr("id") === this.id) &&
				(!this.from	|| $elem.attr('from') === this.from)) {
					return true;
			}

			return false;
		},

		run: function (elem) {
			var result = null;

			if (vbs) {
				msos_db(stph_hdl + 'run -> start, handler:\n    ' + this.toString());
			}

			try {
				result = this.handler(elem) || false;
			} catch (e) {
				if			(e.sourceURL) {
					msos.console.error(stph_hdl + "run -> error w/url: " + e.sourceURL + ":" + e.line + " - " + e.name + ": " + e.message + "\n for handler: " + this.toString());
				} else if	(e.fileName) {
					msos.console.error(stph_hdl + "run -> error w/file: " + e.fileName + ":" + e.lineNumber + " - " + e.name + ": " + e.message + "\n for handler: " + this.toString());
				} else if	(e.stack) {
					msos.console.error(stph_hdl + "run -> error w/stack: " + e.stack + "\n for handler: " + this.toString());
				} else {
					msos.console.error(stph_hdl + "run -> error plain: " + e.message + "\n for handler: " + this.toString());
				}
			}

			if (vbs) {
				msos_db(stph_hdl + "run -> done!");
			}

			return result;
		},

		toString: function () {

			return "ns: " + this.ns
			   + ", name: " + this.name
			   + ", type: " + (_.isArray(this.type) ? this.type.join(' or ') : this.type)
			   + ", id: " + this.id
			   + ", from: " + this.from
			   + ", user: " + this.user
			   + (this.describe ? ", desc: " + this.describe : '');
		}
	};

	Strophe.TimedHandler = function (period, handler) {
		this.period = period;
		this.handler = handler;

		this.lastCalled = new Date().getTime();
		this.user = true;
	};

	Strophe.TimedHandler.prototype = {

		run: function () {
			this.lastCalled = new Date().getTime();
			return this.handler();
		},

		reset: function () {
			this.lastCalled = new Date().getTime();
		},

		toString: function () {
			return "{ TimedHandler: " + this.handler + "(" + this.period + ") }";
		}
	};

	Strophe.Connection = function (service, options) {

		/* The path to the httpbind service or websocket url. */
		this.service = service;

		// Configuration options
		this.options = options || {};

		this.jid = "";		// Note: Strophe uses the "escaped" version of jid internally
		this.domain = null;
		this.features = null;

		this.rid = Math.floor(Math.random() * 4294967295);
		this.sid = null;

		this.streamId = null;
		this.resource = null;

		this._sasl_data = {};

		this.do_session = false;
		this.do_bind = false;

		// Handler lists
		this.timedHandlers = [];
		this.handlers = [];
		this.removeTimeds = [];
		this.removeHandlers = [];
		this.addTimeds = [];
		this.addHandlers = [];

		this._authentication = {};
		this._idleTimeout = null;
		this._disconnectTimeout = null;

		this.do_authentication = true;
		this.authenticated = false;
		this.disconnecting = false;
		this.connected = false;
		this.errors = 0;

		this.paused = false;
		this.restored = false;

		// Default values (BOSH only)
		this.hold = 1;
		this.wait = 60;
		this.window = 5;

		// Default values (ws only)
		this.ws = null;
		this.connect_timeout = 300;
		this._keep_alive_timer = 20000;

		this._data = [];
		this._requests = [];

		this._sasl_success_handler = null;
		this._sasl_failure_handler = null;
		this._sasl_challenge_handler = null;

		this.maxRetries = 5;

		this._idleTimeout = setTimeout(_.bind(this._onIdle, this), Strophe.onIdle_delay);

		var k = '',
			ptype,
			F;

		// Initialize plugins
		for (k in Strophe._connectionPlugins) {
			ptype = Strophe._connectionPlugins[k];

			F = function () {};
			F.prototype = ptype;

			this[k] = new F();
			this[k].init(this);
		}
	};

	Strophe.Connection.prototype = {

		pause:	function () { this.paused = true; },
		resume:	function () { this.paused = false; },
		debug_count: 0,

		getUniqueId: function (suffix) {
			var uuid,
				hard = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',
				easy = '4xx-yxx',
				coded_string;

			if (msos.config.debug) {
				// Make it easier to track
				this.debug_count += 1;
				coded_string = String(this.debug_count * 10) + '-' + easy;
			} else {
				coded_string = hard;
			}

			uuid = coded_string.replace(
				/[xy]/g,
				function (c) {
					var r = Math.random() * 16 | 0,
						v = c == 'x' ? r : r & 0x3 | 0x8;

					return v.toString(16);
				}
			);

			if (typeof(suffix) === "string"
			 || typeof(suffix) === "number") {
				uuid += ":" + suffix;
			}

			return String(uuid);
		},

		debugInput: function (elem) {
			// Force something out, if verbose mode (even if it isn't pretty).
			if (vbs) {
				msos_db(stph_con + ".debugInput\n<<<<", elem);
				msos_db("<<<<");
			}
			return;
		},

		debugOutput: function (data) {
			// Force something out, if verbose mode (even if it isn't pretty).
			if (vbs) {
				msos_db(stph_con + ".debugOutput\n>>>>\n" + data + '\n>>>>');
			}
			return;
		},

		mechanisms: {},

		_changeConnectStatus: function (status, condition) {
			var temp_cc = '_changeConnectStatus -> ',
				k = '',
				plugin,
				conn_stat = Strophe.status_name[status],
				debug = 'callback.',
				executed;

			if (vbs) {
				msos_db(stph_con + temp_cc + "start, status: " + conn_stat);
			}

			// Notify all plugins listening for status changes
			for (k in Strophe._connectionPlugins) {
				plugin = this[k];

				if (plugin.statusChanged) {
					executed = plugin.statusChanged(status, condition);
					if (vbs) {
						msos_db(stph_con + temp_cc + "plugin: " + k + ', initialized: ' + executed);
					}
				}
			}

			// Notify the user's callback
			if (typeof this.connect_callback === 'function') {
				this.connect_callback(status, condition);
				debug = 'w/ ' + debug;
			} else {
				debug = 'w/o ' + debug;
			}

			if (vbs) {
				msos_db(stph_con + temp_cc + " done, status: " + conn_stat + ', ' + (condition ? condition  + ', ' : '') + debug);
			}
		},

		authenticate: function (matched) {

			var temp_au = 'authenticate -> ',
				i = 0,
				j = 0,
				mechanism_found = false,
				request_auth_exchange,
				response,
				higher,
				swap;

			if (vbs) {
				msos_db(stph_con + temp_au + "start, matched length: " + matched.length);
			}

			for (i = 0; i < matched.length - 1; i += 1) {
				higher = i;
				for (j = i + 1; j < matched.length; j += 1) {
					if (matched[j].priority > matched[higher].priority) {
						higher = j;
					}
				}
				if (higher > j) {
					swap = matched[i];
					matched[i] = matched[higher];
					matched[higher] = swap;
				}
			}

			for (i = 0; i < matched.length; i += 1) {

				if (typeof matched[i].test === 'function' && matched[i].test(this)) {

					this._sasl_success_handler = this.addStropheHandler(
						_.bind(this._sasl_success_cb, this),
						Strophe.NS.SASL,
						"success"
					);
					this._sasl_success_handler.user = false;

					this._sasl_failure_handler = this.addStropheHandler(
						_.bind(this._sasl_failure_cb, this),
						Strophe.NS.SASL,
						"failure"
					);
					this._sasl_failure_handler.user = false;

					this._sasl_challenge_handler = this.addStropheHandler(
						_.bind(this._sasl_challenge_cb, this),
						Strophe.NS.SASL,
						"challenge"
					);
					this._sasl_challenge_handler.user = false;

					this._sasl_mechanism = new matched[i]();
					this._sasl_mechanism.onStart(this);

					request_auth_exchange = $build(
						"auth",
						{
							xmlns: Strophe.NS.SASL,
							mechanism: this._sasl_mechanism.name
						}
					);

					if (this._sasl_mechanism.isClientFirst) {
						response = this._sasl_mechanism.onChallenge(this, null);
						request_auth_exchange.t(Base64.encode(response));
					}

					this.send(request_auth_exchange.tree());

					mechanism_found = true;

					msos_db(stph_con + temp_au + "mechanism found: " + this._sasl_mechanism.name);
				}
			}

			if (!mechanism_found) {
				msos.console.error(stph_con + temp_au + "no authorization mechanisms found.");

				this._changeConnectStatus(Strophe.Status.CONNFAIL, 'strophe_no_auth_mechanism');
				this.server_disconnect('strophe_no_auth_mechanism');
			} else {
				this._changeConnectStatus(Strophe.Status.AUTHENTICATING, null);
			}

			if (vbs) {
				msos_db(stph_con + temp_au + "done!");
			}
		},

		sendIQ: function (elem, description, callback, errback, timeout) {
			var temp_sq = 'sendIQ -> ',
				timeoutHandler = null,
				that = this,
				id = '',
				expectedFrom,
				fulljid,
				handler;

			msos_db(stph_con + temp_sq + "start, description: '" + description + "'");

			if (typeof elem.tree === "function") {
				elem = elem.tree();
			}

			id = elem.getAttribute('id');

			// inject id if not found
			if (!id) {
				id = this.getUniqueId("sendIQ");
				elem.setAttribute("id", id);
			}

			expectedFrom = elem.getAttribute("to");
			fulljid = this.jid;

			handler = this.addStropheHandler(
				function (stanza) {
					// remove timeout handler if there is one
					if (timeoutHandler) {
						that.deleteTimedHandler(timeoutHandler);
					}

					var acceptable = false,
						from = stanza.getAttribute("from"),
						iqtype;

					if (from === expectedFrom ||
					   (expectedFrom === null &&
						   (from === Strophe.getBareJidFromJid(fulljid) ||
							from === Strophe.getDomainFromJid(fulljid) ||
							from === fulljid))) {
						acceptable = true;
					}

					if (!acceptable) {
						msos.console.error(stph_con + temp_sq + "failed, response jid: " + from + ", for jid: " + expectedFrom);
						this._changeConnectStatus(Strophe.Status.ERROR, 'strophe_invalid_id');
						return;
					}

					iqtype = stanza.getAttribute('type');

					if (iqtype === 'result') {
						if (vbs) {
							msos_db(stph_con + temp_sq + "success, id: " + id);
						}
						if (callback) {
							callback(stanza);
						}
					} else if (iqtype === 'error') {
						if (vbs) {
							msos_db(stph_con + temp_sq + "error, id: " + id);
						}
						if (errback) {
							errback(stanza);
						}
					} else {
						msos.console.error(stph_con + temp_sq + "failed, id: " + id + ', for bad IQ type: ' + iqtype);
					}
				},
				Strophe.NS.CLIENT,
				'iq',
				['error', 'result'],
				id
			);

			handler.describe = description;

			// if timeout specified, setup timeout handler.
			if (timeout) {
				timeoutHandler = this.addTimedHandler(
					timeout,
					function () {
						// get rid of normal handler
						that.deleteHandler(handler);
						// call errback on timeout with null stanza
						if (errback) {
							errback(null);
						}
						return false;
					}
				);
			}

			this.send(elem);

			msos_db(stph_con + temp_sq + "done, id: " + id);
			return id;
		},

		_sasl_challenge_cb: function (elem) {
			var challenge = Base64.decode(Strophe.getText(elem)),
				response = this._sasl_mechanism.onChallenge(this, challenge);

			this.send(
				$build(
					'response',
					{ xmlns: Strophe.NS.SASL }
				).t(Base64.encode(response)).tree()
			);

			return true;
		},

		_sasl_auth1_cb: function (elem) {
			var i = 0,
				child,
				resource,
				sasl_cb_handler;

			if (vbs) {
				msos_db(stph_con + "_sasl_auth1_cb -> start.");
			}

			for (i = 0; i < elem.childNodes.length; i += 1) {
				child = elem.childNodes[i];
				if (child.nodeName === 'bind') {
					this.do_bind = true;
				}

				if (child.nodeName === 'session') {
					this.do_session = true;
				}
			}

			if (!this.do_bind) {
				this._changeConnectStatus(Strophe.Status.AUTHFAIL, 'strophe_auth_failed');
				msos_db(stph_con + "_sasl_auth1_cb -> done, AUTHFAIL");
				return false;
			}

			sasl_cb_handler = this.addStropheHandler(
				_.bind(this._sasl_bind_cb, this),
				Strophe.NS.CLIENT,
				'iq',
				['error', 'result'],
				"_bind_auth_2"
			);
			sasl_cb_handler.user = false;

			resource = Strophe.getResourceFromJid(this.jid);
	
			if (resource) {
				this.send(
					$iq(
						{ type: "set", id: "_bind_auth_2" }
					).c(
						'bind',
						{ xmlns: Strophe.NS.BIND }
					).c('resource', {}).t(resource).tree());
			} else {
				this.send(
					$iq(
						{ type: "set", id: "_bind_auth_2" }
					).c('bind', { xmlns: Strophe.NS.BIND }).tree());
			}

			if (vbs) {
				msos_db(stph_con + "_sasl_auth1_cb -> done!");
			}
			return false;
		},

		_sasl_bind_cb: function (elem) {
			var bind,
				jidNode,
				jidText,
				sid,
				domain,
				resource,
				sasl_ses_cb_handler,
				conflict,
				condition = 'sasl_auth_bind_error';

			if (vbs) {
				msos_db(stph_con + "_sasl_bind_cb -> start.");
			}

			if (elem.getAttribute("type") === "error") {

				conflict = elem.getElementsByTagName("conflict");

				if (conflict.length > 0) {
					condition = 'sasl_auth_bind_conflict';
				}

				this._changeConnectStatus(Strophe.Status.AUTHFAIL, condition);

				if (vbs) {
					msos_db(stph_con + "_sasl_bind_cb -> done, SASL binding failed.");
				}
				return false;
			}

			bind = elem.getElementsByTagName("bind");

			if (bind.length > 0) {

				jidNode = bind[0].getElementsByTagName("jid");

				if (jidNode.length > 0) {

					jidText = Strophe.getText(jidNode[0]);

					sid = Strophe.getNodeFromJid(jidText);
					domain = Strophe.getDomainFromJid(jidText);
					resource = Strophe.getResourceFromJid(jidText);

					// If server doesn't recognize specific resource
					if (sid === resource) {
						this.jid = sid + '@' + domain + '/' + resource;
					} else {
						msos.console.warn(stph_con + "_sasl_bind_cb -> using jid w/o domain or resource: " + jidText);
						this.jid = jidText;
					}

					if (this.do_session) {
						sasl_ses_cb_handler = this.addStropheHandler(
							_.bind(this._sasl_session_cb, this),
							Strophe.NS.CLIENT,
							'iq',
							['error', 'result'],
							"_session_auth_2"
						);
						sasl_ses_cb_handler.user = false;

						this.send(
							$iq(
								{ type: "set", id: "_session_auth_2" }
							).c('session', { xmlns: Strophe.NS.SESSION }).tree()
						);
					} else {
						this.authenticated = true;
						this._changeConnectStatus(Strophe.Status.CONNECTED, null);
					}

					if (vbs) {
						msos_db(stph_con + "_sasl_bind_cb -> done, node count: " + jidNode.length);
					}
					return false;
				}
			}

			msos.console.warn(stph_con + "_sasl_bind_cb -> done, SASL binding failed.");
			return true;
		},

		_sasl_session_cb: function (elem) {

			if (vbs) {
				msos_db(stph_con + "_sasl_session_cb -> start.");
			}

			if (elem.getAttribute("type") === "result") {
				this.authenticated = true;
				this._changeConnectStatus(Strophe.Status.CONNECTED, null);
			} else if (elem.getAttribute("type") === "error") {
				msos.console.warn(stph_con + "_sasl_session_cb -> session creation failed.");
				this._changeConnectStatus(Strophe.Status.AUTHFAIL, 'sasl_session_failed');
				return true;
			}

			if (vbs) {
				msos_db(stph_con + "_sasl_session_cb -> done!");
			}
			return false;
		},

		_sasl_failure_cb: function (elem) {

			if (vbs) {
				msos_db(stph_con + "_sasl_failure_cb -> start.");
			}

			if (this._sasl_success_handler) {
				this.deleteHandler(this._sasl_success_handler);
				this._sasl_success_handler = null;
			}
			if (this._sasl_challenge_handler) {
				this.deleteHandler(this._sasl_challenge_handler);
				this._sasl_challenge_handler = null;
			}

			if (this._sasl_mechanism) {
				this._sasl_mechanism.onFailure();
			}

			this._changeConnectStatus(Strophe.Status.AUTHFAIL, 'sasl_server_failed');

			if (vbs) {
				msos_db(stph_con + "_sasl_failure_cb -> done!");
			}
			return false;
		},

		addTimedHandler: function (period, handler) {
			var thand = new Strophe.TimedHandler(period, handler);
			this.addTimeds.push(thand);
			return thand;
		},

		deleteTimedHandler: function (handRef) {
			this.removeTimeds.push(handRef);
		},

		deleteHandler: function (handRef) {
			this.removeHandlers.push(handRef);
		},

		addStropheHandler: function (handler, ns, name, type, id, from) {
			var hand = new Strophe.Handler(handler, ns, name, type, id, from);

			this.addHandlers.push(hand);
	
			if (vbs) {
				msos_db(stph_con + 'addStropheHandler -> called, added:\n    ' + hand.toString());
			}
			return hand;
		},

		_addSysTimedHandler: function (period, handler) {
			var thand = new Strophe.TimedHandler(period, handler);

			thand.user = false;
			this.addTimeds.push(thand);
			return thand;
		},

		_queueData: function (element) {
			if (element === null
			|| !element.tagName
			|| !element.childNodes) {
				msos.console.error(stph_con + '_queueData -> can not queue non-DOMElement.');
			} else {
				// OK, so cache it
				this._data.push(element);
			}

			if (vbs) {
				msos_db(stph_con + "_queueData -> called, queued requests: " + this._data.length);
			}
		},

		// -------------------------------
		// Start - BOSH specific functions
		// -------------------------------
		_sasl_success_cb: function (elem) {
			var serverSignature,
				success,
				attribMatch = /([a-z]+)=([^,]+)(,|$)/,
				matches = [],
				sf_handler_1,
				sf_handler_2,
				streamfeature_handlers = [],
				wrapper,
				restart,
				self = this;

			if (vbs) {
				msos_db(stph_con + "_sasl_success_cb -> start.");
			}

			if (this._sasl_data["server-signature"]) {

				success = Base64.decode(Strophe.getText(elem));

				matches = success.match(attribMatch);

				if (matches[1] === "v") {
					serverSignature = matches[2];
				}

				if (serverSignature !== this._sasl_data["server-signature"]) {
					// remove old handlers
					this.deleteHandler(this._sasl_failure_handler);
					this._sasl_failure_handler = null;

					if (this._sasl_challenge_handler) {
						this.deleteHandler(this._sasl_challenge_handler);
						this._sasl_challenge_handler = null;
					}

					this._sasl_data = {};

					msos_db(stph_con + "_sasl_success_cb -> done, failed!");
					return this._sasl_failure_cb(null);
				}
			}

			if (vbs) {
				msos_db(stph_con + "_sasl_success_cb -> SASL authentication succeeded.");
			}

			if (this._sasl_mechanism) {
				this._sasl_mechanism.onSuccess();
			}

			this.deleteHandler(this._sasl_failure_handler);

			this._sasl_failure_handler = null;

			if (this._sasl_challenge_handler) {
				this.deleteHandler(this._sasl_challenge_handler);
				this._sasl_challenge_handler = null;
			}

			wrapper = function (handlers, elem) {
				var bound_sasl_auth1_cb = _.bind(self._sasl_auth1_cb, self);

				while (handlers.length) {
					self.deleteHandler(handlers.pop());
				}

				bound_sasl_auth1_cb(elem);
				return false;
			};

			sf_handler_1 = this.addStropheHandler(
				function (elem) {
					wrapper(streamfeature_handlers, elem);
				},
				false,
				"stream:features"
			);
			sf_handler_1.user = false;

			streamfeature_handlers.push(sf_handler_1);

			sf_handler_2 = this.addStropheHandler(
				function (elem) {
					wrapper(streamfeature_handlers, elem);
				},
				Strophe.NS.STREAM,
				"features"
			);
			sf_handler_2.user = false;

			streamfeature_handlers.push(sf_handler_2);

			// We must send an xmpp:restart now (websocket use restart())
			restart = _.bind(this._onIdle, this);

			this._data.push("restart");

			clearTimeout(this._idleTimeout);

			this._throttledRequestHandler();

			this._idleTimeout = setTimeout(restart, Strophe.onIdle_delay);

			if (vbs) {
				msos_db(stph_con + "_sasl_success_cb -> done!");
			}
			return false;
		},

		_dataRecv: function (req) {
			var temp_dr = '_dataRecv -> ',
				stanza,
				rem_handle,
				add_handle,
				i = 0,
				hand,
				typ,
				cond,
				conflict,
				that = this;

			msos_db(stph_con + temp_dr + "start, add: " + this.addHandlers.length + ', remove: ' + this.removeHandlers.length + ' handlers.');

			try {
				stanza = req.getResponse();
			} catch (e) {
				msos.console.error(stph_con + temp_dr + "error:", e);

				this.server_disconnect("strophe_parsererror");
				return;
			}

			if (msos.var_is_empty(stanza)) {
				msos.console.warn(stph_con + temp_dr + "done, no stanza");
				return;
			}

			this.debugInput(stanza);

			// Handle graceful disconnect
			if (this.disconnecting
			 && this._requests.length === 0) {
				this.deleteTimedHandler(this._disconnectTimeout);
				this._disconnectTimeout = null;
				this.client_disconnect();
				msos_db(stph_con + temp_dr + "done, graceful disconnect.");
				return;
			}

			while (this.removeHandlers.length > 0) {
				hand = this.removeHandlers.pop();
				i = _.indexOf(this.handlers, hand);
				if (i >= 0) {
					rem_handle = this.handlers.splice(i, 1);
					if (vbs) {
						msos_db(stph_con + temp_dr + 'removed:\n    ' + rem_handle.toString());
					}
				}
			}

			while (this.addHandlers.length > 0) {
				add_handle = this.addHandlers.pop();
				this.handlers.push(add_handle);
				if (vbs) {
					msos_db(stph_con + temp_dr + 'added:\n    ' + add_handle.toString());
				}
			}

			typ = stanza.getAttribute("type");

			if (typ !== null
			 && typ === "terminate") {

				if (this.disconnecting) {
					msos_db(stph_con + temp_dr + "done, too late to process.");
					return;
				}

				// an error occurred
				cond = stanza.getAttribute("condition");
				conflict = stanza.getElementsByTagName("conflict");

				if (cond !== null) {
					if (cond === "remote-stream-error" && conflict.length > 0) {
						cond = "strophe_stream_conflict";
					}
				} else {
					cond = 'strophe_connection_failure';
				}

				this._changeConnectStatus(Strophe.Status.CONNFAIL, cond);

				msos.console.warn(stph_con + temp_dr + "done, w/ problems: " + cond);

				this.server_disconnect(cond);
				return;
			}

			jQuery(stanza).children().each(
				function (j, child) {
					var i = 0,
						hand;

					for (i = 0; i < that.handlers.length; i += 1) {

						hand = that.handlers[i];

						if (hand.isMatch(child) && (that.authenticated || !hand.user)) {

							msos_db(stph_con + temp_dr + 'processing handler:\n    ' + hand.toString());

							if (!hand.run(child)) {
								that.removeHandlers.push(hand);		// Remove on next _dataRecv
							}
						}
					}
				}
			);

			msos_db(stph_con + temp_dr + "done, for handler count: " + this.handlers.length);

			if (vbs === 'strophe') {
				jQuery.each(this.handlers, function (i, hand) {msos_db(' ' + i + '. ' + hand.toString()); });
			}
		},

		client_disconnect: function (condition) {
			var temp_dd = 'client_disconnect -> ';

			msos_db(stph_con + temp_dd + "start.");

			if (typeof this._idleTimeout === "number") {
				clearTimeout(this._idleTimeout);
			}

			// Cancel Disconnect Timeout
			if (this._disconnectTimeout !== null) {
				this.deleteTimedHandler(this._disconnectTimeout);
				this._disconnectTimeout = null;
			}

			// Really only for BOSH
			window.sessionStorage.removeItem('strophe-bosh-session');

			// Tell the parent we disconnected
			this._changeConnectStatus(Strophe.Status.DISCONNECTED, condition);
			this.connected = false;

			// Cancel requests by aborting requests
			this._abortAllRequests();

			msos_db(stph_con + temp_dd + "done!");

			// Create a new (base) connection which can be used, or destroys previous one.
			return new Strophe.Connection(this.service, this.options);
		},

		_connect_cb: function (req) {
			var temp_cb = '_connect_cb -> ',
				hasFeatures,
				cb_mechanisms,
				matched = [],
				i = 0,
				mech,
				found_authentication = false,
				response,
				typ,
				cond,
				conflict,
				wind,
				hold,
				wait,
				auth_str,
				body;

			msos_db(stph_con + temp_cb + "start.");

			// Set response element
			try {
				response = req.getResponse();
			} catch (e) {
				msos.console.error(stph_con + temp_cb + "error:", e);
				this.server_disconnect("strophe_parsererror");
				return;
			}

			if (!response) {
				msos_db(stph_con + temp_cb + "done, no response.");
				return;
			}

			this.connected = true;

			this.debugInput(response);

			// Check for connection errors
			typ = response.getAttribute("type");

			if (typ !== null
			 && typ === "terminate") {
				// an error occurred
				cond = response.getAttribute("condition");
				conflict = response.getElementsByTagName("conflict");
				if (cond !== null) {
					if (cond === "remote-stream-error" && conflict.length > 0) {
						cond = "strophe_stream_conflict";
					}
				} else {
					cond = 'strophe_connection_failure';
				}

				this._changeConnectStatus(Strophe.Status.CONNFAIL, cond);

				this.client_disconnect(cond);

				msos_db(stph_con + temp_cb + "done, processing failed for: " + cond);
				return;
			}

			if (!this.sid) {
				this.sid = response.getAttribute("sid");
			}

			wind = response.getAttribute('requests');
			if (wind) { this.window = parseInt(wind, 10); }

			hold = response.getAttribute('hold');
			if (hold) { this.hold = parseInt(hold, 10); }

			wait = response.getAttribute('wait');
			if (wait) { this.wait = parseInt(wait, 10); }

			// Setup authentication checking
			this._authentication.sasl_scram_sha1 = false;
			this._authentication.sasl_plain = false;
			this._authentication.sasl_digest_md5 = false;
			this._authentication.sasl_anonymous = false;

			this._authentication.legacy_auth = false;

			// Check for the stream:features tag
			hasFeatures = response.getElementsByTagNameNS(Strophe.NS.STREAM, "stream:features").length > 0
					   || response.getElementsByTagNameNS(Strophe.NS.STREAM, "features").length > 0;

			if (!hasFeatures) {

				msos_db(stph_con + temp_cb + "failed, no stream features found!");

				this._no_auth_received();

				msos_db(stph_con + temp_cb + "done!");
				return;
			}

			cb_mechanisms = response.getElementsByTagName("mechanism");

			if (cb_mechanisms.length > 0) {
				for (i = 0; i < cb_mechanisms.length; i += 1) {
					mech = Strophe.getText(cb_mechanisms[i]);
					if (this.mechanisms[mech]) { matched.push(this.mechanisms[mech]); }
				}
			}

			this._authentication.legacy_auth = response.getElementsByTagName("auth").length > 0;

			found_authentication = this._authentication.legacy_auth || matched.length > 0;

			if (!found_authentication) {
				this._no_auth_received();

				msos_db(stph_con + temp_cb + "done, no authentication mechanisms found!");
				return;
			}

			if (this.do_authentication !== false) { this.authenticate(matched); }

			msos_db(stph_con + temp_cb + "done!");
		},

		connect: function (jid, pass, callback, wait, hold, route, authcid) {

			msos_db(stph_con + "connect -> start, jid: " + jid);

			this.jid = jid;
			this.authzid = Strophe.getBareJidFromJid(this.jid);
			this.authcid = authcid || Strophe.getNodeFromJid(this.jid);
			this.pass = pass;
			this.servtype = "xmpp";
			this.connect_callback = callback;
			this.disconnecting = false;
			this.connected = false;
			this.authenticated = false;
			this.restored = false;
			this.errors = 0;

			// Parse jid for domain and resource
			this.domain = Strophe.getDomainFromJid(this.jid);
			this.resource = Strophe.getResourceFromJid(this.jid);

			this._changeConnectStatus(Strophe.Status.CONNECTING, null);

			this.wait = wait || this.wait;
			this.hold = hold || this.hold;

			var body = this._buildBody().attrs(
					{
						to: this.domain,
						"xml:lang": "en",
						wait: this.wait,
						hold: this.hold,
						content: "text/xml; charset=utf-8",
						ver: "1.6",
						"xmpp:version": "1.0",
						"xmlns:xmpp": Strophe.NS.BOSH
					}
				);

			if (route) {
				body.attrs({
					route: route
				});
			}

			this._requests.push(
				new Strophe.Request(
					body.tree(),
					_.bind(this._onRequestStateChange, this, _.bind(this._connect_cb, this)),
					body.tree().getAttribute("rid")
				)
			);

			this._throttledRequestHandler();

			msos_db(stph_con + "connect -> done, jid: " + jid);
		},

		server_disconnect: function (reason) {
			var temp_d = 'server_disconnect -> ',
				pres = false;

			msos_db(stph_con + temp_d + "start, reason: " + reason);

			// Must reset these, so the next ping doesn't send now "diconnected" ones
			this.sid = null;	// This is important!
			this.rid = Math.floor(Math.random() * 4294967295); // This might be too.

			this._changeConnectStatus(Strophe.Status.DISCONNECTING, reason);

			if (this.connected) {

				this.disconnecting = true;

				if (this.authenticated) {
					pres = $pres({
						xmlns: Strophe.NS.CLIENT,
						type: 'unavailable'
					});
				}

				// setup timeout handler
				this._disconnectTimeout = this._addSysTimedHandler(
					3000,
					_.bind(this.client_disconnect, this)
				);

				this._sendTerminate(pres);

			} else {
				msos.console.warn(stph_con + temp_d + 'Strophe not connected yet.');

				this._abortAllRequests();
			}

			msos_db(stph_con + temp_d + "done!");
		},

		send: function (elem) {
			var i = 0;

			msos_db(stph_con + "send -> start.");

			if (msos.var_is_null(elem)) {
				msos.console.error(stph_con + "send -> done, missing input!");
				return;
			}

			if (typeof elem.sort === "function") {
				for (i = 0; i < elem.length; i += 1) {
					this._queueData(elem[i]);
				}
			} else if (typeof elem.tree === "function") {
				this._queueData(elem.tree());
			} else {
				this._queueData(elem);
			}

			clearTimeout(this._idleTimeout);

			this._throttledRequestHandler();

			this._idleTimeout = setTimeout(_.bind(this._onIdle, this), Strophe.onIdle_delay);

			msos_db(stph_con + "send -> done!");
		},

		_onIdle: function () {
			var temp_oi = '_onIdle -> ',
				i = 0,
				thand,
				since,
				data = this._data,
				newList = [],
				now = new Date().getTime(),
				body,
				time_elapsed,
				primary_to,
				secondary_to;

			while (this.addTimeds.length > 0) {
				this.timedHandlers.push(this.addTimeds.pop());
			}

			while (this.removeTimeds.length > 0) {
				thand = this.removeTimeds.pop();
				i = _.indexOf(this.timedHandlers, thand);
				if (i >= 0) {
					this.timedHandlers.splice(i, 1);
				}
			}

			for (i = 0; i < this.timedHandlers.length; i += 1) {
				thand = this.timedHandlers[i];
				if (this.authenticated || !thand.user) {
					since = thand.lastCalled + thand.period;
					if (since - now <= 0) {
						if (thand.run()) {
							newList.push(thand);
						}
					} else {
						newList.push(thand);
					}
				}
			}

			this.timedHandlers = newList;

			clearTimeout(this._idleTimeout);

			// Connection specific code
			if (this.authenticated
			 && this._requests.length === 0
			 && data.length === 0
			 && !this.disconnecting) {
				msos_db(stph_con + temp_oi + "no requests, sending blank.");
				data.push(null);
			}

			if (this.paused) {
				msos_db(stph_con + temp_oi + "paused.");
				return;
			}

			if (this._requests.length < 2 && data.length > 0) {

				msos_db(stph_con + temp_oi + "do BOSH restart.");

				body = this._buildBody();

				for (i = 0; i < data.length; i += 1) {
					if (data[i] !== null) {
						if (data[i] === "restart") {
							body.attrs({
								to: this.domain,
								"xml:lang": "en",
								"xmpp:restart": "true",
								"xmlns:xmpp": Strophe.NS.BOSH
							});
						} else {
							body.cnode(data[i]).up();
						}
					}
				}

				delete this._data;
				this._data = [];

				this._requests.push(
					new Strophe.Request(
						body.tree(),
						_.bind(this._onRequestStateChange, this, _.bind(this._dataRecv, this)),
                        body.tree().getAttribute("rid")
					)
				);

				this._throttledRequestHandler();
			}

			if (this._requests.length > 0) {

				time_elapsed = this._requests[0].age();

				if (this._requests[0].dead !== null) {

					secondary_to = Math.floor(Strophe.SECONDARY_TIMEOUT * this.wait);

					if (this._requests[0].timeDead() > secondary_to) {
						msos.console.warn(stph_con + temp_oi + "Request " + this._requests[0].id + " died, from inactivity for over " + secondary_to + " seconds.");
						this._throttledRequestHandler();
					}
				}

				primary_to = Math.floor(Strophe.TIMEOUT * this.wait);

				if (time_elapsed > primary_to) {
					msos.console.warn(stph_con + temp_oi + "Request " + this._requests[0].id + " timed out, from inactivity for over " + primary_to + " seconds.");
					this._throttledRequestHandler();
				}
			}

			// Reactivate the timer only if connected
			if (this.connected) {
				this._idleTimeout = setTimeout(_.bind(this._onIdle, this), Strophe.onIdle_delay);
			}
		},

		_sendTerminate: function (pres) {
			var temp_st = '_sendTerminate -> ',
				body = this._buildBody().attrs({ type: "terminate" }),
				req;

			msos_db(stph_con + temp_st + "start.");

			if (pres) {
				body.cnode(pres.tree());
			}

			req = new Strophe.Request(
				body.tree(),
				_.bind(this._onRequestStateChange, this, _.bind(this._dataRecv, this)),
				body.tree().getAttribute("rid")
			);

			this._requests.push(req);
			this._throttledRequestHandler();

			msos_db(stph_con + temp_st + "done!");
		},

		attach: function (jid, sid, rid, callback, wait, hold, wind) {

			msos_db(stph_con + "attach -> start, jid: " + jid + ', sid: ' + sid + ', rid: ' + rid);

			this.jid = jid;
			this.sid = sid;
			this.rid = rid;

			this.connect_callback = callback;

			this.domain = Strophe.getDomainFromJid(this.jid);

			this.authenticated = true;
			this.connected = true;

			this.wait = wait || this.wait;
			this.hold = hold || this.hold;
			this.window = wind || this.window;

			this._changeConnectStatus(Strophe.Status.ATTACHED, null);

			msos_db(stph_con + "attach -> done!");
		},

		_buildBody: function () {
			this.rid += 1;

			var bodyWrap = $build(
					'body',
					{
						rid: this.rid,
						xmlns: Strophe.NS.HTTPBIND
					}
				);

			if (this.sid !== null) {
				bodyWrap.attrs({ sid: this.sid });
			}

			if (this.options.keepalive) {
				this._cacheSession();
			}

			return bodyWrap;
		},

		_no_auth_received: function () {
			var temp_na = '_no_auth_received -> ',
				body,
				_callback = _.bind(this._connect_cb, this);

			msos_db(stph_con + temp_na + "start.");

			body = this._buildBody();

			this._requests.push(
				new Strophe.Request(
					body.tree(),
					_.bind(this._onRequestStateChange, this, _.bind(_callback, this)),
					body.tree().getAttribute("rid")
				)
			);

			this._throttledRequestHandler();

			msos_db(stph_con + temp_na + "done!");
		},

		restore: function (jid, callback, wait, hold, wind) {
			var session;

			if (Modernizr.sessionstorage) {

				session = JSON.parse(window.sessionStorage.getItem('strophe-bosh-session'));

				if (session !== undefined &&
					session !== null &&
					session.rid &&
					session.sid &&
					session.jid &&
					(jid === undefined || Strophe.getBareJidFromJid(session.jid) === Strophe.getBareJidFromJid(jid))) {

					this.restored = true;
					this.attach(session.jid, session.sid, session.rid, callback, wait, hold, wind);

				} else {
					msos.console.error(stph_con + 'restore -> failed, no restoreable session.');
					this._changeConnectStatus(Strophe.Status.ERROR, 'strophe_no_prev_session');
				}
			}
		},

		_cacheSession: function () {
			if (this.authenticated) {
				if (this.jid && this.rid && this.sid) {
					window.sessionStorage.setItem(
						'strophe-bosh-session',
						JSON.stringify({
							'jid': this.jid,
							'rid': this.rid,
							'sid': this.sid
						})
					);
				}
			} else {
				window.sessionStorage.removeItem('strophe-bosh-session');
			}
		},

		_abortAllRequests: function _abortAllRequests() {
			var req;

			while (this._requests.length > 0) {
				req = this._requests.pop();
				req.abort = true;
				req.xhr.abort();
				req.xhr.onreadystatechange = function () {};
			}
		},

		_removeRequest: function (req) {
			var i;

			if (vbs) {
				msos_db(stph_con + "_removeRequest -> start.");
			}

			for (i = this._requests.length - 1; i >= 0; i -= 1) {
				if (req === this._requests[i]) {
					this._requests.splice(i, 1);
				}
			}

			req.xhr.onreadystatechange = function () {};

			this._throttledRequestHandler();

			if (vbs) {
				msos_db(stph_con + "_removeRequest -> done!");
			}
		},

		_restartRequest: function (i) {
			var req = this._requests[i];
			if (req.dead === null) {
				req.dead = new Date();
			}

			this._processRequest(i);
		},

		_processRequest: function (i) {
			var tmp_r = '_processRequest -> ',
				self = this,
				req = this._requests[i],
				reqStatus = -1;

			if (vbs) {
				msos_db(stph_con + tmp_r + "start.");
			}

			try {
				if (req.xhr.readyState === 4) {
					reqStatus = req.xhr.status;
				}
			} catch (e) {
				msos.console.warn(stph_con + tmp_r + 'request: ' + i + ', status: ' + reqStatus + ', error:', e);
			}

			if (reqStatus === undefined) {
				reqStatus = -1;
			}

			if (vbs) {
				msos_db(stph_con + tmp_r + "checked status: " + reqStatus);
			}

			// make sure we limit the number of retries
			if (req.sends > this.maxRetries) {
				this.client_disconnect();
				msos.console.warn(stph_con + tmp_r + "timed out after " + i + " tries, status: " + reqStatus);
				return;
			}

			var time_elapsed = req.age(),
				primaryTimeout = (!isNaN(time_elapsed) && time_elapsed > Math.floor(Strophe.TIMEOUT * this.wait)),
				secondaryTimeout = (req.dead !== null && req.timeDead() > Math.floor(Strophe.SECONDARY_TIMEOUT * this.wait)),
				requestCompletedWithServerError = (req.xhr.readyState === 4 && (reqStatus < 1 || reqStatus >= 500)),
				sendFunc,
				backoff;

			if (primaryTimeout
			 || secondaryTimeout
			 || requestCompletedWithServerError) {
				if (secondaryTimeout) {
					msos.console.error(stph_con + tmp_r + "request " + this._requests[i].id + " timed out (secondary), restarting");
				}
				req.abort = true;
				req.xhr.abort();

				req.xhr.onreadystatechange = function () {};

				this._requests[i] = new Strophe.Request(
					req.xmlData,
					req.origFunc,
					req.rid,
					req.sends
				);

				req = this._requests[i];
			}

			if (req.xhr.readyState === 0) {
				msos_db(stph_con + tmp_r + "posting, id: " + req.id);

				try {
					req.xhr.open("POST", this.service, this.options.sync ? false : true);
					req.xhr.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
				} catch (e2) {
					msos.console.error(stph_con + tmp_r + "XHR open failed:", e2);
					if (!this.connected) {
						this._changeConnectStatus(Strophe.Status.CONNFAIL, "strophe_xhr_bad_service");
					}
					this.server_disconnect('strophe_xhr_bad_service');
					return;
				}

				sendFunc = function () {
					var headers,
						header;
					req.date = new Date();

					if (self.options.customHeaders) {
						headers = self.options.customHeaders;

						for (header in headers) {
							if (headers.hasOwnProperty(header)) {
								req.xhr.setRequestHeader(header, headers[header]);
							}
						}
					}

					req.xhr.send(req.data);
				};

				if (req.sends > 1) {
					// Using a cube of the retry number creates a nicely expanding retry window
					backoff = Math.min(Math.floor(Strophe.TIMEOUT * this.wait), Math.pow(req.sends, 3)) * 1000;
					setTimeout(sendFunc, backoff);
				} else {
					sendFunc();
				}

				req.sends += 1;

				this.debugOutput(req.data);

			} else {
				if (vbs) {
					msos_db(stph_con + tmp_r + (i === 0 ? "first" : "second") + " request with readyState: " + req.xhr.readyState);
				}
			}

			if (vbs) {
				msos_db(stph_con + tmp_r + "done!");
			}
		},

		_throttledRequestHandler: function () {

			var trh = '_throttledRequestHandler -> ',
				trh_cnt = 0;

			if (vbs) {
				msos_db(stph_con + trh + "start, queued request(s): " + this._requests.length);
			}

			if (this._requests.length > 0) {

				this._processRequest(0);
				trh_cnt += 1;

				if (this._requests.length > 1
				 && Math.abs(this._requests[0].rid - this._requests[1].rid) < this.window) {
					this._processRequest(1);
					trh_cnt += 1;
				}
			}

			if (vbs) {
				msos_db(stph_con + trh + "done, for " + trh_cnt + ' request(s).');
			}
		},

		_onRequestStateChange: function (func, req) {
			// request complete
			var ors = '_onRequestStateChange -> ',
				reqStatus = 0,
				reqIs0,
				reqIs1;

			if (vbs) {
				msos_db(stph_con + ors + "start, id: " + req.id + ", attempts: " + req.sends + " readyState: " + req.xhr.readyState);
			}

			if (req.abort) {
				msos.console.warn(stph_con + ors + "request aborted, id: " + req.id);
				req.abort = false;
				return;
			}

			if (req.xhr.readyState === 4) {
				reqStatus = 0;

				try {
					reqStatus = req.xhr.status;
				} catch (e) {
					msos.console.warn(stph_con + ors + "polling request status failed:", e);
				}

				if (reqStatus === undefined) {
					reqStatus = 0;
				}

				if (this.disconnecting) {
					if (reqStatus >= 400) {
						this._hitError(reqStatus);
						msos.console.warn(stph_con + ors + "disconnecting with errors!");
						return;
					}
				}

				reqIs0 = (this._requests[0] === req);
				reqIs1 = (this._requests[1] === req);

				if ((reqStatus > 0 && reqStatus < 500) || req.sends > 5) {
					this._removeRequest(req);
					msos_db(stph_con + ors + "id " + req.id + " removed for status: " + reqStatus);
				}

				if (reqStatus === 200) {

					if (reqIs1 || (reqIs0 && this._requests.length > 0 && this._requests[0].age() > Math.floor(Strophe.SECONDARY_TIMEOUT * this.wait))) {
						this._restartRequest(0);
					}
					msos_db(stph_con + ors + "success, id: " + req.id + ", attempts: " + req.sends + ', status: ' + reqStatus);

					func(req);
					this.errors = 0;

				} else {

					msos.console.warn(stph_con + ors + "id " + req.id + ", attempt: " + req.sends + " has error(s), status: " + reqStatus);

					if (reqStatus === 0 || (reqStatus >= 400 && reqStatus < 600) || reqStatus >= 12000) {
						this._hitError(reqStatus);
						if (reqStatus >= 400
						 && reqStatus < 500) {
							this._changeConnectStatus(Strophe.Status.DISCONNECTING, 'strophe_request_failure');
							this.client_disconnect('strophe_request_failure');
						}
					}
				}

				if (!((reqStatus > 0 && reqStatus < 500) || req.sends > 5)) {
					msos.console.warn(stph_con + ors + "id " + req.id + ", attempt: " + req.sends + ", throttling requests for status: " + reqStatus);
					this._throttledRequestHandler();
				}
			}

			if (vbs) {
				msos_db(stph_con + ors + "done!");
			}
		},

		_hitError: function (reqStatus) {
			this.errors += 1;
			msos.console.warn(stph_con + "_hitError -> request errored, status: " + reqStatus + ", number of errors: " + this.errors);
			if (this.errors > 4) {
				this.client_disconnect();
			}
		}
	};

	Strophe.Request = function (elem, func, rid, sends) {

		Strophe._requestId += 1;

		this.id = Strophe._requestId;
		this.xmlData = elem;
		this.data = Strophe.serialize(elem);
		this.origFunc = func;
		this.func = func;
		this.rid = rid;
		this.date = NaN;
		this.sends = sends || 0;
		this.abort = false;
		this.dead = null;
		this.age = function () {
			if (!this.date) { return 0; }
			var now = new Date();
			return (now - this.date) / 1000;
		};
		this.timeDead = function () {
			if (!this.dead) { return 0; }
			var now = new Date();
			return (now - this.dead) / 1000;
		};
		this.xhr = this._newXHR();
	};

	Strophe.Request.prototype = {

		getResponse: function () {
			var node = null,
				gr = 'getResponse -> ',
				dbg = 'no response.';

			if (vbs) {
				msos_db(stph_rqt + gr + "start.");
			}

			if (this.xhr.responseXML
			 && this.xhr.responseXML.documentElement) {
				node = this.xhr.responseXML.documentElement;
				dbg = 'via responseXML.';
			} else if (this.xhr.responseText) {
				node = Strophe.xmlHtmlNode(this.xhr.responseText);
				dbg = 'via responseText.';
			}

			if (node && node.tagName === "parsererror") {
				msos.console.error(stph_rqt + gr + "parse error: " + this.xhr.responseText);
				return null;
			}

			if (vbs) {
				msos_db(stph_rqt + gr + "done, " + dbg);
			}
			return node;
		},

		_newXHR: function () {
			var xhr = null;

			if (window.XMLHttpRequest) {
				xhr = new XMLHttpRequest();
				if (xhr.overrideMimeType) {
					xhr.overrideMimeType("text/xml; charset=utf-8");
				}
			} else if (window.ActiveXObject) {
				xhr = new ActiveXObject("Microsoft.XMLHTTP");
			}

			// use Function.bind() to prepend ourselves as an argument
			xhr.onreadystatechange = _.bind(this.func, null, this);

			return xhr;
		}
	};

	Strophe.SASLMechanism = function (name, isClientFirst, priority) {

		this.name = name;
		this.isClientFirst = isClientFirst;
		this.priority = priority;

		this._sasl_mech_data = {};

		this.test = function (connection) {
			return true;
		};

		this.onStart = function (connection) {
			this._connection = connection;
		};

		this.onChallenge = function (connection, challenge) {
			throw new Error("You should implement challenge handling!");
		};

		this.onFailure = function () {
			this._connection = null;
		};

		this.onSuccess = function () {
			this._connection = null;
		};

		this._quote = function (str) {
			if (msos.var_is_empty(str)) {
				msos.console.warn('Strophe.SASLMechanism._quote -> missing input!');
				return '';
			}
			return '"' + str.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
		};

		return this;
	};


	Strophe.SASLAnonymous = function () {};

	Strophe.SASLAnonymous.prototype = new Strophe.SASLMechanism("ANONYMOUS", false, 10);

	Strophe.SASLAnonymous.test = function (connection) {
		return connection.authcid === null;
	};



	Strophe.SASLPlain = function () {};

	Strophe.SASLPlain.prototype = new Strophe.SASLMechanism("PLAIN", true, 20);

	Strophe.SASLPlain.test = function (connection) {
		return connection.authcid !== null;
	};

	Strophe.SASLPlain.prototype.onChallenge = function (connection, challenge) {
		var auth_str = connection.authzid;

		auth_str = auth_str + "\u0000";
		auth_str = auth_str + connection.authcid;
		auth_str = auth_str + "\u0000";
		auth_str = auth_str + connection.pass;
		return auth_str;
	};



	Strophe.SASLSHA1 = function () {};

	Strophe.SASLSHA1.prototype = new Strophe.SASLMechanism("SCRAM-SHA-1", true, 20);

	Strophe.SASLSHA1.test = function (connection) {
		return connection.authcid !== null;
	};

	Strophe.SASLSHA1.prototype.onChallenge = function (connection, challenge, test_cnonce) {
		var cnonce = test_cnonce || SparkMD5.hash(Math.random() * 1234567890),
			auth_str = "n=" + connection.authcid + ",r=" + cnonce;

		if (vbs) {
			msos_db('Strophe.SASLSHA1.onChallenge -> called.');
		}

		this._sasl_mech_data.cnonce = cnonce;
		this._sasl_mech_data["client-first-message-bare"] = auth_str;

		auth_str = "n,," + auth_str;

		this.onChallenge = function (connection, challenge) {
			var matches = [],
				nonce,
				salt,
				iter,
				Hi,
				U,
				U_old,
				clientKey,
				serverKey,
				clientSignature,
				responseText = "c=biws,",
				authMessage = this._sasl_mech_data["client-first-message-bare"] + "," + challenge + ",",
				cnonce = this._sasl_mech_data.cnonce,
				attribMatch = /([a-z]+)=([^,]+)(,|$)/,
				i = 0,
				k = 0;

			while (challenge.match(attribMatch)) {
				matches = challenge.match(attribMatch);
				challenge = challenge.replace(matches[0], "");
				switch (matches[1]) {
					case "r":
						nonce = matches[2];
						break;
					case "s":
						salt = matches[2];
						break;
					case "i":
						iter = matches[2];
						break;
				}
			}

			if (!(nonce.substr(0, cnonce.length) === cnonce)) {
				this._sasl_mech_data = {};
				return connection._sasl_failure_cb();
			}

			responseText += "r=" + nonce;
			authMessage += responseText;

			salt = Base64.decode(salt);
			salt += "\u0001";

			Hi = U_old = core_hmac_sha1(connection.pass, salt);
			for (i = 1; i < iter; i += 1) {
				U = core_hmac_sha1(connection.pass, binb2str(U_old));
				for (k = 0; k < 5; k += 1) {
					Hi[k] ^= U[k];
				}
				U_old = U;
			}

			Hi = binb2str(Hi);

			clientKey = core_hmac_sha1(Hi, "Client Key");
			serverKey = str_hmac_sha1(Hi, "Server Key");
			clientSignature = core_hmac_sha1(str_sha1(binb2str(clientKey)), authMessage);
			connection._sasl_data["server-signature"] = b64_hmac_sha1(serverKey, authMessage);

			for (k = 0; k < 5; k += 1) {
				clientKey[k] ^= clientSignature[k];
			}

			responseText += ",p=" + Base64.encode(binb2str(clientKey));

			return responseText;
		};

		_.bind(this.onChallenge, this);

		return auth_str;
	};

	Strophe.SASLMD5 = function () {};

	Strophe.SASLMD5.prototype = new Strophe.SASLMechanism("DIGEST-MD5", false, 20);

	Strophe.SASLMD5.test = function (connection) {
		return connection.authcid !== null;
	};

	Strophe.SASLMD5.prototype.onChallenge = function (connection, challenge, test_cnonce) {
		var attribMatch = /([a-z]+)=("[^"]+"|[^,"]+)(?:,|$)/,
			cnonce = test_cnonce || SparkMD5.hash(String(Math.random() * 1234567890)),
			realm = "",
			host = null,
			nonce = "",
			qop = "",
			matches,
			digest_uri,
			A1,
			A2,
			responseText = '';

		if (vbs) {
			msos_db('Strophe.SASLMD5.onChallenge -> called.');
		}

		while (challenge.match(attribMatch)) {
			matches = challenge.match(attribMatch);
			challenge = challenge.replace(matches[0], "");
			matches[2] = matches[2].replace(/^"(.+)"$/, "$1");

			switch (matches[1]) {
				case "realm":
					realm = matches[2];
					break;
				case "nonce":
					nonce = matches[2];
					break;
				case "qop":
					qop = matches[2];
					break;
				case "host":
					host = matches[2];
					break;
			}
		}

		digest_uri = connection.servtype + "/" + connection.domain;

		if (host !== null) {
			digest_uri = digest_uri + "/" + host;
		}

		A1 = SparkMD5.hash(connection.authcid + ":" + realm + ":" + this._connection.pass) + ":" + nonce + ":" + cnonce;
		A2 = 'AUTHENTICATE:' + digest_uri;

		responseText += 'charset=utf-8,';
		responseText += 'username='	+ this._quote(connection.authcid) + ',';
		responseText += 'realm='	+ this._quote(realm) + ',';
		responseText += 'nonce='	+ this._quote(nonce) + ',';
		responseText += 'nc=00000001,';
		responseText += 'cnonce='	+ this._quote(cnonce) + ',';
		responseText += 'digest-uri=' + this._quote(digest_uri) + ',';
		responseText += 'response=' + SparkMD5.hash(SparkMD5.hash(A1) + ":" + nonce + ":00000001:" + cnonce + ":auth:" + SparkMD5.hash(A2)) + ",";
		responseText += 'qop=auth';

		this.onChallenge = _.bind(function (connection, challenge) { return ""; }, this);

		return responseText;
	};

	callback(Strophe, $build, $msg, $iq, $pres);

}(function () {
	"use strict";

	var args = Array.prototype.slice.call(arguments);

    window.Strophe = args[0];
    window.$build = args[1];
    window.$msg = args[2];
    window.$iq = args[3];
    window.$pres = args[4];
}));


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
