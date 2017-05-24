
msos.provide('apps.localstorage.start');
msos.require('ng.util.localstorage');

msos.onload_func_done.push(
	function () {

		var temp_ls = 'apps.localstorage.start -> ';

		msos.console.debug(temp_ls + 'start.');

        apps.localstorage.start = angular.module('apps.localstorage.start', ['ng.util.localstorage'])
            .config(
                [
                    'localStorageServiceProvider',
                    function (localStorageServiceProvider) {
                        localStorageServiceProvider.setPrefix('demoPrefix');
                    }
                ]
            ).controller(
                'DemoCtrl',
                [
                    '$scope',
                    'localStorageService',
                    function ($scope, localStorageService) {
            
                        $scope.$watch(
                            'localStorageDemo',
                            function (value) {
                                localStorageService.set('localStorageDemo', value);
                                $scope.localStorageDemoValue = localStorageService.get('localStorageDemo');
                            }
                        );
    
                        $scope.storageType = 'Local storage';
    
                        if (localStorageService.getStorageType().indexOf('session') >= 0) {
                            $scope.storageType = 'Session storage';
                        }
    
                        if (!localStorageService.isSupported) {
                            $scope.storageType = 'Cookie';
                        }
                    }
                ]
            );

		angular.bootstrap('body', ['apps.localstorage.start']);

		msos.console.debug(temp_ls + 'done!');
	}
);