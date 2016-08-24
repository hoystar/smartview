"use strict";

require("./modal.less");

var moduleName = "app.modal.canvasListModal";

var HttpRequest = require("../../httpCenter/request");

var app = angular.module(moduleName, []);

app.factory("canvasListModal", [
    "$uibModal",
    function($uibModal) {
      return function(params) {
        return $uibModal.open({
          animation: true,
          template: require("./modal.html"),
          controller: 'canvasListModalCtrl',
          controllerAs: 'modal',
          resolve: {
            params: function() {
              return params
            }
          }
        });
      }
    }
  ])
  .controller("canvasListModalCtrl", [
    "$scope",
    "$uibModalInstance",
    "params",
    function($scope, $uibModalInstance, params) {
      var self = this;

      self.data = [];

      HttpRequest.CanvasList({
        workspaceId: 1,
        objectTypes: 10,
        pageNum: 1,
        pageSize: 1000
      }).then(function(data) {
        self.data = data.data.map(function(item) {
          var date = new Date(item.createdOn);
          item.createdOnDate = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
          item.isSelected = false;
          return item;
        });
        $scope.$digest();
      });

      this.selectedItem = function(item) {
        self.data.forEach(function(item) {
          item.isSelected = false;
        });
        item.isSelected = true;
      }

      this.submit = function() {
        for (var i = 0; i < self.data.length; i++) {
          if (self.data[i].isSelected) {
            // window.location.href = "/page/smartview?id=" + self.data[i].id;
            $uibModalInstance.close(self.data[i]);
            return;
          }
        }
      }

      this.cancel = function() {
        $uibModalInstance.dismiss('cancel');
      }
    }
  ])

module.exports = moduleName;
