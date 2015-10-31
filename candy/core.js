/** File: core.js
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
    _: false
*/

msos.provide("candy.core");
msos.require("candy.wrapper");
msos.require("candy.util");
msos.require("candy.jabber");
msos.require("candy.event");
msos.require("candy.view");
msos.require("msos.i18n.candy");

if (candy.wrapper.use_fastpath)	{
	msos.require("candy.fastpath");
}

candy.core.version = new msos.set_version(15, 10, 22);


candy.core._conn = null;
candy.core._service = null;
candy.core._rooms = {};
candy.core._rooms_groupchat = [];
candy.core._opts = {};
candy.core._client_nick = '';
candy.core._roster = null;
candy.core._status = 0;
candy.core._privacy_list = [];
candy.core._invite = {};
candy.core._condition = 'unknown';
candy.core._anonymous_conn = false;
candy.core.dropdown_cnt = 0;

// Called by 'candy.core.room_roster'
candy.core.room_participant = function (user_obj) {
	"use strict";

	this.user = user_obj;
	this.role = '';
	this.affiliation = '';
	this.is_client_user = false;
	this.el = null;

	this.isModerator = function () {
		return this.role === 'moderator'
			|| this.affiliation === 'owner';
	};

	this.create_el = function () {

		candy.core.dropdown_cnt += 1;

		var temp_up = 'candy.core.room_participant - create_el -> ',
			self = this,
			_i18n = msos.i18n.candy.bundle,
			_cwt = candy.wrapper.templates,
			user_tmpl = _.template(_cwt.Roster.user),
			user_html,
			participant_el,
			menu_li_def_obj,
			m_id,
			li_obj,
			li_tmpl = _.template(_cwt.Chat.Context.menulinks),
			li_html,
			li_class,
			li_el = {},
			li_inp_el = {},
			li_btn_el = {},
			kick_tmpl = _.template(_cwt.Chat.Context.kickModal),
			 ban_tmpl = _.template(_cwt.Chat.Context.banModal),
			subj_tmpl = _.template(_cwt.Chat.Context.subjectModal);

		if (msos.config.verbose) {
			msos.console.debug(temp_up + 'start.');
		}

		// Remove any previous jQuery element
		if (this.el instanceof jQuery) {
			this.el.remove();
		}

		user_html = user_tmpl(
			{
				tmpl_data: {
					user_dd_id:		'ddv3_' +candy.core.dropdown_cnt,
					displayNick:	candy.util.crop(self.user.getUserNick(), candy.core._opts.crop.roster.nickname),
					role:			self.role,
					affiliation:	self.affiliation,
					is_client_user:	self.is_client_user,
					tooltipRole:	_i18n.tooltipRole,
					tooltipIgnored:	_i18n.tooltipIgnored
				}
			}
		);

		participant_el = jQuery(user_html);

		if (this.is_client_user) {

			if (this.isModerator()) {

				menu_li_def_obj = {
					'kick': {
						'class' : 'kick',
						'label' : _i18n.kickActionLabel
					},
					'ban': {
						'class' : 'ban',
						'label' : _i18n.banActionLabel
					},
					'subject': {
						'class': 'subject',
						'label' : _i18n.setSubjectActionLabel
					}
				};

			} else {

				menu_li_def_obj = {};
			}

		} else {

			menu_li_def_obj = {
				'private': {
					'class' : 'private',
					'label' : _i18n.privateActionLabel
				},
				'ignore': {
					'class' : 'ignore',
					'label' : _i18n.ignoreActionLabel
				},
				'unignore': {
					'class' : 'unignore',
					'label' : _i18n.unignoreActionLabel
				},
				'video': {
					'class': 'video',
					'lable': _i18n.start_video_call
				}
			}
		}

		menu_li_def_obj = {
			'private': {
				'class' : 'private',
				'label' : _i18n.privateActionLabel
			},
			'ignore': {
				'class' : 'ignore',
				'label' : _i18n.ignoreActionLabel
			},
			'unignore': {
				'class' : 'unignore',
				'label' : _i18n.unignoreActionLabel
			},
			'kick': {
				'class' : 'kick',
				'label' : _i18n.kickActionLabel
			},
			'ban': {
				'class' : 'ban',
				'label' : _i18n.banActionLabel
			},
			'subject': {
				'class': 'subject',
				'label' : _i18n.setSubjectActionLabel
			},
			'video': {
				'class': 'video',
				'lable': _i18n.start_video_call
			}
		};

		for (m_id in menu_li_def_obj) {

			if (menu_li_def_obj.hasOwnProperty(m_id)) {

				li_obj = menu_li_def_obj[m_id];
				li_class = li_obj['class'];

				if (msos.config.verbose) {
					msos.console.debug(temp_up + 'menu item: ' + li_class);
				}

				li_html = li_tmpl(
					{
						tmpl_data:
						{
							'class': li_class,
							'label': li_obj.label
						}
					}
				);

				// Create clickabe <li> element
				li_el[m_id] = jQuery(li_html);

				li_inp_el[m_id] = li_el[m_id].find('input');
				li_btn_el[m_id] = li_el[m_id].find('a');

				switch (li_class) {
					case 'private':
						li_el[m_id].click(
							function () {
								// Create a new private 'chat' room
								candy.core.create_room(
									self.user.getUserJid(),
									self.user.getUserNick(),
									'chat',
									self.user
								);
							}
						);
					break;
					case 'ignore':
						li_el[m_id].click(
							function () {
								candy.core._privacy_list.push(self.user.getUserJid());
							}
						);
					break;
					case 'unignore':
						li_el[m_id].click(
							function () {
								_.without(candy.core._privacy_list, self.user.getUserJid());
							}
						);
					break;
					case 'kick':
						li_el[m_id].click(
							function () {
								msos.notify.info(
									kick_tmpl(
										{
											tmpl_data:
											{
												_label: _i18n.reason,
												_submit: _i18n.kickActionLabel
											}
										}
									),
									_i18n.input_req
								);

								li_inp_el[m_id].focus();

								li_btn_el[m_id].click(
									function () {
										candy.jabber.Room.Admin.UserAction(
											self.user.getUserJid(),
											'kick',
											li_inp_el[m_id].val()
										);
									}
								);
							}
						);
					break;
					case 'ban':
						li_el[m_id].click(
							function () {
								msos.notify.info(
									ban_tmpl(
										{
											tmpl_data:
											{
												_label: _i18n.reason,
												_submit: _i18n.banActionLabel
											}
										}
									),
									_i18n.input_req
								);

								li_inp_el[m_id].focus();

								li_btn_el[m_id].click(
									function () {
										candy.jabber.Room.Admin.UserAction(
											self.user.getUserJid(),
											'ban',
											li_inp_el[m_id].val()
										);
									}
								);
							}
						);
					break;
					case 'subject':
						li_el[m_id].click(
							function () {
								msos.notify.info(
									subj_tmpl(
										{
											tmpl_data:
											{
												_label: _i18n.subject,
												_submit: _i18n.setSubjectActionLabel
											}
										}
									),
									_i18n.input_req
								);

								li_inp_el[m_id].focus();

								li_btn_el[m_id].click(
									function () {
										candy.jabber.Room.Admin.SetSubject(
											candy.view._curr_roomObj,
											li_inp_el[m_id].val()
										);
									}
								);
							}
						);
					break;
				case 'video':
						li_el[m_id].click(
							function () {
								li_btn_el[m_id].click(
									function () {
										// candy.core.webrtc.startCall(self.user);
										candy.jabber.Room.Leave(candy.view._curr_roomObj);
										// candy.view.OfMeet.showOfMeet(curr_room_jid);
									}
								);
							}
						);
					break;
					default:
						msos.console.warn(temp_up + 'no link class: ' + li_class);
				}

				participant_el.find('ul.dropdownV3-menu').append(li_el[m_id]);
			}
		}

		if (msos.config.verbose) {
			msos.console.debug(temp_up + 'done!');
		}

		// Store the element in the participant object
		self.el = participant_el;
	};
};

