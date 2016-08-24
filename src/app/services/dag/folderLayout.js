"use strict";

var Layout = require("./layout");

var FolderLayout = Class.create({
    Extends: Layout,
    initialize: function(option) {
        FolderLayout.superclass.initialize.apply(this, arguments);
        this.selectElements = [];
    }, 
    dragFolder2Layout: function(data) {
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

		var result = this._resolveDragFolderData(selectEle);
		this.addItems2Layout(result);
		return result;  
    },  
	_resolveInitData : function(data) {

	  !data.vertexs && (data.vertexs = []);
	  !data.edges && (data.edges = []);

	  var nodes = [];
	  var links = [];

	  nodes = data.vertexs.map(function(item) {
	    var obj = {};
	    obj.id = item.identifier;
		obj.content = [{code:item.objectId,name:item.name}];
	    obj.type = 5;
	    obj.detectable = false;
	    obj.critical = false;
	    obj.icon = item.pageImage;
		obj.x1 = obj.x = item.position[0];
		obj.y1 = obj.y = item.position[1]; 
	    obj.width = 60;
	    obj.height = 40;
	    obj.color = item.color;
	    return obj;
	  });

	  links = data.edges.map(function(item) {
	    return {
	      id: item.identifier,
	      type: 1,
	      source: item.vertexs[0],
	      target: item.vertexs[1]
	    }
	  });

	  return {
	    nodes: nodes,
	    links: links
	  }
	},   
	_resolveDragFolderData: function(element) {
	  var result = {
	    nodes: [],
	    links: []
	  }

	  result.nodes.push({
	    id: element.id,
	    x: element.x,
	    y: element.y,
	    x1: element.x,
	    y1: element.y,
	    width: 60,
	    height: 40,
	    content: [{code:element.id,name:element.name}],
	    detectable: false,
	    type: element.type,
	    critical: true
	  });    

	  return result;
	},
	selectNode: function(id,option){
	  if(option === 1){
	    this.clearSelection();
	  }
	  var node = this.findNode(id);
	  if(node){
	    this.selectElements.push(node);
	    node.highlight();
	  }  
	  return this.selectElements;
	},
	clearSelection : function(){
	  this.selectElements.forEach(function(element) {
	    element.unHighlight();
	  });  
	  this.selectElements = [];
	}	           
});

module.exports = FolderLayout;
