"use strict";

var Node = require("./node");
var Annular = require("./annular");
var Link = require("./link");
var EVENTS = require("../events");
var EventEmitter = require("wolfy87-eventemitter");

function Ctrl(option) {
  this.width = option.width;
  this.height = option.height;
  this.svg = d3.select(option.svg) || d3.select("svg");
  this.eventProxy = new EventEmitter();

  this.nodeGroup = null;
  this.linkGroup = null;
  this.annulargroup = null;

  this.nodes = [];
  this.links = [];
  this.annulars = [];

  this._init();
}

Ctrl.prototype._init = function() {
  this.svg
    .attr("width", this.width)
    .attr("height", this.height);
  this.linkGroup = this.svg.append("g")
    .attr("class", "link-group");
  this.nodeGroup = this.svg.append("g")
    .attr("class", "node-group");
  this.annulargroup = this.svg.append("g")
    .attr("class", "annular-group");
}

Ctrl.prototype.draw = function(data) {
  this._dealWithData(data);
  this._update();
}

Ctrl.prototype._dealWithData = function(data) {
  if (data.nodes) {
    this.nodes = data.nodes.map(function(item) {
      return new Node(item);
    });
  }
  if (data.links) {
    this.links = data.links.map(function(item) {
      item.source = this.findNodeById(item.source);
      item.target = this.findNodeById(item.target);
      return new Link(item);
    }.bind(this));
  }
}

Ctrl.prototype._update = function() {
    this.linkGroup.selectAll("*").remove();
    this.nodeGroup.selectAll("*").remove();
    this.annulargroup.selectAll("*").remove();
    var _addLink = this.linkGroup.selectAll(".link")
      .data(this.links)
      .enter()
      .append(function(link) {
        link.active();
        return link.element;
      }.bind(this));

    var _addNode = this.nodeGroup.selectAll(".node")
      .data(this.nodes)
      .enter()
      .append(function(node) {
        node.active();
        return node.element;
      }.bind(this));

    this._attachEventToNode();
}

Ctrl.prototype._attachEventToNode = function() {
  this.nodes.forEach(function(node) {
    node.eventProxy.on(EVENTS.ADD_ANNULAR, function(data) {
      this.annulargroup.selectAll("*").remove();
      this.addAnnularToLayout(data);
    }.bind(this));
    
    node.eventProxy.on(EVENTS.SHOW_SUBJECT, function(data) {
      this.eventProxy.emitEvent(EVENTS.UPDATE_NAV, [
        [data]
      ]);
      this.eventProxy.emitEvent(EVENTS.SHOW_SUBJECT, [data]);
    }.bind(this));

    node.eventProxy.on(EVENTS.CHANGE_MAIN_VIEW, function(data) {
      this.eventProxy.emitEvent(EVENTS.CHANGE_MAIN_VIEW, [data]);
    }.bind(this));    
  }.bind(this));
}
Ctrl.prototype._attachEventToAnnular = function() {
  this.annulars.forEach(function(annular) {
    annular.eventProxy.on(EVENTS.SHOW_SUBJECT, function(data) {
      this.eventProxy.emitEvent(EVENTS.SHOW_SUBJECT, [data]);
      let data2 = [{
        name: data.parentName,
        folderId: data.parentId
      }, {
        name: data.name,
        folderId: data.folderId
      }];

      this.eventProxy.emitEvent(EVENTS.UPDATE_NAV, [data2]);
    }.bind(this))
  }.bind(this));

}

Ctrl.prototype.addAnnularToLayout = function(data) {
  //添加扇形
  data.forEach(function(item, index) {
    item.id = item.id;
    item.index = index;
    var annular = new Annular(item);
    this.annulars.push(annular);
    annular.active();

    this.annulargroup.append(function() {
      return annular.element;
    });

  }.bind(this));
  this._attachEventToAnnular();
}

Ctrl.prototype.findNodeById = function(id) {
  var result = this.nodes.filter(function(item) {
    return item.id === Number(id);
  })

  if (result.length > 0) {
    return result[0];
  } else {
    return null;
  }
}

Ctrl.prototype.clearCache = function() {
  this.nodes = [];
  this.links = [];
  this.annulars = [];

  this.nodeGroup = null;
  this.linkGroup = null;
  this.annulargroup = null;
}

module.exports = Ctrl;
