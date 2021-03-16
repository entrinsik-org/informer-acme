(function () {
    'use strict';
    //define components here. svgViewer is defined
    function config(componentProvider) {
        componentProvider.component('svgViewer', '<svg-viewer ></svg-viewer>');
        componentProvider.component('bubbleChartEditor', '<bubble-chart-editor layout flex model="$component.ngModel"></bubble-chart-editor>');
    }

    angular.module('informer')
        .config(config);
})();