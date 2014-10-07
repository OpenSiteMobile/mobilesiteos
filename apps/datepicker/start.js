
msos.provide('apps.datepicker.start');
msos.require('ng.ui.datetimepicker');
msos.require("bootstrap.dropdown");     // required for "Drop-down Datetime with input box" example
                                        // Ref. https://github.com/dalelotts/angular-bootstrap-datetimepicker/issues/73

msos.onload_functions.push(
	function () {

		var temp_sd = 'apps.datepicker.start -> ';

		msos.console.debug(temp_sd + 'start.');

		apps.datepicker.start = angular.module('apps.datepicker.start', ['ng.ui.datetimepicker']);

        apps.datepicker.start.controller(
            'MyController',
            function ($scope) {
                msos.console.debug(temp_sd + 'MyController added.');
            }
        );

		msos.console.debug(temp_sd + 'done!');
	}
);

msos.onload_func_done.push(function () { angular.bootstrap(document, ['apps.datepicker.start']); });