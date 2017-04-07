
/*global
    msos: false,
    jQuery: false
*/

msos.provide("bootstrap.table");

bootstrap.table.version = new msos.set_version(17, 4, 7);


// Start by loading our 'table.css' stylesheet
bootstrap.table.css = new msos.loader();
bootstrap.table.css.load(msos.resource_url('bootstrap', 'css/table.css'));