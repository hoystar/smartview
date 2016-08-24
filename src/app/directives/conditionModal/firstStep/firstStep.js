"use strict";

require('./firstStep.less');

let moduleName = "app.firstStep";

let Layout = require("../../../services/dag/exploreLayout");

let EVENTS = require("../../../services/events");

let app = angular.module(moduleName, [
  require("../../searchBar/searchBar"),
  require("../../widget/contentMenu/contentMenu"),
  require("../../dragLayout/dragLayout")
]);

app.directive("firstStep", [
  "$rootScope",
  function($rootScope) {
    return {
      restrict: "AE",
      replace: true,
      scope: {
        data: "=",
        step: "="
      },
      controller: [
        "$scope",
        function($scope) {

        }
      ],
      controllerAs: "firstStep",
      link: function(scope, element, attrs) {
        let self = scope.firstStep;

        let width = $(element).width();
        let height = $(element).height();
        let offset = $(element).offset();

        self.SEARCHTYPE = "firstStep";

        $(element).find("#step-svg-canvas")
          .attr("width", width)
          .attr("height", height);

        self._cxtMenuData = {};
        self.clickCxtMenuItem = function(item) {
          switch (item.type) {
            case "DEL":
              scope.data.firstStep.layout.removeNode(item.nodeId);
              self._cxtMenuData.isShow = false;
              break;
            case "ENTITY_DETAIL":
              window.open("/page/smartview/entityPage?code=" + item.code);
              break;
            case "LINK_DETAIL":
              window.open("/page/smartview/relationPage?code=" + item.code);
              break;
          }
        }

        var unwatcher = scope.$watch("data", function(newValue, oldValue) {
          if (newValue) {
            newValue.firstStep.layout = _drawNewCanvas(newValue.firstStep.canvasData);
            newValue.firstStep.layout.eventProxy.on(EVENTS.SHOW_CXTMENU, function(data) {
              $.extend(self._cxtMenuData, {
                isShow: true,
                x: (data.x - offset.left) + "px",
                y: (data.y - offset.top + 100) + "px",
                data: data.data
              });
              scope.$digest();
            });

            scope.$watch("step", function(newStep, oldStep) {
              if (newStep) {
                if (newStep !== 1) {
                  newValue.firstStep.layout.setSize(width - 410, height);
                  newValue.firstStep.layout.hideExploreBtn();
                } else {
                  newValue.firstStep.layout.setSize(width, height);
                  newValue.firstStep.layout.showExploreBtn();
                }
                if (newStep !== 1 && oldStep === 1) {
                  transformData(newValue);
                }
              }
            });

            unwatcher();
          }
        });

        function _drawNewCanvas(canvasData) {
          let svg = $([
            '<svg id="step-svg-canvas" class="dag-svg">',
            '<defs>',
            '<marker id="arrow" markerUnits="strokeWidth" markerWidth="12" markerHeight="10" viewBox="0 0 12 12" refX="6" refY="6" orient="auto">',
            '<path d="M2,2 L10,6 L2,10 L6,6 L2,2" fill="#999"></path>',
            '</marker>',
            '<marker id="arrow-highlight" markerUnits="strokeWidth" markerWidth="12" markerHeight="10" viewBox="0 0 12 12" refX="6" refY="6" orient="auto">',
            '<path d="M2,2 L10,6 L2,10 L6,6 L2,2" fill="#576479"></path>',
            '</marker>',
            '</defs>',
            '<g class="zoom-container"></g>',
            '</svg>'
          ].join(""));

          $(element)
            .find("#step-svg-canvas")
            .replaceWith(svg);

          $(element).find("#step-svg-canvas")
            .attr("width", width)
            .attr("height", height);

          var layout = new Layout({
            width: width,
            height: height,
            svg: d3.select("#step-svg-canvas")
          });

          layout.draw(canvasData, false);

          return layout;
        }

        var transformData = function(dataModal) {
          dataModal.firstStep.canvasData.vertexs = [];
          dataModal.firstStep.layout.nodes.forEach(function(item) {
            var obj = {
              critical: item.config.critical,
              content: item.config.content,
              detectable: item.config.detectable,
              identifier: item.config.id,
              type: item.config.type
            };

            dataModal.firstStep.canvasData.vertexs.push(obj);
          });
        };

        scope.$on("addItemsToLayout", function(events, data) {

          if (data.eventType !== self.SEARCHTYPE) return;

          var x = data.x;
          var y = data.y;

          var svg_x_left = offset.left;
          var svg_x_right = offset.left + width;
          var svg_y_top = offset.top;
          var svg_y_bottom = offset.top + height;

          if (x > svg_x_left && x < svg_x_right && y > svg_y_top && y < svg_y_bottom) {
            data.data.nodes = data.data.nodes.map(function(item) {
              item.x = item.x - svg_x_left + item.width / 2;
              item.y = item.y - svg_y_top - item.height / 2;
              return item;
            });
            let selectEle = data.data.nodes.length !== 0 ? data.data.nodes[0] : data.data.links[0];
            switch (selectEle.type) {
              case 1:
              case 2:
                scope.data.firstStep.layout.dragItem2Layout(data.data).catch(function(e) {
                  let errorText = e.error || "添加失败";
                  toast('warning', errorText);
                })
                break;
            }

          }
        });
      },
      template: require('./firstStep.html')
    }
  }
])


module.exports = moduleName;
