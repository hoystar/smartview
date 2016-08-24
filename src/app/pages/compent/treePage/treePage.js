"use strict";

require('./treePage.less');
let EVENTS = require("../../../services/events");
let TYPE = require("../../../services/objectType");

var moduleName = "app.treePage";

var app = angular.module(moduleName, [
  require("../../../directives/docTree/docTree"),
  require("../../../directives/canvasTree/canvasTree"),
  require("../../../directives/exploreTree/exploreTree")
]);

app.controller("treePageCtrl", [
    '$rootScope',
    '$scope',"$state",
    function($rootScope, $scope,$state) {
      var self = this;
      this.menus = [{
        key: "标准视图",
        value: "docTree"
      }, {
        key: "发现视图",
        value: "canvasTree"
      }, {
        key: "数据探索",
        value: "dataExplore"
      }];

      this.currentTag = this.menus[0];
      $scope.$on(EVENTS.CHANGE_MAIN_VIEW, function(event, data) {
        if (data.onlyKey.indexOf(TYPE.FOLDER+":") !== -1 || data.onlyKey.indexOf(TYPE.CANVAS+":") !== -1) {
          self.currentTag = self.menus[0];
        } else if (data.onlyKey.indexOf(TYPE.EXPLORE_HISTORY_INSTANCE+":") !== -1) {
          self.currentTag = self.menus[1];
        } else if (data.onlyKey.indexOf(TYPE.EXPLORE_FOLDER+":") !== -1 || data.onlyKey.indexOf(TYPE.EXPLORE_INSTANCE+":") !== -1 || data.onlyKey.indexOf(TYPE.EXPLORE_INSTANCE_RESULT+":") !== -1) {
          self.currentTag = self.menus[2];
        }
        $scope.$applyAsync()
      });
    }
  ])
  .config([
    "$stateProvider",
    function($stateProvider) {
      $stateProvider
        .state('treePage', {
          url: '',
          template: require('./treePage.html'),
          controller: 'treePageCtrl',
          controllerAs: 'page',
          abstract: true
        });
    }
  ]);


module.exports = moduleName;