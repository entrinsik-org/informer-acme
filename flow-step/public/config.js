(function () {
    'use strict';

    angular.module('informer').config(function(componentProvider) {
        componentProvider.component('exampleFlowFieldEdit', '/assets/acme-flow-example/example-step-tpl.html');
    });
})();
