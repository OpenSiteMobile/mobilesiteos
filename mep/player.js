// Copyright Notice:
//					player.js
//			Copyright©2012-2015 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
//
// Loosely based on MediaElementPlayer by John Dyer (http://j.hn)

/*global
    msos: false,
    mep: false,
    jQuery: false,
    jquery: false,
    Modernizr: false,
    _: false
*/

// Modified for use thru MobileSiteOS
msos.provide("mep.player");
msos.require("msos.fitmedia");

if (msos.config.verbose) { msos.require("mep.debug"); }

mep.player.version = new msos.set_version(15, 12, 8);


// Start by loading our mep/player.css stylesheet
mep.player.css = new msos.loader();
mep.player.css.load('mep_css_player', msos.resource_url('mep', 'css/player.css'));

// Only load css3 if supported
if (Modernizr.cssgradients) {
	mep.player.css.load('mep_css_gradient',	msos.resource_url('mep', 'css/gradient.css'));
}

mep.player.mepIndex = 0;
mep.player.meIndex = 0;
mep.player.players = {};

mep.player.defaults = function () {
	"use strict";

	this.org_version = '2.18.2';		// from original v2.10.3 + version updates
	this.name = 'mep.player';
	this.hasFocus = false;
	this.isLoaded = false;
	this.controlsAreVisible = true;
	this.controlsEnabled = true;
	this.error = 'unknown';

	this.media = null;
	this.controlsTimer = null;

	this.support = {};
	this.plugins = {};
	this.controls = {};
	this.features = [];

	this.config = {
		success_function: function (player_object) {
			msos.console.debug(player_object.name + ' - success_function -> called: ' +  player_object.id);
		},

		error_function:	 function (player_object) {
			msos.console.debug(player_object.name + ' - error_function -> called: ' +  player_object.id);
		}
	};

	this.load_features = function (feat) {
		var i = 0,
			temp_lf = 'mep.player.load_features -> ',
			module = '';

		msos.console.debug(temp_lf + 'start, input features:', feat);

		if (!this.support.html5_media) {
			// No HTML5, so detect available Video && Audio plugins
			msos.require("mep.plugins");
		}

		for (i = 0; i < feat.length; i += 1) {
			module = 'mep.' + feat[i];
			// Load the corresponding module, if not already loaded
			if (!mep || !mep[feat[i]]) {
				if (feat[i] === 'volume' && msos.config.browser.touch) { continue; }	// Skip for mobile (use native instead)
				msos.require(module);
			}
			this.features.push(feat[i]);
		}

		// Add some event tracking
		if (mep.debug) { this.features.unshift('debug'); }

		msos.console.debug(temp_lf + 'done!');
	};

	this.init = function () {
		var ply_obj = this,
			cfg = ply_obj.config,
			success_func = cfg.success_function,
			error_func = cfg.error_function, 
			tagName = ply_obj.node.tagName.toLowerCase(),
			player_title = '',
			cloned;

		msos.console.debug(ply_obj.name + ' - init -> start, tag: ' + tagName);

		jQuery.extend(
			cfg,
			{
				success_function: function () {
					mep.player.controls(ply_obj);

					if (typeof success_func === 'function') {
						success_func(ply_obj);
					}
				},
				error_function: function () {
					ply_obj.controls.hide();

					// Tell user that the file cannot be played
					if (typeof error_func === 'function') {
						error_func(ply_obj);
					}
				}
			}
		);

		if (!cfg.timeFormat) {
			// Generate the time format according to cfg
			cfg.timeFormat = 'mm:ss';
	
			if (cfg.alwaysShowHours) {
				cfg.timeFormat = 'hh:mm:ss';
			}
	
			if (cfg.showTimecodeFrameCount) {
				cfg.timeFormat += ':ff';
			}
		}

		mep.player.utils.calculateTimeFormat(
			0,
			cfg
		);

		ply_obj.$node.fitMedia();

		ply_obj.isVideo = (tagName !== 'audio');
		ply_obj.tagName = tagName;

		player_title = ply_obj.isVideo ? cfg.i18n.video_player : cfg.i18n.audio_player,

		jQuery('<span class="visually_hidden">' + player_title + '</span>').insertBefore(ply_obj.$node);

		// Remove native controls
		ply_obj.$node.removeAttr('controls');

		// unique ID
		ply_obj.id = 'mep_' + (mep.player.mepIndex += 1);

		// 'container' is now the FidVids node
		// (see mep.player.build)
		ply_obj.container = ply_obj.$node.parent();

		// Add defining class, id
		ply_obj.container
			.attr({ 'id': ply_obj.id, tabindex: 0, role: 'application', 'aria-label': player_title })
			.addClass('mejs-container notranslate')
			.focus(
				function () {
					if (!ply_obj.controlsAreVisible) {
						ply_obj.showControls(true);
						ply_obj.play_pause.focus();
					}
				}
			);

		// Build out our container w/controls, etc.
		ply_obj.layers			= jQuery('<div class="mejs-layers">');
		ply_obj.controls		= jQuery('<div class="mejs-controls">');

		// Isolate the controls div from other layers
		ply_obj.controls.bind(
			'click',
			msos.do_nothing
		);

		// Place it in DOM
		ply_obj.container.append(
			ply_obj.layers,
			ply_obj.controls
		);

		// Add classes for user and content
		ply_obj.container.addClass((ply_obj.isVideo ? 'mejs-video ' : 'mejs-audio '));

		// Clone original node
		cloned = ply_obj.$node.clone();

		// Place our cloned node in correct position
		ply_obj.container.prepend(cloned);

		// Remove the original node
		ply_obj.$node.remove();

		// Reset our html5 video/audio node
		ply_obj.$node	= cloned;
		ply_obj.node	= cloned[0];

		mep.player.run(ply_obj);

		// controls are shown when loaded
		ply_obj.container.trigger('controlsshown');

		msos.console.debug(ply_obj.name + ' - init -> done!');
	};

	this.showControls = function (doAnimation) {
		var ply_obj = this,
			scl = ' - showControls -> ';

		doAnimation = doAnimation === undefined || doAnimation;

		if (ply_obj.controlsAreVisible) {
			if (msos.config.verbose) {
				msos.console.debug(ply_obj.name + scl + 'already visible.');
			}
			return;
		}

		msos.console.debug(ply_obj.name + scl + 'start, animation: ' + doAnimation);

		if (doAnimation) {
			ply_obj.controls
				.css('visibility', 'visible')
				.stop(true, true).fadeIn(200, function () {
					  ply_obj.controlsAreVisible = true;
					  ply_obj.container.trigger('controlsshown');
				});

			// any additional controls people might add and want to hide
			ply_obj.container.find('.mejs-control')
				.css('visibility', 'visible')
				.stop(true, true).fadeIn(200, function () { ply_obj.controlsAreVisible = true; });

		} else {
			ply_obj.controls
				.css('visibility', 'visible')
				.css('display', 'block');

			// any additional controls people might add and want to hide
			ply_obj.container.find('.mejs-control')
				.css('visibility', 'visible')
				.css('display', 'block');

			ply_obj.controlsAreVisible = true;
			ply_obj.container.trigger('controlsshown');
		}

		msos.console.debug(ply_obj.name + scl + 'done!');
	};

	this.hideControls = function (doAnimation) {
		var ply_obj = this,
			hcl = ' - hideControls -> ';

		doAnimation = doAnimation === undefined || doAnimation;

		msos.console.debug(ply_obj.name + hcl + 'start, animation: ' + doAnimation);

		if (!ply_obj.controlsAreVisible
		  || ply_obj.config.alwaysShowControls
		  || ply_obj.keyboardAction) { return; }

		if (doAnimation) {

			// fade out main controls
			ply_obj.controls.stop(true, true).fadeOut(200, function () {
				jQuery(this)
					.css('visibility', 'hidden')
					.css('display', 'block');

				ply_obj.controlsAreVisible = false;
				ply_obj.container.trigger('controlshidden');
			});

		} else {
			// hide main controls
			ply_obj.controls
				.css('visibility', 'hidden')
				.css('display', 'block');

			ply_obj.controlsAreVisible = false;
			ply_obj.container.trigger('controlshidden');
		}
		msos.console.debug(ply_obj.name + hcl + 'done!');
	};

	this.startControlsTimer = function (timeout) {
		var ply_obj = this;

		timeout = timeout !== undefined ? timeout : 1500;

		ply_obj.killControlsTimer('start');

		ply_obj.controlsTimer = setTimeout(
			function () {
				if (msos.config.verbose) {
					msos.console.debug(ply_obj.name + ' - startControlsTimer -> fired');
				}
				ply_obj.hideControls();
				ply_obj.killControlsTimer('hide');
			},
			timeout
		);
	};

	this.killControlsTimer = function () {
		var ply_obj = this;

		if (ply_obj.controlsTimer !== null) {
			clearTimeout(ply_obj.controlsTimer);
			delete ply_obj.controlsTimer;
			ply_obj.controlsTimer = null;
		}
	};

	this.disableControls = function () {
		var ply_obj = this;

		ply_obj.killControlsTimer();
		ply_obj.hideControls(false);
		ply_obj.controlsEnabled = false;
	};

	this.enableControls = function () {
		var ply_obj = this;

		ply_obj.showControls(false);
		ply_obj.controlsEnabled = true;
	};

	this.total_ctrls_width = 0;
	this.set_rail_width = 0;

	this.setControlsSize = function () {
		var scs = ' - setControlsSize -> ',
			ply_obj = this,
			others = ply_obj.rail.siblings(),
			lastControl = others.last(),
			lastControlPosition = null;

		msos.console.debug(ply_obj.name + scs + 'start.');

		ply_obj.controls.show();	// make sure controls are displayed

		// Zero out (storesfinised values)
		ply_obj.total_ctrls_width = 0;
		ply_obj.set_rail_width = 0;

		// Attempt to autosize: find the size of all the other controls besides the rail (+ 1 is fudge factor)
		others.each(
			function () {
				if (jQuery(this).css('position') !== 'absolute') {
					ply_obj.total_ctrls_width += jQuery(this).outerWidth(true) + 1;
				}
			}
		);

		if (msos.config.verbose) {
			msos.console.debug(ply_obj.name + scs + 'button width total: ' + ply_obj.total_ctrls_width);
		}

		// fit the rail into the remaining space
		ply_obj.set_rail_width = ply_obj.controls.width() - ply_obj.total_ctrls_width - (ply_obj.rail.outerWidth(true) - ply_obj.rail.width());

		msos.console.debug(ply_obj.name + scs + 'auto-size, rail width: ' + ply_obj.set_rail_width);

		// Resize the rail (added 6/9/14)
		do {	
			// outer area
			ply_obj.rail.width(ply_obj.set_rail_width);
			// dark space
			ply_obj.total.width(ply_obj.set_rail_width - (ply_obj.total.outerWidth(true) - ply_obj.total.width()));				

			if (lastControl.css('position') !== 'absolute') {
				lastControlPosition = lastControl.position();				
				ply_obj.set_rail_width -= 1;			
			}

		} while (lastControlPosition !== null
			  && lastControlPosition.top > 0
			  && ply_obj.set_rail_width > 0);

		if (ply_obj.setProgressRail) { ply_obj.setProgressRail(); }
		if (ply_obj.setCurrentRail)  { ply_obj.setCurrentRail();  }

		msos.console.debug(ply_obj.name + scs + 'done!');
	};

	this.changeSkin = function (className) {
		this.container[0].className = 'mejs-container ' + className;
		this.setControlsSize();
	};

	this.play = function () {
		msos.console.debug(this.name + ' - play -> fired.');
		this.load();	// added 6/9/14
		this.media.play();
	};

	this.pause = function () {
		msos.console.debug(this.name + ' - pause -> fired.');
		try {
			this.media.pause();
		} catch (e) {
			msos.console.warn(this.name + ' - pause -> failed:' + e.message);
		}	// added 6/9/14
	};

	this.load = function () {
		if (!this.isLoaded) { this.media.load(); }
		this.isLoaded = true;		// added 6/9/14
	};

	this.setMuted = function (muted) {
		this.media.setMuted(muted);
	};

	this.setCurrentTime = function (time) {
		this.media.setCurrentTime(time);
	};

	this.getCurrentTime = function () {
		return this.media.currentTime;
	};

	this.setVolume = function (volume) {
		this.media.setVolume(volume);
	};

	this.getVolume = function () {
		return this.media.volume;
	};

	this.setSrc = function (src) {
		this.media.setSrc(src);
	};

	this.remove = function () {
		var ply_obj = this;

		if (ply_obj.media.pluginType === 'flash') {
			ply_obj.media.remove();
		} else if (ply_obj.media.pluginTyp === 'native') {
			ply_obj.media.prop('controls', true);
		  }
	};
};

