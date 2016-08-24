"use strict";

require('./topologySearch.less');

var moduleName = "app.topologySearch";

let topologySearchCtrl = require("../../services/searchBar/topologySearchCtrl")

let EVENTS = require("../../services/events");

let toast = require("../../services/toast/toast");

import COLORS from "../../services/topology/color";

var app = angular.module(moduleName, []);

app.directive("topologySearch", [
  "$rootScope",
  function($rootScope) {
    return {
      restrict: "AE",
      replace: true,
      scope: {
        data: "=",
        selected: "="
      },
      controller: [
        "$scope",
        function($scope) {

        }
      ],
      controllerAs: "search",
      link: function(scope, element, attrs) {
        let self = scope.search;
        let startPos = {};
        let isDragSearchBar = false;

        self.keyword = "";

        self.list = [];

        let unWatcher = scope.$watch("data", function(newValue, oldValue) {
          if (newValue && newValue.edges && newValue.vertexs) {
            topologySearchCtrl.setData(newValue.vertexs);
            unWatcher();
          }
        }, true);

        self.keySearch = function(event) {
          if (event.keyCode == 13) {
            self.search();
          }
        }

        self.search = function() {
          if (self.keyword.length === 0) {
            return;
          }
          self.list = topologySearchCtrl.search(self.keyword);
        }

        // 最小化
        let _oldHeight = 0;
        self.isMinimize = false;
        self.minimize = function() {
          _oldHeight = $(element).height();
          $(element).animate({
            height: "35px",
            width: "35px"
          }, function() {
            $(element).css("overflow", "hidden");
            self.isMinimize = true;
            scope.$digest();
          });
        }

        // 最大化
        self.maximize = function() {
          self.isMinimize = false;
          scope.$digest();
          $(element).animate({
            height: _oldHeight + "px",
            width: "350px",
          }, function() {
            $(element).css({
              "overflow": "auto",
              "height": "auto"
            });
            scope.$digest();
          });
        }

        self.locatePosition = function(item) {
          $rootScope.$broadcast(EVENTS.LOCATE_POSITION, item);
        }

        //位置拖动
        $(element).delegate(".drag-icon", "mousedown.searchBar", function(e) {
          //这种转换是不安全转换，以后修改成严谨点
          startPos = {
            top: parseInt($(element).css("top")),
            left: parseInt($(element).css("left")),
            x: e.clientX,
            y: e.clientY
          }
          isDragSearchBar = true;
        });

        let clickTime = 0;
        $(element).delegate(".minimize-content-box", "mousedown.searchBar", function(e) {
          //这种转换是不安全转换，以后修改成严谨点
          startPos = {
            top: parseInt($(element).css("top")),
            left: parseInt($(element).css("left")),
            x: e.clientX,
            y: e.clientY
          }
          isDragSearchBar = true;

          clickTime = new Date().getTime();
        });

        $(element).delegate(".minimize-content-box", "mouseup.searchBar", function(e) {
          if (new Date().getTime() - clickTime < 300) {
            self.maximize();
          }
        });

        //小心内存泄漏
        $(document).on("mousemove.searchBar", function(e) {
          if (!isDragSearchBar) return;
          $(element).css({
            top: startPos.top + (e.clientY - startPos.y),
            left: startPos.left + (e.clientX - startPos.x)
          })
          startPos = {
            top: startPos.top + (e.clientY - startPos.y),
            left: startPos.left + (e.clientX - startPos.x),
            x: e.clientX,
            y: e.clientY
          }
        });

        $(element).on("mouseup.searchBar", function(e) {
          isDragSearchBar = false;
        });

        self.selectedItem = function(item, event) {
          if (item.isSelected) {
            if (scope.selected.length >= 10) {
              toast('error', '收藏元素不能超过10个');
              item.isSelected = false;
              return;
            } else {
              scope.selected.push(item);
            }
          } else {
            let index = scope.selected.indexOf(item);
            scope.selected.splice(index, 1);
          }
        }

      },
      template: require('./topologySearch.html')
    }
  }
])


module.exports = moduleName;
