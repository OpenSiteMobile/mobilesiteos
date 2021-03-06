/**
 * The following features are still outstanding: popup delay, animation as a
 * function, placement as a function, inside, support for more triggers than
 * just mouse enter/leave, html popovers, and selector delegatation.
 */
msos.provide("ng.bootstrap.ui.popover");
msos.require("ng.bootstrap.ui.tooltip");

ng.bootstrap.ui.popover.version = new msos.set_version(15, 7, 7);


// Below is the standard ui.bootstrap.accordion plugin, except for templateUrl location and naming (MSOS style)
// ui.bootstrap.popover -> ng.bootstrap.ui.popover
// template/popover/popover.html -> msos.resource_url('ng', 'bootstrap/ui/tmpl/popover.html')
angular.module('ng.bootstrap.ui.popover', ['ng.bootstrap.ui.tooltip'])

.directive('popoverTemplatePopup', function() {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            title: '@',
            contentExp: '&',
            placement: '@',
            popupClass: '@',
            animation: '&',
            isOpen: '&',
            originScope: '&'
        },
        templateUrl: msos.resource_url('ng', 'bootstrap/ui/tmpl/popover-template.html')
    };
})

.directive('popoverTemplate', ['$tooltip', function($tooltip) {
    return $tooltip('popoverTemplate', 'popover', 'click', {
        useContentExp: true
    });
}])

.directive('popoverPopup', function() {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            title: '@',
            content: '@',
            placement: '@',
            popupClass: '@',
            animation: '&',
            isOpen: '&'
        },
        templateUrl: msos.resource_url('ng', 'bootstrap/ui/tmpl/popover.html')
    };
})

.directive('popover', ['$tooltip', function($tooltip) {
    return $tooltip('popover', 'popover', 'click');
}]);