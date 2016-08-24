"use strict";

require('./docTree.less');

import treeData from "./treeData";

import docTreeCtrl from "../../services/docTree/docTreeCtrl";

import EVENTS from "../../services/events";
import HttpRequest from "../../services/httpCenter/request";
let toast = require('../../services/toast/toast');

let _ = require("lodash");

var moduleName = "app.docTree";

var app = angular.module(moduleName, [
  require("@ali/aliyun-naza-tree"),
  require("@ali/aliyun-naza-options"),
  require("@ali/aliyun-naza-multicollection"),
  require("../../services/modal/createCanvasModal/modal"),
  require("../../services/modal/createFolderModal/modal"),
  require("../../services/modal/editFolderModal/modal"),
  require("../../services/modal/deleteFolderModal/modal")

]);

app.directive("docTree", [
  "$rootScope",
  "$state",
  "nzTreeModel",
  "createCanvasModal",
  "createFolderModal",
  "editFolderModal",
  "deleteFolderModal",
  function($rootScope, $state, nzTreeModel, createCanvasModal, createFolderModal, editFolderModal, deleteFolderModal) {
    return {
      restrict: "AE",
      replace: true,
      controller: [
        "$scope",
        function($scope) {
          let self = this;
          let treeModel = new nzTreeModel([]);
          this.treeModel = treeModel;
          this.docTreeCtrl = docTreeCtrl;
          this.treeOption = {
            nzContents: treeModel.data(),
            nzIcon: function(d) {
              if (d.branch.objectType === 5) {
                if (d.branch.expanded) {
                  return 'naza-tree-icon-folder-expanded';
                } else {
                  return 'naza-tree-icon-folder-closed';
                }
              } else if (d.branch.objectType === 10) {
                return 'naza-tree-icon-canvas';
              }
            },
            nzFolder: function(d) {
              d.branch.id = d.branch.fieldId;
              return d.branch.objectType === 5;
            },
            nzFileId: function(d) {
              return d.branch.fieldId;
            },
            nzClick: function(d) {
              d.branch.status = 0;
              $rootScope.$broadcast(EVENTS.TAGSBAR_ADD_NODE, {
                item:d.branch
              });
            },
            nzDblclick: function(d) {
              if (d.branch.folder) {
                if (d.branch.expanded) {
                  treeModel.collapse(d.branch);
                  treeModel.update();
                } else {
                  if (d.branch.isPullData) {
                    treeModel.expand(d.branch, d.branch.level + 1);
                    treeModel.update();
                  } else {
                    self.docTreeCtrl.getData({
                      parentId: d.branch.fieldId
                    }).then(function(data) {
                      d.branch.isPullData = true;
                      if (!d.branch.hasAppendToTree) {
                        treeModel.append(d.branch, data);
                        d.branch.hasAppendToTree = true;
                      }
                      treeModel.update();
                    });
                  }
                }
              }
            }
          }

          //初始化展开某个 @雨异
          this.docTreeCtrl.getData({
            parentId: -1
          }).then(function(data) {
            treeModel.data(data);
            treeModel.update();
          }.bind(this));

          this.docTreeCtrl.eventProxy.on(EVENTS.TREE_ADD_NODE, function(parent, data) {
            if (parent) {
              if (parent.isPullData) {
                var _parent = treeModel.branch({
                  id: parent.fieldId,
                  folder: true
                });
                if (data.objectType === 10) {
                  _parent.children.push(data);
                } else if (data.objectType === 5) {
                  _parent.children.unshift(data);
                }
                treeModel.append(_parent, _parent.children);
                treeModel.update();
              }
            } else {
              let _data = treeModel.data();
              data.level = 0;
              _data.push(data);
              treeModel.update();
            }
          });

          this.docTreeCtrl.eventProxy.on(EVENTS.TREE_EDIT_NODE, function(item) {
            createCanvasModal({
              isEditMode: true,
              name: item.name,
              description: item.description,
              modifiedVersion: item.modifiedVersion,
              folderId: item.parentId,
              canvasId: item.id,
            });
          });

          this.docTreeCtrl.eventProxy.on(EVENTS.TREE_DELETE_NODE, function(item) {
            HttpRequest.DeleteCanvas({
              canvasId: item.branch.id,
            }).then(function(data) {
              $rootScope.$broadcast(EVENTS.TAGSBAR_DELETE_NODE, {
                key:item.branch.objectType + ":" + item.branch.id
              });
              toast('success', '删除视图成功');
              if (item.branch.parent) {
                let _parent = treeModel.branch({
                  id: item.branch.parent.fieldId,
                  folder: true
                });
                let _index = _.findIndex(_parent.children, function(child) {
                  return child.fieldId == item.branch.id;
                });
                _parent.children.splice(_index, 1)
                treeModel.append(_parent, _parent.children);
                treeModel.update();
              } else {
                let _data = treeModel.data();
                let _index = _.findIndex(_data, function(child) {
                  return child.fieldId == item.branch.id;
                });
                _data.splice(_index, 1);
                treeModel.data(_data);
                treeModel.update();
              }
            });
          });

          this.docTreeCtrl.eventProxy.on(EVENTS.TREE_UPDATE_NODE, function(data) {
            let _data = treeModel.data();
            let _index = _.findIndex(_data, function(child) {
              return child.fieldId == data.id;
            });
            if (_index >= 0) {
              _data[_index].name = data.name;
              treeModel.data(_data);
              treeModel.update();
              $rootScope.$broadcast(EVENTS.TAGSBAR_UPDATE_NODE, {
                key: data.objectType+":"+data.id,
                name: data.name,
                modifiedVersion: data.modifiedVersion
              });
            }
          });

          this.docTreeCtrl.eventProxy.on(EVENTS.SHOW_CREATE_CANVAS_MODAL, function(item) {
            createCanvasModal(item);
          });
          this.docTreeCtrl.eventProxy.on(EVENTS.SHOW_CREATE_FOLDER_MODAL, function(item) {
            createFolderModal(item);
          });
          this.docTreeCtrl.eventProxy.on(EVENTS.SHOW_DELETE_FOLDER_MODAL, function(item) {
            deleteFolderModal({
              item: item
            }).result.then(() => {
              if (item.branch.parent) {
                let _parent = treeModel.branch({
                  id: item.branch.parent.fieldId,
                  folder: true
                });
                let _index = _.findIndex(_parent.children, function(child) {
                  return child.fieldId == item.branch.id;
                });
                _parent.children.splice(_index, 1)
                treeModel.append(_parent, _parent.children);
                treeModel.update();
              } else {
                let _data = treeModel.data();
                let _index = _.findIndex(_data, function(child) {
                  return child.fieldId == item.branch.id;
                });
                _data.splice(_index, 1);
                treeModel.data(_data);
                treeModel.update();
              }
            })
          });

          this.docTreeCtrl.eventProxy.on(EVENTS.SHOW_EDIT_FOLDER_MODAL, function(item) {
            item.branch.status = 1;
            $rootScope.$broadcast(EVENTS.TAGSBAR_ADD_NODE, {
              item:item.branch
            });
          });

          $scope.$on("$destroy", function() {
            docTreeCtrl.clearCache();
          });
        }
      ],
      controllerAs: "tree",
      link: function(scope, element, attrs) {
        //初始化高度,定高
        let height = $(element).height();
        $(element).height(height);
      },
      template: require('./docTree.html')
    }
  }
]);

module.exports = moduleName;
