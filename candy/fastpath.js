/** File: fastpath.js (derived from CandyShop  script)
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

msos.provide("candy.fastpath");
msos.require("candy.core");
msos.require("candy.view");
msos.require("candy.jabber");
msos.require("msos.i18n.candy");


(function () {
	"use strict";

	var tmp_fp = 'candy.fastpath',
		_cu = candy.util,
		_cv = candy.view,
		_cj = candy.jabber,
		_i18n = msos.i18n.candy.bundle,
		_mcdbug = msos.console.debug,
		vbs = msos.config.verbose;

	candy.fastpath = {

		version: new msos.set_version(15, 10, 22),
		current_properties: {},

		registerEventHandlers: function (reh_conn) {

			function _add(fn, ns, name, type) {
				var sys_handler = reh_conn.addStropheHandler(fn, ns, name, type);

				sys_handler.describe = 'cb: candy fastpath';
			}

			//	 handler function,			namespace,				elem.	,type
			_add(candy.fastpath.IqCB,		Strophe.NS.WORKGROUP,	'iq',	'set');
			_add(candy.fastpath.PresCB,		Strophe.NS.CLIENT,		'presence');
			_add(candy.fastpath.MessCB,		Strophe.NS.CLIENT,		'message');
		},

		GetWorkgroups: function () {
			var gwp = '.GetWorkgroups -> ',
				_conn = candy.core._conn,
				iq;

			_mcdbug(tmp_fp + gwp + 'start.');

			iq = $iq(
				{
					type: 'get',
					to: "workgroup." + _conn.domain
				}
			).c(
				'workgroups',
				{
					jid: _conn.jid,
					xmlns: Strophe.NS.WORKGROUP
				}
			);

			_conn.sendIQ(
				iq,
				'get: workgroups',
				function (response) {
					jQuery(response).find('workgroup').each(
						function () {
							var curr_node = jQuery(this),
								jid = curr_node.attr('jid'),
								name = Strophe.getNodeFromJid(jid),
								chatRoom = 'workgroup-' + name + "@conference." + _conn.domain;

							_conn.send(
								$pres(
									{ to: jid }
								).c(
									'agent-status',
									{ 'xmlns': Strophe.NS.WORKGROUP }
								)
							);

							_cj.Room.Join(chatRoom);

							_conn.send(
								$pres(
									{ to: jid }
								).c(
									"status"
								).t(
									"Online"
								).up().c("priority").t("1")
							);

							_conn.sendIQ(
								$iq(
									{
										type: 'get',
										to: jid
									}
								).c(
									'agent-status-request',
									{
										xmlns: Strophe.NS.WORKGROUP
									}
								),
								'get: agent-status-request'
							);
						}
					);
				}
			);
			_mcdbug(tmp_fp + gwp + 'done!');
		},

		acceptOffer: function () {
			var ao = '.acceptOffer -> ',
				_conn = candy.core._conn,
				curr_prop = candy.fastpath.current_properties;

			_mcdbug(tmp_fp + ao + 'start.');

			_conn.send(
				$iq(
					{
						type: 'set',
						to: curr_prop.workgroupJid
					}
				).c(
					'offer-accept',
					{
						xmlns: Strophe.NS.WORKGROUP,
						jid: curr_prop.jid,
						id: curr_prop.id
					}
				)
			);

			_mcdbug(tmp_fp + ao + 'done!');
		},

		rejectOffer: function () {
			var ro = '.rejectOffer -> ',
				_conn = candy.core._conn,
				curr_prop = candy.fastpath.current_properties;

			_mcdbug(tmp_fp + ro + 'start.');

			_conn.send(
				$iq(
					{
						type: 'set',
						to: curr_prop.workgroupJid
					}
				).c(
					'offer-reject',
					{
						xmlns: Strophe.NS.WORKGROUP,
						jid: curr_prop.jid,
						id: curr_prop.id
					}
				)
			);

			_mcdbug(tmp_fp + ro + 'done!');
		},

		IqCB: function (iq) {

			iq = jQuery(iq);

			var iqc = '.IqCB -> ',
				self = candy.fastpath,
				_conn = candy.core._conn,
				workgroupJid = iq.attr('from'),
				workgroup = Strophe.getNodeFromJid(workgroupJid),
				props,
				accept_html,
				i = 0;

			_mcdbug(tmp_fp + iqc + 'start.');

			_conn.send(
				$iq(
					{
						type: 'result',
						to: iq.attr('from'),
						id: iq.attr('id')
					}
				)
			);

			iq.find('offer').each(
				function () {
					var id = jQuery(this).attr('id'),
						jid = jQuery(this).attr('jid').toLowerCase(),
						properties = {
							id: id,
							jid: jid,
							workgroupJid: workgroupJid
						};

					iq.find('value').each(
						function () {
							var name = jQuery(this).attr('name'),
								value = jQuery(this).text();

							properties[name] = value;
						}
					);

				if (vbs) {
					_mcdbug(tmp_fp + iqc + 'offer, properties > workgroup:', properties, workgroup);
				}

				//acceptRejectOffer(workgroup, properties);
				props = Object.getOwnPropertyNames(properties);

				for (i = 0; i < props.length; i += 1) {
					if (props[i] !== "id" && props[i] !== "jid" && props[i] !== "workgroupJid") {
						accept_html += '<p>' + props[i] + ' - ' + properties[props[i]] + '<p/>\n';
					}
				}

				self.current_properties = properties;

//					accept_html += '<input onclick="CandyShop.Fastpath.acceptOffer()" type="button" value="Accept" />'
//								+  '<input onclick="CandyShop.Fastpath.rejectOffer()" type="button" value="Reject" />'

			});

			iq.find('offer-revoke').each(
				function () {
					var id = jQuery(this).attr('id'),
						jid = jQuery(this).attr('jid').toLowerCase();

					msos.console.warn(tmp_fp + iqc + 'offer-revoked:', workgroup);
				}
			);

			_mcdbug(tmp_fp + iqc + 'done!');
			return true;
		},

		PresCB: function (presence) {
			var pcb = '.PresCB -> ',
				self = candy.fastpath,
				_conn = candy.core._conn,
				from,
				nick,
				workGroup,
				maxChats,
				free = true;

			_mcdbug(tmp_fp + pcb + 'start.');

			presence = jQuery(presence);

			if (presence.find('agent-status').length > 0
			 || presence.find('notify-queue-details').length > 0
			 || presence.find('notify-queue').length > 0) {

				from = _cu.getUnescapedJid(presence.attr('from'));
				nick = Strophe.getNodeFromJid(from);

				presence.find('agent-status').each(
					function () {
						workGroup = 'workgroup-' + Strophe.getNodeFromJid(jQuery(this).attr('jid')) + "@conference." + _conn.domain;

						presence.find('max-chats').each(
							function () {
								maxChats = jQuery(this).text();
							}
						);

						presence.find('chat').each(
							function () {
								free = false;

								var chat_node = jQuery(this),
									sessionID = chat_node.attr('sessionID'),
									sessionJid = sessionID + "@conference." + _conn.domain,
									sessionHash = (sessionJid),
									userID = chat_node.attr('userID'),
									startTime = chat_node.attr('startTime'),
									question = chat_node.attr('question'),
									username = chat_node.attr('username'),
									email = chat_node.attr('email'),
									text;

								if (workGroup) {	
									text = "Talking with " + username + " about " + question;
									_cv.Message.show(workGroup, nick, text);
								}
							}
						);
					}
				);

				presence.find('notify-queue-details').each(
					function () {
						var workGroup = 'workgroup-' + nick + "@conference." + _conn.domain,
							free = true,
							text;

						presence.find('user').each(
							function () {
								var user_node = jQuery(this),
									jid = user_node.attr('jid'),
									position,
									time,
									joinTime;

								user_node.find('position').each(
									function () {
										var pos_node = jQuery(this);

										position = pos_node.text() === "0" ? "first" : pos_node.text();
									}
								);

								user_node.find('time').each(
									function () {
										time = jQuery(this).text();
									}
								);

								user_node.find('join-time').each(
									function () {
										joinTime = jQuery(this).text();
									}
								);

								if (position && time && joinTime) {
									free = false;

									text = "A caller has been waiting for " + time + " secconds";
									alert('notify-queue-details not ready yet');
									// _cv.Message.add(workGroup, nick, text);
								}
							}
						);
					}
				);

				presence.find('notify-queue').each(
					function () {
						var workGroup = 'workgroup-' + nick + "@conference." + _conn.domain,
							free = true,
							count,
							oldest,
							waitTime,
							status,
							room_obj = candy.core.get_room_obj(workGroup),
							text;

						presence.find('count').each(
							function () {
								count = jQuery(this).text();
							}
						);

						presence.find('oldest').each(
							function () {
								oldest = jQuery(this).text();
							}
						);

						presence.find('time').each(
							function() {
								waitTime = jQuery(this).text();
							}
						);

						presence.find('status').each(
							function () {
								status = jQuery(this).text();
							}
						);

						if (count && oldest && waitTime && status) {
							free = false;

							text = "There are " + count + " caller(s) waiting for as long as " + waitTime + " seconds";
							if (room_obj) {
								_cv.Message.show(workGroup, nick, text);
							}
						}

						if (free && room_obj) {
							_cv.Message.show(workGroup, nick, "No waiting conversations");
						}
					}
				);
			}

			_mcdbug(tmp_fp + pcb + 'done!');
			return true;
		},

		MessCB: function (message) {
			var mcb = '.MessCB -> ',
				msg = jQuery(message),
				roomJid = msg.attr("from");

			_mcdbug(tmp_fp + mcb + 'start.');

			msg.find('invite').each(
				function () {
					var workgroupJid = jQuery(this).attr('from');

					msg.find('offer').each(
						function () {
							var contactJid = jQuery(this).attr('jid');

							_mcdbug(tmp_fp + mcb + 'offer, room jid: ' + roomJid + 'contact jid: ' + contactJid + ', workgroup jid: ' + workgroupJid);
							_cj.Room.Join(roomJid);
						}
					);
				}
			);

			_mcdbug(tmp_fp + mcb + 'done!');
			return true;
		}
	};

	// Fire GetWorkgroups when Strophe status reaches STROPHE.STATUS.CONNECTED
	jQuery(candy).on('candy:event:connect.status-5', candy.fastpath.GetWorkgroups);

}());