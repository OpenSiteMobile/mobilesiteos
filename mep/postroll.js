
/*global
    msos: false,
    jQuery: false,
    mep: false
*/

msos.provide("mep.postroll");

mep.postroll.version = new msos.set_version(17, 5, 21);


// Start by loading our progress.css stylesheet
mep.postroll.css = new msos.loader();
mep.postroll.css.load(msos.resource_url('mep', 'css/postroll.css'));


mep.postroll.start = function (me_player) {
	"use strict";

    jQuery.extend(me_player.controls, {

		buildpostroll: function(ply_obj) {

			var postroll_link = ply_obj.container.find('script[type="text/postroll"]').attr('src'),
				postroll_close = jQuery('<a class="btn btn-danger mejs-postroll-close" title="' + ply_obj.config.i18n.close + '" aria-label="' + ply_obj.config.i18n.close + '"><i class="fa fa-times"></i></a>'),
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
								msos.console.debug('mep.postroll.start - buildpostroll - ended -> fired, status: ' + textStatus);
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
