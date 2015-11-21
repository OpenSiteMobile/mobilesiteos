
/*global
    msos: false,
    jQuery: false,
    mep: false
*/

msos.provide("mep.postroll");

mep.postroll.version = new msos.set_version(15, 11, 12);


// Start by loading our progress.css stylesheet
mep.postroll.css = new msos.loader();
mep.postroll.css.load('mep_postroll_css', msos.resource_url('mep', 'css/postroll.css'));


mep.postroll.start = function () {
	"use strict";

    jQuery.extend(

    mep.player.controls, {

		buildpostroll: function(ply_obj) {

			var postroll_link = ply_obj.container.find('script[type="text/postroll"]').attr('src'),
				postroll_close = jQuery('<a class="btn btn-danger mejs-postroll-close" title="' + ply_obj.options.i18n.close + '"><i class="fa fa-times"></i></a>'),
				postroll_content = jQuery('<div class="mejs-postroll-layer-content"></div>'),
				postroll_container = jQuery('<div class="mejs-postroll-layer mejs-layer"></div>');

			postroll_close.click(
				function (e) {
					msos.do_nothing(e);
					jQuery(this).parent().hide();
					return false;
				}
			);

			postroll_container.append(postroll_close, postroll_content);

			if (postroll_link !== undefined) {

				postroll_container.prependTo(ply_obj.layers).hide();

				ply_obj.media.addEventListener(
					'ended',
					function () {
						jQuery.ajax({
							dataType: 'html',
							url: postroll_link,
							success: function (data, textStatus) {
								postroll_content.html(data);
							}
						});
						postroll_container.show();
					},
					false
				);
			}
		}
	});
};

// Load early, but after 'mep.player' has loaded
msos.onload_func_start.push(mep.postroll.start);