// Called by 'candy.core.chatroom'
candy.core.room_roster = function (chat_jid) {
	"use strict";

	var temp_chs = 'candy.core.room_roster',
		_i18n = msos.i18n.candy.bundle,
		curr_rm_obj = candy.view._curr_roomObj;

	msos.console.debug(temp_chs + ' -> start.');

	this.chatroom_jid = chat_jid;
	this.participants = 0;

	// Property names must be "unescaped" jid
	this.included_participants = {};

	this.add_part = function (par_jid, par_role, par_affil, par_is_client) {
		// This way, we alway ref. the same (only one) user object
		var par_obj = candy.core._roster.get_user(par_jid),
			participant;

		if (par_obj) {

			participant = new candy.core.room_participant(par_obj);

			this.included_participants[par_jid] = participant;
			this.participants += 1;

			participant.role = par_role || 'na';
			participant.affiliation = par_affil || 'na';

			if (par_is_client && par_is_client === true) {
				participant.is_client_user = true;
			}

			candy.view.Chat.info_msg(
				this.chatroom_jid,
				par_obj.getUserNick(),
				_i18n.userJoinedRoom + ' (role: ' + participant.role + ', affiliation: ' + participant.affiliation + ')'
			);

			// Update user count display
			if (curr_rm_obj
			 && curr_rm_obj.jid === this.chatroom_jid) {
				candy.wrapper.dom.chat_usercount.text(this.participants);
			}

		} else {
			msos.console.warn(temp_chs + '.add_part -> failed, for jid: ' + par_jid);
		}
	};

	// Input jid must be "unescaped" jid
	this.remove_part = function (par_jid) {
		var participant = this.included_participants[par_jid];

		if (participant) {
			if (participant.el) {
				// First, remove the element (and it's handlers, etc.)
				participant.el.remove();
			}

			delete this.included_participants[par_jid];
			this.participants -= 1;

			candy.view.Chat.info_msg(
				this.chatroom_jid,
				participant.user.getUserNick(),
				_i18n.userLeftRoom + ' (role: ' + participant.role + ', affiliation: ' + participant.affiliation + ')'
			);

			// Update user count display
			if (curr_rm_obj
			 && curr_rm_obj.jid === this.chatroom_jid) {
				candy.wrapper.dom.chat_usercount.text(this.participants);
			}

		} else {
			msos.console.warn(temp_chs + '.remove_part -> failed, no user w/ jid: ' + par_jid);
		}
	};

	// Input jid must be "unescaped" jid
	this.get_part = function (par_jid) {
		var participant = this.included_participants[par_jid];

		if (participant) { return participant; }

		if (msos.config.verbose) {
			msos.console.debug(temp_chs + '.get_part -> no participant\n    w/ jid: ' + par_jid + '\n   in room: ' + this.chatroom_jid);
		}

		return null;
	};

	msos.console.debug(temp_chs + ' -> done!');
};

