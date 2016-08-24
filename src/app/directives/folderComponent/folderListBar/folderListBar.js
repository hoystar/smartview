"use strict";

require('./folderListBar.less');
var folderEditService = require("../../../services/folderEdit/folderEditCtrl");

var moduleName = "app.folderListBar";

var app = angular.module(moduleName, [
  require("../../widget/colorPicker/colorPicker")
]);

app.directive("folderListBar", [
  "$rootScope",
  function($rootScope) {
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
      controllerAs: "folderListBar",
      link: function(scope, element, attrs) {
        let self = scope.folderListBar;
        self.folderBosList = scope.data;
        self.queryKey = "";
        self.isMinimize = false;
        let startPos = {};
        let isDragSearchBar = false;
        

        //位置拖动
        $(element).delegate(".drag-icon", "mousedown.folderListBar", function(e) {
          startPos = {
            top: parseInt($(element).css("top")),
            left: parseInt($(element).css("left")),
            x: e.clientX,
            y: e.clientY
          }
          isDragSearchBar = true;
        });

        let clickTime = 0;
        $(element).delegate(".minimize-content-box", "mousedown.folderListBar", function(e) {
          startPos = {
            top: parseInt($(element).css("top")),
            left: parseInt($(element).css("left")),
            x: e.clientX,
            y: e.clientY
          }
          isDragSearchBar = true;

          clickTime = new Date().getTime();
        });

        $(element).delegate(".minimize-content-box", "mouseup.folderListBar", function(e) {
          if (new Date().getTime() - clickTime < 300) {
            self.maximize();
          }
        });

        $(document).on("mousemove.folderListBar", function(e) {
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

        $(element).on("mouseup.folderListBar", function(e) {
          isDragSearchBar = false;
        });

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
            item.type = 5;
            item.dsId = "folder_" + item.id;
            $rootScope.$broadcast("dragDagItem", {
              x: event.clientX,
              y: event.clientY,
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
            width: "250px",
          }, function() {
            $(element).css({
              "overflow": "auto",
              "height": "auto"
            });
            scope.$digest();
          });
        }

        scope.$on("$destroy", function() {
          $(document).off("mousemove.folderListBar");
          $(element).undelegate(".drag-icon", "mousedown.folderListBar");
          $(element).undelegate(".minimize-content-box", "mousedown.folderListBar");
          $(element).off("mouseup.folderListBar");
        })
      },
      template: require('./folderListBar.html')
    }
  }
])


module.exports = moduleName;
