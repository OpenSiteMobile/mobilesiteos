
msos.provide("ng.bootstrap.ui.progressbar");

ng.bootstrap.ui.progressbar.version = new msos.set_version(14, 12, 15);


// Below is the standard ui.bootstrap.accordion plugin, except for templateUrl location and naming (MSOS style)
// ui.bootstrap.progressbar -> ng.bootstrap.ui.progressbar
// template/progressbar/progress.html       -> msos.resource_url('ng', 'bootstrap/ui/tmpl/progress.html'),
// template/progressbar/bar.html            -> msos.resource_url('ng', 'bootstrap/ui/tmpl/bar.html'),
// template/progressbar/progressbar.html'   -> msos.resource_url('ng', 'bootstrap/ui/tmpl/progressbar.html')
angular.module('ng.bootstrap.ui.progressbar', [])

.constant('progressConfig', {
    animate: true,
    max: 100
})

.controller('ProgressController', ['$scope', '$attrs', 'progressConfig', function ($scope, $attrs, progressConfig) {
    var self = this,
        animate = angular.isDefined($attrs.animate) ? $scope.$parent.$eval($attrs.animate) : progressConfig.animate;

    this.bars = [];
    $scope.max = angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : progressConfig.max;

    this.addBar = function (bar, element) {
        if (!animate) {
            element.css({
                'transition': 'none'
            });
        }

        this.bars.push(bar);

        bar.$watch('value', function (value) {
            bar.percent = +(100 * value / $scope.max).toFixed(2);
        });

        bar.$on('$destroy', function () {
            element = null;
            self.removeBar(bar);
        });
    };

    this.removeBar = function (bar) {
        this.bars.splice(this.bars.indexOf(bar), 1);
    };
}])

.directive('progress', function () {
    return {
        restrict: 'EA',
        replace: true,
        transclude: true,
        controller: 'ProgressController',
        require: 'progress',
        scope: {},
        templateUrl: msos.resource_url('ng', 'bootstrap/ui/tmpl/progress.html')
    };
})

.directive('bar', function () {
    return {
        restrict: 'EA',
        replace: true,
        transclude: true,
        require: '^progress',
        scope: {
            value: '=',
            type: '@'
        },
        templateUrl: msos.resource_url('ng', 'bootstrap/ui/tmpl/bar.html'),
        link: function (scope, element, attrs, progressCtrl) {
            progressCtrl.addBar(scope, element);
        }
    };
})

.directive('progressbar', function () {
    return {
        restrict: 'EA',
        replace: true,
        transclude: true,
        controller: 'ProgressController',
        scope: {
            value: '=',
            type: '@'
        },
        templateUrl: msos.resource_url('ng', 'bootstrap/ui/tmpl/progressbar.html'),
        link: function (scope, element, attrs, progressCtrl) {
            progressCtrl.addBar(scope, angular.element(element.children()[0]));
        }
    };
});