
/*#######################################################################
  
  Dan Wahlin
  http://twitter.com/DanWahlin
  http://weblogs.asp.net/dwahlin
  http://pluralsight.com/training/Authors/Details/dan-wahlin

  #######################################################################*/


msos.provide('apps.customer2.start');
msos.require('ng.route');
msos.require('apps.customer2.controllers');
msos.require('apps.customer2.directives');
msos.require('apps.customer2.services');

apps.customer2.start = angular.module('apps.customer2.start', ['ngRoute']);

msos.onload_func_done.push(
	function () {

		var temp_sd = 'apps.customer2.start -> ';

		msos.console.debug(temp_sd + 'start.');

        apps.customer2.start.config([
			'$routeProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
            function ($routeProvider, $controllerProvider, $compileProvider, $filterProvider, $provide) {

				var load_specific_module = function ($q, $rootScope, module_name) {

						var defer = $q.defer();

						// Request specific module
						msos.require(module_name);
						
						// Resolve deferred module loading
						msos.onload_func_done.push(
							function () {
								defer.resolve();
								$rootScope.$apply();
							}
						);

						// Load specific module, plus dependencies
						msos.run_onload();

						return defer.promise;
					};

				apps.customer2.start.register = {
					controller: $controllerProvider.register,
					directive: $compileProvider.directive,
					filter: $filterProvider.register,
					factory: $provide.factory,
					service: $provide.service
				};

                $routeProvider
                    .when(
                        '/customers',
                        {
                            controller: 'CustomersController',
                            templateUrl: msos.resource_url('apps', 'customer2/partials/customers.html'),
							resolve: {
								load: ['$q', '$rootScope', function ($q, $rootScope) {
									return load_specific_module($q, $rootScope, 'apps.customer2.controllers.customers');
								}]
							}
                        }
                    ).when(
                        '/customerorders/:customerID',
                        {
                            controller: 'CustomerOrdersController',
                            templateUrl: msos.resource_url('apps','customer2/partials/customerOrders.html'),
							resolve: {
								load: ['$q', '$rootScope', function ($q, $rootScope) {
									return load_specific_module($q, $rootScope, 'apps.customer2.controllers.customerorders');
								}]
							}
                        }
                    ).when(
                        '/orders',
                        {
                            controller: 'OrdersController',
                            templateUrl: msos.resource_url('apps','customer2/partials/orders.html'),
							resolve: {
								load: ['$q', '$rootScope', function ($q, $rootScope) {
									return load_specific_module($q, $rootScope, 'apps.customer2.controllers.orders');
								}]
							}
                        }
					).when(
						'/about',
						{
							templateUrl: msos.resource_url('apps','customer2/partials/about.html')
						}
                    ).otherwise(
                        {
                            redirectTo: '/customers'
                        }
                    );
            }
        ]);

		angular.bootstrap('body', ['apps.customer2.start']);

		msos.console.debug(temp_sd + 'done!');
	}
);