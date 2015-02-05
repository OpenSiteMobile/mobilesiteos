
msos.provide('apps.ngdemos.start');

apps.ngdemos.start.css = new msos.loader();

// Load the page specific css (but after ./config.js loaded css)
apps.ngdemos.start.css.load('apps_ngdemos_css_demo', msos.resource_url('apps', 'ngdemos/css/demo.css'), 'css');


msos.onload_functions.push(
	function () {

		var temp_sd = 'apps.ngdemos.start';

		msos.console.debug(temp_sd + ' -> start.');

		apps.ngdemos.start = angular.module('apps.ngdemos.start', ['ngRoute']);

		// The basic technique below was derived from the example at:
		// http://www.bennadel.com/blog/2554-loading-angularjs-components-with-requirejs-after-application-bootstrap.htm
		apps.ngdemos.start.config(
			function($controllerProvider, $provide, $compileProvider) {
 
				var app = apps.ngdemos.start;

				// Let's keep the older references.
				app._controller = app.controller;
				app._service = app.service;
				app._factory = app.factory;
				app._value = app.value;
				app._directive = app.directive;
 
				// Provider-based controller.
				app.controller = function (name, constructor) {
					$controllerProvider.register( name, constructor );
					return (this);
				};
 
				// Provider-based service.
				app.service = function (name, constructor) {
					$provide.service(name, constructor);
					return (this);
				};
 
				// Provider-based factory.
				app.factory = function (name, factory) {
					$provide.factory( name, factory );
					return (this);
				};
 
				// Provider-based value.
				app.value = function (name, value) {
					$provide.value(name, value);
					return (this);
				};
 
				// Provider-based directive.
				app.directive = function (name, factory) {
					$compileProvider.directive( name, factory );
					return (this);
				};
			}
		);

		apps.ngdemos.start.factory(
			"get_template",
			function ($templateCache, $http) {

				function load_template(scpe, pge) {

					msos.console.debug(temp_sd + ' - get_template -> called: ' + pge.url);

					scpe.template = pge.url;

					$http(
						{
							method: 'GET',
							url: pge.url,
							cache: $templateCache
						}
					).success(
						function (html) {
							scpe.html = html;
							$('textarea').text(html);	// Had to go with this due to IE
						}
					).error(
						function (html, status) {
							scpe.html = 'Unable to load code: ' + status;
						}
					);
				}

				return load_template;
			}
		);

		apps.ngdemos.start.factory(
			"get_script",
			function ($rootScope, $q, get_template) {

				var deferred = $q.defer();

				function load_script(scpe, pge) {

					msos.console.debug(temp_sd + ' - get_script -> called: ' + pge.script);

					jQuery.ajax(
						{
							url: pge.script,
							dataType: "script",
							cache: true
						}
					).done(
						function () {
							msos.console.debug(temp_sd + ' - get_script -> loaded: ' + pge.script);

							// possibly should be -> $rootScope.$evalAsync(function () { ... });
							$rootScope.$apply(
								function () {
									deferred.resolve();
									get_template(scpe, pge);
								}
							);
						}
					).fail(
						function (jqxhr, settings, e) {
							msos.console.debug(temp_sd + ' - get_script -> error: ', e);

							// possibly should be -> $rootScope.$evalAsync(function () { ... });
							$rootScope.$apply(
								function () {
									deferred.reject(e);
								}
							);
						}
					);
				};

				return load_script;
			}
		);

        apps.ngdemos.start.controller(
            'samplesController',
            function ($scope, get_template, get_script) {

				var res_url = msos.resource_url;

				$scope.template = '';
                $scope.html = '';
                $scope.pages = [
                    {
                        title: 'Data Binding Basics',
                        url: res_url('apps', 'ngdemos/pages/1_basics.html'),
						icon: 'fa-chevron-right'
                    },
                    {
                        title: 'Initialize Data',
                        url: res_url('apps', 'ngdemos/pages/2_init.html'),
						icon: 'fa-chevron-right'
                    },
                    {
                        title: 'Looping with ng-repeat',
                        url: res_url('apps', 'ngdemos/pages/3_looping.html'),
						icon: 'fa-chevron-right'
                    },
                    {
                        title: 'Adding a Simple Controller',
                        url: res_url('apps', 'ngdemos/pages/4_controller.html'),
						script: res_url('apps', 'ngdemos/scripts/4_controller.js'),
						icon: 'fa-chevron-right'
                    },
                    {
                        title: 'Filtering and Sorting Data',
                        url: res_url('apps', 'ngdemos/pages/5_filtering.html'),
						script: res_url('apps', 'ngdemos/scripts/5_filtering.js'),
						icon: 'fa-chevron-right'
                    },
                    {
                        title: 'Simple Application w/Filtering',
                        url: res_url('apps', 'ngdemos/pages/6_simple.html'),
						icon: 'fa-chevron-right'
                    },
                    {
                        title: 'Using ng-init and ng-repeat w/Objects',
                        url: res_url('apps', 'ngdemos/pages/7_objects.html'),
						icon: 'fa-chevron-right'
                    },
                    {
                        title: 'Using Multiple Controllers',
                        url: res_url('apps', 'ngdemos/pages/8_multiple.html'),
						script: res_url('apps', 'ngdemos/scripts/8_multiple.js'),
						icon: 'fa-chevron-right'
                    },
                    {
                        title: 'Using Select Element',
                        url: res_url('apps', 'ngdemos/pages/9_select.html'),
						script: res_url('apps', 'ngdemos/scripts/9_select.js'),
						icon: 'fa-chevron-right'
                    },
                    {
                        title: 'Using Dropdown Menu',
                        url: res_url('apps', 'ngdemos/pages/10_dropdown.html'),
						script: res_url('apps', 'ngdemos/scripts/10_dropdown.js'),
						icon: 'fa-chevron-right'
                    },
                    {
                        title: 'MSOS-AngularJS, Ultra Simple',
                        url: '',
                        href: 'simple.html',
						icon: 'fa-external-link'
                    },
                    {
                        title: 'MSOS-AngularJS, Simple Routing',
                        url: '',
                        href: 'route.html',
						icon: 'fa-external-link'
                    },
                    {
                        title: 'MSOS-AngularJS, Simple Script Injection',
                        url: '',
                        href: 'script.html',
						icon: 'fa-external-link'
                    },
                    {
                        title: 'MSOS-AngularJS, Switchable Grid',
                        url: '',
                        href: 'switchable_grid.html',
						icon: 'fa-external-link'
                    },
					{
                        title: 'MSOS-AngularJS w/Std. Bootstrap-UI',
                        url: '',
                        href: 'bootstrap.html',
						icon: 'fa-external-link'
                    },
					{
                        title: 'MSOS-AngularJS, w/Lazy Loading Modular Bootstrap-UI',
                        url: '',
                        href: 'bootstrap2.html',
						icon: 'fa-external-link'
                    },
					{
                        title: 'Localstorage Module',
                        url: '',
                        href: 'localstorage.html',
						icon: 'fa-external-link'
                    },
					{
                        title: 'MobileSiteOS Culture Loading',
                        url: '',
                        href: 'culture.html',
						icon: 'fa-external-link'
                    },
                    {
                        title: 'Customer Invoicing App',
                        url: '',
                        href: 'invoicing.html',
						icon: 'fa-external-link'
                    },
                    {
                        title: 'Customer Management App',
                        url: '',
                        href: 'customer.html',
						icon: 'fa-external-link'
                    },
					{
                        title: 'Advanced Customer Mgt. App',
                        url: '',
                        href: 'customer2.html',
						icon: 'fa-external-link'
                    },
                    {
                        title: 'MongoLab Resource App',
                        url: '',
                        href: 'mongolab.html',
						icon: 'fa-external-link'
                    }
                ];

                $scope.loadPage = function (page) {

                    if (page.href) {
                        document.location = page.href;	// Load new page
                    }

					if (page.script)	{ get_script($scope, page); }
					else				{ get_template($scope, page); }
                }
            }
        );

		msos.console.debug(temp_sd + ' -> done!');
	}
);

msos.onload_func_done.push(
	function () {
		angular.bootstrap('body', ['apps.ngdemos.start']);
	}
);