"use strict";

var _ = require("lodash");
let toast = require("../toast/toast");
let HttpRequest = require("../httpCenter/request");
let EVENTS = require("../events");

function Cache() {
  this.activeTab = {};
  this.tabsArray = [];
  this.cache = {};
  this.isInit = true;
  this.left =0;
}

Cache.prototype.init = function() {
  if(this.isInit){
      HttpRequest.GetHistoryTabsBar({
        workspaceId : 1
      }).then(function(ObjectList) {
        this.tabsArray = [];
        if(ObjectList){
          ObjectList.forEach((item)=>{
            item.type = item.objectType;
            item.status = 0;
            item.onlyKey = item.type+":"+item.id;
            this.tabsArray.push(item);
            this.active(item.onlyKey);
          }.bind(this))
        }
      }.bind(this));
    this.isInit = false;
  }
}

Cache.prototype.active = function(key) {
  var obj = this.cache[key]; 
  if (obj) {
    this.activeTab = obj;
  }
}

Cache.prototype.addTabItem = function(data) {
  var result = this.tabsArray.filter(function(item){
      return item.onlyKey === data.onlyKey;
  });
  if(result.length === 0){
      this.tabsArray.push(data); 
  }
}

Cache.prototype.removeTabItem = function(key) {
  var self = this;
  self.tabsArray.forEach(function(item,index){
      if(item.onlyKey === key){
        self.tabsArray.splice(index,1);
        return;
      }
  });
}

Cache.prototype.getCache = function(key) {
  return this.cache[key];
}

Cache.prototype.setCache = function(key, value) {
  this.cache[key] = value;
}

Cache.prototype.clearCache = function() {
  this.activeTab = {};
  this.tabsArray = [];
  this.showTabsArray = [];
  this.cache = {};
}

module.exports = new Cache();
