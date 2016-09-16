
/*#######################################################################
  
  Dan Wahlin
  http://twitter.com/DanWahlin
  http://weblogs.asp.net/dwahlin
  http://pluralsight.com/training/Authors/Details/dan-wahlin

  #######################################################################*/


msos.provide('apps.customer.start');
msos.require('ng.route');
msos.require('apps.customer.controllers');
msos.require('apps.customer.directives');
msos.require('apps.customer.services');


msos.onload_functions.push(
	function () {

		var temp_sd = 'apps.customer.start -> ';

		msos.console.debug(temp_sd + 'start.');

        apps.customer.start = angular.module('apps.customer.start', ['ngRoute']);

        apps.customer.start.config(
            function ($routeProvider) {
                $routeProvider
                    .when(
                        '/customers',
                        {
                            controller: 'CustomersController',
                            templateUrl: msos.resource_url('apps', 'customer/partials/customers.html')
                        }
                    ).when(
                        '/customerorders/:customerID',
                        {
                            controller: 'CustomerOrdersController',
                            templateUrl: msos.resource_url('apps','customer/partials/customerOrders.html')
                        }
                    ).when(
                        '/orders',
                        {
                            controller: 'OrdersController',
                            templateUrl: msos.resource_url('apps','customer/partials/orders.html')
                        }
                    ).otherwise(
                        {
                            redirectTo: '/customers'
                        }
                    );
            }
        );

		msos.console.debug(temp_sd + 'done!');
	}
);

msos.onload_func_done.push(
	function () {
		angular.bootstrap('body', ['apps.customer.start']);
	}
);