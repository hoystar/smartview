"use strict";

require('./instanceProcess.less');
var type = require("../../../../services/process/type");
var HttpRequest = require("../../../../services/httpCenter/request");
var moduleName = "app.instanceProcess";
let moment = require("moment");
var instanceUtil = require("../../../../services/instance/status");

var app = angular.module(moduleName, [
  require("../../../taskStatusDag/taskStatusDag"),
  require("../../../../services/modal/lookLogModal/modal")
]);

app.directive("instanceProcess", ["lookLogModal",
  function(lookLogModal) {
    return {
      restrict: "AE",
      replace: true,
      scope: {
        schedulerData: "="
      },
      controller: [
        "$scope", "$stateParams",
        function($scope, $stateParams) {
          let instanceId = 1;
          var self = this;
          self.instanceUtil = instanceUtil;
          self.svgCanvasId = "process-canvas";

          $scope.$watch("schedulerData", function(newValue, oldValue) {
            if (newValue) {
              self.status = newValue.status;
              self.loading = newValue.loading;
              self.graph = newValue.graph;
              self.instMap = newValue.instMap;
              self.errorStatus = newValue.errorStatus;
              self.highlightNodes = newValue.highlightNodes;
            }
          },true);
          self.toTimeString = function(timestamp) {
            return moment(timestamp).format("LLL");
          };
          self.lookLog = function(logsInfo) {
            lookLogModal({
              logsInfo: logsInfo
            });
          };
        }
      ],
      controllerAs: "page",
      link: function(scope, element, attrs) {
        
      },
      template: require('./instanceProcess.html')
    }
  }
])


module.exports = moduleName;
