
msos.provide("bootstrap.progress");

bootstrap.progress.version = new msos.set_version(17, 4, 7);


// Start by loading our progress.css stylesheet
bootstrap.progress.css = new msos.loader();
bootstrap.progress.css.load(msos.resource_url('bootstrap', 'css/progress.css'));

if (Modernizr.cssgradients) {
    bootstrap.progress.css.load(msos.resource_url('bootstrap', 'css/progress_gradient.css'));
}