"use strict";

require('./subjectCreatePage.less');

let docTreeCtrl = require("../../../services/docTree/docTreeCtrl");
let toast = require("../../../services/toast/toast");
var HttpRequest = require("../../../services/httpCenter/request");

var moduleName = "app.subjectCreatePage";

var app = angular.module(moduleName,[]);

app.controller("subjectCreatePageCtrl",[
  '$scope',
  "$state",
  function($scope, $state){
    this.config = {
      "name": "",
      "description": "",
      "status": "0",
      "pagename":"",
      "pagedescription":"",
      "modifier": "3",
      "modifiedVersion": 0
    };   

    this.saveSubject = function() {
      let parentId = -1;
      HttpRequest.CreateFolderViaJson({
        "name": this.config.name,
        "description": this.config.description,
        "modifier": 3,
        "workspaceId": 1,
        "parentId": parentId,
        "pageName": this.config.pagename,
        "pageDescription": this.config.pagedescription
      }).then(function(data) {
        toast('success', '主题域创建成功');
        docTreeCtrl.addNode(parentId, {
          fieldId: data.id,
          name: this.config.name,
          objectType: 5
        });

        $state.go("treePage.smartview");
      }.bind(this));
    }
}])
.config([
  "$stateProvider",
  function($stateProvider){
    $stateProvider
      .state('systemConfigPage.subjectCreatePage', {
        url: '/subjectCreatePage',
        template: require('./subjectCreatePage.html'),
        controller: 'subjectCreatePageCtrl',
        controllerAs: 'subjectCreatePage'
      });
  }
]);


module.exports = moduleName;
