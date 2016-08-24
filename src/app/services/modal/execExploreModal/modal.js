"use strict";

require("./modal.less");

var moduleName = "app.modal.execExploreModal";

var HttpRequest = require("../../httpCenter/request");
var tagSearchService = require("../../../services/condition/tagSearch.js");
let toast = require('../../../services/toast/toast');
let _ = require("lodash");
var app = angular.module(moduleName, [
  require("../../../directives/breadCrumbs/breadCrumbs"),
  require("../../../directives/clusterDag/clusterDag"),
  require("../../../directives/createInstanceTreeDag/createInstanceTreeDag")
]);

app.factory("execExploreModal", [
    "$uibModal",
    function($uibModal) {
      return function(params) {
        return $uibModal.open({
          animation: true,
          backdrop: false,
          template: require("./modal.html"),
          controller: 'execExploreModalCtrl',
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
  .controller("execExploreModalCtrl", [
    "$scope",
    "$uibModalInstance",
    "params",
    function($scope, $uibModalInstance, params) {
      var self = this;
      self.tagSearch = tagSearchService;
      this.defineInfo = params.defineInfo;
      self.partitionDate = [];
      var queueArray = [];
      let conditions = params.defineInfo.conditions;
      let queue = [conditions];
      while(queue.length !== 0){
        let item = queue.shift();
        if(item.conditions){
          queue = queue.concat(item.conditions);
        } else {
          let tagParam = {};
          tagParam.code = item.leftValue.value.tag;
          tagParam.markedDomainCode = item.leftValue.value.code;
          tagParam.name = item.leftValue.value.name;
          let _callBack = self.tagSearch.getTagSelectedData(tagParam);
          queueArray.push(_callBack);
        }
      }
      self.isLoading = true;
      Promise.all(queueArray).then((data) => {
        self.isLoading = false;
        $scope.$digest();
      });
      this.execName = params.defineInfo.name;
      this.execDesc = "";
      this.dagId = "explore-dag";
      var dataParam = {};
      this.submit = function() {
        if (params.defineInfo.partitions) {
          params.defineInfo.partitions.forEach((item) => {
            if (item.contrast === "=") {
              item.contrast = "EQ";
            }
            if (item.contrast === "in") {
              item.contrast = "IN";
              item.rightValue.value = _.split(item.rightValue.value, ",");
            }
            if (item.contrast === "between") {
              item.contrast = "BETWEEN";
              item.rightValue.value = _.split(item.rightValue.value, ",");
            }
          });
        }
        HttpRequest.CreateInstanceByDefineID({
          name: self.execName,
          description: self.execDesc,
          defineId: params.defineInfo.id,
          modifier: 1,
          conditions: params.defineInfo.conditions,
          partitions: params.defineInfo.partitions
        }).then(function(data) {
          dataParam.instanceId = data.instanceId;
          dataParam.name = data.name;
          dataParam.defineId = data.defineId;
          dataParam.description = data.description;
          $uibModalInstance.close(dataParam)
        });

      };

      this.cancel = function() {
        $uibModalInstance.dismiss('cancel');
      };
    }
  ])

module.exports = moduleName;