
msos.provide("apps.bootstrap2.controllers.buttons");
msos.require("ng.bootstrap.ui.buttons");

apps.bootstrap2.controllers.buttons.version = new msos.set_version(14, 8, 6);


angular.module(
    'apps.bootstrap2.controllers.buttons', []
).controller(
    'apps.bootstrap2.controllers.buttons.ctrl',
    [
        '$scope',
        function ($scope) {
            "use strict";

            $scope.singleModel = 1;

            $scope.radioModel = 'Middle';

            $scope.checkModel = {
                left: false,
                middle: true,
                right: false
            };
        }
    ]
);