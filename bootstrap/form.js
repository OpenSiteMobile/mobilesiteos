
msos.provide("bootstrap.form");

bootstrap.form.version = new msos.set_version(17, 4, 7);


// Start by loading our form/control.css stylesheet
bootstrap.form.css = new msos.loader();
bootstrap.form.css.load(msos.resource_url('bootstrap', 'css/form.css'));
bootstrap.form.css.load(msos.resource_url('bootstrap', 'css/inputgroup.css'));