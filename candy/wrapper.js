/** File: candy.js
 * Candy - Chats are not dead yet.
 *
 * Authors:
 *   - Patrick Stadler <patrick.stadler@gmail.com>
 *   - Michael Weibel <michael.weibel@gmail.com>
 *
 * Copyright:
 *   (c) 2011 Amiado Group AG. All rights reserved.
 *
 *   ref. https://dev.openflex.net/candy/ for working example of standard code
 *
 *	 Originally form v1.0.9, but w/ updates from v2.0.0
 */

/*global
    msos: false,
    jQuery: false,
    candy: false
*/

msos.provide("candy.wrapper");
msos.require("candy.view");
msos.require("candy.core");

if (msos.config.debug) {
	msos.require("candy.debug");
}


candy.wrapper = {
	name: 'MSOS-Candy',
	version: new msos.set_version(15, 15, 22),
	use_timeago: false,
	use_xml_to_json: false,
	use_fastpath: false,
	connected: false,
	basil: new window.Basil({ 'namespace': 'msos_candy_b45i1' }),
	dom: {},
	CONST: {
		KEYCODE_ENTER: 13,
		KEYCODE_ESC: 27,
		AFFILIATION: {
			ADMIN: 'admin',
			MEMBER: 'member',
			OUTCAST: 'outcast',
			OWNER: 'owner',
			NONE: 'none'
		},
		ROLE: {
			MODERATOR: 'moderator',
			PARTICIPANT: 'participant',
			VISITOR: 'visitor',
			NONE: 'none'
		},
		STATUS: ['offline', 'dnd', 'xa', 'away', 'chat', 'online'],
		JID: new RegExp('\\b[^"&\'\\/:<>@\\s]+@[\\w-_.]+\\b', 'ig')
	}
};

