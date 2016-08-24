"use strict";

require('./dateTimePicker.less');

var moduleName = "app.dateTimePicker";

var app = angular.module(moduleName, []);

app.directive("dateTimePicker", [
  "$timeout",
  function($timeout) {
    return {
      restrict: "AE",
      replace: true,
      scope: {
        showTime: "="
      },
      require: "ngModel",
      controller: [
        "$scope",
        function($scope) {

        }
      ],
      controllerAs: "dtPicker",
      link: function(scope, element, attrs, ngModel) {
        var self = scope.dtPicker;
        self.dt = new Date();

        self.opened = false;
        self.options = {
          startingDay: 1
        };
        self.showTime = scope.showTime;
        self.timePickerDT = new Date();


        self.openTimePicker = function($event) {
          $event.preventDefault();
          $event.stopPropagation();
          self.opened = !self.opened;
        };

        ngModel.$render = function() {
          self.dt = self.timePickerDT = (ngModel.$modelValue || new Date());
        };

        scope.$watch(function() {
          return self.dt;
        }, function(newValue, oldValue) {
          if (newValue) {
            let timeWrapper = moment(self.dt);
            let date = timeWrapper.format("YYYY-MM-DD");
            timeWrapper = moment(self.timePickerDT);
            let time = timeWrapper.format("HH:mm:ss");
            let finalDate = "";
            if (self.showTime) {
              finalDate = date + " " + time;
            } else {
              finalDate = date;
            }
            ngModel.$setViewValue(finalDate);
          }
        });
        scope.$watch(function() {
          return self.timePickerDT;
        }, function(newValue, oldValue) {
          if (newValue) {
            let timeWrapper = moment(self.dt);
            let date = timeWrapper.format("YYYY-MM-DD");
            timeWrapper = moment(self.timePickerDT);
            let time = timeWrapper.format("HH:mm:ss");
            let finalDate = "";
            if (self.showTime) {
              finalDate = date + " " + time;
            } else {
              finalDate = date;
            }
            ngModel.$setViewValue(finalDate);
          }
        });
      },
      template: require('./dateTimePicker.html')
    }
  }
])


module.exports = moduleName;
