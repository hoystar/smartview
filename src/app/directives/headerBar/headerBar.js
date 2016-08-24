"use strict";

require('./headerBar.less');

import HttpRequest from "../../services/httpCenter/request";

let EVENTS = require("../../services/events");
let TYPE = require("../../services/objectType");
var moduleName = "app.headerBar";
var app = angular.module(moduleName, []);

app.directive("headerBar", [
  "$state",
  function($state) {
    return {
      restrict: "AE",
      replace: true,
      controller: [
        "$scope",
        "$state",
        "$rootScope",
        function($scope, $state, $rootScope) {

          let self = this;

          HttpRequest.GetLoginUser().then((data) => {
            self.userinfo = data;
            $scope.$digest();
          });
          self.toDefaultPage = function() {
            $state.go("treePage.smartview");
            setTimeout(function(){
              $rootScope.$broadcast(EVENTS.CHANGE_MAIN_VIEW,{
                onlyKey: TYPE.FOLDER+":"
              });
            });
          }

          self.gotoExplorePage = function(){
            $state.go("treePage.smartview");
            setTimeout(function(){
              $rootScope.$broadcast(EVENTS.CHANGE_MAIN_VIEW,{
                onlyKey: TYPE.EXPLORE_FOLDER+":"
              });
            });
          }
        }
      ],
      controllerAs: "headerBar",
      link: function(scope, element, attrs) {

        let self = scope.headerBar;

        if ($state.current.name === "welcome") {
          self.isWelcome = true;
        }

        $(element).find(".search-input").on("focus", function() {
          self.cmsearch = "";
          scope.$digest();
        });
        $(element).find(".search-input").on("blur", function() {
          if (self.keyword === "") {
            self.cmsearch = "";
            scope.$digest();
          }
        });
        self.search = function() {
          if (self.keyword !== "") {
            HttpRequest.GetCmSearch({
              keyword: self.keyword,
            }).then((data) => {
              self.cmsearch = data;
              scope.$digest();
            });
          }
        }

      },
      template: require('./headerBar.html')
    }
  }
])


module.exports = moduleName;