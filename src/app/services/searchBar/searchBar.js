"use strict";

var _ = require("lodash");


var HttpRequest = require("../httpCenter/request");

function searchBarData() {
  this.navs = [{
    value: "ListEntities",
    text: "实体"
  }, {
    value: "ListLinks",
    text: "关系"
  }, {
    value: "SearchMarkedTagDomains",
    text: "标签"
  }, {
    value: "Table",
    text: "表"
  }];
  this.currentTag = this.navs[0].value;
  this.keyword = "";
  this.result = null;
  this.data = [];
  this.totalCnt = 0;
  this.pageNum = 0;
  this.pageSize = 100;
  this.isEOF = false;
  this.cache = {};
  this.isLoading = false;
  this.tableInfo = {
    currentType: "",
    currentProject: null,
    types: [],
    projects: []
  };

  //初始化types
  HttpRequest.GetResDsType().then(function(data) {
    this.tableInfo.types = data;
    this.tableInfo.types.unshift("all");
    this.tableInfo.currentType = this.tableInfo.types[0];
  }.bind(this));

}


searchBarData.prototype.getCache = function(value) {
  var cache = this.cache;
  !cache[value] && (cache[value] = {});
  this.totalCnt = cache[value].totalCnt || 0;
  this.keyword = cache[value].keyword || "";
  this.data = cache[value].data || [];
  this.isEOF = cache[value].isEOF || false;
  this.result = this.data.slice(0, this.pageSize);
}

searchBarData.prototype.setCache = function() {
  var cache = this.cache;
  var tag = this.currentTag;
  !cache[tag] && (cache[tag] = {});
  cache[tag].totalCnt = this.totalCnt;
  cache[tag].keyword = this.keyword;
  cache[tag].data = this.data;
  cache[tag].isEOF = this.isEOF;
}

searchBarData.prototype.changeTag = function(value) {
  this.setCache();
  this.getCache(value);
  this.currentTag = value;
  this.active();
}

searchBarData.prototype.active = function() {
  this.pageNum = 0;
  if (this.totalCnt !== 0) {
    this.getMore();
  }
}

searchBarData.prototype.getMore = function() {
  if (this.isEOF || this.isLoading) {
    return;
  }

  var _needNum = (this.pageNum + 1) * this.pageSize;
  if (this.totalCnt > _needNum) {
    this.result = this.data.slice(0, this.pageSize);
    return Promise.resolve(this.result);
  } else {
    return this.getData().then(function(resolve, reject) {
      if (this.currentTag === "SearchMarkedTagDomains") {
        this.result = this.data;
        return Promise.resolve(this.result);
      } else {
        this.result = this.data.slice(0, this.pageNum * this.pageSize);
        return Promise.resolve(this.result);
      }
    }.bind(this));

  }
}


searchBarData.prototype.getData = function() {
  switch (this.currentTag) {
    case "ListEntities":
      return this._ListEntities();
    case "ListLinks":
      return this._ListLinks();
    case "SearchMarkedTagDomains":
      return this._SearchMarkedTagDomains();
    case "Table":
      return this._FetchTable();
  }
}

searchBarData.prototype._ListEntities = function() {
  return HttpRequest.ListEntities({
    keyword: this.keyword,
    pageNum: this.pageNum + 1,
    pageSize: this.pageSize
  }).then(function(data) {
    if (data.length !== this.pageSize) {
      this.isEOF = true;
      this.totalCnt += data.length;
    }
    this.pageNum++;
    this.data = this.data.concat(this._resolveData(data));
    this.data = _.uniqBy(this.data, "id");
  }.bind(this));
}

searchBarData.prototype._ListLinks = function() {
  return HttpRequest.ListLinks({
    keyword: this.keyword,
    pageNum: this.pageNum + 1,
    pageSize: this.pageSize
  }).then(function(data) {
    if (data.length !== this.pageSize) {
      this.isEOF = true;
      this.totalCnt += data.length;
    }
    this.pageNum++;
    this.data = this.data.concat(this._resolveData(data));
    this.data = _.uniqBy(this.data, "id");
  }.bind(this));
}

searchBarData.prototype._SearchMarkedTagDomains = function() {
  return HttpRequest.SearchMarkedTagDomains({
    keyword: this.keyword,
    pageNum: this.pageNum + 1,
    pageSize: this.pageSize
  }).then(function(data) {
    if (data.length !== this.pageSize) {
      this.isEOF = true;
      this.totalCnt += data.length;
    }
    this.pageNum++;
    this.data = this._resolveMarkData(data);
  }.bind(this));
}

searchBarData.prototype._FetchTable = function() {
  if (!this.tableInfo.currentProject) {
    return Promise.reject({
      errorCode: -1,
      errorMessage: "请选择项目"
    });
  }
  return HttpRequest.GetTable({
    dsId: this.tableInfo.currentProject.name.dsId,
    keyword: this.keyword,
    pageNum: this.pageNum + 1,
    pageSize: this.pageSize
  }).then(function(data) {
    this.pageNum++;
    this.data = this.data.concat(this._resolveTableData(data));
  }.bind(this));
}

searchBarData.prototype._resolveData = function(data) {
  return data.map(function(item) {
    return {
      id: item.code,
      name: item.name,
      description: item.description,
      type: item.domainType,
      isSelected: false
    }
  });

}

searchBarData.prototype._resolveMarkData = function(data) {
  var obj = {};

  data.forEach(function(item) {
    item.domains.forEach(function(mark) {
      mark.type = mark.domainType;
      mark.id = mark.code;
    });
  });

  this.data.forEach(function(item) {
    obj[item.tagName] = item;
  });

  data.forEach(function(item) {
    if (obj[item.tagName]) {
      obj[item.tagName].domains = obj[item.tagName].domains.concat(item.domains);
      obj[item.tagName].domains = _.uniqBy(obj[item.tagName].domains, "code")
    } else {
      this.data.push(item);
    }
  }.bind(this));

  return this.data;
}

searchBarData.prototype._resolveTableData = function(data) {
  return data.data.map(function(item) {
    return {
      id: item.guid,
      dsId: item.dsId,
      description: item.comment,
      name: item.name,
      type: 3,
      dataLength: item.dataLength,
      isSelected: false
    };
  });
}

searchBarData.prototype.search = function() {
  this.pageNum = 0;
  this.data = [];
  this.result = [];
  this.isEOF = false;
  this.isLoading = false;
  return this.getMore();
}

searchBarData.prototype.getProject = function(keyword) {

  let type = this.tableInfo.currentType === "all" ? "" : this.tableInfo.currentType;
  return HttpRequest.GetProject({
    types: type,
    keyword: keyword
  }).then(function(data) {
    this.tableInfo.projects = data;
  }.bind(this));
}

module.exports = new searchBarData();
