"use strict";

require('./navBar.less');
var EVENTS = require("../../services/events");
var moduleName = "app.navBar";
var app = angular.module(moduleName, []);
app.directive("navBar", ["$rootScope",
  function($rootScope) {
    return {
      restrict: "AE",
      replace: true,
      controller: [
        "$scope",
        function($scope) {
          var self = this;
          self.folders = [{
            name: "主目录",
            folderId: -1,
            workspaceId: 1
          }];

          self.folders = [];
          $scope.$on(EVENTS.APPEND_NAV, function(event, data) {
            let newFolder = data[0];
            if (self.folders.length === 0) {
              self.folders[0] = {
                name: "主目录",
                folderId: -1,
                workspaceId: 1
              }
            }
            newFolder.forEach(function(item) {
              if (_.findIndex(self.folders, function(o) {
                  return o.folderId === item.folderId }) === -1) {
                self.folders.push(item);
              }
            });
            $scope.$digest();
          });
          this.navigation = function(item) {
            let data = {
              folderId: item.folderId,
              workspaceId: item.workspaceId
            };
            if (item.folderId === -1) {
              self.folders.splice(1);
            } else {
              self.folders.forEach(function(folder) {
                if (folder.folderId === item.folderId) {
                  self.folders.splice(_.findIndex(self.folders, folder) + 1);
                }
              });
            };
            if(self.folders.length===1){
              self.folders=[];
            }
            $rootScope.$broadcast(EVENTS.SHOW_SUBJECT_NAV, [data]);

          };
        }
      ],
      controllerAs: "navBar",
      link: function(scope, element, attrs) {

      },
      template: require('./navBar.html')
    }
  }
])


module.exports = moduleName;
