"use strict";

import HttpRequest from "../httpCenter/request";
let EventEmitter = require("wolfy87-eventemitter");

var toast = require("../toast/toast");


function ExploreRange() {
  this.conditionArray = [{
    id: 1,
    name: "等于 (=)",
    symbol: "=",
    value: "EQ",
    valueType: "string"
  }, {
    id: 2,
    name: "在列表中 (in)",
    symbol: "in",
    value: "IN",
    valueType: "array"
  }, {
    id: 3,
    name: "在..之间 (between)",
    symbol: "between",
    value: "BETWEEN",
    valueType: "array"
  }];
}


ExploreRange.prototype.addInputBox = function(partition) {

  partition.value.push(this._createValue(partition));
};
ExploreRange.prototype._createValue = function(partition) {
  let inputType = "";
  if (partition.condition.type === "DATE" || partition.condition.type === "DATETIME") {
    inputType = "DATE";
  } else {
    inputType = "INPUT";
  }
  let value = {
    type: inputType,
    value: "",
  };
  return value;
};
ExploreRange.prototype.removeInputBox = function(partition, value) {
  if (partition.value.length > 1) {
    let index = _.findIndex(partition.value, value);
    if (index !== -1) {
      partition.value.splice(index, 1);
    }
  } else {
    toast("warning", "最后一个输入框无法删除!");
  }
};


//选中条件后改变输入框数
ExploreRange.prototype.changeInputType = function(item) {
  let conditionSymbol = _.find(this.conditionArray, function(conitem) {
    return item.condition.symbol === conitem.value;
  });
  item.condition.multiValue = false;
  item.condition.valueType = conditionSymbol.valueType;
  let value = this._createValue(item);
  if (conditionSymbol.symbol === 'between') {
    item.value.splice(2, item.value.length - 2);
    while (item.value.length < 2) {
      item.value.push(this._createValue(item));
    }
  } else if (conditionSymbol.symbol === 'in') {
    item.condition.multiValue = true;
    while (item.value.length < 1) {
      item.value.push(value);
    }
  } else {
    item.value.splice(1, item.value.length - 1);
    while (item.value.length < 1) {
      item.value.push(value);
    }
  }

};

ExploreRange.prototype.getSymbol = function(contrast) {
  let symbol = "";
  switch (contrast) {
    case "EQ":
      symbol = "=";
      break;
    case "GE":
      symbol = ">=";
      break;
    case "GT":
      symbol = ">";
      break;
    case "LT":
      symbol = "<";
      break;
    case "LE":
      symbol = "<=";
      break;
    case "NE":
      symbol = "<>";
      break;
    case "IN":
      symbol = "in";
      break;
    case "NOT_IN":
      symbol = "not in";
      break;
    case "BETWEEN":
      symbol = "between";
      break;
    case "LIKE":
      symbol = "like";
      break;
  }
  return symbol;
}
export default new ExploreRange();
