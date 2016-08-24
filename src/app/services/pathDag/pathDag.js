"use strict";

let Rect = require("./element/rect");
let Circle = require("./element/circle");
let Edge = require("./element/edge");
let EditEdge = require("./element/editEdge");
let EVENTS = require("../events");
let _ = require("lodash");
var EventEmitter = require("wolfy87-eventemitter");

let ConcatTreeAlgorithm = require("../algorithm/concatTree");
let MapTreeAlgorithm = require("../algorithm/mapTree");

class PathDag {
  constructor(option) {
    this.svg = option.svg;
    this.height = option.height;
    this.width = option.width;
    this.nodes = [];
    this.links = [];
    this.isDrawLink = false;
    this.drawTarget = null;
    this.drawSource = null;
    this.eventProxy = new EventEmitter();
    this.nodeIndex = 0;
    this._init();
  }
  _init() {
    this.svg
      .attr("width", this.width)
      .attr("height", this.height);

    this.zoomgroup = this.svg
      .append("g")
      .attr("class", "zoom-container")
      .attr("width", this.width)
      .attr("height", this.height);
    this.edgegroup = this.zoomgroup.append("g").attr("class", "edgegroup");
    this.nodegroup = this.zoomgroup.append("g").attr("class", "nodegroup");
    this.drawgroup = this.zoomgroup.append("g").attr("class", "drawgroup");
    this.circleIdIndex = 0;
    this.definelinks = [];
    this._attachDrawEvent();
  }
  addItem2Layout(nodes, hasBehavior) {

    let _nodes = this.nodes.map((item) => {
      return item.config;
    }).concat(nodes);
    var _addNode = this.nodegroup.selectAll(".node")
      .data(_nodes)
      .enter()
      .append(function(itemConfig) {
        var node = null;
        $.extend(true, itemConfig, { condition: {} });
        if (itemConfig.type === 1) {
          itemConfig.id = itemConfig.code + "__" + this.nodeIndex++;
          node = new Rect(itemConfig);
        } else {
          node = new Circle(itemConfig);
        }
        node.active();
        node.eventProxy.on(EVENTS.SHOW_CONDITION_TOOLTIPS, function(data) {
          this.eventProxy.emitEvent(EVENTS.SHOW_CONDITION_TOOLTIPS, [data]);
        }.bind(this));

        node.eventProxy.on(EVENTS.HIDE_CONDITION_TOOLTIPS, function() {
          this.eventProxy.emitEvent(EVENTS.HIDE_CONDITION_TOOLTIPS, []);
        }.bind(this));
        if (hasBehavior) {
          node.eventProxy.on(EVENTS.PATH_CANVAS_DRAWLINK, function(data) {
            this.drawLink(data.id);
          }.bind(this));
          node.eventProxy.on(EVENTS.PATH_CANVAS_CXTMENUE, function(data) {
            this.eventProxy.emitEvent(EVENTS.PATH_CANVAS_CXTMENUE, [data]);
          }.bind(this));

        }
        this.nodes.push(node);

        return node.element;
      }.bind(this));
    this.nodes.map((node) => {
      if (node.config.type === 2) {
        node.updateDrawStatus();
      }
    });
    this._attachDragEvent(_addNode);
  }

  addLink2Layout(links) {
    let _links = this.links.map((item) => {
      return item.config;
    }).concat(links);
    var _addLinks = this.edgegroup.selectAll(".link")
      .data(_links)
      .enter()
      .append(function(itemConfig) {
        let link = new Edge(itemConfig);
        link.active();
        this.links.push(link);
        return link.element;
      }.bind(this));

  }


  _attachDragEvent(node) {
    let self = this;
    var drag = d3.behavior.drag()
      .origin(function(d) {
        return d;
      })
      .on("dragstart", dragstarted)
      .on("drag", dragged)
      .on("dragend", dragended);

    function dragstarted(d) {
      d3.event.sourceEvent.stopPropagation();
    }

    function dragged(d) {
      let node = self.findNode(d.id);
      let _intervalX = d3.event.x - node.config.x;
      let _intervalY = d3.event.y - node.config.y;
      self._updateTreePosition(d.id, _intervalX, _intervalY);
    }

    function dragended(d) {

    }

    node.call(drag);
  }
  _attachDrawEvent() {
    let self = this;
    this.svg.on("mousemove", function() {
      if (!self.isDrawLink) {
        return;
      }
      let pos = d3.mouse(this);
      self.drawgroup
        .select("line")
        .attr("x2", pos[0])
        .attr("y2", pos[1]);
    });
  }

