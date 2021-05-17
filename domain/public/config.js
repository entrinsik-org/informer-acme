(function() {
    'use strict';

    function domainConfig(componentProvider) {
        componentProvider.component('acmeLogin', '<md-input-container class="md-block" md-no-float><md-icon md-font-icon="material-icons">person</md-icon><input name="username" ng-model="$component.ngModel.auth.username" type="text" placeholder="Username"> </md-input-container><md-input-container class="md-block" md-no-float><md-icon md-font-icon="material-icons">lock</md-icon><input name="password" ng-model="$component.ngModel.auth.password" type="password" placeholder="Password"></md-input-container>');
        componentProvider.component('acmeDomainEdit', '/assets/acme-domain/acme-domain-edit.html');
    }

    angular.module('informer').config(domainConfig);
})();
