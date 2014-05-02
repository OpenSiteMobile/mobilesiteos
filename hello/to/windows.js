//
// Windows
//

/*global
    msos: false,
    jQuery: false,
    hello: false
*/

msos.provide("hello.to.windows");

hello.to.windows.version = new msos.set_version(13, 10, 31);


hello.to.windows.config = {

    windows: {

        name: 'Windows live',
        id: msos.config.social.windows,

        oauth: {
            version: 2,
            auth: 'https://login.live.com/oauth20_authorize.srf'
        },

        scope: {
            basic:		'wl.signin,wl.basic',
            email:		'wl.emails',
            birthday:	'wl.birthday',
            events:		'wl.calendars',
            photos:		'wl.photos',
            videos:		'wl.photos',
            friends:	'',
            files:		'wl.skydrive',

            publish:		'wl.share',
            publish_files:	'wl.skydrive_update',
            create_event:	'wl.calendars_update,wl.events_create',

            offline_access: 'wl.offline_access'
        },

        base: 'https://apis.live.net/v5.0/',

        get: {
            "me": "me",
            "me/friends": "me/friends",
            "me/following": "me/friends",
            "me/followers": "me/friends",

            "me/albums": 'me/albums',

            "me/album": '@{id}/files',
            "me/photo": '@{id}',

            "me/files": '@{id|me/skydrive}/files',

            "me/folders": '@{id|me/skydrive}/files',
            "me/folder": '@{id|me/skydrive}/files'
        }
    }
};


hello.to.windows.init = function () {
    "use strict";

    msos.console.debug('hello.to.windows.init -> start.');

    hello.init(hello.to.windows.config);

    msos.console.debug('hello.to.windows.init -> done!');
};


msos.add_onload_func_start(hello.to.windows.init);