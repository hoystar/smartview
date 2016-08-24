"use strict";
var HttpRequest = require("../../services/httpCenter/request");
var Layout = require("../../services/dag/layout");
var EVENTS = require("../../services/events");
require('./welcomeDag.less');

var moduleName = "app.welcomeDag";

var EVENTS = require("../../services/events");
var WelcomeDagCtrl = require("../../services/welcomeDag/ctrl");

var app = angular.module(moduleName, [
  require("../navBar/navBar")
]);
app.directive("welcomeDag", [
  "$rootScope",
  "$state",
  function($rootScope,$state) {
    return {
      restrict: "AE",
      replace: true,
      controller: [
        "$scope",
        function($scope) {

        }
      ],

      controllerAs: "welcomeDag",
      link: function(scope, element, attrs) {

        var width = $(element).width();
        var height = $(element).height();
        var svg = $(element).find("#welcome-dag")[0];
        var welcomeDagCtrl = new WelcomeDagCtrl({
          width: 1024,
          height: height,
          svg: svg
        });
        scope.$on(EVENTS.SHOW_SUBJECT_NAV, function(event, data) {

          if (data[0].folderId === -1) {
            welcomeDagCtrl.eventProxy.emitEvent(EVENTS.SHOW_TOP_SUBJECT, data);
          } else {
            welcomeDagCtrl.eventProxy.emitEvent(EVENTS.SHOW_SUBJECT, data);
          }
        });
        welcomeDagCtrl.eventProxy.on(EVENTS.UPDATE_NAV, function(data) {
          scope.$broadcast(EVENTS.APPEND_NAV, [data]);
        });
        welcomeDagCtrl.eventProxy.on(EVENTS.SHOW_SUBJECT, function(data) {
          HttpRequest.GetFolderLoad({
            folderId: data.folderId
          }).then((result) => {
            self.drawSubject(result);
          });
        });
        welcomeDagCtrl.eventProxy.on(EVENTS.SHOW_TOP_SUBJECT, function(data) {
          HttpRequest.GetTopSubject({
            workspaceId: data.workspaceId,
          }).then((result) => {
            self.drawSubject(result);
          });
        });

        welcomeDagCtrl.eventProxy.on(EVENTS.CHANGE_MAIN_VIEW, function(data) {
          var item = {
            id: data.id,
            objectType: 5,
            name: data.name,
            status: 0
          }
          $rootScope.$broadcast(EVENTS.TAGSBAR_ADD_NODE, {
            item:item
          });            
        });

        HttpRequest.GetTopSubject({
          workspaceId: 1,
        }).then((result) => {
          self.drawSubject(result);
        });

        self.drawSubject = function(result) {
          let data;
          let nodes = result.vertexs.map((item) => ({
            id: item.objectId,
            name: item.name,
            x: Number(item.position[0]),
            y: Number(item.position[1]),
            color: item.color,
            icon: item.pageImage,
            hasContent: item.hasContent
          }));
          let links = result.edges.map((item) => ({
            source: item.vertexs[0],
            target: item.vertexs[1],
            id: item.identifier
          }));

          data = {
            "nodes": nodes,
            "links": links
          };
          welcomeDagCtrl.draw($.extend(true, {}, data));
        }
        element.on("$destroy", function() {
          welcomeDagCtrl.clearCache();
        })
      },
      template: require('./welcomeDag.html')
    }
  }
])


module.exports = moduleName;