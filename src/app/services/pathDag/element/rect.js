"use strict";

var EventEmitter = require("wolfy87-eventemitter");

let EVENTS = require("../../events");

class Rect {
  constructor(option) {
    this.eventProxy = new EventEmitter();
    this.config = option;
  }
  _getMenuContent() {
    return [{
      name: "编辑节点",
      type: "EDIT"
    }, {
      name: "删除节点",
      type: "DEL"
    }];
  }
  active() {
    var containerDom = document.createElementNS("http://www.w3.org/2000/svg", "g");
    var container = d3.select(containerDom);

    container
      .attr("class", "node")
      .attr("id", "node-" + this.config.id);

    var rect = container
      .append("rect")
      .attr("class", "rect")
      .attr("width", 60)
      .attr("height", 30)
      .attr("rx", 5).attr("ry", 5);

    var label = container
      .append("text")
      .attr("class", "label")
      .text(function() {
        let _name = this.config.name;
        if (_name.length > 8) {
          _name = _name.substr(0, 5) + "...";
        }
        return _name
      }.bind(this))
      .attr("transform", function() {
        var x = 30;
        var y = 20;
        return "translate(" + x + "," + y + ")";
      }.bind(this));

    var title = container
      .append("title")
      .text(this.config.name);

    if (!this.config.isTree || this.config.isRoot || this.config.isLeaf) {
      let drawCircle = container
        .append("circle")
        .attr("class", "radio")
        .attr("r", 4)
        .attr("transform", function(d) {
          return "translate(" + -8 + "," + 15 + ")";
        })
        .on("click", this.drawLink.bind(this))
    }

    this.element = containerDom;

    this.updatePosition();
    this._attachCxtEvent();
    this._attachTipEvent();
  }
  updatePosition() {
    var x = this.config.x;
    var y = this.config.y;
    var width = 60;
    var height = 30;
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
  _attachCxtEvent() {

    var data = this._getMenuContent().map(function(item) {
      return $.extend(true, {
        id: this.config.id,
        info: this.config
      }, item);
    }.bind(this));

    $(this.element).bind("contextmenu.pathDag", function() {
      this.eventProxy.emitEvent(EVENTS.PATH_CANVAS_CXTMENUE, [{
        nodeId: this.config.id,
        x: this.config.x,
        y: this.config.y,
        data: data
      }]);
      this.eventProxy.emitEvent(EVENTS.HIDE_CONDITION_TOOLTIPS, []);
    }.bind(this));
  }
  _attachTipEvent() {
    let data = {
      id: this.config.id,
      info: this.config,
    };
    $(this.element).on("mouseover", function() {
      this.eventProxy.emitEvent(EVENTS.SHOW_CONDITION_TOOLTIPS, [{
        nodeId: this.config.id,
        x: this.config.x,
        y: this.config.y,
        data: data
      }]);
    }.bind(this));

    $(this.element).on("mouseout", function() {
      this.eventProxy.emitEvent(EVENTS.HIDE_CONDITION_TOOLTIPS, []);
    }.bind(this));
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

module.exports = Rect;
