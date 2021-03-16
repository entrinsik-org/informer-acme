(function () {
    'use strict';

    function svgViewer ($sce) {
        var sce = $sce;
        return {
            restrict: 'E',
            link: function (scope, element) {
                scope.svg = null;
                scope.$watch('$model', function (model) {
                    scope.svg = sce.trustAsHtml(model);
                    scope.empty = !model;
                });
                element.addClass('svg-viewer');
            },
            template: `<div class="no-data" ng-if="empty"><div class="message">No Data to Display</div></div>
                       <div ng-if="!empty" ng-bind-html="svg" class="svg-viewer-wrapper"></div>`
        };
    }

    angular.module('informer').directive('svgViewer', svgViewer);
})();
