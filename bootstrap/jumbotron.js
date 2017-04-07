

msos.provide("bootstrap.jumbotron");

bootstrap.jumbotron.version = new msos.set_version(17, 4, 7);


// Start by loading our stylesheets
bootstrap.jumbotron.css = new msos.loader();
bootstrap.jumbotron.css.load(msos.resource_url('bootstrap', 'css/jumbotron.css'));
