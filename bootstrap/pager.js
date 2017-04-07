
msos.provide("bootstrap.pager");

bootstrap.pager.version = new msos.set_version(17, 4, 7);


// Start by loading our pager.css stylesheet
bootstrap.pager.css = new msos.loader();
bootstrap.pager.css.load(msos.resource_url('bootstrap', 'css/pager.css'));
