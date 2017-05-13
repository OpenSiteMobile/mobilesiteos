
msos.provide("bootstrap.thumbnail");

bootstrap.thumbnail.version = new msos.set_version(17, 5, 8);


// Start by loading our thumbnail.css stylesheet
bootstrap.thumbnail.css = new msos.loader();
bootstrap.thumbnail.css.load(msos.resource_url('bootstrap', 'css/thumbnail.css'));
