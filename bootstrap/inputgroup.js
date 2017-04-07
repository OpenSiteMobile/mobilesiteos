
msos.provide("bootstrap.inputgroup");

bootstrap.inputgroup.version = new msos.set_version(17, 4, 7);


// Start by loading our stylesheets
bootstrap.inputgroup.css = new msos.loader();
bootstrap.inputgroup.css.load(msos.resource_url('bootstrap', 'css/inputgroup.css'));
