
msos.provide("ng.bootstrap.ui.alert");

ng.bootstrap.ui.alert.version = new msos.set_version(14, 12, 14);


// Below is the standard plugin, except for templateUrl location and naming (MSOS style)
// ui.bootstrap.alert -> ng.bootstrap.ui.alert
// template/alert/alert.html -> msos.resource_url('ng', 'bootstrap/ui/tmpl/alert.html')
angular.module('ng.bootstrap.ui.alert', [])

.controller('AlertController', ['$scope', '$attrs', function ($scope, $attrs) {
    $scope.closeable = 'close' in $attrs;
    this.close = $scope.close;
}])

.directive('alert', function () {
    return {
        restrict: 'EA',
        controller: 'AlertController',
        templateUrl: msos.resource_url('ng', 'bootstrap/ui/tmpl/alert.html'),
        transclude: true,
        replace: true,
        scope: {
            type: '@',
            close: '&'
        }
    };
})

.directive('dismissOnTimeout', ['$timeout', function ($timeout) {
    return {
        require: 'alert',
        link: function (scope, element, attrs, alertCtrl) {
            $timeout(function () {
                alertCtrl.close();
            }, parseInt(attrs.dismissOnTimeout, 10));
        }
    };
}]);