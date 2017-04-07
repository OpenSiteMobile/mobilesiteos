

msos.provide("bootstrap.panel");
msos.require("bootstrap.collapse");
msos.require("bootstrap.transition");

bootstrap.panel.version = new msos.set_version(17, 4, 7);


// Start by loading our stylesheets
bootstrap.panel.css = new msos.loader();
bootstrap.panel.css.load(msos.resource_url('bootstrap', 'css/panel.css'));

if (Modernizr.cssgradients) {
    bootstrap.panel.css.load(msos.resource_url('bootstrap', 'css/panel_gradient.css'));
}