  drawLink(id) {
    if (this.isDrawLink) {
      this.drawLinkEnd(id);
    } else {
      this.drawLinkStart(id);
    }
  }
  drawLinkStart(id) {
    var node = this.findNode(id);
    if (!node.config.isRoot && !node.config.isLeaf && node.config.isTree) {
      return;
    }
    this.drawgroup.selectAll("*").remove();
    this.isDrawLink = true;
    this.drawSource = node;
    this.drawgroup
      .append("line")
      .attr("class", "link")
      .attr("y1", node.config.y)
      .attr("x1", node.config.x - 36)
      .attr("y2", node.config.y)
      .attr("x2", node.config.x - 36)
  }
  drawLinkEnd(id) {
    var node = this.findNode(id);
    this.drawgroup.selectAll("*").remove();
    this.isDrawLink = false;
    this.drawTarget = node;
    if (!node.config.isRoot && !node.config.isLeaf && node.config.isTree) {
      return;
    }
    let sourceIsTail = false;
    let targetIsTail = false;
    if (!this.drawSource.config.isRoot && this.drawSource.config.isLeaf && this.drawSource.config.isTree) {
      sourceIsTail = true;
    }
    if (!this.drawTarget.config.isRoot && this.drawTarget.config.isLeaf && this.drawTarget.config.isTree) {
      targetIsTail = true;
    }
    if (sourceIsTail && targetIsTail) {
      return;
    }


    this.drawgroup.append(() => {
      let edge = new EditEdge({
        id: this.drawSource.config.id + "$$" + this.drawTarget.config.id,
        source: this.drawSource,
        target: this.drawTarget
      });
      edge.active();
      edge.eventProxy.on(EVENTS.PATH_CANVAS_CONCAT_TREE, function(data) {
        this.drawgroup.selectAll("*").remove();
        let addContent = ConcatTreeAlgorithm.tranform(data.source, data.target, data.type, {
          findNode: this.findNode.bind(this)
        });
        if (addContent) {
          if (addContent.addNode) {
            $.extend(addContent.addNode, {
              x: data.target.config.x,
              y: data.target.config.y
            });
            this.addItem2Layout(addContent.addNode, true);
            let circle = this.findNode(addContent.addNode.id);
            MapTreeAlgorithm.tranformMap(circle, 60, 100);
            this._updatePosition();
            addContent.cb && addContent.cb(circle);
          }
          if (addContent.updateNodeId) {
            let node = this.findNode(addContent.updateNodeId);
            MapTreeAlgorithm.tranformMap(node, 60, 100);
            this._updatePosition();
          }
          if (addContent.addLinks) {
            addContent.addLinks.forEach((item) => {
              item.source = this.findNode(item.source);
              item.target = this.findNode(item.target);
            });
            this.addLink2Layout(addContent.addLinks);
          }
          if (addContent.delLinks) {
            this.deleteLinks(addContent.delLinks);
          }
        } else {
          this._updatePosition();
        }
      }.bind(this));
      return edge.element;
    });
  }
  findNode(id) {
    return this.findNodes([id])[0];
  }
  findNodes(ids) {
    let result = [];
    ids.forEach(function(id) {
      let node = this.nodes.filter(function(item) {
        return item.config.id === id;
      })
      result.push(node.length > 0 ? node[0] : undefined);
    }.bind(this));

    return result;
  }
  findLink(id) {
    return this.findLinks([id])[0];
  }
  findLinks(ids) {
    let result = [];
    ids.forEach(function(id) {
      let link = this.links.filter(function(item) {
        return item.config.id === id;
      })
      result.push(link.length > 0 ? link[0] : undefined);
    }.bind(this));

    return result;
  }

  _getFuncType(nature) {
    if (nature === "AND") {
      return 1;
    } else {
      return 2;
    }
  }

  analysisContidion(condition) {
    let queue = [];
    let currentNode = {};
    let rootNode = this._getNode(condition);
    queue.push(rootNode);
    while (queue.length != 0) {
      currentNode = queue.shift();
      if (currentNode.config.condition.nature) {
        currentNode.config.condition.conditions.forEach((item) => {
          this.circleIdIndex++;
          let _node = this._getNode(item);
          currentNode.config.children.push(_node);
          if (item.nature) {
            queue.push(_node);
          }
          let link = {
            "id": currentNode.config.id + "__" + _node.config.id,
            "source": currentNode,
            "target": _node
          };
          this.definelinks.push(link);
        })
      }
    }
    return rootNode;
  }

