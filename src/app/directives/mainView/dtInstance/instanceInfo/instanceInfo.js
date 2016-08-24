"use strict";

require('./instanceInfo.less');
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
var moduleName = "app.instanceInfo";
var app = angular.module(moduleName, [
  require("../../../dtDefineTreeDag/dtDefineTreeDag"),
  require("../../../../services/modal/execExploreModal/modal")
]);

app.directive("instanceInfo", ["$state","nzTreeModel", "execExploreModal","$rootScope",
  function($state, nzTreeModel,execExploreModal,$rootScope) {
    return {
      restrict: "AE",
      replace: true,
      scope: {
        instanceData: "=",
        instanceCanvasId:"="
      },
      controller: [
        "$scope", "$stateParams",
        function($scope, $stateParams) {
          var self = this;
          self.instanceUtil=instanceUtil;
          let treeModel = new nzTreeModel([]);
          self.treeModel = treeModel;

          var time;
          self.svgCanvasId = $scope.instanceCanvasId;//"info-canvas";
          self.dagId = "info-dag";
          $scope.$watch(function() {
            return $scope.instanceData.isRequest;
          }, function(newValue, oldValue) {
            if (newValue) {
              self.instanceInfo = $scope.instanceData.instanceInfo;
              self.graph = $scope.instanceData.graph;
              self.outputItems = $scope.instanceData.outputItems;
              self.instanceId = $scope.instanceData.instanceId;
            }
          });
          self.execInstance = function() {
            HttpRequest.ExecExploreByInstanceID({
              instanceId: self.instanceId
            }).then((dataResult) => {
              toast('success', "实例ID:" + self.instanceId + "开始执行");
              let instResult = {
                  instanceId: self.instanceId,
                  id:dataResult.schedulerId,
                  schedulerId:dataResult.schedulerId,
                  name: "执行于"+moment(new Date()).format("YYYYMMDD HH:mm:ss"),                 
                  objectType: TYPE.EXPLORE_INSTANCE_RESULT
                };
                exploreTreeCtrl.addInstResult(self.instanceId, instResult);
            })
          };
          self.editInstance = function() {
            //todo
          };
          self.deleteInstance = function() {
            HttpRequest.DeleteDtInstance({
              instanceId: self.instanceId
            }).then((dataResult) => {
              $rootScope.$broadcast(EVENTS.TAGSBAR_DELETE_NODE, {
                  key: "exploreTree_instance_" + self.instanceId
              });
              toast('success', "实例" + self.instanceInfo.name + "删除成功!");
              let inst = {
                defineId: self.instanceInfo.parentId,
                description: self.instanceInfo.description,
                instanceId: self.instanceInfo.instanceId, 
                id: self.instanceInfo.instanceId,  
                name: self.instanceInfo.name,
                objectType: TYPE.EXPLORE_INSTANCE,
                triggeredBy: new Date().getTime(),
                triggeredOn: new Date().getTime()
              };
              exploreTreeCtrl.delInst(self.instanceInfo.parentId, inst);
            })
          };
          self.execCollect = function() {
            //todo
          };
        }
      ],
      controllerAs: "page",
      link: function(scope, element, attrs) {},
      template: require('./instanceInfo.html')
    }
  }
])


module.exports = moduleName;
