
msos.provide("bootstrap.media");

bootstrap.media.version = new msos.set_version(17, 4, 7);


// Start by loading our media.css stylesheet
bootstrap.media.css = new msos.loader();
bootstrap.media.css.load(msos.resource_url('bootstrap', 'css/media.css'));
