"use strict";
import HttpRequest from "../httpCenter/request";
let toast = require('../toast/toast');
let EVENTS = require("../events");

function Controller() {
  this.dataSourceList = [];
  this.extraProperty = {};
  this.baseProperty = [
    { label: "云计算资源标识", description: "请输入云计算资源标识", name: "showName", value: null, isRequired: true, inputType: "input" },
    { label: "资源存储类型", description: "", name: "type", value: {}, isRequired: true, inputType: "select" },
    { label: "描述", description: "", name: "comment", value: "", isRequired: false, inputType: "input" }
  ];
  this.dataSource = {};
  this.currentDataSource = [];
}

Controller.prototype.changeDataSourceType = function(dataSource) {
  this.baseProperty.filter((item => {
    return item.name === "type";
  }))[0].value = dataSource;
  this.currentDataSource = this.extraProperty[dataSource];
}

Controller.prototype.verifyDataSource = function() {
  let result = true;
  _.concat(this.currentDataSource, this.baseProperty).map((item) => {
    if (item.isRequired && (item.value === null || item.value.trim() === "")) {
      result = false;
    }
  });
  return result;
};

Controller.prototype.getDsData = function() {
  this.dataSource = {};
  if (!this.verifyDataSource()) {
    toast("error", "必填选项不能为空！");
    return Promise.resolve();
  }
  this.baseProperty.map((item) => {
    var _obj = {};
    let key = item.name;
    _obj[key] = item.value;
    $.extend(true, this.dataSource, _obj);
  });
  var connection = {};
  this.currentDataSource.map((item) => {
    var _obj = {};
    let key = item.name;
    _obj[key] = item.value;
    $.extend(true, connection, _obj);
  });
  this.dataSource.connection = JSON.stringify(connection);
  return Promise.resolve(this.dataSource);
}

export default Controller;
