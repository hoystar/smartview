"use strict";
// import Node from "./node";
let Node = require("./node");
let EVENTS = require("../events");

class Annular extends Node {
  _init() {

  }

  active() {

    var containerDom = document.createElementNS("http://www.w3.org/2000/svg", "g");

    var container = d3.select(containerDom).attr("class", "annular");

    container
      .append("path")
      .attr("fill", "#fff")
      .attr("d", this.config.d);

    var textX = this.config.textX + 15;
    var textY = this.config.textY;
    container
      .append("text")
      .attr("transform", "translate(" + textX + "," + textY + ") scale(0.9)")
      .text(this.config.text);

    if (this.config.hasContent) {
      this.attachAnnularEvent(container);
    }

    this.element = containerDom;
  }
      attachAnnularEvent($dom) {
    $dom.on("click", function() {
      if (d3.event.defaultPrevented) return;
      let data = {
        folderId: this.config.id,
        name: this.config.text,
        parentId: this.config.parentId,
        parentName: this.config.parentName,
      };
      this.eventProxy.emitEvent(EVENTS.SHOW_SUBJECT, [data]);
    }.bind(this));
  }
}

module.exports = Annular;
