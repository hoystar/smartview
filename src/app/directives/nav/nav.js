"use strict";

require('./nav.less');

var moduleName = "app.nav";

var app = angular.module(moduleName, []);

app.directive("nav", [
    function() {
        return {
            restrict: "AE",
            replace: true,
            controller: [
                "$scope",
                function($scope) {

                }
            ],
            controllerAs: "nav",
            link: function(scope, element, attrs) {

            },
            template: require('./nav.html')
        }
    }
])


module.exports = moduleName;
