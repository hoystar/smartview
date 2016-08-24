"use strict";
module.exports = {
    vertexs: [{
        content: [{
            code: "1",
            name: "用工",
            domainType: 6
        }],
        identifier: "1",
        type: 6
    }, {
        content: [{
            code: "2",
            name: "薪酬",
            domainType: 6
        }],
        identifier: "2",
        type: 6
    }, {
        content: [{
            code: "3",
            name: "员工",
            domainType: 6
        }],
        identifier: "3",
        type: 6
    }, {
        content: [{
            code: "4",
            name: "绩效",
            domainType: 6
        }],
        identifier: "4",
        type: 6
    }, {
        content: [{
            code: "5",
            name: "培训",
            domainType: 6
        }],
        identifier: "5",
        type: 6
    }, {
        content: [{
            code: "6",
            name: "组织",
            domainType: 6
        }],
        identifier: "6",
        type: 6
    }],
    edges: [{
        identifier: 101,
        type: 1,
        vertexs: ["1", "3"]
    }, {
        identifier: 102,
        type: 1,
        vertexs: ["2", "3"]
    }, {
        identifier: 103,
        type: 1,
        vertexs: ["4", "3"]
    }, {
        identifier: 104,
        type: 1,
        vertexs: ["5", "3"]
    }, {
        identifier: 105,
        type: 1,
        vertexs: ["6", "3"]
    }, {
        identifier: 106,
        type: 1,
        vertexs: ["6", "4"]
    }]
}
