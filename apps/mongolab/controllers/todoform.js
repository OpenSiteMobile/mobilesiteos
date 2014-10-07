
msos.provide('apps.mongolab.controllers.todoform');


apps.mongolab.controllers.todoform = function ($scope, $location, project) {
    "use strict";

    var projectCopy = angular.copy(project),
        changeSuccess = function () {
            $location.path('/list');
        },
        changeError = function () {
            throw new Error('Sth went wrong...');
        };

    $scope.project = project;

    $scope.save = function () {
        $scope.project.$saveOrUpdate(changeSuccess, changeSuccess, changeError, changeError);
    };

    $scope.remove = function () {
        $scope.project.$remove(changeSuccess, changeError);
    };

    $scope.hasChanges = function () {
        return !angular.equals($scope.project, projectCopy);
    };
};