candy.wrapper.templates = {

	Window: {
		unreadmessages: '(<%= tmpl_data.count %>) <%= tmpl_data.title %>'
	},

	Chat: {

		tabs: '<ul id="chat-tabs"></ul>',
		rooms: '<div id="chat-rooms"></div>',
		rosters: '<div id="chat-rosters"></div>',

		tab:  '<li class="<%= tmpl_data.roomType %>">'
				+ '<a class="label"><% if (tmpl_data.privateUserChat) { print("<i class=\'fa fa-user-secret\'></i>"); } else { print("<i class=\'fa fa-users\'></i>"); } %> <%= tmpl_data.name %></a>'
				+ '<span class="unread"></span><% if (tmpl_data.privateUserChat) { print("<span class=\'state\'></span>"); } %>'
				+ '<a class="btn tab_close"><i class="fa fa-times"></i></a>'
			+ '</li>',

		admin_msg: '<dt class="admin"><span class="label"><i class="fa fa-life-ring"></i> <%= tmpl_data.sender %> <%= tmpl_data.subject %></span><abbr title="<%= tmpl_data.time %>" data-timestamp="<%= tmpl_data.timestamp %>"><%= tmpl_data.time %></abbr></dt>'
					+ '<dd class="admin"><%= tmpl_data.message %></dd>',
		info_msg:  '<dt class="info"><span class="label"><i class="fa fa-info-circle"></i> <%= tmpl_data.subject %></span><abbr title="<%= tmpl_data.time %>" data-timestamp="<%= tmpl_data.timestamp %>"><%= tmpl_data.time %></abbr></dt>'
					+ '<dd class="info"><%= tmpl_data.message %></dd>',
		warn_msg: '<dt class="warn"><span class="label"><i class="fa fa-exclamation-triangle"></i> <%= tmpl_data.subject %></span><abbr title="<%= tmpl_data.time %>" data-timestamp="<%= tmpl_data.timestamp %>"><%= tmpl_data.time %></abbr></dt>'
					+ '<dd class="warn"><%= tmpl_data.message %></dd>',
		error_msg: '<dt class="error"><span class="label"><i class="fa fa-bomb"></i> <%= tmpl_data.subject %></span><abbr title="<%= tmpl_data.time %>" data-timestamp="<%= tmpl_data.timestamp %>"><%= tmpl_data.time %></abbr></dt>'
					+ '<dd class="error"><%= tmpl_data.message %></dd>',

		toolbar:  '<ul id="chat-toolbar">'
					+ '<li id="chat-emoticons-control" class="btn" data-toggle="tooltip" data-placement="bottom" title="<%= tmpl_data.tooltipEmoticons %>"><i class="fa fa-smile-o"></i></li>'
					+ '<li id="chat-clear-control" class="btn" data-toggle="tooltip" data-placement="bottom" title="<%= tmpl_data.tooltipClear %>"><i class="fa fa-trash-o"></i></li>'
					+ '<li id="chat-sound-control" class="btn" data-toggle="tooltip" data-placement="bottom" title="<%= tmpl_data.tooltipSound %>"><i class="fa fa-volume-up"></i><i class="fa fa-volume-off"></i></li>'
					+ '<li id="chat-autoscroll-control" class="btn" data-toggle="tooltip" data-placement="bottom" title="<%= tmpl_data.tooltipAutoscroll %>"><i class="fa fa-arrows-v"></i></li>'
					+ '<li id="chat-info_msg-control" class="btn" data-toggle="tooltip" data-placement="bottom" title="<%= tmpl_data.tooltipStatusmessage %>"><i class="fa fa-info-circle"></i></li>'
					+ '<li id="chat-usercount" data-toggle="tooltip" data-placement="bottom" title="<%= tmpl_data.tooltipUsercount %>">'
						+ '<i style="display: inline;" class="fa fa-user-times"></i>'
						+ '<span class="display"></span>'
					+ '</li>'
				+ '</ul>',

		Context: {

			menulinks: '<li class="<%= tmpl_data.class %>" role="presentation">'
						+ '<a role="menuitem" tabindex="-1"><%= tmpl_data.label %></a>'
					 + '</li>',

			kickModal: '<label><%= tmpl_data._label %></label>'
					 + '<input type="text" />'
					 + '<a class="btn btn-msos"><i class="fa fa-minus-circle"></i></a>',

			banModal: '<label><%= tmpl_data._label %></label>'
					+ '<input type="text" />'
					+ '<a class="btn btn-msos"><i class="fa fa-ban"></i></a>',

			subjectModal: '<label><%= tmpl_data._label %></label>'
						+ '<input type="text" />'
						+ '<a class="btn btn-msos"><i class="fa fa-paper-plane-o"></i></a>',

			adminMessageReason: '<p><%= tmpl_data._action %></p><% if (tmpl_data.is_reason) { print("<p>" + tmpl_data._reason + "</p>"); } %>'
		}
	},

	Room: {

		subject:  '<dt><span class="subject label"><%= tmpl_data.roomName %></span><abbr title="<%= tmpl_data.time %>" data-timestamp="<%= tmpl_data.timestamp %>"><%= tmpl_data.time %></abbr></dt>'
				+ '<dd class="subject"><%= tmpl_data._roomSubject %> <%= tmpl_data.subject %></dd>'
	},

	Roster: {
		pane: '<div class="roster-pane"></div>',

		user: '<div class="user <%= tmpl_data.role %> <%= tmpl_data.affiliation %><% if (tmpl_data.is_client_user) { print(" owner"); } %>">'
				+ '<div class="label"><%= tmpl_data.displayNick %></div>'
				+ '<div class="role <%= tmpl_data.role %>" data-toggle="tooltip" title="<%= tmpl_data.tooltipRole %>"></div>'
				+ '<div class="ignore" data-toggle="tooltip" title="<%= tmpl_data.tooltipIgnored %>"></div>'
				+ '<div class="dropdownV3" id="<%= tmpl_data.user_dd_id %>">'
					+ '<button class="btn dropdownV3-toggle menu" type="button" id="<%= tmpl_data.user_dd_id %>_btn" data-toggle="dropdownV3">'
						+	'<span class="caret"></span>'
					+ '</button>'
					+ '<ul class="dropdownV3-menu" role="menu" aria-labelledby="<%= tmpl_data.user_dd_id %>_btn"></ul>'
				+ '</div>'
			+ '</div>'
	},

	Message: {
		pane: '<dl class="message-pane"></dl>',

		item: '<dt class="msg"><span class="label" title="<%= tmpl_data.name %>"><i class="fa fa-comment-o"></i> <%= tmpl_data.displayName %></span><abbr title="<%= tmpl_data.time %>" data-timestamp="<%= tmpl_data.timestamp %>"><%= tmpl_data.time %></abbr></dt>'
			+ '<dd><%= tmpl_data.message %></dd>'
	},

	PresenceError: {
		enterPassword:	'<h3><%= tmpl_data.roomName %> <%= tmpl_data._label %></h3>'
					  + '<div><%= tmpl_data._labelPassword %></div>',

		nicknameConflict: '<h3><%= tmpl_data._label %></h3>'
						+ '<div><%= tmpl_data._labelNickname %></div>',

		displayError: '<strong><%= tmpl_data._error %></strong>'
	}
};

candy.wrapper.init = function (div_wrap, login_btn, enter_btn, msg_input, user_input, pass_input, nick_input, members_btn, toolbar_btn, options) {
	"use strict";

	var temp_cw = 'candy.wrapper.init -> ',
		_cwd = candy.wrapper.dom;

	msos.console.debug(temp_cw + 'start.');

	if (!candy.wrapper.connected) {

		// Our Candy Chat jQuery nodes
		// (not contained within the Candy Chat app)
		_cwd.chat_container = div_wrap;
		_cwd.chat_login = login_btn;
		_cwd.chat_enter = enter_btn;
		_cwd.chat_msg = msg_input;
		_cwd.chat_user = user_input;
		_cwd.chat_pass = pass_input;
		_cwd.chat_nick = nick_input;
		_cwd.chat_members_btn = members_btn;
		_cwd.chat_toolbar_btn = toolbar_btn;

		candy.view.init();
		candy.core.init(options);

		// Start the app
		candy.core.connect(options.host || undefined);

		// Confirm candy initiated
		candy.wrapper.connected = true;

	} else {
		msos.console.warn(temp_cw + 'already initialized.');
	}

	msos.console.debug(temp_cw + 'done!');
};

candy.wrapper.set_quadtree_room = function (qtree) {
	"use strict";

	var temp_sr = 'candy.wrapper.set_quadtree_room -> ';

	msos.console.debug(temp_sr + 'start, for: ' + qtree);




	msos.console.debug(temp_sr + 'done!');
};