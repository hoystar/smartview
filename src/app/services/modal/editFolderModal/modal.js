"use strict";

require("./modal.less");

var moduleName = "app.modal.editFolderModal";

var HttpRequest = require("../../httpCenter/request");

let docTreeCtrl = require("../../docTree/docTreeCtrl");

let toast = require("../../toast/toast");

var app = angular.module(moduleName, []);

app.factory("editFolderModal", [
    "$uibModal",
    function($uibModal) {
      return function(params) {
        return $uibModal.open({
          animation: true,
          backdrop:false,
          template: require("./modal.html"),
          controller: 'editFolderModalCtrl',
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
  .controller("editFolderModalCtrl", [
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

      HttpRequest.GetFolderInfo({
        folderId
      }).then(function(data) {
        this.folderInfo = {
          name: data.name,
          owner: data.owner,
          parentId: data.parentId,
          pageName: data.pageName,
          pageDescription: data.pageDescription,
          description: data.description,
          modifier: data.modifier,
          modifiedVersion: data.modifiedVersion,
          status: data.status,
        };
        $scope.$digest();
      }.bind(this));
    
      if (params && params.isEditMode) {
        this.config.name = params.name;
        this.config.description = params.description;
        this.config.modifiedVersion = params.modifiedVersion;
        folderId = params.folderId;
      } else {
        folderId = $stateParams.id;
      }

      this.cancel = function() {
        $uibModalInstance.dismiss('cancel');
      }

      this.submit = function() {
        HttpRequest.UpdateFolderViaJson({
          "folderId": folderId,
          "name": this.folderInfo.name,
          "description": this.folderInfo.description,
          "modifier": this.folderInfo.modifier,
          "pageName": this.folderInfo.pageName,
          "pageDescription": this.folderInfo.pageDescription,
          "modifiedVersion": this.folderInfo.modifiedVersion,
        }).then(function(data) {
          toast('success', '目录更新成功');
        }.bind(self));
      }
    }
  ])

module.exports = moduleName;
