"use strict";

require('./appCheckbox.less');

var moduleName = "app.appCheckbox";

var app = angular.module(moduleName, []);

app.directive("appCheckbox", [
  function() {
    return {
      restrict: 'A',
      scope: {
        model: '=ngModel',
        checked: "=checked",
        unchecked: "=unchecked"
      },
      link: function(scope, element, attrs, ngModel) {
        function toggleChecked() {
          if (scope.model) {
            element.addClass("checked");
          } else {
            element.removeClass("checked");
          }
        }

        element.on('click', function() {
          scope.$apply(function() {
            if (scope.model == true) {
              if (scope.unchecked) scope.unchecked();
              scope.model = false;

            } else {
              if (scope.checked) scope.checked();
              scope.model = true;
            }
          })

          toggleChecked();
        });

        scope.$watch('model', function(val) {
          toggleChecked();
        });

        scope.$on("$destroy", function() {
          element.off("click");
        })
      }
    }
  }
])


module.exports = moduleName;
