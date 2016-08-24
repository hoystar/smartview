"use strict";

require('./tablePage.less');

var URL = require("url");

import HttpRequest from "../../services/httpCenter/request";

var moduleName = "app.tablePage";

var app = angular.module(moduleName, [
  require("../../directives/breadCrumbs/breadCrumbs"),
  require("../../directives/doubleDirectiveDag/doubleDirectiveDag")
]);

app.controller("tablePageCtrl", [
    '$scope',
    "$stateParams",
    function($scope, $stateParams) {
      let self = this;
      let navs = [{
        value: "FieldDetail",
        text: "字段信息"
      }, {
        value: "PartitionDetail",
        text: "分区信息"
      }, {
        value: "clusterDag",
        text: "血缘信息"
      }, {
        value: "constraintDetail",
        text: "约束条件"
      }];

      self.currentTag = navs[0].value;
      self.clusterData = null;
      HttpRequest.GetTableDetail({
        dsId: $stateParams.dsId,
        tableGuid: $stateParams.code
      }).then((data) => {
        self.clusterData = data;
        update(data);
        $scope.$digest();
      });

      function update(data) {
        if (data.dsType.toLocaleLowerCase() === "odps") {
          self.navs = navs.filter((item) => {
            return item.value !== "constraintDetail";
          });
        } else {
          self.navs = navs.filter((item) => {
            return item.value !== "PartitionDetail";
          });
        }
        self.detail = data;
        self.detail.partitions && self.detail.partitions.forEach((item) => {
          let time = new Date(item.createdOn);
          item.createdOn = time.getFullYear() + "/" + (time.getMonth() + 1) + "/" + time.getDate() + " " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
        })
      }

      this.changeTag = function(item) {
        self.currentTag = item.value;
      }
    }
  ])
  .config([
    "$stateProvider",
    function($stateProvider) {
      $stateProvider
        .state('tablePage', {
          url: '/page/smartview/tablePage?code&dsId',
          template: require('./tablePage.html'),
          controller: 'tablePageCtrl',
          controllerAs: 'page'
        });
    }
  ]);


module.exports = moduleName;
