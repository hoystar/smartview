"use strict";

require("./modal.less");

var moduleName = "app.modal.editDataSourceModal";
import HttpRequest from "../../httpCenter/request";
let toast = require('../../toast/toast');
var editDSController = require("../../dataSource/editDataSource");
let _ = require("lodash");
var app = angular.module(moduleName, []);

app.factory("editDataSourceModal", [
    "$uibModal",
    function($uibModal) {
      return function(params) {
        return $uibModal.open({
          animation: true,
          backdrop: false,
          template: require("./modal.html"),
          controller: 'editDataSourceModalCtrl',
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
  .controller("editDataSourceModalCtrl", [
    "$scope",
    "$uibModalInstance",
    "params",
    function($scope, $uibModalInstance, params) {
      var self = this;
      self.editDSController = new editDSController();
      self.data = {};
      var init = function() {

        HttpRequest.GetDsTypeDetails({}).then((data) => {
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
          HttpRequest.GetDataSourceInfo({ dsId: params }).then((data) => {
            self.data = data;
            self.editDSController.baseProperty.map((item) => {
              item.value = self.data[item.name];
            });
            return Promise.resolve([]);
          }).then(() => {
            self.editDSController.extraProperty[self.data.type].map((item) => {
              item.value = self.data.connection[item.name];
            });
            self.editDSController.changeDataSourceType(self.data.type);
            $scope.$digest();
          }).catch((data) => {
            toast("error", "数据源详细信息获取失败！");
          });

        }).catch((data) => {
          toast("error", "数据源类型信息获取失败！");
        })
      }

      init();
      this.submit = function() {
        self.editDSController.getDsData().then((dataSource) => {
          if (dataSource !== undefined) {
            let updateParam = $.extend(true, { dsId: params }, dataSource);
            HttpRequest.UpdateDataSource(updateParam).then((data) => {
              toast("success", "数据源编辑成功！");
              $uibModalInstance.close(data);
            }).catch((data) => {
              toast("error", "数据源编辑失败！");
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
