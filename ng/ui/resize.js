/**
* @license ngResize.js v1.1.0
* (c) 2014 Daniel Smith http://www.danmasta.com
* License: MIT
*/

(function (angular) {
	"use strict";

	// define ngResize module
	var ngResize = angular.module('ngResize', []);

	ngResize.provider(
		'resize',
		[function resizeProvider() {

			// store throttle time
			this.throttle = 100;

			// by default bind window resize event when service
			// is initialize/ injected for first time
			this.initBind = 1;

			// service object
			this.$get = ['$rootScope', '$window', '$interval',  function ($rootScope, $window, $interval) {
				var _this = this,
					bound = 0,
					timer = 0,
					resized = 0;

				// api to set throttle amount
				function setThrottle(throttle) {
					_this.throttle = throttle;
				}

				// api to get current throttle amount
				function getThrottle() {
					return _this.throttle;
				}

				// trigger a resize event on provided $scope or $rootScope
				function trigger($scope) {
					$scope = $scope || $rootScope;

					$scope.$broadcast(
						'resize',
						{
							width: $window.innerWidth,
							height: $window.innerHeight
						}
					);
				}

				// bind to window resize event, will only ever be bound
				// one time for entire app
				function bind() {
					if(!bound){
						var w = angular.element($window);
	
						w.on(
							'resize',
							function () {
								if (!resized) {
									timer = $interval(
										function () {
											if (resized) {
												resized = 0;
												$interval.cancel(timer);
												trigger();
											}
										},
										_this.throttle
									);
								}
	
								resized = 1;
							}
						);

						bound = 1;
						w.triggerHandler('resize');
					}
				}

				// unbind window scroll event
				function unbind() {
					if (bound) {
						var w = angular.element($window);

						w.off('resize');
						bound = 0;
					}
				}

				// by default bind resize event when service is created
				if (_this.initBind) { bind(); }

				// return api
				return {
					getThrottle: getThrottle,
					setThrottle: setThrottle,
					trigger: trigger,
					bind: bind,
					unbind: unbind
				};
			}];
		}]
	);

	ngResize.directive(
		'ngResize',
		['$parse', '$timeout', function ($parse, $timeout) {
			return {
				compile: function ($element, attr) {
					var fn = $parse(attr.ngResize);

					return function (scope) {
						scope.$on(
							'resize',
							function (event, data) {
								$timeout(
									function () {
										scope.$apply(
											function () {
												fn(scope, { $event: data });
											}
										);
									}
								);
							}
						);
					};
				}
			};
		}]
	);

}(window.angular));
