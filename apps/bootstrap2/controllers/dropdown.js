
msos.provide("apps.bootstrap2.controllers.dropdown");

apps.bootstrap2.controllers.dropdown.version = new msos.set_version(14, 8, 6);


angular.module(
    'apps.bootstrap2.controllers.dropdown', ['ng.bootstrap.ui.dropdown']
).controller(
    'apps.bootstrap2.controllers.dropdown.ctrl',
    [
        '$scope',function ($scope) {
            "use strict";

            $scope.items = ['The first choice!', 'And another choice for you.', 'but wait! A third!'];

            $scope.status = {
                isopen: false
            };

            $scope.toggled = function (open) {
                console.log('Dropdown is now: ', open);
            };

            $scope.toggleDropdown = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.status.isopen = !$scope.status.isopen;
            };
        }
    ]
);