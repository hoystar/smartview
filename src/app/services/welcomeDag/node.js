"use strict";

var EventEmitter = require("wolfy87-eventemitter");
let EVENTS = require("../events");
var HttpRequest = require("../httpCenter/request");
var WelcomeDagCtrl = require("../../services/welcomeDag/ctrl");
class Node {
  constructor(option) {
    this.id = option.id;
    this.config = option;
    this.eventProxy = new EventEmitter();
  }
  active() {
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
      .text(this.config.name)
      .attr("transform", "translate(0,20)");

    var title = container
      .append("title")
      .text(this.config.name);

    var object = container
      .append("foreignObject")
      .attr("class", "icon-container")
      .attr("transform", "translate(-16,-30)");

    object
      .append("xhtml:div")
      .attr("class", "node-container")
      .append(function() {
        var icon = $("<img class='iconfont' src='" + this.config.icon + "' height='32' width='32'/> ");
        return icon[0];
      }.bind(this));

    if (this.config.hasContent) {
      this.attachAnnularEvent(circle);
    } else {
      this.attatchFolderEvent(circle);
    }

    this.element = containerDom;
  }
  attatchFolderEvent($dom) {
    $dom.on("click", function() {
      this.eventProxy.emitEvent(EVENTS.CHANGE_MAIN_VIEW, [this.config]);
    }.bind(this));
  }
  attachAnnularEvent($dom) {
    this.cache = {};
    $dom.on("mouseover", function() {

      if (d3.event.defaultPrevented) return;

      var self = this;
      let data = this.cache[self.config.id];
      if (data) {
        self.showAnnular(data.vertexs, self.config.name, self.config.id, self.config.x, self.config.y);
      } else {
        HttpRequest.GetFolderLoad({
          folderId: self.config.id
        }).then(function(result) {
          this.cache[self.config.id] = result;
          self.showAnnular(result.vertexs, self.config.name, self.config.id, self.config.x, self.config.y);
        }.bind(this));
      }


    }.bind(this))


    $dom.on("click", function() {
      if (d3.event.defaultPrevented) return;
      let data = {
        folderId: this.config.id,
        name: this.config.name,
      };
      this.eventProxy.emitEvent(EVENTS.SHOW_SUBJECT, [data]);
    }.bind(this))
  }

  showAnnular(data, nodeName, nodeId, centerX, centerY) {
    if (data === null || data.length === 0) return;
    var annularData = [];

    var dataCount = data.length;
    data.forEach(function(item, index) {
      if (index <= 5) {
        if (dataCount > 6 && index === 5) {
          item.name = "......"

        }
        annularData.push(item);
      }
    });

    let radius = 360 / annularData.length;
    let nodeData = this._genAnnularData({
      data: annularData || [],
      nodeId: nodeId,
      nodeName: nodeName,
      centerX: centerX,
      centerY: centerY,
      insideR: 40,
      outsideR: 90,
      radius: radius
    });
    this.eventProxy.emitEvent(EVENTS.ADD_ANNULAR, [nodeData]);
  }



  _genAnnularData(option) {
    let result = [];
    let data = option.data;
    let nodeId = option.nodeId;
    let centerX = option.centerX || 0;
    let centerY = option.centerY || 0;
    let outsideR = option.outsideR || 105;
    let insideR = option.insideR || 55;
    let radius = option.radius || 60;
    let startRadius = option.startRadius || 0;


    if (!data) {
      return [];
    }
    let arcType = 0;
    if (data.length === 1) {
      arcType = 1;
      radius = 359.9;
    }
    for (let i = 0; i < data.length; i++) {
      let startX = centerX + Math.cos((startRadius + i * radius) / 180 * Math.PI) * outsideR;
      let startY = centerY + Math.sin((startRadius + i * radius) / 180 * Math.PI) * outsideR;
      let endX = centerX + Math.cos((startRadius + (i + 1) * radius) / 180 * Math.PI) * outsideR;
      let endY = centerY + Math.sin((startRadius + (i + 1) * radius) / 180 * Math.PI) * outsideR;
      let startX2 = centerX + Math.cos((startRadius + (i + 1) * radius) / 180 * Math.PI) * insideR;
      let startY2 = centerY + Math.sin((startRadius + (i + 1) * radius) / 180 * Math.PI) * insideR;
      let endX2 = centerX + Math.cos((startRadius + i * radius) / 180 * Math.PI) * insideR;
      let endY2 = centerY + Math.sin((startRadius + i * radius) / 180 * Math.PI) * insideR;
      let textX = centerX + Math.cos(((2 * i + 1) * radius / 2 + startRadius) / 180 * Math.PI) * (insideR + outsideR) / 2 - 15;
      let textY = centerY + Math.sin(((2 * i + 1) * radius / 2 + startRadius) / 180 * Math.PI) * (insideR + outsideR) / 2 + 5;

      let cmd = [
        "M", startX, startY,
        //A的属性：x的半径，y的半径，旋转角度，大弧还是小弧，顺时针还是逆时针，结束为坐标(X,Y)
        "A", outsideR, outsideR, 0, arcType, 1, endX, endY,
        "L", startX2, startY2,
        "A", insideR, insideR, 0, arcType, 0, endX2, endY2
      ];

      result.push({
        d: cmd.join(" "),
        id: data[i].objectId,
        text: data[i].name,
        hasContent: data[i].hasContent,
        centerNodeId: nodeId,
        centerX: centerX,
        centerY: centerY,
        insideR: insideR,
        outsideR: outsideR,
        textX: textX,
        textY: textY,
        parentId: option.nodeId,
        parentName: option.nodeName
      });
    }
    return result;
  }
}

module.exports = Node;
