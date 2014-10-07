
msos.provide("apps.bootstrap2.controllers.tooltip");
msos.require("ng.bootstrap.ui.tooltip");

apps.bootstrap2.controllers.tooltip.version = new msos.set_version(14, 8, 6);


angular.module(
    'apps.bootstrap2.controllers.tooltip', []
).controller(
    'apps.bootstrap2.controllers.tooltip.ctrl',
    [
        '$scope',
        function ($scope) {
            "use strict";

            $scope.dynamicTooltip = 'Hello, World!';
            $scope.dynamicTooltipText = 'dynamic';
            $scope.htmlTooltip = 'I\'ve been made <b>bold</b>!';
        }
    ]
);