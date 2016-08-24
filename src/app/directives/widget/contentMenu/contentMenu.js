"use strict";

require('./contentMenu.less');

var moduleName = "app.contentMenu";

var app = angular.module(moduleName, []);

app.directive("contentMenu", [
  function() {
    return {
      restrict: "AE",
      replace: true,
      scope: {
        "info": "=",
        "click": "=",
        "type": "="
      },
      controller: [
        "$scope",
        function($scope) {

        }
      ],
      controllerAs: "contentMenu",
      link: function(scope, element, attrs) {

        let type = scope.type || "cxtMenu";

        $(document).on("click." + type, function(event) {
          scope.info.isShow = false;
          scope.info.x = 0;
          scope.info.y = 0;
          scope.info.data = [];
          scope.$digest();
        })

        scope.$on("$destroy", function() {
          $(document).off("click." + type);
        });
      },
      template: require('./contentMenu.html')
    }
  }
])


module.exports = moduleName;
