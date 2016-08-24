"use strict";

require('./smartview.less');

let EVENTS = require("../../services/events");
let TYPE = require("../../services/objectType");
let Cache = require("../../services/mainView/mainViewCache");
let HttpRequest = require("../../services/httpCenter/request");

import folderEditCtrl from "../../services/folderEdit/folderEditCtrl";

let moduleName = "app.smartview";

var app = angular.module(moduleName, [
  require("../../directives/mainView/default/default"),
  require("../../directives/mainView/canvas/canvas"),
  require("../../directives/mainView/folder/folder"),
  require("../../directives/mainView/tabsBar/tabsBar"),
  require("../../directives/mainView/dtDefine/dtDefine"),
  require("../../directives/mainView/dtInstance/dtInstance"),
  require("../../directives/mainView/dtInstanceResult/dtInstanceResult")
]);

app.controller("smartviewCtrl", [
    '$rootScope','$scope', "$stateParams",
    function($rootScope,$scope, $stateParams) {

      let self = this;
      this.Cache = Cache;
      self.folderEditCtrl = folderEditCtrl;
      let params = transform($stateParams);

      if(params.id){
        if(Cache.tabsArray.length>0){
          renderResult(transform(params));
        }else{
          requestResult();
        } 
      }else{
        requestResult(); 
      }

      function transform(param) {
        if (param.id) {
          param.id = Number(param.id);
        }
        if (param.type) {
          param.type = Number(param.type);
        }
        if (param.status) {
          param.status = Number(param.status);
        }
        if (param.defined) {
          param.defined = Number(param.defined);
        }
        if (param.instanceId) {
          param.instanceId = Number(param.instanceId);
        }
        if (param.instanceResultId) {
          param.instanceResultId = Number(param.instanceResultId);
        }
        if(param.id && param.type){
          param.onlyKey = param.type+":"+param.id;
        }
        return param;
      }
      function requestResult() {
          self.loading = true;
          HttpRequest.GetHistoryTabsBar({
            workspaceId : 1
          }).then(function(ObjectList) {
            self.loading = false;
            if(ObjectList.length>0){
              Cache.tabsArray = [];
              ObjectList.forEach((item)=>{
                item.type = item.objectType;
                item.status = 0;
                item.onlyKey = item.type+":"+item.id;
                Cache.tabsArray.push(item);
              }.bind(this))
              let _index = _.findIndex(Cache.tabsArray, function(items) {
                return items.id == params.id;
              });
              if(_index<0){
                _index = Cache.tabsArray.length-1; 
              }
              params = transform(Cache.tabsArray[_index]);
              renderResult(transform(params));
            }
            renderResult(transform(params));
          }.bind(this));
      }
      
      function renderResult(params) {
        self.canavsData = {
          id: null,
          data: {},
          layout: {},
          isCacheCanvas: false,
        };

        self.folderData = {
          id: null,
          status: null,
          bosList: [],
          topSubject: {},
          folderData: {},
          folderCanvas: {}
        };
        if (!!!params.type) {
          self.mainViewType = TYPE.DEFAULT;
        } else if (Number(params.type) === TYPE.FOLDER) {
          _activeFolder(params);
        } else if (Number(params.type) === TYPE.CANVAS) {
          _activeCanvas(params);
        } else if (Number(params.type) === TYPE.EXPLORE_FOLDER) {
          _activeExploreFolder(params);
        } else if (Number(params.type) === TYPE.EXPLORE_INSTANCE) {
          if (!params.instanceId) {
            params.instanceId = Number(params.id);
          }
          _activeExploreInstance(params);
        }else if (Number(params.type) === TYPE.EXPLORE_HISTORY_INSTANCE) {
          _activeCanvas(params);
        }else if (Number(params.type) === TYPE.EXPLORE_INSTANCE_RESULT) {
          if (!params.instanceResultId) {
            params.instanceResultId = Number(params.id);
          }
          _activeExploreInstanceResult(params);
        }
      }
    
      function _activeCanvas(data) {
        let id = data.id;
        let _key = data.onlyKey;
        if (Cache.getCache(_key)) {
          _active(_key,Cache.getCache(_key),data,false);
          $.extend(self.canavsData, Cache.getCache(_key));
          $scope.$applyAsync();
        } else {
          if (data.type!==TYPE.EXPLORE_HISTORY_INSTANCE) {
            HttpRequest.getCanvas({
              id: id
            }).then((backData) => {
              self.canavsData.id = id;
              self.canavsData.onlyKey = _key;
              self.canavsData.isCacheCanvas = false;
              self.canavsData.data = backData;
              self.canavsData.isRecommend = false;
              _active(_key,self.canavsData,data,true);
              self.canavsData.mainViewType = self.mainViewType;
              $scope.$digest();
            });
          } else {
            HttpRequest.GetRecommendCanvasInfo({
              cavansId: id
            }).then((backData) => {
              self.canavsData.id = id;
              self.canavsData.onlyKey = _key;
              self.canavsData.isCacheCanvas = false;
              self.canavsData.data = backData;
              self.canavsData.isRecommend = true;
              _active(_key,self.canavsData,data,true);
              self.canavsData.mainViewType = self.mainViewType;
              $scope.$digest();
            });
          }
        }
      }

      function _activeFolder(data) {

        let id = data.id;
        let _key = data.onlyKey;
        if (Cache.getCache(_key)) {
          _active(_key,Cache.getCache(_key),$.extend(true, {}, data),false);
          $scope.$applyAsync();
        } else {
          self.folderData.id = id;
          self.folderData.onlyKey = _key;
          self.folderData.status = data.status || 0;
          self.folderEditCtrl.clearCache();
          var bosList = self.folderEditCtrl.getFolderBosList({
            folderId: id,
            objTypes: "5,10"
          });
          if (id == -1) {
            var topSubject = self.folderEditCtrl.getTopSubject({
              workspaceId: 1
            });
            Promise.all([bosList, topSubject]).then(function(values) {
              self.folderData.bosList = values[0];
              self.folderData.topSubject = values[1];
              _active(_key,$.extend(true, {}, self.folderData),data,true);
              $scope.$digest();
            });
          } else {
            var folderData = self.folderEditCtrl.getFolderData({
              folderId: id
            });
            var folderCanvas = self.folderEditCtrl.getFolderCanvas({
              folderId: id
            });
            Promise.all([bosList, folderData, folderCanvas]).then(function(values) {
              self.folderData.bosList = values[0];
              self.folderData.folderData = values[1];
              self.folderData.folderCanvas = values[2];
              _active(_key,$.extend(true, {}, self.folderData),data,true);
              $scope.$digest();
            });
          }

        }
      }

      function _activeExploreFolder(data) {
        let id = data.id;
        let _key = data.onlyKey;
        if (Cache.getCache(_key)) {
          _active(_key,Cache.getCache(_key),$.extend(true, {}, data),false);
          $scope.$applyAsync();
        } else {
          HttpRequest.GetDtDefine({
            defineId: id
          }).then(function(backData) {
            let defineInfo = {};
            $.extend(true, defineInfo, backData);
            defineInfo.onlyKey = _key;
            _active(_key,defineInfo,data,true);
            $scope.$digest();
          });
        }
      }

      function _activeExploreInstance(data) {
        let _key = data.onlyKey;
        _active(_key,data,data,true);
        $scope.$applyAsync();
      }
      function _activeExploreInstanceResult(data) {
        let _key = data.onlyKey;
        _active(_key,data,data,true);
        $scope.$applyAsync();
      }

      function _active(_key,data,tipData,isSetCache){
        self.mainViewType = params.type;
        if(params.type==TYPE.FOLDER){
          isSetCache = true;
          if(params.status==1){
            data.status = 1;
          }else{
            data.status = 0;
          }
        }
        isSetCache && (Cache.setCache(_key, data));
        Cache.active(_key);
        Cache.addTabItem(tipData);
      }
    }
  ])
  .config([
    "$stateProvider",
    "$urlRouterProvider",
    function($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('treePage.smartview', {
          url: '/page/smartview?id&type&name',
          template: require('./smartview.html'),
          params:{'status': null,'defineId':null,'instanceId':null},
          controller: 'smartviewCtrl',
          controllerAs: 'page'
        });
    }
  ]);


module.exports = moduleName;
