"use strict";

require('./dragLayout.less');

var moduleName = "app.dragLayout";

var app = angular.module(moduleName, []);

app.directive("dragLayout", [
  "$rootScope",
  function($rootScope) {
    return {
      restrict: "AE",
      replace: true,
      scope: {
        type: "="
      },
      controller: [
        "$scope",
        function($scope) {

        }
      ],
      controllerAs: "layout",
      link: function(scope, element, attrs) {

        var self = scope.layout;
        let offset = {
          top: 0,
          left: 0
        };
        self.data = [];
        self.eventType = null;
        let searchBarRange = [];

        scope.$on("dragDagItem", function(event, data) {
          if (scope.type !== data.eventType) {
            return;
          }
          element.css("display", "block");
          self.data = data.data;
          self.eventType = data.eventType;
          offset.top = data.top;
          offset.left = data.left;
          updatePosition(data.x - data.left, data.y - data.top);
          searchBarRange = [data.searchBarX1, data.searchBarY1, data.searchBarX2, data.searchBarY2];
          $rootScope.$broadcast("selectedItem", self.data);
          scope.$digest();
        });

        $(element).on("mousemove", function(e) {
          updatePosition(e.clientX - offset.left, e.clientY - offset.top);
        })

        $(element).on("mouseup", function(e) {
          addItemToLayout(e.clientX, e.clientY);
          element.css("display", "none");
          self.data = [];
          scope.$digest();
        })

        function updatePosition(x, y) {
          $(element).find(".rect-box").css({
            top: y + "px",
            left: x + "px"
          })
        }

        function addItemToLayout(x, y) {
          //在搜索框内拖动
          if (x > searchBarRange[0] && y > searchBarRange[1] && x < searchBarRange[2] && y < searchBarRange[3]) {
            return;
          }
          //寻找svg的位置
          var result = self.data.map(function(item, index) {
            return {
              id: item.id,
              dsId: item.dsId,
              type: item.type,
              width: 60,
              height: 40,
              name: item.name,
              x: x,
              y: y + index * 90
            }
          });

          $rootScope.$broadcast("addItemsToLayout", {
            x: x,
            y: y,
            eventType: self.eventType,
            data: {
              nodes: result,
              links: []
            }
          });
        }

        scope.$on("addItemsToLayoutSuccess", function() {
          self.data.forEach(function(item) {
            if (item.isSelected) {
              item.isSelected = false;
            }
          });
        })
      },
      template: require('./dragLayout.html')
    }
  }
])


module.exports = moduleName;