// All users presented to this client app
candy.core.user_roster = function () {
	"use strict";

	var temp_cr = 'candy.core.user_roster';

	msos.console.debug(temp_cr + ' -> start.');

	this.included_users = {};

	this.add_user = function (user_obj) {
		this.included_users[user_obj.getUserJid()] = user_obj;
	};

	this.get_user = function (usr_jid) {
		return this.included_users[usr_jid];
	};

	msos.console.debug(temp_cr + ' -> done!');
};

candy.core.chatroom = function (roomJid, roomName, roomType, roomOwner) {
	"use strict";

	roomJid = candy.util.getUnescapedJid(roomJid);
	roomName = Strophe.unescapeNode(roomName);

	var temp_chr = 'candy.core.chatroom',
		self = this,
		_cwd = candy.wrapper.dom,
		_cv = candy.view,
		_cwt = candy.wrapper.templates,
		tmpl_data = {},
		tab_tmpl,
		tab_html;

	// Note: called in "init", Disco" and "Presence" of candy.event.Jabber.Room
	msos.console.debug(temp_chr + ' -> start, for jid: ' + roomJid + ', name: ' + roomName + ', type: ' + roomType);

	tab_tmpl = _.template(_cwt.Chat.tab);

	this.jid = roomJid;
	this.targetJid = roomJid;

	this.name = roomName;
	this.type = roomType;
	this.disabled = false;

	this.owner = roomOwner;

	this.roster = new candy.core.room_roster(roomJid);

	this.message_count = 0;
	this.scroll_height = 0;
	this.auto_scrolling = msos.basil.get('candy-noscrolling') ? false : true;
	this.info_notifications = msos.basil.get('candy-noinfomessages') ? false : true;
	this.admin_notifications = roomType === 'chat' ? false : true;

	this.jquery_roster_el =		jQuery(_cwt.Roster.pane);
	this.jquery_message_el =	jQuery(_cwt.Message.pane);
	this.jquery_tab_el = null;
	this.jquery_state_el = null;

	// Add to our rooms object.
	candy.core._rooms[roomJid] = self;

	// Add participant -> owner
	this.roster.add_part(
		roomOwner.jid,
		roomOwner.role,
		roomType === 'chat' ? 'owner' : roomOwner.affiliation,
		true
	);

	// Add slide panel
	this.roster_id = this.jquery_roster_el.slidePanel({
		reference_el: _cwd.chat_rosters,
		reference_is_trigger: false,
		referenceTopPos: 0,
		panelTopPos: 0,
		panelRtPos: 0,
		open_icon_class: ''
	});

	// Add our new room to client rooms div
	_cwd.chat_rooms.append(this.jquery_message_el);

	// Add our new roster to client rosters div
	_cwd.chat_rosters.append(this.jquery_roster_el);

	tmpl_data = {
		roomType: this.type,
		name: this.name,
		privateUserChat: self.type === 'chat' ? true : false
	};

	tab_html = tab_tmpl({ tmpl_data: tmpl_data });

	// Save a ref. to it's tab li
	this.jquery_tab_el = jQuery(tab_html).appendTo(_cwd.chat_tabs);
	this.jquery_tab_el.addClass('active');

	if (roomType === 'chat') {
		this.jquery_state_el = this.jquery_tab_el.find('span.state');
	}

	// Set tab event
	this.jquery_tab_el.on(
		'click',
		function (e) {
			msos.do_nothing(e);

			msos.console.debug(temp_chr + ' - li:click -> room jid: ' + self.jid);

			// Show the associated message pane
			_cv.Room.show(self);

			return false;
		}
	);

	this.jquery_tab_el.find('a.tab_close').on(
		'click',
		function (e) {
			msos.do_nothing(e);

			msos.console.debug(temp_chr + ' - a.tab_close:click -> room jid: ' + self.jid);

			candy.jabber.Room.Leave(self);

			return false;
		}
	);

	msos.console.debug(temp_chr + ' -> done!');
	return self;
};