mep.player.html5_interface = function () {
	"use strict";

	this.pluginType = 'native';
	this.isFullScreen = false;

	this.setCurrentTime = function (time) {
		this.currentTime = time;
	};

	this.setMuted = function (muted) {
		this.muted = muted;
	};

	this.setVolume = function (volume) {
		this.volume = volume;
	};

	// for parity with the plugin versions
	this.stop = function () {
		this.pause();
	};

	// This can be a url string
	// or an array [{ src:'file.mp4', type:'video/mp4' }, { src:'file.webm', type:'video/webm' }]
	this.setSrc = function (url) {

		// Fix for IE9 which can't set .src when there are <source> elements. Awesome, right?
		var existingSources = this.getElementsByTagName('source'),
			i,
			media;

		while (existingSources.length > 0) {
			this.removeChild(existingSources[0]);
		}

		if (typeof url === 'string') {
			this.src = url;
		} else {
			for (i = 0; i < url.length; i += 1) {
				media = url[i];
				if (this.canPlayType(media.type)) {
					this.src = media.src;
					break;
				}
			}
		}
	};

	this.setVideoSize = function (width, height) {
		this.width  = width;
		this.height = height;
	};

	return this;
};

mep.player.run = function (ply_obj) {
	"use strict";

	var temp_pr = 'mep.player.run -> ',
		playback,
		on_youtube_load,
		on_plugins_load;

	msos.console.debug(temp_pr + 'start.');

	// Test for HTML5 and plugin capabilities
	playback = mep.player.determinePlayback(ply_obj);

	if (playback.method === 'youtube') {

		on_youtube_load = function () {
			mep.player.create(ply_obj, playback, ply_obj.config);
		};

		msos.console.debug(temp_pr + 'loading youtube code!');
		msos.require("mep.youtube", on_youtube_load);

	} else if (playback.method !== 'waiting') {

		// Ready, so create the shim element
		mep.player.create(ply_obj, playback, ply_obj.config);

	} else {

		// Re-run this function when 'mep.plugins' is loaded
		on_plugins_load = function () {
			mep.player.run(ply_obj);
		};

		msos.require("mep.plugins", on_plugins_load);
	  }

	msos.console.debug(temp_pr + 'done!');
};

