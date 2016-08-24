"use strict";

var d3 = require("d3");
var webCola = require("../../libs/cola");
var EventEmitter = require("wolfy87-eventemitter");
var _ = require("lodash");
var EVENTS = require("../events");

var nodeGen = require("./element/nodeGen");
var edgeGen = require("./element/edgeGen");
var HttpRequest = require("../httpCenter/request");

var Layout = Class.create({
  initialize: function(option) {
    this.canvasId = option.canvasId;
    this.svg = option.svg;
    this.width = option.width;
    this.height = option.height;
    this.color = null;
    this.cola = null;
    this.edgegroup = null;
    this.nodegroup = null;
    this.annulargroup = null;
    this.nodes = [];
    this.annulars = [];
    this.links = [];
    this.eventProxy = new EventEmitter();
    this.modifiedVersion = null;
    this.linkLength = option.linkLength || 180;
    this.viewType = 0;
    this.eventEnable = option.eventEnable===undefined?true:option.eventEnable;

    this._init();
  },

  draw: function(data, isAutoLayout) {
    this.modifiedVersion = data.modifiedVersion;
    this.canvasId = data.id;
    var result = this._resolveInitData(data);
    this._genData(result);
    this.update(isAutoLayout);
  },

  setData: function(data) {
    let result = this._resolveInitData(data);
    this._genData(result);
    this.cola.on("tick", null);
    this.cola.on("tick", function() {
      this.links.forEach(function(item) {
        item.updatePosition();
      });

      this.nodes.forEach(function(item) {
        item.updatePosition();
      });
    }.bind(this));
  },

  _resolveInitData: function(data) {
    !data.vertexs && (data.vertexs = []);
    !data.edges && (data.edges = []);

    var nodes = [];
    var links = [];

    nodes = data.vertexs.map(function(item) {
      var obj = {};
      obj.id = item.identifier;
      obj.content = item.content;
      obj.detectable = item.detectable;
      obj.type = item.type;
      obj.critical = item.critical;
      if (item.position1) {
        obj.x = obj.x1 = obj.x2 = item.position1[0];
        obj.y = obj.y1 = obj.y2 = item.position1[1];
      }
      obj.width = 60;
      obj.height = 40;
      return obj;
    });

    data.edges.forEach(function(item) {
      if (item.type !== -1) {
        links.push({
          id: item.identifier,
          type: item.type,
          viewType: item.viewType,
          source: item.vertexs[0],
          target: item.vertexs[1]
        });
      }
    });

    var data = {
      nodes: nodes,
      links: links
    };

    return data;
  },

  _init: function() {
    var self = this;
    this.color = d3.scale.category20();
    this.cola = webCola.d3adaptor()
      .linkDistance(self.linkLength)
      .avoidOverlaps(true)
      .size([self.width, self.height]);
    this.svg = this.svg || d3.select("svg");
    this.zoomgroup = this.svg.select(".zoom-container")
      .attr("width", this.width)
      .attr("height", this.height);

    this.edgegroup = this.zoomgroup.append("g").attr("class", "edgegroup");
    this.nodegroup = this.zoomgroup.append("g").attr("class", "nodegroup");
    this.annulargroup = this.zoomgroup.append("g").attr("class", "annulargroup");
    

    this.svg
      .on("dblclick.zoom", null)
      .call(d3.behavior.zoom().on("zoom", this._rescale.bind(this)));
  },

  _rescale: function() {
    let scale = d3.event.scale;
    let trans = d3.event.translate;

    this.trans = trans;
    this.scale = scale;
    this.zoomgroup.attr("transform", "translate(" + trans + ")" + " scale(" + scale + ")");
  },

  _genData: function(data) {
    this.nodes = data.nodes.map(function(item) {
      return nodeGen(item);
    });
    this.links = data.links.map(function(item) {
      item.source = this.findNode(item.source).config;
      item.target = this.findNode(item.target).config;
      return edgeGen(item);
    }.bind(this));
  },

  // 更新画布
  update: function(isAutoLayout) {
    var self = this;
    var nodes = this.nodes.map(function(item) {
      return item.config;
    });
    var links = this.links.map(function(item) {
      return item.config;
    });

    if (isAutoLayout) {
      this.cola
        .nodes(nodes)
        .links(links)
        .start();

      this.cola.on("tick", null);
      this.cola.on("tick", function() {
        self.links.forEach(function(item) {
          item.updatePosition();
        });

        self.nodes.forEach(function(item) {
          item.config.x1 = item.config.x2 = item.config.x;
          item.config.y1 = item.config.y2 = item.config.y;
          item.updatePosition();
        });

      }.bind(this));
    } else {
      this.cola
        .nodes(nodes)
        .links(links);
    }

    this._addItemToLayout(nodes, links);
    this._attachEventToLayout(nodes);

  },

  _updatePosition: function(nodeId) {
    var node = this.findNode(nodeId);
    var links = this.neighborEdge(nodeId);
    if (!node.isPieOpen) {
      node.updatePosition();
      links.forEach(function(link) {
        link.updatePosition(nodeId, node.config.x, node.config.y);
      })
    }
  },

  _addItemToLayout: function(nodes, links) {
    var self = this;

    var _addLink = this.edgegroup.selectAll(".link")
      .data(links)
      .enter()
      .append(function(itemConfig) {
        var link = this.findEdge(itemConfig.id);
        link.active();
        return link.element;
      }.bind(this));

    var drag = d3.behavior.drag()
      .origin(function(d) {
        return d;
      })
      .on("dragstart", dragstarted)
      .on("drag", dragged)
      .on("dragend", dragended);

    var _addNode = this.nodegroup.selectAll(".node")
      .data(nodes)
      .enter()
      .append(function(itemConfig) {
        var node = this.findNode(itemConfig.id);
        node.active();
        return node.element;
      }.bind(this))
      .call(drag);

    function dragstarted(d) {
      d3.event.sourceEvent.stopPropagation();
    }

    function dragged(d) {
      var node = self.findNode(d.id);
      if (!node.isPieOpen) {
        d.x = d3.event.x;
        d.y = d3.event.y;
        self._updatePosition(d.id);
      }
    }

    function dragended(d) {}
  },

  _attachEventToLayout: function(nodesConfig) {
    if(!this.eventEnable)
      return;

    var self = this;
    var node = this.nodegroup.selectAll(".node");
    var link = this.edgegroup.selectAll(".link");

    self.links.forEach(function(item) {
      item.updatePosition();
    });

    self.nodes.forEach(function(item) {
      item.updatePosition();
    });

    nodesConfig.forEach(function(config) {
      var _node = this.findNode(config.id);
      _node.removeAllListeners();
      _node.on(EVENTS.ADD_ANNULAR, function(data) {
        this.annulargroup.selectAll("*").remove();
        this.addAnnularToLayout(data);
      }.bind(this));
      _node.on(EVENTS.ADD_FLOW, function(data) {
        this.addFlowToLayout(data);
      }.bind(this));
      _node.on(EVENTS.REMOVE_ANNULAR, this.removeAnnularToLayout.bind(this));
      _node.on(EVENTS.REMOVE_NODE, this.removeNodes.bind(this));
      _node.on(EVENTS.REMOVE_DOMAINDETIAL, this.removeDomainDetial.bind(this));
      _node.on(EVENTS.EXPLORE_NODE, function(data) {
        this.exploreNodes(data);
      }.bind(this));
      _node.on(EVENTS.UNEXPLORE_NODE, function(data) {
        this.unExploreNodes([data]);
      }.bind(this));
      _node.on(EVENTS.FOCUS_NODE, function(data) {
        this.focus(data[0]);
      }.bind(this));
      _node.on(EVENTS.UNFOCUS_NODE, function(data) {
        this.unFocus(data[0]);
      }.bind(this));
      _node.on(EVENTS.SHOW_CXTMENU, function(data) {
        this.showCtxMenu(data);
      }.bind(this));
      _node.on(EVENTS.SHOW_DETAILCIRCLE, function(data) {
        this.addDetailCircleToLayout(data);
      }.bind(this));
      _node.on(EVENTS.REMOVE_DETAILCIRCLE, function(data) {}.bind(this));
      _node.on(EVENTS.ENTITY_RECOMMENT_MODAL, function(data) {
        this.eventProxy.emitEvent(EVENTS.ENTITY_RECOMMENT_MODAL, [data]);
      }.bind(this));
      _node.on(EVENTS.ENTER_FOLDER, function(data) {
        this.eventProxy.emitEvent(EVENTS.ENTER_FOLDER, [data]);
      }.bind(this));
      _node.on(EVENTS.FOLDER_NODE_CLICK, function(data) {
        this.eventProxy.emitEvent(EVENTS.FOLDER_NODE_CLICK, [data]);
      }.bind(this));
    }.bind(this))
  },

  addAnnularToLayout: function(data) {
    this.removeAnnularToLayout();
    //添加扇形
    data.data.forEach(function(item, index) {
      item.type = 4;
      item.id = "annular_" + item.id;
      item.index = index;
      var annular = nodeGen(item);
      this.annulars.push(annular);
      annular.active();
      this.annulargroup.append(function() {
        return annular.element;
      });

      var _node = this.findNode(item.id);
      _node.removeAllListeners();
      _node.on(EVENTS.ADD_CHILDANNULAR, function(data) {
        this.annulargroup.selectAll(".child-annular").remove();
        this.annulars = this.annulars.filter(function(item) {
          return !item.config.isChildAnnular;
        });
        this.eventProxy.emitEvent(EVENTS.HIDE_MULTIPILE_DROPDOWN);
        this.addChildAnnularToLayout(data);
      }.bind(this));
      _node.on(EVENTS.SHOW_DETAILENTITY, function(data) {
        this.eventProxy.emitEvent(EVENTS.SHOW_DETAILENTITY, [data]);
      }.bind(this));
    }.bind(this));
    //添加close btn
    this.annulargroup.append(function() {
      return data.close;
    });
  },

  removeAnnularToLayout: function() {
    this.annulars.forEach((item) => {
      var node = this.findNode(item.config.centerNodeId);
      if (node) {
        node.isPieOpen = false;
      }
    });
    this.annulargroup.selectAll("*").remove();
    this.annulars = [];
    this.eventProxy.emitEvent(EVENTS.HIDE_DETAILENTITY);
    this.eventProxy.emitEvent(EVENTS.REMOVE_ANNULAR);
  },

  addChildAnnularToLayout: function(data) {
    data.forEach(function(item, index) {
      item.type = 4;
      item.id = "annular_" + item.id;
      item.index = index;
      item.isChildAnnular = true;
      var annular = nodeGen(item);
      this.annulars.push(annular);
      annular.active();
      this.annulargroup.append(function() {
        return annular.element;
      }).attr("class", "child-annular");
      var _node = this.findNode(item.id);
      _node.removeAllListeners();
      _node.on(EVENTS.SHOW_DETAILENTITY, function(data) {
        this.eventProxy.emitEvent(EVENTS.SHOW_DETAILENTITY, [data]);
      }.bind(this));
      _node.on(EVENTS.SHOW_MULTIPILE_DROPDOWN, function(data) {
        this.eventProxy.emitEvent(EVENTS.SHOW_MULTIPILE_DROPDOWN, [data]);
      }.bind(this));
    }.bind(this));

  },

  addDetailCircleToLayout: function(data) {
    let result = {
      nodes: [],
      links: []
    }
    data.nodes.forEach(function(item, index) {
      item.id = "diamondDetail_" + item.content[0].code;
      result.nodes.push(item);
      result.links.push({
        id: data.nodeId + "-" + item.id, //item.content[0].code,
        source: data.nodeId,
        target: item.id, //item.content[0].code,
        type: 1
      });
      this.addItems2Layout(result);
    }.bind(this));
  },

  exploreDatasCheck: function(data) {
    var self = this;
    let result = {
      vertexs: [],
      edges: []
    };

    if (data) {
      if (data.vertexs.length > 0) {
        data.vertexs.forEach(function(item) {
          var nodes = self.nodes.filter(function(node) {
            return node.config.id === item.content[0].code;
          });

          if (nodes.length == 0) {
            result.vertexs.push(item);
          }
        });
      }
      if (data.edges.length > 0) {
        data.edges.forEach(function(edge) {
          var vertexs = result.vertexs.filter(function(item) {
            return item.identifier === edge.vertexs[0] || item.identifier === edge.vertexs[1];
          });

          if (vertexs.length > 0) {
            result.edges.push(edge);
          }
        });
      }
    }
    return result;
  },

  exploreNodes: function(data) {
    let self = this;
    let _node = this.findNode(data.id);
    if (data.hasExplore) {
      this.findNodes(data.exploreNodeIds).forEach(function(item) {
        item && item.show();
      });
      this.findEdges(data.exploreLinkIds).forEach(function(item) {
        item && item.show();
      });
      _node.afterExplore();
    } else {

      let recType = _.get(_node, "config.content[0].recType");

      let promise = null;
      if (recType === 2 || recType === 3) {
        promise = this._recommendExplore(_node);
      } else {
        promise = this._ordinaryExplore(_node);
      }

      promise.then((data) => {
        let result = {
          nodes: [],
          links: []
        };

        let num = data.vertexs.length;
        let R = 65 + _node.config.width / 2;
        let radius = 360 / num;
        for (let i = 0; i < num; i++) {
          let x = _node.config.x + Math.cos(i * radius / 180 * Math.PI) * R;
          let y = _node.config.y + Math.sin(i * radius / 180 * Math.PI) * R;
          result.nodes.push($.extend({}, data.vertexs[i], {
            x: x,
            y: y,
            x1: x,
            y1: y,
            x2: x,
            y2: y,
            width: 60,
            height: 40,
            id: data.vertexs[i].identifier
          }));
        }

        data.edges.forEach(function(item) {
          result.links.push({
            id: item.identifier,
            type: item.type,
            source: item.vertexs[0],
            target: item.vertexs[1]
          });
        });

        _node.afterExplore(result);
        this.addItems2Layout(result);
      });
    }
  },

  _ordinaryExplore: function(_node) {

    let allLinks = [];

    this.nodes.filter(function(item) {
      return item.config.type === 2 && item.config.viewType === 0;
    }).forEach(function(item) {
      item.config.content.forEach(function(item) {
        allLinks.push(item.code);
      });
    });

    var params = {
      detectedEntity: _node.config.content[0].code,
      allEdges: this.links.map(function(item) {
        return item.config.id;
      }),
      allLinks: allLinks,
      allEntities: this.nodes.filter(function(item) {
        return item.config.type === 1;
      }).map(function(item) {
        return item.config.id;
      })
    };

    return HttpRequest.detectEntity(params);
  },

  _recommendExplore: function(_node) {
    let allLinks = [];

    this.nodes.filter(function(item) {
      return item.config.type === 2;
    }).forEach(function(item) {
      item.config.content.forEach(function(item) {
        allLinks.push({
          id: item.id,
          code: item.code,
          recType: item.recType
        });
      });
    });

    var params = {
      domainId: _node.config.content[0].id,
      allEdges: this.links.map(function(item) {
        return item.config.id;
      }),
      allLinks: allLinks,
      allEntities: this.nodes.filter(function(item) {
        return item.config.type === 1;
      }).map(function(item) {
        return {
          id: item.config.content[0].id,
          code: item.config.content[0].code,
          recType: item.config.content[0].recType
        }
      })
    };

    return HttpRequest.GetRecommendExpore(params);
  },
  _genDeptExploreData: function(id) {
    var self = this;
    var result = {
      exploreNodeIds: [],
      exploreLinkIds: []
    };

    var node = this.findNode(id);
    if (node && !node.isExplored) {
      node.isExplored = true;
      if (!node.isExploreLeaf()) {
        var exploreData = node.getExploreData();
        result.exploreNodeIds = result.exploreNodeIds.concat(exploreData.exploreNodeIds);
        result.exploreLinkIds = result.exploreLinkIds.concat(exploreData.exploreLinkIds);

        exploreData.exploreNodeIds.forEach(function(item) {
          self._genDeptExploreData(item);
        });
      }
    }

    return result;
  },
  unExploreNodes: function(ids) {
    ids.forEach(function(id) {
      var exploreData = this._genDeptExploreData(id);
      this.findNode(id).isExplored = false;
      exploreData.exploreNodeIds.forEach(function(nodeId) {
        var _node = this.findNode(nodeId);
        if(_node){
          _node.isExplored = false;
          _node.hide();          
        }

      }.bind(this));
      exploreData.exploreLinkIds.forEach(function(linkId) {
        var _link = this.findEdge(linkId);
        _link && _link.hide();
      }.bind(this));
    }.bind(this));
  },

  hideExploreBtn: function() {
    this.nodes.forEach((node) => {
      node.hideExploreBtn();
    });
  },

  showExploreBtn: function() {
    this.nodes.forEach((node) => {
      node.showExploreBtn();
    });
  },

  addItems2Layout: function(data) {
    var addNodes = data.nodes.map(function(item) {
      var node = this.findNode(item.id);
      if (node) {
        return node;
      } else {
        return nodeGen(item);
      }
    }.bind(this));
    this.nodes = this.nodes.concat(addNodes);
    this.nodes = _.uniqBy(this.nodes, "config.id");
    var nodes = this.nodes.map(function(item) {
      return item.config;
    });

    var addLinks = data.links.map(function(item) {
      var link = this.findEdge(item.id);
      if (link) {
        return link;
      } else {
        var source = this.findNode(item.source).config;
        var target = this.findNode(item.target).config;
        return edgeGen($.extend(true, {}, item, {
          source: source,
          target: target
        }));
      }
    }.bind(this));
    this.links = this.links.concat(addLinks);
    this.links = _.uniqBy(this.links, "config.id");
    var links = this.links.map(function(item) {
      return item.config;
    });

    this._addItemToLayout(nodes, links);
    this._attachEventToLayout(nodes);
  },

  dragItem2Layout: function(data) {
    //只允许拖动一个节点,以后这里需要修改
    var selectEle = data.nodes.length !== 0 ? data.nodes[0] : data.links[0];

    let allLinks = [];
    let allEntities = [];
    let isRepeat = false;
    this.nodes.forEach((node) => {
      node.config.content.forEach((cxt) => {
        if (node.config.type === 1) {
          allEntities.push(cxt.code);
        } else if (node.config.type === 2) {
          allLinks.push(cxt.code);
        }
        if (cxt.code === selectEle.id) {
          isRepeat = true;
        }
      });
    });

    if (isRepeat) {
      return Promise.reject({
        code: 1000,
        error: "画布中已存在该元素"
      })
    }

    var params = {
      links: [],
      entities: [],
      allEdges: this.links.map(function(item) {
        return item.config.id;
      }),
      allLinks: allLinks,
      allEntities: this.nodes.filter(function(item) {
        return item.config.type === 1;
      }).map(function(item) {
        return item.config.id;
      })

    }

    if (selectEle.type === 1) {
      params.entities.push(selectEle.id);
    } else if (selectEle.type === 2) {
      params.links.push(selectEle.id);
    }

    return HttpRequest.findElements(params).then(function(data) {
      var result = this._resolveDragData(selectEle, data);
      this.addItems2Layout(result);
      return result;
    }.bind(this));
  },

  _resolveDragData: function(selectEle, data) {

    var result = {
      nodes: [],
      links: []
    }

    var vertexs = data.vertexs || [];

    var _nodes = vertexs.filter(function(item) {
      for (var i = 0; i < item.content.length; i++) {
        if (item.content[i].code === selectEle.id) {
          result.nodes.push({
            id: item.identifier,
            x: selectEle.x,
            y: selectEle.y,
            width: 60,
            height: 40,
            content: item.content,
            detectable: item.detectable,
            type: item.type,
            critical: item.critical
          });
          return false;
        }
      }
      return true;
    });
    var centerX = selectEle.x;
    var centerY = selectEle.y;
    var R = 120;
    var radus = 360 / _nodes.length;
    for (var i = 0; i < _nodes.length; i++) {
      var posX = centerX + Math.cos(i * radus / 180 * Math.PI) * R;
      var posY = centerY + Math.sin(i * radus / 180 * Math.PI) * R;

      result.nodes.push({
        id: _nodes[i].identifier,
        x: posX,
        y: posY,
        content: _nodes[i].content,
        detectable: _nodes[i].detectable,
        type: _nodes[i].type
      })
    }

    var edges = data.edges || [];
    edges.forEach(function(item) {
      result.links.push({
        id: item.identifier,
        type: item.type,
        source: item.vertexs[0],
        target: item.vertexs[1]
      });
    });

    return result;
  },

  removeNode: function(id) {
    this.removeNodes([id]);
  },

  removeNodes: function(ids) {
    //寻找响应的关系并删除关系节点
    ids.forEach(function(item) {
      let _node = this.findNode(item);
      if (_node.config.type === 5) return;
      var neighborNode = this.neighborNode(item);
      neighborNode.forEach(function(neighborItem) {
        if (neighborItem.config.type === 2 || neighborItem.config.type === 5) {
          this.removeNode(neighborItem.config.id);
        }
      }.bind(this));
    }.bind(this));

    var removeNodes = this.findNodes(ids);
    var removeLinks = [];
    ids.forEach(function(item) {
      removeLinks = removeLinks.concat(this.neighborEdge(item));
    }.bind(this));

    //删除node对象以及相邻的link对象
    this.nodes = this.nodes.filter(function(item) {
      return removeNodes.indexOf(item) === -1;
    });
    this.links = this.links.filter(function(item) {
      return removeLinks.indexOf(item) === -1;
    });

    //删除node节点以及相邻的link节点
    removeNodes.forEach(function(item) {
      this.nodegroup.selectAll("#node-" + item.config.id).remove();
      if (item.isPieOpen) {
        this.annulargroup.selectAll("*").remove();
      }
    }.bind(this));
    removeLinks.forEach(function(item) {
      this.edgegroup.selectAll("#line-" + item.config.id).remove();
    }.bind(this));

    //动画并智能排版
    //this.update();
  },
  removeDomainDetial: function(ids) {
    this.removeNodes(ids);
  },
  findNode: function(id) {
    return this.findNodes([id])[0];
  },

  findNodes: function(ids) {
    var result = [];
    ids.forEach(function(id) {
      var node = undefined;
      if (id.toString().indexOf("annular_") === -1) {
        node = this._findOrdinaryNodes(id);
      } else {
        node = this._findAnnular(id);
      }
      if (node !== undefined) {
        result.push(node);
      }
    }.bind(this));

    return result;
  },

  _findOrdinaryNodes: function(id) {
    var node = this.nodes.filter(function(item) {
      return item.config.id === id;
    })
    return node.length > 0 ? node[0] : undefined;
  },

  _findAnnular: function(id) {
    var node = this.annulars.filter(function(item) {
      return item.config.id === id;
    })
    return node.length > 0 ? node[0] : undefined;
  },

  findEdge: function(id) {
    return this.findEdges([id])[0];
  },

  findEdges: function(ids) {
    var result = [];
    ids.forEach(function(id) {
      var link = this.links.filter(function(item) {
        return item.config.id === id;
      });
      result.push(link.length > 0 ? link[0] : undefined);
    }.bind(this));
    return result;
  },

  neighborEdge: function(id) {
    return this.links.filter(function(item) {
      return item.config.source.id === id || item.config.target.id === id;
    });
  },

  neighborNode: function(id) {
    var nodeIds = [];
    this.links.forEach(function(link) {
      if (link.config.target.id === id) {
        nodeIds.push(link.config.source.id);
      } else if (link.config.source.id === id) {
        nodeIds.push(link.config.target.id);
      }
    });
    nodeIds = _.uniq(nodeIds);
    return this.findNodes(nodeIds);
  },

  focus: function(id) {

    var node = this.findNode(id);
    node && node.highlight();

    var links = this.neighborEdge(id);
    links.forEach(function(link) {
      link.highlight();
    });

    var nodes = this.neighborNode(id);
    nodes.forEach(function(node) {
      node.highlight();
    });
  },

  unFocus: function(id) {
    var node = this.findNode(id);
    node && node.unHighlight();

    var links = this.neighborEdge(id);
    links.forEach(function(link) {
      link.unHighlight();
    });

    var nodes = this.neighborNode(id);
    nodes.forEach(function(node) {
      node.unHighlight();
    });
  },

  showCtxMenu: function(data) {
    this.eventProxy.emitEvent(EVENTS.SHOW_CXTMENU, [data]);
  },

  empty: function() {
    //绝对有内存泄漏问题
    this.cola.stop();
    this.cola.on("tick", null);
    this.cola
      .nodes([])
      .links([]);

    this.nodes = [];
    this.links = [];
    this.edgegroup.selectAll("*").remove();
    this.nodegroup.selectAll("*").remove();
    this.annulargroup.selectAll("*").remove();
  },

  _empty: function() {
    this.cola.stop();
    this.cola.on("tick", null);
    this.cola.links([])
      .symmetricDiffLinkLengths(8).start(0, 0, 10);
    this.edgegroup.data(this.cola.links()).exit().remove();
  },

  getCanvasNodes: function() {
    var nodes = [];
    this.nodes.forEach(function(item) {
      item.config.content.forEach(function(content) {
        nodes.push({
          domainCode: content.code,
          domainType: content.domainType,
          position: [item.config.x, item.config.y],
          criticalNode: item.config.critical
        });
      });
    });

    nodes = _.uniqBy(nodes, "domainCode");
    return nodes;
  },

  saveCanvas: function() {
    var nodes = [];
    this.nodes.forEach(function(item) {
      item.config.content.forEach(function(content) {
        nodes.push({
          domainCode: content.code,
          domainType: content.domainType,
          position: [item.config.x, item.config.y],
          criticalNode: item.config.critical
        });
      });
    });

    nodes = _.uniqBy(nodes, "domainCode");

    return HttpRequest.saveCanvas({
      canvasId: this.canvasId,
      nodes: nodes,
      modifiedVersion: this.modifiedVersion
    }).then(function(data) {
      this.modifiedVersion = data.modifiedVersion;
    }.bind(this));
  },

  autoLayout: function() {

  },

  //等军浪做好接口这里需要跟draw的方法做合并
  topicDraw: function(data) {
    var result = this._resolveInitData(data);
    this._genData(result);

    var self = this;
    var nodes = this.nodes.map(function(item) {
      return item.config;
    });
    var links = this.links.map(function(item) {
      return item.config;
    });

    this.cola
      .nodes(nodes)
      .links(links)
      .start();

    this.cola.on("tick", null);
    this.cola.on("tick", function() {
      this.links.forEach(function(item) {
        item.updatePosition();
      });

      this.nodes.forEach(function(item) {
        item.updatePosition();
      });

    }.bind(this));

    this._addItemToLayout(nodes, links);
    this._attachEventToLayout(nodes);
  },

  recommend: function(table) {

    let allLinks = [];
    let allEntities = [];
    this.nodes.filter(function(item) {
      return item.config.type === 2;
    }).forEach(function(item) {
      item.config.content.forEach(function(item) {
        allLinks.push({
          code: item.code,
          recType: item.recType,
          associatedTables: item.associatedTables
        });
      });
    });


    this.nodes.filter(function(item) {
      return item.config.type === 1;
    }).forEach(function(item) {
      item.config.content.forEach(function(item) {
        allEntities.push({
          code: item.code,
          recType: item.recType,
          associatedTables: item.associatedTables
        });
      });
    });

    return HttpRequest.GetRecommend({
      table: {
        dsId: table.dsId,
        name: table.name
      },
      allEdges: this.links.map(function(item) {
        return item.config.id;
      }),
      allLinks: allLinks,
      allEntities: allEntities
    });
  },

  setSize: function(width, height) {
    this.svg
      .attr("width", width)
      .attr("height", height);
    this.width = width;
    this.height = height;
  },

  destroy: function() {
    //记得销毁一些对象和事件
  }
});


module.exports = Layout;
