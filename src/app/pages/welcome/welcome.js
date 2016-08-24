"use strict";

require('./welcome.less');

var HttpRequest = require("../../services/httpCenter/request");
let tabsBarCache = require("../../services/mainView/mainViewCache");

var moduleName = "app.welcome";

var app = angular.module(moduleName, [
  require("../../directives/starBg/starBg"),
  require("../../directives/welcomeDag/welcomeDag")
]);

app.controller("welcomeCtrl", [
    '$scope',
    "$state",
    function($scope, $state) {
      tabsBarCache.init();
    }
  ])
  .config([
    "$stateProvider",
    function($stateProvider) {
      $stateProvider
        .state('welcome', {
          url: '/page/welcome',
          template: require('./welcome.html'),
          controller: 'welcomeCtrl',
          controllerAs: 'welcome'
        });
    }
  ]);

module.exports = moduleName;
