// These filters are searched for by the UI to use as default icons and labels
(function () {
    'use strict';

    //icon in menus
    function iconFilter () {
        return function () {
            return '/assets/acme/images/bubble-chart.svg';
        };
    }

    //default title of an unnamed chart (same as chart)
    function titleFilter ($filter) {
        //just default to the one that charts use
        return $filter('chartTitle');
    }

    //default subtitle of an unnamed chart (same as chart)
    function subtitleFilter ($filter) {
        //just default to the one that charts use
        return $filter('chartSubtitle');
    }

    //wire them in. the naming of the filters attaches them to your chart
    //the id of the visual plugin in routes/index.js + type of filter
    angular.module('informer')
        .filter('bubbleChartIcon', iconFilter)
        .filter('bubbleChartTitle', titleFilter)
        .filter('bubbleChartSubtitle', subtitleFilter);
})();
