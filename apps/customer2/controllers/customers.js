
msos.provide("apps.customer2.controllers.customers");

msos.console.info('apps.customer2.controllers.customers -> loaded.');

        apps.customer2.start.register.controller('CustomersController', function ($scope, customersService) {

            msos.console.info('apps.customer2.start.register.controller - CustomersController -> called.');

            init();

            function init() {
                msos.console.info('apps.customer2.start.register.controller - CustomersController - init -> initialized.');
                $scope.customers = customersService.getCustomers();
            }
        
            $scope.insertCustomer = function () {
                var firstName = $scope.newCustomer.firstName;
                var lastName = $scope.newCustomer.lastName;
                var city = $scope.newCustomer.city;
                customersService.insertCustomer(firstName, lastName, city);
                $scope.newCustomer.firstName = '';
                $scope.newCustomer.lastName = '';
                $scope.newCustomer.city = '';
            };
        
            $scope.deleteCustomer = function (id) {
                customersService.deleteCustomer(id);
            };
        });