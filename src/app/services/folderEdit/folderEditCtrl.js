"use strict";

import HttpRequest from "../httpCenter/request";

let EventEmitter = require("wolfy87-eventemitter");

let EVENTS = require("../events");
//测试数据
var testdata = require("../welcomeDag/data");

function FolderEditController() {
  this.folderStatus = 0;
  this.topSubjects = {};
  this.folderInfo = {};
  this.folderBosList = {};
  this.folderCanvas = {};
  this.eventProxy = new EventEmitter();
}

FolderEditController.prototype.getTopSubject = function(obj) {
  this.topSubjects.promise = HttpRequest.GetTopSubject({
    workspaceId: obj.workspaceId
  }).then(function(data) {
    if (data) {
      this.topSubjects = {
        id: obj.workspaceId,
        data: data
      };
    }
    return this.topSubjects;
  }.bind(this));

  return this.topSubjects.promise;
}

FolderEditController.prototype.getFolderData = function(obj) {
  this.folderInfo.promise = HttpRequest.GetFolderInfo({
    folderId: obj.folderId
  }).then(function(data) {
    let time = new Date(data.createdOn);
    let date = time.getFullYear() + "/" + (time.getMonth() + 1) + "/" + time.getDate() + " " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();

    this.folderInfo = {
      folderId: obj.folderId,
      name: data.name,
      owner: data.owner,
      createdBy: date.createdBy,
      createdOn: date,
      parentId: data.parentId,
      parentName: "无",
      pageDescription: data.pageDescription,
      modifiedVersion: data.modifiedVersion,
      color: data.color //"#c00000"//
    };
    return this.folderInfo;
  }.bind(this));

  return this.folderInfo.promise;
}

FolderEditController.prototype.getFolderBosList = function(obj) {
  this.folderBosList.promise = HttpRequest.GetBosList({
    workspaceId: 1,
    parentId: obj.folderId,
    pageNum: 1,
    pageSize: 1000,
    objectTypes: obj.objTypes
  }).then(function(data) {
    if (data) {
      this.folderBosList = data.data;
    }

    return this.folderBosList;
  }.bind(this));

  return this.folderBosList.promise;
}


FolderEditController.prototype.getFolderCanvas = function(obj) {
  this.folderCanvas.promise = HttpRequest.GetFolderLoad({
    folderId: obj.folderId
  }).then(function(cavasData) {
    if (cavasData) {
      this.folderCanvas = {
        id: obj.folderId,
        data: cavasData
      };
    }
    return this.folderCanvas;
  }.bind(this));

  return this.folderCanvas.promise;
}

FolderEditController.prototype._dealWithData = function(data) {
  var tmpVertexs = [];
  var tmpEdges = [];

  testdata.links.forEach((item) => {
    var tmpEdge = {};
    tmpEdge.type = 0;
    tmpEdge.vertexs = [item.source, item.target]; //item.vertexs;
    tmpEdges.push(tmpEdge);
  });
  testdata.nodes.forEach((item) => {
    var tmpVertex = {};
    tmpVertex.type = 5;
    tmpVertex.identifier = item.id;
    tmpVertex.detectable = true;
    tmpVertex.critical = true;
    tmpVertex.position = [item.x, item.y]; //item.position;
    tmpVertex.content = [item.name];
    tmpVertexs.push(tmpVertex);
  });

  this.folderCanvas.vertexs = tmpVertexs;
  this.folderCanvas.edges = tmpEdges;
}

FolderEditController.prototype.clearCache = function() {
  this.folderInfo = {};
  this.childList = {};
  this.folderCanvas = {};
}

FolderEditController.prototype.saveFolder = function(data) {
  this.eventProxy.emitEvent(EVENTS.SHOW_CREATE_FOLDER_MODAL, data);
}


export default new FolderEditController();
