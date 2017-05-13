
msos.provide("bootstrap.visible");

bootstrap.visible.version = new msos.set_version(17, 5, 8);


// Start by loading our visible.css stylesheet
bootstrap.visible.css = new msos.loader();
bootstrap.visible.css.load(msos.resource_url('bootstrap', 'css/visible.css'));
