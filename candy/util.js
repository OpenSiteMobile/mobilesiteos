/** File: util.js
 * Candy - Chats are not dead yet.
 *
 * Authors:
 *   - Patrick Stadler <patrick.stadler@gmail.com>
 *   - Michael Weibel <michael.weibel@gmail.com>
 *
 * Copyright:
 *   (c) 2011 Amiado Group AG. All rights reserved.
 */

/*global
    msos: false,
    jQuery: false,
    candy: false,
    Strophe: false,
    SparkMD5: false,
    _: false,
    jQuery: false
*/

msos.provide("candy.util");
msos.require("msos.intl");


candy.util.version = new msos.set_version(15, 10, 22);

candy.util.jid_cache = [];

(function () {
	"use strict";

	var temp_cu = 'candy.util',
		vbs = msos.config.verbose;

	candy.util.jidToId = function (jid) {
		var md5_jid = SparkMD5.hash(jid);

		if (vbs) {
			msos.console.debug(temp_cu + '.jidToId -> called, jid: ' + jid + ', MD5: ' + md5_jid);
		}
		return md5_jid;
	};

	candy.util.getEscapedJid = function (in_jid) {
		var out_jid = '';

		// Try a quick lookup first...
		if (_.indexOf(candy.util.jid_cache, in_jid) >= 0) {
			out_jid = in_jid;
		} else {
			out_jid = candy.util.escapeJid(in_jid);
		}

		return out_jid;
	};

	candy.util.getUnescapedJid = function (in_jid) {
		var out_jid = '';

		// Try a quick lookup first...
		if (_.indexOf(candy.util.jid_cache, in_jid) >= 0) {
			out_jid = in_jid;
		} else {
			out_jid = candy.util.unescapeJid(in_jid);
		}

		return out_jid;
	};

	candy.util.escapeJid = function (jid) {

		msos.console.debug(temp_cu + '.escapeJid -> start, jid  in: ' + jid);

		var raw_node = Strophe.getNodeFromJid(jid),
			node = Strophe.escapeNode(raw_node),
			domain = Strophe.getDomainFromJid(jid),
			resource = Strophe.getResourceFromJid(jid),
			out_jid = '',
			db_note = '';

		out_jid = node + '@' + domain;

		if (resource) {
			out_jid += '/' + resource;
		}

		// For jid values without escaped/unescaped characters, add to cache
		if (jid === out_jid) {
			db_note = ', saved to jid cache';
			candy.util.jid_cache.push(out_jid);
		}

		msos.console.debug(temp_cu + '.escapeJid ->  done, jid out: ' + out_jid + db_note);

		return out_jid;
	};

	candy.util.unescapeJid = function (jid) {

		msos.console.debug(temp_cu + '.unescapeJid -> start, jid  in: ' + jid);

		var raw_node = Strophe.getNodeFromJid(jid),
			node = Strophe.unescapeNode(raw_node),
			domain = Strophe.getDomainFromJid(jid),
			resource = Strophe.getResourceFromJid(jid),
			out_jid = '',
			db_note = '';

		out_jid = node + '@' + domain;

		if (resource) {
			out_jid += '/' + resource;
		}

		// For jid values without escaped/unescaped characters, add to cache
		if (jid === out_jid) {
			db_note = ', saved to jid cache';
			candy.util.jid_cache.push(out_jid);
		}

		msos.console.debug(temp_cu + '.unescapeJid ->  done, jid out: ' + out_jid + db_note);

		return out_jid;
	};

	candy.util.crop = function (str, len) {
		if (str.length > len) {
			str = str.substr(0, len - 3) + '...';
		}
		return str;
	};

	candy.util.CropXhtml = function (str, len) {
		var $div,
			out_html = '';

		if (msos.config.verbose) {
			msos.console.debug(temp_cu + '.CropXhtml -> start, input: ' + str + ', restricted to: ' + len);
		}

		// Set out crop to length
		Strophe.createHtml_max_length = len;

		$div = jQuery('<div/>').append(Strophe.createHtml(jQuery('<span>' + str + '</span>').get(0)));

		out_html = $div.html();

		if (msos.config.verbose) {
			msos.console.debug(temp_cu + '.CropXhtml -> done, output: ' + out_html);
		}

		return out_html;
	};

	candy.util.localizedTime = function (dateTime) {
		var temp_lt = temp_cu + '.localizedTime -> ';

		if (msos.config.verbose) {
			msos.console.debug(temp_lt + 'start.');
		}

		if (dateTime === undefined || !dateTime instanceof Date) {
			msos.console.error(temp_lt + 'failed: missing or invalid Date instance!');
			return undefined;
		}

		if (dateTime.toDateString() === new Date().toDateString()) {
			return msos.intl.format(dateTime, 'T');	// Time only for same day
		}

		if (msos.config.verbose) {
			msos.console.debug(temp_lt + 'done!');
		}

		return msos.intl.format(dateTime, 'd');	// Date only
	};

	candy.util.iso8601toDate = function (date) {
		var temp_iso = '.iso8601toDate -> ',
			timestamp = Date.parse(date),
			minutesOffset = 0,
			struct;

		if (vbs) {
			msos.console.debug(temp_cu + temp_iso + 'start, date  in: ' + date);
		}

		if (isNaN(timestamp)) {
			struct = /^(\d{4}|[+\-]\d{6})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3,}))?)?(?:(Z)|([+\-])(\d{2})(?::?(\d{2}))?))?/.exec(date);

			if (struct) {
				if (struct[8] !== 'Z') {
					minutesOffset = +struct[10] * 60 + (+struct[11]);
					if (struct[9] === '+') {
						minutesOffset = -minutesOffset;
					}
				}

				minutesOffset -= new Date().getTimezoneOffset();

				if (vbs) {
					msos.console.debug(temp_cu + temp_iso + 'done, using regex.');
				}

				return new Date(+struct[1], +struct[2] - 1, +struct[3], +struct[4], +struct[5] + minutesOffset, +struct[6], struct[7] ? +struct[7].substr(0, 3) : 0);
			}

			timestamp = Date.parse(date.replace(/^(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') + 'Z');
		}

		if (vbs) {
			msos.console.debug(temp_cu + temp_iso + ' done, date out: ' + timestamp);
		}

		return new Date(timestamp);
	};

	candy.util.Parser = {

		jid: function (in_jid) {
			var r = /^(([^@]+)@)?([^\/]+)(\/(.*))?$/i,
				a = in_jid.match(r);

			if (!a) { throw "not a valid jid (" + in_jid + ")"; }

			return { node: a[2], domain: a[3], resource: a[4] };
		},

		_emoticonPath: '',

		setEmoticonPath: function (path) {
			this._emoticonPath = path;
		},

		emoticons: [
			{
				plain: ':)',
				regex: /((\s):-?\)|:-?\)(\s|$))/gm,
				image: 'Smiling.png'
			},
			{
				plain: ';)',
				regex: /((\s);-?\)|;-?\)(\s|$))/gm,
				image: 'Winking.png'
			},
			{
				plain: ':D',
				regex: /((\s):-?D|:-?D(\s|$))/gm,
				image: 'Grinning.png'
			},
			{
				plain: ';D',
				regex: /((\s);-?D|;-?D(\s|$))/gm,
				image: 'Grinning_Winking.png'
			},
			{
				plain: ':(',
				regex: /((\s):-?\(|:-?\((\s|$))/gm,
				image: 'Unhappy.png'
			},
			{
				plain: '^^',
				regex: /((\s)\^\^|\^\^(\s|$))/gm,
				image: 'Happy_3.png'
			},
			{
				plain: ':P',
				regex: /((\s):-?P|:-?P(\s|$))/igm,
				image: 'Tongue_Out.png'
			},
			{
				plain: ';P',
				regex: /((\s);-?P|;-?P(\s|$))/igm,
				image: 'Tongue_Out_Winking.png'
			},
			{
				plain: ':S',
				regex: /((\s):-?S|:-?S(\s|$))/igm,
				image: 'Confused.png'
			},
			{
				plain: ':/',
				regex: /((\s):-?\/|:-?\/(\s|$))/gm,
				image: 'Uncertain.png'
			},
			{
				plain: '8)',
				regex: /((\s)8-?\)|8-?\)(\s|$))/gm,
				image: 'Sunglasses.png'
			},
			{
				plain: '$)',
				regex: /((\s)\$-?\)|\$-?\)(\s|$))/gm,
				image: 'Greedy.png'
			},
			{
				plain: 'oO',
				regex: /((\s)oO|oO(\s|$))/gm,
				image: 'Huh.png'
			},
			{
				plain: ':x',
				regex: /((\s):x|:x(\s|$))/gm,
				image: 'Lips_Sealed.png'
			},
			{
				plain: ':666:',
				regex: /((\s):666:|:666:(\s|$))/gm,
				image: 'Devil.png'
			},
			{
				plain: '<3',
				regex: /((\s)&lt;3|&lt;3(\s|$))/gm,
				image: 'Heart.png'
			}
		],

		emotify: function (text) {
			var i;
			for (i = this.emoticons.length - 1; i >= 0; i -= 1) {
				text = text.replace(this.emoticons[i].regex, '$2<img class="emoticon" alt="$1" title="$1" src="' + this._emoticonPath + this.emoticons[i].image + '" />$3');
			}
			return text;
		},

		linkify: function (text) {
			text = text.replace(/(^|[^\/])(www\.[^\.]+\.[\S]+(\b|$))/gi, '$1http://$2');
			return text.replace(/(\b(?:(?:https?|ftp|file):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:1\d\d|2[01]\d|22[0-3]|[1-9]\d?)(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?)/gi, function (matched, url) {
				return '<a href="' + url + '" target="_blank">' + candy.util.crop(url, candy.core._opts.crop.message.url) + '</a>';
			});
		},

		escape: function (text) {
			return jQuery('<div/>').text(text).html();
		},

		all: function (text) {

			if (msos.config.verbose) {
				msos.console.debug(temp_cu + '.Parser.all -> start, input: ' + text);
			}

			if (text) {
				text = this.escape(text);
				text = this.linkify(text);
				text = this.emotify(text);
			}

			if (msos.config.verbose) {
				msos.console.debug(temp_cu + '.Parser.all -> done, output: ' + text);
			}

			return text;
		}
	};

	candy.util.XFORM_TYPE_MAP = {
        'text-private':	'password',
        'text-single':	'textline',
        'fixed':		'label',
        'boolean':		'checkbox',
        'hidden':		'hidden',
        'jid-multi':	'textarea',
        'list-single':	'dropdown',
        'list-multi':	'dropdown'
    };

	candy.util.webForm2xForm = function (templates, field) {
		var $input = jQuery(field),
			value = [],
			val,
			lines,
			vk = 0;

		if ($input.is('[type=checkbox]')) {

			value = $input.is(':checked') ? 1 : 0;

		} else if ($input.is('textarea')) {

			lines = $input.val().split('\n');

			for (vk = 0; vk < lines.length; vk += 1) {

				val = jQuery.trim(lines[vk]);

				if (val === '') { continue; }

				value.push(val);
			}

		} else {
			value = $input.val();
		}

		return jQuery(
				templates.field(
					{
						name: $input.attr('name'),
						value: value
					}
				)
			)[0];
	};

    candy.util.xForm2webForm = function (templates, $field, $stanza) {
		var options = [],
			j,
			$options,
			$values,
			value,
			values = [];

		if ($field.attr('type') === 'list-single'
		 || $field.attr('type') === 'list-multi') {

			$values = $field.children('value');

			for (j = 0; j < $values.length; j += 1) {
				values.push(jQuery($values[j]).text());
			}

			$options = $field.children('option');

			for (j = 0; j < $options.length; j += 1) {

				value = jQuery($options[j]).find('value').text();

				options.push(
					templates.select_option(
						{
							value: value,
							label: jQuery($options[j]).attr('label'),
							selected: (values.indexOf(value) >= 0),
							required: $field.find('required').length
						}
					)
				);
			}

			return templates.form_select(
					{
						name: $field.attr('var'),
						label: $field.attr('label'),
						options: options.join(''),
						multiple: ($field.attr('type') === 'list-multi'),
						required: $field.find('required').length
					}
				);
		}

		if ($field.attr('type') === 'fixed') {

			return jQuery('<p class="form-help">').text($field.find('value').text());
		}

		if ($field.attr('type') === 'jid-multi') {

			return templates.form_textarea(
					{
						name: $field.attr('var'),
						label: $field.attr('label') || '',
						value: $field.find('value').text(),
						required: $field.find('required').length
					}
				);
		}

		if ($field.attr('type') === 'boolean') {

			return templates.form_checkbox(
					{
						name: $field.attr('var'),
						type: candy.util.XFORM_TYPE_MAP[$field.attr('type')],
						label: $field.attr('label') || '',
						checked: $field.find('value').text() === "1" ? 'checked="1"' : '',
						required: $field.find('required').length
					}
				);
		}

		if ($field.attr('type') && $field.attr('var') === 'username') {

			return templates.form_username(
					{
						domain: ' @'+this.domain,
						name: $field.attr('var'),
						type: candy.util.XFORM_TYPE_MAP[$field.attr('type')],
						label: $field.attr('label') || '',
						value: $field.find('value').text(),
						required: $field.find('required').length
					}
				);
		}

		if ($field.attr('type')) {

			return templates.form_input(
					{
						name: $field.attr('var'),
						type: candy.util.XFORM_TYPE_MAP[$field.attr('type')],
						label: $field.attr('label') || '',
						value: $field.find('value').text(),
						required: $field.find('required').length
					}
				);
		}

		if ($field.attr('var') === 'ocr') { // Captcha
			return _.reduce(
					_.map(
						$field.find('uri'),
						jQuery.proxy(
							function (uri) {
								return templates.form_captcha(
										{
											label: this.$field.attr('label'),
											name: this.$field.attr('var'),
											data: this.$stanza.find('data[cid="' + uri.textContent.replace(/^cid:/, '') + '"]').text(),
											type: uri.getAttribute('type'),
											required: this.$field.find('required').length
										}
									);
							},
							{
								'$stanza': $stanza,
								'$field': $field
							}
						)
					),
					function (memo, num) { return memo + num; },
					''
				);
		}

		return undefined;
	};

}());
