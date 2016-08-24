"use strict";

var SolidEdge = require("./edge/solidEdge");
var DashWithSingleArrow = require("./edge/dashWithSingleArrow");
var DashWithDoubleArrow = require("./edge/dashWithDoubleArrow");
var FlowEdgeArrow = require("./edge/flowEdgeArrow");

var TYPE = {
  FlowEdgeArrow:-1,
  SolidEdge: 1,
  DashWithSingleArrow: 0,
  DashWithDoubleArrow: 2,
}

module.exports = function(data) {
  switch (data.type) {
    case TYPE.SolidEdge:
      return new SolidEdge(data);
    case TYPE.DashWithSingleArrow:
      return new DashWithSingleArrow(data);
    case TYPE.DashWithDoubleArrow:
      return new DashWithDoubleArrow(data);
    case TYPE.FlowEdgeArrow:
      return new FlowEdgeArrow(data);
    default:
      return new SolidEdge(data);
  }
}
