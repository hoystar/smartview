"use strict";

require('./canvas.less');

var Layout = require("../../../services/dag/mutilViewLayout");

let toast = require('../../../services/toast/toast');

import EVENTS from "../../../services/events";

let Cache = require("../../../services/mainView/mainViewCache");
let TYPE = require("../../../services/objectType");

var moduleName = "app.canvas";

var app = angular.module(moduleName, [
  require("../../searchBar/searchBar"),
  require("../../../services/widget/contentMenu"),
  require("../../widget/contentMenu/contentMenu"),
  require("../../../services/modal/createCanvasModal/modal"),
  require("../../../services/modal/canvasListModal/modal"),
  require("../../../services/modal/intelligentFindModal/modal"),
  require("../../../services/modal/entityRecommendModal/modal"),
  require("../../multiDropdown/multiDropdown"),
  require("../../conditionModal/modal/modal"),
  require("../../dragLayout/dragLayout"),
  require("../../../services/unPopModal/markModal/markModal")
]);

app.directive("canvas", [
  "$rootScope",
  "cxtMenuService",
  "createCanvasModal",
  "canvasListModal",
  "intelligentFindModal",
  "entityRecommendModal",
  "$state",
  "$stateParams",
  "markModal",
  function($rootScope, cxtMenuService, createCanvasModal, canvasListModal, intelligentFindModal, entityRecommendModal, $state, $stateParams, markModal) {
    return {
      restrict: "AE",
      replace: true,
      scope: {
        canavsData: "="
      },
      controller: [
        "$scope",
        function($scope) {

        }
      ],
      controllerAs: "dag",
      link: function(scope, element, attrs) {

        let self = scope.dag;
        let layout = {};
        let width = $(element).find(".svg-container").width()-5;//windows宽度调整
        let height = $(element).find(".svg-container").height();
        let offset = $(element).offset();

        self.SEARCHTYPE = "canvas";

        //初始化cxt数据
        self._cxtMenuData = {};
        self.mutipileDdInfo = {};

        scope.$watch("canavsData.id", function(newValue, oldValue) {
          if (newValue === null || newValue === undefined) return;
          if (scope.canavsData.isCacheCanvas) {
            layout = _drawOldCanvas();
          } else {
            layout = _drawNewCanvas();
            _attachLayoutEvent();
            scope.canavsData.layout = layout;
            scope.canavsData.isCacheCanvas = true;
            scope.canavsData.isViewNexus = true;
          }
        });

        scope.$watch("canavsData.isViewNexus", function(newValue, oldValue) {
          if (newValue === null || newValue === undefined) return;
          var viewType = newValue ? 0 : 1;
          layout.changeView(viewType);
        });

        scope.$watch("canavsData.data.modifiedVersion", function(newValue, oldValue) {
          if (newValue === null || newValue === undefined) return;
          layout.modifiedVersion = newValue;
        });

        // todo  这里一定要优化，不然内存泄漏很严重
        function _drawNewCanvas() {
          let svg = $([
            '<svg id="svg-canvas" class="dag-svg">',
            '<defs>',
            '<marker id="arrow" markerUnits="strokeWidth" markerWidth="8" markerHeight="6" viewBox="0 0 12 12" refX="6" refY="6" orient="auto">',
            '<path d="M2,2 L10,6 L2,10 L6,6 L2,2" fill="#ccc"></path>',
            '</marker>',
            '<marker id="arrow-highlight" markerUnits="strokeWidth" markerWidth="8" markerHeight="6" viewBox="0 0 12 12" refX="6" refY="6" orient="auto">',
            '<path d="M2,2 L10,6 L2,10 L6,6 L2,2" fill="#3daefe"></path>',
            '</marker>',
            '</defs>',
            '<g class="zoom-container"></g>',
            '</svg>'
          ].join(""));

          $(element)
            .find("#svg-canvas")
            .replaceWith(svg);

          $(element).find("#svg-canvas")
            .attr("width", width)
            .attr("height", height);

          layout = new Layout({
            width: width,
            height: height,
            svg: d3.select("#svg-canvas")
          });

          layout.draw(scope.canavsData.data, scope.canavsData.isRecommend);

          return layout;
        }

        function _attachLayoutEvent() {
          layout.eventProxy.on("showDetailentity", function(data) {
            _showUnpopModal();
            $rootScope.$broadcast("showDetailentity", {
              domainCode : (layout.findNode(data.config.centerNodeId)).config.id,
              nodes: data.config.nameChain.map(function(item) {
                return {
                  name: item
                }
              }),
              tags: data.config.data.tags ? data.config.data.tags.map(function(item) {
                return {
                  id: item.code,
                  name: item.name
                }
              }) : []
            });
          });

          layout.eventProxy.on("hideDetailentity", function() {
            $rootScope.$broadcast("hideDetailentity");
          });

          layout.eventProxy.on("showCtxMenu", function(data) {
            cxtMenuService.show(scope, {
              x: data.x + "px",
              y: data.y + "px",
              data: data.data
            });

            scope.$digest();
          });

          layout.eventProxy.on("entity_recomment_modal", function(node) {
            var neighborNodes = layout.neighborNode(node.config.id);
            entityRecommendModal({
              node: node,
              neighborNodes: neighborNodes
            }).result.then(function() {
              node.config.content[0].recType = 0;
              node.relateRect();
            });
            scope.$apply();
          });

          layout.eventProxy.on(EVENTS.SHOW_MULTIPILE_DROPDOWN, function(info) {
            self.mutipileDdInfo = {
              isShow: true,
              data: info.data,
              x: info.x,
              y: info.y
            }
            scope.$digest();
          });

          layout.eventProxy.on(EVENTS.HIDE_MULTIPILE_DROPDOWN, function(info) {
            self.mutipileDdInfo.isShow = false;
            scope.$digest();
          });

          layout.eventProxy.on(EVENTS.REMOVE_ANNULAR, function() {
            self.mutipileDdInfo.isShow = false;
            scope.$digest();
          });
        }

        function _drawOldCanvas() {
          let svg = scope.canavsData.layout.svg[0][0];
          $(element)
            .find("#svg-canvas")
            .replaceWith(svg);
          return scope.canavsData.layout;
        }

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
                layout.dragItem2Layout(data.data).catch(function(e) {
                  let errorText = e.error || "添加失败";
                  toast('warning', errorText);
                });
                break;
              case 3:
                layout.recommend(selectEle).then((data) => {
                  intelligentFindModal({
                    selectEle: selectEle,
                    list: data
                  }).result.then(function(data) {
                    //再调用dragItem2Layout方法
                    layout.addItems2Layout(data);
                  });
                });
                break;
            }
            $rootScope.$broadcast("addItemsToLayoutSuccess");
          }
        });

        scope.$on("selectedItem", function(events, data) {
          data.forEach(function(item) {
            if (item.isSelected) {
              layout.focus(item.id);
            } else {
              layout.unFocus(item.id);
            }
          });
        });

        $(element).bind("contextmenu.svg", function(event) {
          return false;
        });

        self.clickCxtMenuItem = function(item) {
          switch (item.type) {
            case "DEL":
              layout.removeNode(item.nodeId);
              cxtMenuService.close(scope);
              break;
            case "ENTITY_DETAIL":
              window.open("/page/smartview/entityPage?code=" + item.code);
              break;
            case "LINK_DETAIL":
              window.open("/page/smartview/relationPage?code=" + item.code);
              break;
          }
        }

        self.createCanvas = function() {
          createCanvasModal({}).result.then(function() {
            layout.empty();
          });
        }

        self.canvasList = function() {
          canvasListModal({}).result.then(function(item) {
            item.type = TYPE.CANVAS;
            item.stauts = 0;
            $rootScope.$broadcast(EVENTS.TAGSBAR_ADD_NODE, {
              item:item
            });
          });
        }

        self.saveCanvas = function() {
          layout.saveCanvas().then(function() {
            scope.canavsData.data.modifiedVersion = layout.modifiedVersion;
            toast('success', '保存成功');
          });
        }

        self.isShowModelExplore = false;
        self.controllCondition = function() {
          self.isShowModelExplore = !self.isShowModelExplore;
        }

        self.addFlowLine = function() {
          layout.addFlowInfo.switch = 'on';
          layout.setShowPieOption(false);
        }

        //展示浮层
        var modalInstance = null;
        let hasOpen = false;

        function _showUnpopModal() {
          if (hasOpen) return;
          modalInstance = markModal.show({}, scope);
          hasOpen = !!!hasOpen;
          scope.$digest();
        }

        //modal是有stack管理的，所以scope注销时候一定要dismiss
        scope.$on("$destroy", function() {
          modalInstance && modalInstance.dismiss();
        });

      },
      template: require('./canvas.html')
    }
  }
])


module.exports = moduleName;