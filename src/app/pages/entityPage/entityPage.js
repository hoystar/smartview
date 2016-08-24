"use strict";

require('./entityPage.less');

var HttpRequest = require("../../services/httpCenter/request");

var moduleName = "app.entityPage";

var app = angular.module(moduleName, [
  require("../../directives/breadCrumbs/breadCrumbs"),
  require("../../directives/clusterDag/clusterDag")
]);

app.controller("entityPageCtrl", [
    '$scope',
    "$stateParams",
    function($scope, $stateParams) {
      var self = this;
      let code = $stateParams.code;
      HttpRequest.getEntityDetail({
        code: code
      }).then(function(data) {
        var dataInfo = data;
        self.name = dataInfo.name;
        self.code = dataInfo.code;
        self.description = dataInfo.description;
        self.associatedLinks = dataInfo.associatedLinks;
        $scope.$digest();
      });

      HttpRequest.GetDomainField({
        domainCode: code,
        pageNum: 1,
        pageSize: 1000
      }).then(function(data) {
        self.entityData = data;
        $scope.$digest();
      }).catch((data)=>{
        console.log(data);
      });

      this.gotoLinkPage = function(code) {
        window.open("/page/smartview/relationPage?code=" + code);
      }
    }
  ])
  .config([
    "$stateProvider",
    function($stateProvider) {
      $stateProvider
        .state('entityPage', {
          url: '/page/smartview/entityPage?code',
          template: require('./entityPage.html'),
          controller: 'entityPageCtrl',
          controllerAs: 'entityPage'
        });
    }
  ]);


module.exports = moduleName;
