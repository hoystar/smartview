"use strict";

var HttpRequest = require("../httpCenter/request");

function tagSearch() {
  this.tagSelected = null; //选中的标签
  this.tagData = []; //所有标签数据
  this.tagCache = {};
  this.tagSelectedCache = {};
}

tagSearch.prototype.getTagData = function(domainCode) {
  var self = this;
  self.tagData = [];
  self.tagSelected = null;
  let result = this._getTagCache(domainCode);
  if (result) {
    $.extend(self.tagData, result);
    return Promise.resolve(result);
  } else {
    return HttpRequest.GetERTagDetail({
      domainCode: domainCode
    }).then((data) => {
      $.extend(self.tagData, data);
      self._setTagCache(domainCode, data);
      return self.tagData;
    });
  }
}

tagSearch.prototype.getTagSelectedData = function(item) {
  
  let self = this;
  let result = self._getTagSelectedCache(item.code);
  if (result) {
    return Promise.resolve(result);
  } else {
    return HttpRequest.GetTagStructDetail({
      domainCode: item.markedDomainCode,
      tagCode: item.code
    }).then((data) => {
      this._setTagSelectedCache(data.code, data);
      return data;
    });
  }
}

tagSearch.prototype._getTagCache = function(key) {
  return this.tagCache[key];
};

tagSearch.prototype._setTagCache = function(key, value) {
  this.tagCache[key] = value;
};

tagSearch.prototype._getTagSelectedCache = function(key) {
  return this.tagSelectedCache[key];
};

tagSearch.prototype._setTagSelectedCache = function(key, value) {
  this.tagSelectedCache[key] = value;
};

tagSearch.prototype.clear = function() {

}


module.exports = new tagSearch();