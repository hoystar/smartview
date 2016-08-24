"use strict";

require("./modal.less");

import HttpRequest from "../../httpCenter/request";
let toast = require('../../toast/toast');
var moduleName = "app.modal.addDataSourceModal";
var editDSController = require("../../dataSource/editDataSource");
let _ = require("lodash");
var app = angular.module(moduleName, []);

app.factory("addDataSourceModal", [
    "$uibModal",
    function($uibModal) {
      return function(params) {
        return $uibModal.open({
          animation: true,
          backdrop: false,
          template: require("./modal.html"),
          controller: 'addDataSourceModalCtrl',
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
  .controller("addDataSourceModalCtrl", [
    "$scope",
    "$uibModalInstance",
    "params",
    function($scope, $uibModalInstance, params) {
      var self = this;
      self.editDSController = new editDSController();
      var init = function() {

        HttpRequest.GetDsTypeDetails().then((data) => {
          self.editDSController.dataSourceList = data.map((item) => {
            self.editDSController.extraProperty[item.name] = item.fields.map((fieldItem) => {
              let _field = {
                value: null,
                inputType: "input",
                isRequired: true
              };
              if (fieldItem.type === 3) {
                _field.inputType = "password";
              }
              return $.extend(true, fieldItem, _field);
            });
            return item.name;
          });
          return Promise.resolve([]);
        }).then(() => {
          self.editDSController.changeDataSourceType(self.editDSController.dataSourceList[0]);
        });
      }
      init();

      this.submit = function() {
        self.editDSController.getDsData().then((dataSource) => {
          if (dataSource !== undefined) {
            HttpRequest.CreateDataSource(dataSource).then((data) => {
              toast("success", "数据源创建成功！");
              $uibModalInstance.close(data);
            }).catch((data) => {
              toast("error", "数据源创建失败！");
              $uibModalInstance.close();
            });
          }

        });


      }

      this.cancel = function() {
        $uibModalInstance.dismiss('cancel');
      }
    }
  ])

module.exports = moduleName;
