
msos.provide("bootstrap.pagination");

bootstrap.pagination.version = new msos.set_version(17, 4, 7);


// Start by loading our pagination.css stylesheet
bootstrap.pagination.css = new msos.loader();
bootstrap.pagination.css.load(msos.resource_url('bootstrap', 'css/pagination.css'));
