
msos.provide("bootstrap.responsive");

bootstrap.responsive.version = new msos.set_version(17, 4, 7);


// Start by loading our responsive.css stylesheet
bootstrap.responsive.css = new msos.loader();
bootstrap.responsive.css.load(msos.resource_url('bootstrap', 'css/responsive.css'));
