"use strict";

require('./topicDag.less');

var topicDag = require("../../services/topicDag/topicDag");

var EVENTS = require("../../services/events");

var moduleName = "app.topicDag";

var app = angular.module(moduleName, []);

app.directive("topicDag", [
  "$state",
  "$stateParams",
  function($state, $stateParams) {
    return {
      restrict: "AE",
      replace: true,
      controller: [
        "$scope",
        function($scope) {

        }
      ],
      controllerAs: "dag",
      link: function(scope, element, attrs) {

        var self = scope.dag;
        var canvasId = $stateParams.id;
        if (!canvasId) {
          $state.go("welcome");
        }

        let width;
        let height;

        function init() {
          width = $(element).width();
          height = $(element).height();
          $(element).find("#topic-svg-canvas")
            .attr("width", width)
            .attr("height", height);
        }
        init();

        var layout = new topicDag({
          svg: d3.select("#topic-svg-canvas"),
          width: width,
          height: height,
          canvasId: canvasId
        });

        layout.draw();

        layout._layout.eventProxy.on(EVENTS.ENTER_FOLDER, (id) => {
          $state.go("treePage.smartview.folder", {
            id: id
          });
        });

      },
      template: require('./topicDag.html')
    }
  }
])


module.exports = moduleName;
