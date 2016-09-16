
msos.provide('apps.mongolab.controllers.todolist');


apps.mongolab.controllers.todolist = ['$scope', '$location', 'projects', function ($scope, $location, projects) {
    "use strict";

    $scope.projects = projects;
}];