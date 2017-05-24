
msos.provide("apps.bootstrap2.controllers.tabs");
msos.require("ng.bootstrap.ui.tabs");

apps.bootstrap2.controllers.tabs.version = new msos.set_version(14, 8, 6);


angular.module(
    'apps.bootstrap2.controllers.tabs', []
).controller(
    'apps.bootstrap2.controllers.tabs.ctrl',
    [
        '$scope',
        function ($scope) {
            "use strict";

            $scope.tabs = [{
                title: 'Dynamic Title 1',
                content: 'Dynamic content 1'
            }, {
                title: 'Dynamic Title 2',
                content: 'Dynamic content 2',
                disabled: true
            }];

            $scope.alertMe = function () {
                setTimeout(function () {
                    alert('You\'ve selected the alert tab!');
                });
            };
        }
    ]
);