mep.player.determinePlayback = function (ply_obj) {
	"use strict";

	var html5_elm = ply_obj.node,
		temp_pb = 'mep.player.determinePlayback -> ',
		mediaFiles = [],
		i, j, k, l, n,
		type,
		result = {
			method: '',
			url: '',
			htmlMediaElement: html5_elm,
			isVideo: ply_obj.isVideo
		},
		pluginName,
		pluginTypes,
		pluginInfo,
		src = ply_obj.node.getAttribute('src') || '',
		db_note = 'na',
		media;

	msos.console.debug(temp_pb + 'start.');

	src = msos.var_is_empty(src) ? null : src;

	if (src !== null) {
		type = mep.player.utils.formatType(src, html5_elm.getAttribute('type'));
		mediaFiles.push({ 'type': type, 'url': src });
		db_note = 'src';

	// then test for <source> elements
	} else {
		// test <source> types to see if they are usable
		for (i = 0; i < html5_elm.childNodes.length; i += 1) {
			n = html5_elm.childNodes[i];
			if (n.nodeType === 1 && n.tagName.toLowerCase() === 'source') {
				src = n.getAttribute('src');
				type = mep.player.utils.formatType(src, n.getAttribute('type'));
				media = n.getAttribute('media');

				if (!media || !window.matchMedia || (window.matchMedia && window.matchMedia(media).matches)) {
					mediaFiles.push({ 'type': type, 'url': src });
				}

				db_note = 'source';
			}
		}
	}

	if (msos.config.verbose) {
		msos.console.debug(temp_pb + 'by: ' + db_note + ', mediaFiles: ', mediaFiles);
	}

	// test for native HTML5 playback first
	if (ply_obj.support.html5_media && (ply_obj.config.mode === 'auto' || ply_obj.config.mode === 'native')) {

		db_note = 'native playback, mode: ' + ply_obj.config.mode;

		// Go thru media types and see what
		for (i = 0; i < mediaFiles.length; i += 1) {
			if (mediaFiles[i].type === "video/m3u8"
			 || html5_elm.canPlayType(mediaFiles[i].type).replace(/no/, '') !== ''
			 // special case for Mac/Safari 5.0.3 which answers '' to canPlayType('audio/mp3') but 'maybe' to canPlayType('audio/mpeg')
			 || html5_elm.canPlayType(mediaFiles[i].type.replace(/mp3/,'mpeg')).replace(/no/, '') !== ''
			 // special case for m4a supported by detecting mp4 support
			 || html5_elm.canPlayType(mediaFiles[i].type.replace(/m4a/,'mp4')).replace(/no/, '') !== '') {
					result.method = 'native';
					result.url = mediaFiles[i].url;
					break;
			}
		}

		if (result.method === 'native') {
			if (result.url !== null) {
				html5_elm.src = result.url;
			}

			msos.console.debug(temp_pb + 'done, ' + db_note + ', result: ', result);
			return result;
		}
	}

	if (mep && mep.plugins) {

		// if native playback didn't work, then test plugins
		if (ply_obj.config.mode === 'auto'
		 || ply_obj.config.mode === 'shim') {

			db_note = 'plugin playback, mode: ' + ply_obj.config.mode;

			for (i = 0; i < mediaFiles.length; i += 1) {
				type = mediaFiles[i].type;

				// test all plugins
				for (j = 0; j < ply_obj.config.plugins.length; j += 1) {

					pluginName = ply_obj.config.plugins[j];
					// test version of plugin (for future features)
					pluginTypes = ply_obj.config.plugin_capabilities[pluginName];

					for (k = 0; k < pluginTypes.length; k += 1) {
						pluginInfo = pluginTypes[k];
						// test if user has the correct plugin version
						// for youtube/vimeo
						if (pluginInfo.version === null
						 || mep.plugins.hasPluginVersion(pluginName, pluginInfo.version)) {

							// test for plugin playback types
							for (l = 0; l < pluginInfo.types.length; l += 1) {
								// find plugin that can play the type
								if (type.toLowerCase() === pluginInfo.types[l].toLowerCase()) {
									result.method = pluginName;
									result.url = mediaFiles[i].url;
									msos.console.debug(temp_pb + 'done, ' + db_note + ', result: ', result);
									return result;
								}
							}
						}
					}
				}
			}
		}

		if (result.method === 'native') {

			msos.console.debug(temp_pb + 'done, ' + db_note + ', result: ', result);
			return result;
		}

		// what if there's nothing to play? just grab the first available
		if (result.method === '' && mediaFiles.length > 0) {
			result.url = mediaFiles[0].url;
		}

		db_note = 'hail mary, mode: ' + ply_obj.config.mode;
		msos.console.debug(temp_pb + 'done, ' + db_note + ', result: ', result);
		return result;

	}

	// We aren't ready
	msos.console.debug(temp_pb + 'waiting to load mep.plugins!');
	return { method: 'waiting' };
};

