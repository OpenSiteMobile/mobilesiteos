
msos.provide("apps.bootstrap2.controllers.collapse");

apps.bootstrap2.controllers.collapse.version = new msos.set_version(14, 8, 6);


angular.module(
    'apps.bootstrap2.controllers.collapse', ['ng.bootstrap.ui.collapse']
).controller(
    'apps.bootstrap2.controllers.collapse.ctrl',
    [
        '$scope',
        function ($scope) {
            "use strict";

            $scope.isCollapsed = false;
        }
    ]
);