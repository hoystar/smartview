"use strict";

require('./systemConfigPage.less');

var moduleName = "app.systemConfigPage";

var app = angular.module(moduleName, [
  require("@ali/naza-left-sidebar")
]);

app.controller("systemConfigPageCtrl", [
    '$scope',
    "$state",
    function($scope, $state) {
      this.menu = [{
        titleFull: '数据源',
        titleShort: '数据源',
        state: 'systemConfigPage.dataSourceConfigPage'
      }, {
        titleFull: '成员管理',
        titleShort: '成员',
        state: 'systemConfigPage.a'
      }, {
        titleFull: '账户管理',
        titleShort: '账户',
        state: 'systemConfigPage.b'
      }, {
        titleFull: '创建主题域',
        titleShort: '创建',
        state: 'systemConfigPage.subjectCreatePage'
      }, {
        titleFull: '编辑主题域',
        titleShort: '编辑',
        state:'systemConfigPage.subjectEditPage'
      },{
        titleFull: '工作空间配置管理',
        titleShort: '配置',
        state:'systemConfigPage.workspaceConfig'
      },{
        titleFull: '实体关系管理',
        titleShort: '实体',
        state:'systemConfigPage.tmpOtmManagerPage'
      }];

      $state.go("systemConfigPage.dataSourceConfigPage");
    }
  ])
  .config([
    "$stateProvider",
    function($stateProvider) {
      $stateProvider
        .state('systemConfigPage', {
          url: '/page/systemConfigPage',
          template: require('./systemConfigPage.html'),
          controller: 'systemConfigPageCtrl',
          controllerAs: 'page'
        });
    }
  ]);


module.exports = moduleName;