candy.core.chatuser = function (jid, nick) {
	"use strict";

	var temp_chu = 'candy.core.chatuser',
		self = this;

	msos.console.debug(temp_chu + ' -> start, for jid: ' + (jid || 'na') + ', nick: ' + (nick || 'na'));

	this.jid = candy.util.getUnescapedJid(jid);
	this.nick = Strophe.unescapeNode(nick);
	this.previousNick = '';
	this.status = 'available';

	this.getUserJid = function () {
		var out_jid = '';

		if (self.jid) {
			out_jid = candy.util.getUnescapedJid(self.jid);

			if (self.jid !== out_jid) {
				self.jid = out_jid;
				msos.console.warn(temp_chu + ' - getUserJid -> reset to unescaped jid.');
			}
		}

		return out_jid;
	};

	this.getUserNick = function () {
		var out_nick = Strophe.unescapeNode(self.nick);

		if (out_nick !== self.nick) {
			self.nick = out_nick;
			msos.console.warn(temp_chu + ' - getUserNick -> reset to unescaped nick.');
		}
		return out_nick;
	};

	this.getUserPrevNick = function () {
		var out_prev = self.previousNick ? Strophe.unescapeNode(self.previousNick) : '';

		if (out_prev !== self.previousNick) {
			self.previousNick = out_prev;
			msos.console.warn(temp_chu + ' - getUserPrevNick -> reset to unescaped previousNick.');
		}
		return out_prev;
	};

	msos.console.debug(temp_chu + ' -> done!');
};

