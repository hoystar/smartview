"use strict";

require('./clusterDag.less');

var moduleName = "app.clusterDag";

let Cluster = require("../../services/clutserDag/dag");

var HttpRequest = require("../../services/httpCenter/request");

var EVENTS = require("../../services/events");

let _ = require("lodash");

var app = angular.module(moduleName, [
  require("./clusterToolTips/clusterToolTips")
]);

app.directive("clusterDag", [
  "$stateParams",
  function($stateParams) {
    return {
      restrict: "AE",
      replace: true,
      scope : {
        data: "="
      },
      controller: [
        "$scope",
        function($scope) {

        }
      ],
      controllerAs: "clusterDag",
      link: function(scope, element, attrs) {

        var self = scope.clusterDag;
        self.tipsInfo = {};
        let width = 0;
        let height = 0;
        let offset = $(element).find("#fig-svg-canvas").offset();

        function init() {
          width = $(element).width() - 300;
          height = 450;
          $(element).find("#fig-svg-canvas")
            .attr("width", width)
            .attr("height", height);
        }
        init();

        let cluster = new Cluster({
          width: width,
          height: height
        });

        cluster.eventProxy.on(EVENTS.CLUSTER_SHOW_TIPS, function(data) {
          data.x = (data.x + 15 + 300) + "px";
          data.y = (data.y - 100) + "px";
          self.tipsInfo = data;
          self.tipsInfo.isShow = true;
          scope.$applyAsync();
        });
        cluster.eventProxy.on(EVENTS.CLUSTER_HIDE_TIPS, function() {
          self.tipsInfo.isShow = false;
          scope.$applyAsync();
        });

        self.updateField = function(item, $event) {
          $event && $event.preventDefault();
          $event && $event.stopPropagation();
          cluster.draw({
            dataSourceGuid: _.get(item, "baseMetaIdentifier.dataSourceGuid"),
            tableGuid: _.get(item, "baseMetaIdentifier.tableGuid"),
            tableName: _.get(item, "baseMetaIdentifier.tableName"),
            fieldName: _.get(item, "baseMetaIdentifier.fieldName")
          });
        }

        self.updateTable = function(item, $event) {
          $event && $event.preventDefault();
          $event && $event.stopPropagation();
          cluster.draw({
            dataSourceGuid: _.get(item, "dataSourceGuid"),
            tableGuid: _.get(item, "tableGuid"),
            tableName: _.get(item, "tableName"),
            fieldName: _.get(item, "fieldName")
          });
        }

        self.showList = function(list, $event) {
          $event && $event.preventDefault();
          $event && $event.stopPropagation();
          list.isShow = !!!list.isShow;
        }

        var unwatcher = scope.$watch("data",function(newValue,oldValue){
          if(newValue !== undefined){
            let _obj = {};
            scope.data.forEach((item) => {
              if (_obj[item.tableName]) {
                _obj[item.tableName].data.push(item);
              } else {
                _obj[item.tableName] = {};
                _obj[item.tableName].data = [item];
              }
            });
            let _list = [];
            for (let key in _obj) {
              _list.push({
                tableName: key,
                isShow: false,
                tableGuid: _obj[key].data[0].baseMetaIdentifier.tableGuid,
                data: _obj[key].data
              });
            }
            self.tableList = _list;
            self.updateTable(self.tableList[0]);
            unwatcher();
          }
        });


      },
      template: require('./clusterDag.html')
    }
  }
])


module.exports = moduleName;
