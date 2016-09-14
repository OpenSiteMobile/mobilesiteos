
msos.provide('apps.route.start');
msos.require("ng.util.anchorscroll");

msos.onload_func_done.push(
	function () {

		var temp_sd = 'apps.route.start';

		msos.console.debug(temp_sd + ' -> start.');

		apps.route.start = angular.module('apps.route.start', ['ngRoute']);

		// configure our routes
		apps.route.start.config(
			['$routeProvider', function ($routeProvider) {
				$routeProvider
					// route for the home page
					.when('/', {
						templateUrl: msos.resource_url('apps','route/pages/home.html'),
						controller: 'mainController'
					})
	
					// route for the about page
					.when('/about', {
						templateUrl: msos.resource_url('apps','route/pages/about.html'),
						controller: 'aboutController'
					})
	
					// route for the contact page
					.when('/contact', {
						templateUrl: msos.resource_url('apps','route/pages/contact.html'),
						controller: 'contactController'
					})
	
					.otherwise({
						redirectTo: '/'
					});
			}]
		);

		// create the controller and inject Angular's $scope
		apps.route.start.controller(
			'mainController',
			['$scope', function ($scope) {
				msos.console.debug(temp_sd + ' - mainController -> called!');
				// create a message to display in our view
				$scope.message = 'Everyone come and see how good I look!';
			}]
		);

		apps.route.start.controller(
			'aboutController',
			['$scope', function ($scope) {
				msos.console.debug(temp_sd + ' - aboutController -> called!');
				$scope.message = 'Look! I am an about page.';
			}]
		);

		apps.route.start.controller(
			'contactController',
			['$scope', function ($scope) {
				msos.console.debug(temp_sd + ' - contactController -> called!');
				$scope.message = 'Contact us! JK. This is just a demo.';
			}]
		);

		angular.bootstrap('body', ['apps.route.start']);

		msos.console.debug(temp_sd + 'done!');
	}
);
