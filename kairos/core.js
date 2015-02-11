/* * * Kairos Javascript SDK * * * *
 * Authored by Eric Turner
 * http://kairos.com
 */
var Kairos = function (app_id, app_key) {
        this.api_host = 'http://api.kairos.com/';
        this.header_settings = {
            "Content-type": "application/json",
            "app_id": app_id,
            "app_key": app_key
        }
    };

/* Authentication checker */
Kairos.prototype.authenticationProvided = function () {

    if ((!this.header_settings.app_key) || (!this.header_settings.app_id)) {
        msos.console.error('Kairos.prototype.authenticationProvided -> failed, key: ' + this.header_settings.app_key + ', id: ' + this.header_settings.app_id);
        return false;
    }

    return true;
}

Kairos.prototype.detect = function (image_data, callback, options) {

    if (this.authenticationProvided() === false) {
        msos.console.error('Kairos Error: set your app_id and api_key before calling this method');
        return;
    }

    if (!image_data) {
        msos.console.error('Kairos Error: the image_data parameter is required');
        return;
    }

    if (!callback || !jQuery.isFunction(callback)) {
        msos.console.error('Kairos Error: the callback parameter is required and must be of type [function]');
        return;
    }

    var url = this.api_host + 'detect',
        data = {
            'image': image_data
        };

    if (!jQuery.isEmptyObject(options)) {
        data = jQuery.extend(data, options);
    }

    $.ajax(
        url,
        {
            headers: this.header_settings,
            type: "POST",
            dataType: "raw",
            data: JSON.stringify(data),
            success: callback,
            error: callback
        }
    );
};

Kairos.prototype.enroll = function (image_data, gallery_id, subject_id, callback, options) {

    if (this.authenticationProvided() == false) {
        msos.console.error('Kairos Error: set your app_id and api_key before calling this method');
        return;
    }

    if (!image_data) {
        msos.console.error('Kairos Error: the image_data parameter is required');
        return;
    }

    if (!gallery_id) {
        msos.console.error('Kairos Error: the gallery_id parameter is required');
        return;
    }

    if (!subject_id) {
        msos.console.error('Kairos Error: the subject_id parameter is required');
        return;
    }

    if (!callback || !jQuery.isFunction(callback)) {
        msos.console.error('Kairos Error: the callback parameter is required and must be of type [function]');
        return;
    }

    var url = this.api_host + 'enroll',
        data = {
            'image': image_data,
            'gallery_name': gallery_id,
            'subject_id': subject_id
        };

    if (!jQuery.isEmptyObject(options)) {
        data = jQuery.extend(data, options);
    }

    $.ajax(
        url,
        {
            headers: this.header_settings,
            type: "POST",
            dataType: "raw",
            data: JSON.stringify(data),
            success: callback,
            error: callback
        }
    );
};

Kairos.prototype.recognize = function (image_data, gallery_id, callback, options) {

    if (this.authenticationProvided() == false) {
        msos.console.error('Kairos Error: set your app_id and api_key before calling this method');
        return;
    }

    if (!image_data) {
        msos.console.error('Kairos Error: the image_data parameter is required');
        return;
    }

    if (!callback || !jQuery.isFunction(callback)) {
        msos.console.error('Kairos Error: the callback parameter is required and must be of type [function]');
        return;
    }

    var url = this.api_host + 'recognize',
        data = {
            'image': image_data,
            'gallery_name': gallery_id,
            'subject_id': subject_id
        };

    if (!jQuery.isEmptyObject(options)) {
        data = jQuery.extend(data, options);
    }

    $.ajax(url, {
        headers: this.header_settings,
        type: "POST",
        dataType: "raw",
        data: JSON.stringify(data),
        success: callback,
        error: callback
    });
};

Kairos.prototype.viewGalleries = function (callback, options) {

    if (this.authenticationProvided() == false) {
        msos.console.error('Kairos Error: set your app_id and api_key before calling this method');
        return;
    }

    if (!callback || !jQuery.isFunction(callback)) {
        msos.console.error('Kairos Error: the callback parameter is required and must be of type [function]');
        return;
    }

    var url = this.api_host + 'gallery/list_all',
        data = {};

    if (!jQuery.isEmptyObject(options)) {
        data = jQuery.extend(data, options);
    }

    $.ajax(url, {
        headers: this.header_settings,
        type: "POST",
        dataType: "raw",
        data: JSON.stringify(data),
        success: callback,
        error: callback
    });
};

Kairos.prototype.viewSubjectsInGallery = function (gallery_id, callback, options) {

    if (this.authenticationProvided() === false) {
        msos.console.error('Kairos Error: set your app_id and api_key before calling this method');
        return;
    }

    if (!gallery_id) {
        msos.console.error('Kairos Error: the gallery_id parameter is required');
        return;
    }

    if (!callback || !jQuery.isFunction(callback)) {
        msos.console.error('Kairos Error: the callback parameter is required and must be of type [function]');
        return;
    }

    var url = this.api_host + 'gallery/view',
        data = {
            'gallery_name': gallery_id
        };

    if (!jQuery.isEmptyObject(options)) {
        data = jQuery.extend(data, options);
    }

    $.ajax(
        url,
        {
            headers: this.header_settings,
            type: "POST",
            dataType: "raw",
            data: JSON.stringify(data),
            success: callback,
            error: callback
        }
    );
};

Kairos.prototype.removeSubjectFromGallery = function (subject_id, gallery_id, callback) {

    if (this.authenticationProvided() === false) {
        msos.console.error('Kairos Error: set your app_id and api_key before calling this method');
        return;
    }

    if (!gallery_id) {
        msos.console.error('Kairos Error: the gallery_id parameter is required');
        return;
    }

    if (!subject_id) {
        msos.console.error('Kairos Error: the subject_id parameter is required');
        return;
    }

    var url = this.api_host + 'gallery/remove_subject',
        data = {
            'gallery_name': gallery_id,
            'subject_id': subject_id
        };

    if (!jQuery.isEmptyObject(options)) {
        data = jQuery.extend(data, options);
    }

    $.ajax(
        url,
        {
            headers: this.header_settings,
            type: "POST",
            dataType: "raw",
            data: JSON.stringify(data),
            success: callback,
            error: callback
        }
    );
};