mep.player.create = function (ply_obj, ply_bck) {
	"use strict";

	var temp_pc = 'mep.player.create',
		html5_elm = ply_obj.node,
		html5_intface = new mep.player.html5_interface(),
		poster =	html5_elm.getAttribute('poster'),
		autoplay =	html5_elm.getAttribute('autoplay'),
		preload =	html5_elm.getAttribute('preload'),
		controls =	html5_elm.getAttribute('controls'),
		m;

	msos.console.debug(temp_pc + ' -> start.');

	// clean up attributes	
	poster =	  msos.var_is_null(poster) ? '' : poster;
	preload =	 (msos.var_is_null(preload)  || preload  === 'false') ? 'none' : preload;

	autoplay =	!(msos.var_is_null(autoplay) || autoplay === 'false');
	controls =	!(msos.var_is_null(controls) || controls === 'false');

	ply_bck.url = (ply_bck.url !== null) ? msos.absolute_url(ply_bck.url) : '';

	if (ply_bck.method === 'native') {

		// Add methods to video object to bring it into parity with Flash Object
		for (m in html5_intface) {
			if (html5_intface.hasOwnProperty(m)) {
				html5_elm[m] = html5_intface[m];
			}
		}

		// Set our media interface (it is the video/audio node for HTML5)
		ply_obj.media = html5_elm;

		// fire success code
		ply_obj.config.success_function();

	} else if (ply_bck.method !== '' && mep.plugins) {

		// create plugin to mimic HTMLMediaElement
		mep.plugins.create(ply_obj, ply_bck, poster, autoplay, preload, controls);

	} else {
		msos.console.warn(temp_pc + ' -> failed!');
		mep.player.createErrorMessage(ply_obj, ply_bck, poster);
	  }

	msos.console.debug(temp_pc + ' -> done, playback: ' + ply_bck.method);
};

