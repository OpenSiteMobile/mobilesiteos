// Define a new module. This time we declare a dependency on
// the ngResource module, so we can work with the Instagram API

// The controller. Notice that I've included our instagram service which we
// defined below. It will be available inside the function automatically.

msos.provide('apps.switchable.start');
msos.require("ng.util.resource");


msos.onload_func_done.push(
	function () {
		"use strict";

		apps.switchable.start = angular.module('apps.switchable.start', ['ng.util.resource']);

		// Create and register the new "instagram" service
		apps.switchable.start.factory(
			'instagram',
			['$resource',  function ($resource) {

				return {
					fetchPopular: function (callback) {
	
						// The ngResource module gives us the $resource service. It makes working with
						// AJAX easy. Here I am using a client_id of a test app. Replace it with yours.
	
						var api = $resource(
								'https://api.instagram.com/v1/media/popular?client_id=:client_id&callback=JSON_CALLBACK',
								{
									client_id: msos.config.social.instagram
								},
								{
									// This creates an action which we've chosen to name "fetch". It issues
									// an JSONP request to the URL of the resource. JSONP requires that the
									// callback=JSON_CALLBACK part is added to the URL.
									fetch:{method:'JSONP'}
								}
							);
	
						api.fetch(
							function (response) {
								// Call the supplied callback function
								callback(response.data);
							}
						);
					}
				};
			}]
		);

		apps.switchable.start.controller(
            'SwitchableGridController',
			['$scope', 'instagram', function ($scope, instagram) {
				// Default layout of the app. Clicking the buttons in the toolbar
				// changes this value.
				$scope.layout = 'grid';
				$scope.pics = [];

				// Use the instagram service and fetch a list of the popular pics
				instagram.fetchPopular(
					function (data){
						// Assigning the pics array will cause the view
						// to be automatically redrawn by Angular.
						$scope.pics = data;

						msos.console.debug('apps.switchable.start - SwitchableGridController - instagram.fetchPopular -> data:', data);
					}
				);
			}]
		);

		angular.bootstrap('body', ['apps.switchable.start']);
	}
);


