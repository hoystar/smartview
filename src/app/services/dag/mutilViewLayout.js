"use strict";

var Layout = require("./layout");
var nodeGen = require("./element/nodeGen");
var edgeGen = require("./element/edgeGen");
var HttpRequest = require("../httpCenter/request");
var EVENTS = require("../events");
let TYPE = require("./nodeViewType");

var MutilViewLayout = Class.create({
  Extends: Layout,
  initialize: function(option) {
    MutilViewLayout.superclass.initialize.apply(this, arguments);
    this.viewType = 0;
    this.addFlowInfo = { switch: 'off', startNode: null };
  },
  draw: function(data, isAutoLayout) {
    MutilViewLayout.superclass.draw.apply(this, arguments);
    this.changeView(this.viewType);
  },
  changeView: function(viewType) {
    var self = this;
    self.viewType = viewType;

    this.nodes.forEach(function(item) {
      item.changeView(self.viewType);
      item.updatePosition();

      self.neighborEdge(item.config.id).forEach(function(link) {
        link.changeView(self.viewType);
        link.updatePosition(item.config.id, item.config.x, item.config.y);
      });
    });
  },
  saveCanvas: function() {
    var self = this;
    var nodes = [];
    var lines = [];

    this.nodes.forEach(function(item) { 
      var pos = [];
      if(item.config.showType === TYPE.SHOW_IN_ALLVIEW){
        pos.push([item.config.x1, item.config.y1]);
        pos.push([item.config.x2, item.config.y2]);
        item.config.content.forEach(function(content) {
          nodes.push({
            domainCode: content.code,
            domainType: content.domainType,
            position: pos,
            criticalNode: item.config.critical
          });
        });              
      }else if(item.config.showType === TYPE.SHOW_IN_FLOWVIEW && item.config.complexDiamondId){
        var _complexDiamondNode = self.findNode(item.config.complexDiamondId);
        pos.push([_complexDiamondNode.config.x1, _complexDiamondNode.config.y1]);
        pos.push([item.config.x2, item.config.y2]);  
        nodes.push({
          domainCode: item.config.content[0].code,
          domainType: item.config.content[0].domainType,
          position:pos,
          criticalNode: _complexDiamondNode.config.critical
        });              
      }
    });
    nodes = _.uniqBy(nodes, "domainCode");

    this.links.forEach(function(item) {   
      if (item.config.type === -1) {
        lines.push({
          type: item.config.type,
          inputDomain: item.config.source.content[0].code,
          outputDomain: item.config.target.content[0].code
        });
      }
    });

    return HttpRequest.saveCanvas({
      canvasId: this.canvasId,
      nodes: nodes,
      lines: lines,
      modifiedVersion: this.modifiedVersion
    }).then(function(data) {
      this.modifiedVersion = data.modifiedVersion;
    }.bind(this));
  },
  _resolveInitData: function(data) {
    var self = this;
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
      if(item.position1){
        obj.x = obj.x1 = item.position1[0];
        obj.y = obj.y1 = item.position1[1];        
      }
      if(item.position2 && item.position2.length >= 1 && item.position2[0]){
        obj.x2 = item.position2[0][0];
        obj.y2 = item.position2[0][1];
        obj.position2 = item.position2;
      }else{
        obj.x2 = obj.x1 = obj.x = 0;
        obj.y2 = obj.y1 = obj.y = 0;       
      }
      obj.showType = TYPE.SHOW_IN_ALLVIEW;
      obj.width = 60;
      obj.height = 40;
      obj.splitNodes = [];
      return obj;
    });

    links = data.edges.map(function(item) {
      var showType = item.type === -1?TYPE.SHOW_IN_FLOWVIEW:TYPE.SHOW_IN_ALLVIEW;
      return {
        id: item.identifier,
        type: item.type,
        source: item.vertexs[0],
        target: item.vertexs[1],
        showType: showType
      }
    });

    var data = {
      nodes: nodes,
      links: links
    };

    return this._splitMutilContent(data);
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
            x1: selectEle.x,
            y1: selectEle.y,
            x2: selectEle.x,
            y2: selectEle.y,
            width: 60,
            height: 40,
            content: item.content,
            detectable: item.detectable,
            type: item.type,
            critical: item.critical,
            showType:TYPE.SHOW_IN_ALLVIEW
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
        x1: posX,
        y1: posY,
        x2: posX,
        y2: posY,
        content: _nodes[i].content,
        detectable: _nodes[i].detectable,
        type: _nodes[i].type,
        critical: _nodes[i].critical,
        showType:TYPE.SHOW_IN_ALLVIEW
      })
    }

    var edges = data.edges || [];
    edges.forEach(function(item) {
      result.links.push({
        id: item.identifier,
        type: item.type,
        source: item.vertexs[0],
        target: item.vertexs[1],
        showType:TYPE.SHOW_IN_ALLVIEW
      });
    });

    return this._splitMutilContent(result);
  },
  _getNodeByDomainCode:function(nodes,code){
    var rstNode = [];
    nodes.forEach(function(item){
      if(item.showType !== TYPE.SHOW_IN_NEXUSVIEW && item.content){
          item.content.forEach(function(contentItem){
            if(contentItem.code === code){
              rstNode.push(item);
            }
        });
      }        
    });
    return rstNode[0];
  },  
  _updateFlowTerminal: function(data){
    var self = this;
    var result = {
      nodes: data.nodes,
      links: data.links
    };

    var validFlowLinks = [];
    result.links.forEach(function(item){
      if(item.type === -1){
        var sourceNode = self._getNodeByDomainCode(result.nodes,item.source);
        var targetNode = self._getNodeByDomainCode(result.nodes,item.target);
        if(sourceNode && targetNode){
          item.source = sourceNode.id;
          item.target = targetNode.id;
          validFlowLinks.push(item);
        }
      }
    });
    result.links = result.links.filter(function(item){
      return item.type !== -1;
    });
    result.links = result.links.concat(validFlowLinks);
    return result;    
  },
  _splitMutilContent: function(data) {
    var result = {
      nodes: data.nodes,
      links: data.links
    };

    function findLinks(nodeId) {
      return result.links.filter(function(item) {
        return item.source === nodeId || item.target === nodeId;
      });
    }

    var splitNodes = [];
    var splitLinks = [];
    var srcNodes = [];
    var srcLinks = [];
    result.nodes.forEach(function(node) {
      node.splitNodes = [];
      var content = node.content;
      let contentIndex = 0;
      if (node.type === 2 && content !== undefined && content.length > 1) {
        var relationLinks = findLinks(node.id);

        content.forEach(function(item) {
          var newNode = {};
          $.extend(true, newNode, node);
          newNode.splitNodes = [];
          newNode.showType = TYPE.SHOW_IN_FLOWVIEW;
          newNode.content = [];
          newNode.content.push(item);
          newNode.id = item.code;
          newNode.x1 = newNode.x2 = newNode.x;
          newNode.y1 = newNode.y2 = newNode.y + contentIndex * 100;       
          if(node.position2){
            newNode.x2 = node.position2[contentIndex][0];
            newNode.y2 = node.position2[contentIndex][1];
          }
          newNode.content[0].domainType = node.type;
          newNode.complexDiamondId = node.id;
          splitNodes.push(newNode);
          contentIndex++;

          var newLinks = [];
          $.extend(true, newLinks, relationLinks);
          newLinks = newLinks.map(function(item) {
            var newLink = {
              type: item.type,
              source: item.source,
              target: item.target,
              showType:TYPE.SHOW_IN_FLOWVIEW
            };
            if (item.source === node.id) {
              newLink.source = newNode.id;
            } else if (item.target === node.id) {
              newLink.target = newNode.id;
            }
            newLink.id = newLink.source + "-" + newLink.target;
            return newLink;
          });

          splitLinks = splitLinks.concat(newLinks);   
          node.splitNodes.push(item.code);
        });

        srcNodes.push(node);
        srcLinks = srcLinks.concat(relationLinks);
      }
    });

    result.nodes = result.nodes.concat(splitNodes);
    result.links = result.links.concat(splitLinks);

    srcNodes.forEach(function(item){
      item.showType = TYPE.SHOW_IN_NEXUSVIEW;
    });
    srcLinks.forEach(function(item){
      item.showType = TYPE.SHOW_IN_NEXUSVIEW;
    });

    return this._updateFlowTerminal(result);
  },
  _genData: function(data) {
    var self = this;
    this.nodes = data.nodes.map(function(item) {
      return nodeGen(item);
    });

    var _links = [];
    data.links.forEach(function(item){
      var source = null;
      var target = null;
      source = self.findNode(item.source);
      target = self.findNode(item.target);
      if(source && target){
        item.source = source.config;
        item.target = target.config;
        _links.push(item);
      }
    });
    this.links = _links.map(function(item) {
      return edgeGen(item);
    }.bind(this));
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
      this.changeView(self.viewType);
    } else {

      let recType = _.get(_node, "config.content[0].recType");

      let promise = null;
      if (recType === 2 || recType === 3) {
        promise = this._recommendExplore(_node);
      } else {
        promise = this._ordinaryExplore(_node);
      }

      promise.then((exploreData) => {
        let exploreResult = {
          nodes: [],
          links: []
        };

        exploreData.vertexs = exploreData.vertexs.filter(function(item){
          return item.identifier !== data.id;
        });

        let num = exploreData.vertexs.length;
        let R = 65 + _node.config.width / 2;
        let radius = 360 / num;
        for (let i = 0; i < num; i++) {
          let x = _node.config.x + Math.cos(i * radius / 180 * Math.PI) * R;
          let y = _node.config.y + Math.sin(i * radius / 180 * Math.PI) * R;
          exploreResult.nodes.push($.extend({}, exploreData.vertexs[i], {
              x: x,
              y: y,
              x1:x,
              y1:y,
              x2:x,
              y2:y,
            width: 60,
            height: 40,
            id: exploreData.vertexs[i].identifier,
            showType:TYPE.SHOW_IN_ALLVIEW
          }));
        }

        exploreData.edges.forEach(function(item) {
          exploreResult.links.push({
            id: item.identifier,
            type: item.type,
            source: item.vertexs[0],
            target: item.vertexs[1]
          });
        });

        var result = this._splitMutilContent(exploreResult);
        _node.afterExplore(result);
        this.addItems2Layout(result);
      });
    }
  },
  _updateComplexDiamondContent:function(node,isAdd){
    if(isAdd){
      if(node.config.complexDiamondId){
        var complexDiamondNode = this.findNode(node.config.complexDiamondId);
        if(complexDiamondNode){
          var addContent = complexDiamondNode.config.content.filter(function(content){
            return content.code === node.config.content[0].code;
          })
          if(addContent.length <= 0){
            complexDiamondNode.config.content = complexDiamondNode.config.content.concat(node.config.content[0]);
          }
          
          complexDiamondNode.updateContent(); 
        }              
      }
    }else{
      if(node.config.complexDiamondId){
        var complexDiamondNode = this.findNode(node.config.complexDiamondId);
        complexDiamondNode.config.content = complexDiamondNode.config.content.filter(function(content){
          return content.code !== node.config.id;
        });
        if(complexDiamondNode.config.content.length === 0){
          this.removeNode(complexDiamondNode.config.id);
        }else{
          complexDiamondNode.updateContent();
        } 
      }      
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
        link.eventProxy.on(EVENTS.SHOW_DELETE_BTN, function(data) {
          this.edgegroup.selectAll(".link-delete-btn").remove();   
          this.edgegroup.append(function() {
            return data.close;
          });          
        }.bind(this));      
        link.eventProxy.on(EVENTS.DELETE_FLOW, function() {
          this.links = this.links.filter(function(item) {
            return item.config.id !== link.config.id;
          });          
          this.edgegroup.selectAll(".link-delete-btn").remove();
          this.edgegroup.selectAll("#line-" + link.config.id).remove();         
        }.bind(this));      

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
        self._updateComplexDiamondContent(node,true);
        node.active();
        return node.element;
      }.bind(this))
      .call(drag);

    self.changeView(self.viewType);
    function dragstarted(d) {
      d3.event.sourceEvent.stopPropagation();
    }

    function dragged(d) {
      var node = self.findNode(d.id);
      if (node && !node.isPieOpen) {
        if (self.viewType === 0) {
          d.x = d.x1 = d3.event.x;
          d.y = d.y1 = d3.event.y;
        } else {
          d.x = d.x2 = d3.event.x;
          d.y = d.y2 = d3.event.y;
        }
        self._updatePosition(d.id);       
      }
    }

    function dragended(d) {}
  },
  neighborNode: function(id) {
    var nodeIds = [];
    this.links.forEach(function(link) {
      if (link.config.type !== -1 && link.config.target.id === id) {
        nodeIds.push(link.config.source.id);
      } else if (link.config.type !== -1 && link.config.source.id === id) {
        nodeIds.push(link.config.target.id);
      }
    }.bind(this));
    nodeIds = _.uniq(nodeIds);
    return this.findNodes(nodeIds);
  },  
  _deptRelationSearch:function(id){
    var result = [];

    var node = this.findNode(id);
    if(!node.isExplored){
      result.push(node);
      node.isExplored = true;

      var neighborNodes = this.neighborNode(id);
      neighborNodes = neighborNodes.filter(function(item){
        return item.config.type === 2 || item.config.type === 7;
      });

      neighborNodes.forEach(function(item){
        result = result.concat(this.getDeptRelationNodes(item.config.id));
      }.bind(this));
    }
    return result;    
  },
  getDeptRelationNodes:function(id){
    var result = this._deptRelationSearch(id);
    //重置是否已被查找过标志
    result.forEach(function(item){
      item.isExplored = false;
    });

    return result;
  },  

  removeSingleNode:function(id,isRelationRemove){
    var removeNode = this.findNode(id);
    if(!removeNode) return;
    var neighborNodes = this.neighborNode(id);
    neighborNodes.forEach(function(item){
      item.hasExplore = false;
      item.setUnExploreBtn();
      item.exploreNodeIds = [];
      item.exploreLinkIds = [];
    });

    if(isRelationRemove && removeNode.config.type === 2){
      if(this.viewType === 0){
        if(removeNode.config.splitNodes){
          removeNode.config.splitNodes.forEach(function(node){
            this.removeSingleNode(node,false);
          }.bind(this));    
        }    
      }else{
        this._updateComplexDiamondContent(removeNode,false);
      }      
    }

    var removeLinks = this.neighborEdge(id);
    //删除node对象以及相邻的link对象
    this.nodes = this.nodes.filter(function(item) {
      return item.config.id !== id;
    });
    this.links = this.links.filter(function(item) {
      return removeLinks.indexOf(item) === -1;
    });

    this.nodegroup.selectAll("#node-" + id).remove();
    if (removeNode.isPieOpen) {
      this.annulargroup.selectAll("*").remove();
    }

    removeLinks.forEach(function(item) {
      this.edgegroup.selectAll("#line-" + item.config.id).remove();
    }.bind(this));        
  },
  removeNode: function(id) {
    var _node = this.findNode(id);
    if(_node){
      var neighborNodes = this.neighborNode(id);
      neighborNodes.forEach(function(item){
        item.hasExplore = false;
        item.setUnExploreBtn();
        item.exploreNodeIds = [];
        item.exploreLinkIds = [];
      });
    }
    this.removeNodes([id]);
  },  
  removeNodes: function(ids) {  
    ids.forEach(function(id){
      var removeNodes = this.getDeptRelationNodes(id);
      removeNodes.forEach(function(item){
        this.removeSingleNode(item.config.id,true);
      }.bind(this));  
    }.bind(this));
  },  
  removeDomainDetial: function(ids){
    var removeDomainDetials = this.findNodes(ids);
    removeDomainDetials.forEach(function(item){
      this.removeSingleNode(item.config.id,true);
    }.bind(this));  
  },  
  addFlowToLayout: function(data) {
    if (data.config.type !== 2) {
      this.resetAddFlowStatus();
      return;
    }
    if (this.addFlowInfo.switch === 'on') {
      if (!this.addFlowInfo.startNode) {
        this.addFlowInfo.startNode = data;
      } else {
        if (this.addFlowInfo.startNode.config.id === data.config.id) {
          this.resetAddFlowStatus();        
          return;
        }
        //流程线重复校验
        this.links.forEach((link) => {
          if(link.config.source.id === this.addFlowInfo.startNode.config.id && link.config.target.id === data.config.id){
            this.resetAddFlowStatus();
            return;
          }
        });

        var flowData = {
          nodes: [],
          links: [{
            id: "flow-" + this.addFlowInfo.startNode.config.id + "-" + data.config.id,
            type: -1,
            source: this.addFlowInfo.startNode.config.id,
            target: data.config.id,
            showType:TYPE.SHOW_IN_FLOWVIEW
          }]
        };

        this.addItems2Layout(flowData);
        this.resetAddFlowStatus();
      }   
    }
  },
  setShowPieOption:function(enable){   
    this.nodes.forEach(function(item) {
      item.isShowPie = enable;
    });
  },
  resetAddFlowStatus:function(){
      this.addFlowInfo.switch = 'off';
      this.addFlowInfo.startNode = null;
      this.setShowPieOption(true);    
  }
});

module.exports = MutilViewLayout;
