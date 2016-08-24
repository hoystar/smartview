"use strict";

require('./breadCrumbs.less');

var moduleName = "app.breadCrumbs";

var app = angular.module(moduleName, []);

app.directive("breadCrumbs", [
  "$state",
  function($state) {
    return {
      restrict: "AE",
      replace: true,
      controller: [
        "$scope",
        function($scope) {

        }
      ],
      controllerAs: "breadCrumbs",
      link: function(scope, element, attrs) {
        var self = scope.breadCrumbs;


        var pathObj = {
          smartview: "首页",
          entityPage: "实体详情",
          relationPage: "关系详情",
          tagsPage: "标签详情",
          tablePage: "表详情"
        };

        let url = $state.current.url.replace(/\?[a-z0-9A-Z\._&=+-]+$/, "");
        var paths = url.split("/").filter(function(item) {
          return item !== "page" && item !== "";
        });

        let lastItem = paths.splice(paths.length - 1, 1)[0];
        self.lastItem = pathObj[lastItem] || lastItem;

        self.paths = paths.map(function(item, index) {
          var result = {};
          result.name = pathObj[item] || item;
          result.path = "";
          for (var i = 0; i <= index; i++) {
            result.path += "/" + paths[i];
          }
          return result;
        });

      },
      template: require('./breadCrumbs.html')
    }
  }
])


module.exports = moduleName;