candy.core.add_user = function (roster_item) {
    "use strict";

	var temp_ap = 'candy.core.add_user -> ',
		jid =  roster_item.jid ? candy.util.getUnescapedJid(roster_item.jid) : '',
		nick = roster_item.name || jid,
		resources = roster_item.resources || [],
		status = 'available',
		highestResourcePriority,
		new_usr;

	if (msos.config.verbose) {
		msos.console.debug(temp_ap + 'start, Strophe style roster item:', roster_item);
	} else {
		msos.console.debug(temp_ap + 'start.');
	}

	new_usr = candy.core._roster.get_user(jid);

	if (new_usr) {
		msos.console.warn(temp_ap + 'done, for existing user.');
		return new_usr;
	}

	function _weightForStatus(status) {
		var out_status = 0;

		switch (status) {
			case 'chat':
			case 'dnd':
				out_status = 1;
			break;

			case 'available':
			case '':
				out_status = 2;
			break;

			case 'away':
				out_status = 3;
			break;

			case 'xa':
				out_status = 4;
			break;

			case 'unavailable':
				out_status = 5;
			break;

			default:
				out_status = 5;
		}

		return out_status;
	}

	jQuery.each(
		resources,
		function (idx, obj) {
			var resourcePriority = parseInt(obj.priority, 10);

			if (obj.show === ''
			 || obj.show === null
			 || obj.show === undefined) {
				obj.show = 'available';
			}

			if (highestResourcePriority === undefined
			 || highestResourcePriority < resourcePriority) {
				// This resource is higher priority than the ones we've checked so far, override with this one
				status = obj.show;
				highestResourcePriority = resourcePriority;

			} else if (highestResourcePriority === resourcePriority) {
				// Two resources with the same priority means we have to weight their status
				if (_weightForStatus(status) > _weightForStatus(obj.show)) {
					status = obj.show;
				}
			}

			if (msos.config.verbose) {
				msos.console.debug(temp_ap + 'resource: ' + idx + ', status: ' + status + ', w/ priority: ' + resourcePriority);
			}
		}
	);

	// Create the new user object
	new_usr = new candy.core.chatuser(jid, nick);

	// Set their status
	new_usr.status = status;

	// Record our new user to the client app
	candy.core._roster.add_user(new_usr);

	msos.console.debug(temp_ap + 'done, status: ' + status);

	return new_usr;
};

candy.core.create_room = function (roomJid, roomName, roomType, roomOwner) {
	"use strict";

	var temp_ri = 'candy.core.create_room -> ',
		_rms = candy.core._rooms,
		chat_room,
		chat_part_jid;

	msos.console.debug(temp_ri + 'start.');

	roomJid = candy.util.getUnescapedJid(roomJid);

	// Check for an existing
	if (_rms[roomJid]) {
		msos.console.warn(temp_ri + 'done, existing room.');
		return _rms[roomJid];
	}

	if (roomType === 'groupchat') {
		// Keep track of groupchat rooms
		candy.core._rooms_groupchat.push(roomJid);
	}

	// New chat room always get the owner added as a participant
	chat_room = new candy.core.chatroom(roomJid, roomName, roomType, roomOwner);

	if (roomType === 'chat') {

		if (roomOwner.jid === roomJid) {
			chat_part_jid = Strophe.getBareJidFromJid(roomJid) + '/' + candy.core._client_nick;
		} else {
			chat_part_jid = roomJid;
		}

		// Add the other private chat participant
		chat_room.roster.add_part(
			chat_part_jid,
			'participant',
			'member'
		);
	}

	candy.view.Room.show(chat_room);

	if (msos.config.verbose) {
		candy.view.Chat.info_msg(
			roomJid,
			'Debug Info: ' + roomName,
			'Room type: ' + chat_room.type + ', jid: ' + chat_room.jid,
			true
		);
	}

	msos.console.debug(temp_ri + 'done!');

	return chat_room;
};

candy.core.create_groupchat = function (room_jid, room_name) {
	"use strict";

	var temp_cg = 'candy.core.create_groupchat -> ',
		owner_jid = room_jid + '/' + candy.core._client_nick,
		owner_obj,
		room_obj;

	msos.console.debug(temp_cg + 'start, jid: ' + room_jid + ', name: ' + room_name);

	// Verify owner object is available
	owner_obj = candy.core._roster.get_user(owner_jid);

	if (!owner_obj) {
		owner_obj = candy.core.add_user(
			{
				jid: owner_jid,
				name: candy.core._client_nick,
				resources: [{ show: 'available', priority: 1 }]
			}
		);
	}

	room_obj = candy.core.create_room(
		room_jid,
		room_name,
		'groupchat',
		owner_obj
	);

	msos.console.debug(temp_cg + 'done!');
	return room_obj;
};