  _getNode(data) {
    let nodeX = Math.random() * this.width;
    let nodeY = Math.random() * this.height;
    if (data.nature) {
      let funcType = this._getFuncType(data.nature);
      let circle = {
        "x": nodeX,
        "y": nodeY,
        "code": "circle_" + this.circleIdIndex,
        "id": "circle_" + this.circleIdIndex,
        "type": 2,
        "funcType": funcType,
        "condition": data,
        "children": []
      };
      return new Circle(circle);
    } else if (data.contrast) {
      if (!data.leftValue.value.name) {
        data.leftValue.value.name = data.leftValue.value.tag;
      }
      let rect = {
        "x": nodeX,
        "y": nodeY,
        "code": data.leftValue.value.tag,
        "name": data.leftValue.value.name,
        "type": 1,
        "condition": data
      };
      return new Rect(rect);
    }
  }


  drawConditionNode(rootCircle) {
    this.addItem2Layout(rootCircle.config, true);
    if (rootCircle.config["children"] !== null) {
      for (var index in rootCircle.config["children"]) {
        this.drawConditionNode(rootCircle.config["children"][index]);
      }
    }
  }


  drawConditionTree(condition) {
    let rootCircle = {};
    $.extend(true, rootCircle, this.analysisContidion(condition));
    rootCircle.config.x = this.width * 0.5;
    rootCircle.config.y = this.height * 0.1 > 40 ? this.height * 0.1 : 40;
    this.drawConditionNode(rootCircle);
    MapTreeAlgorithm.tranformMap(rootCircle, 60, 100);
    this.definelinks.forEach((item) => {
      item.source = this.findNode(item.source.config.id);
      item.target = this.findNode(item.target.config.id);
    });
    this.addLink2Layout(this.definelinks);
    this._updatePosition();
  }
  _updatePosition() {
    this.nodes.forEach((item) => {
      item.updatePosition();
    });
    this.links.forEach((item) => {
      item.updatePosition();
    });

  }

  _updateTreePosition(nodeId, intervalX, intervalY) {
    var nodes = this.findAllTree(nodeId);
    var links = [];
    nodes.forEach((item) => {
      item.config.x += intervalX;
      item.config.y += intervalY;
      item.updatePosition();
      links = links.concat(this.neighborEdge(item.config.id));
    });
    links = _.uniqBy(links, 'config.id');
    links.forEach((item) => {
      item.updatePosition();
    });
  }
  neighborEdge(id) {
    return this.links.filter(function(item) {
      return item.config.source.config.id === id || item.config.target.config.id === id;
    });
  }
  deleteLinks(links) {
    links.forEach((id) => {
      let _link = this.findLink(id);
      let _index = this.links.indexOf(_link);
      this.links.splice(_index, 1);
      this.edgegroup.select("#line-" + id).remove();
    });
  }
  findRoot(id) {
    var root = this.findNode(id);
    while (root.config.parentId) {
      root = this.findNode(root.config.parentId);
    }
    return root;
  }
  findAllTree(nodeId) {
    let root = this.findRoot(nodeId);
    let result = [root];
    let queue = [root];
    while (queue.length !== 0) {
      let node = queue.pop();
      node.config.children && node.config.children.forEach((item) => {
        queue.push(item);
        result.push(item);
      })
    }
    return result;
  }
  deleteNode(nodeId) {
    let node = this.findNode(nodeId);
    d3.select(node.element).remove();
    let _index = this.nodes.indexOf(node);
    this.nodes.splice(_index, 1);
    var inputDataParams = { tags: [], objs: [] }
    var _nIndex = _.findIndex(this.nodes, function(n) {
      return n.config.code == node.config.code;
    });
    var _mdcIndex = _.findIndex(this.nodes, function(mdc) {
      return mdc.config.markedDomainCode == node.config.markedDomainCode;
    });
    if (_nIndex < 0) {
      inputDataParams.tags.push(node);
      if (_mdcIndex < 0) {
        inputDataParams.objs.push(node);
      }
      this.eventProxy.emitEvent(EVENTS.REMOVE_ITEM_INPUTDATA_MODAL, [inputDataParams]);
    }
    if (node.config.isRoot && node.config.children.length === 1) {
      node.config.children[0].config.isRoot = true;
    }
    node.config.children && node.config.children.forEach((item) => {
      item.config.parentId = null;
      if (!item.config.children || item.config.children.length === 0) {
        item.config.isTree = false;
        item.config.isLeaf = false;
      }
    });
    let links = this.neighborEdge(node.config.id);
    this.deleteLinks(links.map((item) => {
      return item.config.id;
    }));
    if (node.config.parentId) {
      let parentNode = this.findNode(node.config.parentId);
      let _childIndex = parentNode.config.children.indexOf(node);
      parentNode.config.children.splice(_childIndex, 1);
      if (parentNode.config.children && parentNode.config.children.length < 2) {
        this.deleteNode(node.config.parentId);
      }
    }

    this.nodes.map((node) => {
      if (node.config.type === 2) {
        node.updateDrawStatus();
      }
    });
  }
}

module.exports = PathDag;
