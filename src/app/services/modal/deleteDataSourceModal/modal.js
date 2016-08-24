"use strict";

require("./modal.less");
import HttpRequest from "../../httpCenter/request";
let toast = require('../../toast/toast');
var moduleName = "app.modal.deleteDataSourceModal";
var app = angular.module(moduleName, []);

app.factory("deleteDataSourceModal", [
    "$uibModal",
    function($uibModal) {
      return function(params) {
        return $uibModal.open({
          animation: true,
          template: require("./modal.html"),
          backdrop: false,
          controller: 'deleteDataSourceModalCtrl',
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
  .controller("deleteDataSourceModalCtrl", [
    "$scope",
    "$uibModalInstance",
    "params",
    function($scope, $uibModalInstance, params) {
      var self = this;
      self.params = params;
      this.submit = function() {
        HttpRequest.DeleteDataSource({
          dsId: params.dsId
        }).then((data) => {
          toast("success", "数据源删除成功");
          $uibModalInstance.close(true);
        }).catch((data) => {
          toast("error", "数据源删除失败！");
          $uibModalInstance.close(false);
        })

      }

      this.cancel = function() {
        $uibModalInstance.dismiss('cancel');
      }
    }
  ])

module.exports = moduleName;