candy.core.get_room_obj = function (roomJid) {
	"use strict";

	var gro = 'candy.core.get_room_obj -> ';

	if (msos.config.verbose) {
		msos.console.debug(gro + 'called, for jid: ' + roomJid);
	}

	if (msos.var_is_empty(roomJid)) {
		msos.console.error(gro + 'input was null or undefined.');
		return null;
	}

	if (!_.isString(roomJid)) {
		msos.console.error(gro + 'input was not a string.');
		return null;
	}

	roomJid = candy.util.getUnescapedJid(roomJid);

	// Check for room
	if (candy.core._rooms[roomJid]) { return candy.core._rooms[roomJid]; }

	msos.console.warn(gro + 'no room object for jid: ' + roomJid);
	return null;
};

candy.core.clean_up_participant = function (part_jid) {
	"use strict";

	var temp_cpp = 'candy.core.clean_up_participant -> ',
		db_notes = '',
		rm_jid,
		rm_obj;

	msos.console.debug(temp_cpp + 'start, jid: ' + part_jid);

	// Process all private chat rooms for this participant
	candy.core.clean_up_rooms(part_jid);

	// Iterate through all created client rooms
	for (rm_jid in candy.core._rooms) {

		rm_obj = candy.core._rooms[rm_jid];

		if (rm_obj.roster.get_part(part_jid)) {

			rm_obj.roster.remove_part(part_jid);

			db_notes += ',\n    removed: ' + part_jid + ', from room: ' + rm_jid;
		}
	}

	msos.console.debug(temp_cpp + 'done' + (db_notes || '!'));
};

candy.core.clean_up_rooms = function (room_jid, force, delay) {
	"use strict";

	var temp_cup = 'candy.core.clean_up_rooms -> ',
		db_notes = '',
		rm_jid,
		rm_obj,
		prt_key,
		participants,
		participant_keys;

	force = force || false;
	delay = delay || 100;

	msos.console.debug(temp_cup + 'start, jid: ' + room_jid);

	// Iterate through all created client rooms
	for (rm_jid in candy.core._rooms) {

		if (rm_jid === room_jid) {

			rm_obj = candy.core._rooms[rm_jid];

			if (rm_obj.type === 'groupchat') {

				participants = rm_obj.roster.included_participants;
				participant_keys = _.keys(participants);

				// Clean up participant private chat rooms
				for (prt_key in participants) {
					candy.core.clean_up_rooms(prt_key, true, delay);
				}

				// Make sure it takes longer to close group chat room, than all private rooms
				setTimeout(
					function () { candy.view.Room.close(rm_obj); },
					participant_keys.length * 500
				);

				db_notes += ',\n   closing group chat: ' + room_jid;

			} else {

				if (force === true || candy.core._opts.autoclose_private) {
					setTimeout(
						function () { candy.view.Room.close(rm_obj); },
						delay
					);

					db_notes += ',\n   closing private chat: ' + room_jid;
				} else {

					rm_obj.jquery_tab_el.addClass('offline').removeClass('online');

					db_notes += ',\n   private chat offline: ' + room_jid;
				}
			}

			delay += 50;
		} else {
			db_notes += ',\n   no room for jid: ' + room_jid;
		}
	}

	msos.console.debug(temp_cup + 'done' + db_notes);
};

candy.core.isOnPrivacyList = function (par_jid) {
	"use strict";

	if (!candy.core._privacy_list.length) { return false; }

	return _.indexOf(candy.core._privacy_list, par_jid) !== -1 ? true : false;
};

candy.core.registerEventHandlers = function (reh_conn) {
	"use strict";

	var _cevt = candy.event;

	function _add(fn, ns, name, type) {
		var sys_handler = reh_conn.addStropheHandler(fn, ns, name, type);

		sys_handler.describe = 'cb: candy chat';
	}

	//	 handler function,				namespace,				elem.,	type	(element name -> lowercase)
	_add(_cevt.Jabber.Version,			Strophe.NS.VERSION,		'iq');
	_add(_cevt.Jabber.Room.Disco,		Strophe.NS.DISCO_INFO,	'iq',	'result');
	_add(_cevt.Jabber.Presence,			Strophe.NS.CLIENT,		'presence');
	_add(_cevt.Jabber.Message,			Strophe.NS.CLIENT,		'message');
	_add(_cevt.Jabber.Bookmarks,		Strophe.NS.PRIVATE,		'iq');
};

