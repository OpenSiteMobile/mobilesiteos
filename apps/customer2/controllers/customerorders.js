
msos.provide("apps.customer2.controllers.customerorders");

msos.console.info('apps.customer2.controllers.customerorders -> loaded.');

        apps.customer2.start.register.controller('CustomerOrdersController', function ($scope, $routeParams, customersService) {

            msos.console.info('apps.customer2.start.register.controller - CustomerOrdersController -> called.');

            $scope.customer = {};
            $scope.ordersTotal = 0.00;
        
            //I like to have an init() for controllers that need to perform some initialization. Keeps things in
            //one place...not required though especially in the simple example below
            init();
        
            function init() {
                msos.console.info('apps.customer2.start.register.controller - CustomerOrdersController - init -> initialized.');
                //Grab customerID off of the route        
                var customerID = ($routeParams.customerID) ? parseInt($routeParams.customerID) : 0;
                if (customerID > 0) {
                    $scope.customer = customersService.getCustomer(customerID);
                }
            }
        
        });