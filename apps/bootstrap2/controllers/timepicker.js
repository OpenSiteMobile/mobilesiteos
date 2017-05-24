
msos.provide("apps.bootstrap2.controllers.timepicker");
msos.require("ng.bootstrap.ui.timepicker");

apps.bootstrap2.controllers.timepicker.version = new msos.set_version(14, 8, 6);


angular.module(
    'apps.bootstrap2.controllers.timepicker', []
).controller(
    'apps.bootstrap2.controllers.timepicker.ctrl',
    [
        '$scope',function ($scope) {
            "use strict";

            $scope.mytime = new Date();

            $scope.hstep = 1;
            $scope.mstep = 15;

            $scope.options = {
                hstep: [1, 2, 3],
                mstep: [1, 5, 10, 15, 25, 30]
            };

            $scope.ismeridian = true;
            $scope.toggleMode = function () {
                $scope.ismeridian = !$scope.ismeridian;
            };

            $scope.update = function () {
                var d = new Date();
                d.setHours(14);
                d.setMinutes(0);
                $scope.mytime = d;
            };

            $scope.changed = function () {
                console.log('Time changed to: ' + $scope.mytime);
            };

            $scope.clear = function () {
                $scope.mytime = null;
            };
        }
    ]
);