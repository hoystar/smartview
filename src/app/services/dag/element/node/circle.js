"use strict";

import Node from "./node";
let EVENTS = require("../../../events");

let Circle = Class.create({
  Extends: Node,
  menuData: [{
    name: "删除节点",
    type: "DEL"
  }],
  initialize: function(data) {
    Circle.superclass.initialize.apply(this, arguments);

    this.isShowPie = false;
    this.config.width = this.config.width || 60;
    this.config.height = this.config.height || 40;
    this.config.color = this.config.color ? this.config.color : "#12dec6";
  },
  active: function() {

    var containerDom = document.createElementNS("http://www.w3.org/2000/svg", "g");
    var container = d3.select(containerDom);

    container
      .attr("class", "node")
      .attr("id", "node-" + this.config.id)
      .attr("transform", "translate(" + this.config.x + "," + this.config.y + ")");

    var circle = container
      .append("circle")
      .attr("r", 45)
      .style("fill", this.config.color)
      .style("opacity", "0.5");

    let text = container
      .append("text")
      .attr("class", "label")
      .text(this.config.content[0].name)
      .attr("transform", "translate(0,20)");

    var title = container
      .append("title")
      .text(this.config.name);

    if (this.config.icon) {
      var object = container
        .append("foreignObject")
        .attr("class", "icon-container")
        .attr("transform", "translate(-16,-30)");

      object
        .append("xhtml:div")
        .attr("class", "node-container")
        .append(function() {
          var icon = $("<img src=" + this.config.icon + " height='32' width='32'/>");
          return icon[0];
        }.bind(this));
    }


    this.element = containerDom;

    this.updatePosition();

    this.attachAnnularEvent(circle);
    this.attachFolderEvent(circle);

    this.menuData = ["DEL"];
    this._genCtxMenu(containerDom);
  },
  updatePosition: function() {
    var x = this.config.x || this.config.x1;
    var y = this.config.y || this.config.y1;
    var w = this.config.width || 60;
    var h = this.config.height || 60;
    var container = d3.select(this.element);
    container.attr("transform", function() {
      return "translate(" + x + "," + y + ")";
    });
  },
  attachFolderEvent: function($dom) {
    $dom.on("click", function() {
      var data = {
        shiftKey: d3.event.shiftKey,
        nodeId: this.config.id
      };
      this.emitEvent(EVENTS.FOLDER_NODE_CLICK, [data]);
    }.bind(this));
  },
});

module.exports = Circle;