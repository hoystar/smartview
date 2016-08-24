"use strict";

require('./canvasTree.less');

import EVENTS from "../../services/events";

import TYPE from "../../services/objectType";

import HttpRequest from "../../services/httpCenter/request";

import _ from "lodash";

var moduleName = "app.canvasTree";

var app = angular.module(moduleName, [
  require("@ali/aliyun-naza-tree"),
  require("@ali/aliyun-naza-options"),
  require("@ali/aliyun-naza-multicollection")
]);

app.directive("canvasTree", [
  "$state",
  "nzTreeModel",
  function($state, nzTreeModel) {
    return {
      restrict: "AE",
      replace: true,
      controller: [
        "$scope",
        "$rootScope",
        function($scope, $rootScope) {

          let self = this;

          let treeModel = new nzTreeModel([]);
          this.treeModel = treeModel;
          this.treeOption = {
            nzContents: treeModel.data(),
            nzIcon: function(d) {
              if (d.branch.objectType === TYPE.FOLDER) {
                if (d.branch.expanded) {
                  return 'naza-tree-icon-folder-expanded';
                } else {
                  return 'naza-tree-icon-folder-closed';
                }
              } else if (d.branch.objectType === TYPE.EXPLORE_HISTORY_INSTANCE) {
                return 'naza-tree-icon-canvas';
              }
            },
            nzFolder: function(d) {
              return d.branch.objectType === TYPE.FOLDER;
            },
            nzFileId: function(d) {
              return d.branch.id;
            },
            nzClick: function(d) {
              if (d.branch.objectType === TYPE.FOLDER) {
                return;
              }
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
                  if (d.branch.groups) {
                    let children = d.branch.groups.map((item) => ({
                      id: item.id,
                      name: item.name,
                      objectType: TYPE.EXPLORE_HISTORY_INSTANCE,
                      menu: {
                        file: []
                      }
                    }));
                    treeModel.append(d.branch, children);
                  }
                }
              }
            }
          }

          let tree = {};
          HttpRequest.GetRecommendCanvas({
            workspaceId: 1,
          }).then((data) => {
            tree = data.map((item) => ({
              id: item.dsId,
              name: item.dsName,
              objectType: TYPE.FOLDER,
              groups: item.groups,
              menu: {
                folder: []
              }
            }));
            treeModel.data(tree);
            treeModel.update();
          });

        }
      ],
      controllerAs: "tree",
      link: function(scope, element, attrs) {

      },
      template: require('./canvasTree.html')
    }
  }
])


module.exports = moduleName;
