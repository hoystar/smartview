"use strict";

require('./loading.less');

var moduleName = "app.loading";

var app = angular.module(moduleName,[]);

app.directive("loading",[
  function(){
    return {
      restrict: "AE",
      replace: true,
      controller: [
      "$scope",
      function($scope){

      }],
      controllerAs: "loading",
      link: function(scope,element,attrs){

      },
      template: require('./loading.html')
    }
  }
])


module.exports = moduleName;