"use strict";
let EventEmitter = require("wolfy87-eventemitter");
let EVENTS = require("../events");
let HttpRequest = require("../httpCenter/request");

function Cluster(option) {
  this.width = option.width;
  this.height = option.height;
  this.tree = null;
  this.maxDepth = 0;

  // this.root = $.extend({}, option.root, {
  //   values: [],
  //   x0: this.height / 2,
  //   y0: 0
  // });

  this.data = [];

  this.eventProxy = new EventEmitter();

  this._init();
}


Cluster.prototype._init = function() {

  this.tree = d3.layout.tree();

  this.tree.children(function(d) {
    return d.values;
  }).size([this.height, this.width]);

  this.diagonal = d3.svg.diagonal()
    .projection(function(d) {
      return [d.y, d.x];
    });

  this.svg = d3.select("#fig-svg-canvas")
    .attr("width", this.width)
    .attr("height", this.height)
    .append("svg:g")
    .attr("class", "container")
    .attr("transform", "translate(30,0)");

}

Cluster.prototype._fetchData = function(option) {
  return HttpRequest.GetBloodLineParent({
    tableGuid: option.tableGuid,
    fieldName: option.fieldName,
    upward: true
  }).then((data) => {
    this._dealWithData(option.tableGuid, data);
  })

}

Cluster.prototype._dealWithData = function(id, data) {

  let parent = this._findNode(id);
  parent.values = data;

  this.tree.children(function(d) {
    return d.values;
  });

  var nodes = this.tree.nodes(this.root).reverse();

  this.tree.children(function(d) {
    return d.children;
  });

  parent.values.forEach(function(d) {
    this.maxDepth = Math.max(d.depth);
    if (d.values && d.values.actuals) {
      d.values.actuals.forEach(this._toggleAll.bind(this));
      this._toggleNodes(d);
    } else if (d.values) {
      d.values.forEach(this._toggleAll.bind(this));
      this._toggleNodes(d);
    }
  }.bind(this));

}

Cluster.prototype._findNode = function(id) {
  let queue = [];
  let target = this.root;
  queue.push(this.root);
  while (queue.length !== 0) {
    let item = queue.shift();
    if (item.tableGuid === id) {
      target = item;
      break;
    }
    if (item.values && item.values.length > 0) {
      queue = queue.concat(item.values);
    }
  }
  return target;
}

