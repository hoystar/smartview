"use strict";

import HttpRequest from "../httpCenter/request";

let EventEmitter = require("wolfy87-eventemitter");

let EVENTS = require("../events");

function Controller() {
  this.data = {};
  this.cache = {};
  this.eventProxy = new EventEmitter();
  this.folderMenu = {
    folder: [
      ["编辑目录", this.editFolder.bind(this)],
      ["创建目录", this.addFolder.bind(this)],
      ["删除目录", this.deleteFolder.bind(this)],
      ["创建视图", this.addCanvas.bind(this)]
    ]
  };
  this.fileMenu = {
    file: [
      ["删除视图", this.deleteNode.bind(this)],
      ["编辑视图", this.editNode.bind(this)]
    ]
  };
}

Controller.prototype.getData = function(obj, isIgnoreCache) {
  //没有缓存
  if (!this.data[obj.parentId]) {
    this.data[obj.parentId] = {};
    this.data[obj.parentId].isPullingData = true;
    this.data[obj.parentId].promise = HttpRequest.GetBosList({
      workspaceId: 1,
      parentId: obj.parentId,
      pageNum: 1,
      pageSize: 1000,
      objectTypes: "5,10"
    }).then(function(data) {
      let result = this._dealWithData(data.data, obj.parentId);
      this.data[obj.parentId].data = result;
      this.data[obj.parentId].isPullingData = false;
      this.data[obj.parentId].isPullData = true;

      if (isIgnoreCache) {
        this.data[obj.parentId] = null;
      } else {
        this.data[obj.parentId].data.forEach((item) => {
          this.cache[item.fieldId] = item;
        });
        this.cache[obj.parentId] && (this.cache[obj.parentId].isPullData = true);
      }
      return result;
    }.bind(this));
    return this.data[obj.parentId].promise;
  } else if (this.data[obj.parentId].isPullData) {
    //有缓存
    return Promise.resolve(this.data[obj.parentId].data);
  } else if (this.data[obj.parentId].isPullingData) {
    //请求中
    return this.data[obj.parentId].promise;
  }
}

Controller.prototype._dealWithData = function(data, parentId) {
  let self = this;
  let result = data.map((item) => {
    let obj = {
      fieldId: item.id,
      name: item.name,
      objectType: item.objectType,
      expanded: false,
      folder: true,
      isPullData: false,
      hasAppendToTree: false
    }

    if (obj.objectType === 10) {
      obj.menu = this.fileMenu;
    } else if (obj.objectType === 5) {
      obj.menu = this.folderMenu;
    }
    return obj;
  });

  return result;
}


Controller.prototype.findChain = function(params) {
  let result = [];
  let node = params.branch;
  while (node) {
    result.unshift(node);
    node = node.parent;
  }
  return result;
}
Controller.prototype.findNode = function(id) {
  return this.cache[id];
}

Controller.prototype.addNode = function(parentId, node) {
  let parent = this.findNode(parentId);
  let item = $.extend(true, {
    objectType: 10, // 默认使用10
    expanded: false,
    folder: false,
    isPullData: false,
    hasAppendToTree: false
  }, node);
  if (node.objectType === 10) {
    item.menu = this.fileMenu;
  } else if (node.objectType === 5) {
    item.menu = this.folderMenu;
  }
  if (this.data[parentId]) {
    this.data[parentId].data.unshift(item);
  }
  this.cache[item.fieldId] = item;
  this.eventProxy.emitEvent(EVENTS.TREE_ADD_NODE, [parent, item]);
}

Controller.prototype.editNode = function(scope) {
  HttpRequest.GetCanvasInfo({
    canvasId: scope.row.branch.fieldId
  }).then((data) => {
    this.eventProxy.emitEvent(EVENTS.TREE_EDIT_NODE, [data]);
  });
}

Controller.prototype.updateNode = function(data) {
  this.eventProxy.emitEvent(EVENTS.TREE_UPDATE_NODE, [data]);
}

Controller.prototype.clearCache = function() {
  this.data = {};
  this.cache = {};
}

Controller.prototype.deleteNode = function(item) {
  this.eventProxy.emitEvent(EVENTS.TREE_DELETE_NODE, [item.row]);
}

Controller.prototype.addCanvas = function(item) {
  this.eventProxy.emitEvent(EVENTS.SHOW_CREATE_CANVAS_MODAL, [item.row]);
}

Controller.prototype.addFolder = function(item) {
  this.eventProxy.emitEvent(EVENTS.SHOW_CREATE_FOLDER_MODAL, [item.row]);
}

Controller.prototype.editFolder = function(item) {
  this.eventProxy.emitEvent(EVENTS.SHOW_EDIT_FOLDER_MODAL, [item.row]);
}

Controller.prototype.deleteFolder = function(item) {
  this.eventProxy.emitEvent(EVENTS.SHOW_DELETE_FOLDER_MODAL, [item.row]);
}

export default new Controller();
