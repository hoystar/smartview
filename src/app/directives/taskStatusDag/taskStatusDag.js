"use strict";

require('./taskStatusDag.less');

var Layout = require("../../services/dag/layout");

var moduleName = "app.taskStatusDag";

var app = angular.module(moduleName, []);

app.directive("taskStatusDag", [
  "$state",
  function($state) {
    return {
      restrict: "AE",
      replace: true,
      scope:{
        data: "=",
        canvasId: "=",
        highlightNodes: "="
      },
      controller: [
        "$scope",
        function($scope) {

        }
      ],
      controllerAs: "taskStatusDag",
      link: function(scope, element, attrs) {
          var width = $(element).width();
          var height = $(element).height();
          var offset = $(element).offset();
          let layout = {};

          let unwatcher = scope.$watch("data",function(newValue,oldValue){
            if(newValue){
              layout = _drawNewCanvas();
              layout.hideExploreBtn();
            }
          });

          let highwatcher = scope.$watch("highlightNodes",function(newValue,oldValue){
            if(newValue){
              if(!_.isEmpty(layout)){
                _unHightLightNode(oldValue);
                _hightLightNode(newValue);
              }
            }
          });

          function _unHightLightNode(oldValue) {
            if(!_.isEmpty(oldValue)){
              for(var key in scope.data.vertexs){
                for(var i = 0 ; i < oldValue.length ; i++){
                  if(oldValue[i].jobCode === scope.data.vertexs[key].content[0].jobCode){
                    layout.findNode(scope.data.vertexs[key].content[0].code).changeColor("#fff");
                  }
                }
              }
            }
          }

          function _hightLightNode(newValue) {
            for(var key in scope.data.vertexs){
              for(var i = 0 ; i < newValue.length ; i++){
                if(newValue[i].jobCode === scope.data.vertexs[key].content[0].jobCode){
                  layout.findNode(scope.data.vertexs[key].content[0].code).changeColor(newValue[i].color);
                }
              }
            }
          }

          function _drawNewCanvas() {
              let svg = $([
                    '<svg id="' + scope.canvasId + '" class="dag-svg">',
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
                 .find("#" + scope.canvasId)
                  .replaceWith(svg);

              $(element).find("#svg-canvas")
                  .attr("width", width)
                  .attr("height", height);

              layout = new Layout({
                  width: width,
                  height: height,
                  eventEnable: false,
                  svg: d3.select("#" + scope.canvasId)
              });
              layout.draw(scope.data, true);

              return layout;
          }

      },
      template: require('./taskStatusDag.html')
    }
  }
])


module.exports = moduleName;
