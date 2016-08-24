"use strict";

require('./dataSourceConfigPage.less');

var moduleName = "app.dataSourceConfigPage";

import HttpRquest from "../../services/httpCenter/request";

var app = angular.module(moduleName, [
  require("../../services/modal/addDataSourceModal/modal"),
  require("../../services/modal/editDataSourceModal/modal"),
  require("../../services/modal/deleteDataSourceModal/modal")
]);

app.controller("dataSourceConfigPageCtrl", [
    '$scope',
    "$state",
    'addDataSourceModal',
    'editDataSourceModal',
    'deleteDataSourceModal',
    function($scope, $state, addDataSourceModal, editDataSourceModal, deleteDataSourceModal) {
      this.selected = [];
      this.list = [];
      this.addDataSourceModal = function() {
        addDataSourceModal({}).result.then((data) => {
          if (data != undefined) {
            this.list.push(data);
          }
        });
      }
      this.editDataSourceModal = function(item) {
        editDataSourceModal(item.dsId).result.then((data) => {
          if (data != undefined) {
            this.list.splice(this.list.indexOf(item), 1, data);
          }
        });
      }
      this.deleteDataSourceModal = function(item) {
        deleteDataSourceModal(item).result.then((data) => {
          if (data) {
            this.list.splice(this.list.indexOf(item), 1);
          }
        });
      }

      this.gotoTopology = function(id) {
        window.open("/page/topologyPage?id=" + id);
      }

      HttpRquest.GetDataSources().then((data) => {
        this.list = data;
        $scope.$digest();
      });
    }
  ])
  .config([
    "$stateProvider",
    function($stateProvider) {
      $stateProvider
        .state('systemConfigPage.dataSourceConfigPage', {
          url: '/dataSourceConfigPage',
          template: require('./dataSourceConfigPage.html'),
          controller: 'dataSourceConfigPageCtrl',
          controllerAs: 'page'
        });
    }
  ]);


module.exports = moduleName;
