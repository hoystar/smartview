"use strict";
import _ from "lodash";

function ERSearch() {
  this.ERSelected = null;
  this.ERData = [];
  this.ERDataCache = [];

  this.constantER = [{ name: "ENTITY", ChineseName: "实体", type: 1 }, { name: "RELATION", ChineseName: "关系", type: 2 }];

}

ERSearch.prototype.translateData = function(ERArray) {
  var self = this;
    self.ERData = [];
    self.ERDataCache=[];
  self.ERSelected = null;
  ERArray.forEach(function(item) {
    let _index = _.findIndex(self.ERData, function(ERItem) {
      return ERItem.code === item.content[0].code;
    });
    if (_index === -1) {
      self.ERData.push(item.content[0]);
      _.orderBy(self.ERData, ['code', 'domainType'], ['asc', 'asc']);
      self.ERDataCache.push(item.content[0]);
    }
  });
};

ERSearch.prototype.fetchData = function(keyword) {
  var self = this;
  this.ERData = [];
  self.ERDataCache.forEach(function(item) {
    if (item.description.indexOf(keyword) > -1 || item.name.indexOf(keyword) > -1 || item.code.indexOf(keyword) > -1) {
      self.ERData.push(item);
      _.orderBy(self.ERData, ['code', 'domainType'], ['asc', 'asc']);
    }
  });
};


ERSearch.prototype.clear = function() {
  this.ERData = [];
  this.ERDataCache = [];
  this.ERSelected = null;
};

module.exports = new ERSearch();
