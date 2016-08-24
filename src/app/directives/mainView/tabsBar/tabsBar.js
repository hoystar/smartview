"use strict";

require('./tabsBar.less');

var Cache = require("../../../services/mainView/mainViewCache");
let TYPE = require("../../../services/objectType");
let EVENTS = require("../../../services/events");
let toast = require("../../../services/toast/toast");
let HttpRequest = require("../../../services/httpCenter/request");
var moduleName = "app.tabsBar";
var _ = require("lodash");
var app = angular.module(moduleName, []);

app.directive("tabsBar", [
  "$rootScope", "$state","$timeout","$window",
  function($rootScope, $state,$timeout,$window) {
    return {
      restrict: "AE",
      replace: true,
      controller: [
        "$scope",
        function($scope) {
          
        }
      ],
      controllerAs: "tabsBar",
      link: function(scope, element, attrs) {

        let self = scope.tabsBar;
        self.Cache = Cache;

        scope.$on(EVENTS.TAGSBAR_ADD_NODE, function(event, data) {
          if(!data.item.status){
            data.item.status = 0;
          }
          var item = {
              id:data.item.id,
              type:data.item.objectType,
              name:data.item.name,
              defineId:data.item.defineId,
              instanceId:data.item.instanceId,
              status:data.item.status
          }
          if(self.Cache.ArrayLength==15){
            toast("warning","打开文件不能超过15个！");
            return;
          }
          self.active(item);
        });

        self.active = function(item) {
          $rootScope.$broadcast(EVENTS.CHANGE_MAIN_VIEW, {
            onlyKey:item.type + ":" + item.id
          });
          $state.go("treePage.smartview", {
            id: item.id,
            type: item.type,
            name: item.name,
            status: item.status,
            defineId: item.defineId,
            instanceId: item.instanceId
          });
        };
        self.dropDownShow = false;
        scope.$watch("tabsBar.Cache.activeTab", function(newValue, oldValue) {
          if (newValue === null || newValue === undefined) return;
              let ArrayLength = self.Cache.tabsArray.length;
              var box=$(element)[0];
              var oUl=$(element).find('ul')[0];
              var aLi=$('div.menu').find('li');
              var iW = 0;
              let _index = _.findIndex(self.Cache.tabsArray, function(sct) {
                  return sct.id == newValue.id;
              });
              for(var i=0;i<aLi.length;i++){
                  iW+=aLi[i].offsetWidth;//总长度
              }
              var overFlowLength=box.offsetWidth*0.97 - iW;//滚动长度
              if(overFlowLength<47){
                oUl.style.width=iW+'px';
                if(self.Cache.ArrayLength===ArrayLength){
                    var currentTabLength = (_index+1)*200;//当前元素所在长度
                    if(currentTabLength + self.Cache.left<=0){
                      if(currentTabLength<=box.offsetWidth*0.97){
                        oUl.style.left = 0+'px';
                        self.Cache.left = 0;
                      }else{
                        oUl.style.left = 200-currentTabLength+'px';
                        self.Cache.left = 200-currentTabLength;
                      }
                    }
                    if(currentTabLength + self.Cache.left>=box.offsetWidth*0.97){
                       oUl.style.left = box.offsetWidth*0.97 - currentTabLength +'px';
                       self.Cache.left = box.offsetWidth*0.97 - currentTabLength ;
                    }
                    if(currentTabLength + self.Cache.left <= box.offsetWidth*0.97){
                      oUl.style.left = self.Cache.left + "px";
                    }
                }else{
                  oUl.style.left = overFlowLength + 'px'; 
                  self.Cache.left = overFlowLength;
                }
                self.dropDownShow = true;
              }
              self.Cache.ArrayLength  = ArrayLength;
              self.Cache.oldValueID = newValue.id;
        });
        scope.$on(EVENTS.TAGSBAR_DELETE_NODE, function(event, data) {
          self.removeTab(data.key);
          scope.$applyAsync()
        });
        scope.$on(EVENTS.TAGSBAR_UPDATE_NODE, function(event, data) {
          let index = _.findIndex(self.Cache.tabsArray, function(o) {
              return o.onlyKey == data.key;
          });
          if(index >= 0){
            self.Cache.tabsArray[index].name = data.name;
            self.active(self.Cache.tabsArray[index]);
            if (self.Cache.getCache(data.key)){
              self.Cache.cache[data.key].data.name = data.name;
              self.Cache.cache[data.key].data.modifiedVersion = data.modifiedVersion;     
            }                  
          }
          scope.$applyAsync()
        });        
        self.removeTab = function(key) {
          let index = _.findIndex(self.Cache.tabsArray, function(o) {
            return o.onlyKey == key;
          });
          self.Cache.removeTabItem(key);
          if (self.Cache.tabsArray.length === 0) {
            scope.page.mainViewType = TYPE.DEFAULT;
          } else {
            if (index === 0) {
              self.active(self.Cache.tabsArray[1]);
            } else {
              self.active(self.Cache.tabsArray[index - 1]);
            }
          }
        };
        scope.$on("$destroy", function() {
            $window.onbeforeunload = function(){
              var ids = [];
              if(self.Cache.tabsArray){
                self.Cache.tabsArray.forEach((item) => {
                  ids.push(item.type+":"+item.id);
                })
                HttpRequest.SetPersonalization({
                  workspaceId:1,
                  key:"IDE_OPEN_TAGS",
                  value:ids
                })
              }
            };
        })   
      },
      template: require('./tabsBar.html')
    }
  }
])

module.exports = moduleName;