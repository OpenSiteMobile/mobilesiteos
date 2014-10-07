
msos.provide("apps.bootstrap2.controllers.rating");
msos.require("ng.bootstrap.ui.rating");

apps.bootstrap2.controllers.rating.version = new msos.set_version(14, 8, 6);


angular.module(
    'apps.bootstrap2.controllers.rating', []
).controller(
    'apps.bootstrap2.controllers.rating.ctrl',
    [
        '$scope',
        function ($scope) {
            "use strict";

            $scope.rate = 7;
            $scope.max = 10;
            $scope.isReadonly = false;

            $scope.hoveringOver = function (value) {
                $scope.overStar = value;
                $scope.percent = 100 * (value / $scope.max);
            };

            $scope.ratingStates = [{
                stateOn: 'glyphicon-ok-sign',
                stateOff: 'glyphicon-ok-circle'
            }, {
                stateOn: 'glyphicon-star',
                stateOff: 'glyphicon-star-empty'
            }, {
                stateOn: 'glyphicon-heart',
                stateOff: 'glyphicon-ban-circle'
            }, {
                stateOn: 'glyphicon-heart'
            }, {
                stateOff: 'glyphicon-off'
            }];
        }
    ]
);