
msos.provide('apps.mongolab.controllers.todolist');


apps.mongolab.controllers.todolist = function ($scope, $location, projects) {
    "use strict";

    $scope.projects = projects;
};