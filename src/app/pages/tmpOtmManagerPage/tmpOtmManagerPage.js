"use strict";

require('./tmpOtmManagerPage.less');

var moduleName = "app.tmpOtmManagerPage";

var app = angular.module(moduleName,[]);

app.controller("tmpOtmManagerPageCtrl",[
  '$scope',
  function($scope){

}])
.config([
  "$stateProvider",
  function($stateProvider){
    $stateProvider
      .state('systemConfigPage.tmpOtmManagerPage', {
        url: '/tmpOtmManagerPage',
        template: require('./tmpOtmManagerPage.html'),
        controller: 'tmpOtmManagerPageCtrl',
        controllerAs: 'tmpOtmManagerPage'
      });
  }
]);


module.exports = moduleName;
