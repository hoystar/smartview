"use strict";

require('./subcirbeDataPage.less');

var moduleName = "app.subcirbeDataPage";

var app = angular.module(moduleName, [
  require("../../directives/breadCrumbs/breadCrumbs")
]);

app.controller("subcirbeDataPageCtrl", [
    '$scope',
    function($scope) {

    }
  ])
  .config([
    "$stateProvider",
    function($stateProvider) {
      $stateProvider
        .state('subcirbeDataPage', {
          url: '/page/smartview/subcirbeDataPage',
          template: require('./subcirbeDataPage.html'),
          controller: 'subcirbeDataPageCtrl',
          controllerAs: 'subcirbeDataPage'
        });
    }
  ]);


module.exports = moduleName;
