"use strict";

require('./multiDropdown.less');

var moduleName = "app.multiDropdown";

var app = angular.module(moduleName, []);

import EVENTS from "../../services/events";

app.directive("multiDropdown", [
  function() {
    return {
      restrict: "AE",
      replace: true,
      scope: {
        info: "="
      },
      controller: [
        "$scope",
        "$rootScope",
        function($scope, $rootScope) {
          $scope.isShow = true;
          $scope.openTagModal = function(item, event) {
            event.preventDefault();
            event.stopPropagation();

            $rootScope.$broadcast("showDetailentity", {
              domainCode : item.domainCode,
              nodes: item.nameChain.map(function(item) {
                return {
                  name: item
                }
              }),
              tags: item.tags ? item.tags.map(function(item) {
                return {
                  id: item.code,
                  name: item.name
                }
              }) : []
            });
          }
        }
      ],
      controllerAs: "multiDropdown",
      link: function(scope, element, attrs) {

      },
      template: require('./multiDropdown.html')
    }
  }
])


module.exports = moduleName;
