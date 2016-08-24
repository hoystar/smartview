"use strict";

require('./folderDag.less');

var data = require("../../../services/dag/data");
var Layout = require("../../../services/dag/folderLayout");
var HttpRequest = require("../../../services/httpCenter/request");
import EVENTS from "../../../services/events";
let toast = require('../../../services/toast/toast');

var moduleName = "app.folderDag";

var app = angular.module(moduleName,[
  require("../../widget/contentMenu/contentMenu"),  
  require("../folderListBar/folderListBar"),
  require("../../dragLayout/dragLayout"),
  require("../../../services/modal/createCanvasModal/modal")
]);

app.directive("folderDag",[
  "$rootScope",
  "$http",
  "$timeout",
  "$compile",
  "createCanvasModal",
  "$state",
  "$stateParams",
  function($rootScope,$http,cxtMenuService, $timeout, $compile,createCanvasModal,$state, $stateParams){
    return {
      restrict: "AE",
      replace: true,
      scope: {
        data: "="
      },      
      controller: [
      "$scope",
      function($scope){

      }],
      controllerAs: "folderDag",
      link: function(scope,element,attrs){
        var self = scope.folderDag;
        var width = $(element).width();
        var height = $(element).height();
        var offset = $(element).offset();
        //this.img = null;

        //菜单的初始化数据
        self._cxtMenuData = {};
        $(element).find("#svg-canvas")
          .attr("width", width)
          .attr("height", height);  
          
        var layout = new Layout({
          width: width,
          height: height,
          svg: d3.select("#svg-canvas")
        });   

        scope.$on("addItemsToLayout", function(events, data) {
          var x = data.x;
          var y = data.y;

          var svg_x_left = offset.left;
          var svg_x_right = offset.left + width;
          var svg_y_top = offset.top;
          var svg_y_bottom = offset.top + height;

          if (x > svg_x_left && x < svg_x_right && y > svg_y_top && y < svg_y_bottom) {
            data.data.nodes = data.data.nodes.map(function(item) {
              item.x = item.x - svg_x_left + item.width / 2;
              item.y = item.y - svg_y_top - item.height / 2;
              return item;
            });
            let selectEle = data.data.nodes.length !== 0 ? data.data.nodes[0] : data.data.links[0];
            layout.dragFolder2Layout(data.data);
            $rootScope.$broadcast("addItemsToLayoutSuccess");
          }
        });        

        scope.$on("selectedItem", function(events, data) {
          data.forEach(function(item) {
            if (item.isSelected) {
              layout.focus(item.id);
            } else {
              layout.unFocus(item.id);
            }
          });
        });

        $(element).bind("contextmenu.svg", function(event) {
          return false;
        });

        layout.eventProxy.on("showCtxMenu", function(data) {
          $.extend(self._cxtMenuData,{
            x: (data.x - offset.left) + "px",
            y: (data.y - offset.top + 5) + "px",
            isShow:true,
            data:data.data
          });
          scope.$digest();
        });
        self.clickCxtMenuItem = function(item) {
          switch (item.type) {
            case "DEL":
              layout.removeNode(item.nodeId);
              break;
          }
        }

        //保存当前编辑文件
        self.saveFolder = function(){
          let parentId = scope.data.folderId;
          let nodes = layout.nodes.map((item) => {
              let node = {
                folderId: parentId,
                objectId: item.config.id,
                position: [item.config.x,item.config.y],
                workspaceId: 1
              }
              return node;
            });    
          let lines = layout.links.map((item) => {
              let line = {
                folderId: parentId,
                name:'',
                inputObjectId: item.config.source.id,
                outputObjectId: item.config.target.id,
                lineCoords:[],
                workspaceId: 1
              }
              return line;
            });             
          if(parentId == -1){  //顶级目录
            let postData = {
              "workspaceId":1,
              "nodes":nodes,
              "lines":lines
            };

            HttpRequest.UpdateTopSubjectContent(postData).then(function(data) {
              toast('success', '目录编辑成功');
            });  
          }else{     //非顶级目录    
            var formData = new FormData($( "#uploadForm" )[0]);
            formData.append("folderId", scope.data.folderInfo.folderId);
            formData.append("modifiedVersion", scope.data.folderInfo.modifiedVersion);
            formData.append("name", scope.data.folderInfo.name);
            formData.append("pageDescription", scope.data.folderInfo.pageDescription);
            formData.append("nodes", JSON.stringify(nodes));
            formData.append("lines", JSON.stringify(lines));
            formData.append("color", scope.data.folderInfo.color);
            if(nodes.length > 0 || lines.length > 0){
              formData.append("hasContent", 1);
            }else{
              formData.append("hasContent", 0);
            }
            var params = {
              folderId : scope.data.folderInfo.folderId,
              data : formData
            };

            HttpRequest.UpdateFolderForm(params);          
          }                  
        }

        layout.eventProxy.on("folder_node_click", function(node) {
          if(node.shiftKey){
            if(layout.selectElements.length == 1 && layout.selectElements[0].config.id !== node.nodeId){
              var result = {
                nodes: [],
                links: []
              }  
              
              result.links.push({
                id: layout.selectElements[0].config.id+"-"+node.nodeId,
                type: 1,
                source: layout.selectElements[0].config.id,
                target: node.nodeId
              });      

              layout.addItems2Layout(result);                           
            }             
          }else{
            layout.selectNode(node.nodeId,1);
          }          
        });

        scope.$on("set_node_fillcolor", function(event, data) {
          scope.data.folderInfo.color = data.fillcolor;
        });

        
        //let isRecommend = ($stateParams.isRecommend === "true");
        let unWatcher = scope.$watch("data", function(newValue, oldValue) {
          if (newValue) {
            if(scope.data.folderCanvas && scope.data.folderCanvas.data){
              layout.draw(scope.data.folderCanvas.data, false);   
              unWatcher();    
            }     
          }
        }, true);                                                          
      },
      template: require('./folderDag.html')
    }
  }
])


module.exports = moduleName;