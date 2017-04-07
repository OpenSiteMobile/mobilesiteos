

msos.provide("bootstrap.listgroup");

bootstrap.listgroup.version = new msos.set_version(17, 4, 7);


// Start by loading our stylesheets (requires panel css also)
bootstrap.listgroup.css = new msos.loader();
bootstrap.listgroup.css.load(msos.resource_url('bootstrap', 'css/listgroup.css'));
bootstrap.listgroup.css.load(msos.resource_url('bootstrap', 'css/panel.css'));

if (Modernizr.cssgradients) {
    bootstrap.listgroup.css.load(msos.resource_url('bootstrap', 'css/panel_gradient.css'));
}