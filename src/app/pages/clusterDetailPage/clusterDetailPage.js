"use strict";

require('./clusterDetailPage.less');

var moduleName = "app.clusterDetailPage";

var URL = require("url");

var app = angular.module(moduleName, []);

app.controller("clusterDetailPageCtrl", [
        '$scope',
        "$state",
        function($scope, $state) {

            this.navs = [{
                value: "FieldDetail",
                text: "表明细"
            }, {
                value: "ClusterDetail",
                text: "血缘"
            }, {
                value: "Instructions",
                text: "使用说明"
            }, {
                value: "UseRecord",
                text: "使用记录"
            }, {
                value: "DataQuality",
                text: "数据质量"
            }, {
                value: "RelatedAnswer",
                text: "知识问答"
            }];

            let code = URL.parse(window.location.href, true).query.code;
            let type = URL.parse(window.location.href, true).query.type;
            this.currentTag = this.navs[0].value;
            if (type) {
                for (let i = 0; i < this.navs.length; i++) {
                    if (this.navs[i].value === type) {
                        this.currentTag = this.navs[i].value;
                    }
                }
            }

            this.changeTag = function(item) {

                let urlObj = URL.parse(window.location.href, true);
                let url = URL.format({
                    protocol: urlObj.protocol,
                    hostname: urlObj.hostname,
                    port: urlObj.port,
                    host: urlObj.host,
                    pathname: urlObj.pathname,
                    hash: urlObj.hash,
                    query: $.extend({}, urlObj.query, {
                        type: item.value
                    })
                });
                window.history.pushState({}, 0, url);

                this.currentTag = item.value;
            }
        }
    ])
    .config([
        "$stateProvider",
        function($stateProvider) {
            $stateProvider
                .state('clusterDetailPage', {
                    url: '/page/clusterDetailPage',
                    template: require('./clusterDetailPage.html'),
                    controller: 'clusterDetailPageCtrl',
                    controllerAs: 'page'
                });
        }
    ]);


module.exports = moduleName;
