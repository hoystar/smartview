"use strict";

import Node from "./node";

let Ellipse = Class.create({
  Extends: Node,
  initialize: function(data) {
    Ellipse.superclass.initialize.apply(this, arguments);

    this.config.width = this.config.width || 30;
    this.config.height = this.config.height || 20;
  },
  active: function() {

    var containerDom = document.createElementNS("http://www.w3.org/2000/svg", "g");
    var container = d3.select(containerDom);

    container
      .attr("class", "node circle")
      .attr("id", "node-" + this.config.id);

    var ellipse = container
      .append("ellipse")
      .attr("rx", 30)
      .attr("ry", 20);

    var label = container
      .append("text")
      .attr("class", "label")
      .text(this.config.content[0].name)
      .attr("transform", function() {
        return "translate(" + 0 + "," + 6 + ")";
      }.bind(this));

    var title = container
      .append("title")
      .text(this.config.name);

    this.element = containerDom;

    this.updatePosition();

    this.attachAnnularEvent(ellipse);

    this.menuData = ["LINK_DETAIL"];
    this._genCtxMenu(containerDom);

    if (!!this.config.content[0].tagCount) {
      this._genTagIcon(container);
    }
  },   
  updatePosition: function() {
    var x = this.config.x || this.config.x1;
    var y = this.config.y || this.config.y1;
    var container = d3.select(this.element);
    container.attr("transform", function() {
      return "translate(" + x + "," + y + ")";
    });
  }
});

module.exports = Ellipse;
