
msos.provide('apps.mongolab.controllers.todolist');


apps.mongolab.controllers.todolist = ['$scope', '$location', 'project', function ($scope, $location, projects) {
    "use strict";

    $scope.projects = projects;
}];