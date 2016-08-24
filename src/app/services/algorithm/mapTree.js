"use strict";

function MapTree() {
  this.graph = [];
}

MapTree.prototype.tranformMap = function(circle, height, width) {
  this._expandView(circle);
  this._caculateDepth(circle.config["id"]);
  this._caculatePosition(circle.config["id"], height, width);
  this._rewriteExpression(circle);
  return 1;
}

MapTree.prototype._expandView = function(circle){
  var graph_list = {
    x:null,
    y:null,
    childrens:null,
    nums:null
  }
  graph_list.x = circle.config.x;
  graph_list.y = circle.config.y;
  if(circle.config["children"] != null){
    graph_list.childrens = [];
    for (var index in circle.config["children"]){
      graph_list.childrens.push(circle.config["children"][index].config.id);
      this._expandView(circle.config["children"][index]);
    }
  }
  this.graph[circle.config["id"]] = graph_list;
  return 1;
}

MapTree.prototype._caculateDepth = function(code) {
  if(this.graph[code].childrens === null){
    this.graph[code].nums = 0;
    return 0;
  }else{
    var temp = this.graph[code].childrens.length-1;
    var childs = this.graph[code].childrens;
    for(var index in childs){
      if (this.graph[childs[index]].nums === null){
          temp += this._caculateDepth(childs[index]);
      }else{
          temp += this.graph[childs[index]].nums;
      }
    }
    this.graph[code].nums = temp;
    return temp;
  }
}

MapTree.prototype._caculatePosition = function(code, height, width){
  if(this.graph[code].childrens === null){
    return 1;
  }else{
    var childs = this.graph[code].childrens;
    var lens = this.graph[code].childrens.length;
    var x_middle = ((this.graph[code].nums - (this.graph[childs[lens-1]].nums/2)-(this.graph[childs[0]].nums/2))/2)*width;
    for (var i = 0; i < lens ; i++){
      if(i === 0 ){
        this.graph[childs[i]].x = this.graph[code].x - x_middle;
        this.graph[childs[i]].y = this.graph[code].y + height;
        this._caculatePosition(childs[i], height, width);
      } else {
        this.graph[childs[i]].x = this.graph[childs[i-1]].x + width + ((this.graph[childs[i-1]].nums + this.graph[childs[i]].nums)/2)*width;
        this.graph[childs[i]].y = this.graph[code].y + height;
        this._caculatePosition(childs[i], height, width);
      }
    }
    return 1;
  }
}

MapTree.prototype._rewriteExpression = function(circle) {
  circle.config.x = this.graph[circle.config.id].x;
  circle.config.y = this.graph[circle.config.id].y;
  if(circle.config["children"] != null){
    for (var index in circle.config["children"]){
      this._rewriteExpression(circle.config["children"][index]);
    }
  }
  return 1;
}

module.exports = new MapTree();
