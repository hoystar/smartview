"use strict";

var EventEmitter = require("wolfy87-eventemitter");

let EVENTS = require("../../events");

class Edge {
  constructor(option) {
    this.eventProxy = new EventEmitter();
    this.config = option;
  }
  active() {
    var lineDom = document.createElementNS("http://www.w3.org/2000/svg", "line");
    var line = d3.select(lineDom);

    line
      .attr("class", "link")
      .attr("id", "line-" + this.config.id);

    this.element = lineDom;

    this.updatePosition();
  }
  updatePosition() {
    d3.select(this.element)
      .attr("x1", this.config.source.config.x)
      .attr("y1", this.config.source.config.y)
      .attr("x2", this.config.target.config.x)
      .attr("y2", this.config.target.config.y);
  }
}

module.exports = Edge;
