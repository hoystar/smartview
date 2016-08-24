"use strict";

require('./dtInstance.less');
var moduleName = "app.dtInstance";
var exploreService = require("../../../services/exploreRange/exploreRange.js");
var HttpRequest = require("../../../services/httpCenter/request");
var color = require("../../../services/process/color");
var type = require("../../../services/process/type");
let moment = require("moment");
var app = angular.module(moduleName, [
  require("./instanceInfo/instanceInfo"),
  require("./instanceShow/instanceShow"),
  require("./instanceProcess/instanceProcess"),
]);

app.directive("dtInstance", [
  "$state",
  function($state) {
    return {
      restrict: "AE",
      replace: true,
      scope: {
        instanceData: "="
      },
      controller: [
        "$scope",
        function($scope) {

        }
      ],
      controllerAs: "inist",
      link: function(scope, element, attrs) {
        var self = scope.inist;
        self.defineInfo = {};
        self.canvasId =  "instance-canvas";
        var typeStatus = {};
        for (var status in type) {
          typeStatus[type[status]] = status;
        }
        self.navs = [{
          key: "info",
          value: "基本信息",
          clickable: true
        }];
        self.currentTag = self.navs[0];
        self.instanceInfo = {};
        self.instanceProcess = {};
        self.instanceShow = {};
        var unwatcher = scope.$watch(function() {
          return scope.instanceData;
        }, function(newValue, oldValue) {
          if (newValue) {
            getInstanceInfo(newValue);
            self.changeTag(self.navs[0]);
            $.extend(true, self.instanceShow, scope.instanceData);
            unwatcher();
          }
        });
        self.changeTag = function(tag) {
          if (tag.clickable) {
            self.currentTag = tag;
          }
        };

        var getInstanceInfo = function(params) {
          self.instanceInfo.instanceId = params.instanceId;
          HttpRequest.GetDtInstance({
            instanceId: self.instanceInfo.instanceId
          }).then(function(data) {
              HttpRequest.LoadGraphByInstanceId({
                instanceId: self.instanceInfo.instanceId
              }).then(function(dataGraph) {
                var tmp = dataGraph.vertexs;
                for (var i = 0; i < tmp.length; i++) {
                  var content = tmp[i].content;
                  var ary = new Array();
                  ary[0] = content;
                  tmp[i].content = ary;
                  tmp[i].type = content.type;
                }
                self.instanceInfo.graph = dataGraph;
                self.instanceInfo.graph.uuId = data.instanceId;

                self.instanceInfo.instanceInfo = data;
                self.instanceInfo.instanceInfo.lastModifiedOn = moment(self.instanceInfo.instanceInfo.lastModifiedOn).format("YYYY MM DD hh:mm");
                self.instanceInfo.instanceInfo.createdOn = moment(self.instanceInfo.instanceInfo.createdOn).format("YYYY MM DD hh:mm");
                if (self.instanceInfo.instanceInfo.partitions) {
                  self.instanceInfo.instanceInfo.partitions.map((item) => {
                    item.contrast = exploreService.getSymbol(item.contrast);
                    return item;
                  });
                }

                self.instanceInfo.outputItems = [];
                var outputTags = data.outputTags;
                for (var i = 0; i < outputTags.length; i++) {
                  let domainTags = outputTags[i];
                  let domainCode = domainTags.code;
                  let domainType = domainTags.type;
                  let tags = domainTags.tags;
                  for (let j = 0; j < tags.length; j++) {
                    let tag = tags[j];
                    self.instanceInfo.outputItems.push({
                      domainCode: domainCode,
                      domainType: domainType,
                      tagCode: tag
                    });
                  }
                }
                self.instanceInfo.isRequest = true;
                scope.$digest();
            });
            
          });
        };
        scope.$on("$destroy", function() {
        });
      },
      template: require('./dtInstance.html')
    }
  }
])


module.exports = moduleName;
