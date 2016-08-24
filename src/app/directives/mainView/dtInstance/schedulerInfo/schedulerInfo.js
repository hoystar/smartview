"use strict";

require('./schedulerInfo.less');

var moduleName = "app.schedulerInfo";

var toast = require('../../../../services/toast/toast');
var TYPE = require('../../../../services/objectType');
var type = require("../../../../services/process/type");
var HttpRequest = require("../../../../services/httpCenter/request");
var EVENTS = require("../../../../services/events");
var instanceUtil=require("../../../../services/instance/status");
let moment = require("moment");
var exploreService = require("../../../../services/exploreRange/exploreRange.js");
var execExploreModal = require("../../../../services/modal/execExploreModal/modal")
let exploreTreeCtrl = require("../../../../services/exploreTree/exploreTree");
var app = angular.module(moduleName, [
  require("../../../dtDefineTreeDag/dtDefineTreeDag"),
  require("../../../../services/modal/execExploreModal/modal")
]);

app.directive("schedulerInfo", ["$state","nzTreeModel", "execExploreModal","$rootScope",
  function($state, nzTreeModel,execExploreModal,$rootScope) {
    return {
      restrict: "AE",
      replace: true,
      scope: {
        schedulerData: "=",
        schedulerCanvasId:"="
      },
      controller: [
      "$scope", "$stateParams",
      function($scope, $stateParams){

        var self = this;
        self.instanceUtil=instanceUtil;
        let treeModel = new nzTreeModel([]);
        self.treeModel = treeModel;

        var time;
        self.svgCanvasId = $scope.schedulerCanvasId;
        self.dagId = "info-dag";
        $scope.$watch(function() {
          return $scope.schedulerData.isRequest;
        }, function(newValue, oldValue) {
          if (newValue) {
            self.schedulerInfo = $scope.schedulerData.schedulerInfo;
            self.graph = $scope.schedulerData.graph;
            self.outputItems = $scope.schedulerData.outputItems;
            self.schedulerId = $scope.schedulerData.schedulerId;
          }
        });
        

      }],
      controllerAs: "schedulerInfo",
      link: function(scope,element,attrs){

      },
      template: require('./schedulerInfo.html')
    }
  }
])


module.exports = moduleName;