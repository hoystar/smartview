"use strict";

let _ = require("lodash");
let EventEmitter = require("wolfy87-eventemitter");
import EVENTS from "../events";
import COLORS from "./color";

class TopologyCtrl {
  constructor(option) {
    this.width = option.width;
    this.height = option.height;
    this.svg = d3.select(option.svg);
    this.eventProxy = new EventEmitter();
    this.isShowName = false;

    this.nodes = [];
    this.links = [];
    this.trans = [0, 0];
    this.scale = 1;

    this.color = d3.scale.category20();

    this.fills = COLORS.fillsColor;
    this.colors = COLORS.strokeColor;

    this.force = d3.layout.force()
      .charge(-120)
      .linkDistance(30)
      .size([this.width, this.height]);
  }

  draw(data) {
    let result = this._dealWithData(data);
    this._update(result);
  }

  _dealWithData(data) {
    let result = {};

    result.nodes = data.vertexs.map((item) => {
      return {
        name: item.n,
        id: item.i
      }
    });

    result.links = data.edges.map((item) => {
      return {
        source: _.findIndex(result.nodes, function(o) {
          return o.id == item.p;
        }),
        target: _.findIndex(result.nodes, function(o) {
          return o.id == item.i;
        }),
        sourceId: item.p,
        targetId: item.i,
        id: item.p + "__" + item.i
      }
    });

    result.nodes.forEach((node) => {
      let count = 0;
      result.links.forEach((link) => {
        if (link.sourceId === node.id || link.targetId === node.id) {
          count++;
        }
      });
      node.count = count;
    });

    this.nodes = result.nodes;
    this.links = result.links;

    return result;
  }

