'use strict';

angular.module('dropzoneApp.auth', [
  'dropzoneApp.constants',
  'dropzoneApp.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
