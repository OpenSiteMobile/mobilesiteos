
/*global
    msos: false,
    jQuery: false,
    candy: false
*/
msos.provide("candy.webrtc");
msos.require("candy.core");


candy.webrtc = {

	version: new msos.set_version(15, 9, 26),

	session: null,
    localStream: null,
    remoteStream: null,
    last_caller: null,
    AUTO_ACCEPT: false,

    reqVideoFeatures: [
        'urn:xmpp:jingle:apps:rtp:video', 'urn:xmpp:jingle:apps:rtp:audio',
        'urn:xmpp:jingle:transports:ice-udp:1', 'urn:xmpp:jingle:apps:dtls:0'
    ],

    chatJids: {},

    init: function () {
        var temp_in = 'candy.webrtc.init -> ',
			self = candy.webrtc,
			jingle = candy.core._conn.jingle,
			peerConfig = candy.core._opts.RTCPeerConfig;
			url = peerConfig.url || candy.core._opts.turnCredentialsPath || '',
			manager;

        if (!candy.core._conn.jingle) {
            msos.console.error(temp_in + 'jingle plugin not available!');
            return;
        }

		manager = candy.core._conn.jingle.manager;
/*
        $(document).on('message.jsxc',	self.onMessage);
        $(document).on('presence.jsxc',	self.onPresence);

        $(document).on('mediaready.jingle',		self.onMediaReady);
        $(document).on('mediafailure.jingle',	self.onMediaFailure);

        manager.on('incoming',		$.proxy(self.onCallIncoming,	self));
        manager.on('terminated',	$.proxy(self.onCallTerminated,	self));
        manager.on('ringing',		$.proxy(self.onCallRinging,		self));

        manager.on('peerStreamAdded',	$.proxy(self.onRemoteStreamAdded,	self));
        manager.on('peerStreamRemoved',	$.proxy(self.onRemoteStreamRemoved,	self));

        if (candy.core._conn.caps) {
            $(document).on('caps.strophe', self.onCaps);
        }
*/

        if (url && typeof url === 'string') {
            candy.webrtc.getTurnCrendentials(url);
        } else {
            candy.core._conn.jingle.setICEServers(peerConfig.iceServers);
        }
    },

    startCall: function (user) {
        var self = this,
			vid_div = $('<div class="candy_video"></div>'),
			vid_jid = user.getUserJid();

		user.jquery_video_el = vid_div;
//        candy.wrapper.dom.chat_videos.append(vid_div);

		// Record as last caller...
        self.last_caller = vid_jid;
/*
        jsxc.switchEvents(
			{
				'finish.mediaready.jsxc': function() {

					self.setStatus('Initiate call');

					candy.webrtc.gui.window.postMessage(jsxc.jidToBid(jid), 'sys', $.t('Call_started'));

					$(document).one(
						'error.jingle',
						function (e, sid, error) {
							if (error.source !== 'offer') {
								return;
							}

							$(document).off('cleanup.dialog.jsxc');

							setTimeout(
								function() {
									candy.webrtc.gui.showAlert("Sorry, we couldn't establish a connection. Maybe your buddy is offline.");
								},
								500
							);
						}
					);

					var session = candy.core._conn.jingle.initiate(vid_jid);

					session.on(
						'change:connectionState',
						$.proxy(self.onIceConnectionStateChanged,self)
					);
				},
				'mediafailure.jingle': function () {
					candy.webrtc.gui.dialog.close();
				}
			}
		);
*/
        self.reqUserMedia(um);
    },

    reqUserMedia: function (um) {

        if (this.session && this.localStream) {

			this.setStatus('Accept call');

			this.session.addStream(this.localStream);

			this.session.accept();

            return;
        }

        um = um || ['video', 'audio'];

        candy.webrtc.gui.dialog.open(
			candy.webrtc.gui.template.get('allowMediaAccess'),
			{
				noClose: true
			}
		);

        this.setStatus('please allow access to microphone and camera');

        if (typeof MediaStreamTrack !== 'undefined'
		 && typeof MediaStreamTrack.getSources !== 'undefined') {
            MediaStreamTrack.getSources(
				function(sourceInfo) {
					var availableDevices = sourceInfo.map(
							function (el) {
								return el.kind;
							}
						);

					um = um.filter(
						function (el) {
							return availableDevices.indexOf(el) !== -1;
						}
					);

					candy.webrtc.getUserMedia(um);
				}
			);
        } else {
            candy.webrtc.getUserMedia(um);
        }
    },

    hangUp: function (reason, text) {

        candy.core._conn.jingle.terminate(null, reason, text);
    }
};