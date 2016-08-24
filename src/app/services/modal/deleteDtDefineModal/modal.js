"use strict";

require("./modal.less");
let toast = require("../../toast/toast");
var moduleName = "app.modal.deleteDtDefineModal";
var HttpRequest = require("../../httpCenter/request");
let docTreeCtrl = require("../../docTree/docTreeCtrl");
let EVENTS = require("../../events");
var app = angular.module(moduleName, []);

app.factory("deleteDtDefineModal", [
        "$uibModal",
        function($uibModal) {
            return function(params) {
                return $uibModal.open({
                    animation: true,
                    backdrop:false,
                    template: require("./modal.html"),
                    controller: 'deleteDtDefineModalCtrl',
                    controllerAs: 'modal',
                    resolve: {
                        params: function() {
                            return params
                        }
                    }
                });
            }
        }
    ])
    .controller("deleteDtDefineModalCtrl", [
        "$scope",
        "$uibModalInstance",
        "params",
        "$rootScope",
        function($scope, $uibModalInstance, params,$rootScope) {
            var self = this;
            this.dtDefineInfo = {
                name: params.branch.name
            }
            this.submit = function() {
                $uibModalInstance.close('result');
                HttpRequest.DeleteDtDefine({
                    defineId: params.branch.id
                }).then((data) => {
                    toast("success", "数据探索删除成功!");
                    $rootScope.$broadcast(EVENTS.TAGSBAR_DELETE_NODE, {
                        key: params.branch.objectType+":"+ params.branch.id
                    });
                }.bind(self));
            }

            this.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            }
        }
    ])

module.exports = moduleName;