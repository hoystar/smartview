"use strict";

var moduleName = 'app.unpopModal.markModal';

require("./markModal.less");

var data1 = require("./data1");
var data2 = require("./data2");

import EVENTS from "../../events";

var app = angular.module(moduleName, [
  require("../modal")
]);

app.factory("markModal", [
  "$unPopModal",
  function($unPopModal) {
    function show(info, scope) {
      return $unPopModal.open({
        template: require('./markModal.html'),
        controller: 'markModalCtrl',
        controllerAs: "modal",
        scope: scope,
        resolve: {
          info: function() {
            return info;
          }
        },
        closable: false,
        enterTriggerEl: '.ok'
      })
    }

    return {
      show: show
    };
  }
]);

app.controller("markModalCtrl", ["$scope", "info", "$modalInstance", "$state",
  function($scope, info, $modalInstance, $state) {

    var self = this;

    self.isOpen = null;

    self.open = function() {
      self.isOpen = !!!self.isOpen;
    }
    self.gotoTagPage = function(item) {
      window.open("/page/smartview/tagsPage?code="+item.id+"&domainCode="+self.info.domainCode);
    }

    $scope.$on(EVENTS.SHOW_DETAILENTITY, function(event, data) {
      self.info = data;
      self.isOpen = true;
      $scope.$applyAsync();
    })
    $scope.$on(EVENTS.HIDE_DETAILENTITY, function(event) {
      self.isOpen = false;
      $scope.$applyAsync();
    })
  }
]);

module.exports = moduleName;
