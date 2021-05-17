(function () {
    'use strict';

    function acmeConfig($mdThemingProvider) {
        // Angular material design theme
        $mdThemingProvider
            .theme('default')
            .primaryPalette('blue-grey', { default: '600' })
            .warnPalette('red', { default: '400' })
            .accentPalette('green', { default: '500' });

        $('body').addClass('acme-informer');
    }

    angular.module('informer').config(acmeConfig);
})();
