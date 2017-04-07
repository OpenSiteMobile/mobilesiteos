
msos.provide("bootstrap.popover");
msos.require("bootstrap.tooltip");

bootstrap.popover.version = new msos.set_version(17, 4, 7);


// Start by loading our popover.css stylesheet
bootstrap.popover.css = new msos.loader();
bootstrap.popover.css.load(msos.resource_url('bootstrap', 'css/popover.css'));
