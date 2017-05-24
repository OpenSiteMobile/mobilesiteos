
msos.provide("apps.bootstrap2.controllers.popover");
msos.require("ng.bootstrap.ui.popover");

apps.bootstrap2.controllers.popover.version = new msos.set_version(14, 8, 6);


angular.module(
    'apps.bootstrap2.controllers.popover', []
).controller(
    'apps.bootstrap2.controllers.popover.ctrl',
    [
        '$scope',
        function ($scope) {
            "use strict";

            $scope.dynamicPopover = 'Hello, World!';
            $scope.dynamicPopoverTitle = 'Title';
        }
    ]
);
