function requireAll(r) {
  r.keys().forEach(r);
}
requireAll(require.context("./styles/", true, /\.*/));

require('es6-promise').polyfill();

window.Class = require("./app/libs/class");

var app = angular.module("app", [
  require("angular-ui-router"),
  require("@ali/naza-bootstrap"),
  require("./app/directives/nav/nav"),
  require("./app/directives/headerBar/headerBar"),
  require("./app/pages/compent/treePage/treePage"),
  require("./app/pages/entityPage/entityPage"),
  require("./app/pages/relationPage/relationPage"),
  require("./app/pages/tablePage/tablePage"),
  require("./app/pages/smartview/smartview"),
  require("./app/pages/subcirbeDataPage/subcirbeDataPage"),
  require("./app/pages/tagsPage/tagsPage"),
  require("./app/pages/systemConfigPage/systemConfigPage"),
  require("./app/pages/dataSourceConfigPage/dataSourceConfigPage"),
  require("./app/pages/welcome/welcome"),
  require("./app/pages/topologyPage/topologyPage"),
  require("./app/pages/clusterDetailPage/clusterDetailPage"),
  require("./app/pages/subjectConfig/subjectCreatePage/subjectCreatePage"),
  require("./app/pages/subjectConfig/subjectEditPage/subjectEditPage"),
  require("./app/pages/workspaceConfig/workspaceConfig"),
  require("./app/pages/tmpOtmManagerPage/tmpOtmManagerPage"),
  require("./app/directives/widget/hoverTip/hoverTip"),
  require("./app/directives/widget/loading/loading"),
  require("./app/directives/widget/appCheckbox/appCheckbox"),
  require("./app/filter/dateFilter/dateFilter")
]);

app.config([
    "$urlRouterProvider",
    "$locationProvider",
    function($urlRouterProvider, $locationProvider) {
      $locationProvider.html5Mode(true);
      $urlRouterProvider.otherwise("/page/welcome");
    }
  ])
  .run(function($rootScope) {

  })
