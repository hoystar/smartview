"use strict";

require('./dtDefineTreeDag.less');
var EVENTS = require("../../services/events");
var moduleName = "app.dtDefineTreeDag";
let PathDag = require("../../services/pathDag/pathDag");
var app = angular.module(moduleName, [  
  require("../../services/widget/contentMenu"),
  require("../../services/modal/conditionModal/modal"),
  require("../conditionModal/conditiontips/conditiontips")
  ]);
app.directive("dtDefineTreeDag", ["conditionModal",
  function(conditionModal) {
    return {
      restrict: "AE",
      replace: true,
      scope: {
        data: "=",
        dagId: "="
      },
      controller: [
        "$scope",
        function($scope) {

        }
      ],
      controllerAs: "dtDefineTreeDag",
      link: function(scope, element, attrs) {
        let self = scope.dtDefineTreeDag;
        var width = $(element).width();
        var height = $(element).height();
        var layout = {};
        self._cxtMenuData = {};
        var unwatcher = scope.$watch(function() {
          return scope.data
        }, function(newValue, oldValue) {
          if (newValue) {
            layout = _drawNewCanvas();
            layout.drawConditionTree(newValue);
          }
        });
       
        
        function _drawNewCanvas() {
          
          let svg = $([
            '<svg id="' + scope.dagId + '"  class="condition-tree">', '</svg>'
          ].join(""));
          $(element)
            .find("#" + scope.dagId)
            .replaceWith(svg);
          $(element).find("#" + scope.dagId)
            .attr("width", width)
            .attr("height", height);

          layout = new PathDag({
            width: width,
            height: height,
            svg: d3.select("#" + scope.dagId)
          });
          
          layout.eventProxy.on(EVENTS.SHOW_CONDITION_TOOLTIPS, function(data) {
          var tooltipWidth = 150;
          var halfRectWidth = 30;
          let leftoffset = 20;

          self.conditiontipsData = {};
          $.extend(true, self.conditiontipsData, data, {
            isShow: true,
            x: (data.x - (tooltipWidth + halfRectWidth + leftoffset)) + "px",
            y: (data.y - 10) + "px"
          });
          scope.$digest();
        });
        layout.eventProxy.on(EVENTS.HIDE_CONDITION_TOOLTIPS, function() {
          self.conditiontipsData={};
          $.extend(true, self.conditiontipsData, {
            isShow: false
          });
          scope.$digest();
        });
        
          return layout;
        }

      },

      template: require('./dtDefineTreeDag.html')
    }
  }
])


module.exports = moduleName;