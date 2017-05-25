/*!
* MediaElement.js
* HTML5 <video> and <audio> shim and player
* http://mediaelementjs.com/
*
* Copyright 2010-2012, John Dyer (http://j.hn)
* Dual licensed under the MIT or GPL Version 2 licenses.
*
*/

/*global
    msos: false,
    jQuery: false,
    mep: false
*/

msos.provide("mep.contextmenu");

mep.contextmenu.version = new msos.set_version(17, 5, 21);


// Start by loading our contextmenu.css stylesheet
mep.contextmenu.css = new msos.loader();
mep.contextmenu.css.load(msos.resource_url('mep', 'css/contextmenu.css'));

mep.contextmenu.start = function (me_player) {
	"use strict";

	var temp_cts = 'mep.contextmenu.start';

	// options
	jQuery.extend(
		me_player.config,
		{ 'contextMenuItems': [
			{
				render: function (ply_obj) {
					// check for fullscreen plugin
					if (ply_obj.enterFullScreen === undefined) { return null; }

					if (ply_obj.isFullScreen) {
						return ply_obj.config.i18n.fullscreen_off;
					}
					return ply_obj.config.i18n.fullscreen_on;
				},
				click: function (ply_obj) {
					if (ply_obj.isFullScreen)	{ ply_obj.exitFullScreen();  }
					else						{ ply_obj.enterFullScreen(); }
				}
			},

			{
				render: function (ply_obj) {
					if (ply_obj.media.muted) {
						return ply_obj.config.i18n.mute_off;
					}
					return ply_obj.config.i18n.mute_on;
				},
				click: function (ply_obj) {
					if (ply_obj.media.muted)	{ ply_obj.setMuted(false); }
					else						{ ply_obj.setMuted(true);  }
				}
			},

			{ isSeparator: true },

			{
				render: function (ply_obj) {
					return ply_obj.config.i18n.download_video;
				},
				click: function (ply_obj) {
					window.location.href = ply_obj.media.currentSrc;
				}
			}
		]}
	);

	jQuery.extend(
		me_player.controls,
		{
			buildcontextmenu: function (ply_obj) {
				ply_obj.contextMenu = jQuery('<div class="mejs-contextmenu"></div>').appendTo(ply_obj.layers).hide();
				ply_obj.isContextMenuEnabled = true;
				ply_obj.contextMenuTimeout = null;

				ply_obj.container.bind(
					'contextmenu',
					function (e) {
						if (ply_obj.isContextMenuEnabled) {
							msos.do_nothing(e);
							ply_obj.renderContextMenu(e.clientX - 1, e.clientY - 1);
							return false;
						}
						return true;
					}
				);

				ply_obj.container.bind(
					'click',
					function () { ply_obj.contextMenu.hide(); }
				);

				ply_obj.contextMenu.bind(
					'mouseleave',
					function () { ply_obj.startContextMenuTimer(); }
				);

				ply_obj.startContextMenuTimer = function () {

					ply_obj.killContextMenuTimer();

					ply_obj.contextMenuTimer = setTimeout(
						function () {
							ply_obj.contextMenu.hide();
							ply_obj.killContextMenuTimer();
						},
						750
					);
				};

				ply_obj.killContextMenuTimer = function () {

					if (ply_obj.contextMenuTimer !== null) {
						clearTimeout(ply_obj.contextMenuTimer);
						ply_obj.contextMenuTimer = null;
					}
				};

				ply_obj.renderContextMenu = function (x, y) {
					var cfg = ply_obj.config,
						html = '',
						scroll = jQuery(document).scrollTop(),
						layer_pos = ply_obj.layers.offset(),
						x_adj = ply_obj.layers.width() - 160,
						y_adj = ply_obj.layers.height() - (100 + scroll),
						items = cfg.contextMenuItems,
						i = 0,
						il = items.length,
						rendered;

					msos.console.debug(temp_cts + ' - renderContextMenu -> called' + ', x: ' + x + ', offset x: ' + layer_pos.left + ', adj x: ' + x_adj + ', y: ' + y + ', offset y: ' + layer_pos.top + ', adj y: ' + y_adj
					);

					for (i = 0; i < il; i += 1) {
						if (items[i].isSeparator) {
							html += '<div class="mejs-contextmenu-separator"></div>';
						} else {
							rendered = items[i].render(ply_obj);
							if (rendered !== null) {
								html += '<div class="mejs-contextmenu-item" data-itemindex="' + i + '" id="element-' + (Math.random() * 1000000) + '">' + rendered + '</div>';
							}
						}
					}

					// Get relative x, y
					x = x - layer_pos.left;
					y = y - layer_pos.top;

					ply_obj.contextMenu
						.empty()
						.append(jQuery(html))
						.css({
							top:  (y + scroll) - (y > y_adj ?  80 : 5),
							left: x - (x > x_adj ? 150 : 5)
						})
						.show();

					ply_obj.contextMenu
						.find('.mejs-contextmenu-item')
						.each(
							function () {
								// which one is this?
								var $dom = jQuery(this),
									itemIndex = parseInt($dom.data('itemindex'), 10),
									item = cfg.contextMenuItems[itemIndex];

								// bind extra functionality?
								if (item.show !== undefined) { item.show($dom, ply_obj); }

								// bind click action
								$dom.click(
									function () {
										// perform click action
										if (item.click !== undefined) { item.click(ply_obj); }
										ply_obj.contextMenu.hide();
									}
								);
							}
						);

					setTimeout(
						function () { ply_obj.killControlsTimer('rev3'); },
						100
					);
				};
			}
		}
	);
};
