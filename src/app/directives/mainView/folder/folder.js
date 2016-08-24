"use strict";

require('./folder.less');

let HttpRequest = require("../../../services/httpCenter/request");
let toast = require("../../../services/toast/toast");
let EVENTS = require("../../../services/events");
import folderEditCtrl from "../../../services/folderEdit/folderEditCtrl";

var moduleName = "app.folder";

var app = angular.module(moduleName, [
  require("../../folderComponent/folderDag/folderDag"),
  require("../../dragLayout/dragLayout"),
]);

app.directive("folder", [
  "$rootScope", "$state",
  function($rootScope, $state) {
    return {
      restrict: "AE",
      replace: true,
      scope: {
        folderInfo: "="
      },
      controller: [
        "$scope",
        function($scope) {}
      ],
      controllerAs: "folder",
      link: function(scope, element, attrs) {
        let self = scope.folder;
        self.navs = [{
          value: 5,
          text: "主题域"
        }, {
          value: 10,
          text: "视图"
        }];
        self.currentTag = self.navs[0].value;
        self.isFolderBosNotEmpty = false;
        self.isCanvasBosNotEmpty = false;
        self.folderEditCtrl = folderEditCtrl;
        self.folderData = {};
        scope.$watch(function() {
          return scope.folderInfo.id
        }, function(newValue, oldValue) {
          if (newValue) {
            self.folderData.folderId = scope.folderInfo.id;
            self.folderData.folderStatus = scope.folderInfo.status;
            self.folderData.folderBosList = scope.folderInfo.bosList;
            var folderBosList = scope.folderInfo.bosList.filter(function(item){
              return item.objectType === 5;
            });
            var canvasBosList =  scope.folderInfo.bosList.filter(function(item){
              return item.objectType === 10;
            });
            self.isFolderBosNotEmpty = (folderBosList && folderBosList.length > 0);
            self.isCanvasBosNotEmpty = (canvasBosList && canvasBosList.length > 0);
            if (scope.folderInfo.id == -1) {
              self.folderData.folderCanvas = scope.folderInfo.topSubject;
            } else {
              self.folderData.folderInfo = scope.folderInfo.folderData;
              if (self.folderData.folderInfo.parentId !== -1) {
                self.folderEditCtrl.getFolderData({
                  folderId: self.folderData.folderInfo.parentId
                }).then(function(parentData) {
                  self.folderData.folderInfo.parentName = parentData.name;
                  scope.$digest();
                });
              }
              self.folderData.folderCanvas = scope.folderInfo.folderCanvas;
            }
          }
        }, true);


        self.changeNav = function(value, event) {
          self.currentTag = value;
        }

        self.gotoDeeper = function(item) {
          $rootScope.$broadcast(EVENTS.TAGSBAR_ADD_NODE, {
            item:item
          });
        }
      },
      template: require('./folder.html')
    }
  }
])


module.exports = moduleName;