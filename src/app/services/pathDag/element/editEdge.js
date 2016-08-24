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
    this.container = d3.select(containerDom);

    this.container
      .append("line")
      .attr("class", "link")
      .attr("id", "line-" + this.config.id);

    this.element = containerDom;

    var centerX = (this.config.source.config.x + this.config.target.config.x) / 2;
    var centerY = (this.config.source.config.y + this.config.target.config.y) / 2;
    var objectDom = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
    var object = d3.select(objectDom)
      .attr("width", 120)
      .attr("transform", "translate(" + centerX + "," + centerY + ")");
    object
      .append("xhtml:div")
      .append(function() {
        let radioStr = ["<p>",
          "<input type='radio' name='contrast' value='1'/>",
          "并且",
          "<input type='radio' name='contrast' value='2'/>",
          "或者",
          "</p>"
        ].join("");
        let radio = $(radioStr);
        $(radio).on("change", this.submitCale.bind(this));
        return radio[0];
      }.bind(this));

    this.container.append(() => {
      return objectDom;
    })

    this.updatePosition();
  }
  updatePosition(nodeId, x, y) {
    if (nodeId) {
      var config = null;
      if (this.config.target.id === nodeId) {
        config = this.config.target;
      } else if (this.config.source.id === nodeId) {
        config = this.config.source;
      }

      config.x = x;
      config.y = y;
    }

    var targetPosition = this.config.target;

    this.container
      .select("line")
      .attr("x1", this.config.source.config.x)
      .attr("y1", this.config.source.config.y)
      .attr("x2", targetPosition.config.x)
      .attr("y2", targetPosition.config.y);
  }
  submitCale(event) {
    this.eventProxy.emitEvent(EVENTS.PATH_CANVAS_CONCAT_TREE, [{
      source: this.config.source,
      target: this.config.target,
      type: parseInt(event.target.value)
    }]);
  }
}

module.exports = Circle;