  _update(data) {
    this.force
      .nodes(data.nodes)
      .links(data.links)
      .start();

    this.zoomContainer = this.svg.append("g")
      .attr("id", "zoom-container")
      .attr("width", this.width)
      .attr("height", this.height);

    this.svg
      .on("dblclick.zoom", null)
      .call(d3.behavior.zoom().on("zoom", this._rescale.bind(this)));

    this.zoomContainer.append("rect")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("fill", "white")


    var link = this.zoomContainer.selectAll(".link")
      .data(data.links)
      .enter().append(function(d) {
        var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        d._element = line;
        return line;
      })
      .attr("class", "link");

    var node = this.zoomContainer.selectAll(".node")
      .data(data.nodes)
      .enter()
      .append(function(d) {
        var containerDom = document.createElementNS("http://www.w3.org/2000/svg", "g");
        d._element = containerDom;
        return containerDom;
      })
      .attr("class", "node-container")
      .on("click", function(d) {
        this.eventProxy.emitEvent(EVENTS.OPEN_TABLE_PAGE, [d.name]);
      }.bind(this));

    var circle = node.append("circle")
      .attr("class", "node")
      .attr("r", function(d) {
        return (d.count > 5 ? 5 : d.count) + 5;
      })
      .style("fill", function(d) {
        let index = d.count > 5 ? 5 : d.count;
        d.fillsColor = this.fills[index];
        return d.fillsColor;
      }.bind(this))
      .style("stroke", function(d) {
        let index = d.count > 5 ? 5 : d.count;
        return this.colors[index];
      }.bind(this))
      .on("click", function(d) {
        this.eventProxy.emitEvent(EVENTS.OPEN_TOPOLOGY_PAGE, [d.id]);
      }.bind(this));

    node.append("title")
      .text(function(d) {
        return d.name;
      });

    this.force.on("tick", function() {
      link.attr("x1", function(d) {
          return d.source.x;
        })
        .attr("y1", function(d) {
          return d.source.y;
        })
        .attr("x2", function(d) {
          return d.target.x;
        })
        .attr("y2", function(d) {
          return d.target.y;
        });

      node.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")"
      });
    });
  }

  _rescale() {
    let scale = d3.event.scale;
    let trans = d3.event.translate;

    this.trans = trans;
    this.scale = scale;
    this.zoomContainer.attr("transform", "translate(" + trans + ")" + " scale(" + scale + ")");
    this._scle = scale;

    if (!this.isShowName && scale > 3) {
      this._showName();
    }

    if (this.isShowName && scale < 3) {
      this._unShowName();
    }
  }

  _showName() {
    let nodes = d3.selectAll(".node-container");
    nodes
      .append("text")
      .attr("x", "15")
      .attr("y", ".35em")
      .attr("class", "text")
      .text(function(d) {
        var ret = d.name.toString();
        ret = ret.length > 14 ? ret.substr(0, 5) + ".." + ret.substr(ret.length - 5, ret.length) : ret;
        return ret;
      });
    this.isShowName = true;
  }

  _unShowName() {
    let texts = d3.selectAll(".text")
      .remove();
    this.isShowName = false;

  }

  locatePosition(item) {

    this.unfocus();

    let locateDom = null;

    this.nodes.forEach((node) => {
      if (node.name === item.n) {
        locateDom = node;
      }
    });

    let x = -(locateDom.x) * 3 + this.width / 2;
    let y = -(locateDom.y) * 3 + this.height / 2;

    this.zoomContainer.attr("transform", "translate(" + x + "," + y + ") scale(" + 3 + ")");
    this._showName();
    this.focusNode(locateDom, "red");
  }

  neighbor(id) {
    let showNodes = [];
    let showLinks = [];
    this.links.forEach((link) => {
      if (link.targetId === id) {
        showNodes.push(link.source);
        showLinks.push(link);
      }
      if (link.sourceId === id) {
        showNodes.push(link.target);
        showLinks.push(link);
      }
    });

    return {
      nodes: showNodes,
      links: showLinks
    }
  }

  hideAll() {

    let showNodes = [];
    let showLinks = [];

    this.nodes.forEach((item) => {
      if (item.isFocus) {
        let result = this.neighbor(item.id);
        showNodes.push(item);
        showNodes = showNodes.concat(result.nodes);
        showLinks = showLinks.concat(result.links);
      }
    });

    showNodes = _.uniqBy(showNodes, 'id');
    showLinks = _.uniqBy(showLinks, 'id');

    let hideNodes = [];
    let hideLinks = [];

    hideNodes = _.differenceBy(this.nodes, showNodes, 'id');
    hideLinks = _.differenceBy(this.links, showLinks, 'id');

    //隐藏所有node
    hideNodes.forEach((node) => {
      d3.select(node._element)
        .style("display", "none");
    });

    //隐藏所有link
    hideLinks.forEach((link) => {
      d3.select(link._element)
        .style("display", "none");
    });
  }

  showAll() {
    this.nodes.forEach((node) => {
      d3.select(node._element)
        .style("display", "inherit");
    });

    this.links.forEach((link) => {
      d3.select(link._element)
        .style("display", "inherit");
    });
  }

  focusNode(node, color) {
    d3.select(node._element)
      .select(".node")
      .style("fill", color);
    node.isFocus = true;
  }

  focusNodes(nodes) {
    this.unfocus();
    nodes.forEach((item, index) => {
      let node = this.findNode(item.i);
      this.focusNode(node, COLORS.focusColor[index]);
    });
  }

  unfocus() {
    this.nodes.forEach((node) => {
      let _index = node.count > 5 ? 5 : node.count;
      if (node.isFocus) {
        d3.select(node._element)
          .select(".node")
          .style("fill", this.fills[_index]);
        node.fillsColor = this.fills[_index];
        node.isFocus = false;
      }
    });
  }

  findNode(id) {
    let result = this.nodes.filter((item) => {
      return item.id === id;
    })

    if (result.length !== 0) {
      return result[0];
    } else {
      return null;
    }
  }
}

export default TopologyCtrl;
