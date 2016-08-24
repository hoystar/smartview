"use strict";

require('./roadMap.less');

var moduleName = "app.roadMap";

var app = angular.module(moduleName, []);

app.directive("roadMap", [
  function() {
    return {
      restrict: "AE",
      replace: true,
      scope: {
        step: "="
      },
      controller: [
        "$scope",
        function($scope) {

        }
      ],
      controllerAs: "roadMap",
      link: function(scope, element, attrs) {
        var self = scope.roadMap;
        self.data = [{
          step: "Step1",
          name: "确认视图"
        }, {
          step: "Step2",
          name: "输出与输入"
        }, {
          step: "Step3",
          name: "路径确认"
        }, {
          step: "Step4",
          name: "提交表单"
        }]

      },
      template: require('./roadMap.html')
    }
  }
])

module.exports = moduleName;
