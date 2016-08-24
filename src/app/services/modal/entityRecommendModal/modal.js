"use strict";

require("./modal.less");

var moduleName = "app.modal.entityRecommendModal";

var app = angular.module(moduleName, []);

app.factory("entityRecommendModal", [
    "$uibModal",
    function($uibModal) {
      return function(params) {
        return $uibModal.open({
          animation: true,
          backdrop:false,
          template: require("./modal.html"),
          controller: 'entityRecommendModalCtrl',
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
  .controller("entityRecommendModalCtrl", [
    "$scope",
    "$uibModalInstance",
    "params",
    function($scope, $uibModalInstance, params) {
      var self = this;

      this.node = params.node;
      this.neighborNodes = params.neighborNodes;
      this.step = 1;

      this.config = {
        odps: [{
          name: "A表",
          isSelected: true
        }, {
          name: "B表",
          isSelected: true
        }, {
          name: "C表",
          isSelected: true
        }, {
          name: "D表",
          isSelected: true
        }],
        rds: [{
          name: "A表",
          isSelected: true
        }, {
          name: "B表",
          isSelected: true
        }, {
          name: "C表",
          isSelected: true
        }, {
          name: "D表",
          isSelected: true
        }],
        ads: [{
          name: "A表",
          isSelected: true
        }, {
          name: "B表",
          isSelected: true
        }, {
          name: "C表",
          isSelected: true
        }, {
          name: "D表",
          isSelected: true
        }]
      }

      this.next = function() {
        this.step++;
      }

      this.preview = function() {
        this.step--;
      }

      this.submit = function() {
        $uibModalInstance.close('result')
      }

      this.cancel = function() {
        $uibModalInstance.dismiss('cancel');
      }
    }
  ])

module.exports = moduleName;
