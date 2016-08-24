"use strict";

require('./dtInstanceResult.less');

var moduleName = "app.dtInstanceResult";
var exploreService = require("../../../services/exploreRange/exploreRange.js");
var HttpRequest = require("../../../services/httpCenter/request");
var color = require("../../../services/process/color");
var type = require("../../../services/process/type");
let moment = require("moment");

var app = angular.module(moduleName,[
  require("../dtInstance/schedulerInfo/schedulerInfo"),
  require("../dtInstance/instanceShow/instanceShow"),
  require("../dtInstance/instanceProcess/instanceProcess"),
]);

app.directive("dtInstanceResult",[
  function(){
    return {
      restrict: "AE",
      replace: true,
      scope: {
        instanceData: "="
      },
      controller: [
      "$scope",
      function($scope){

      }],
      controllerAs: "inistResult",
      link: function(scope,element,attrs){

        var self = scope.inistResult;
        self.defineInfo = {};
        var timer = null;
        var typeStatus = {};
        self.navs = [{
          key: "info",
          value: "基本信息",
          clickable: true
        }, {
          key: "process",
          value: "执行过程",
          clickable: true
        }, {
          key: "show",
          value: "执行结果",
          clickable: false
        }];
        self.currentTag = self.navs[0];
        self.schedulerInfo = {};
        self.schedulerProcess = {};
        self.schedulerShow = {};

        self.canvasId = "result-canvas";

        var unwatcher = scope.$watch(function() {
          return scope.instanceData;
        }, function(newValue, oldValue) {
          if (newValue) {
            getSchedulerInfo(newValue);
            self.changeTag(self.currentTag);
            _getStatus();
            $.extend(true, self.schedulerShow, scope.instanceData);
            unwatcher();
          }
        });

        self.changeTag = function(tag) {
          if (tag.clickable) {
            self.currentTag = tag;
          }
        };

        var getSchedulerInfo = function(params) {
          self.schedulerInfo.schedulerId = params.id;
          HttpRequest.GetDtScheduler({
            schedulerId: self.schedulerInfo.schedulerId
          }).then(function(data) {
            if (data.executedGraph) {
              return data;
            }else{
              return HttpRequest.LoadGraphBySchedulerId({
                 schedulerId: self.schedulerInfo.schedulerId
              }).then(function(graph){
                data.executedGraph = graph;
                return data;
              })
            }           
          }).then(function(data){ 
              data.executedGraph.vertexs.map((item) => {
                item.content = [item.content];
                item.type = item.content[0].type;
              });
              self.schedulerInfo.schedulerInfo = data;
              self.schedulerInfo.graph = data.executedGraph;
              self.schedulerInfo.graph.uuId = data.instanceId;
              self.schedulerInfo.schedulerInfo.completedOn = moment(self.schedulerInfo.schedulerInfo.completedOn).format("YYYY MM DD hh:mm");
              self.schedulerInfo.schedulerInfo.createdOn = moment(self.schedulerInfo.schedulerInfo.createdOn).format("YYYY MM DD hh:mm");
              if (self.schedulerInfo.schedulerInfo.parameter.partitions) {
                self.schedulerInfo.schedulerInfo.parameter.partitions.map((item) => {
                  item.contrast = exploreService.getSymbol(item.contrast);
                  return item;
                });
              }

              self.schedulerInfo.outputItems = [];
              var outputTags = data.parameter.projection;
              for (var i = 0; i < outputTags.length; i++) {
                let domainTags = outputTags[i];
                let domainCode = domainTags.code;
                let domainType = domainTags.type;
                let tags = domainTags.tags;
                for (let j = 0; j < tags.length; j++) {
                  let tag = tags[j];
                  self.schedulerInfo.outputItems.push({
                    domainCode: domainCode,
                    domainType: domainType,
                    tagCode: tag
                  });
                }
              }
              self.schedulerInfo.isRequest = true;
              setClickable(self.schedulerInfo.schedulerInfo.status);
              scope.$digest();
          });

        };
        var setClickable = function(value) {
          if (value != undefined) {
            self.navs[2].clickable = value === type.SUCCESS;
          }
        };

        let isStop = false;
        function _getStatus(){
            HttpRequest.GetDtSchedulerStatus({
                schedulerId: scope.instanceData.id
            }).then((data) => {
                setClickable(data.status);
                self.schedulerProcess.instMap = data.result;
                if (!_.isEmpty(data.result)) {
                    self.schedulerProcess.highlightNodes = [];
                    for (var jobCode in data.result) {
                        var highInfo = {
                            jobCode: null,
                            color: null
                        };
                        highInfo.jobCode = jobCode;
                        highInfo.color = color[[data.result[jobCode].executedStatus]];
                        self.schedulerProcess.highlightNodes.push(highInfo);
                    }
                }
                if(data.graph){
                    data.graph.vertexs.map((item) => {
                        item.content = [item.content];
                        item.type = item.content[0].type;
                    });
                    self.schedulerProcess.graph = data.graph;
                    self.schedulerProcess.loading = false;
                    if(data.status >= type.SUCCESS){
                        isStop = true;
                    }
                } else {
                    if(data.status > type.SUCCESS){
                        self.schedulerProcess.errorStatus = true;
                        self.schedulerProcess.loading = false;
                        isStop = true;
                    } else {
                        self.schedulerProcess.loading = true;
                    }
                }
                scope.$digest();
                if(!isStop){
                    setTimeout(function(){
                        _getStatus();
                    },5000);
                }
            });
        }

        scope.$on("$destroy", function() {
          clearInterval(timer);
        });

      },
      template: require('./dtInstanceResult.html')
    }
  }
])


module.exports = moduleName;