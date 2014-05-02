//
// Facebook
//

/*global
    msos: false,
    jQuery: false,
    hello: false
*/

msos.provide("hello.to.facebook");

hello.to.facebook.version = new msos.set_version(13, 10, 31);


hello.to.facebook.config = {

    facebook: {

        name: 'Facebook',
        id: msos.config.social.facebook,

        oauth: {
            version: 2,
            auth: 'https://www.facebook.com/dialog/oauth/'
        },

        // Authorization scopes
        scope: {
            basic: '',
            email: 'email',
            birthday: 'user_birthday',
            events: 'user_events',
            photos: 'user_photos,user_videos',
            videos: 'user_photos,user_videos',
            friends: '',
            files: 'user_photos,user_videos',

            publish_files: 'user_photos,user_videos,publish_stream',
            publish: 'publish_stream',
            create_event: 'create_event',

            offline_access: 'offline_access'
        },

        // API Base URL
        base: 'https://graph.facebook.com/',

        // Map GET requests
        get: {
            'me': 'me',
            'me/friends': 'me/friends',
            'me/following': 'me/friends',
            'me/followers': 'me/friends',
            'me/share': 'me/feed',
            'me/files': 'me/albums',
            'me/albums': 'me/albums',
            'me/album': '@{id}/photos',
            'me/photos': 'me/photos',
            'me/photo': '@{id}'
        }
    }
};


hello.to.facebook.init = function () {
    "use strict";

    msos.console.debug('hello.to.facebook.init -> start.');

    hello.init(hello.to.facebook.config);

    msos.console.debug('hello.to.facebook.init -> done!');
};

msos.add_onload_func_start(hello.to.facebook.init);