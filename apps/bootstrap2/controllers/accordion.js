
msos.provide("apps.bootstrap2.controllers.accordion");
msos.require("ng.bootstrap.ui.accordion");

apps.bootstrap2.controllers.accordion.version = new msos.set_version(14, 8, 6);


angular.module(
    'apps.bootstrap2.controllers.accordion', []
).controller(
    'apps.bootstrap2.controllers.accordion.ctrl',
    [
        '$scope',
        function ($scope) {
            "use strict";

            $scope.oneAtATime = true;

            $scope.groups = [{
                title: 'Dynamic Group Header - 1',
                content: 'Dynamic Group Body - 1'
            }, {
                title: 'Dynamic Group Header - 2',
                content: 'Dynamic Group Body - 2'
            }];

            $scope.items = ['Item 1', 'Item 2', 'Item 3'];

            $scope.addItem = function () {
                var newItemNo = $scope.items.length + 1;
                $scope.items.push('Item ' + newItemNo);
            };

            $scope.status = {
                isFirstOpen: true,
                isFirstDisabled: false
            };
        }
    ]
);