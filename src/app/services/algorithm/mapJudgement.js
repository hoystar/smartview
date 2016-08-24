"use strict";

function MapJudgement() {
  this.vertices = [];
  this.edges = [];
  this.vertex = [];
}

MapJudgement.prototype._expandInfo = function(inputVertices, inputEdges, inputVertex){
  for(var i = 0 ; i < inputVertices.length ; i++){
    var VerticeInfo = {
      code : null
    };
    VerticeInfo.code = inputVertices[i].config.content[0].code;
    this.vertices.push(VerticeInfo);
  }
  for(var i = 0 ; i < inputEdges.length ; i++){
    var edgeInfo = {
      code : null,
      vertexs : []
    }
    edgeInfo.code = i;
    edgeInfo.vertexs.push(inputEdges[i].config.source.content[0].code);
    edgeInfo.vertexs.push(inputEdges[i].config.target.content[0].code);
    this.edges.push(edgeInfo);
  }
  for(var i = 0 ; i < inputVertex.length ; i++){
    this.vertex.push(inputVertex[i].code);
  }
}

MapJudgement.prototype._clean = function(){
  this.vertices = [];
  this.edges = [];
  this.vertex = [];
}

MapJudgement.prototype.estimate = function(mapInfo){
  this._clean();
  if(mapInfo.mapInputData.length === 0){
    return false;
  }
  var adj = [];
  var result = [];
  this._expandInfo(mapInfo.mapNodes, mapInfo.mapLinks, mapInfo.mapInputData);
  for(var i =0;i<this.vertices.length;++i){
    adj[this.vertices[i].code] = [];
  }
  for(var i = 0;i<this.edges.length;i++){
    var edge = this.edges[i].vertexs;
    adj[edge[0]].push(edge[1]);
    adj[edge[1]].push(edge[0]);
  }
  var marked = [];
  for(var i=0;i<this.vertices.length;++i){
    marked[this.vertices[i].code] = false;
  }
  var queue = [];
  var first_vertex = this.vertex[0];
  marked[first_vertex] = true;
  queue.push(first_vertex);
  while(queue.length>0){
    var v = queue.shift();
    result.push(v);
    for (var w in adj[v]){
      if(!marked[adj[v][w]]){
        marked[adj[v][w]] = true;
        queue.push(adj[v][w]);
      }
    }
  }
  var vertexHash = {};
  for (var i = 0 ; i < result.length ; i++){
    vertexHash[result[i]] = true;
  }
  for (var i = 0 ; i < this.vertex.length ; i++){
    if(vertexHash[this.vertex[i]] != true){
      break;
    }
  }
  if (i === this.vertex.length){
    return true;
  }else{
    return false;
  }
}

module.exports = new MapJudgement();
