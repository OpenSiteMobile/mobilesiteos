
msos.provide("bootstrap.print");

bootstrap.pager.version = new msos.set_version(17, 4, 7);


// Start by loading our print.css stylesheet
bootstrap.print.css = new msos.loader();
bootstrap.print.css.load(msos.resource_url('bootstrap', 'css/print.css'));
