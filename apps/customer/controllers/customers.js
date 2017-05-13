
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    apps: false
*/

msos.provide("apps.customer.controllers.customers");


apps.customer.start.controller(
    'CustomersController',
    ['$scope', 'customersService', function ($scope, customersService) {
        "use strict";

        var temp_cc = 'apps.customer.start.controller - CustomersController -> ';

        msos.console.debug(temp_cc + 'start.');

        $scope.customers = customersService.getCustomers();

        $scope.insertCustomer = function () {
            var firstName = $scope.newCustomer.firstName,
                lastName = $scope.newCustomer.lastName,
                city = $scope.newCustomer.city;

                customersService.insertCustomer(firstName, lastName, city);

                $scope.newCustomer.firstName = '';
                $scope.newCustomer.lastName = '';
                $scope.newCustomer.city = '';
        };

        $scope.deleteCustomer = function (id) {
            customersService.deleteCustomer(id);
        };

        msos.console.debug(temp_cc + ' done!');
    }]
);