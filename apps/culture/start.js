
msos.provide('apps.culture.start');
msos.require('ng.intl.fr');


msos.onload_func_done.push(
	function () {

		var temp_sd = 'apps.culture.start -> ';

		msos.console.debug(temp_sd + 'start.');

		apps.culture.start = angular.module('apps.culture.start', []);

        apps.culture.start.controller(
            'ExampleController',
            [
                '$scope',
                function($scope) {
                    $scope.amount = 1234.56;
                    $scope.current_date = new Date();
                }
            ]
        );

		angular.bootstrap('body', ['apps.culture.start']);

		msos.console.debug(temp_sd + 'done!');
	}
);