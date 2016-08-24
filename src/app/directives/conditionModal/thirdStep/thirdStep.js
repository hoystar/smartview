"use strict";

require('./thirdStep.less');

var moduleName = "app.thirdStep";
var EVENTS = require("../../../services/events");
var ERSearchService = require("../../../services/condition/ERSearch.js");
let toast = require('../../../services/toast/toast');
var tagSearchService = require("../../../services/condition/tagSearch.js");
var MapJudgement = require("../../../services/algorithm/mapJudgement");
var MapDistance = require("../../../services/algorithm/mapDistance");
var exploreRangeService = require("../../../services/exploreRange/exploreRange.js");
var HttpRequest = require("../../../services/httpCenter/request");
let _ = require("lodash");
var color = require("../../../services/process/color");

var app = angular.module(moduleName, [
  require("../../../services/modal/exploreRangeModal/modal")
]);

app.directive("thirdStep", [
  "$rootScope",
  "exploreRangeModal",
  function($rootScope, exploreRangeModal) {
    return {
      restrict: "AE",
      replace: true,
      scope: {
        data: "=",
        step: "="
      },
      controller: [
        "$scope",
        function($scope) {

        }
      ],
      controllerAs: "thirdStep",
      link: function(scope, element, attrs) {
        var self = scope.thirdStep;
        self.extraList = [];
        self.tagSelected = [];

        self.ERSearch = ERSearchService;
        self.tagSearch = tagSearchService;
        self.tagDetailArray = [];
        self.extraList = [];
        self.tagSelected = [];
        self.result = [];

        self.partitionResult = [];
        self.exploreRange = exploreRangeService;
        self.content = "PARTITION";
        self.partitionArray = [];
        self.entityArray = [];
        self.relationArray = [];
        self.loading = false;
        self.batchArray = [{
          type: "BATCH",
          condition: {
            name: "批量设置",
            symbol: "",
            multiValue: false,
            type: "TEXT"
          },
          value: []
        }];
        self.getContent = function(contentType) {
          self.content = contentType;
        };
        self.changeInputType = function(partition) {
          self.exploreRange.changeInputType(partition);
          self.bathModify(partition);
        };

        self.bathModify = function(partition) {
          if (partition.type === 'PARTITION') {
            let mixtureArray = _.concat(self.entityArray, self.relationArray);
            partition.condition.markedTables.forEach((domainItem) => {
              let _obj = _.find(mixtureArray, (item) => {
                let id1 = item.partitionId + "_" + item.condition.code + "_" + item.condition.tableName;
                let id2 = partition.partitionId + "_" + domainItem.code + "_" + domainItem.tableName;
                return id1 === id2;
              });
              _obj.condition.symbol = partition.condition.symbol;
              _obj.condition.valueType = partition.condition.valueType;
              _obj.value = [];
              $.extend(true, _obj.value, partition.value);
            });
          }
          if (partition.type === 'BATCH') {
            let mixtureArray = _.concat(self.entityArray, self.relationArray, self.partitionArray);
            mixtureArray.forEach((cacheItem) => {
              if (cacheItem.condition.type === "TEXT") {
                cacheItem.condition.symbol = partition.condition.symbol;
                cacheItem.condition.valueType = partition.condition.valueType;
                cacheItem.value = [];
                $.extend(true, cacheItem.value, partition.value);
              }
            });
          }
        }

        function createPartitionCache() {
          self.partitionStatus = false;
          self.loading = true;
          let params = self.result.MapNodes.map((item) => {
            return item.config.content[0].code;
          }).join(",");
          HttpRequest.GetPartitionInfo({
            domainCodes: params
          }).then((data) => {
            if (data.length < 1) {
              self.partitionStatus = true;
              toast("warning", "数据无分区，不需要设置探索范围!");
            }
            self.loading = false;
            self.partitionResult = [];
            self.partitionArray = [];
            self.entityArray = [];
            self.relationArray = [];
            $.extend(true, self.partitionResult, data);
            createPartitionListCache();
            createDomainCache("ENTITY");
            createDomainCache("RELATION");
            $.extend(scope.data.thirdStep.partitionData, _.concat(self.entityArray, self.relationArray));
            scope.$digest();
          }).catch((data) => {
            self.loading = false;
            scope.$digest();
            toast("error", "分区信息获取失败!");
          });
        };

        function createDomainCache(contentType) {
          let domainType;
          let showArray = [];

          self.partitionResult.forEach((item) => {
            item.markedTables.forEach((domainItem) => {
              switch (contentType) {
                case 'ENTITY':
                  domainType = 1;
                  showArray = self.entityArray;
                  break;
                case 'RELATION':
                  domainType = 2;
                  showArray = self.relationArray;
                  break;
              }

              if (domainItem.domainType === domainType) {
                let chineseType = getchineseType(item.type);
                $.extend(true, domainItem, {
                  symbol: "",
                  multiValue: false,
                  type: item.type,
                  partitionName: item.name,
                  chineseType: chineseType,
                  valueType: ""
                });
                let _obj = {
                  condition: domainItem,
                  value: [],
                  partitionId: item.name + "_" + item.type,
                };
                showArray.push(_obj);
              }
            });
          })
        }

        function getchineseType(type) {
          let chineseType = "";
          switch (type) {
            case "INTEGER":
              chineseType = "整数";
              break;
            case "BIGINT":
              chineseType = "长整数";
              break;
            case "NUMERIC":
              chineseType = "小数";
              break;
            case "TEXT":
              chineseType = "文本";
              break;
            case "DATE":
              chineseType = "日期";
              break;
            case "DATETIME":
              chineseType = "时间戳";
              break;
          }
          return chineseType;
        }

        function createPartitionListCache() {
          self.partitionResult.forEach((item) => {
            let chineseType = getchineseType(item.type);
            let _partitionItem = {
              type: "PARTITION",
              partitionId: item.name + "_" + item.type,
              condition: {
                name: item.name,
                symbol: "",
                type: item.type,
                markedTables: item.markedTables,
                multiValue: false,
                chineseType: chineseType,
                valueType: ""
              },
              value: []
            };
            let _item = {
              key: _partitionItem.partitionId,
              value: _partitionItem
            };
            self.partitionArray.push(_partitionItem);
          });

        }
        self.addItemToExtraData = function(item) {
          let _index = _.findIndex(scope.data.thirdStep.extraData, function(tagItem) {
            return tagItem.content[0].code === item.content[0].code;
          });
          if (_index === -1) {
            scope.data.thirdStep.extraData.push(item);
            unHightLightMapDistance();
            hightLightMapDistance();
            createPartitionCache();
            createExecPath();
          }
        };
        self.removeItemToExtraData = function(item) {
          scope.data.thirdStep.extraData.forEach(function(tagItem, index) {
            if (tagItem.content[0].code === item.content[0].code) {
              scope.data.thirdStep.extraData.splice(index, 1);
              unHightLightMapDistance();
              hightLightMapDistance();
              createPartitionCache();
              createExecPath();
            }
          });
        };
        self.activeEntityAndRelation = function(item) {
          item.isActive = !item.isActive;
          if (item.isActive) {
            self.addItemToExtraData(item);
          } else {
            self.removeItemToExtraData(item);
          }
        };

        self.showExploreRangeModal = function(param) {
          let params = {
            partition: param,
            cache: _.concat(self.entityArray, self.relationArray)
          };
          exploreRangeModal(params).result.then((data) => {})
        };

        function unHightLightMapDistance() {
          self.result.MapNodes.forEach(function(_nodes) {
            _nodes.changeColor("#fff");
          });
          self.result.MapLinks.forEach(function(_edges) {
            _edges.changeColor("#ccc");
          });
        }

        function hightLightMapDistance() {
          var mapInfo = {
            mapNodes: [].concat(scope.data.firstStep.layout.nodes),
            mapLinks: [].concat(scope.data.firstStep.layout.links),
            mapInputData: [].concat(scope.data.secondStep.inputData.objs)
          }
          for (var i = 0; i < scope.data.thirdStep.extraData.length; i++) {
            mapInfo.mapInputData.push(scope.data.thirdStep.extraData[i].content[0]);
          }
          mapInfo.mapInputData = _.unionBy(mapInfo.mapInputData, scope.data.secondStep.outputData.objs, 'code');
          if (MapJudgement.estimate(mapInfo)) {
            self.result = MapDistance.caculate(mapInfo);
            self.result.MapNodes.forEach(function(_nodes) {
              _nodes.changeColor(color["NODEPATH"]);
            });
            self.result.MapLinks.forEach(function(_edges) {
              _edges.changeColor(color["EDGEPATH"]);
            });
          }
        }

        function createExecPath() {
          scope.data.thirdStep.executedPath = [];
          self.result.MapLinks.forEach((item) => {
            let link = [];
            link.push(item.config.source.content[0].code);
            link.push(item.config.target.content[0].code);
            scope.data.thirdStep.executedPath.push(link);
          })
        }

        scope.$watch("step", function(newValue, oldValue) {
          if (newValue === 3) {
            hightLightMapDistance();
          }
          if (newValue === 3 && oldValue === 2) {
            createPartitionCache();
            createExecPath();
          }
        })
      },
      template: require('./thirdStep.html')
    }
  }
])


module.exports = moduleName;
