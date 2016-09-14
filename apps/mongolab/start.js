
msos.provide('apps.mongolab.start');
msos.require('ng.resource.mongolab');
msos.require('apps.mongolab.services.project');
msos.require('apps.mongolab.controllers.todoform');
msos.require('apps.mongolab.controllers.todolist');


msos.onload_functions.push(
	function () {

		var temp_ml = 'apps.mongolab.start -> ',
            app;

		msos.console.debug(temp_ml + 'start.');

		app = angular.module('apps.mongolab.start', ['ngRoute', 'ng.resource.mongolab']);

        app.config(
            ['$routeProvider', function ($routeProvider) {

                $routeProvider
                    .when(
                        '/list',
                        {
                            templateUrl: msos.resource_url('apps', 'mongolab/partials/list.html'),
                            controller: 'TodoListCtrl',
                            resolve: {
                                projects: function (Project) { return Project.all(); }
                            }
                        }
                    ).when(
                        '/edit/:id',
                        {
                            templateUrl: msos.resource_url('apps', 'mongolab/partials/form.html'),
                            controller: 'TodoFormCtrl',
                            resolve: {
                                project: function (Project, $route) { return Project.getById($route.current.params.id); } 
                            }
                        }
                    ).when(
                        '/new',
                        {
							templateUrl: msos.resource_url('apps', 'mongolab/partials/form.html'),
							controller: 'TodoFormCtrl',
							resolve: {
								project: function (Project) { return new Project(); }
							}
						}
                ).otherwise(
                    { redirectTo: '/list' }
                );
            }]
        ).constant(
            'MONGOLAB_CONFIG',
            {
                API_KEY: '0df2lQygbiC1ov7dyVEENGHKCvRkSXd2',
                DB_NAME: 'angularjs'
            }
        );

        app.factory('Project',          apps.mongolab.services.project);
        app.controller('TodoListCtrl',  apps.mongolab.controllers.todolist);
        app.controller('TodoFormCtrl',  apps.mongolab.controllers.todoform);

        apps.mongolab.start = app;

		msos.console.debug(temp_ml + 'done!');
	}
);

msos.onload_func_done.push(
	function () {
		angular.bootstrap('body', ['apps.mongolab.start']);
	}
);