Cluster.prototype._update = function(source) {
  var self = this;

  var duration = d3.event && d3.event.altKey ? 5000 : 500;

  var nodes = this.tree.nodes(this.root).reverse();

  this._drawNodes(nodes, source, duration);
  this._drawLinks(nodes, source, duration);

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

Cluster.prototype._drawNodes = function(nodes, source, duration) {
  var self = this;

  var depthCounter = 0;
  // Normalize for fixed-depth.
  nodes.forEach(function(d) {
    d.y = d.depth * this.width / (this.maxDepth + 2);
    d.numChildren = (d.children) ? d.children.length : 0;
    if (d.depth == 1) {
      d.linkColor = "#449fef";
      depthCounter++;
    }
    if (d.numChildren == 0 && d._children) d.numChildren = d._children.length;

  }.bind(this));

  //Set link colors based on parent color
  nodes.forEach(function(d) {
    var obj = d;
    while ((obj.source && obj.source.depth > 1) || obj.depth > 1) {
      obj = (obj.source) ? obj.source.parent : obj.parent;
    }
    d.linkColor = (obj.source) ? obj.source.linkColor : obj.linkColor;
  });

  // Update the nodes…
  var node = this.svg.selectAll("g.node")
    .data(nodes, function(d) {
      return d.tableGuid;
    }.bind(this));

  // // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("svg:g")
    .attr("class", "node")
    .attr("id", function(d) {
      return "node_" + d.tableGuid
    })
    .attr("transform", function(d) {
      return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on("click", function(d) {
      if (d.numChildren > 50) {
        alert(d.tableGuid + " has too many departments (" + d.numChildren + ") to view at once.");
      } else {
        if (d.isPullData) {
          this._toggleNodes(d);
          this._update(d);
        } else {

          this._fetchData(d).then(function() {
            this._update(d);
            d.isPullData = true;
          }.bind(this));
        }
      }
      this._hideTips();
    }.bind(this));

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
      return d.source ? d.source.linkColor : d.linkColor;
    })
    .style("fill-opacity", ".8")
    .style("stroke", function(d) {
      return d.source ? d.source.linkColor : d.linkColor;
    });

  nodeEnter.append("text")
    .attr("x", function(d) {
      self.labels[d.tableGuid] = this;
      return d.children || d._children ? -15 : 15;
    })
    .attr("dy", ".35em")
    .attr("text-anchor",
      function(d) {
        return d.children || d._children ? "end" : "start";
      })
    .text(function(d) {
      var ret = (d.fieldName || d.tableName || "缺名称").toString();
      ret = ret.length > 25 ? ret.substr(0, 9) + "..." + ret.substr(ret.length - 9, ret.length) : ret;
      return ret;
    })
    .style("fill-opacity", 0)
    .style("font-size", "12px")
    .on("mouseover", function(d) { node_onMouseOver.bind(this)(d); })
    .on("mouseout", function(d) { node_onMouseOut.bind(this)(d) });

  var nodeUpdate = node.transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + d.y + "," + d.x + ")";
    });

  nodeUpdate.select("circle")
    .attr("r", function(d) {
      //圆形可以按照热度分大小
      return 10;
      // return isNaN(this.nodeRadius(d[this.spendField])) ? 2 : this.nodeRadius(d[this.spendField]);
    }.bind(this))
    .style("fill", function(d) {
      return d.source ? d.source.linkColor : d.linkColor
    })
    .style("fill-opacity", function(d) {
      return ((d.depth + 1) / 5);
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
    if (typeof d.target != "undefined") {
      d = d.target;
    }
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

Cluster.prototype._drawLinks = function(nodes, source, duration) {

  var link = this.svg.selectAll("path.link")
    .data(this.tree.links(nodes), function(d) {
      return d.target.tableGuid;
    });

  var rootCounter = 0;

  // Enter any new links at the parent's previous position.
  link.enter().insert("svg:path", "g")
    .attr("class", "link")
    .attr("id", function(d) {
      return "link_" + d.target.tableGuid;
    })
    .attr("d", function(d) {
      return null;
    }.bind(this))
    .style("stroke", function(d, i) {
      if (d.source.depth == 0) {
        rootCounter++;
        return (d.source.children[rootCounter - 1].linkColor);
      } else {
        return (d.source) ? d.source.linkColor : d.linkColor;
      }
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
    .attr("d", this.diagonal)
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
    .attr("d", this.diagonal)
    .remove();
}

Cluster.prototype.draw = function(root) {
  // this.root = root;
  this.clear();
  this.root = $.extend({}, root, {
    values: [],
    x0: this.height / 2,
    y0: 0
  });
  this._fetchData(root).then(function(data) {
    this._update(this.root);
  }.bind(this));
}

Cluster.prototype.clear = function() {
  this.circles = {};
  this.paths = {};
  this.labels = {};
  this._hideTips();
  d3.select("g.container").selectAll("*").remove();
}

Cluster.prototype._toggleAll = function(d) {
  this.maxDepth = Math.max(d.depth);
  if (d.values && d.values.actuals) {
    d.values.actuals.forEach(this._toggleAll.bind(this));
    this._toggleNodes(d);
  } else if (d.values) {
    d.values.forEach(this._toggleAll.bind(this));
    this._toggleNodes(d);
  }
}

Cluster.prototype._toggleNodes = function(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
}

Cluster.prototype._showTips = function(d) {
  var pos = d3.mouse($("svg")[0]);
  this.eventProxy.emitEvent(EVENTS.CLUSTER_SHOW_TIPS, [{
    x: pos[0],
    y: pos[1],
    data: d
  }])
}

Cluster.prototype._hideTips = function() {
  this.eventProxy.emitEvent(EVENTS.CLUSTER_HIDE_TIPS);
}

module.exports = Cluster;
