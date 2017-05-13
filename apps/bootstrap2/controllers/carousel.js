
msos.provide("apps.bootstrap2.controllers.carousel");
msos.require("ng.bootstrap.ui.carousel");


apps.bootstrap2.controllers.carousel.version = new msos.set_version(14, 8, 6);

angular.module(
    'apps.bootstrap2.controllers.carousel', []
).controller(
    'apps.bootstrap2.controllers.carousel.ctrl',
    [
        '$scope',
        function ($scope) {
            $scope.myInterval = 5000;

            var slides = $scope.slides = [];

            $scope.addSlide = function() {

                var newWidth = 600 + slides.length + 1;

                slides.push({
                    image: 'http://placekitten.com/' + newWidth + '/300',
                    text: ['More', 'Extra', 'Lots of', 'Surplus'][slides.length % 4] + ' ' + ['Cats', 'Kittys', 'Felines', 'Cutes'][slides.length % 4]
                });
            };

            for (var i = 0; i < 4; i += 1) {
                $scope.addSlide();
            }
        }
    ]
);