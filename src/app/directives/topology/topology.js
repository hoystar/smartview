"use strict";

require('./topology.less');

var moduleName = "app.topology";

import TopologyCtrl from "../../services/topology/topology";

import HttpRequest from "../../services/httpCenter/request";

import EVENTS from "../../services/events";

var app = angular.module(moduleName, []);

app.directive("topology", [
  "$stateParams",
  function($stateParams) {
    return {
      restrict: "AE",
      replace: true,
      scope: {
        data: "=",
        selected: "="
      },
      controller: [
        function() {

        }
      ],
      controllerAs: "topology",
      link: function(scope, element, attrs) {

        let self = scope.topology;

        let svg = $(element).find("#topology-svg");
        let height = $(element).height();
        let width = $(element).width();

        let topologyCtrl = new TopologyCtrl({
          height: height,
          width: width,
          svg: svg[0]
        });

        topologyCtrl.eventProxy.on(EVENTS.OPEN_TABLE_PAGE, function(code) {
          window.open("/page/smartview/tablePage?code=" + code + "&dsId=" + $stateParams.id);
        });

        let unWatcher = scope.$watch("data", function(newValue, oldValue) {
          if (newValue && newValue.edges && newValue.vertexs) {
            topologyCtrl.draw(newValue);
            unWatcher();
          }
        }, true);

        scope.$on(EVENTS.LOCATE_POSITION, function(event, data) {
          topologyCtrl.locatePosition(data);
        });

        scope.$watch("selected", function(newValue, oldValue) {
          if (newValue) {
            topologyCtrl.focusNodes(newValue);
          }
        }, true);

        scope.$on(EVENTS.TOPOLOGY_LOCATE_STATUS, function(event, selected, isLocate) {
          if (isLocate) {
            topologyCtrl.hideAll();
          } else {
            topologyCtrl.showAll();
          }
        });
      },
      template: require('./topology.html')
    }
  }
])


module.exports = moduleName;
