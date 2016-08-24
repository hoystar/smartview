"use strict";
import HttpRequest from "../../services/httpCenter/request";
let toast = require('../../services/toast/toast');
require('./workspaceConfig.less');

var moduleName = "app.workspaceConfig";

var app = angular.module(moduleName, []);

app.controller("workspaceConfigCtrl", [
    '$scope',
    function($scope) {
      var self = this;
      self.propertyCache = {};
      let DATATYPE = { "TEXT": 1, "NUMERIC": 2, "PASSWORD": 3 };
      self.workspaceInfo = [];
      self.hasEdit = false;
      var init = function() {
        HttpRequest.GetWorkSpaceInfo({ wsId: 1 }).then((data) => {
          $.extend(true, self.workspaceInfo, data);
          self.workspaceInfo.map((item) => {
            let extendProperty = { isEdit: false, isEnums: false };
            if (item.options !== undefined) {
              extendProperty.isEnums = true;
            }
            $.extend(true, item, extendProperty);
            return item;
          });
          $scope.$digest();
        }).catch((data) => {
          toast("error", "工作空间信息获取失败！");
        });
      };
      var getBytesLength = function(str) {
        return str.replace(/[^\x00-\xff]/g, 'xx').length;
      }
      init();
      var vertifyProperty = function(item) {
        var result = true;
        if (getBytesLength(item.value) > item.length) {
          toast("error", "长度过长");
          result = false;
        }
        if (item.type === DATATYPE.NUMERIC && isNaN(item.value)) {
          toast("error", "请输入一个数字");
          result = false;
        }
        return result;
      };
      self.startEdit = function(item) {
        item.isEdit = true;
        self.propertyCache[item.name] = item.value;
      };

      self.cancleEdit = function(item) {
        item.value = self.propertyCache[item.name];
        item.isEdit = false;
      };

      self.finishEdit = function(item) {
        if (vertifyProperty(item)) {
          self.hasEdit = true;
          item.isEdit = false;
          self.propertyCache[item.name] = item.value;
        }
      };
      var _hasFinishEdit = function() {
        let result = true;
        self.workspaceInfo.map((item) => {
          if (item.isEdit) {
            result = false;
          }
        });
        return result;
      }

      self.updateWorkspaceInfo = function() {

        if (!_hasFinishEdit()) {
          toast("error", "存在属性没有完成编辑,不能保存！");
          return;
        }
        if (!self.hasEdit) {
          toast("warning", "没有属性进行了编辑");
          return;
        }
        let params = { wsId: 1 };
        let _obj = {};
        self.workspaceInfo.map((item) => {
          _obj[item.name] = item.value;
        });
        params["data"] = _obj;
        HttpRequest.UpdateWorkSpaceInfo(params).then((data) => {
          toast("success", "工作空间信息保存成功！");
          self.hasEdit = false;
          $scope.$digest();
        }).catch((data) => {
          toast("error", "工作空间信息保存失败！");
        });

      };

    }
  ])
  .config([
    "$stateProvider",
    function($stateProvider) {
      $stateProvider
        .state('systemConfigPage.workspaceConfig', {
          url: '/workspaceConfig',
          template: require('./workspaceConfig.html'),
          controller: 'workspaceConfigCtrl',
          controllerAs: 'workspaceConfig'
        });
    }
  ]);


module.exports = moduleName;