candy.core._opts = {
	autojoin: true,
	autoclose_private: false,
	conferenceDomain: undefined,
	presencePriority: 1,
	resource: candy.wrapper.name,
	initialRosterVersion: null,
	initialRosterItems: [],
	host: window.location.host,
	annonymous: false,
	messages: { limit: 100, remove: 25 },
	crop: {
		message: { nickname: 40, body: 1000, url: undefined },
		roster:  { nickname: 15 }
	},
	turnCredentialsPath: null,
    RTCPeerConfig: {
        ttl: 3600,
        url: null,
        iceServers: [{ urls: 'stun:stun.stunprotocol.org' }]
    },
	updateWindowOnAllMessages: true
};

if (msos.config.debug) {
	candy.core._opts.crop.message.nickname = 120;
}

candy.core.strophe_init = function (_new_conn) {
	"use strict";

	var temp_si = 'candy.core.strophe_init -> ';

	msos.console.debug(temp_si + 'start.');

	if (candy.debug) {
		// Overwrite Strophe standard debugging
		_new_conn.debugInput = candy.debug.strophe_in;
		_new_conn.debugOutput = candy.debug.strophe_out;
	}

	// Register Candy Specific Strophe Handlers
	candy.core.registerEventHandlers(_new_conn);

	// Register FastPath Specific Strophe Handlers
	if (candy.wrapper.use_fastpath && candy.fastpath) {
		candy.fastpath.registerEventHandlers(_new_conn);
	}

	// Strophe CAPS plugin info
	_new_conn.caps.node = 'https://github.com/OpenSiteMobile/mobilesiteos/';

	// Add authentication mechanisms
	_new_conn.mechanisms = {
		'ANONYMOUS':	Strophe.SASLAnonymous,
		'PLAIN':		Strophe.SASLPlain,
		'SCRAM-SHA-1':	Strophe.SASLSHA1,
		'DIGEST-MD5':	Strophe.SASLMD5
	};

	msos.console.debug(temp_si + 'authentication mechanisms added.');

	window.onbeforeunload = function () {
		_new_conn.sync = true;
		_new_conn.server_disconnect('window_unload_disconnect');
		_new_conn.client_disconnect('window_unload_disconnect');

		if (msos.config.verbose) {
			return 'Verbose mode: execution stopped for debugging.';
		}
		return undefined;
	};

	// Store our new connection
	candy.core._conn = _new_conn;

	msos.console.debug(temp_si + 'done!');
};

// Initialize our Strophe Connection
candy.core.init = function (options) {
	"use strict";

	var temp_ci = 'candy.core.init -> ',
		_conn = null,
		ws_protocol = window.location.protocol === "http:" ? "ws:" : "wss:",
		use_service = '';

	msos.console.debug(temp_ci + 'start, options:', options);

	function _addNS(name, value) {
		Strophe.addNamespace(name, value);
	}

	function _addNamespaces() {
		_addNS('PRIVATE',		'jabber:iq:private');
		_addNS('PRIVACY',		'jabber:iq:privacy');
		_addNS('JABBER_DELAY',	'jabber:x:delay');
		_addNS('BOOKMARKS',		'storage:bookmarks');
		_addNS('DELAY',			'urn:xmpp:delay');
		_addNS('CARBONS',		'urn:xmpp:carbons:2');
		_addNS('FORWARD',		'urn:xmpp:forward:0');
		_addNS('RECEIPTS',		'urn:xmpp:receipts');
		_addNS('PUBSUB',		'http://jabber.org/protocol/pubsub');
		_addNS('WORKGROUP',		"http://jabber.org/protocol/workgroup");
	}

	// Apply options
	jQuery.extend(true, candy.core._opts, options);

	// Jabber setup
	_addNamespaces();

	msos.console.debug(temp_ci + 'namespaces added.');

	if (msos.config.use_websockets
	 && msos.config.websocket) {
		use_service = ws_protocol + "//" + candy.core._opts.host + ":7070/ws/server?username=null&password=null&resource=" + candy.wrapper.name;
	} else {
		use_service = 'http-bind/';
	}

	// Some initial Candy setup
	candy.core._service = use_service;
	candy.core._roster = new candy.core.user_roster();

	// Connect to xmpp service
	_conn = new Strophe.Connection(use_service);

	// Add Candy Chat Strophe handlers
	candy.core.strophe_init(_conn);

	// Indicate that initialization is done
	candy.wrapper.connected = true;

	msos.console.debug(temp_ci + 'done!');
};

