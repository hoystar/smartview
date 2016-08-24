"use strict";

require('./exploreTree.less');

var moduleName = "app.exploreTree";

var HttpRequest = require("../../services/httpCenter/request");

let exploreTreeCtrl = require("../../services/exploreTree/exploreTree");

let EVENTS = require("../../services/events");

let TYPE = require("../../services/objectType");
let toast = require("../../services/toast/toast");
let moment = require("moment");
var app = angular.module(moduleName, [
  require("@ali/aliyun-naza-tree"),
  require("@ali/aliyun-naza-options"),
  require("@ali/aliyun-naza-multicollection"),
  require("../../services/modal/execExploreModal/modal"),
  require("../../services/modal/deleteDtDefineModal/modal")
]);

app.directive("exploreTree", [
  "$state",
  "nzTreeModel",
  "execExploreModal",
  "deleteDtDefineModal",
  function($state, nzTreeModel, execExploreModal, deleteDtDefineModal) {
    return {
      restrict: "AE",
      replace: true,
      controller: [
        "$scope",
        "$rootScope",
        function($scope, $rootScope) {

          let self = this;
          let treeModel = new nzTreeModel([]);
          self.exploreTreeCtrl = exploreTreeCtrl;
          self.treeModel = treeModel;
          self.treeOption = {
            nzContents: treeModel.data(),
            nzIcon: function(d) {
              if(d.branch.objectType === TYPE.FOLDER) {
                if(d.branch.expanded) {
                  return 'naza-tree-icon-folder-expanded';
                } else {
                  return 'naza-tree-icon-folder-closed';
                }
              } else if(d.branch.objectType === TYPE.EXPLORE_FOLDER){
                if (d.branch.expanded) {
                  return 'naza-tree-icon-define-expanded';
                } else {
                  return 'naza-tree-icon-define-closed';
                }
              }else if(d.branch.objectType === TYPE.EXPLORE_INSTANCE){
                if (d.branch.expanded) {
                  return 'naza-tree-icon-instance-expanded';
                } else {
                  return 'naza-tree-icon-instance-closed';
                }
              }else if(d.branch.objectType === TYPE.EXPLORE_INSTANCE_RESULT) {
                return 'naza-tree-icon-canvas';
              }
            },
            nzFolder: function(d) {
              return d.branch.objectType === TYPE.EXPLORE_FOLDER || d.branch.objectType === TYPE.FOLDER || d.branch.objectType === TYPE.EXPLORE_INSTANCE;
            },
            nzFileId: function(d) {
              return d.branch.id;
            },
            nzClick: function(d) {
              if(d.branch.objectType === TYPE.FOLDER){
                return;
              }
              $rootScope.$broadcast(EVENTS.TAGSBAR_ADD_NODE, {
                item:d.branch
              });
            },
            nzDblclick: function(d) {
              if(d.branch.folder) {
                if(d.branch.expanded) {
                  treeModel.collapse(d.branch);
                  treeModel.update();
                } else {
                  if(d.branch.objectType === TYPE.FOLDER){
                    self.exploreTreeCtrl.getTreeData(d.branch.id).then((data) => {
                      treeModel.append(d.branch, data);
                      treeModel.update();
                    })
                  } else if(d.branch.objectType === TYPE.EXPLORE_FOLDER){
                    self.exploreTreeCtrl.getSubTreeData(d.branch.id).then(function(subTree) {
                      treeModel.append(d.branch, subTree);
                      treeModel.update();
                    });
                  }else if(d.branch.objectType === TYPE.EXPLORE_INSTANCE){
                    self.exploreTreeCtrl.getsInstancesTreeData(d.branch.id).then(function(instancesTree) {
                      treeModel.append(d.branch, instancesTree);
                      treeModel.update();
                    });
                  }
                }
              }
            }
          }

          exploreTreeCtrl.getTreeData(-1).then((tree) => {
            treeModel.data(tree);
            treeModel.update();
          });
          exploreTreeCtrl.eventProxy.on(EVENTS.SHOW_EXEC_EXPLORE_MODAL, function(data) {
            HttpRequest.GetDtDefine({
              defineId: data.branch.id
            }).then((dataResult) => {
              execExploreModal({
              defineInfo:dataResult
              }).result.then((_data) => {
                 toast('success', "实例" + _data.name + "创建成功!");
                  let inst = {
                    defineId: _data.defineId,
                    description: _data.description,
                    instanceId: _data.instanceId, 
                    id: _data.instanceId,  
                    name: _data.name,
                    objectType: TYPE.EXPLORE_INSTANCE,
                    triggeredBy: new Date().getTime(),
                    triggeredOn: new Date().getTime()
                  };
                  exploreTreeCtrl.addInst(_data.defineId, inst);
              });
            })
            
          });
          exploreTreeCtrl.eventProxy.on(EVENTS.SHOW_EXEC_DEFINEINSTS_MODAL, function(data) {
            HttpRequest.ExecExploreByInstanceID({
              instanceId: data.branch.instanceId
            }).then((dataResult) => {
              toast('success', "实例ID:" + data.branch.instanceId + "开始执行");
              let instResult = {
                  instanceId: data.branch.instanceId,
                  id:dataResult.schedulerId,
                  schedulerId:dataResult.schedulerId,
                  name: "执行于"+moment(new Date()).format("YYYYMMDD HH:mm:ss"),                 
                  objectType: TYPE.EXPLORE_INSTANCE_RESULT,
                  triggeredBy: new Date().getTime(),
                  triggeredOn: new Date().getTime()
                };
                exploreTreeCtrl.addInstResult(data.branch.instanceId, instResult);
            })
          });

          exploreTreeCtrl.eventProxy.on(EVENTS.DELETE_EXPLORE_MODAL, function(item) {
            deleteDtDefineModal(item).result.then((data) => {
              $rootScope.$broadcast(EVENTS.TAGSBAR_DELETE_NODE, {
                key: item.branch.objectType+":"+ item.branch.id
              });
              if(item.branch.parent) {
                let _parent = treeModel.branch({
                  id: item.branch.parent.id,
                  folder: true
                });
                let _index = _.findIndex(_parent.children, function(child) {
                  return child.id == item.branch.id;
                });
                _parent.children.splice(_index, 1)
                treeModel.append(_parent, _parent.children);
                treeModel.update();
              } else {
                let _data = treeModel.data();
                let _index = _.findIndex(_data, function(child) {
                  return child.id == item.branch.id;
                });
                _data.splice(_index, 1);
                treeModel.data(_data);
                treeModel.update();
              }
            });
          });
          exploreTreeCtrl.eventProxy.on(EVENTS.DELETE_EXPLORE_INSTS, function(item) {
            HttpRequest.DeleteDtInstance({
              instanceId: item.branch.instanceId
            }).then((data) => {
              $rootScope.$broadcast(EVENTS.TAGSBAR_DELETE_NODE, {
                key: item.branch.objectType+":"+ item.branch.id
              });
              toast('success', '实例删除成功');
              if(item.branch.parent) {
                let _parent = treeModel.branch({
                  id: item.branch.parent.id,
                  folder: true
                });
                let _index = _.findIndex(_parent.children, function(child) {
                  return child.id == item.branch.id;
                });
                let _index2 = _.findIndex(exploreTreeCtrl.instData[item.branch.parent.id], function(child) {
                  return child.id == item.branch.id;
                });
                exploreTreeCtrl.instData[item.branch.parent.id].splice(_index2, 1)
                _parent.children.splice(_index, 1)
                treeModel.append(_parent, _parent.children);
                treeModel.update();
              } else {
                let _data = treeModel.data();
                let _index = _.findIndex(_data, function(child) {
                  return child.id == item.branch.id;
                });
                _data.splice(_index, 1);
                treeModel.data(_data);
                treeModel.update();
              }
            })
          });


          exploreTreeCtrl.eventProxy.on(EVENTS.GO_DEFINE_PAGE, function(data) {
              $rootScope.$broadcast(EVENTS.TAGSBAR_ADD_NODE, {
                item:data.branch
              });
          });

          exploreTreeCtrl.eventProxy.on(EVENTS.SHOW_EXEC_EXPLORE_INSTS, function(data) {
            self.treeOption.nzClick(data);
          });

          exploreTreeCtrl.eventProxy.on(EVENTS.ADD_INST_TO_TREE, function(parent, data) {
            if(parent && parent.isPullData) {
              var _parent = treeModel.branch({
                id: parent.id,
                folder: true
              });
              if(parent.objectType==20){
                exploreTreeCtrl.instData[parent.id].push(data);
              }
              _parent.children.unshift(data);
              treeModel.append(_parent, _parent.children);
              treeModel.update();
            }
          });
          exploreTreeCtrl.eventProxy.on(EVENTS.DEL_INST_TO_TREE, function(parent, data) {
            if(parent && parent.isPullData) {
              let _parent = treeModel.branch({
                id: parent.id,
                folder: true
              });
              let _index = _.findIndex(_parent.children, function(child) {
                return child.id == data.id;
              });
              _parent.children.splice(_index, 1)
              treeModel.append(_parent, _parent.children);
              treeModel.update();
            }
          });

          exploreTreeCtrl.eventProxy.on(EVENTS.ADD_DEFINE_TO_TREE, function(data) {
            if(data.parentId !== -1) {
              var _parent = treeModel.branch({
                id: data.parentId,
                folder: true
              });
              if(_parent.isPullData) {
                _parent.children.unshift(data);
                treeModel.append(_parent, _parent.children);
              }
            } else {
              let _data = treeModel.data();
              data.level = 0;
              _data.push(data);
              treeModel.update();
            }
          });
          
        }
      ],
      controllerAs: "tree",
      link: function(scope, element, attrs) {

      },
      template: require('./exploreTree.html')
    }
  }
])


module.exports = moduleName;
