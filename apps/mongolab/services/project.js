
msos.provide('apps.mongolab.services.project');


apps.mongolab.services.project = ['$mongolabResourceHttp', function ($mongolabResourceHttp) {
    "use strict";

    return $mongolabResourceHttp('projects');
}];