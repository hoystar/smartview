"use strict";

require("./modal.less");

var moduleName = "app.modal.intelligentFindModal";

var HttpRequest = require("../../httpCenter/request");

var Layout = require("../../dag/layout");

var app = angular.module(moduleName, []);

app.factory("intelligentFindModal", [
    "$uibModal",
    function($uibModal) {
      return function(params) {
        return $uibModal.open({
          animation: true,
          backdrop:false,
          template: require("./modal.html"),
          controller: 'intelligentFindModalCtrl',
          controllerAs: 'modal',
          resolve: {
            params: function() {
              return params
            }
          }
        });
      }
    }
  ])
  .controller("intelligentFindModalCtrl", [
    "$scope",
    "$uibModalInstance",
    "params",
    function($scope, $uibModalInstance, params) {
      var self = this;
      let layout = null;
      // this.comfirmAll = function() {
      //   let firstNodes = layout.nodes[0];
      //   //调接口
      //   layout.nodes.forEach(function(node) {
      //     node.config.content[0].recType = 0;
      //   });
      //   this.addToView();
      // }
      this.addToView = function() {
        // $uibModalInstance.close('result')
        let result = {
          nodes: [],
          links: []
        };
        let firstNodes = layout.nodes[0];
        result.nodes = layout.nodes.map(function(item) {
          return $.extend(true, {}, item.config, {
            x: item.config.x - firstNodes.config.x + params.selectEle.x,
            y: item.config.y - firstNodes.config.y + params.selectEle.y
          });
        });
        result.links = layout.links.map(function(item) {
          return {
            id: item.config.id,
            source: item.config.source.id,
            target: item.config.target.id,
            type: item.config.type
          }
        });
        $uibModalInstance.close(result);
      }

      this.cancel = function() {
        $uibModalInstance.dismiss('cancel');
      }

      //这里要优化成directive
      this.draw = function(item) {
        if (layout) {
          layout.empty();
          layout.destroy();
        }
        self.currentItemIndex = self.list.indexOf(item);
        layout = new Layout({
          width: 340,
          height: 245,
          svg: d3.select("#intelligent-canvas"),
          linkLength: 80
        });
        layout.setData(item);
        layout.update(true);
      }

      //兼容d3 select的bug
      setTimeout(function() {
        self.list = params.list;
        self.currentItemIndex = 0;
        self.draw(self.list[0]);
      });
    }
  ])

module.exports = moduleName;
