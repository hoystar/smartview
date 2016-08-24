"use strict";

require('./default.less');

var moduleName = "app.default";
let TYPE = require("../../../services/objectType");
let EVENTS = require("../../../services/events");

var app = angular.module(moduleName, [
  require("../../../services/modal/createCanvasModal/modal"),
  require("../../../services/modal/canvasListModal/modal")
]);

app.directive("default", [
  "$state",
  "$stateParams",
  "createCanvasModal",
  "canvasListModal",
  "$rootScope",
  function($state, $stateParams, createCanvasModal, canvasListModal, $rootScope) {
    return {
      restrict: "AE",
      replace: true,
      controller: [
        "$scope",
        function($scope) {
          //创建画布
          this.createCanvas = function() {

            createCanvasModal().result.then(function(item) {
              $rootScope.$broadcast(EVENTS.TAGSBAR_ADD_NODE, {
                item:item
              });
            });
          };
          //我的画布
          this.getCanvasList = function() {
            canvasListModal().result.then(function(item) {
              $rootScope.$broadcast(EVENTS.TAGSBAR_ADD_NODE, {
                item:item
              });
            });
          };

          this.gotoCanvas = function(id) {
            let item = {
              id: id,
              type: TYPE.CANVAS,
              name: "供应商业务核算场景",
              onlyKey: TYPE.CANVAS + ":" + id,
              status: 0
            }
            $rootScope.$broadcast(EVENTS.TAGSBAR_ADD_NODE, {
              item:item
            });
          }
        }
      ],
      controllerAs: "default",
      link: function(scope, element, attrs) {

      },
      template: require('./default.html')
    }
  }
])


module.exports = moduleName;