
msos.provide('apps.mongolab.services.project');


apps.mongolab.services.project = function ($mongolabResourceHttp) {
    "use strict";

    return $mongolabResourceHttp('projects');
};