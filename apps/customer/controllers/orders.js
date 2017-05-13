
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    apps: false
*/

msos.provide("apps.customer.controllers.orders");


apps.customer.start.controller(
    'OrdersController',
    ['$scope', 'customersService', function ($scope, customersService) {
        "use strict";

        var temp_do = 'apps.customer.controllers.orders - OrdersController';

        msos.console.debug(temp_do + ' -> start.');

        $scope.customers = [];
        $scope.customers = customersService.getCustomers();

        $scope.ordersTableUrl = function () {
            return msos.resource_url('apps', 'customer/tmpls/ordersTable.html');
        }

        msos.console.debug(temp_do + ' ->  done!');
    }]
);