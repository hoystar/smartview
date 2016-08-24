"use strict";

require('./modal.less');

let MapJudgement = require("../../../services/algorithm/mapJudgement");
var EVENTS = require("../../../services/events");
var HttpRequest = require("../../../services/httpCenter/request");
let toast = require('../../../services/toast/toast');
let exploreTreeCtrl = require("../../../services/exploreTree/exploreTree");
let ERSearch = require("../../../services/condition/ERSearch");
let _ = require("lodash");
var moduleName = "app.modal";

var app = angular.module(moduleName, [
  require("../firstStep/firstStep"),
  require("../secondStep/secondStep"),
  require("../thirdStep/thirdStep"),
  require("../fourthStep/fourthStep")
]);

app.directive("modal", [
  "$state", "$rootScope",
  function($state, $rootScope) {
    return {
      restrict: "AE",
      replace: true,
      scope: {
        data: "=",
        close: "="
      },
      controller: [
        "$scope", "$state",
        function($scope) {

        }
      ],
      controllerAs: "modal",
      link: function(scope, element, attrs) {
        var self = scope.modal;
        self.hasSubmit = false;
        self.dataModal = {
          firstStep: {
            layout: null,
            canvasData: $.extend(true, {}, scope.data)
          },
          secondStep: {
            inputData: {
              tags: [],
              objs: []
            },
            outputData: {
              tags: [],
              objs: []
            },
            contidionData: {},
            layout: null
          },
          thirdStep: {
            extraData: [],
            executedPath: [],
            partitionData: []
          },
          fourthStep: {
            defineDescription: "",
            defineName: ""
          }
        };
        self.exit = function() {
          ERSearch.clear();
          scope.close && scope.close();
        };
        self.executedPath = [];
        self.partitionDate = [];
        self.createConditions = function(node) {
          var queue = [];
          var currentNode = {};
          queue.push(node);
          while (queue.length !== 0) {
            currentNode = queue.shift();
            if (currentNode.config.type === 2) {
              let con = {
                nature: "",
                conditions: []
              };
              currentNode.config.children.forEach((item) => {
                if (item.config.type === 2) {
                  queue.push(item);
                }
                con.conditions.push(item.config.condition);
              });
              con.nature = self.getNature(currentNode.config.funcType);
              $.extend(currentNode.config.condition, con);
            }
          }
        };
        self.jointCondition = function() {
          let rootNode = {};
          if (self.dataModal.secondStep.layout.nodes.length === 1) {
            rootNode = self.dataModal.secondStep.layout.nodes[0];
          } else {
            rootNode = _.find(self.dataModal.secondStep.layout.nodes, ['config.isRoot', true]);
          }
          if (rootNode !== undefined) {
            self.createConditions(rootNode);
            self.dataModal.secondStep.contidionData = rootNode.config.condition;
          }
        }
        self.getNature = function(funcType) {
          if (funcType === 1) {
            return "AND";
          } else {
            return "OR";
          }
        };

        self.submit = function() {
          if (self.hasSubmit) {
            return;
          }
          self.hasSubmit = true;
          let selectedDomains = [];
          let outputTags = [];
          // self.dataModal.secondStep.inputData.objs.forEach(function(item) {
          //   selectedDomains.push({
          //     code: item.code,
          //     type: item.type
          //   });
          // });
          // self.dataModal.secondStep.outputData.objs.forEach(function(item) {
          //   selectedDomains.push({
          //     code: item.code,
          //     type: item.type
          //   });
          // });
          self.dataModal.thirdStep.extraData.forEach(function(item) {
            selectedDomains.push({
              code: item.content[0].code,
              type: item.content[0].domainType
            });
          });
          selectedDomains = _.uniqBy(selectedDomains, 'code');
          self.dataModal.secondStep.outputData.tags.forEach(function(item) {
            let index = _.findIndex(outputTags, function(items) {
              return items.code === item._obj.code;
            });
            if (index === -1) {
              outputTags.push({
                code: item._obj.code,
                type: item._obj.type,
                tags: [item.code]
              });
            } else {
              outputTags[index].tags.push(item.code);
            }
          });
          let defineName = self.dataModal.fourthStep.defineName.trim();
          let defineDescription = self.dataModal.fourthStep.defineDescription;
          if (self.dataModal.fourthStep.defineName.trim() === "") {
            defineName = "探索" + moment(new Date()).format("YYYYMMDDHHmmss");
          }
          if (self.dataModal.fourthStep.defineDescription === "") {
            defineDescription = "探索" + moment(new Date()).format("YYYYMMDDHHmmss");
          }

          let params = {
            "workspaceId": self.dataModal.firstStep.canvasData.workspaceId,
            "parentId": self.dataModal.firstStep.canvasData.parentId,
            "name": defineName,
            "description": defineDescription,
            "modifier": 1,
            "selectedDomains": selectedDomains,
            "conditions": self.dataModal.secondStep.contidionData,
            "outputTags": outputTags,
            "executedPath": self.dataModal.thirdStep.executedPath,
            "partitions": self.partitionDate
          };
          HttpRequest.CreateDetect(params)
            .then((data) => {
              self.hasSubmit = false;
              toast("success", "保存成功!数据探索命名为:" + data.name + ",探索ID为:" + data.id);
              $rootScope.$broadcast(EVENTS.TAGSBAR_ADD_NODE, {
                item:data
              });
              exploreTreeCtrl.addDefinde(data);
            }).catch((data) => {
              self.hasSubmit = false;
              toast("error", "保存失败!");
            });

        }

        self.step = 1;

        self.previousStep = function() {
          if (self.step > 1) {
            self.step = --self.step;
          } else {
            return;
          }
        };

        function _hasOutPut() {
          let result = true;
          if (self.dataModal.secondStep.outputData.tags.length === 0) {
            result = false;
          }
          return result;
        }

        self.nextStep = function() {
          if (self.step < 4) {
            if (self.step === 2) {
              let isPath = _isPath();
              let isTree = _isTree();
              let hasOutPut = _hasOutPut();
              if (!isPath) {
                toast("error", "探索路径不连通");
              } else if (!isTree) {
                toast("error", "条件树结构不正确");
              } else if (!hasOutPut) {
                toast("error", "没有输出条件");
              } else if (isPath && isTree && hasOutPut) {
                self.step = ++self.step;
              }
            } else if (self.step === 3) {
              let isPath = _isPath();
              transfromPartitionData();
              let hasPartition = _vertifyPartition();
              if (!isPath) {
                toast("error", "探索路径不连通");
              } else if (!hasPartition) {
                toast("error", "存在分区为空或者数据错误");
              } else if (isPath && hasPartition) {
                self.step = ++self.step;
              }
            } else {
              self.step = ++self.step;
            }
          } else {
            return;
          }
        };

        function _isTree() {
          let result = true;
          self.dataModal.secondStep.layout.nodes.forEach((item) => {
            if (!item.config.isTree && !item.config.parentId) {
              result = false;
            }
          });
          if (self.dataModal.secondStep.layout.nodes.length === 1) {
            result = true;
          }
          return result;
        }

        function _vertifyPartition() {
          let result = true;
          self.partitionDate.forEach((item) => {
            if (item.contrast === "" || item.rightValue.value.length === 0) {
              result = false;
            }
            if (_.isArray(item.rightValue.value)) {
                item.rightValue.value.forEach((valueItem) => {
                  if (valueItem.trim() === "") {
                    result = false;
                  }
                });
              } else if (_.isString(item.rightValue.value)) {
                if (item.rightValue.value.trim() === "") {
                  result = false;
                }
              }
            if (item.contrast === "BETWEEN") {
              if (item.rightValue.value[0] >= item.rightValue.value[1]) {
                result = false;
              }
            }
          });
          return result;
        }

        function transfromPartitionData() {
          let partitions = [];
          self.dataModal.thirdStep.partitionData.forEach((item) => {
            let partitionValue;
            if (item.condition.valueType === 'string') {
              partitionValue = item.value[0].value;
            } else if (item.condition.valueType === 'array') {
              partitionValue = [];
              item.value.forEach((valueItem) => {
                partitionValue = partitionValue.concat(valueItem.value);
              });
            }

            let _obj = {
              contrast: item.condition.symbol,
              leftValue: {
                type: "OBJECT",
                value: {
                  partitionName: item.condition.partitionName,
                  code: item.condition.code,
                  type: item.condition.domainType,
                  schemaCode: item.condition.schemaCode,
                  tableName: item.condition.tableName
                }
              },
              rightValue: {
                type: item.condition.type,
                value: partitionValue
              }
            };
            partitions.push(_obj);
          });
          $.extend(true, self.partitionDate, partitions);
        }

        function _isPath() {
          self.jointCondition();
          var mapInfo = {
            mapNodes: [].concat(self.dataModal.firstStep.layout.nodes),
            mapLinks: [].concat(self.dataModal.firstStep.layout.links),
            mapInputData: [].concat(self.dataModal.secondStep.inputData.objs)
          }
          for (var i = 0; i < self.dataModal.thirdStep.extraData.length; i++) {
            mapInfo.mapInputData.push(self.dataModal.thirdStep.extraData[i].content[0]);
          }
          mapInfo.mapInputData = _.unionBy(mapInfo.mapInputData, self.dataModal.secondStep.outputData.objs, 'code');
          return MapJudgement.estimate(mapInfo);
        }

      },
      template: require('./modal.html')
    }
  }
]);


module.exports = moduleName;