mep.player.createErrorMessage = function (ply_obj, playback, poster) {
	"use strict";

	var dl_txt = ply_obj.config.i18n.click_to_download,
		inner_tag = (poster !== '')
			? '<a href="' + playback.url + '"><img src="' + poster + '" title="' + dl_txt + '" alt="' + dl_txt + '" /></a>'
			: '<a href="' + playback.url + '"><span>' + dl_txt + '</span></a>',
		errorContainer = jQuery('<div class="me-cannotplay">' + inner_tag + '</div>');

	ply_obj.container.prepend(errorContainer);
	ply_obj.$node.css('display', 'none');

	ply_obj.config.error_function();
};

// Sets up all controls and events
mep.player.controls = function (ply_obj) {
	"use strict";

	var temp_pc = 'mep.player.controls',
		feat = ply_obj.features,
		$media = jQuery(ply_obj.media),
		i,
		func_name,
		func_build,
		duration = null,
		on_mouseenter,
		on_mousemove;

	// make sure it can't create itself again if a plugin reloads
	if (ply_obj.created) {
		msos.console.warn(temp_pc + ' -> plugin already created!');
		return;
	}

	msos.console.debug(temp_pc + ' -> start, features: ', feat);

	ply_obj.created = true;

	// add user-defined features/controls
	for (i = 0; i < feat.length; i += 1) {

		if (mep[feat[i]]
		 && mep[feat[i]].start
		 && typeof mep[feat[i]].start === 'function') {
			mep[feat[i]].start(ply_obj);

			func_name = 'build' + feat[i];
			func_build = ply_obj.controls[func_name] || null;

			if (func_build && typeof func_build === 'function') {
				func_build(ply_obj);
				msos.console.debug(temp_pc + ' -> executed: ' + func_name);
			} else {
				msos.console.warn(temp_pc + ' -> missing build function: ' + func_name);
			}
		} else {
			msos.console.warn(temp_pc + ' -> missing module: ' + 'mep.' + feat[i]);
		}
	}

	// Position controls for available space, given the loaded features
	ply_obj.setControlsSize();

	// controls fade
	if (ply_obj.isVideo) {

		if (msos.config.browser.touch) {

			// for touch devices (iOS, Android)
			// show/hide without animation on touch

			$media.bind(
				'touchstart',
				function () {
					// toggle controls
					if (ply_obj.controlsAreVisible) {
						ply_obj.hideControls(false);
					} else {
						if (ply_obj.controlsEnabled) {
							ply_obj.showControls(false);
						}
					  }
				}
			);

		} else {

			// click controls
			on_mouseenter = function () {
				if (ply_obj.controlsEnabled) {
					if (!ply_obj.config.alwaysShowControls) {							
						ply_obj.killControlsTimer('enter');
						ply_obj.showControls();
						ply_obj.startControlsTimer(2500);
					}
				}
			};

			on_mousemove = function () {
				if (ply_obj.controlsEnabled) {
					if (!ply_obj.controlsAreVisible) {
						ply_obj.showControls();
					}
					if (!ply_obj.config.alwaysShowControls) {
						ply_obj.startControlsTimer(2500);
					}
				}
			};

			// click to play/pause
			$media.click(
				function (e) {
					msos.do_nothing(e);
					msos.console.debug(temp_pc + ' - click -> play/pause fired.');
					if (ply_obj.config.clickToPlayPause) {
						if (ply_obj.media.paused) {
							ply_obj.media.play();
						} else {
							ply_obj.media.pause();
						  }
					}
				}
			);

			// show/hide controls
			ply_obj.container
				.bind(
					'mouseenter',
					_.throttle(on_mouseenter, 500)
				)
				.bind(
					'mousemove',
					_.throttle(on_mousemove, 500)
				)
				.bind(
					'mouseleave',
					function () {
						if (ply_obj.controlsEnabled) {
							if (!ply_obj.node.paused && !ply_obj.config.alwaysShowControls) {
								ply_obj.startControlsTimer(1000);
							}
						}
					}
				);
		}
	}

	// EVENTS

	// FOCUS: when a video starts playing, it takes focus from other players (possibily pausing them)
	ply_obj.media.addEventListener(
		'play',
		function () {
			var plr = '',
				p;

			// go through all other players
			for (plr in mep.player.players) {
				if (mep.player.players.hasOwnProperty(plr)) {

					p = mep.player.players[plr];

					if (p.id !== ply_obj.id
					 && ply_obj.config.pauseOtherPlayers
					 && !p.paused
					 && !p.ended) {
						p.pause();
					}

					p.hasFocus = false;
				}
			}

			ply_obj.hasFocus = true;
		},
		false
	);

	// Ended for all
	ply_obj.media.addEventListener(
		'ended',
		function () {

			if (msos.config.verbose) {
				msos.console.debug(temp_pc + ' -> ended triggered!');
			}

			if(ply_obj.config.autoRewind) {
				try {
					ply_obj.media.setCurrentTime(0);
				} catch (e) {
					msos.console.warn(temp_pc + ' -> setCurrentTime error: ' + e);
				  }
			}

			ply_obj.media.pause();

			if (ply_obj.setProgressRail) { ply_obj.setProgressRail(); }
			if (ply_obj.setCurrentRail)  { ply_obj.setCurrentRail();  }

			if (ply_obj.config.loop_tf) {
				ply_obj.media.play();
			} else if (!ply_obj.config.alwaysShowControls && ply_obj.controlsEnabled) {
				ply_obj.showControls();
			  }
		},
		false
	);

	// resize on the first play
	ply_obj.media.addEventListener(
		'loadedmetadata',
		function () {
			if (msos.config.verbose) {
				msos.console.debug(temp_pc + ' -> loadedmetadata triggered!');
			}

			if (ply_obj.controls.updateDuration) {
				ply_obj.controls.updateDuration();
			}
			if (ply_obj.controls.updateCurrent) {
				ply_obj.controls.updateCurrent();
			}
		},
		false
	);

	ply_obj.media.addEventListener(
		'timeupdate',
		function () {
			if (duration !== ply_obj.media.duration) {
				duration = ply_obj.media.duration;
				mep.player.utils.calculateTimeFormat(
					duration,
					ply_obj.config
				);
			}
		},
		false
	);

	msos.console.debug(temp_pc + ' -> done!');
};

