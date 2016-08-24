"use strict";

require('./doubleDirectiveDag.less');

import doubleDirectiveDag from "../../services/clutserDag/doubleDirectiveDag";

import EVENTS from "../../services/events";

var moduleName = "app.doubleDirectiveDag";

var app = angular.module(moduleName, [
  require("../clusterDag/clusterToolTips/clusterToolTips")
]);

app.directive("doubleDirectiveDag", [
  "$state",
  "$stateParams",
  function($state, $stateParams) {
    return {
      restrict: "AE",
      replace: true,
      scope: {
        tableInfo: "="
      },
      controller: [
        "$scope",
        function($scope) {

        }
      ],
      controllerAs: "doubleDirectiveDag",
      link: function(scope, element, attrs) {

        let self = scope.doubleDirectiveDag;
        let width = 0;
        let height = 0;
        let offset = $(element).find("#table-cluster-dag").offset();

        let guid = $stateParams.code;

        function init() {
          width = $(element).width();
          height = 450;
          $(element).find("#table-cluster-dag")
            .attr("width", width)
            .attr("height", height);
        }
        init();

        let layout = new doubleDirectiveDag({
          width: width,
          height: height
        });

        layout.draw({
          tableGuid: guid,
          tableName: scope.tableInfo.name,
          heat: 50,
          dataSourceGuid: scope.tableInfo.dsGuid
        });

        layout.eventProxy.on(EVENTS.CLUSTER_SHOW_TIPS, function(data) {
          data.x = (data.x + 15) + "px";
          data.y = (data.y - 100) + "px";
          self.tipsInfo = data;
          self.tipsInfo.isShow = true;
          scope.$applyAsync();
        });
        layout.eventProxy.on(EVENTS.CLUSTER_HIDE_TIPS, function() {
          self.tipsInfo.isShow = false;
          scope.$applyAsync();
        });
      },
      template: require('./doubleDirectiveDag.html')
    }
  }
])


module.exports = moduleName;
