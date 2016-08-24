"use strict";

require('./relationPage.less');

var moduleName = "app.relationPage";

var app = angular.module(moduleName, [
  require("../../directives/breadCrumbs/breadCrumbs"),
  require("../../directives/clusterDag/clusterDag")
]);

var HttpRequest = require("../../services/httpCenter/request");

app.controller("relationPageCtrl", [
    '$scope',
    '$stateParams',
    function($scope, $stateParams) {
      var self = this;
      let code = $stateParams.code;

      HttpRequest.GetLinkDetail({
        code: code
      }).then(function(data) {
        self.relationInfo = data;
        self.name = self.relationInfo.name;
        self.code = self.relationInfo.code;
        self.description = self.relationInfo.description;
        $scope.$digest();
      });

      HttpRequest.GetDomainField({
        domainCode: code,
        pageNum: 1,
        pageSize: 1000
      }).then(function(data) {
        self.linkData = data;
        $scope.$digest();
      });

      this.gotoEntityPage = function(code) {
        window.open("/page/smartview/entityPage?code=" + code);
      }
    }
  ])
  .config([
    "$stateProvider",
    function($stateProvider) {
      $stateProvider
        .state('relationPage', {
          url: '/page/smartview/relationPage?code',
          template: require('./relationPage.html'),
          controller: 'relationPageCtrl',
          controllerAs: 'relationPage'
        });
    }
  ]);


module.exports = moduleName;
