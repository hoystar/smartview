"use strict";

require('./conditiontips.less');
var EVENTS = require("../../../services/events");
var conditionArray = require("../../../services/widget/conditionObject");
var moduleName = "app.conditiontips";
var _ = require("lodash");
var app = angular.module(moduleName, []);
let PathDag = require("../../../services/pathDag/pathDag");
app.directive("conditiontips", [
  function() {
    return {
      restrict: "AE",
      replace: true,
      scope: {
        "info": "="
      },
      controller: [
        "$scope",
        function($scope) {
          var self = this;
          $scope.$watch("info", function(newValue, oldValue) {
            self.conditionValue = undefined;
            if (_.get(newValue, "data.info.condition")) {
              conditionArray.conditionObject.forEach((item) => {
                if (newValue.data.info.condition.contrast === item.value) {
                  newValue.data.info.condition.contrast = item.name;
                }
              });
              if (newValue.data.info.condition.rightValue !== undefined) {
                self.conditionValue = newValue.data.info.condition.rightValue.value;
              }
            }
          }.bind(self));
        }
      ],
      controllerAs: "conditiontips",
      link: function(scope, element, attrs) {

      },
      template: require('./conditiontips.html')
    }
  }
])
module.exports = moduleName;
