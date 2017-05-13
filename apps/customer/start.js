
/*#######################################################################
  
  Dan Wahlin
  http://twitter.com/DanWahlin
  http://weblogs.asp.net/dwahlin
  http://pluralsight.com/training/Authors/Details/dan-wahlin

  #######################################################################*/

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    apps: false
*/

msos.provide('apps.customer.start');
msos.require('ng.route');
msos.require('apps.customer.controllers');
msos.require('apps.customer.directives');
msos.require('apps.customer.services');

apps.customer.start = angular.module(
	'apps.customer.start',
	[
		'ngRoute',
		'ngAnimate',
		'ngSanitize',
		'ngPostloader',
		'ng.util.anchorscroll'
	]
).config(
	['$routeProvider', function ($routeProvider) {
		"use strict";

		$routeProvider
			.when(
				'/customers',
				{
					controller: 'CustomersController',
					templateUrl: msos.resource_url('apps', 'customer/tmpls/customers.html'),
					resolve: {
						load: ['$postload', function ($postload) {

							// Request specific demo module
							msos.require('apps.customer.controllers.customers');

							// Start AngularJS module registration process
							return $postload.run_registration();
						}]
					}
				}
			).when(
				'/customerorders/:customerID',
				{
					controller: 'CustomerOrdersController',
					templateUrl: msos.resource_url('apps', 'customer/tmpls/customerOrders.html'),
					resolve: {
						load: ['$postload', function ($postload) {

							// Request specific demo module
							msos.require('apps.customer.controllers.customerorders');

							// Start AngularJS module registration process
							return $postload.run_registration();
						}]
					}
				}
			).when(
				'/orders',
				{
					controller: 'OrdersController',
					templateUrl: msos.resource_url('apps', 'customer/tmpls/orders.html'),
					resolve: {
						load: ['$postload', function ($postload) {

							// Request specific demo module
							msos.require('apps.customer.controllers.orders');

							// Start AngularJS module registration process
							return $postload.run_registration();
						}]
					}
				}
			).when(
				'/about',
				{
					templateUrl: msos.resource_url('apps', 'customer/tmpls/about.html')
				}
			).otherwise(
				{
					redirectTo: '/customers'
				}
			);
	}]
);

msos.onload_func_done.push(
	function () {
		"use strict";

		var temp_sd = 'apps.customer.start -> ';

		msos.console.debug(temp_sd + 'start.');

		angular.bootstrap('body', ['apps.customer.start']);

		msos.console.debug(temp_sd + 'done!');
	}
);