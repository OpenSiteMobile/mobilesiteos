
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    apps: false
*/

msos.provide("apps.customer.controllers.customerorders");


apps.customer.start.controller(
    'CustomerOrdersController',
    ['$scope', '$routeParams', 'customersService', function ($scope, $routeParams, customersService) {
        "use strict";

        var temp_co = 'apps.customer.start.controller - CustomerOrdersController -> ',
            customerID;

        msos.console.debug(temp_co + 'start.');

        $scope.customer = {};
        $scope.ordersTotal = 0.00;

        // Grab customerID off of the route        
        customerID = ($routeParams.customerID) ? parseInt($routeParams.customerID, 10) : 0;

        if (customerID > 0) {
            $scope.customer = customersService.getCustomer(customerID);
        }

        msos.console.debug(temp_co + ' done!');
    }]
);
