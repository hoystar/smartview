"use strict";

require("./modal.less");

var moduleName = "app.modal.conditionModal";

var tagSearchService = require("../../../services/condition/tagSearch.js");
let toast = require('../../toast/toast');
var app = angular.module(moduleName, [
  require("../../../directives/dateTimePicker/dateTimePicker")
]);

app.factory("conditionModal", [
    "$uibModal",
    function($uibModal) {
      return function(params) {
        return $uibModal.open({
          animation: true,
          backdrop: false,
          template: require("./modal.html"),
          controller: 'conditionModalCtrl',
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
  .controller("conditionModalCtrl", [
    "$scope",
    "$uibModalInstance",
    "params",
    function($scope, $uibModalInstance, params) {
      var self = this;

      this.tagTypeConstant = {
        INTEGER: "INTEGER",
        BIGINT: "BIGINT",
        NUMERIC: "NUMERIC",
        TEXT: "TEXT",
        DATE: "DATE",
        DATETIME: "DATETIME",
        BOOLEAN: "BOOLEAN"
      };

      this.inputConstant = {
        NULL: "NULL",
        ONE: "ONE",
        BETWEEN: "BETWEEN",
        MULTI: "MULTI"
      };

      this.tagTypeArray = [{
        type: "INTEGER",
        value: [11],
        enumValue: [11, 12]
      }, {
        type: "BIGINT",
        value: [11],
        enumValue: [11, 12]
      }, {
        type: "NUMERIC",
        value: [11],
        enumValue: [11, 12]
      }, {
        type: "TEXT",
        value: [],
        enumValue: [ 11, 12]
      }, {
        type: "DATE",
        value: [7, 8, 11],
        enumValue: [7, 8, 11, 12]
      }, {
        type: "DATETIME",
        value: [7, 8, 11],
        enumValue: [7, 8, 11, 12]
      }, {
        type: "BOOLEAN",
        value: [2, 3, 4, 5, 6, 7, 8, 11, 12],
        enumValue: [2, 3, 4, 5, 6, 7, 8, 11, 12]
      }];
      this.conditionArray = [{
        id: 1,
        name: "等于 (=)",
        value: "EQ"
      }, {
        id: 2,
        name: "大于等于 (>=)",
        value: "GE"
      }, {
        id: 3,
        name: "大于 (>)",
        value: "GT"
      }, {
        id: 4,
        name: "小于等于 (<=)",
        value: "LE"
      }, {
        id: 5,
        name: "小于 (<)",
        value: "LT"
      }, {
        id: 6,
        name: "不等于 (<>)",
        value: "NE"
      }, {
        id: 7,
        name: "在列表中 (in)",
        value: "IN"
      }, {
        id: 8,
        name: "不在列表中 (not in)",
        value: "NOT_IN"
      }, {
        id: 9,
        name: "为空 (is null)",
        value: "IS"
      }, {
        id: 10,
        name: "不为空 (is not null)",
        value: "IS_NOT"
      }, {
        id: 11,
        name: "类似 (like)",
        value: "LIKE"
      }, {
        id: 12,
        name: "在..之间 (between)",
        value: "BETWEEN"
      }];

      this.resultData = {
        nullValue: undefined,
        oneValue: undefined,
        betweenValue: [],
        multiValue: []
      };
      this.resultArray = [];
      this.tagType = ""; //接口传回来的type
      this.ConditionObj = {}; //选中的条件对象
      this.currentConditionArray = []; // 展现的条件选项数组
      this.inputType = this.inputConstant.ONE; //0表示null或者not null  1表示一个框  2表示俩个框  3表示可能多个框

      this.isEnum = false; //是否为枚举数组
      this.enumData = []; //接口返回的枚举数组
      this.enumDataSelected = undefined;

      this.tagEntity = params.info.markedDomainName;
      this.tagCode = params.info.name;
      this.boolSelected = undefined;
      this.plusArray = []; //非枚举情况下添加input的数组
      this.dateTimePickerArray = []; //时间数组
      this.dateTimeArray = []; //时间数组，只保存时间值
      this.tagSearch = tagSearchService;
      this.dateTime1 = undefined;
      this.dateTime2 = undefined;
      this.conditionSelected = {};
      this.savedDate = [];
      let plusArrayItem={id:null,value:null};
      var init = function() {
        let data = self.tagSearch._getTagSelectedCache(params.info.code);
         self.tagType = data.type;
        self.isEnum = data.isEnum;
        if (data.enumData !== undefined) {
          self.enumData = data.enumData;
        }
        if (!_.isEmpty(params.info.condition)) {
          let condition = _.find(self.conditionArray, function(item) {
            return item.value === params.info.condition.contrast;
          });
          self.changeInputType(condition.id);
          self.ConditionObj = condition;

          if (self.isEnum) {
            if (self.inputType === self.inputConstant.MULTI) {
              self.enumDataSelected = [];
              $.extend(true, self.enumDataSelected, params.info.condition.rightValue.value);
            } else if (self.inputType === self.inputConstant.ONE) {
              self.enumDataSelected = params.info.condition.rightValue.value;
            }
          } else {
            if (self.inputType === self.inputConstant.BETWEEN) {
              if (self.tagType === self.tagTypeConstant.DATE || self.tagType === self.tagTypeConstant.DATETIME) {
                self.dateTime1 = params.info.condition.rightValue.value[0];
                self.dateTime2 = params.info.condition.rightValue.value[1];
              } else {
                $.extend(self.resultData.betweenValue, params.info.condition.rightValue.value);
              }
            } else if (self.inputType === self.inputConstant.MULTI) {
              self.plusArray=params.info.condition.rightValue.value.map((item,index)=>{
                let Item=$.extend(true,{},plusArrayItem);
                  Item.id=index;
                  Item.value=item;
                return Item;
              });
            } else if (self.inputType === self.inputConstant.ONE) {
              if (self.tagType === self.tagTypeConstant.BOOLEAN) {
                self.boolSelected = params.info.condition.rightValue.value;
              } else if (self.tagType === self.tagTypeConstant.DATE || self.tagType === self.tagTypeConstant.DATETIME) {
                self.dateTime1 = params.info.condition.rightValue.value;
              } else {
                self.resultData.oneValue = params.info.condition.rightValue.value;
              }
            }
          }
        };

        changeCondition();
      };

      //改变条件
      var changeCondition = function() {
        self.currentConditionArray = [];
        var tempConditionArrayArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        var tempTagArray = self.tagTypeArray.filter(function(item) {
          return item.type === self.tagType;
        });

        var finalArray = [];
        if (self.isEnum) {
          finalArray = tempTagArray[0].enumValue.filter(function(i) {
            return tempConditionArrayArray.indexOf(i) > -1
          });
        } else {
          finalArray = tempTagArray[0].value.filter(function(i) {
            return tempConditionArrayArray.indexOf(i) > -1
          });
        }
        $.extend(self.currentConditionArray, self.conditionArray.filter(function(item) {
          return finalArray.indexOf(item.id) === -1;
        }));
        if (_.isEmpty(self.ConditionObj)) {
          self.ConditionObj = self.currentConditionArray[0];
        }
      };

      //选中条件后改变输入框数
      self.changeInputType = function(id) {
        if (id === 12) {
          self.inputType = self.inputConstant.BETWEEN;
        } else if (id === 9 || id === 10) {
          self.inputType = self.inputConstant.NULL;
        } else if (id === 7 || id === 8) {
          self.inputType = self.inputConstant.MULTI;
        } else {
          self.inputType = self.inputConstant.ONE;
        }
      };
      init();
      this.addItemPlusArray = function() {

        let len = self.plusArray.length;
        if (len < 10) {
          let item=$.extend(true,{},plusArrayItem);
          item.id=len+1;
          self.plusArray.push(item);
        }
      };

      this.removeItemPlusArray = function(id) {
        self.plusArray.forEach(function(item, index) {
          if (item.id === id) {
            self.plusArray.splice(index, 1);
          }
        });
      };

      var compareBetweenValue = function(leftValue, rightValue) {
        if (rightValue > leftValue) {
          return true;
        } else {
          toast("error", "between运算符第一个值必须小于第二个值！");
          return false;
        }
      }

      this.submit = function() {
        let resultValue;
        if (self.isEnum) {
          if (self.inputType === self.inputConstant.MULTI) {
            resultValue = [];
            $.extend(resultValue, self.enumDataSelected);
          } else if (self.inputType === self.inputConstant.ONE) {
            resultValue = self.enumDataSelected;
          } else if (self.inputType === self.inputConstant.NULL) {
            resultValue = null;
          }
        } else {
          if (self.inputType === self.inputConstant.BETWEEN) {
            resultValue = [];
            if (self.tagType === self.tagTypeConstant.DATE || self.tagType === self.tagTypeConstant.DATETIME) {
              if (compareBetweenValue(self.dateTime1, self.dateTime2)) {
                resultValue.push(self.dateTime1);
                resultValue.push(self.dateTime2);
              }else{
                return;
              }
            } else {
              if (compareBetweenValue(self.resultData.betweenValue[0], self.resultData.betweenValue[1])) {
                $.extend(resultValue, self.resultData.betweenValue);
              }else{
                return;
              }
            }
          } else if (self.inputType === self.inputConstant.MULTI) {
            resultValue = [];
            resultValue = self.plusArray.map((item) => {
              return item.value;
            });
          } else if (self.inputType === self.inputConstant.ONE) {
            if (self.tagType === self.tagTypeConstant.BOOLEAN) {
              resultValue = self.boolSelected;
            } else if (self.tagType === self.tagTypeConstant.DATE || self.tagType === self.tagTypeConstant.DATETIME) {
              resultValue = self.dateTime1;
            } else {
              resultValue = self.resultData.oneValue;
            }
          } else if (self.inputType === self.inputConstant.NULL) {
            resultValue = null;
          }
        }

        let result = {

          contrast: self.ConditionObj.value,
          leftValue: {
            type: "OBJECT",
            value: {
              code: params.info.markedDomainCode,
              name: params.info.name,
              tag: params.info.code,
              type: params.info.type
            }
          },
          rightValue: {
            type: self.tagType,
            value: resultValue
          }
        };
        $uibModalInstance.close(result);
      };

      this.cancel = function() {
        $uibModalInstance.dismiss('cancel');
      };


    }
  ]);

module.exports = moduleName;
