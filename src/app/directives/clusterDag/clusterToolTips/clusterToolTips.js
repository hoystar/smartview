"use strict";

require('./clusterToolTips.less');

var moduleName = "app.clusterToolTips";

import HttpRequest from "../../../services/httpCenter/request";

var app = angular.module(moduleName, []);

app.directive("clusterToolTips", [
  function() {
    return {
      restrict: "AE",
      replace: true,
      scope: {
        info: "="
      },
      controller: [
        "$scope",
        function($scope) {
          let cache = {};
          let self = this;

          $scope.$watch("info.data", function(newValue) {
            if (newValue) {
              update(newValue);
            }
          });

          function update(data) {

            HttpRequest.GetBloodInfo({
              tableGuid: data.tableGuid,
              bloodline: true
            }).then((data) => {
              self.detail = data;
              $scope.$digest();
            });
          }

          this.closeTips = function() {
            $scope.info.isShow = false;
          }
        }
      ],
      controllerAs: "tips",
      link: function(scope, element, attrs) {

      },
      template: require('./clusterToolTips.html')
    }
  }
])


module.exports = moduleName;
