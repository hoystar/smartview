"use strict";

require('./subjectEditPage.less');

import folderEditCtrl from "../../../services/folderEdit/folderEditCtrl";

var moduleName = "app.subjectEditPage";

var app = angular.module(moduleName,[
  require("../../../directives/folderComponent/folderDag/folderDag"),
  require("../../../directives/dragLayout/dragLayout")
]);

app.controller("subjectEditPageCtrl",[
  '$scope',
  function($scope){
    this.folderEditCtrl = folderEditCtrl;
    this.folderData = {};

    this.folderData.folderId = -1;
    this.folderData.status = 1;
    this.folderEditCtrl.clearCache();
    var bosList = this.folderEditCtrl.getFolderBosList({
      folderId: -1,
      objTypes: "5"
    });
    var topSubject = this.folderEditCtrl.getTopSubject({
      workspaceId: 1
    });
  
    Promise.all([bosList, topSubject]).then(function(values) {
      this.folderData.bosList = values[0];
      this.folderData.folderCanvas = values[1];
      $scope.$digest();
    }.bind(this));    
}])
.config([
  "$stateProvider",
  function($stateProvider){
    $stateProvider
      .state('systemConfigPage.subjectEditPage', {
        url: '/page/subjectConfig/subjectEditPage',
        template: require('./subjectEditPage.html'),
        controller: 'subjectEditPageCtrl',
        controllerAs: 'subjectEditPage'
      });
  }
]);


module.exports = moduleName;
