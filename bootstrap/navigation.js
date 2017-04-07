
msos.provide("bootstrap.navigation");

bootstrap.navigation.version = new msos.set_version(17, 4, 7);


// Start by loading our navigation.css stylesheet
bootstrap.navigation.css = new msos.loader();
bootstrap.navigation.css.load(msos.resource_url('bootstrap', 'css/navigation.css'));
