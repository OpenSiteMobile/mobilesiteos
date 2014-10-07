
msos.provide("apps.customer2.controllers.orders");

msos.console.info('apps.customer2.controllers.orders -> loaded.');


        apps.customer2.start.register.controller('OrdersController', function ($scope, customersService) {

            msos.console.info('apps.customer2.start.register.controller - OrdersController -> called.');

            $scope.customers = [];

            init();

            function init() {
                msos.console.info('apps.customer2.start.register.controller - OrdersController - init -> initialized.');
                $scope.customers = customersService.getCustomers();
            }
        });