"use strict";

var moduleName = "app.dateFilter";

var app = angular.module(moduleName, []);
let moment = require("moment");

app.filter("dateFilter",function(){
  return function(input){
    return moment(new Date(input)).format("YYYY/MM/DD HH:mm:ss");
  };
});

module.exports = moduleName;