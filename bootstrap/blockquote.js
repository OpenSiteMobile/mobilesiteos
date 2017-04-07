
msos.provide("bootstrap.blockquote");

bootstrap.blockquote.version = new msos.set_version(17, 4, 7);


// Start by loading our blockquote.css stylesheet
bootstrap.blockquote.css = new msos.loader();
bootstrap.blockquote.css.load(msos.resource_url('bootstrap', 'css/blockquote.css'));
