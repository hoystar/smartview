"use strict";

require('./dtDefine.less');

var HttpRequest = require("../../../services/httpCenter/request");

var moduleName = "app.dtDefine";
let toast = require('../../../services/toast/toast');

let moment = require("moment");

let exploreTreeCtrl = require("../../../services/exploreTree/exploreTree");
var exploreService = require("../../../services/exploreRange/exploreRange.js");
let EVENTS = require("../../../services/events");
var app = angular.module(moduleName, [
  require("../../../directives/breadCrumbs/breadCrumbs"),
  require("../../../directives/clusterDag/clusterDag"),
  require("../../../services/modal/execExploreModal/modal"),
  require("../../../services/modal/deleteDtDefineModal/modal")
]);

app.directive("dtDefine", ["$state","execExploreModal","deleteDtDefineModal",
  function($state, execExploreModal,deleteDtDefineModal) {
    return {
      restrict: "AE",
      replace: true,
      scope: {
        defineInfo: "="
      },
      controller: [
        "$scope",
        function($scope) {

        }
      ],
      controllerAs: "dtDefine",
      link: function(scope, element, attrs) {
        var self = scope.dtDefine;
        self.svgCanvasId = "define-svg";
        self.dagId = "define-dag";

        self.defineInfo = {};
        scope.$watch(function() {
          return scope.defineInfo.id
        }, function(newValue, oldValue) {
          if (newValue) {
            var timeWrapper = moment(new Date(scope.defineInfo.createdOn));
            scope.defineInfo.createdOn = timeWrapper.format("YYYY/MM/DD HH:mm:ss");
            timeWrapper = moment(new Date(scope.defineInfo.lastModifiedOn));
            scope.defineInfo.lastModifiedOn = timeWrapper.format("YYYY/MM/DD HH:mm:ss");
            scope.defineInfo.outputItems = [];
            var outputTags = scope.defineInfo.outputTags;
            if (scope.defineInfo.partitions) {
              scope.defineInfo.partitions.map((item) => {
                item.contrast = exploreService.getSymbol(item.contrast);
                return item;
              });
            }

            for (var i = 0; i < outputTags.length; i++) {
              let domainTags = outputTags[i];
              let domainCode = domainTags.code;
              let domainType = domainTags.type;
              let tags = domainTags.tags;
              for (let j = 0; j < tags.length; j++) {
                let tag = tags[j];
                scope.defineInfo.outputItems.push({ domainCode: domainCode, domainType: domainType, tagCode: tag });
              }
            }
            HttpRequest.LoadGraphByDefineId({
              defineId: scope.defineInfo.id
            }).then(function(data) {
              var tmp = data.vertexs;
              for (var i = 0; i < tmp.length; i++) {
                var content = tmp[i].content;
                var ary = new Array();
                ary[0] = content;
                tmp[i].content = ary;
                tmp[i].type = content.type;
              }
              self.graph = data;
              self.graph.uuId = data;
              scope.$digest();
            });
          }
        });
        self.execExplore = function() {
          execExploreModal({
            defineInfo:scope.defineInfo
          }).result.then((data) => {
            toast('success', "实例" + data.name + "创建成功!");
            let inst = {
              createdBy: scope.defineInfo.createdBy,
              createdOn: scope.defineInfo.createdOn,
              defineId: scope.defineInfo.id,
              description: data.description,
              instanceId: data.instanceId,
              id:data.instanceId,
              lastModifiedBy: scope.defineInfo.lastModifiedBy,
              lastModifiedOn: scope.defineInfo.lastModifiedOn,
              name: data.name,
              objectType: 21,
              defineInfo:scope.defineInfo,
              triggeredBy: new Date().getTime(),
              triggeredOn: new Date().getTime()
            };
            exploreTreeCtrl.addInst(scope.defineInfo.id, inst);
          });
        };
        self.editExplore = function() {
          //todo
        };
        self.deleteExplore = function() {
          var branch = {
            name:scope.defineInfo.name,
            id:scope.defineInfo.id
          }
          deleteDtDefineModal({
            branch:branch
          });
        };
        self.execCollect = function() {
          //todo
        };
      },
      template: require('./dtDefine.html')
    }
  }
])


module.exports = moduleName;
