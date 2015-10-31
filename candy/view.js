/** File: view.js
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
    _: false,
    $build: false,
    $msg: false
*/

msos.provide("candy.view");
msos.require("candy.wrapper");
msos.require("candy.util");
msos.require("jquery.tools.slidepanel");
msos.require("bootstrap.tooltip");
msos.require("bootstrap.dropdownV3");
msos.require("msos.i18n.candy");

if (candy.wrapper.use_timeago)	{
	msos.require("candy.date.timeago");
}

candy.view.version = new msos.set_version(15, 10, 22);


candy.view._curr_roomObj = null;
candy.view._prev_roomObj = null;

(function () {
	"use strict";

	var tmp_cv = 'candy.view',
		_cv = candy.view,
		_cwd = candy.wrapper.dom,
		_i18n = msos.i18n.candy.bundle,
		_cwt = candy.wrapper.templates,
		_mcdbug = msos.console.debug,
		vbs = msos.config.verbose;

	_cv.Window = {

		_hasFocus: true,
		_plainTitle: window.top.document.title,
		_unreadMessagesCount: 0,
		_title_template_fn: _.template(_cwt.Window.unreadmessages),

		hasFocus: function () {
			return _cv.Window._hasFocus;
		},

		increaseUnreadMessages: function () {
			_cv.Window._unreadMessagesCount += 1;
			_cv.Window.renderUnreadMessages(_cv.Window._unreadMessagesCount);
		},

		reduceUnreadMessages: function (num) {
			_cv.Window._unreadMessagesCount -= num;
			if (_cv.Window._unreadMessagesCount <= 0) {
				_cv.Window.clearUnreadMessages();
			} else {
				_cv.Window.renderUnreadMessages(_cv.Window._unreadMessagesCount);
			}
		},

		clearUnreadMessages: function () {
			_cv.Window._unreadMessagesCount = 0;
			window.top.document.title = _cv.Window._plainTitle;
		},

		renderUnreadMessages: function (count) {

			window.top.document.title = _cv.Window._title_template_fn(
				{
					tmpl_data: {
						count: count,
						title: _cv.Window._plainTitle
					}
				}
			);
		},

		onFocus: function () {
			var unread_indicator_el;

			if (candy.view._curr_roomObj) {

				unread_indicator_el = candy.view._curr_roomObj.jquery_tab_el.find('.unread');

				if (unread_indicator_el.length > 0) {
					_cv.Window.reduceUnreadMessages(unread_indicator_el.text());

					unread_indicator_el.hide().text('');
				}

				_cwd.chat_msg[0].focus();
			}

			_cv.Window._hasFocus = true;
		},

		onBlur: function () {
			_cv.Window._hasFocus = false;
		}
	};

	_cv.Login = {

		presetJid: '',	// Preset jid or host (anonymous connection)
		roomJid: '',

		Inputs: function () {
			var slf = '.Login.Inputs -> ',
				db_out = '',
				displayPassword = !candy.core._opts.annonymous,
				displayNickname =  candy.core._opts.annonymous,
				displayUsername = _cv.Login.presetJid ? false : true;

			_mcdbug(tmp_cv + slf + 'start.');

			// Hide message inputs until login completed
			_cwd.chat_msg.hide();
			_cwd.chat_enter.hide();

			if (displayUsername) {
				db_out += ' username';
				_cwd.chat_user.show();
				_cwd.chat_user[0].focus();
				_cwd.chat_login.show();
			}
			if (displayPassword) {
				db_out += ' password';
				_cwd.chat_pass.show();
				_cwd.chat_login.show();
			}
			if (displayNickname) {
				db_out += ' nickname';
				_cwd.chat_nick.show();
				_cwd.chat_nick[0].focus();
				_cwd.chat_login.show();
			}

			_mcdbug(tmp_cv + slf + 'done, display:' + db_out + ' input(s)');
		},

		PasswordInput: function (roomJid, roomName, message) {
			var spf = '.Login.PasswordInput -> ',
				tmpl_data = {},
				pass_tmpl = _.template(_cwt.PresenceError.enterPassword);

			_mcdbug(tmp_cv + spf + 'start, jid: ' + roomJid + ', room name: ' + roomName);

			_cv.Login.roomJid = roomJid;

			_cwd.chat_msg.hide();
			_cwd.chat_enter.hide();

			tmpl_data = {
				roomName: roomName,
				_labelPassword: _i18n.labelPassword,
				_label: (message || msos.i18n.simple_printf(_i18n.enterRoomPassword, [roomName]))
			};

			msos.notify.info(
				pass_tmpl({ tmpl_data: tmpl_data }),
				_i18n.password_req
			);

			_cwd.chat_login.show();
			_cwd.chat_pass.show();
			_cwd.chat_pass[0].focus();

			_mcdbug(tmp_cv + spf + 'done!');
		},

		NicknameConflict: function (roomJid) {
			var snc = 'Login.NicknameConflict -> ',
				tmpl_data = {},
				conf_tmpl = _.template(_cwt.PresenceError.nicknameConflict);

			_mcdbug(tmp_cv + snc + 'start, room jid: ' + roomJid);

			_cv.Login.roomJid = roomJid;

			_cwd.chat_msg.hide();
			_cwd.chat_enter.hide();

			tmpl_data = {
				_labelNickname: _i18n.labelNickname,
				_label: _i18n.nicknameConflict
			};

			msos.notify.warning(
				conf_tmpl({ tmpl_data: tmpl_data }),
				_i18n.nickname_conflick
			);

			_cwd.chat_login.show();
			_cwd.chat_nick.show();
			_cwd.chat_nick[0].focus();

			_mcdbug(tmp_cv + snc + 'done!');
		},

		onclick: function () {
			var slf = '.Login.onclick -> ',
				username = _cwd.chat_user.val() || '',
				password = _cwd.chat_pass.val() || '',
				nickname = _cwd.chat_nick.val() || '',
				presetJid = _cv.Login.presetJid,
				roomJid = _cv.Login.roomJid || _.last(candy.core._rooms_groupchat) || '',
				roomObj = candy.core._rooms[roomJid],
				jid = '';

			function show_msg_input() {

				_cwd.chat_msg.show();
				_cwd.chat_enter.show();

				if (nickname) {
					candy.core._client_nick = nickname;
				}
			}

			_mcdbug(tmp_cv + slf + 'start' + (username ? ', user: ' + username : '') + (password ? ', pass: ' + password : '') + (nickname ? ', nick: ' + nickname : '') + ', jid: ' + presetJid);

			// Done with these, so hide
			_cwd.chat_user.hide();
			_cwd.chat_pass.hide();
			_cwd.chat_nick.hide();
			_cwd.chat_login.hide();

			// Already available room
			if (roomJid) {

				if (roomObj) { _cv.Room.show(roomObj); }

				_mcdbug(tmp_cv + slf + 'join room: ' + roomJid);

				if (password)	{ candy.jabber.Room.Join(roomJid, password); }
				else			{ candy.jabber.Room.Join(roomJid); }

				show_msg_input();

			// Not annonymous
			} else if (!candy.core._anonymous_conn) {

				jid = candy.core._conn && username.indexOf("@") < 0
					? username + '@' + presetJid
					: username;

				if (jid.indexOf("@") < 0) {

					_mcdbug(tmp_cv + slf + 'invalid jid: ' + jid);

					_cv.Login.Inputs(_i18n.loginInvalid);

				} else {

					_mcdbug(tmp_cv + slf + 'user/password, jid: ' + jid);

					candy.core.connect(jid, password);
					show_msg_input();
				}

			// Annonymous allowed
			} else {

				_mcdbug(tmp_cv + slf + 'anonymous, jid: ' + presetJid);

				candy.core.connect(presetJid, null, nickname);
				show_msg_input();
			}

			_mcdbug(tmp_cv + slf + 'done!');
			return false;
		}
	};

	_cv.Room = {

		calc_height: function () {
			var candy_el_height =	Math.round(_cwd.chat_container.innerHeight()),
				tab_ul_height =		Math.round(_cwd.chat_tabs.outerHeight()),
				pane_height;

			// Make sure any previous style rule is removed (ie: display size change)
			jQuery(_cwd.chat_container).find('#candy_dynamic_css').remove();

			pane_height = parseInt(candy_el_height - tab_ul_height, 10);

			_cwd.chat_rooms.css('height', pane_height + 'px');

			// Add a css rule which is applied after calc., and acks on dynamically inserted roster-pane's
			jQuery(
				"<style id='candy_dynamic_css'>"
				).prop(
					"type", "text/css"
				).html(
					'.roster-pane { height: ' + (pane_height - 74) + 'px; }'
				).prependTo(_cwd.chat_container);

			_mcdbug(tmp_cv + '.calc_height -> height: ' + candy_el_height + ' - ' + tab_ul_height + ' = ' + pane_height + 'px');
		},

		show: function (show_obj) {
			var rs = '.Room.show -> ',
				curr_obj = candy.view._curr_roomObj;

			_mcdbug(tmp_cv + rs + 'start, room jid: ' + show_obj.jid);

			// Hide the current room (initial app -> no current room yet)
			if (!msos.var_is_empty(curr_obj)) {

				curr_obj.jquery_message_el.fadeOut();
				curr_obj.jquery_tab_el.removeClass('active');
			}

			if (show_obj) {

				show_obj.jquery_message_el.fadeIn();
				show_obj.jquery_tab_el.addClass('active');

			} else {

				_mcdbug(tmp_cv + rs + 'done, no room for jid: ' + show_obj.jid);
				return;
			}

			// Record the "previous" room
			candy.view._prev_roomObj = curr_obj;

			// Record which one is active (now current)
			candy.view._curr_roomObj = show_obj;

			// Display user count (for this room)
			_cwd.chat_usercount.text(show_obj.roster.participants);

			// Update auto-scrolling control state
			if (show_obj.auto_scrolling === true) {
				_cwd.chat_autoscroll_control.addClass('checked');
			} else {
				_cwd.chat_autoscroll_control.removeClass('checked');
			}

			// Update auto-scrolling control state
			if (show_obj.info_notifications === true) {
				_cwd.chat_info_msg_control.addClass('checked');
			} else {
				_cwd.chat_info_msg_control.removeClass('checked');
			}

			_cv.Room.scrollToBottom();

			// Clear unread messages and focus on message input
			_cv.Window.onFocus();

			_mcdbug(tmp_cv + rs + 'done!');
		},

		setSubject: function (roomJid, subject) {
			var rss = '.Room.setSubject -> ',
				room_obj,
				timestamp = new Date(),
				tmpl_data = {},
				subj_tmpl = _.template(_cwt.Room.subject),
				subj_html;

			_mcdbug(tmp_cv + rss + 'start, room jid: ' + roomJid + ', subject: ' + subject);

			room_obj = candy.core.get_room_obj(roomJid);

			subject = candy.util.Parser.linkify(candy.util.Parser.escape(subject));

			tmpl_data =	{
				subject: subject,
				roomName: room_obj.name,
				_roomSubject: _i18n.roomSubject,
				time: candy.util.localizedTime(timestamp),
				timestamp: timestamp.toISOString()
			};

			subj_html = subj_tmpl({ tmpl_data: tmpl_data });

			_cv.Room.appendToMessagePane(roomJid, subj_html);

			jQuery(candy).triggerHandler(
				'candy:view:room:setsubject.after-change',
				{
					roomObj: room_obj,
					subject: subject
				}
			);

			_mcdbug(tmp_cv + rss + 'done!');
		},

		close: function (room_obj) {
			var rcl = '.Room.close',
				close_jid = room_obj.jid;

			_mcdbug(tmp_cv + rcl + ' -> start, jid: ' + close_jid);

			if (room_obj.disabled) {
				_mcdbug(tmp_cv + rcl + ' -> done, already disabled.');
				return;
			}

			room_obj.jquery_tab_el.addClass('offline').removeClass('online');
			room_obj.disabled = true;

			function finish_closing() {
				var _cv = candy.view,
					curr_obj = _cv._curr_roomObj,
					prev_obj = _cv._prev_roomObj,
					room_keys = _.keys(candy.core._rooms),
					wo_closing,
					wo_close_1st,
					disconnect = false,
					db_notes = '';

				_mcdbug(tmp_cv + rcl + ' - finish_closing -> start, jid: ' + close_jid);

				if (curr_obj.jid === close_jid) {

					if (curr_obj.type === 'groupchat') {
						wo_closing = _.without(candy.core._rooms_groupchat, close_jid);
						wo_close_1st = wo_closing.length ? candy.core.get_room_obj(wo_closing[0]) : null;
					} else {
						wo_closing = _.without(room_keys, close_jid);
						wo_close_1st = wo_closing.length ? candy.core.get_room_obj(wo_closing[0]) : null;
					}

					if (curr_obj.type === 'groupchat') {

						// Update available groupchat list
						candy.core._rooms_groupchat = wo_closing;

						if (wo_close_1st
						 && !wo_close_1st.disabled) {

							// Show first "still available" groupchat room
							_cv.Room.show(wo_close_1st);
							db_notes = 'show available (groupchat): ' + wo_close_1st.jid;

						} else {
							// No more groupchats, so disconnect
							disconnect = true;
						}

					} else if (prev_obj
							&& prev_obj.jid !== close_jid
							&& !prev_obj.disabled) {

							_cv.Room.show(prev_obj);
							db_notes = 'show previous room: ' + prev_obj.jid;

					} else if (wo_close_1st
						    && !wo_close_1st.disabled) {

						_cv.Room.show(wo_close_1st);
						db_notes = 'show available (any): ' + wo_close_1st.jid;

					} else {
						// No more rooms, so disconnect
						disconnect = true;
					}

				} else {
					_cv.Window.clearUnreadMessages();

					db_notes = 'not the current viewable room.';
				}

				if (disconnect) {

					_cwd.chat_toolbar.hide();

					prev_obj = null;
					curr_obj = null;

					candy.core.disconnect(true);

					_cv.Login.Inputs();

					db_notes = 'flagged disconnect.';
				}

				// Now clear out this room
				candy.core._rooms[close_jid] = null;
				delete candy.core._rooms[close_jid];

				_mcdbug(tmp_cv + rcl + ' - finish_closing -> done, ' + db_notes);
			}

			// In case it is currently being shown.
			room_obj.jquery_roster_el.fadeOut(
				500,
				function() {
					this.parentNode.removeChild(this);
				}
			);

			room_obj.jquery_tab_el.fadeOut(
				750,
				function() {
					this.parentNode.removeChild(this);
				}
			);

			room_obj.jquery_message_el.fadeOut(
				1000,
				function() {
					this.parentNode.removeChild(this);

					// all gone from view, so
					finish_closing();
				}
			);

			_mcdbug(tmp_cv + rcl + ' -> done!');
		},

		appendToMessagePane: function (roomJid, html) {
			var amp = '.Room.appendToMessagePane -> ',
				jq_add_msg_el = jQuery(html),
				curr_obj = candy.view._curr_roomObj,
				room_obj;

			if (msos.config.verbose) {
				_mcdbug(tmp_cv + amp + 'start, jid: ' + roomJid);
			}

			room_obj = candy.core.get_room_obj(roomJid);

			if (msos.var_is_empty(room_obj)) {
				_mcdbug(tmp_cv + amp + 'done, no room for jid: ' + roomJid);
				return;
			}

			// If candy.date.timeago script loaded, use it
			if (candy.date
			 && candy.date.timeago) {
				jq_add_msg_el.find('abbr').timeago();
			}

			room_obj.jquery_message_el.append(jq_add_msg_el);
			room_obj.message_count += 1;

			// Only clean if auto-scrolling is enabled
			if (room_obj.auto_scrolling) {
				_cv.Room.sliceMessagePane(room_obj);
			// Or if there are just too many...
			} else if (room_obj.message_count > 200) {
				_cv.Room.sliceMessagePane(room_obj, 200, 50);
			}

			if (curr_obj
			 && curr_obj.jid === roomJid) {
				_cv.Room.scrollToBottom();
			}

			if (msos.config.verbose) {
				_mcdbug(tmp_cv + amp + 'done!');
			}
		},

		sliceMessagePane: function (room_obj, limit, remove) {
			var options = candy.core._opts.messages;

			limit =  limit	|| options.limit;
			remove = remove	|| options.remove;

			if (room_obj.message_count >= limit) {
				room_obj.jquery_message_el.children().slice(0, remove * 2).remove();
				room_obj.message_count -= remove;
			}
        },

		scrollToBottom: function () {
			var osb = '.Room.scrollToBottom -> ',
				room_obj = candy.view._curr_roomObj,
				scroll_height = _cwd.chat_rooms.prop('scrollHeight');

			_mcdbug(tmp_cv + osb + 'start, delta: ' + scroll_height);

			if (room_obj.auto_scrolling === true) {

				// 10 is a small "buffer" so scrolling starts on anything close to chat room height
				if (room_obj.jquery_message_el.height() + 10 > _cwd.chat_rooms.height()) {

					// Only scroll on changes (added messages, so user can scrolled back and stay until a new message)
					if (scroll_height > room_obj.scroll_height + 1) {
						_cwd.chat_rooms.animate({ scrollTop: scroll_height }, 500);
					}

					// Set the current height
					room_obj.scroll_height = scroll_height;

					_mcdbug(tmp_cv + osb + 'done, auto-scrolling!');
				} else {
					_mcdbug(tmp_cv + osb + 'done, not needed.');
				}

			} else {
				_mcdbug(tmp_cv + osb + 'done, no auto-scrolling!');
			}
		},

		ignoreUser: function (roomJid, userJid) {
			candy.jabber.Room.IgnoreUnignore(userJid);
			_cv.Room.addIgnoreIcon(roomJid, userJid);
		},

		unignoreUser: function (roomJid, userJid) {
			candy.jabber.Room.IgnoreUnignore(userJid);
			_cv.Room.removeIgnoreIcon(roomJid, userJid);
		},

		addIgnoreIcon: function (roomJid, userJid) {
			var user_rm_obj = candy.core.get_room_obj(userJid),
				bare_rm_obj = candy.core.get_room_obj(Strophe.getBareJidFromJid(roomJid));

			if (user_rm_obj) {
				jQuery('#user-' + user_rm_obj.id + '-' + candy.util.jidToId(userJid)).addClass('ignored');
			}
			if (bare_rm_obj) {
				jQuery('#user-' + bare_rm_obj.id + '-' + candy.util.jidToId(userJid)).addClass('ignored');
			}
		},

		removeIgnoreIcon: function (roomJid, userJid) {
			var user_rm_obj = candy.core.get_room_obj(userJid),
				bare_rm_obj = candy.core.get_room_obj(Strophe.getBareJidFromJid(roomJid));

			if (user_rm_obj) {
				jQuery('#user-' + user_rm_obj.id + '-' + candy.util.jidToId(userJid)).removeClass('ignored');
			}
			if (bare_rm_obj) {
				jQuery('#user-' + bare_rm_obj.id + '-' + candy.util.jidToId(userJid)).removeClass('ignored');
			}
		}
	};

	_cv.Roster = {

		roster_pane_children: {},

		update: function () {
			var temp_ru = '.Roster.update -> ',
				curr_room_obj = candy.view._curr_roomObj,
				roster_el;

			_mcdbug(tmp_cv + temp_ru + 'start.');

			console.log('does nothing at the moment!');

			_mcdbug(tmp_cv + temp_ru + 'done!');
		},

		show: function (e) {
			var temp_rs = '.Roster.show -> ',
				curr_room_obj = candy.view._curr_roomObj;

			msos.do_nothing(e);

			if (curr_room_obj) {
				_mcdbug(tmp_cv + temp_rs + 'called, panel id: ' + curr_room_obj.roster_id);
				_cwd.chat_rosters.triggerHandler('jquery:tools:slidepanel.' + curr_room_obj.roster_id);
			}
		},

        _userSortCompare: function (nick, status) {
            var statusWeight;

            switch (status) {
                case 'available':
                    statusWeight = 1;
                    break;
                case 'unavailable':
                    statusWeight = 9;
                    break;
                default:
                    statusWeight = 8;
            }

            return statusWeight + nick.toUpperCase();
        },

		// Parameters: (String) elementId - Specific element to do the animation on
		joinAnimation: function (element_key) {
			var kids = _cv.Roster.roster_pane_children;

			kids[element_key].stop(true).slideDown('normal', function () { jQuery(this).animate({ opacity: 1 }); });
		},

		// Parameters: (String) elementId - Specific element to do the animation on
		leaveAnimation: function (element_key) {
			var kids = _cv.Roster.roster_pane_children;

			kids[element_key].stop(true).animate({ opacity: 0 }, {
				complete: function () {
					jQuery(this).slideUp('normal', function () { jQuery(this).remove(); });
				}
			});
		}
	};

	_cv.Message = {

		submit: function () {
			var sb = '.Message.submit -> ',
				roomObj = candy.view._curr_roomObj,
				message = _cwd.chat_msg.val().substring(0, candy.core._opts.crop.message.body),
				evtData = {
					message: message,
					roomObj: roomObj
				},
				participant_name = candy.core._client_nick;

			_mcdbug(tmp_cv + sb + 'start, to room jid: ' + roomObj.jid);

			jQuery(candy).triggerHandler(
				'candy:view:message:submit.before-send',
				evtData
			);

			// Process a special message with leading '/'
			if (message.charAt(0) === '/') {

				// Special text input of commands
				_cv.SlashCommands.message_before(evtData);

			} else if (!msos.var_is_empty(message)) {

				// Send to Jabber server
				candy.jabber.Room.Message(
					roomObj.jid,
					message,
					roomObj.type
				);

				// Add to Private user chat (client) room
				if (roomObj.type === 'chat') {
					_cv.Message.add(
						roomObj.jid,
						participant_name,
						message,
						(new Date()),
						false
					);
				}

				// Clear input and set focus to it
				_cwd.chat_msg.val('').focus();
			}

			_mcdbug(tmp_cv + sb + 'done!');
		},

        add: function (roomJid, name, message, timestamp, carbon) {
			var ms = '.Message.add -> ',
				room_obj = candy.core.get_room_obj(roomJid),
				crop_body = candy.core._opts.crop.message.body,
				crop_nick = candy.core._opts.crop.message.nickname,
				evtData,
				notifyEvtData,
				tmpl_data = {},
				item_tmpl = _.template(_cwt.Message.item),
				item_html;

			// Timestamp from Strophe is a string, but always use a Date object
			timestamp = timestamp || (new Date());

			// If input is ISO-8601 date string, convert it to a Date object
			if (!timestamp.toDateString) {
				timestamp = candy.util.iso8601toDate(timestamp);
			}

			_mcdbug(tmp_cv + ms + 'start, room jid: ' + roomJid + ', name: ' + name);

			// Add for clarity
			if (msos.config.verbose) { name = roomJid + '/' + name; }

			evtData = {
				roomJid: roomJid,
				name: name,
				message: message
			};

			message = candy.util.Parser.all(message);
            message = candy.util.CropXhtml(message, crop_body);

			if (msos.var_is_empty(message)) {
				_mcdbug(tmp_cv + ms + 'done, no message!');
				return;
			}

            tmpl_data = {
				name: name,
				displayName: candy.util.crop(name, crop_nick),
				message: message,
				time: candy.util.localizedTime(timestamp),
				timestamp: timestamp.toISOString(),
				roomjid: roomJid
            };

			item_html = item_tmpl({ tmpl_data: tmpl_data });

			_cv.Room.appendToMessagePane(roomJid, item_html);

            if (!carbon) {

				notifyEvtData = {
					name: name,
					displayName: candy.util.crop(name, crop_nick),
					roomJid: roomJid,
					message: message,
					time: candy.util.localizedTime(timestamp),
					timestamp: timestamp
				};

				jQuery(candy).triggerHandler(
					'candy:view:message:add.notify',
					notifyEvtData
				);

				if (candy.view._curr_roomObj.jid !== roomJid || !_cv.Window.hasFocus()) {
					_cv.Chat.increaseUnreadMessages(roomJid);
					if (!_cv.Window.hasFocus()) {
						// Notify the user about a new private message OR on all messages if configured
						if (room_obj.type === 'chat' && !_cv.Window.hasFocus()) {
							_cv.Toolbar.playSound();
						}
					}
				}
            }

			jQuery(candy).triggerHandler(
				'candy:view:message:add.after',
				evtData
			);

			_mcdbug(tmp_cv + ms + 'done!');
		}
	};

	_cv.SlashCommands = {

		commands: [
			'join',
			'part',
			'clear',
			'topic',
			'available',
			'away',
			'dnd',
			'offline',
			'nick',
			'leave',
			'invite',
			'kick',
			'private'
		],

		s_name: '.SlashCommands',

		defaultConferenceDomain: null,

		init: function () {

			// When connected to the server, default the conference domain if unspecified
			if (!this.defaultConferenceDomain) {
				this.defaultConferenceDomain = "@conference." + candy.core._conn.domain;
			}
			// Ensure we have a leading "@"
			if (this.defaultConferenceDomain.indexOf('@') === -1) {
				this.defaultConferenceDomain = "@" + this.defaultConferenceDomain;
			}
		},

		message_before: function (m_obj) {
			var mb = this.s_name + '.message_before -> ',
				self = this,
				curr_jid = candy.view._curr_roomObj.jid,
				input = m_obj.message.replace(/\|c:\d+\|/, ''),		// (strip colors)
				match,
				command,
				data;

			if (vbs) {
				_mcdbug(tmp_cv + mb + 'start, input: ' + input);
			}

			match = input.match(/^\/([^\s]+)(?:\s+(.*))?$/m);

			if (match && match[1]) {

				command = match[1];
				data = match[2];

				_mcdbug(tmp_cv + mb + 'command: ' + command + ', data: ' + data);

				if (_.indexOf(self.commands, command) !== -1) {

					try {
						self[command](data);
						_cwd.chat_msg.val('').focus();	// it all worked, so clean up
					} catch (ex) {
						msos.console.error(tmp_cv + mb + 'error:', ex);
						_cv.Chat.error_msg(curr_jid, '/' + command, _i18n.command_failed);
					}

				} else {

					msos.notify.warning(
						command,
						_i18n.invalid_command 
					);

					_cv.Chat.info_msg(curr_jid, _i18n.keyed_commands, "usage: /[join][part][clear][topic][available][away][dnd][offline][nick][invite][kick][private]", true);
				}
			}

			if (vbs) {
				_mcdbug(tmp_cv + mb + 'done!');
			}
		},

		join: function (args) {

			if (args === undefined || args === null || args === '') {
				_cv.Chat.info_msg(candy.view._curr_roomObj.jid, _i18n.keyed_commands, "usage: /join room OR /join room roomPassword", true);
				return;
			}

			args = args.trim().split(' ');

			var room = args[0] || '',
				password = args[1] || '';

			if (room === '') { return; }

			if (room.indexOf("@") === -1) {
				room += this.defaultConferenceDomain;
			}

			candy.jabber.Room.Join(room, password);
		},

		nick: function (args) {

			if (args === undefined || args === null || args === '') {
				_cv.Chat.info_msg(candy.view._curr_roomObj.jid, _i18n.keyed_commands, "usage: /nick newNickname", true);
				return;
			}

			candy.jabber.SetNickname(args);
		},

		part: function () { this.leave(); },

		leave: function () {
			candy.jabber.Room.Leave(candy.view._curr_roomObj);
		},

		topic: function (topic) {
			candy.jabber.Room.Admin.SetSubject(candy.view._curr_roomObj, topic);
		},

		clear: function (input) {

			input = input ? jQuery.trim(input) : '';
			input.replace(/^[^0-9]+$/g, '');

			var cl = this.s_name + '.clear -> ',
				curr_obj = candy.view._curr_roomObj,
				number = input ? parseInt(input, 10) : 0,
				removed;

			if (vbs) {
				_mcdbug(tmp_cv + cl + 'start, input: ' + input);
			}

			if (msos.var_is_empty(input)) {
				// Empty every message
				curr_obj.jquery_message_el.empty();
				removed = 'all';
			} else if (number) {
				// Remove the inputted number of messages
				_cv.Room.sliceMessagePane(curr_obj, curr_obj.message_count, number);
				removed = String(number) + ' of original ' + String(curr_obj.message_count);
			} else {
				// Ooops...
				_cv.Chat.info_msg(curr_obj.jid, _i18n.keyed_commands, "usage: /clear OR /clear ##", true);

				// Give an example
				_cwd.chat_msg.focus().val('/clear 20');
				removed = 'none';
			}

			if (vbs) {
				_mcdbug(tmp_cv + cl + 'done, removed: ' + removed);
			}
		},

		available: function () {
			candy.jabber.Presence(null);
		},

		away: function () {
			candy.jabber.Presence(null, $build('show', 'away'));
		},

		dnd: function () {
			candy.jabber.Presence(null, $build('show', 'dnd'));
		},

		offline: function () {
			candy.jabber.Presence(null, $build('show', 'offline'));
		},

		invite: function (args) {

			var argsRegex = args.match(/\<(.+)\>(.*)/),
				_conn = candy.core._conn,
				curr_roster = candy.core._roster.included_users,	// roster of all current users (or known as participants)
				curr_rooms = candy.core._rooms,
				curr_jid = candy.view._curr_roomObj.jid,
				partic_jid,
				userObj,
				userJid = '',
				userText,
				user_regx,
				room_jid,
				roomObj,
				roomText,
				room_regx = null,
				password = null,
				roomJid = null,
				done = false,
				stanza;

			if (args === undefined || args === null || args === '') {
				_cv.Chat.info_msg(curr_jid, _i18n.keyed_commands, "usage: /invite user (from the room) OR /invite &lt;user&gt; room roomPassword", true);
				return;
			}

			if (argsRegex === null) {
				userText = args;
				user_regx = new RegExp("^" + userText + "$", "i");
				roomJid = curr_jid;
			} else {
				userText = argsRegex[1];
				user_regx = new RegExp("^" + userText + "$", "i");
				roomText = argsRegex[2].trim().split(' ')[0];
				room_regx = new RegExp("^" + roomText + "$", "i");
				password = argsRegex[2].trim().split(' ')[1];
			}

			// Quick check...
			for (partic_jid in curr_roster) {

				userObj = curr_roster[partic_jid];

				if (!done && partic_jid.match(user_regx) ) { done = true; }

				if (done) {
					userJid = partic_jid;
					break;
				}
			}

			if (!done) {
				// Expensive checking...
				for (partic_jid in curr_roster) {

					userObj = curr_roster[partic_jid];

					if (!done && userObj.getUserNick().match(user_regx) )		{ done = true; }
					if (!done && userObj.getUserPrevNick().match(user_regx) )	{ done = true; }

					if (done) {
						userJid = partic_jid;
						break;
					}
				}
			}

			 // Originally null, so check
			if (userJid === '') {
				_cv.Chat.warn_msg(curr_jid, _i18n.keyed_commands, "Could not find " + userText + " to invite");
				return;
			}

			// Found the user, so check the room
			for (room_jid in curr_rooms) {

				roomObj = curr_rooms[room_jid];

				if (roomObj.name.match(room_regx) ) {
					roomJid = room_jid;
					break;
				}
			}

			if (roomJid === null) {
				_cv.Chat.warn_msg(curr_jid, _i18n.keyed_commands, "Could not find room " + roomText);
				return;
			}

			if (roomJid === curr_jid && (password === undefined || password === null || password === '')) {
				_cv.Chat.info_msg(curr_jid, '', "Invited " + userJid + " to " + curr_jid, true);

				stanza = $msg(
					{
						'from': _conn.jid,
						'to': candy.util.getEscapedJid(userJid),
						'xmlns': 'jabber:client'
					}).c(
						'x',
						{
							'xmlns': 'jabber:x:conference',
							'jid': candy.util.getEscapedJid(curr_jid)
						}
					);

				_conn.send(stanza.tree());
				return;
			}

			if	(password === undefined || password === null || password === '') {
				_cv.Chat.info_msg(curr_jid, '', "Invited " + userJid + " to " + roomJid, true);

				stanza = $msg(
					{
						'from': _conn.jid,
						'to': candy.util.getEscapedJid(userJid),
						'xmlns': 'jabber:client'
					}).c(
						'x',
						{
							'xmlns': 'jabber:x:conference',
							'jid': candy.util.getEscapedJid(roomJid)
						}
					);

				_conn.send(stanza.tree());
				return;
			}

			_cv.Chat.info_msg(curr_jid, '', "Invited " + userJid + " to " + roomJid + " (with password)", true);

			stanza = $msg(
				{
					'from': _conn.jid,
					'to': candy.util.getEscapedJid(userJid),
					'xmlns': 'jabber:client'
				}).c(
					'x',
					{
						'xmlns': 'jabber:x:conference',
						'jid': candy.util.getEscapedJid(roomJid)
					}
				);

			stanza.c("password").t(password);
			_conn.send(stanza.tree());
		},

		kick: function (args) {
			var argsRegex = args.match(/\<(.+)\>(.*)/),
				curr_obj = candy.view._curr_roomObj,
				curr_included = curr_obj.roster.included_participants,
				partic_jid,
				userObj,
				userJid = null,
				user_regx,
				done = false,
				comment = '';

			if (args === undefined || args === null || args === '') {
				_cv.Chat.info_msg(curr_obj.jid, _i18n.kickActionLabel, "usage: /kick nickname OR /kick &lt;nickname&gt; comment", true);
				return;
			}

			if (argsRegex === null){
				user_regx = new RegExp("^" + args + "$", "i");
			} else {
				user_regx = new RegExp("^" + argsRegex[1] + "$", "i");
				comment = argsRegex[2].trim() || '';
			}

			// Quick check...
			for (partic_jid in curr_included) {

				userObj = curr_included[partic_jid];

				if (!done && partic_jid.match(user_regx) ) { done = true; }

				if (done) {
					userJid = partic_jid;
					break;
				}
			}

			if (!done) {
				// Expensive checking...
				for (partic_jid in curr_included) {

					userObj = curr_included[partic_jid];

					if (!done && userObj.getUserNick().match(user_regx) )		{ done = true; }
					if (!done && userObj.getUserPrevNick().match(user_regx) )	{ done = true; }

					if (done) {
						userJid = partic_jid;
						break;
					}
				}
			}

			// If nothing found, (userJid started as null)
			if (userJid === null) { return; }

			candy.jabber.Room.Admin.UserAction(userJid, "kick", comment);
		},

		'private': function (input) {
			var user_nick = input.trim(),
				curr_obj = candy.view._curr_roomObj,
				user_obj;
	
			if (msos.var_is_empty(input)) {
				_cv.Chat.info_msg(curr_obj.jid, _i18n.keyed_commands, "usage: /private userNick", true);
				return;
			}

			if (curr_obj.type !== 'groupchat') {
				_cv.Chat.warn_msg(curr_obj.jid, _i18n.keyed_commands, "usage: only available in groupchat rooms", true);
				return;
			}

			user_obj = candy.core._roster.get_user(curr_obj.jid + '/' + user_nick);

			if (user_obj) {
				candy.core.create_room(
					user_obj.getUserJid(),
					user_obj.getUserNick(),
					'chat',
					user_obj
				);
			} else {
				msos.notify.warning(
					user_nick,
					_i18n.invalid_user 
				);

				// Put it back for editing
				_cwd.chat_msg.focus().val('/private ' + user_nick);
			}
		}
	};

	_cv.Chat = {

		increaseUnreadMessages: function (roomJid) {
			var room_obj = candy.core.get_room_obj(roomJid),
				unread_indicator_el = room_obj.jquery_tab_el.find('.unread');

			if (unread_indicator_el.length > 0 ) {
				unread_indicator_el.show().text(
					unread_indicator_el.text() !== ''
						? parseInt(unread_indicator_el.text(), 10) + 1
						: 1
					);
			}

			// Only increase window unread messages in private chats
			if ((room_obj && room_obj.type === 'chat')
			 || candy.core._opts.updateWindowOnAllMessages === true) {
				_cv.Window.increaseUnreadMessages();
			}
		},

		_help_message: function (roomJid, subject, message, tmpl_string, sender) {
			var oim = '.Chat._help_message -> ',
				crop_body = candy.core._opts.crop.message.body,
				timestamp = new Date(),
				tmpl_data = {},
				help_tmpl = _.template(tmpl_string),
				help_html;

			if (vbs) {
				_mcdbug(tmp_cv + oim + 'start, subject: ' + subject + ', roomJid in: ' + roomJid);
			}

			message = message || '';

			if (message && candy.core.get_room_obj(roomJid)) {

				message = candy.util.Parser.all(message);
                message = candy.util.CropXhtml(message, crop_body);

				tmpl_data = {
					subject: subject,
					message: message,
					time: candy.util.localizedTime(timestamp),
					timestamp: timestamp.toISOString()
				};

				if (sender) { tmpl_data.sender = sender; }

				help_html = help_tmpl({ tmpl_data: tmpl_data });

				_cv.Room.appendToMessagePane(roomJid, help_html);

			} else {
				_mcdbug(tmp_cv + oim + 'room is na.');
			}

			if (vbs) {
				_mcdbug(tmp_cv + oim + 'done!');
			}
			
		},

		admin_msg: function (roomJid, subject, message) {

			_cv.Chat._help_message(
				roomJid,
				subject,
				message,
				_cwt.Chat.admin_msg,
				_i18n.administratorMessageSubject
			);
		},

		info_msg: function (roomJid, subject, message, force) {

			var room_obj = candy.core.get_room_obj(roomJid);

			if (force || room_obj.info_notifications) {
				_cv.Chat._help_message(
					roomJid,
					subject,
					message,
					_cwt.Chat.info_msg
				);
			}
		},

		warn_msg: function (roomJid, subject, message) {

			_cv.Chat._help_message(
				roomJid,
				subject,
				message,
				_cwt.Chat.warn_msg
			);
		},

		error_msg: function (roomJid, subject, message) {

			// Admin version of help message
			_cv.Chat._help_message(
				roomJid,
				subject,
				message,
				_cwt.Chat.error_msg
			);
		}
	};

	_cv.Toolbar = {

		_supportsNativeAudio: '',

		init: function () {
			var tbi = '.Toolbar.init -> ',
				a = document.createElement('audio'),
				supports = '';

			_mcdbug(tmp_cv + tbi + 'start.');

			try {

				if (a && !!a.canPlayType) {
						   if (!!(a.canPlayType('audio/mpeg;').replace(/no/, ''))) {
						supports = "mp3";
					} else if (!!(a.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''))) {
						supports = "ogg";
					} else if (!!(a.canPlayType('audio/mp4; codecs="mp4a.40.2"').replace(/no/, ''))) {
						supports = "m4a";
					}
				}

				_cv.Toolbar._supportsNativeAudio = supports;

			} catch (e) {
				msos.console.error(tmp_cv + tbi + 'error:', e);
			}

			_mcdbug(tmp_cv + tbi + 'done, audio: ' + (supports|| 'na'));
		},

		onPlaySound: function () {
			var ops = '.Toolbar.onPlaySound -> ',
				supported = _cv.Toolbar._supportsNativeAudio,
				control;

			if (supported) {
				_mcdbug(tmp_cv + ops + 'called, for: ' + supported);

				try {
					new Audio(msos.resource_url('candy', 'media/notify.' + supported)).play();
				} catch (e) {
					msos.console.error(tmp_cv + ops + 'error, playing ' + supported + ':', e);
				}

			} else {
				_mcdbug(tmp_cv + ops + 'called, not supported.');

				control = _cwd.chat_sound_control;
				control.find('i.fa-volume-up').hide();
				control.find('i.fa-volume-off').show();
			}
		},

		// Toggle sound (overwrite 'playSound()') and handle storing status.
		on_sound_click: function () {
			var osc = '.Toolbar.on_sound_click -> ',
				tbar = _cv.Toolbar,
				control = _cwd.chat_sound_control;

			if (control.hasClass('checked')) {
				tbar.playSound = function () {};

				control.find('i.fa-volume-up').hide();
				control.find('i.fa-volume-off').show();
				msos.basil.set('candy-nosound', '1');

				_mcdbug(tmp_cv + osc + 'called, setting to off.');
			} else {
				tbar.playSound = tbar.onPlaySound;

				control.find('i.fa-volume-up').show();
				control.find('i.fa-volume-off').hide();
				msos.basil.set('candy-nosound', '');

				// Bang the gong...
				tbar.playSound();

				_mcdbug(tmp_cv + osc + 'called, setting to on.');
			}
			control.toggleClass('checked');
		},

		on_autoscroll_click: function () {
			var control = _cwd.chat_autoscroll_control,
				curr_rm_obj = candy.view._curr_roomObj;

			if (control.hasClass('checked')) {
				curr_rm_obj.auto_scrolling = false;
			} else {
				curr_rm_obj.auto_scrolling = true;
				_cv.Room.scrollToBottom();
			}
			control.toggleClass('checked');
		},

		on_autoscroll_dblclick: function (e) {
			var control = _cwd.chat_autoscroll_control,
				set_cntrl,
				rooms = candy.core._rooms,
				room,
				room_obj;

			msos.do_abs_nothing(e);

			// Set a stored value to use
			if (control.hasClass('checked')) {
				set_cntrl = false;
				msos.basil.set('candy-noscrolling', '');
			} else {
				set_cntrl = true;
				msos.basil.set('candy-noscrolling', '1');
				_cv.Room.scrollToBottom();	// Scroll current room
			}
			control.toggleClass('checked');

			// Now set all rooms
			for (room in candy.core._rooms) {
				room_obj = candy.core._rooms[room];
				room_obj.auto_scrolling = set_cntrl;
			}
			return false;
		},

		on_info_msg_click: function () {
			var control = _cwd.chat_info_msg_control,
				curr_rm_obj = candy.view._curr_roomObj;

			if (control.hasClass('checked')) {
				curr_rm_obj.info_notifications = false;
			} else {
				curr_rm_obj.info_notifications = true;
			}
			control.toggleClass('checked');
		},

		on_info_msg_dblclick: function (e) {
			var control = _cwd.chat_info_msg_control,
				set_cntrl,
				rooms = candy.core._rooms,
				room,
				room_obj;

			msos.do_abs_nothing(e);

			// Determine which state to set
			if (control.hasClass('checked')) {
				set_cntrl = false;
				msos.basil.set('candy-noinfomessages', '');
			} else {
				set_cntrl = true;
				msos.basil.set('candy-noinfomessages', '1');
			}
			control.toggleClass('checked');

			// Now set all rooms
			for (room in candy.core._rooms) {
				room_obj = candy.core._rooms[room];
				room_obj.info_notifications = set_cntrl;
			}
			return false;
		},

		on_emoticons_click: function () {
			var sem = '.Toolbar.on_emoticons_click',
				emoticons = '</div>',
				i;

			_mcdbug(tmp_cv + sem + ' -> start.');

			for (i = candy.util.Parser.emoticons.length - 1; i >= 0; i -= 1) {
				if (i === 7) { emoticons = '</div><div class="emoticons_po">' + emoticons; }
				emoticons = '<span class="btn"><img src="' + candy.util.Parser._emoticonPath + candy.util.Parser.emoticons[i].image + '" alt="' + candy.util.Parser.emoticons[i].plain + '" /></span>' + emoticons;
			}

			emoticons = '<div class="emoticons_po">' + emoticons;

			// Show mascot popover (quickly)
			txtmap.page.mascot_content(
				_i18n.tooltipEmoticons,
				emoticons,
				50
			);

			// Delay while fadeIn, then bind click functions
			setTimeout(
				function () {
					jQuery('#texie_po_content').find('img').click(
						function () {
							var input = _cwd.chat_msg,
								value = input.val(),
								emoticon = jQuery(this).attr('alt') + ' ';

							_mcdbug(tmp_cv + sem + ' - img.click -> insert: ' + emoticon);

							input.val(value ? value + ' ' + emoticon : emoticon).focus();
						}
					);
				},
				400
			);

			_mcdbug(tmp_cv + sem + ' -> done!');
			return true;
		},

		on_clear_click: function () {
			var occ = '.Toolbar.on_clear_click',
				curr_rm_obj = candy.view._curr_roomObj,
				clear_html = '</div>',
				remove = 10,
				i;

			_mcdbug(tmp_cv + occ + ' -> start.');

			if (curr_rm_obj && curr_rm_obj.message_count > 10) {

				for (i = curr_rm_obj.message_count; i >= 0; i -= 10) {
					if (remove === 50) { clear_html = '</div><div class="class="clear_po">' + clear_html; }
					clear_html = '<span class="btn clear_quantity">' + remove + '</span>' + clear_html;
					remove += 10;
				}

				clear_html = '<div class="clear_po">' + clear_html;

				// Show mascot popover (quickly)
				txtmap.page.mascot_content(
					_i18n.tooltipClear,
					clear_html,
					50
				);

				// Delay while fadeIn, then bind click functions
				setTimeout(
					function () {
						jQuery('#texie_po_content').find('span.clear_quantity').click(
							function () {
								var value = jQuery(this).text(),
									number = parseInt(value, 10) || 0;

								_mcdbug(tmp_cv + occ + ' - span.clear_quantity.click -> remove: ' + number);

								if (number) {
									_cv.Room.sliceMessagePane(curr_rm_obj, curr_rm_obj.message_count, number);
									_cv.Room.scrollToBottom();
								}
							}
						);
					},
					400
				);
			}

			_mcdbug(tmp_cv + occ + ' -> done!');
			return true;
		}
	};

	_cv.Toolbar.playSound = _cv.Toolbar.onPlaySound;

	_cv.init = function () {

		var _chat_container,
			tmpl_data = {},
			tool_tmpl = _.template(_cwt.Chat.toolbar);

		_mcdbug(tmp_cv + '.init -> start.');

		if (candy.wrapper.use_timeago
		 && candy.date.timeago)	{ candy.date.timeago.init(); }

		// Set path to emoticons
		candy.util.Parser.setEmoticonPath(msos.resource_url('candy', 'images/emoticons/'));

		// Start DOMination...
		_chat_container = _cwd.chat_container;

		// Add our Candy child elements
		_chat_container.append(_cwt.Chat.tabs);
		_chat_container.append(_cwt.Chat.rooms);
		_chat_container.append(_cwt.Chat.rosters);

		tmpl_data = {
			tooltipEmoticons :		_i18n.tooltipEmoticons,
			tooltipClear:			_i18n.tooltipClear,
			tooltipSound :			_i18n.tooltipSound,
			tooltipAutoscroll :		_i18n.tooltipAutoscroll,
			tooltipStatusmessage :	_i18n.tooltipStatusmessage,
			tooltipAdministration :	_i18n.tooltipAdministration,
			tooltipUsercount :		_i18n.tooltipUsercount,
			image_resource_path : msos.resource_url('candy', 'images/'),
			media_resource_path : msos.resource_url('candy', 'audio/')
		};

		_chat_container.append(
			tool_tmpl({ tmpl_data: tmpl_data })
		);

		_mcdbug(tmp_cv + '.init -> toolbar rendered.');

		// Bundle our just added dom elements
		_cwd.chat_tabs = jQuery('#chat-tabs');
		_cwd.chat_rooms = jQuery('#chat-rooms');
		_cwd.chat_rosters = jQuery('#chat-rosters');
		_cwd.chat_toolbar = jQuery('#chat-toolbar');
		_cwd.chat_emoticons_control = jQuery('#chat-emoticons-control');
		_cwd.chat_clear_control = jQuery('#chat-clear-control');
		_cwd.chat_sound_control = jQuery('#chat-sound-control');
		_cwd.chat_autoscroll_control = jQuery('#chat-autoscroll-control');
		_cwd.chat_info_msg_control = jQuery('#chat-info_msg-control');
		_cwd.chat_usercount = jQuery('#chat-usercount').find('.display');

		_mcdbug(tmp_cv + '.init -> chat elements defined.');

		// ... and let the elements dance.
		jQuery(window).focus(_cv.Window.onFocus).blur(_cv.Window.onBlur);

		_cwd.chat_emoticons_control.click(
			_cv.Toolbar.on_emoticons_click
		);

		_cwd.chat_clear_control.click(
			_cv.Toolbar.on_clear_click
		);

		_cwd.chat_autoscroll_control.click(
			_cv.Toolbar.on_autoscroll_click
		);

		_cwd.chat_autoscroll_control.dblclick(
			_cv.Toolbar.on_autoscroll_dblclick
		);

		_cwd.chat_sound_control.click(
			_cv.Toolbar.on_sound_click
		);

		_cwd.chat_info_msg_control.click(
			_cv.Toolbar.on_info_msg_click
		);

		_cwd.chat_info_msg_control.dblclick(
			_cv.Toolbar.on_info_msg_dblclick
		);

		_cwd.chat_login.click(
			_cv.Login.onclick
		);

		_cwd.chat_enter.click(
			_cv.Message.submit
		);

		_cwd.chat_msg.on(
			'keyup',
			function (ev) { if (ev.keyCode === 13) { _cwd.chat_enter.get(0).click(); } }
		);

		function on_login_input(ev) { if (ev.keyCode === 13) { _cwd.chat_login.get(0).click(); } }

		_cwd.chat_user.on('keyup', on_login_input);
		_cwd.chat_pass.on('keyup', on_login_input);
		_cwd.chat_nick.on('keyup', on_login_input);

		// Set sound
		if (msos.basil.get('candy-nosound')) { _cwd.chat_sound_control.click(); }

		// Add slide panel to toolbar (show/hide toolbar)
		_cwd.chat_toolbar.slidePanel({
			reference_el: _cwd.chat_toolbar_btn,
			referenceTopPos: '0',
			panelTopPos: '34px',	// these don't change (relative to chat room pane)
			panelRtPos: '18px',
			open_icon_class: ''
		});

		_cwd.chat_members_btn.on('click', _cv.Roster.show);

		_cwd.chat_toolbar.find('li[data-toggle=tooltip]').tooltip();

		// Initiate the toolbar (Audio specifically)
		_cv.Toolbar.init();

		msos.ondisplay_size_change.push(candy.view.calc_room_height);

		_mcdbug(tmp_cv + '.init -> done!');
	};

}());

// Run this late to make sure the rest of page has settled
msos.onload_func_post.push(candy.view.Room.calc_height);
