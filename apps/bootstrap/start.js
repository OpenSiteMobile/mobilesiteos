
msos.provide('apps.bootstrap.start');
msos.require('ng.mobile.touch');
msos.require('ng.util.plunker');


apps.bootstrap.start.css = new msos.loader();

// Load the page specific css (but after ./config.js loaded css)
apps.bootstrap.start.css.load('apps_bootstrap_css_rainbow',	msos.resource_url('apps', 'bootstrap/css/rainbow.css'), 'css');
apps.bootstrap.start.css.load('apps_bootstrap_css_demo',	msos.resource_url('apps', 'bootstrap/css/demo.css'), 'css');

msos.onload_func_done.push(
	function () {
		"use strict";

		var BS_app,
			$injector,
			$controller,
			AppMainCtrl,
			builderUrl = "http://50.116.42.77:3001";

        BS_app = angular.module(
			'apps.bootstrap.start',
			['ui.bootstrap', 'ng.mobile.touch', 'ng.util.plunker'],
            function ($httpProvider) {
                FastClick.attach(document.body);
                delete $httpProvider.defaults.headers.common['X-Requested-With'];
            }
		);

        BS_app.controller('AccordionDemoCtrl', AccordionDemoCtrl);
        BS_app.controller('AlertDemoCtrl', AlertDemoCtrl);
        BS_app.controller('ButtonsCtrl', ButtonsCtrl);
        BS_app.controller('CarouselDemoCtrl', CarouselDemoCtrl);
        BS_app.controller('CollapseDemoCtrl', CollapseDemoCtrl);
        BS_app.controller('DatepickerDemoCtrl', DatepickerDemoCtrl);
        BS_app.controller('DropdownCtrl', DropdownCtrl);
        BS_app.controller('ModalDemoCtrl', ModalDemoCtrl);
        BS_app.controller('PaginationDemoCtrl', PaginationDemoCtrl);
        BS_app.controller('PopoverDemoCtrl', PopoverDemoCtrl);
        BS_app.controller('ProgressDemoCtrl', ProgressDemoCtrl);
        BS_app.controller('RatingDemoCtrl', RatingDemoCtrl);
        BS_app.controller('TabsDemoCtrl', TabsDemoCtrl);
        BS_app.controller('TimepickerDemoCtrl', TimepickerDemoCtrl);
        BS_app.controller('TooltipDemoCtrl', TooltipDemoCtrl);
        BS_app.controller('TypeaheadCtrl', TypeaheadCtrl);

        BS_app.controller(
            'MainCtrl',
            function ($scope, $http, $document, $modal, $location, orderByFilter) {

                $scope.showBuildModal = function () {
					var modalInstance = $modal.open(
							{
								templateUrl: 'buildModal.html',
								controller: 'SelectModulesCtrl',
								resolve: {
									modules: function () {
											return $http.get(builderUrl + "/api/bootstrap").then(function(response) {
											return response.data.modules;
										});
									}
								}
							}
						);
                };

                $scope.showDownloadModal = function () {
                    var modalInstance = $modal.open({
                        templateUrl: 'downloadModal.html',
                        controller: 'DownloadCtrl'
                    });
                };

				$scope.setScrollLoc = function () {
                    msos.console.info('MainCtrl - setScrollLoc -> path: ' + $location.path().substring(1));
                    // Allows us to navigate to the correct element on initialization
                    if ($location.path() !== '' && $location.path() !== '/') {
                        smoothScroll(document.getElementById($location.path().substring(1)), 500, function(el) {
                            $location.replace(el.id);
                        });
                    }
                };
            }
        );

        BS_app.controller(
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

        BS_app.controller(
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

		apps.bootstrap.start = BS_app;

		angular.bootstrap(document, ['apps.bootstrap.start']);

		function update_scroll_position() {
			var update_scope = angular.element(jQuery('body')).scope();

			update_scope.$apply(function () { update_scope.setScrollLoc(); });
		}

		setTimeout(update_scroll_position, 1500);
	}
);