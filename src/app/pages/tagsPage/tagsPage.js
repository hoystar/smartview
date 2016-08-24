"use strict";

require('./tagsPage.less');

var moduleName = "app.tagsPage";

var app = angular.module(moduleName, [
  require("../../directives/breadCrumbs/breadCrumbs"),
  require("../../directives/distributionPie/distributionPie"),
  require("../../directives/clusterDag/clusterDag")
]);
var URL = require("url");
var HttpRequest = require("../../services/httpCenter/request");
var toast = require('../../services/toast/toast');
app.controller("tagsPageCtrl", [
    '$scope',
    function($scope) {
      var self = this;
      var code = URL.parse(window.location.href, true).query.code;
      var domainCode = URL.parse(window.location.href, true).query.domainCode;
      self.domainCode = domainCode;
      HttpRequest.getTagDetail({
        tagCode: code,
        domainCode:domainCode
      }).then(function(data) {
        self.tagInfo = data;
        $scope.$digest();
        return self.tagInfo.categoryId;
      }).then(function(categoryId) {
        return HttpRequest.GetCategories({
          categoryId: categoryId
        });
      }).then(function(data) {
        self.categoryInfo = data;
        $scope.$digest();
      });


    }
  ])
  .config([
    "$stateProvider",
    function($stateProvider) {
      $stateProvider
        .state('tagsPage', {
          url: '/page/smartview/tagsPage?code',
          template: require('./tagsPage.html'),
          controller: 'tagsPageCtrl',
          controllerAs: 'tagsPage'
        });
    }
  ]);


module.exports = moduleName;
