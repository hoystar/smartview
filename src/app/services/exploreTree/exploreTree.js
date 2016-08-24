"use strict";

import HttpRequest from "../httpCenter/request";

let EventEmitter = require("wolfy87-eventemitter");
let toast = require("../../services/toast/toast");
let moment = require("moment");
let EVENTS = require("../events");
let OBJECTTYPE = require("../objectType");

function exploreTreeCtrl() {
  this.defineData = {};
  this.instanceData = {};
  this.instData = {};
  this.eventProxy = new EventEmitter();
}

exploreTreeCtrl.prototype.getTreeData = function(parentId) {
  return HttpRequest.GetBosList({
    workspaceId: 1,
    parentId: parentId,
    pageNum: 1,
    pageSize: 1000,
    objectTypes: "5,20"
  }).then((data) => {
    this.defineData[parentId] && (this.defineData[parentId].isPullData = true);
    return data.data.map((item) => {
      let result = {
        id: item.id,
        name: item.name,
        objectType: item.objectType,
        parentId: parentId,
        isPullData: false
      };
      if (item.objectType === OBJECTTYPE.EXPLORE_FOLDER) {
        result.defineId = item.defineId,
          result.menu = {
            folder: [
              ["查看探索", this.checkDefine.bind(this)],
              ["编辑探索", this.editExplore.bind(this)],
              ["删除探索", this.delExplore.bind(this)],
              ["创建实例", this.execExplore.bind(this)]
            ]
          }
      } else if (item.objectType === OBJECTTYPE.FOLDER) {
        result.menu = { folder: [] };
      }
      this.defineData[item.id] = result;
      return result;
    });
  });
}

exploreTreeCtrl.prototype.getSubTreeData = function(id) {
  if (this.instData[id]) {
    return Promise.resolve(this.instData[id]);
  } else {
    return HttpRequest.GetBosList({
      workspaceId: 1,
      parentId: id,
      pageNum: 1,
      pageSize: 1000,
      objectTypes: OBJECTTYPE.EXPLORE_INSTANCE
    }).then((data) => {
      this.instData[id] = data.data;
      this.defineData[id] && (this.defineData[id].isPullData = true);
      return data.data.map((item) => {
        return {
          id: item.id,
          defineId: item.parentId,
          instanceId: item.id,
          name: item.name,
          objectType: item.objectType,
          menu: {
            folder: [
              ["查看实例", this.checkDefineInsts.bind(this)],
              ["删除实例", this.deleteDefineInsts.bind(this)],
              ["执行实例", this.execDefineInsts.bind(this)]
            ]
          }
        }
      });
    });
  }
}
exploreTreeCtrl.prototype.getsInstancesTreeData = function(id) {
  if (this.instData[id]) {
    return Promise.resolve(this.instData[id]);
  } else {
    return HttpRequest.GetInstsSchds({
      instanceId: id
    }).then((data) => {
      this.instanceData[id] = {
        data: data,
        isPullData: true,
        id: id
      };
      return data.map((item) => {
        return {
          id: item.schedulerId,
          instanceId: item.instanceId,
          name: "执行于"+moment(item.createdOn).format("YYYYMMDD HH:mm:ss"),
          objectType: item.objectType,
          menu: {
            file: [
              ["查看结果", this.checkDefineInsts.bind(this)]
            ]
          }
        }
      });

      this.instData[id] = data;
    });
  }
}
exploreTreeCtrl.prototype.editExplore = function(item) {
  //todo
}

exploreTreeCtrl.prototype.checkDefine = function(item) {
  this.eventProxy.emitEvent(EVENTS.GO_DEFINE_PAGE, [item.row]);
}

exploreTreeCtrl.prototype.delExplore = function(item) {
  this.eventProxy.emitEvent(EVENTS.DELETE_EXPLORE_MODAL, [item.row]);
}

exploreTreeCtrl.prototype.execExplore = function(item) {
  this.eventProxy.emitEvent(EVENTS.SHOW_EXEC_EXPLORE_MODAL, [item.row]);
}

exploreTreeCtrl.prototype.execDefineInsts = function(item) {
  this.eventProxy.emitEvent(EVENTS.SHOW_EXEC_DEFINEINSTS_MODAL, [item.row]);
}
exploreTreeCtrl.prototype.checkDefineInsts = function(item) {
  this.eventProxy.emitEvent(EVENTS.SHOW_EXEC_EXPLORE_INSTS, [item.row]);
}

exploreTreeCtrl.prototype.deleteDefineInsts = function(item) {
  this.eventProxy.emitEvent(EVENTS.DELETE_EXPLORE_INSTS, [item.row]);
}
exploreTreeCtrl.prototype.addInst = function(parentId, obj) {
  let parent = this.findDefine(parentId);
  let node = $.extend(true, {}, obj);
  this.eventProxy.emitEvent(EVENTS.ADD_INST_TO_TREE, [parent, node]);
}
exploreTreeCtrl.prototype.delInst = function(parentId, obj) {
  let parent = this.findDefine(parentId);
  let node = $.extend(true, {}, obj);
  this.eventProxy.emitEvent(EVENTS.DEL_INST_TO_TREE, [parent, node]);
}

exploreTreeCtrl.prototype.addInstResult = function(parentId, obj) {
  let parent = this.findInstance(parentId);
  let node = $.extend(true, {}, obj);
  this.eventProxy.emitEvent(EVENTS.ADD_INST_TO_TREE, [parent, node]);
}
exploreTreeCtrl.prototype.addDefinde = function(obj) {
  let node = $.extend(true, {}, obj);
  this.eventProxy.emitEvent(EVENTS.ADD_DEFINE_TO_TREE, [node]);
}

exploreTreeCtrl.prototype.findDefine = function(defineId) {
  return this.defineData[defineId];
}
exploreTreeCtrl.prototype.findInstance = function(instanceId) {
  return this.instanceData[instanceId];
}


module.exports = new exploreTreeCtrl();
