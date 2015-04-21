'use strict';

/**
 * @ngdoc overview
 * @name tollsApp
 * @description
 * # tollsApp
 *
 * Main module of the application.
 */
angular
  .module('tollsApp', [
    'ngAnimate',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'leaflet-directive'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainController',
        controllerAs: 'MainCtrl'
      });
  });
