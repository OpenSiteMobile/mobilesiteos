/*#######################################################################
  
  Dan Wahlin
  http://twitter.com/DanWahlin
  http://weblogs.asp.net/dwahlin
  http://pluralsight.com/training/Authors/Details/dan-wahlin

  Normally like the break AngularJS controllers into separate files.
  Kept them together here since they're small and it's easier to look through them.
  example. 

  #######################################################################*/

msos.provide('apps.customer2.controllers');


msos.onload_functions.push(
	function () {

		var temp_cc = 'apps.customer2.controllers -> ';

        apps.customer2.start.controller('NavbarController', function ($scope, $location) {
            $scope.getClass = function (path) {
                if ($location.path().substr(0, path.length) == path) {
                    return true
                } else {
                    return false;
                }
            }
        });

        apps.customer2.start.controller('OrderChildController', function ($scope) {
            $scope.orderby = 'product';
            $scope.reverse = false;
            $scope.ordersTotal = 0.00;

            init();

            function init() {
                //Calculate grand total
                //Handled at this level so we don't duplicate it across parent controllers
                if ($scope.customer && $scope.customer.orders) {
                    var total = 0.00;
                    for (var i = 0; i < $scope.customer.orders.length; i++) {
                        var order = $scope.customer.orders[i];
                        total += order.orderTotal;
                    }
                    $scope.ordersTotal = total;
                }
            }

            $scope.setOrder = function (orderby) {
                if (orderby === $scope.orderby)
                {
                    $scope.reverse = !$scope.reverse;
                }
                $scope.orderby = orderby;
            };

        });

		msos.console.debug(temp_cc + 'done!');
	}
);