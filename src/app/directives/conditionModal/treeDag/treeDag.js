"use strict";

require('./treeDag.less');

var moduleName = "app.treeDag";

var EVENTS = require("../../../services/events");

let PathDag = require("../../../services/pathDag/pathDag");

var app = angular.module(moduleName, [
  require("../../widget/contentMenu/contentMenu"),
  require("../../../services/modal/conditionModal/modal"),
  require("../conditiontips/conditiontips")
]);

app.directive("treeDag", [
  "conditionModal",
  "$rootScope",
  function(conditionModal,$rootScope) {
    return {
      restrict: "AE",
      replace: true,
      scope: {
        data: "="
      },
      controller: [
        "$scope",
        function($scope) {

        }
      ],
      controllerAs: "treeDag",
      link: function(scope, element, attrs) {
        let self = scope.treeDag;
        self.conditionValue = [];
        let width = $(element).width();
        let height = $(element).height();
        let offset = $(element).offset();

        let layout = new PathDag({
          svg: d3.select("#path-canvas"),
          width: width,
          height: height
        });
        
        layout.eventProxy.on(EVENTS.PATH_CANVAS_CXTMENUE, function(data) {
          $.extend(true, self._cxtMenuData, data, {
            isShow: true,
            x: data.x + "px",
            y: data.y + "px"
          });
          scope.$digest();
        });

        layout.eventProxy.on(EVENTS.SHOW_CONDITION_TOOLTIPS, function(data) {
          var tooltipWidth = 150;
          var halfRectWidth = 30;
          let leftoffset = 20;

          self._conditiontipsData = {};
          $.extend(true, self._conditiontipsData, data, {
            isShow: true,
            x: (data.x - (tooltipWidth + halfRectWidth + leftoffset)) + "px",
            y: (data.y - 10) + "px"
          });
          scope.$digest();
        });
        layout.eventProxy.on(EVENTS.HIDE_CONDITION_TOOLTIPS, function() {
          self._conditiontipsData={};
          $.extend(true, self._conditiontipsData, {
            isShow: false
          });
          scope.$digest();
        });
        layout.eventProxy.on(EVENTS.REMOVE_ITEM_INPUTDATA_MODAL, function(node) {
          $rootScope.$broadcast(EVENTS.REMOVE_ITEM_INPUTDATA, node);
        });
        self._cxtMenuData = {};
        self._conditiontipsData = {};
        self.clickCxtMenuItem = function(item) {
          switch (item.type) {
            case "DEL":
              layout.deleteNode(item.id);
              break;
            case "EDIT":
              conditionModal(item).result.then(function(data) {
                let _node = layout.findNode(item.id);
                if(_node){
                  _node.highlight();
                  $.extend(true, _node.config.condition, data);
                }
              });
              break;
          }
        }

        scope.$on(EVENTS.ADD_ITEM_CONDITION_MODAL, function(event, data) {
          let _x = Math.random() * (width - 30);
          let _y = Math.random() * (height - 30);
          _x = _x < 30 ? ( _x + 30) : _x;
          _y = _y < 30 ? ( _y + 30) : _y;
          layout.addItem2Layout([$.extend(true, {
            x: _x,
            y: _y,
            type: 1,
            isRoot: false,
            isLeaf: false,
            isTree: false
          }, data)], true);
        });

        var unWatcher = scope.$watch(function() {
          return scope.data.secondStep;
        }, function(newValue, oldValue) {
          if (newValue) {
            scope.data.secondStep.layout = layout;
            unWatcher();
          }
        })
      },
      template: require('./treeDag.html')
    }
  }
])


module.exports = moduleName;