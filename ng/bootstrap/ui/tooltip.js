/**
 * The following features are still outstanding: animation as a
 * function, placement as a function, inside, support for more triggers than
 * just mouse enter/leave, html tooltips, and selector delegation.
 */

msos.provide("ng.bootstrap.ui.tooltip");

ng.bootstrap.ui.tooltip.version = new msos.set_version(14, 12, 15);


// Below is the standard ui.bootstrap.accordion plugin, except for templateUrl location and naming (MSOS style)
// ui.bootstrap.tooltip -> ng.bootstrap.ui.tooltip
// template/tooltip/tooltip-popup.html				-> msos.resource_url('ng', 'bootstrap/ui/tmpl/tooltip-popup.html'),
// template/tooltip/tooltip-html-unsafe-popup.html	-> msos.resource_url('ng', 'bootstrap/ui/tmpl/tooltip-html-unsafe-popup.html')
angular.module('ng.bootstrap.ui.tooltip', ['ng.bootstrap.ui.position', 'ng.bootstrap.ui.bindHtml'])

.provider('$tooltip', function () {
    // The default options tooltip and popover.
    var defaultOptions = {
        placement: 'top',
        animation: true,
        popupDelay: 0
    };

    // Default hide triggers for each show trigger
    var triggerMap = {
        'mouseenter': 'mouseleave',
        'click': 'click',
        'focus': 'blur'
    };

    // The options specified to the provider globally.
    var globalOptions = {};

    this.options = function (value) {
        angular.extend(globalOptions, value);
    };

    this.setTriggers = function setTriggers(triggers) {
        angular.extend(triggerMap, triggers);
    };

    function snake_case(name) {
        var regexp = /[A-Z]/g;
        var separator = '-';
        return name.replace(regexp, function (letter, pos) {
            return (pos ? separator : '') + letter.toLowerCase();
        });
    }

    this.$get = ['$window', '$compile', '$timeout', '$document', '$position', '$interpolate', function ($window, $compile, $timeout, $document, $position, $interpolate) {
        return function $tooltip(type, prefix, defaultTriggerShow) {
            var options = angular.extend({}, defaultOptions, globalOptions);

            function getTriggers(trigger) {
                var show = trigger || options.trigger || defaultTriggerShow;
                var hide = triggerMap[show] || show;
                return {
                    show: show,
                    hide: hide
                };
            }

            var directiveName = snake_case(type);

            var startSym = $interpolate.startSymbol();
            var endSym = $interpolate.endSymbol();
            var template = '<div ' + directiveName + '-popup ' + 'title="' + startSym + 'title' + endSym + '" ' + 'content="' + startSym + 'content' + endSym + '" ' + 'placement="' + startSym + 'placement' + endSym + '" ' + 'animation="animation" ' + 'is-open="isOpen"' + '>' + '</div>';

            return {
                restrict: 'EA',
                compile: function (tElem, tAttrs) {
                    var tooltipLinker = $compile(template);

                    return function link(scope, element, attrs) {
                        var tooltip;
                        var tooltipLinkedScope;
                        var transitionTimeout;
                        var popupTimeout;
                        var appendToBody = angular.isDefined(options.appendToBody) ? options.appendToBody : false;
                        var triggers = getTriggers(undefined);
                        var hasEnableExp = angular.isDefined(attrs[prefix + 'Enable']);
                        var ttScope = scope.$new(true);

                        var positionTooltip = function () {

                                var ttPosition = $position.positionElements(element, tooltip, ttScope.placement, appendToBody);
                                ttPosition.top += 'px';
                                ttPosition.left += 'px';

                                // Now set the calculated positioning.
                                tooltip.css(ttPosition);
                            };

                        // By default, the tooltip is not open.
                        // TODO add ability to start tooltip opened
                        ttScope.isOpen = false;

                        function toggleTooltipBind() {
                            if (!ttScope.isOpen) {
                                showTooltipBind();
                            } else {
                                hideTooltipBind();
                            }
                        }

                        // Show the tooltip with delay if specified, otherwise show it immediately
                        function showTooltipBind() {
                            if (hasEnableExp && !scope.$eval(attrs[prefix + 'Enable'])) {
                                return;
                            }

                            prepareTooltip();

                            if (ttScope.popupDelay) {
                                // Do nothing if the tooltip was already scheduled to pop-up.
                                // This happens if show is triggered multiple times before any hide is triggered.
                                if (!popupTimeout) {
                                    popupTimeout = $timeout(show, ttScope.popupDelay, false);
                                    popupTimeout.then(function (reposition) {
                                        reposition();
                                    });
                                }
                            } else {
                                show()();
                            }
                        }

                        function hideTooltipBind() {
                            scope.$apply(function () {
                                hide();
                            });
                        }

                        // Show the tooltip popup element.
                        function show() {

                            popupTimeout = null;

                            // If there is a pending remove transition, we must cancel it, lest the
                            // tooltip be mysteriously removed.
                            if (transitionTimeout) {
                                $timeout.cancel(transitionTimeout);
                                transitionTimeout = null;
                            }

                            // Don't show empty tooltips.
                            if (!ttScope.content) {
                                return angular.noop;
                            }

                            createTooltip();

                            // Set the initial positioning.
                            tooltip.css({
                                top: 0,
                                left: 0,
                                display: 'block'
                            });

                            // Now we add it to the DOM because need some info about it. But it's not
                            // visible yet anyway.
                            if (appendToBody) {
                                $document.find('body').append(tooltip);
                            } else {
                                element.after(tooltip);
                            }

                            positionTooltip();

                            // And show the tooltip.
                            ttScope.isOpen = true;
                            ttScope.$digest(); // digest required as $apply is not called
                            // Return positioning function as promise callback for correct
                            // positioning after draw.
                            return positionTooltip;
                        }

                        // Hide the tooltip popup element.
                        function hide() {
                            // First things first: we don't show it anymore.
                            ttScope.isOpen = false;

                            //if tooltip is going to be shown after delay, we must cancel this
                            $timeout.cancel(popupTimeout);
                            popupTimeout = null;

                            // And now we remove it from the DOM. However, if we have animation, we
                            // need to wait for it to expire beforehand.
                            // FIXME: this is a placeholder for a port of the transitions library.
                            if (ttScope.animation) {
                                if (!transitionTimeout) {
                                    transitionTimeout = $timeout(removeTooltip, 500);
                                }
                            } else {
                                removeTooltip();
                            }
                        }

                        function createTooltip() {
                            // There can only be one tooltip element per directive shown at once.
                            if (tooltip) {
                                removeTooltip();
                            }
                            tooltipLinkedScope = ttScope.$new();
                            tooltip = tooltipLinker(tooltipLinkedScope, angular.noop);
                        }

                        function removeTooltip() {
                            transitionTimeout = null;
                            if (tooltip) {
                                tooltip.remove();
                                tooltip = null;
                            }
                            if (tooltipLinkedScope) {
                                tooltipLinkedScope.$destroy();
                                tooltipLinkedScope = null;
                            }
                        }

                        function prepareTooltip() {
                            prepPlacement();
                            prepPopupDelay();
                        }

                        /**
                         * Observe the relevant attributes.
                         */
                        attrs.$observe(type, function (val) {
                            ttScope.content = val;

                            if (!val && ttScope.isOpen) {
                                hide();
                            }
                        });

                        attrs.$observe(prefix + 'Title', function (val) {
                            ttScope.title = val;
                        });

                        function prepPlacement() {
                            var val = attrs[prefix + 'Placement'];
                            ttScope.placement = angular.isDefined(val) ? val : options.placement;
                        }

                        function prepPopupDelay() {
                            var val = attrs[prefix + 'PopupDelay'];
                            var delay = parseInt(val, 10);
                            ttScope.popupDelay = !isNaN(delay) ? delay : options.popupDelay;
                        }

                        var unregisterTriggers = function () {
                                element.unbind(triggers.show, showTooltipBind);
                                element.unbind(triggers.hide, hideTooltipBind);
                            };

                        function prepTriggers() {
                            var val = attrs[prefix + 'Trigger'];
                            unregisterTriggers();

                            triggers = getTriggers(val);

                            if (triggers.show === triggers.hide) {
                                element.bind(triggers.show, toggleTooltipBind);
                            } else {
                                element.bind(triggers.show, showTooltipBind);
                                element.bind(triggers.hide, hideTooltipBind);
                            }
                        }
                        prepTriggers();

                        var animation = scope.$eval(attrs[prefix + 'Animation']);
                        ttScope.animation = angular.isDefined(animation) ? !! animation : options.animation;

                        var appendToBodyVal = scope.$eval(attrs[prefix + 'AppendToBody']);
                        appendToBody = angular.isDefined(appendToBodyVal) ? appendToBodyVal : appendToBody;

                        // if a tooltip is attached to <body> we need to remove it on
                        // location change as its parent scope will probably not be destroyed
                        // by the change.
                        if (appendToBody) {
                            scope.$on('$locationChangeSuccess', function closeTooltipOnLocationChangeSuccess() {
                                if (ttScope.isOpen) {
                                    hide();
                                }
                            });
                        }

                        // Make sure tooltip is destroyed and removed.
                        scope.$on('$destroy', function onDestroyTooltip() {
                            $timeout.cancel(transitionTimeout);
                            $timeout.cancel(popupTimeout);
                            unregisterTriggers();
                            removeTooltip();
                            ttScope = null;
                        });
                    };
                }
            };
        };
    }];
})

.directive('tooltipPopup', function () {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            content: '@',
            placement: '@',
            animation: '&',
            isOpen: '&'
        },
        templateUrl: msos.resource_url('ng', 'bootstrap/ui/tmpl/tooltip-popup.html')
    };
})

.directive('tooltip', ['$tooltip', function ($tooltip) {
    return $tooltip('tooltip', 'tooltip', 'mouseenter');
}])

.directive('tooltipHtmlUnsafePopup', function () {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            content: '@',
            placement: '@',
            animation: '&',
            isOpen: '&'
        },
        templateUrl: msos.resource_url('ng', 'bootstrap/ui/tmpl/tooltip-html-unsafe-popup.html')
    };
})

.directive('tooltipHtmlUnsafe', ['$tooltip', function ($tooltip) {
    return $tooltip('tooltipHtmlUnsafe', 'tooltip', 'mouseenter');
}]);

