'use strict';

angular.module('dropzoneApp', [
  'dropzoneApp.auth',
  'dropzoneApp.admin',
  'dropzoneApp.constants',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap',
  'validation.match'
])
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });
