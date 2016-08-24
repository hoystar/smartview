"use strict";

require('./home.less');

var moduleName = "app.home";

var app = angular.module(moduleName, []);

app.controller("homeCtrl", [
    '$scope',
    function($scope) {

    }
  ])
  .config([
    "$stateProvider",
    function($stateProvider) {
      $stateProvider
        .state('home', {
          url: '/page/home',
          template: require('./home.html'),
          controller: 'homeCtrl',
          controllerAs: 'home'
        });
    }
  ]);


module.exports = moduleName;
