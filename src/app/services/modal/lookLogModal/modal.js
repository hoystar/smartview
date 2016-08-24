"use strict";

require("./modal.less");

var moduleName = "app.modal.lookLogModal";

var app = angular.module(moduleName,[]);

app.factory("lookLogModal",[
    "$uibModal",
    function($uibModal){
        return function(params){
            return $uibModal.open({
                animation: true,
                template: require("./modal.html"),
                controller: 'lookLogModalCtrl',
                controllerAs: 'modal',
                resolve:{
                    params: function(){
                        return params
                    }
                }
            });
        }
    }
])
.controller("lookLogModalCtrl",[
    "$scope",
    "$uibModalInstance",
    "params",
    function($scope,$uibModalInstance,params){
        var self = this; 
        self.logInfo = params.logsInfo

        this.cancel = function(){
            $uibModalInstance.dismiss('cancel');
        }
    }
])

module.exports = moduleName;