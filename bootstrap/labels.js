
msos.provide("bootstrap.labels");

bootstrap.labels.version = new msos.set_version(17, 4, 7);


// Start by loading our labels.css stylesheet
bootstrap.labels.css = new msos.loader();
bootstrap.labels.css.load(msos.resource_url('bootstrap', 'css/labels.css'));