/*
	Utility methods
*/
mep.player.utils = {

	encodeUrl: function (url) {
		"use strict";

		return encodeURIComponent(url);
	},

	formatType: function (url, type) {
		"use strict";

		var output;

		// if no type is supplied, fake it with the extension
		if (url && !type) {
			output = mep.player.utils.getTypeFromFile(url);
		} else {
			// only return the mime part of the type in case the attribute contains the codec
			// see http://www.whatwg.org/specs/web-apps/current-work/multipage/video.html#the-source-element
			// `video/mp4; codecs="avc1.42E01E, mp4a.40.2"` becomes `video/mp4`
			if (type && type.indexOf(';') > 0) {
				output = type.substr(0, type.indexOf(';'));
			} else {
				output = type;
			}
		}
		return output;
	},

	getTypeFromFile: function (url) {
		"use strict";

		url = url.split('?')[0];

		var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase(),
			av = /(mp4|m4v|ogg|ogv|m3u8|webm|webmv|flv|wmv|mpeg|mov)/gi.test(ext) ? 'video/' : 'audio/';

		return mep.player.utils.getTypeFromExtension(ext, av);
	},

	getTypeFromExtension: function (ext, av) {
		"use strict";

		av = av || '';

		switch (ext) {
			case 'mp4':
			case 'm4v':
			case 'm4a':
			case 'f4v':
			case 'f4a':
				return av + 'mp4';
			case 'flv':
				return av + 'x-flv';
			case 'webm':
			case 'webma':
			case 'webmv':	
				return av + 'webm';
			case 'ogg':
			case 'oga':
			case 'ogv':	
				return av + 'ogg';
			case 'm3u8':
				return 'application/x-mpegurl';
			case 'ts':
				return av + 'mp2t';
			default:
				return av + ext;
		}
	},

	/*
	 * Calculate the time format to use. We have a default format set in the
	 * options but it can be imcomplete. We ajust it according to the media
	 * duration.
	 *
	 * We support format like 'hh:mm:ss:ff'.
	 */
	calculateTimeFormat: function(time, cfg) {
		"use strict";

		if (time < 0) { time = 0; }

		var temp_ct = 'mep.player.utils.calculateTimeFormat -> ',
			fps = cfg.framesPerSecond || 25,
			format = cfg.timeFormat,
			firstChar = format[0],
			firstTwoPlaces = (format[1] === format[0]),
			separatorIndex = firstTwoPlaces? 2 : 1,
			separator = ':',
			hours = Math.floor(time / 3600) % 24,
			minutes = Math.floor(time / 60) % 60,
			seconds = Math.floor(time % 60),
			frames = Math.floor(((time % 1) * fps).toFixed(3)),
			lis = [
				[frames, 'f'],
				[seconds, 's'],
				[minutes, 'm'],
				[hours, 'h']
			],
			required = false,
			len=lis.length,
			i = 0,
			j = 0,
			hasNextValue;

		msos.console.debug(temp_ct + 'start, time: ' + time + ', fps: ' + fps);

		// Try to get the separator from the format
		if (format.length < separatorIndex) {
			separator = format[separatorIndex];
		}

		for (i = 0; i < len; i += 1) {
			if (format.indexOf(lis[i][1]) !== -1) {
				required = true;
			} else if (required) {
				hasNextValue = false;
				for (j = i; j < len; j += 1) {
					if (lis[j][0] > 0) {
						hasNextValue = true;
						break;
					}
				}

				if (!hasNextValue) { break; }

				if (!firstTwoPlaces) {
					format = firstChar + format;
				}

				format = lis[i][1] + separator + format;

				if (firstTwoPlaces) {
					format = lis[i][1] + format;
				}

				firstChar = lis[i][1];
			}
		}
		cfg.currentTimeFormat = format;

		msos.console.debug(temp_ct + 'done, format: ' + format);
	},

	twoDigitsString: function (n) {
		"use strict";

		if (n < 10) {
			return '0' + n;
		}

		return String(n);
	},

	secondsToTimeCode: function (time, cfg) {
		"use strict";

		var fps,
			format,
			hours,
			minutes,
			seconds,
			frames,
			lis,
			res,
			i = 0;

		if (time < 0) { time = 0; }

		fps = cfg.framesPerSecond || 25;

		format = cfg.currentTimeFormat;
		hours = Math.floor(time / 3600) % 24;
		minutes = Math.floor(time / 60) % 60;
		seconds = Math.floor(time % 60);
		frames = Math.floor(((time % 1)*fps).toFixed(3));

		lis = [
			[frames, 'f'],
			[seconds, 's'],
			[minutes, 'm'],
			[hours, 'h']
		];

		res = format;

		for (i = 0; i < lis.length; i += 1) {
			res = res.replace(lis[i][1] + lis[i][1], this.twoDigitsString(lis[i][0]));
			res = res.replace(lis[i][1], lis[i][0]);
		}

		return res;
	}
};
