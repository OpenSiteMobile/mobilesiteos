
msos.provide("apps.bootstrap2.controllers.pagination");
msos.require("ng.bootstrap.ui.pagination");

apps.bootstrap2.controllers.pagination.version = new msos.set_version(14, 8, 6);


angular.module(
    'apps.bootstrap2.controllers.pagination', []
).controller(
    'apps.bootstrap2.controllers.pagination.ctrl',
    [
        '$scope',
        function ($scope) {
            "use strict";

            $scope.totalItems = 64;
            $scope.currentPage = 4;

            $scope.setPage = function (pageNo) {
                $scope.currentPage = pageNo;
            };

            $scope.pageChanged = function () {
                console.log('Page changed to: ' + $scope.currentPage);
            };

            $scope.maxSize = 5;
            $scope.bigTotalItems = 175;
            $scope.bigCurrentPage = 1;
        }
    ]
);