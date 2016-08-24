"use strict";

require("./modal.less");

var moduleName = "app.modal.exploreRangeModal";
var exploreRangeService = require("../../exploreRange/exploreRange.js");

var app = angular.module(moduleName, []);

app.factory("exploreRangeModal", [
    "$uibModal",
    function($uibModal) {
      return function(params) {
        return $uibModal.open({
          animation: true,
          backdrop:false,
          template: require("./modal.html"),
          controller: 'exploreRangeModalCtrl',
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
  .controller("exploreRangeModalCtrl", [
    "$scope",
    "$uibModalInstance",
    "params",
    function($scope, $uibModalInstance, params) {
      var self = this;
      self.exploreRange = exploreRangeService;
      self.mixtureArray = [];

      var createMixtureArray = function(params) {
        let partition = params.partition;
        let mixtureArrayCache = params.cache;
        partition.condition.markedTables.forEach((item) => {

          let _index = _.findIndex(mixtureArrayCache, function(cacheItem) {
            let key1 = partition.partitionId + "_" + item.code + "_" + item.tableName;
            let key2 = cacheItem.partitionId + "_" + cacheItem.condition.code + "_" + cacheItem.condition.tableName;
            return key1 === key2;
          });
          if (_index !== -1) {
            self.mixtureArray.push(mixtureArrayCache[_index]);
          }
        })
      };

      createMixtureArray(params);

      self.changeInputType = function(partition) {
        self.exploreRange.changeInputType(partition, params.cache);
      }
      this.submit = function() {
        $uibModalInstance.close('result');
      }
    }
  ])

module.exports = moduleName;
