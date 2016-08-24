"use strict";

require('./secondStep.less');

var moduleName = "app.secondStep";


var EVENTS = require("../../../services/events");
var ERSearchService = require("../../../services/condition/ERSearch.js");

var tagSearchService = require("../../../services/condition/tagSearch.js");

var app = angular.module(moduleName, [
  require("../treeDag/treeDag")
]);

app.directive("secondStep", [
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
      controllerAs: "secondStep",
      link: function(scope, element, attrs) {
        var self = scope.secondStep;
        self.ERSearch = ERSearchService;
        self.tagSearch = tagSearchService;
        self.tagDetailArray = [];

        self.navs = [{
          key: "input",
          value: "输入条件"
        }, {
          key: "output",
          value: "输出条件"
        }];
        self.activeItem = self.navs[0].key;
        self.changeNav = function(item) {
          self.activeItem = item.key;
        };

        var unwatcher = scope.$watch("data.firstStep.canvasData", function(newValue, oldValue) {
          if (newValue) {
            self.ERSearch.translateData(newValue.vertexs);
          }
        }, true);

        self.fetchData = function(keyword) {
          self.ERSearch.fetchData(keyword);
        };

        self.ERActiveObj = null;
        self.addItemToTagSelect = function(item) {
          self.ERActiveObj = item;
          self.tagSearch.getTagData(item.code).then(() => {
            scope.$digest();
          });
        };
        self.getERType = function(type) {
          let _typeName="";
          self.ERSearch.constantER.forEach((item)=>{
            if(item.type===type){
              _typeName=item.ChineseName;
            }
          })
          return _typeName;
        };
        self.addItemToContainer = function(item) {
          var _obj = {
            type: self.ERActiveObj.domainType,
            code: self.ERActiveObj.code,
            name: self.ERActiveObj.name
          };
          let data = $.extend(true, {}, item);
          if (self.activeItem === self.navs[0].key) {
            let result = scope.data.secondStep.inputData.tags.filter(function(inputItem) {
              return inputItem.code === item.code;
            });
            self.tagSearch.getTagSelectedData(item);
            if (result.length === 0) {
              let objsResult = scope.data.secondStep.inputData.objs.filter(function(objsItem) {
                return objsItem.code === item.markedDomainCode;
              });
              if (objsResult.length === 0) {
                scope.data.secondStep.inputData.objs.push($.extend({}, _obj));
              }
             data._obj = _obj;
              scope.data.secondStep.inputData.tags.push(data);
            }
            $rootScope.$broadcast(EVENTS.ADD_ITEM_CONDITION_MODAL, $.extend(true, {
              markedDomainName: self.ERActiveObj.name
            }, item));
          } else if (self.activeItem === self.navs[1].key) {
            let result = scope.data.secondStep.outputData.tags.filter(function(outputItem) {
              return outputItem.code === item.code;
            });
            if (result.length === 0) {
              let objsResult = scope.data.secondStep.outputData.objs.filter(function(objsItem) {
                return objsItem.code === item.markedDomainCode;
              });
              if (objsResult.length === 0) {
                scope.data.secondStep.outputData.objs.push($.extend({}, _obj));
                _.uniqBy(scope.data.secondStep.outputData.objs, "code");
              }
              data._obj = _obj;
              scope.data.secondStep.outputData.tags.push(data);
              _.uniqBy(scope.data.secondStep.outputData.tags, "code");
            }
          }
        };
        
        scope.$on(EVENTS.REMOVE_ITEM_INPUTDATA, function(event, inputDataParams) {
          if(inputDataParams.tags.length>0){
            scope.data.secondStep.inputData.tags.forEach((tagItem, index) => {
              if (tagItem.code === inputDataParams.tags[0].config.code) {
                scope.data.secondStep.inputData.tags.splice(index, 1);
              }
            });
          }
          if(inputDataParams.objs.length>0){
            scope.data.secondStep.inputData.objs.forEach((objItem, index) => {
              if (objItem.code === inputDataParams.objs[0].config.markedDomainCode) {
                scope.data.secondStep.inputData.objs.splice(index, 1);
              }
            });
          }
        }); 

        self.removeItemToContainer = function(item) {
          if (self.activeItem === self.navs[0].key) {
            $rootScope.$broadcast(EVENTS.REMOVE_ITEM_CONDITION_MODAL, item);
          } else if (self.activeItem === self.navs[1].key) {
            scope.data.secondStep.outputData.tags.forEach((tagItem, index) => {
              if (tagItem.code === item.code) {
                scope.data.secondStep.outputData.tags.splice(index, 1);
              }
            });
            scope.data.secondStep.outputData.objs.forEach((objItem, index) => {
              let tags = scope.data.secondStep.outputData.tags.filter((tagItem) => {
                return tagItem._obj.code === objItem.code;
              });
              if (!!!tags.length) {
                scope.data.secondStep.outputData.objs.splice(index, 1);
              }
            });
          }
        }

      },
      template: require('./secondStep.html')
    }
  }
]);


module.exports = moduleName;
