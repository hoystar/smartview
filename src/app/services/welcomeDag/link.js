"use strict";

class Link {
  constructor(option) {
    this.id = option.id;
    this.config = option;
  }
  active() {
    var lineDom = document.createElementNS("http://www.w3.org/2000/svg", "line");
    var line = d3.select(lineDom);
    line
      .attr("class", "link")
      .attr("id", "line-" + this.config.id)
      .attr("stroke-dasharray", "3,3")
      .attr("x1", this.config.source.config.x)
      .attr("y1", this.config.source.config.y)
      .attr("x2", this.config.target.config.x)
      .attr("y2", this.config.target.config.y);

    this.element = lineDom;
  }
}

module.exports = Link;
