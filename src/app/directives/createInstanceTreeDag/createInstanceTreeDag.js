"use strict";

require('./createInstanceTreeDag.less');

var moduleName = "app.createInstanceTreeDag";

var EVENTS = require("../../services/events");
let PathDag = require("../../services/pathDag/pathDag");
var app = angular.module(moduleName,[
  require("../../services/widget/contentMenu"),
  require("../../services/modal/instanceConditionModal/modal"),
  require("../conditionModal/conditiontips/conditiontips")
]);

app.directive("createInstanceTreeDag",["instanceConditionModal",
  function(instanceConditionModal){
    return {
      restrict: "AE",
      replace: true,
      scope: {
        data: "=",
        dagId: "="
      },
      controller: [
      "$scope",
      function($scope){

      }],
      controllerAs: "createInstanceTreeDag",
      link: function(scope,element,attrs){
        let self = scope.createInstanceTreeDag;
        var width = $(element).width();
        var height = $(element).height();
        var offset = $(element).offset();
        var _initWidth = 534;
        if(width<1){
          width = _initWidth;
        }
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
          
          let svg = '<svg id="' + scope.dagId + '"  class="createInstance-tree">' + '</svg>';
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
        layout.eventProxy.on(EVENTS.PATH_CANVAS_CXTMENUE, function(data) {
          var e = window.event; 
          if(e.preventDefault){ 
            e.preventDefault(); 
          } 
          if (e.stopPropagation){ 
            e.stopPropagation(); 
          }else{ 
            e.returnValue = false; // 解决IE8右键弹出 
            e.cancelBubble = true; 
          }
          let _data = data.data;
          let _index = _.findIndex(_data, function(item) {
            return item.type === "DEL";
          });
          if(_index>-1){
            data.data.splice(_index, 1);
          }
          $.extend(true, self._cxtMenuData, data, {
            isShow: true,
            x: data.x + "px",
            y: data.y + "px"
          });
          scope.$digest();
        });
        self.clickCxtMenuItem = function(item) {
          switch (item.type) {
            case "EDIT":
              instanceConditionModal(item).result.then(function(data) {
                let _node = layout.findNode(item.id);
                if(_node){
                  _node.highlight();
                  $.extend(true, _node.config.condition, data);
                }
              });
              break;
          }
        }
        
          return layout;
        }
      },
      template: require('./createInstanceTreeDag.html')
    }
  }
])


module.exports = moduleName;