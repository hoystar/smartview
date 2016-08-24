"use strict";

var Layout = require("./layout");
var nodeGen = require("./element/nodeGen");
var edgeGen = require("./element/edgeGen");
var HttpRequest = require("../httpCenter/request");

var ExploreLayout = Class.create({
  Extends: Layout,
  initialize: function(option) {
    ExploreLayout.superclass.initialize.apply(this, arguments);
  },
  draw: function(data, isAutoLayout) {
    ExploreLayout.superclass.draw.apply(this, arguments);
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
      if(item.position1){
        obj.x = obj.x1 = item.position1[0];
        obj.y = obj.y1 = item.position1[1];        
      }
      if(item.position2 && item.position2.length >= 1 && item.position2[0]){
        obj.x2 = item.position2[0][0];
        obj.y2 = item.position2[0][1];
        obj.position2 = item.position2;
      }else{
        obj.x2 = obj.x1;
        obj.y2 = obj.y1;       
      }
      obj.width = 60;
      obj.height = 40;
      obj.splitNodes = [];
      return obj;
    });

    links = data.edges.map(function(item) {
      return {
        id: item.identifier,
        type: item.type,
        source: item.vertexs[0],
        target: item.vertexs[1]
      }
    });

    links = links.filter(function(link){
    	return link.type !== -1;
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
        x1: posX,
        y1: posY,
        x2: posX,
        y2: posY,
        content: _nodes[i].content,
        detectable: _nodes[i].detectable,
        type: _nodes[i].type,
        critical: _nodes[i].critical
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

    return this._splitMutilContent(result);
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
      if (node.type === 2 && content !== undefined && content.length >= 1) {
        var relationLinks = findLinks(node.id);
        content.forEach(function(item) {
          var newNode = {};
          $.extend(true, newNode, node);
          newNode.splitNodes = [];
          newNode.content = [];
          newNode.content.push(item);
          newNode.id = item.code;
          newNode.y = newNode.y1 = newNode.y1 + contentIndex * 100;
          newNode.x = newNode.x2 = newNode.x1;
          if(node.position2){
            newNode.x2 = node.position2[contentIndex][0];
            newNode.y2 = node.position2[contentIndex][1];
          }
          newNode.content[0].domainType = node.type;
          newNode.content[0].tagCount = 0;
          newNode.parentId = node.id;
          splitNodes.push(newNode);
          contentIndex++;

          var newLinks = [];
          $.extend(true, newLinks, relationLinks);
          newLinks = newLinks.map(function(item) {
            var newLink = {
              type: item.type,
              source: item.source,
              target: item.target
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

    result.nodes = result.nodes.filter(function(item) {
      return srcNodes.indexOf(item) === -1;
    });
    result.links = result.links.filter(function(item) {
      return srcLinks.indexOf(item) === -1;
    }); 

    return result;
  }
});

module.exports = ExploreLayout;
