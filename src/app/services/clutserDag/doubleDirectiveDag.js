"use strict";

import HttpRequest from "../httpCenter/request";
import EventEmitter from "wolfy87-eventemitter";
import EVENTS from "../events";

let cache = {};

class doubleDirectiveDag {
  constructor(option) {
    this.width = option.width;
    this.height = option.height;
    this.svg = option.svg || d3.select("svg");
    this.tableGuid = option.tableGuid;
    this.eventProxy = new EventEmitter();
    this.labels = {};
    this.circles = {};

    this._init();
  }

  _init() {
    this.svg
      .attr("width", this.width)
      .attr("height", this.height)
      .append("svg:g")
      .attr("class", "container")
      .attr("transform", "translate(30,0)");
  }

  draw(option) {
    this._fetchData({
      tableGuid: option.tableGuid
    }).then((data) => {
      let result = this._dealWithData(option, data);
      this._update(result);
    });
  }

  _dealWithData(selfNode, data) {
    let nodes = [];
    let links = [];
    let nodeR = 10;
    let distance = 250;

    //自身的node
    nodes.push($.extend(selfNode, {
      r: nodeR,
      y: this.width / 2,
      x: this.height / 2
    }));

    if (data.parents && data.parents.length !== 0) {
      //平分高度
      let peh = this.height / data.parents.length;

      data.parents.forEach((item, index) => {
        nodes.push($.extend(item, {
          r: nodeR,
          y: nodes[0].y - distance,
          x: peh * (index + 1) - peh / 2
        }));
        links.push({
          id: nodes[0].tableGuid + "___" + item.tableGuid,
          source: nodes[0],
          target: item
        });
      });
    }

    if (data.children && data.children.length !== 0) {
      //平分高度
      let peh = this.height / data.children.length;
      data.children.forEach((item, index) => {
        nodes.push($.extend(item, {
          r: nodeR,
          y: nodes[0].y + distance,
          x: peh * (index + 1) - peh / 2
        }));
        links.push({
          id: nodes[0].tableGuid + "___" + item.tableGuid,
          source: nodes[0],
          target: item
        });
      });
    }
    // console.log(nodes);
    // console.log(links);
    return {
      nodes: nodes,
      links: links
    };
  }

  _update(data) {
    this._drawNodes(data.nodes);
    this._linkNodes(data.links);
  }

  _drawNodes(nodes) {
    let self = this;
    let duration = 500;

    // Update the nodes…
    var node = this.svg.selectAll("g.node")
      .data(nodes, function(d) {
        return d.tableGuid;
      }.bind(this));

    var nodeEnter = node.enter().append("svg:g")
      .attr("class", "node")
      .attr("id", function(d) {
        return "node_" + d.tableGuid
      })
      .attr("transform", function(d) {
        return "translate(0,0)";
      });

    nodeEnter.append("circle")
      .attr("r", 1e-6)
      .on("mouseover", function(d) {
        node_onMouseOver(d);
        self._showTips(d);
      })
      .on("mouseout", function(d) {
        node_onMouseOut(d);
        //假如移开消失的话交互会很不好
        // self._hideTips();
      })
      .style("fill", function(d) {
        self.circles[d.tableGuid] = this;
        return "#449fef";
      })
      .style("fill-opacity", ".8")
      .style("stroke", function(d) {
        return "#449fef";
      });

    nodeEnter.append("text")
      .attr("x", function(d) {
        self.labels[d.tableGuid] = this;
        return 15;
      })
      .attr("dy", ".35em")
      .attr("text-anchor",
        function(d) {
          return "start";
        })
      .text(function(d) {
        var ret = d.tableName;
        var ret = (d.fieldName || d.tableName || "缺名称").toString();
        ret = ret.length > 25 ? ret.substr(0, 9) + "..." + ret.substr(ret.length - 9, ret.length) : ret;
        return ret;
      })
      .style("fill-opacity", 0)
      .style("font-size", "12px");

    var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) {
        return "translate(" + d.y + "," + d.x + ")";
      });

    nodeUpdate.select("circle")
      .attr("r", function(d) {
        //圆形可以按照热度分大小
        return 10;
      }.bind(this))
      .style("fill", function(d) {
        return "#449fef";
      })
      .style("fill-opacity", function(d) {
        return 0.3;
      });

    nodeUpdate.select("text")
      .style("fill-opacity", 1);

    var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) {
        return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();

    nodeExit.select("circle").attr("r", 1e-6);

    nodeExit.select("text").style("fill-opacity", 1e-6);

    function node_onMouseOver(d) {
      d3
        .select(self.labels[d.tableGuid])
        .transition()
        .style("font-weight", "bold")
        .style("font-size", "16px");
      d3
        .select(self.circles[d.tableGuid])
        .transition()
        .style("fill-opacity", 0.6);
    }

    function node_onMouseOut(d) {
      d3.select(self.labels[d.tableGuid]).transition().style("font-weight", "normal").style("font-size", "12px");
      d3.select(self.circles[d.tableGuid]).transition().style("fill-opacity", 0.3);
    }
  }

  _linkNodes(links) {

    let duration = 500;

    let diagonal = d3.svg.diagonal()
      .projection(function(d) {
        return [d.y, d.x];
      });

    var link = this.svg.selectAll("path.link")
      .data(links, function(d) {
        return d.id;
      });

    // Enter any new links at the parent's previous position.
    link.enter().insert("svg:path", "g")
      .attr("class", "link")
      .attr("id", function(d) {
        return "link_" + d.id;
      })
      .attr("d", function(d) {
        return null;
      }.bind(this))
      .style("stroke", function(d, i) {
        return "#449fef";
      })
      .style("stroke-width", function(d, i) {
        return 4;
      }.bind(this))
      .style("stroke-opacity", function(d) {
        return .1;
      }.bind(this))
      .style("stroke-linecap", "round");

    link.transition()
      .duration(duration)
      .attr("d", diagonal)
      .style("stroke-width", function(d, i) {
        return 4;
      }.bind(this))
      .style("stroke-opacity", function(d) {
        var ret = ((d.source.depth + 1) / 4.5)
        if (d.target[this.spendField] <= 0) ret = .1;
        return ret;
      }.bind(this))

    link.exit().transition()
      .duration(duration)
      .attr("d", diagonal)
      .remove();
  }

  _fetchData(params) {
    if (cache[params.tableGuid]) {
      return Promise.resolve(cache[params.tableGuid]);
    } else {
      return HttpRequest.GetTableBlood(params).then((data) => {
        cache[params.tableGuid] = data;
        return data;
      });
    }
  }

  _showTips(d) {
    let pos = d3.mouse($("svg")[0]);
    this.eventProxy.emitEvent(EVENTS.CLUSTER_SHOW_TIPS, [{
      x: pos[0],
      y: pos[1],
      data: d
    }])
  }

  _hideTips() {
    this.eventProxy.emitEvent(EVENTS.CLUSTER_HIDE_TIPS);
  }
}

export default doubleDirectiveDag;
