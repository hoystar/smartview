"use strict";

require('./fourthStep.less');

var moduleName = "app.fourthStep";
var HttpRequest = require("../../../services/httpCenter/request");
var app = angular.module(moduleName, [
  require("../treeDag/treeDag")
]);

app.directive("fourthStep", [
  function() {
    return {
      restrict: "AE",
      replace: true,
      scope: {
        data: "="
      },
      controller: [
        "$scope",
        function($scope) {

        }
      ],
      controllerAs: "fourthStep",
      link: function(scope, element, attrs) {
        var self = scope.fourthStep;
      },
      template: require('./fourthStep.html')
    }
  }
])


module.exports = moduleName;
