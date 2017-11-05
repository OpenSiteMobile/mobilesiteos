
msos.provide('apps.bootstrap2.start');
msos.require("ng.bootstrap.ui.modal");
msos.require("ng.route");
msos.require("ng.util.smoothscroll");


apps.bootstrap2.start.css = new msos.loader();

// Load the page specific css (but after ./config.js loaded css)
apps.bootstrap2.start.css.load(msos.resource_url('apps', 'bootstrap/css/demo.css'), 'css');


msos.onload_functions.push(
	function () {
		"use strict";

		var temp_sd = 'apps.bootstrap2.start',
            builderUrl = "http://50.116.42.77:3001",
			avail_ui_demo_ctrls = [
				'accordion', 'alert', 'buttons', 'carousel', 'collapse', 'datepicker',
				'dropdown', 'modal', 'pagination', 'popover', 'progressbar', 'rating',
				'tabs', 'timepicker', 'tooltip', 'typeahead'
			],
			org_location = '';

		msos.console.debug(temp_sd + ' -> start.');

        apps.bootstrap2.start = angular.module(
			'apps.bootstrap2.start',
			[
				'ngRoute',
				'ngPostloader',
				'ng.bootstrap.ui',
				'ng.bootstrap.ui.modal'
			]
		).run(['$location', '$timeout', function ($location, $timeout) {
				// Special case: MSOS module(s) won't have time to load for initial hashtag.
				if ($location.path() !== '' && $location.path() !== '/') {
					msos.console.info(temp_sd + ' - run -> init content to show: ' + $location.path());
					// Save specific hashtag fragment
					org_location = $location.path().substring(1);
					// Set to use default page content (before routing)
					$location.path('/');
					// Reset $location, which updates page content (just like internal link routing)
					$timeout(
						function () {
							msos.console.debug(temp_sd + ' - run -> do $location replace.');
							$location.path(org_location).replace();
						},
						500
					);
				}
			}]
		);

		apps.bootstrap2.start.config([
			'$routeProvider',
            function ($routeProvider) {

				function gen_routing_object(ui_name) {
					return {
						templateUrl : msos.resource_url('apps','bootstrap2/tmpl/' + ui_name + '.html'),
						resolve: {
							load: ['$postload', function ($postload) {

								// Request specific apps module
								msos.require('apps.bootstrap2.controllers.' + ui_name);

								msos.onload_func_done.push(
									function () {
										ng.util.smoothscroll.fn(ui_name, 1000);
									}
								);

								// Start AngularJS module registration process
								return $postload.run_registration();
							}]
						}
					};
				}

				// Generate our applications routings
				$routeProvider.when(
					'/',
					{
						templateUrl : msos.resource_url('apps','bootstrap2/tmpl/welcome.html')
					}
				).when(
					'/welcome',
					{
						templateUrl : msos.resource_url('apps','bootstrap2/tmpl/welcome.html'),
						controller  : 'apps.bootstrap2.controllers.welcome.ctrl',
					}
				);

				jQuery.each(
					avail_ui_demo_ctrls,
					function (index, route) {
						$routeProvider.when('/' + route, gen_routing_object(route));
					}
				);

				$routeProvider.otherwise(
					{
						redirectTo: '/'
					}
				);
			}]
		);

        apps.bootstrap2.start.controller(
            'MainCtrl',
			['$scope', '$http', '$document', '$modal', '$location', 'orderByFilter', '$postload',
            function ($scope, $http, $document, $modal, $location, orderByFilter, $postload) {

                $scope.showBuildModal = function() {
				var modalInstance = null;
				
                modalInstance = $modal.open({
                    templateUrl: msos.resource_url('apps','bootstrap2/tmpl/build_modal.html'),
                    controller: 'SelectModulesCtrl',
                    resolve: {
                            modules: function() {
                                    return $http.get(builderUrl + "/api/bootstrap").then(function(response) {
                                    return response.data.modules;
                                });
                            }
                        }
                    });
                };

                $scope.showDownloadModal = function() {
					var modalInstance = null;

                    modalInstance = $modal.open({
                        templateUrl: msos.resource_url('apps','bootstrap2/tmpl/download_modal.html'),
                        controller: 'DownloadCtrl'
                    });
                };

				apps.bootstrap2.start.postloader = $postload;
            }]
        );

        apps.bootstrap2.start.controller(
            'SelectModulesCtrl',
			['$scope', '$modalInstance', 'modules',
            function($scope, $modalInstance, modules) {
                $scope.selectedModules = [];
                $scope.modules = modules;

                $scope.selectedChanged = function (module, selected) {
                    if (selected) {
                        $scope.selectedModules.push(module);
                    } else {
                        $scope.selectedModules.splice($scope.selectedModules.indexOf(module), 1);
                    }
                };

                $scope.downloadBuild = function () {
                    $modalInstance.close($scope.selectedModules);
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss();
                };

                $scope.download = function (selectedModules) {
                    var downloadUrl = builderUrl + "/api/bootstrap/download?";
                    angular.forEach(
                        selectedModules,
                        function(module) {
                            downloadUrl += "modules=" + module + "&";
                        }
                    );
                    return downloadUrl;
                };
            }]
        );

        apps.bootstrap2.start.controller(
            'DownloadCtrl',
			['$scope', '$modalInstance',
            function ($scope, $modalInstance) {
                $scope.options = {
                    minified: true,
                    tpls: true
                };

                $scope.download = function (version) {
                    var options = $scope.options;

                    var downloadUrl = ['ui-bootstrap-'];
                    if (options.tpls) {
                        downloadUrl.push('tpls-');
                    }
                    downloadUrl.push(version);
                    if (options.minified) {
                        downloadUrl.push('.min');
                    }
                    downloadUrl.push('.js');

                    return downloadUrl.join('');
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss();
                };
            }]
        );

		apps.bootstrap2.start.controller(
			'apps.bootstrap2.controllers.welcome.ctrl',
			function () {
				ng.util.smoothscroll.fn('welcome', 500);
			}
		);

		msos.console.debug(temp_sd + ' -> done!');
	}
);

msos.onload_func_done.push(
	function () {
		"use strict";

		angular.bootstrap('body', ['apps.bootstrap2.start']);
	}
);