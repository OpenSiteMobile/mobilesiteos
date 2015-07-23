
msos.provide("apps.bootstrap2.controllers.modal");
msos.require("ng.bootstrap.ui.modal");


apps.bootstrap2.controllers.modal.version = new msos.set_version(14, 8, 6);

angular.module(
    'apps.bootstrap2.controllers.modal', ['ng.bootstrap.ui.modal']
).controller(
    'apps.bootstrap2.controllers.modal.ctrl',
    [
        '$scope', '$modal', '$log',
        function ($scope, $modal, $log) {

            $scope.items = ['item1', 'item2', 'item3'];

            $scope.animationsEnabled = true;

            $scope.open = function (size) {

                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: msos.resource_url('apps','bootstrap2/tmpl/modal_demo.html'),
                    controller: function ($scope, $modalInstance, items) {

                        $scope.items = items;
                        $scope.selected = {
                            item: $scope.items[0]
                        };

                        $scope.ok = function () {
                            $modalInstance.close($scope.selected.item);
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    },
                    size: size,
                    resolve: {
                        items: function() {
                            return $scope.items;
                        }
                    }
                });

                modalInstance.result.then(function (selectedItem) {
                    $scope.selected = selectedItem;
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            };

            $scope.toggleAnimation = function () {
                $scope.animationsEnabled = !$scope.animationsEnabled;
            };
        }
    ]
);
