
msos.provide("apps.bootstrap2.controllers.alert");
msos.require("ng.bootstrap.ui.alert");

apps.bootstrap2.controllers.alert.version = new msos.set_version(14, 8, 6);


angular.module(
    'apps.bootstrap2.controllers.alert', []
).controller(
    'apps.bootstrap2.controllers.alert.ctrl',
    [
        '$scope', function ($scope) {
            "use strict";

            $scope.alerts = [{
                type: 'danger',
                msg: 'Oh snap! Change a few things up and try submitting again.'
            }, {
                type: 'success',
                msg: 'Well done! You successfully read this important alert message.'
            }];

            $scope.addAlert = function () {
                $scope.alerts.push({
                    msg: 'Another alert!'
                });
            };

            $scope.closeAlert = function (index) {
                $scope.alerts.splice(index, 1);
            };

        }
    ]
);