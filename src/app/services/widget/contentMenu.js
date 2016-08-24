"use strict";

var moduleName = "app.service.contentMenu";

var app = angular.module(moduleName, [

]);

app.factory("cxtMenuService", [
    "$compile",
    function($compile) {

        function show(scope, info) {

            $.extend(true, scope.dag._cxtMenuData, info, {
                isShow: true
            });
        }

        function close(scope) {
            scope.dag._cxtMenuData.isShow = false;
        }

        return {
            show: show,
            close: close
        }
    }
]);


module.exports = moduleName;