"use strict";

require('./topologyPage.less');

import HttpRequest from "../../services/httpCenter/request";

import EVENTS from "../../services/events";

import COLORS from "../../services/topology/color";

var moduleName = "app.topologyPage";

var app = angular.module(moduleName, [
  require("../../directives/topology/topology"),
  require("../../directives/topologySearch/topologySearch")
]);

app.controller("topologyPageCtrl", [
    '$scope',
    "$stateParams",
    "$rootScope",
    function($scope, $stateParams, $rootScope) {

      this.selected = [];
      this.COLORS = COLORS.focusColor;

      var id = $stateParams.id;

      HttpRequest.GetTableSumInfo({
        dsId: id
      }).then((data) => {
        this.info = data;
        $scope.$digest();
      });

      this.graphData = {
        edges: null,
        vertexs: null
      };
      HttpRequest.GetTableGraph({
        dsId: id
      }).then((data) => {
        $.extend(this.graphData, data);
        $scope.$digest();
      });

      this.deleteSelected = function(target) {
        let index = this.selected.indexOf(target);
        target.isSelected = false;
        this.selected.splice(index, 1);
      }

      this.isLocate = false;
      $scope.$watch("page.isLocate", function(newValue, oldValue) {
        $rootScope.$broadcast(EVENTS.TOPOLOGY_LOCATE_STATUS, this.selected, this.isLocate);
      }.bind(this));

    }
  ])
  .config([
    "$stateProvider",
    function($stateProvider) {
      $stateProvider
        .state('topologyPage', {
          url: '/page/topologyPage?id',
          template: require('./topologyPage.html'),
          controller: 'topologyPageCtrl',
          controllerAs: 'page'
        });
    }
  ]);


module.exports = moduleName;
