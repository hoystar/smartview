"use strict";

require("./modal.less");

var moduleName = "app.modal.deleteFolderModal";

var HttpRequest = require("../../httpCenter/request");

let docTreeCtrl = require("../../docTree/docTreeCtrl"); //获取doc树控制器

let toast = require("../../toast/toast");


let EVENTS = require("../../events");

var app = angular.module(moduleName, []);

app.factory("deleteFolderModal", [
    "$uibModal",
    function($uibModal) {
      return function(params) {
        return $uibModal.open({
          animation: true,
          backdrop:false,
          template: require("./modal.html"),
          controller: 'deleteFolderModalCtrl',
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
  .controller("deleteFolderModalCtrl", [
    "$scope",
    "$uibModalInstance",
    "params",
    "$stateParams",
    "$rootScope",
    function($scope, $uibModalInstance, params, $stateParams,$rootScope) {
      var self = this;
      this.folderInfo = {
        name: params.item.name,
      };
      let folderId = params.item.branch.fieldId;
      this.submit = function() {
        $uibModalInstance.close('result');
        HttpRequest.DeleteFolderViaJson({
          "folderId": folderId
        }).then(function(data) {
          $rootScope.$broadcast(EVENTS.TAGSBAR_DELETE_NODE, {
            key: "docTree_folder_"+folderId
          });
          toast('success', '目录删除成功');
        }.bind(self));
      }

      this.cancel = function() {
        $uibModalInstance.dismiss('cancel');
      }

    }
  ])


module.exports = moduleName;
