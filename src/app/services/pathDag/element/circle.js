"use strict";

var EventEmitter = require("wolfy87-eventemitter");

let EVENTS = require("../../events");

class Circle {
  constructor(option) {
    this.eventProxy = new EventEmitter();
    this.config = option;
  }
  active() {
    var containerDom = document.createElementNS("http://www.w3.org/2000/svg", "g");
    var container = d3.select(containerDom);
    container
      .attr("class", "node")
      .attr("id", "node-" + this.config.id);

    var circle = container
      .append("circle")
      .attr("class", "circle")
      .attr("r", "20");



    var label = container
      .append("text")
      .attr("class", "label")
      .text(function() {
        if (this.config.funcType === 1) {
          return "并且";
        } else {
          return "或者";
        }
      }.bind(this))
      .attr("transform", function() {
        var x = 0;
        var y = 6;
        return "translate(" + x + "," + y + ")";
      }.bind(this));

    this.element = containerDom;
    this.updateDrawStatus();
    this.updatePosition();
  }
  updateDrawStatus() {
    var container = d3.select(this.element);
    if (!this.config.isTree || this.config.isRoot || this.config.isLeaf) {
      let drawCircle = container
        .append("circle")
        .attr("class", "radio")
        .attr("r", 4)
        .attr("transform", function(d) {
          return "translate(" + -28 + "," + 1 + ")";
        })
        .on("click", this.drawLink.bind(this))

    } else {
      d3.select(this.element).selectAll(".radio").remove();
    }
  }
  updatePosition() {
    var x = this.config.x;
    var y = this.config.y;
    var width = 0;
    var height = 25;
    var container = d3.select(this.element);
    container.attr("transform", function() {
        return "translate(" + (x - width / 2) + "," + (y - height / 2) + ")";
      })
      .attr("cx", function() {
        return x
      })
      .attr("cy", function() {
        return y
      });
  }
  drawLink() {
    this.eventProxy.emitEvent(EVENTS.PATH_CANVAS_DRAWLINK, [{
      id: this.config.id
    }]);
  }
  highlight() {
    var node = d3.select(this.element)
      .select(".rect")
      .classed('rect-focus', true);
  }
  unHighlight() {
    var node = d3.select(this.element)
      .select(".rect")
      .classed('rect-focus', false);
  }
}

module.exports = Circle;
