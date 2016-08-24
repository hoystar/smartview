"use strict";

require("./modal.less");

var moduleName = "app.modal.createFolderModal";

var HttpRequest = require("../../httpCenter/request");

let docTreeCtrl = require("../../docTree/docTreeCtrl");

let toast = require("../../toast/toast");

var app = angular.module(moduleName, []);

app.factory("createFolderModal", [
    "$uibModal",
    function($uibModal) {
      return function(params) {
        return $uibModal.open({
          animation: true,
          backdrop:false,
          template: require("./modal.html"),
          controller: 'createFolderModalCtrl',
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
  .controller("createFolderModalCtrl", [
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

      let folderId = $stateParams.id;
      if (params && params.isEditMode) {
        this.config.name = params.name;
        this.config.description = params.description;
        this.config.modifiedVersion = params.modifiedVersion;
        folderId = params.folderId;
      } else {
        folderId = $stateParams.id;
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
          _editFolder();
        } else {
          _saveFolder();
        }
      }

      function _saveFolder() {
        let parentId = -1;
        if (self.currentFolder2) {
          parentId = self.currentFolder2.fieldId;
        } else if (self.currentFolder1) {
          parentId = self.currentFolder1.fieldId;
        }
        HttpRequest.CreateFolderViaJson({
          "name": self.config.name,
          "description": self.config.description,
          "modifier": 3,
          "workspaceId": 1,
          "parentId": parentId,
          "pageName": self.config.pagename,
          "pageDescription": self.config.pagedescription
        }).then(function(data) {
          toast('success', '目录创建成功');
          docTreeCtrl.addNode(parentId, {
            fieldId: data.id,
            name: self.config.name,
            objectType: 5
          });
          $uibModalInstance.close(data.id);
        }.bind(self));
      }

      function _editFolder() {
        console.log("edit");
      }

    }
  ])

module.exports = moduleName;
