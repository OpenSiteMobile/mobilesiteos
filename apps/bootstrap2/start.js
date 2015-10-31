
msos.provide('apps.bootstrap2.start');
msos.require("ng.bootstrap.ui.modal");
msos.require("ng.util.postloader");
msos.require("ng.util.smoothscroll");


apps.bootstrap2.start.css = new msos.loader();

// Load the page specific css (but after ./config.js loaded css)
apps.bootstrap2.start.css.load('apps_bootstrap_css_demo', msos.resource_url('apps', 'bootstrap/css/demo.css'), 'css');


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
				'ng.bootstrap.ui',
				'ng.bootstrap.ui.modal',
				'ng.util.postloader'
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

				var load_specific_module = function ($q, $rootScope, specific_name) {

						var defer = $q.defer(),
							module_name = 'apps.bootstrap2.controllers.' + specific_name;

						// Request specific module
						msos.require(module_name);

						// Resolve deferred module loading
						msos.onload_func_done.push(
							function () {

								// Register any just loaded AngularJS modules
								apps.bootstrap2.start.postloader.run_registration();

								// Let AngularJS do it's thing
								defer.resolve();
								$rootScope.$apply();

								ng.util.smoothscroll.fn(specific_name, 1000);
							}
						);

						// Run specific MobileSiteOS module code, plus MSOS dependencies, plus register AngularJS dependencies
						msos.run_onload();

						return defer.promise;
					},
					gen_routing_object = function (ui_name) {
						return {
							templateUrl : msos.resource_url('apps','bootstrap2/tmpl/' + ui_name + '.html'),
							controller  : 'apps.bootstrap2.controllers.' + ui_name + '.ctrl',
							resolve: {
								load: ['$q', '$rootScope', function ($q, $rootScope) {
									return load_specific_module($q, $rootScope, ui_name);
								}]
							}
						};
					};

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
            function ($scope, $http, $document, $modal, $location, orderByFilter, $postloader) {

                $scope.showBuildModal = function() {
                var modalInstance = $modal.open({
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
                    var modalInstance = $modal.open({
                        templateUrl: msos.resource_url('apps','bootstrap2/tmpl/download_modal.html'),
                        controller: 'DownloadCtrl'
                    });
                };

				apps.bootstrap2.start.postloader = $postloader;
            }
        );

        apps.bootstrap2.start.controller(
            'SelectModulesCtrl',
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
            }
        );

        apps.bootstrap2.start.controller(
            'DownloadCtrl',
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
            }
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