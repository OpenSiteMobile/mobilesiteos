/** File: event.js
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
    $iq: false,
    $pres: false,
*/

msos.provide("candy.event");
msos.require("candy.wrapper");
msos.require("candy.util");
msos.require("candy.jabber");
msos.require("candy.view");
msos.require("candy.core");
msos.require("msos.i18n.candy");

candy.event.version = new msos.set_version(15, 10, 22);


candy.event.notificatons = {};

(function () {
	"use strict";

	var tmp_ce = 'candy.event',
		_ce = candy.event,
		_cwd = candy.wrapper.dom,
		_cu = candy.util,
		_cj = candy.jabber,
		_cv = candy.view,
		_i18n = msos.i18n.candy.bundle,
		_noti = _ce.notificatons,
		_mcdbug = msos.console.debug,
		vbs = msos.config.verbose;

	_ce._show_connected = true;

	_ce.Connect = function (status, condition) {
		var temp_c = '.Connect -> ',
			eventName = 'candy:event:connect.status-' + status,
			_SS = Strophe.Status,
			con_stat = Strophe.status_name[status];

		_mcdbug(tmp_ce + temp_c + 'start, status: ' + con_stat);

		if (jQuery(candy).triggerHandler(eventName, { status: status, condition: condition }) === false) {
			_mcdbug(tmp_ce + temp_c + 'done, returned false: ' + eventName);
			return false;
		}

		// If a new event comes in before loading indicator fired, cancel completely
		if (_noti.delay_connecting) { clearTimeout(_noti.delay_connecting); }

		if (candy.core._status === status
		 && candy.core._condition === condition) {
			_mcdbug(tmp_ce + temp_c + 'done, skip exec. for repeat status: ' + con_stat + ' (' + status + ')');
			return true;
		}

		// Record current status & condition
		candy.core._status = status;
		candy.core._condition = condition;

		msos.notify.clear_current();

		switch (status) {

			case _SS.CONNECTING:
				// One second delay before display (slow connections)
				_noti.delay_connecting = setTimeout(
					function () {
						_noti.connecting = msos.notify.loading(
							_i18n.status_connecting
						);
					},
					1000
				);

				break;

			case _SS.AUTHENTICATING:

				msos.notify.loading(
					_i18n.status_authenticating
				);

				break;

			case _SS.CONNECTED:

				if (this._show_connected === true) {
					_noti.connected = msos.notify.success(
						_i18n.status_connected,
						_i18n.chat_status
					);
				}

				// Store for later use (see candy.view.Login.onclick)
				_cv.Login.presetJid = Strophe.getDomainFromJid(_cu.getUnescapedJid(candy.core._conn.jid));

				candy.wrapper.basil.set('last_activity', (new Date()).getTime());

			// Note: fall through is intended
			case _SS.ATTACHED:

				_cj.Roster.init();
				_cj.Carbons.enable();
				_cj.Autojoin();

				if (!candy.core._anonymous_conn) { _cj.Room.Bookmark.Create(); }

				// Candy specific
				_cv.SlashCommands.init();

				break;

			case _SS.DISCONNECTING:

				_noti.disconnecting = msos.notify.loading(
					_i18n.status_disconnecting
				);
				break;

			case _SS.DISCONNECTED:

				if (_noti.disconnecting) {
					_noti.disconnecting.fade_out();
				}

				msos.notify.info(
					_i18n.status_disconnected
				);

				_cv.Login.Inputs();

				this._show_connected = true;		// Reset to true
				break;

			case _SS.AUTHFAIL:

				msos.notify.clear();

				msos.notify.warning(
					_i18n[condition] || _i18n.strophe_auth_failed,
					_i18n.chat_warn
				);

				_cv.Login.Inputs();
				break;

			case _SS.ERROR:

				msos.notify.clear();

				msos.notify.error(
					_i18n[condition] || _i18n.status_error,
					_i18n.chat_error
				);
				break;

			case _SS.CONNFAIL:

				msos.notify.warning(
					_i18n[condition] || _i18n.strophe_connection_failure,
					_i18n.chat_warn
				);
				break;

			case _SS.REDIRECT:

				msos.notify.clear();

				msos.notify.info(
					_i18n.status_redirecting,
					_i18n.chat_status
				);
				break;

			default:
				msos.console.error(tmp_ce + temp_c + 'unknown status:' + status);
				break;
		}

		_mcdbug(tmp_ce + temp_c + ' done, status: ' + con_stat + ' (' + status + ')');
		return true;
	};

	_ce.Jabber = {

		Version: function (msg) {
			var jv = '.Version -> ',
				_conn = candy.core._conn,
				jq_msg = jQuery(msg);

			_mcdbug(tmp_ce + jv + 'start.');

			_conn.sendIQ(
				$iq(
					{
						type:	'result',
						to:		candy.util.getEscapedJid(jq_msg.attr('from')),
						from:	candy.util.getEscapedJid(jq_msg.attr('to')),
						id:		jq_msg.attr('id')
					}
				).c(
					'query',
					{
						xmlns: Strophe.NS.VERSION
					}
				).c('name',		candy.wrapper.name).up()
				 .c('version',	candy.wrapper.version).up()
				 .c('os',		navigator.userAgent),
				'result: query version'
			);

			_mcdbug(tmp_ce + jv + 'done!');
			return true;
		},

		Presence: function (msg) {
			var jp = '.Jabber.Presence -> ',
				muc_flag = true,
				bareJid,
				room_obj;

			_mcdbug(tmp_ce + jp + 'start.');

			msg = jQuery(msg);

			if (msg.children('x[xmlns^="' + Strophe.NS.MUC + '"]').length > 0) {

				if (msg.attr('type') === 'error') {
					_ce.Jabber.Room.PresenceError(msg);
				} else {
					_ce.Jabber.Room.Presence(msg);
				}

			} else {

				bareJid = Strophe.getBareJidFromJid(msg.attr('from'));
				room_obj = candy.core.get_room_obj(bareJid);

				if (room_obj) {
					room_obj.targetJid = bareJid;	// Reset the room_obj's target JID
				}

				muc_flag = false;
			}

			_mcdbug(tmp_ce + jp + 'done, using MUC: ' + muc_flag);
			return true;
		},

		RosterFetch: function (items) {
			var temp_rf = '.Jabber.RosterFetch -> ';

			_mcdbug(tmp_ce + temp_rf + 'start.');

			_.each(
				items,
				candy.core.add_user
			);

			candy.jabber.Presence();

			_mcdbug(tmp_ce + temp_rf + 'done!');
			return true;
		},

		RosterPush: function (items, updatedItem) {
			var jrp = '.Jabber.RosterPush -> ',
				roster = candy.core._roster,
				db_push = '',
				contact;

			_mcdbug(tmp_ce + jrp + 'start.');

			if (!updatedItem) {
				_mcdbug(tmp_ce + jrp + 'done, no updates!');
				return true;
			}

			if (updatedItem.subscription === "remove") {

				contact = roster.get_user(updatedItem.jid);

				roster.remove_user(updatedItem.jid);

				jQuery(candy).triggerHandler(
					'candy:event:jabber:rosterpush.removed',
					{ contact: contact }
				);

				db_push = 'removed';

			} else {

				contact = roster.get_user(updatedItem.jid);

				if (!contact) {

					contact = candy.core.add_user(updatedItem);

					jQuery(candy).triggerHandler(
						'candy:event:jabber:rosterpush.added',
						{ contact: contact }
					);

					db_push = 'added';
				} else {

					jQuery(candy).triggerHandler(
						'candy:event:jabber:rosterpush.updated',
						{ contact: contact }
					);

					db_push = 'updated';
				}
			}

			_mcdbug(tmp_ce + jrp + 'done, ' + db_push + ' user w/ jid: ' + updatedItem.jid);
			return true;
		},

		Bookmarks: function (msg) {
			var jb = '.Jabber.Bookmarks -> ';

			_mcdbug(tmp_ce + jb + 'start.');

			jQuery('conference', msg).each(
				function () {
					var item = jQuery(this);
					if (item.attr('autojoin')) {
						candy.jabber.Room.Join(item.attr('jid'));
					}
				}
			);

			_mcdbug(tmp_ce + jb + 'done!');
			return true;
		},

		Message: function (msg) {

			msg = jQuery(msg);

			var jm = '.Jabber.Message -> ',
				type = msg.attr('type') || 'normal',
				toJid = msg.attr('to') || '',
				frJid = msg.attr('from') || '',
				partnerJid = _cu.getUnescapedJid(frJid),
				partner_db = ', via attribute: from',
				roomJid,
				roomName,
				resource,
				sender,
				partic_obj,
				sender_name,
				from,
				error,
				error_txt,
				subject,
				subject_txt,
				room_obj,
				message_obj,
				invite,
				carbon_tf = false,
				xhtmlChild,
				xhtmlMessage,
				chatstate;

			if (vbs) {
				_mcdbug(tmp_ce + jm + 'start, type: ' + type + ',\n  from jid: ' + frJid + ',\n    to jid: ' + toJid);
			}

			if (msg.children('received[xmlns="' + Strophe.NS.CARBONS + '"]').length > 0) {

				carbon_tf = true;
				partner_db = ', received via ' + Strophe.NS.CARBONS;

				msg = jQuery(msg.children('received').children('forwarded[xmlns="' + Strophe.NS.FORWARD + '"]').children('message'));
			}

			if (msg.children('sent[xmlns="' + Strophe.NS.CARBONS + '"]').length > 0) {

				carbon_tf = true;
				partner_db = ', sent via ' + Strophe.NS.CARBONS;

				msg = jQuery(msg.children('sent').children('forwarded[xmlns="' + Strophe.NS.FORWARD + '"]').children('message'));

				partnerJid = _cu.getUnescapedJid(toJid);
			}

			if (vbs) {
				_mcdbug(tmp_ce + jm + 'partnerJid: ' + partnerJid + partner_db);
			}

			switch (type) {
				case 'normal':

					from = _cu.getUnescapedJid(frJid);

					if (vbs) {
						_mcdbug(tmp_ce + jm + 'message type: normal,\n    from: ' + from);
					}

					invite = _ce.Jabber._findInvite(msg);

					// Auto-Join Incoming MUC Invites
					if (invite) {

						_mcdbug(tmp_ce + jm + "this is an invite.");

						// Store the last invitation (for prefill, etc.)
						candy.core._invite = invite;
						candy.jabber.Room.Join(invite.roomJid, null);

					} else {

						if (!candy.core._rooms[from]) {

							_mcdbug(tmp_ce + jm + "done, room does not exist: " + from);

						} else if (msg.children('body').length > 0) {

							if (msg.children('subject').length > 0) {

								_mcdbug(tmp_ce + jm + "this is an info message.");

								_cv.Chat.info_msg(
									toJid,
									msg.children('subject').text(),
									msg.children('body').text()
								);

							} else {

								_mcdbug(tmp_ce + jm + "process as a chat message.");

								sender = candy.core._roster.get_user(from);
								sender_name = sender.getUserNick();

								roomJid = from;
								roomName = sender_name;

								message_obj = {
									roomJid: roomJid,
									roomName: roomName,
									from: from,
									name: sender_name,
									body: msg.children('body').text(),
									type: msg.attr('type'),
									carbon: carbon_tf
								};

								xhtmlChild = msg.children('html[xmlns="' + Strophe.NS.XHTML_IM + '"]');

								// If xhtml formatted version sent, use it instead (message_obj.body)
								if (xhtmlChild.length > 0) {
									xhtmlMessage = jQuery(
										jQuery('<div class="xhtml_msg">').append(
											xhtmlChild.children('body').first().contents()
										).html()
									);
									if (xhtmlMessage.length > 0) {
										message_obj.body = xhtmlMessage;
									}
								}

								_ce.Jabber.Room.chatstates(msg, roomJid, sender_name);
								_ce.Jabber.Room.Message(msg, message_obj);
							}

						} else {
							msos.console.warn(tmp_ce + jm + 'no body text, type: ' + type);
						}
					}

				break;

				case 'headline':

					// Admin message
					if (!toJid) {
						_cv.Chat.admin_msg(
							candy.view._curr_roomObj.jid,
							msg.children('subject').text(),
							msg.children('body').text()
					);
					// Server Message
					} else {
						_cv.Chat.info_msg(
							toJid,
							msg.children('subject').text(),
							msg.children('body').text()
						);
					}

				break;

				case 'error':

					error = msg.children('error');

					from = _cu.getUnescapedJid(frJid);

					if (vbs) {
						_mcdbug(tmp_ce + jm + 'message type: error,\n      from: ' + from + ',\n  room jid: ' + partnerJid);
					}

					if (error.children('text').length > 0) {

						error_txt = error.children('text').text() || _i18n.status_error;

						message_obj = {
							roomJid: partnerJid,
							roomName: Strophe.getNodeFromJid(partnerJid),
							from: _cu.getUnescapedJid(frJid),
							name: '',
							type: 'info',
							body: error_txt,
							carbon: carbon_tf
						};

						_ce.Jabber.Room.Message(msg, message_obj);

						msos.console.error(tmp_ce + jm + 'error: ' + error_txt);
					}

				break;

				case 'groupchat':

					from = _cu.getUnescapedJid(Strophe.getBareJidFromJid(frJid));
					roomJid = _cu.getUnescapedJid(Strophe.getBareJidFromJid(partnerJid));
					resource = Strophe.getResourceFromJid(partnerJid);

					if (vbs) {
						_mcdbug(tmp_ce + jm + 'message type: groupchat,\n bare from: ' + from + ',\n  room jid: ' + roomJid + ',\n resource: ' + resource);
					}

					subject = msg.children('subject');
					subject_txt = subject.text();

					if (subject.length > 0
					 && subject_txt.length > 0) {

						message_obj = {
							roomJid: roomJid,
							roomName: Strophe.getNodeFromJid(roomJid),
							from: from,
							name: Strophe.getNodeFromJid(from),
							body: subject_txt,
							type: 'subject',
							carbon: carbon_tf
						};

						_ce.Jabber.Room.Message(msg, message_obj);

					} else if (msg.children('body').length > 0) {

						room_obj = candy.core._rooms[roomJid];

						// Message from a user
						if (resource) {

							partic_obj = room_obj.roster.get_part(from + '/' + resource);	// whole orig. "from" jid

							if (partic_obj) {
								sender = partic_obj.user;
							} else {
								// Old posting, not passed in through "Jabber.Presence"
								sender = candy.core.add_user(
									{
										jid: from + '/' + resource,
										name: resource,
										resources: [{ show: 'unavailable', priority: 1 }]
									}
								);
							}

							sender_name = sender.getUserNick();

							message_obj = {
								roomJid: roomJid,
								roomName: room_obj.name,
								from: roomJid,
								name: sender_name,
								body: msg.children('body').text(),
								type: type,
								carbon: carbon_tf
							};

						} else {

							if (!candy.core._rooms[partnerJid]) {
								_mcdbug(tmp_ce + jm + 'done, missing room_obj for jid: ' + partnerJid);
								return true;
							}

							sender_name = '';

							message_obj = {
								roomJid: roomJid,
								roomName: room_obj.name,
								from: roomJid,
								name: '',
								body: msg.children('body').text(),
								type: 'info',
								carbon: carbon_tf
							};
						}

						xhtmlChild = msg.children('html[xmlns="' + Strophe.NS.XHTML_IM + '"]');

						// If xhtml formatted version sent, use it instead (message_obj.body)
						if (xhtmlChild.length > 0) {
							xhtmlMessage = jQuery(
								jQuery('<div class="xhtml_msg">').append(
									xhtmlChild.children('body').first().contents()
								).html()
							);
							if (xhtmlMessage.length > 0) {
								message_obj.body = xhtmlMessage;
							}
						}

						_ce.Jabber.Room.chatstates(msg, roomJid, sender_name);
						_ce.Jabber.Room.Message(msg, message_obj);

					} else {
						msos.console.warn(tmp_ce + jm + 'no body text, type: ' + type);
					}

				break;

				case 'chat':

					from = _cu.getUnescapedJid(frJid);

					if (vbs) {
						_mcdbug(tmp_ce + jm + 'message type: chat,\n    from: ' + from);
					}

					sender = candy.core._roster.get_user(from);
					sender_name = sender.getUserNick();

					roomJid = from;
					roomName = sender_name;

					// A new private room
					if (!candy.core._rooms[from]) {
						candy.core.create_room(
							roomJid,
							roomName,
							'chat',
							sender
						);
					}

					if (msg.children('body').length > 0) {

						message_obj = {
							roomJid: roomJid,
							roomName: roomName,
							from: from,
							name: sender_name,
							body: msg.children('body').text(),
							type: msg.attr('type'),
							carbon: carbon_tf
						};

						xhtmlChild = msg.children('html[xmlns="' + Strophe.NS.XHTML_IM + '"]');

						// If xhtml formatted version sent, use it instead (message_obj.body)
						if (xhtmlChild.length > 0) {
							xhtmlMessage = jQuery(
								jQuery('<div class="xhtml_msg">').append(
									xhtmlChild.children('body').first().contents()
								).html()
							);
							if (xhtmlMessage.length > 0) {
								message_obj.body = xhtmlMessage;
							}
						}

						_ce.Jabber.Room.Message(msg, message_obj);

					} else if (msg.children()) {

						candy.view.Jabber._set_participant_state(roomJid, msg);

					} else {
						msos.console.warn(tmp_ce + jm + 'no body text, type: ' + type);
					}

				break;

				default:
					msos.console.warn(tmp_ce + jm + 'unknown type: ' + type);
			}

			if (vbs) {
				_mcdbug(tmp_ce + jm + 'done, for: ' + type);
			}
			return true;
		},

		_set_participant_state: function (room_jid, rm_msg) {
			var state = '',
				room_obj = candy.core.get_room_obj(room_jid);

			if (room_obj) {
				if			(rm_msg.children("composing").length > 0) {
					state = 'is composing.';
				} else if	(rm_msg.children("paused").length > 0) {
					state = 'is paused.';
				} else if	(rm_msg.children("inactive").length > 0) {
					state = 'is away.';
				} else if	(rm_msg.children("gone").length > 0) {
					state = 'has gone.';
				}

				room_obj.jquery_state_el.html(state);
			}
		},

		_findInvite: function (msg) {
			var fi = '.Jabber._findInvite -> ',
				found = 'none',
				mediatedInvite = msg.find('invite'),
				directInvite = msg.find('x[xmlns="jabber:x:conference"]'),
				passwordNode,
				password,
				reasonNode,
				reason,
				continueNode,
				invite;

			_mcdbug(tmp_ce + fi + 'start.');

			if (mediatedInvite.length > 0) {

				passwordNode = msg.find('password');
				reasonNode = mediatedInvite.find('reason');
				continueNode = mediatedInvite.find('continue');

				if (passwordNode.text() !== '') {
					password = passwordNode.text();
				}

				if (reasonNode.text() !== '') {
					reason = reasonNode.text();
				}

				invite = {
					roomJid:	msg.attr('from'),
					from:		mediatedInvite.attr('from'),
					reason:		reason,
					password:	password,
					continuedThread: continueNode.attr('thread')
				};

				found = mediatedInvite.length + 'mediated invite(s)';
			}

			if (directInvite.length > 0) {

				invite = {
					roomJid:	directInvite.attr('jid'),
					from:		msg.attr('from'),
					reason:		directInvite.attr('reason'),
					password:	directInvite.attr('password'),
					continuedThread: directInvite.attr('thread')
				};

				found = directInvite.length + ' direct invite(s)';
			}

			_mcdbug(tmp_ce + fi + 'done, found: ' + found);
			return invite;
		},

		Room: {

			Disco: function (msg) {

				msg = jQuery(msg);

				var jrd = '.Jabber.Room.Disco -> ',
					roomJid = _cu.getUnescapedJid(msg.attr('from')),
					identity = msg.find('identity'),
					roomName = '',
					roomObj;

				_mcdbug(tmp_ce + jrd + 'start, jid: ' + roomJid);

				if (identity.length
				 && identity.attr('category') === 'conference') {

					roomName = identity.attr('name') || '';

					if (roomName) {
						roomName = Strophe.unescapeNode(roomName);
					}

					if (!candy.core._rooms[roomJid]) {

						roomObj = candy.core.create_groupchat(
							roomJid,
							roomName
						);

					} else {
						roomObj = candy.core.get_room_obj(roomJid);
					}

					// Room name changed
					if (roomName && roomObj.name !== roomName) { roomObj.name = roomName; }

					_mcdbug(tmp_ce + jrd + 'done, room name: ' + roomObj.name);

				} else {
					_mcdbug(tmp_ce + jrd + 'done, no conference room!');
				}

				return true;
			},

			Presence: function (msg) {

				var jrp = '.Jabber.Room.Presence -> ',
					mhsc = _ce.Jabber.Room._msgHasStatusCode,
					from = _cu.getUnescapedJid(msg.attr('from')),
					presenceType = msg.attr('type') || '',
					isNewRoom =  mhsc(msg, 201),	// Available, but not actually used!
					nickAssign = mhsc(msg, 210),
					nickChange = mhsc(msg, 303),
					isParticipant = mhsc(msg, 110),
					room_jid = Strophe.getBareJidFromJid(from),
					room_obj = candy.core.get_room_obj(room_jid),
					room_partic_obj,
					room_roster_user,
					core_roster_user,
					action,
					update = false,
					show = msg.find('show'),
					item = msg.find('item'),
					in_role = item.attr('role') || '',
					in_affiliation = item.attr('affiliation') || '',
					in_nick = item.attr('nick') || Strophe.getResourceFromJid(from) || '';

				_mcdbug(tmp_ce + jrp + 'start, from: ' + from);

				// User left a room or nick change
				if (presenceType === 'unavailable') {

					// Special case: MUC groupchat participant confirmation
					if (isParticipant) {

						action = 'leave';

						_mcdbug(tmp_ce + jrp + 'muc leave confirmed: ' + room_jid);

						// Group chat room -> room_jid
						candy.core.clean_up_rooms(room_jid, true);

					} else if (room_obj) {

						room_partic_obj = room_obj.roster.get_part(from);

						if (nickChange && room_partic_obj) {

							action = 'nickchange';

							room_roster_user = room_partic_obj.user;

							// Save prev. and assign new nickname
							room_roster_user.previousNick = room_roster_user.getUserNick();
							room_roster_user.nick = in_nick;
							room_roster_user.jid = Strophe.getBareJidFromJid(from) + '/' + in_nick;

							// Create the Roster display for this participant
							room_partic_obj.create_el();
							// Now append it to the proper room roster element
							room_obj.jquery_roster_el.append(room_partic_obj.el);

							_cv.Chat.info_msg(
								room_obj.jid,
								room_roster_user.previousNick + ' => ' + in_nick,
								_i18n.user_changed_nick
							);

							_mcdbug(tmp_ce + jrp + 'for nick change: ' + in_nick);

						} else if (room_partic_obj) {

							action = 'leave';

							if (item.attr('role') === 'none') {
								if (mhsc(msg, 307)) {
									action = 'kick';
								} else if (mhsc(msg, 301)) {
									action = 'ban';
								}
							}

							if (room_obj.type === 'groupchat'
							 && room_obj.owner.jid === from) {

								_mcdbug(tmp_ce + jrp + 'muc leaving.');

								_ce.Jabber.Room.leave_groupchat(
									item,
									room_obj,
									room_partic_obj,
									action
								);

							} else {

								_mcdbug(tmp_ce + jrp + 'paticipant has left: ' + from);

								if (action === 'kick') {
									_cv.Chat.info_msg(
										room_obj.jid,
										room_partic_obj.user.getUserNick(),
										_i18n.user_kicked
									);
								} else if (action === 'ban') {
									_cv.Chat.info_msg(
										room_obj.jid,
										room_partic_obj.user.getUserNick(),
										_i18n.user_banned
									);
								}

								candy.core.clean_up_participant(from);
							}

						} else {
							_mcdbug(tmp_ce + jrp + 'participant no longer exists: ' + from);
						}

					} else {
						_mcdbug(tmp_ce + jrp + 'no room w/ jid: ' + room_jid);
					}

				} else {

					// User joined a room
					action = 'join';

					if (room_obj) {

						room_partic_obj = room_obj.roster.get_part(from);
						core_roster_user = candy.core._roster.get_user(from);

						// Already in the room participant roster
						if (room_partic_obj) {

							room_roster_user = room_partic_obj.user;

							// Role or affiliation change (flag for update)
							if (in_role
							 && room_partic_obj.role !== in_role) {
								room_partic_obj.role = in_role;

								update = true;
							}
							if (in_affiliation
							 && room_partic_obj.affiliation !== in_affiliation)	{
								room_partic_obj.affiliation = in_affiliation;
	
								update = true;
							}

							_mcdbug(tmp_ce + jrp + 'for current room participant.');

						// In core roster, but not room roster
						} else if (core_roster_user) {

							// Add to room roster
							room_obj.roster.add_part(
								from,
								in_role,
								in_affiliation
							);

							// Get the just added pariticpant object
							room_partic_obj = room_obj.roster.get_part(from);

							// Make available for owner assignment (below)
							room_roster_user = core_roster_user;

							// Set true for first (initial) participation in this room
							update = true;

							_mcdbug(tmp_ce + jrp + 'for core roster user.');

						} else {

							// Completely new user
							room_roster_user = candy.core.add_user(
								{
									jid: from,
									name: in_nick,
									resources: [{ show: '', priority: 1 }]	// Sets this user to "available
								}
							);

							// Add to the room participant roster
							room_obj.roster.add_part(
								from,
								in_role,
								in_affiliation
							);

							// Now get the new participant object
							room_partic_obj = room_obj.roster.get_part(from);

							// Set true for first (initial) participation in this room
							update = true;

							_mcdbug(tmp_ce + jrp + 'for new user.');
						}

						if (update) {
							// Create the Roster display for this participant (removes any previous)
							room_partic_obj.create_el();
							// Now append it to the proper room roster element
							room_obj.jquery_roster_el.append(room_partic_obj.el);
						}

						if (show.length > 0) {
							room_roster_user.status = show.text();
							_mcdbug(tmp_ce + jrp + 'new user, show status: ' + room_roster_user.status);
						}

						if (nickAssign) {
							room_obj.owner = room_roster_user;
							_mcdbug(tmp_ce + jrp + 'assigned room owner: ' + room_roster_user.getUserJid());
						}

					} else {
						_mcdbug(tmp_ce + jrp + 'no room w/ jid: ' + room_jid);
					}
				}

				_mcdbug(tmp_ce + jrp + 'done, for: ' + action + (presenceType ? ', presence: ' + presenceType : ''));
				return true;
			},

			_msgHasStatusCode: function (msg, code) {
				return msg.find('status[code="' + code + '"]').length > 0;
			},

			leave_groupchat: function (msg_item, room_obj, room_part, action) {

				var sl = '.Jabber.Room.leave_groupchat',
					partic_user = room_part.user,
					partic_jid =  partic_user.getUserJid(),
					reason,
					actor,
					actorName,
					tmpl_data = {},
					translate_input,
					reas_tmpl,
					actionLabel,
					close_delay = 1000;

				_mcdbug(tmp_ce + sl + ' -> start, action: ' + action + ', room jid: ' + room_obj.jid);

				if (action === 'kick' || action === 'ban') {
					reason = msg_item.find('reason').text() || '';
					actor  = msg_item.find('actor').attr('jid');
				}

				// Update, if available (they might be removed in the next step, but update anyway)
				if (msg_item.attr('affiliation'))	{ partic_user.affiliation = msg_item.attr('affiliation'); }
				if (msg_item.attr('role'))			{ partic_user.role = msg_item.attr('role'); }

				candy.core.clean_up_participant(partic_jid);

				if (action === 'kick' || action === 'ban') {

					close_delay = 6000;

					actorName = actor ? Strophe.getNodeFromJid(actor) : '';
					translate_input = [room_obj.name];
					reas_tmpl = _.template(candy.wrapper.templates.Chat.Context.adminMessageReason);

					if (actorName) {
						translate_input.push(actorName);
					}

					switch (action) {
						case 'kick':
							actionLabel = msos.i18n.simple_printf(
								(actorName ? _i18n.youHaveBeenKickedBy : _i18n.youHaveBeenKicked),
								translate_input
							);
						break;

						case 'ban':
							actionLabel = msos.i18n.simple_printf(
								(actorName ? _i18n.youHaveBeenBannedBy : _i18n.youHaveBeenBanned),
								translate_input
							);
						break;
					}

					tmpl_data = {
						is_reason:	reason ? true : false,
						_action:	actionLabel,
						_reason:	msos.i18n.simple_printf(_i18n.reasonWas, [reason])
					};

					msos.notify.warn(
						reas_tmpl({ tmpl_data: tmpl_data }),
						_i18n.admin_message
					);
				}

				setTimeout(
					function () {
						candy.core.clean_up_rooms(room_obj.jid);
					},
					close_delay
				);

				_mcdbug(tmp_ce + sl + ' ->  done, for: ' + action);
			},

			PresenceError: function (msg) {
				var jre = '.Jabber.Room.PresenceError -> ',
					from = _cu.getUnescapedJid(msg.attr('from')),
					type = msg.children('error').children()[0].tagName.toLowerCase(),
					roomJid = Strophe.getBareJidFromJid(from),
					room_obj = candy.core.get_room_obj(roomJid),
					tmpl_data = {},
					dspl_tmpl = _.template(candy.wrapper.templates.PresenceError.displayError),
					message;

				_mcdbug(tmp_ce + jre + 'start, kill the room: ' + room_obj.name);

				switch (type) {
					case 'not-authorized':
						if (msg.children('x').children('password').length > 0) {
							message = msos.i18n.simple_printf(_i18n.passwordEnteredInvalid, [room_obj.name]);
						}
						_cv.Login.PasswordInput(
							roomJid,
							room_obj.name,
							message
						);
						break;
	
					case 'conflict':
						_cv.Login.NicknameConflict(roomJid);
						break;

					case 'registration-required':
						tmpl_data = { _error: msos.i18n.simple_printf(_i18n.errorMembersOnly, [room_obj.name]) };

						msos.notify.error(
							dspl_tmpl({ tmpl_data: tmpl_data }),
							_i18n.members_only
						);
						break;

					case 'service-unavailable':
						tmpl_data = { _error: msos.i18n.simple_printf(_i18n.errorMaxOccupantsReached, [room_obj.name]) };

						msos.notify.error(
							dspl_tmpl({ tmpl_data: tmpl_data }),
							_i18n.max_occupants
						);
						break;
				}

				room_obj = undefined;
				delete candy.core._rooms[roomJid];

				_mcdbug(tmp_ce + jre + 'done!');
				return true;
			},

			Message: function (msg, rm_msg_obj) {
				// Room subject
				var jrm = '.Jabber.Room.Message -> ',
					room_obj,
					delay,
					timestamp;

				if (msos.config.verbose) {
					_mcdbug(tmp_ce + jrm + 'start, room jid: ' + rm_msg_obj.roomJid + ', room name: ' + rm_msg_obj.roomName);
				}

				room_obj = candy.core.get_room_obj(rm_msg_obj.roomJid);

				// besides the delayed delivery (XEP-0203), there exists also XEP-0091 which is the legacy delayed delivery.
				// the x[xmlns=jabber:x:delay] is the format in XEP-0091.
				delay = msg.children('delay[xmlns="' + Strophe.NS.DELAY +'"]');

				rm_msg_obj.delay = false; // Default delay to being false.

				if (delay.length < 1) {
					// The jQuery xpath implementation doesn't support the or operator
					delay = msg.children('x[xmlns="' + Strophe.NS.JABBER_DELAY +'"]');
				} else {
					// Add delay to the message object so that we can more easily tell if it's a delayed message or not.
					rm_msg_obj.delay = true;
				}

				// From Strophe, timestamp is a string, but we ultimately use a Date object
				timestamp = delay.length > 0 ? delay.attr('stamp') : (new Date());

				if (rm_msg_obj.type === 'subject') {

					_cv.Room.setSubject(
						rm_msg_obj.roomJid,
						rm_msg_obj.body
					);

				} else if (rm_msg_obj.type === 'info') {

					_cv.Chat.info_msg(
						rm_msg_obj.roomJid,
						null,
						rm_msg_obj.body
					);

				} else {

					if (room_obj.targetJid === rm_msg_obj.roomJid && !rm_msg_obj.carbon) {
						// No messages yet received. Lock the room to this resource.
						room_obj.targetJid = rm_msg_obj.from;
					} else if (room_obj.targetJid !== rm_msg_obj.from) {
						// Message received from alternative resource. Release the resource lock.
						room_obj.targetJid = rm_msg_obj.roomJid;
					}

					_cv.Message.add(
						rm_msg_obj.roomJid,
						rm_msg_obj.name,
						rm_msg_obj.body,
						timestamp,
						rm_msg_obj.carbon
					);
				}

				if (msos.config.verbose) {
					_mcdbug(tmp_ce + jrm + 'done, carbon: ' + rm_msg_obj.carbon);
				}
				return true;
			},

			chatstates: function (msg, roomJid, name) {
				var chatStateElements = msg.children('*[xmlns="http://jabber.org/protocol/chatstates"]');

				if (chatStateElements.length > 0) {

					jQuery(candy).triggerHandler(
						'candy:event:jabber:room.chatstates',
						{
							name: name,
							roomJid: roomJid,
							chatstate: chatStateElements[0].tagName
						}
					);
				}
			}
		}
	};
}());
