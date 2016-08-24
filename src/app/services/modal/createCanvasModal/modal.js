"use strict";

require("./modal.less");

var moduleName = "app.modal.createCanvasModal";

var HttpRequest = require("../../httpCenter/request");

let docTreeCtrl = require("../../docTree/docTreeCtrl");

var app = angular.module(moduleName, []);

app.factory("createCanvasModal", [
    "$uibModal",
    function($uibModal) {
      return function(params) {
        return $uibModal.open({
          animation: true,
          backdrop:false,
          template: require("./modal.html"),
          controller: 'createCanvasModalCtrl',
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
  .controller("createCanvasModalCtrl", [
    "$scope",
    "$stateParams",
    "$uibModalInstance",
    "params",
    function($scope, $stateParams, $uibModalInstance, params) {
      var self = this;
      this.config = {
        "name": "",
        "description": "",
        "status": "0",
        "modifier": "3",
        "modifiedVersion": 0
      }

      this.folderId = -1;
      this.isEditMode = params.isEditMode;
      if (params && params.isEditMode) {
        this.config.name = params.name;
        this.config.description = params.description;
        this.config.modifiedVersion = params.modifiedVersion;
        this.folderId = params.folderId;
        this.canvasId = params.canvasId;
      } else {
        this.canvasId = $stateParams.id;
      }

      let chain = docTreeCtrl.findChain(params);
      
      this.cancel = function() {
        $uibModalInstance.dismiss('cancel');
      }

      this.folderList1 = [];
      this.folderList2 = [];
      this.currentFolder1 = chain.length > 0 ? chain[0] : null;
      this.currentFolder2 = chain.length > 1 ? chain[1] : null;
      docTreeCtrl.getData({
        parentId: -1
      }).then((data) => {
        this.folderList1 = data.filter((item) => {
          return item.objectType === 5;
        });
        if (this.currentFolder1) {
          this.currentFolder1 = this.folderList1.filter((item) => {
            return this.currentFolder1.fieldId === item.fieldId;
          })[0];
        }
        $scope.$digest();
      });

      this.changeFolder1 = function() {
        docTreeCtrl.getData({
          parentId: this.currentFolder1.fieldId
        },true).then((data) => {
          this.folderList2 = data.filter((item) => {
            return item.objectType === 5;
          });
          if (this.currentFolder2) {
            this.currentFolder2 = this.folderList2.filter((item) => {
              return this.currentFolder2.fieldId === item.fieldId;
            })[0];
          }
          $scope.$digest();
        });
      }

      if (this.currentFolder1) {
        this.changeFolder1();
      }

      this.submit = function() {
        if (params && params.isEditMode) {
          _editCanvas();
        } else {
          _createCanvas();
        }
      }

      function _createCanvas() {
        let parentId = -1;
        if (self.currentFolder2) {
          parentId = self.currentFolder2.fieldId;
        } else if (self.currentFolder1) {
          parentId = self.currentFolder1.fieldId;
        }
        HttpRequest.CreateCanvas({
          "name": self.config.name,
          "description": self.config.description,
          "status": 0,
          "modifier": 3,
          "objectType": 10,
          "workspaceId": 1,
          "parentId": parentId
        }).then(function(data) {
          docTreeCtrl.addNode(parentId, {
            fieldId: data.id,
            name: self.config.name,
            objectType: 10
          });
          $uibModalInstance.close(data);
        }.bind(self));
      }

      function _editCanvas() {
        let parentId = -1;
        if (self.currentFolder2) {
          parentId = self.currentFolder2.fieldId;
        } else if (self.currentFolder1) {
          parentId = self.currentFolder1.fieldId;
        }
        HttpRequest.updateCanvas({
          "canvasId": self.canvasId,
          "name": self.config.name,
          "description": self.config.description,
          "modifier": 3,
          "modifiedVersion": self.config.modifiedVersion,
          "parentId": parentId
        }).then(function(data) {
          docTreeCtrl.updateNode(data);
          $uibModalInstance.close(data.canvasId);
        }.bind(self));        
      }

    }
  ])

module.exports = moduleName;
