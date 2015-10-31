/** File: action.js
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
    $msg: false,
    $iq: false,
    $pres: false
*/

msos.provide("candy.jabber");
msos.require("candy.wrapper");
msos.require("candy.util");
msos.require("candy.core");
msos.require("candy.event");
msos.require("msos.i18n.candy");


(function () {
	"use strict";

	var tmp_cj = 'candy.jabber',
		_i18n = msos.i18n.candy.bundle,
		_mcdbug = msos.console.debug;

	candy.jabber = {

		version: new msos.set_version(15, 10, 22),

        SetNickname: function (nick) {
            var pres,
				_conn = candy.core._conn,
				room_jid;

			for (room_jid in candy.core._rooms) {

				pres = $pres({
					to: candy.util.getEscapedJid(room_jid + "/" + nick),
					from: _conn.jid,
					id: _conn.getUniqueId() + ":pres"
				});

				_conn.send(pres);
			}
        },

		Roster: {

			init: function () {
				var jr = '.Roster.init -> ',
					_conn = candy.core._conn,
					_cej = candy.event.Jabber,
					options = candy.core._opts;

				_mcdbug(tmp_cj + jr + 'start.');

				// Strophe Connection Roster object
				_conn.roster.registerCallback(_cej.RosterPush);

				jQuery.each(
					options.initialRosterItems,
					function (i, item) {
						// Blank out resources because their cached value is not relevant
						item.resources = {};
					}
				);

				_conn.roster.get(
					_cej.RosterFetch,
					options.initialRosterVersion,
					options.initialRosterItems
				);

				_mcdbug(tmp_cj + jr + 'done!');
			},

			addTo: function (user_jid, nick) {
				var _conn = candy.core._conn,
					iq;

				user_jid = candy.util.getEscapedJid(user_jid);

				iq = $iq(
						{ type: 'set' }
					).c(
						'query',
						{ xmlns: 'jabber:iq:roster' }
					).c(
						'item',
						{
							jid: user_jid,
							name: nick || ''
						}
					);

				_conn.sendIQ(
					iq,
					'set: query roster, item add jid/name'
				);

				_conn.send(
					$pres({
						to: user_jid,
						type: 'subscribe'
					})
				);
			},

			removeFrom: function (user_jid) {
				var _conn = candy.core._conn,
					iq;

				user_jid = candy.util.getEscapedJid(user_jid);

				iq = $iq(
						{ type: 'set' }
					).c(
						'query',
						{ xmlns: 'jabber:iq:roster' }
					).c(
						'item',
						{
							jid: user_jid,
							subscription: 'remove'
						}
					);

				_conn.sendIQ(
					iq,
					'set: query roster, item subsc. remove'
				);
			}
		},

		Presence: function (attr, child) {
			var jp = '.Presence -> ',
				_conn = candy.core._conn,
				db_pres = [],
				pres_pri = candy.core._opts.presencePriority ? candy.core._opts.presencePriority.toString() : '1',
				pres;

			_mcdbug(tmp_cj + jp + 'start, priority: ' + pres_pri);

			if (!attr) {
				db_pres.push('w/o attributes');
				attr = {};
			}

			if (!attr.id) {
				attr.id = _conn.getUniqueId() + ":pres";
				db_pres.push('w/ new id: ' + attr.id);
			}

			pres = $pres(attr).c(
					"priority"
				).t(
					pres_pri
				).up().c(
					"c",
					_conn.caps.generateCapsAttrs()
				).up();

			if (child) {
				db_pres.push('w/ appended child');
				pres.node.appendChild(child.node);
			}

			_conn.send(pres.tree());

			_mcdbug(tmp_cj + jp + 'done' + (db_pres.length ? ', ' + db_pres.join(', ') : '!'));
		},

		Services: function () {
			var js = '.Services -> ',
				_conn = candy.core._conn;

			_mcdbug(tmp_cj + js + 'start.');

			_conn.sendIQ(
				$iq(
					{
						type: 'get',
						xmlns: Strophe.NS.CLIENT
					}
				).c(
					'query',
					{ xmlns: Strophe.NS.DISCO_ITEMS }
				).tree(),
				'get: query disco items'
			);

			_mcdbug(tmp_cj + js + 'done!');
		},

		Autojoin: function () {
			var ja = '.Autojoin -> ',
				_conn = candy.core._conn,
				_cej = candy.event.Jabber,
				type = 'na',
				pubsubBookmarkRequest;

			_mcdbug(tmp_cj + ja + 'start.');

			// Request bookmarks
			if (candy.core._opts.autojoin === true) {
				_conn.sendIQ(
					$iq(
						{
							type: 'get',
							xmlns: Strophe.NS.CLIENT
						}
					).c(
						'query',
						{ xmlns: Strophe.NS.PRIVATE }
					).c(
						'storage',
						{ xmlns: Strophe.NS.BOOKMARKS }
					).tree(),
					'get: query private, storage bookmarks'
				);

				pubsubBookmarkRequest = _conn.getUniqueId('pubsub');

				_conn.addStropheHandler(
					_cej.Bookmarks,
					Strophe.NS.PUBSUB,
					'iq',
					'result',
					pubsubBookmarkRequest
				);

				_conn.sendIQ(
					$iq(
						{
							type: 'get',
							id: pubsubBookmarkRequest
						}
					).c(
						'pubsub',
						{ xmlns: Strophe.NS.PUBSUB }
					).c(
						'items',
						{ node: Strophe.NS.BOOKMARKS }
					).tree(),
					'get: pubsub, items bookmarks'
				);

				type = 'boolean true';

			// Join defined rooms
			} else if (jQuery.isArray(candy.core._opts.autojoin)) {

				jQuery.each(
					candy.core._opts.autojoin,
					function () {
						candy.jabber.Room.Join.apply(null, this.valueOf().split(':', 2));
					}
				);

				type = 'input array';

			} else {

				candy.event._show_connected = false;

				msos.notify.warn(
					_i18n.administratorMessageSubject,
					_i18n.errorAutojoinMissing
				);

				msos.console.warn(tmp_cj + ja + 'failed, no input.');

				type = 'missing array';
			}

			_mcdbug(tmp_cj + ja + 'done, for: ' + type);
		},

		Carbons: {

			enabled: false,

			enable: function (cb) {
				var ce = '.Carbons.enable -> ',
					_conn = candy.core._conn,
					self = this;

				_conn.sendIQ(
					$iq(
						{ type: 'set' }
					).c(
						'enable',
						{ xmlns: Strophe.NS.CARBONS }
					).tree(),
					'set: enable carbons',
					function () {
						self.enabled = true;
		
						_mcdbug(tmp_cj + ce + 'enabled');
		
						if (cb) { cb.call(self); }
					},
					function () {
						msos.console.warn(tmp_cj + ce + 'could not enable carbons.');
					}
				);
			},

			disable: function (cb) {
				var de = '.Carbons.disable -> ',
					_conn = candy.core._conn,
					self = this;

				_conn.sendIQ(
					$iq(
						{ type: 'set' }
					).c(
						'disable',
						{ xmlns: Strophe.NS.CARBONS }
					),
					'set: disable carbons',
					function () {
						self.enabled = false;
			
						_mcdbug(tmp_cj + de + 'disabled');
			
						if (cb) { cb.call(self); }
					},
					function () {
						msos.console.warn(tmp_cj + de + 'could not disable carbons.');
					}
				);
			},

			toggle: function () {
				if (!this.enabled)	{ this.enable(); }
				else				{ this.disable(); }
			}
		},

		Room: {

			Join: function (roomJid, password) {
				var jrj = '.Room.Join -> ',
					_conn = candy.core._conn,
					participant_jid = candy.util.getEscapedJid(roomJid) + '/' + Strophe.escapeNode(candy.core._client_nick),
					pres = $pres(
							{
								to: participant_jid,
								id: _conn.getUniqueId() + ':pres'
							}
						).c(
							'x',
							{ xmlns: Strophe.NS.MUC }
						);

				_mcdbug(tmp_cj + jrj + 'start,\n        room jid: ' + roomJid + ',\n participant jid: ' + participant_jid + (password ? ', password: ' + password : ''));

				candy.jabber.Room.Disco(roomJid);

				if (password) {
					pres.c('password').t(password);
				}

				pres.up().c(
					'c',
					_conn.caps.generateCapsAttrs()
				);

				_conn.send(pres.tree());

				_mcdbug(tmp_cj + jrj + 'done!');
			},

			Leave: function (room_obj) {
				var jrl = '.Room.Leave -> ',
					_conn = candy.core._conn,
					chat_room_nick = Strophe.escapeNode(candy.core._client_nick),
					chat_room_jid = candy.util.getEscapedJid(room_obj.jid),
					pres_id;

				_mcdbug(tmp_cj + jrl + 'start, type: ' + room_obj.type);

				if (room_obj.type === 'groupchat') {

					// Send MUC info (_ccevt.Jabber.Room.leave_groupchat will close room)
					pres_id = _conn.muc.leave(
						chat_room_jid,
						chat_room_nick,
						function () {
							msos.console.debug(tmp_cj + jrl + 'cb fired, room jid: ' + chat_room_jid);
						}
					);

				} else {

					// Close private chat room
					setTimeout(
						function () { candy.view.Room.close(room_obj); },
						250
					);

				}

				_mcdbug(tmp_cj + jrl + 'done, room: ' + chat_room_jid + (pres_id ? ', presence id: ' + pres_id : ''));
			},

			Disco: function (roomJid) {
				var jrd = '.Room.Disco -> ',
					_conn = candy.core._conn;

				_mcdbug(tmp_cj + jrd + 'start, room jid: ' + roomJid);

				_conn.sendIQ(
					$iq(
						{
							type: 'get',
							from: _conn.jid,
							to:   candy.util.getEscapedJid(roomJid)
						}
					).c(
						'query',
						{ xmlns: Strophe.NS.DISCO_INFO }
					).tree(),
					'get: query disco info'
				);

				_mcdbug(tmp_cj + jrd + 'done!');
			},

			Message: function (roomJid, msg, type) {
				var ajrm = '.Room.Message -> ',
					_conn = candy.core._conn,
					nick = null;

				_mcdbug(tmp_cj + ajrm + 'start, room jid: ' + roomJid + ', type: ' + type);

				// Trim message
				msg = jQuery.trim(msg);

				if (msg === '') {
					_mcdbug(tmp_cj + ajrm + 'done, msg: undefined!');
					return false;
				}

				if (type === 'chat') {
					nick = Strophe.getResourceFromJid(roomJid);
					roomJid = Strophe.getBareJidFromJid(roomJid);
				}

				_conn.muc.message(
					roomJid,
					nick,
					msg,
					type
				);

				_mcdbug(tmp_cj + ajrm + ' done, room jid: ' + roomJid + ', nick: ' + (nick || 'na'));
				return true;
			},

			Invite: function (roomJid, invitees, reason, password) {
				reason = jQuery.trim(reason);

				var jrn = '.Room.Invite -> ',
					_conn = candy.core._conn,
					message = $msg({ to: roomJid }),
					x = message.c(
						'x',
						{ xmlns: Strophe.NS.MUC_USER }
					);

				_mcdbug(tmp_cj + jrn + 'start, room jid: ' + roomJid + ', invitees:', invitees);

				jQuery.each(
					invitees,
					function (i, invitee) {
						invitee = Strophe.getBareJidFromJid(invitee);

						x.c(
							'invite',
							{ to: invitee }
						);

						if (reason !== undefined && reason !== '') {
							x.c('reason', reason);
						}
					}
				);

				if (password !== undefined && password !== '') {
					x.c('password', password);
				}

				_conn.send(message);

				_mcdbug(tmp_cj + jrn + 'done!');
			},

			Admin: {

				UserAction: function (userJid, type, reason) {
					var jra = '.Room.Admin.UserAction -> ',
						_conn = candy.core._conn,
						roomJid,
						itemObj;

					_mcdbug(tmp_cj + jra + 'start, user jid: ' + userJid + ', type: ' + type);

					reason = reason || 'admin';
					roomJid = candy.util.getEscapedJid(candy.view._curr_roomObj.jid);
					userJid = candy.util.getEscapedJid(userJid);

					itemObj = { nick: Strophe.getResourceFromJid(userJid) };

					switch (type) {
						case 'kick':
							itemObj.role = 'none';
							break;
						case 'ban':
							itemObj.affiliation = 'outcast';
							break;
						default:
							return false;
					}

					_conn.sendIQ(
						$iq(
							{
								type: 'set',
								from: _conn.jid,
								to: roomJid
							}
						).c(
							'query',
							{ xmlns: Strophe.NS.MUC_ADMIN }
						).c(
							'item',
							itemObj
						).c(
							'reason'
						).t(reason).tree(),
						'set: query MUC admin, item, reason'
					);

					_mcdbug(tmp_cj + jra + 'done!');
					return true;
				},

				SetSubject: function (roomObj, subject) {
					var jrs = '.Room.Admin.SetSubject -> ',
						_conn = candy.core._conn;

					_mcdbug(tmp_cj + jrs + 'start, room jid: ' + roomObj.jid + ', subject: ' + subject);

					
					_conn.muc.setTopic(
						candy.util.getEscapedJid(roomObj.jid),
						subject
					);

					_mcdbug(tmp_cj + jrs + 'done!');
				}
			},

			Bookmark: {

				Create: function () {
					var bkm = '.Room.Bookmark.Create -> ';

					_mcdbug(tmp_cj + bkm + 'start.');

					// We do this instead of using publish-options because
					// this is not mandatory to implement according to XEP-0060
					candy.core._conn.sendIQ(
						$iq(
							{ type: 'set' }
						).c(
							'pubsub',
							{ xmlns: Strophe.NS.PUBSUB }
						).c(
							'create',
							{ node: 'storage:bookmarks' }
						).up().c(
							'configure'
						).c(
							'x',
							{ xmlns: 'jabber:x:data', type: 'submit' }
						).c(
							'field',
							{ 'var': 'FORM_TYPE', type: 'hidden' }
						).c(
							'value'
						).t(
							'http://jabber.org/protocol/pubsub#node_config'
						).up().up().c(
							'field',
							{ 'var': 'pubsub#persist_items' }
						).c(
							'value'
						).t('1').up().up().c(
							'field',
							{ 'var': 'pubsub#access_model' }
						).c(
							'value'
						).t(
							'whitelist'
						),
						'set: pubsub, create, config, x (bookmark)'
					);

					_mcdbug(tmp_cj + bkm + 'done!');
					return true;
				},

				add: function (roomJid) {

					candy.core._conn.sendIQ(
						$iq(
							{ type: 'set' }
						).c(
							'pubsub',
							{ xmlns: Strophe.NS.PUBSUB }
						).c(
							'publish',
							{ node: Strophe.NS.BOOKMARKS }
						).c(
							'item',
							{ id: roomJid }
						).c(
							'storage',
							{ xmlns: Strophe.NS.BOOKMARKS }
						).c(
							'conference',
							{ autojoin: 'true', jid: roomJid }
						),
						'set: pubsub, publish, item, storage, conference (bookmark)'
					);
				},

				get: function (success, error) {
					
					candy.core._conn.sendIQ(
						$iq(
							{ type: 'get' }
						).c(
							'pubsub',
							{ xmlns: Strophe.NS.PUBSUB }
						).c(
							'items',
							{ node: Strophe.NS.BOOKMARKS }
						),
						'get: pubsub items',
						success,
						error
					);
				},

				remove: function (roomJid) {

					candy.core._conn.sendIQ(
						$iq(
							{ type: 'set' }
						).c(
							'pubsub',
							{ xmlns: Strophe.NS.PUBSUB }
						).c(
							'retract',
							{ node: Strophe.NS.BOOKMARKS }
						).c(
							'item',
							{ id: roomJid }
						),
						'set: pubsub, retract, item (bookmark)'
					);
				}
			}
		}
	};
}());