candy.core.connect = function (jidOrHost, password, nick) {
	"use strict";

	var temp_crc = 'candy.core.connect -> ',
		athent = 'no jid or host',
		_conn = candy.core._conn,
		_opts = candy.core._opts,
		_cevt = candy.event,
		_cv = candy.view,
		resource_from_jid,
		conn_jid_or_host;

	msos.console.debug(temp_crc + 'start.');

	function get_jid_or_host(j_or_h, resc) {
		var node = Strophe.getNodeFromJid(j_or_h),
			domain = Strophe.getDomainFromJid(j_or_h);

		if (resc) { domain += '/' + resc; }		// add resource if available

		return node ? Strophe.escapeNode(node) + '@' + domain : domain;
	}

	// Is this an anonymous connection
	candy.core._anonymous_conn = (_opts.annonymous && jidOrHost && jidOrHost.indexOf("@") < 0) || false;

	msos.console.debug(temp_crc + 'allow anonymous: ' + candy.core._anonymous_conn);

	if (jidOrHost && password) {
		// Respect the resource, if provided
		resource_from_jid = Strophe.getResourceFromJid(jidOrHost);

		if (resource_from_jid) {
			_opts.resource = resource_from_jid;
		}

		// Authentication
		athent = 'authenticate connect, for jid or host: ' + jidOrHost + ', password: ' + password + ', resource: ' + _opts.resource;

		jQuery(candy).triggerHandler(
			'candy:core:connect.before',
			{ connection: _conn }
		);

		conn_jid_or_host = get_jid_or_host(jidOrHost, _opts.resource);

		_conn.connect(
			conn_jid_or_host,
			password,
			_cevt.Connect
		);

		candy.core._client_nick = nick || Strophe.getNodeFromJid(jidOrHost);

		jQuery(candy).triggerHandler(
			'candy:core:connect.after',
			{ connection: _conn }
		);

	} else if (jidOrHost && nick) {

		// Anonymous connect
		athent = 'anonymous connect, for jid or host: ' + jidOrHost + ', nick: ' + nick;

		jQuery(candy).triggerHandler(
			'candy:core:connect.before',
			{ connection: _conn }
		);

		conn_jid_or_host = get_jid_or_host(jidOrHost, _opts.resource);

		_conn.connect(
			conn_jid_or_host,
			null,
			_cevt.Connect
		);

		candy.core._client_nick = nick;

		jQuery(candy).triggerHandler(
			'candy:core:connect.after',
			{ connection: _conn }
		);

	} else if (jidOrHost) {
		athent = 'do login, for input jid or host: ' + jidOrHost;

		_cv.Login.presetJid = jidOrHost;
		_cv.Login.Inputs();

	} else {
		athent = 'do login, for no input';
		_cv.Login.Inputs();
	}

	msos.console.debug(temp_crc + 'done, for ' + athent);
};

candy.core.disconnect = function (server_disconnect) {
	"use strict";

	var temp_cd = 'candy.core.disconnect -> ',
		_conn = candy.core._conn,
		_new_conn;

	msos.console.debug(temp_cd + 'start.');

	window.onbeforeunload = function () { };

	// Don't bother if a "DISCONNECTING" event fired this
	if (server_disconnect === true) {
		_conn.server_disconnect('client_requested_disconnect');
	}

	// Lets do some prep/clean-up
	candy.core._rooms = {};
	candy.core._invite = {};
	candy.core._roster = new candy.core.user_roster();
	candy.core._status = 0;

	// Reset Strophe by starting a new instance (which we use here)
	_new_conn = _conn.client_disconnect('client_requested_disconnect');

	candy.core.strophe_init(_new_conn);		// Now we are ready to login again...

	msos.console.debug(temp_cd + 'done!');
};
