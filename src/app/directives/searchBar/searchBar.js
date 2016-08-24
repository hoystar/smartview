"use strict";

require('./searchBar.less');
require("@ali/naza-select2");

var searchBarService = require("../../services/searchBar/searchBar");

var HttpRequest = require("../../services/httpCenter/request");

import _ from "lodash";
import toast from "../../services/toast/toast";

var moduleName = "app.searchBar";

var app = angular.module(moduleName, [
  'ui.select'
]);

app.directive("searchBar", [
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
      controllerAs: "searchBar",
      link: function(scope, element, attrs) {
        let self = scope.searchBar;

        let startPos = {};
        let isDragSearchBar = false;

        self.searchBar = searchBarService;

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

        self.changeNav = function(value, event) {
          self.searchBar.changeTag(value);
        }

        self.search = function() {
          _search();
        }

        self.keySearch = function(event) {
          if (event.keyCode == 13) {
            _search();
          }
        }

        function _search() {
          self.searchBar.search().then(function() {
            scope.$digest();
          }).catch(function(err) {
            let errorText = _.get(err, "errorMessage") || "搜索出错";
            toast('error', errorText);
          });
        }

        let isDragToCanvas = false;
        let _timer = null;
        self.dragStart = function(event, item) {
          event.preventDefault();
          event.stopPropagation();
          isDragToCanvas = true;
          let _pos = $(element).offset();
          _timer = setTimeout(function() {
            let _tmpStatus = item.isSelected;
            item.isSelected = true;
            $rootScope.$broadcast("dragDagItem", {
              x: event.clientX,
              y: event.clientY,
              eventType: scope.type,
              top: _pos.top,
              left: _pos.left,
              searchBarX1: _pos.left,
              searchBarY1: _pos.top,
              searchBarX2: _pos.left + $(element).width(),
              searchBarY2: _pos.top + $(element).height(),
              data: [item]
            });
            item.isSelected = _tmpStatus;
          }, 200);
        }

        self.dragEnd = function(item) {
          item.isSelected = !!!item.isSelected;
          $rootScope.$broadcast("selectedItem", [item]);
          isDragToCanvas = false;
          clearTimeout(_timer);
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
            width: "420px",
          }, function() {
            $(element).css({
              "overflow": "auto",
              "height": "auto"
            });
            scope.$digest();
          });
        }

        self.fetchProject = function(keyword) {
          self.searchBar.getProject(keyword).then(function() {
            scope.$digest();
          })
        }

        scope.$on("$destroy", function() {
          $(document).off("mousemove.searchBar");
          $(element).undelegate(".drag-icon", "mousedown.searchBar");
          $(element).undelegate(".minimize-content-box", "mousedown.searchBar");
          $(element).off("mouseup.searchBar");
        })
      },
      template: require('./searchBar.html')
    }
  }
])


module.exports = moduleName;
