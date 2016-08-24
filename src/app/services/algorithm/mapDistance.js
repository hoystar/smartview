"use strict";

function MapDistance() {
  this.vertices = [];
  this.edges = [];
  this.vertex = [];
  this.vertexJson = {

  };
  this.linkJson = {

  };
  this.adj = [];
  this.links = [];
}

MapDistance.prototype._expandInfo = function(inputVertices, inputEdges, inputVertex){
  for(var i = 0 ; i < inputVertices.length ; i++){
    var VerticeInfo = {
      code : null,
      type : 0
    };
    VerticeInfo.code = inputVertices[i].config.content[0].code;
    VerticeInfo.type = inputVertices[i].config.content[0].domainType;
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

MapDistance.prototype._linkExpand = function(linkfirst,linksecond){
  var equals = [];
  for(var i =0;i<this.adj[linkfirst].length;++i){
    for(var j = 0; j<this.adj[linksecond].length;j++){
      if(this.adj[linkfirst][i] === this.adj[linksecond][j]){
        equals.push(this.adj[linkfirst][i]);
      }
    }
  }
  if(equals.length > 1){
    this.linkJson[linkfirst+linksecond] = equals;
    this.linkJson[linksecond+linkfirst] = equals;
  }
  return 1;
}

MapDistance.prototype._wholeMap = function(){
  for(var i =0;i<this.vertices.length;++i){
    this.adj[this.vertices[i].code] = [];
    if (this.vertices[i].type === 2){
      this.links.push(this.vertices[i].code);
    }
  }
  for(var i = 0;i<this.edges.length;i++){
    var edge = this.edges[i].vertexs;
    this.adj[edge[0]].push(edge[1]);
    this.adj[edge[1]].push(edge[0]);
  }
  for(var i =0;i<this.links.length;++i){
    for(var j = i+1; j<this.links.length;j++){
      this._linkExpand(this.links[i],this.links[j]);
    }
  }
  for(var i =0;i<this.vertices.length;++i){
    this.vertexJson[this.vertices[i].code] = this.adj[this.vertices[i].code].length;
  }
}

MapDistance.prototype._shortestDistance = function(startname,endname) {
  var marked = [];
  var weight = [];
  var step = [];
  var result = [];
  var queue = [];

  for(var i=0;i<this.vertices.length;++i){
    marked[this.vertices[i].code] = false;
    step[this.vertices[i].code] = 0;
    result[this.vertices[i].code] = [];
  }

  step[startname] = 0;
  weight[startname] = this.vertexJson[startname];
  queue.push(startname);
  result[startname].push(startname);
  while(queue.length>0){
    var v = queue.shift();
    marked[v] = true;
    var s = step[v] + 1;

    for (var w in this.adj[v]){
        if(result[v].length > 1){
            var tempVal =  this.adj[v][w] + result[v][result[v].length-2];
            if(this.linkJson[tempVal] != null){
                s += this.linkJson[tempVal].length;
            }
        }
        if (step[endname] != 0 && s > step[endname]){
            break;
        }else if (this.adj[v][w] === endname){
          if(step[this.adj[v][w]] === 0 || step[this.adj[v][w]] > s){
            weight[this.adj[v][w]] = weight[v] + this.vertexJson[this.adj[v][w]];
            step[this.adj[v][w]] = s;
            result[this.adj[v][w]] =[].concat(result[v]);
            if(result[v].length > 1){
              if(this.linkJson[tempVal] != null){
                for(var h = 0 ; h < this.linkJson[tempVal].length ; h++){
                  if(this.linkJson[tempVal][h] != result[v][result[v].length-1]){
                    result[this.adj[v][w]].push(this.linkJson[tempVal][h]);
                  }
                }
              }
            }
            result[this.adj[v][w]].push(this.adj[v][w]);
          }else if(step[this.adj[v][w]] === s){
            if(weight[this.adj[v][w]] > (weight[v] + this.vertexJson[this.adj[v][w]])){
              weight[this.adj[v][w]] = weight[v] + this.vertexJson[this.adj[v][w]];
              step[this.adj[v][w]] = s;
              result[this.adj[v][w]] =[].concat(result[v]);
              if(result[v].length > 1){
                if(this.linkJson[tempVal] != null){
                  for(var h = 0 ; h < this.linkJson[tempVal].length ; h++){
                    if(this.linkJson[tempVal][h] != result[v][result[v].length-1]){
                      result[this.adj[v][w]].push(this.linkJson[tempVal][h]);
                    }
                  }
                }
              }
              result[this.adj[v][w]].push(this.adj[v][w]);
            }
          }
        }else if(!marked[this.adj[v][w]] && this.adj[v][w]!=v){
          if(step[this.adj[v][w]] === 0){
            weight[this.adj[v][w]] = weight[v] + this.vertexJson[this.adj[v][w]];
            step[this.adj[v][w]] = s;
            result[this.adj[v][w]] =[].concat(result[v]);
            if(result[v].length > 1){
              if(this.linkJson[tempVal] != null){
                for(var h = 0 ; h < this.linkJson[tempVal].length ; h++){
                  if(this.linkJson[tempVal][h] != result[v][result[v].length-1]){
                    result[this.adj[v][w]].push(this.linkJson[tempVal][h]);
                  }
                }
              }
            }
            result[this.adj[v][w]].push(this.adj[v][w]);
            queue.push(this.adj[v][w]);
          }else if(step[this.adj[v][w]] === s){
            if(weight[this.adj[v][w]] > (weight[v] + this.vertexJson[this.adj[v][w]])){
              weight[this.adj[v][w]] = weight[v] + this.vertexJson[this.adj[v][w]];
              step[this.adj[v][w]] = s;
              result[this.adj[v][w]] =[].concat(result[v]);
              if(result[v].length > 1){
                if(this.linkJson[tempVal] != null){
                  for(var h = 0 ; h < this.linkJson[tempVal].length ; h++){
                    if(this.linkJson[tempVal][h] != result[v][result[v].length-1]){
                      result[this.adj[v][w]].push(this.linkJson[tempVal][h]);
                    }
                  }
                }
              }
              result[this.adj[v][w]].push(this.adj[v][w]);
            }
          }else if(step[this.adj[v][w]] > s){
            weight[this.adj[v][w]] = weight[v] + this.vertexJson[this.adj[v][w]];
            step[this.adj[v][w]] = s;
            result[this.adj[v][w]] =[].concat(result[v]);
            if(result[v].length > 1){
              if(this.linkJson[tempVal] != null){
                for(var h = 0 ; h < this.linkJson[tempVal].length ; h++){
                  if(this.linkJson[tempVal][h] != result[v][result[v].length-1]){
                    result[this.adj[v][w]].push(this.linkJson[tempVal][h]);
                  }
                }
              }
            }
            result[this.adj[v][w]].push(this.adj[v][w]);
          }
        }
    }
  }
  return result[endname];
}

MapDistance.prototype._kruskal = function(res, dingInfo){
  var edgeCode = [];
  var bian = 0;
  var dingdian = [];
  var num = 0;
  for(var i = 0 ; i < res.length ; i++){
    for(var j = i ; j < res.length ; j++){
      if (res[i].len >= res[j].len){
        var temp = res[i];
        res[i] = res[j];
        res[j] = temp;
      };
    }
  }

  for(var i = 0 ; i < res.length ; i++){
    if(bian === (this.vertex.length-1)){
      break;
    }else if(dingInfo[res[i].edge[0]].sign === 1 && dingInfo[res[i].edge[1]].sign === 1){
      if(dingInfo[res[i].edge[0]].depth != dingInfo[res[i].edge[1]].depth){
        bian += 1;
        num +=1;
        for(var j = 0 ; j < dingdian.length ; j++){
          if((dingInfo[dingdian[j]].depth === dingInfo[res[i].edge[0]].depth)
            || (dingInfo[dingdian[j]].depth === dingInfo[res[i].edge[1]].depth)){
            dingInfo[dingdian[j]].depth = num;
          }
        }
        edgeCode.push(res[i].code);
      }else{
        continue;
      }
    }else if(dingInfo[res[i].edge[0]].sign === 1 && dingInfo[res[i].edge[1]].sign === 0){
      bian += 1;
      edgeCode.push(res[i].code);
      dingInfo[res[i].edge[1]].sign = 1;
      dingdian.push(res[i].edge[1]);
      dingInfo[res[i].edge[1]].depth = dingInfo[res[i].edge[0]].depth;
    }else if(dingInfo[res[i].edge[0]].sign === 0 && dingInfo[res[i].edge[1]].sign === 1){
      bian += 1;
      edgeCode.push(res[i].code);
      dingInfo[res[i].edge[0]].sign = 1;
      dingdian.push(res[i].edge[0]);
      dingInfo[res[i].edge[0]].depth = dingInfo[res[i].edge[1]].depth;
    }else {
      num += 1;
      bian += 1;
      edgeCode.push(res[i].code);
      dingInfo[res[i].edge[0]].sign = 1;
      dingInfo[res[i].edge[1]].sign = 1;
      dingdian.push(res[i].edge[0]);
      dingdian.push(res[i].edge[1]);
      dingInfo[res[i].edge[0]].depth = num;
      dingInfo[res[i].edge[1]].depth = num;
    }
  }
  return edgeCode;
}

MapDistance.prototype._unique = function(arr) {
  var resultArr = [];
  var hash = {};
  for (var i = 0, part; (part = arr[i]) != null; i++) {
    if (!hash[part]) {
      resultArr.push(part);
      hash[part] = true;
    }
  }
  return resultArr;
}

MapDistance.prototype._mapDistanceCode = function(){
  var res = [];
  var codeInfo = 0;
  var dingInfo = [];
  // this._wholeMap(vertices,edges);
  for(var i = 0 ; i < this.vertex.length ; i++){
    var info = {
      sign : 0,
      depth : 0
    }
    dingInfo[this.vertex[i]] = info;
    for(var j = i+1 ; j < this.vertex.length ; j++){
      var edgeInfo = {
        code : 0,
        edge : [],
        distance : null,
        len : null,
        edgeDetail : []
      }
      edgeInfo.code = (++codeInfo);
      edgeInfo.edge.push(this.vertex[i]);
      edgeInfo.edge.push(this.vertex[j]);
      edgeInfo.distance = this._shortestDistance(this.vertex[i],this.vertex[j]);
      edgeInfo.len = edgeInfo.distance.length;
      res.push(edgeInfo);
    }
  }
  var edgeCode = this._kruskal(res,dingInfo);
  var distanceCode = [];
  var distanceEdgeDetail = [];
  for (var i = 0 ; i < res.length ; i++){
    for(var j = 0 ; j < (res[i].distance.length-1) ; j++){
      var tempEdgeInfo = [];
      tempEdgeInfo.push(res[i].distance[j]);
      tempEdgeInfo.push(res[i].distance[j+1]);
      res[i].edgeDetail[j] = tempEdgeInfo;
    }
  }
  for (var i = 0 ; i < res.length ; i++){
    for(var j = 0 ; j < edgeCode.length ; j++){
      if(edgeCode[j] === res[i].code){
        distanceCode = distanceCode.concat(res[i].distance);
        distanceEdgeDetail = distanceEdgeDetail.concat(res[i].edgeDetail);
      }
    }
  }
  distanceCode = this._unique(distanceCode);
  var resultLink = [];
  var linkHas = {};
  var linkEdgeInfo = [];
  for (var i = 0 ; i < this.links.length ; i++){
    linkHas[this.links[i]] = true;
  }
  for(var i = 0 ; i < distanceCode.length ; i++){
    if(linkHas[distanceCode[i]]){
      resultLink.push(distanceCode[i]);
    }
  }
  for(var i = 0 ; i < resultLink.length ; i++){
    for(var j = i+1 ; j < resultLink.length ; j++){
      if(this.linkJson[resultLink[i]+resultLink[j]] != null){
        distanceCode = distanceCode.concat(this.linkJson[resultLink[i]+resultLink[j]]);
        var tempLinkEdgeInfo = [];
        tempLinkEdgeInfo.push(resultLink[i]);
        tempLinkEdgeInfo = tempLinkEdgeInfo.concat(this.linkJson[resultLink[i]+resultLink[j]]);
        tempLinkEdgeInfo.push(resultLink[j]);
        linkEdgeInfo.push(tempLinkEdgeInfo);
      }
    }
  }
  for(var i = 0 ; i < linkEdgeInfo.length ; i++){
    for(var j = 1 ; j < (linkEdgeInfo[i].length-1) ; j++){
      var templinkEdgeFirst = [];
      var templinkEdgeLast = [];
      templinkEdgeFirst.push(linkEdgeInfo[i][0]);
      templinkEdgeFirst.push(linkEdgeInfo[i][j]);
      templinkEdgeLast.push(linkEdgeInfo[i][j]);
      templinkEdgeLast.push(linkEdgeInfo[i][linkEdgeInfo[i].length-1]);
      distanceEdgeDetail.push(templinkEdgeFirst);
      distanceEdgeDetail.push(templinkEdgeLast);
    }
  }
  distanceCode = this._unique(distanceCode);
  var mapDistanceCodeResult = {
    "distanceCode" : null,
    "distanceEdgeDetail" : null
  }
  mapDistanceCodeResult.distanceCode = distanceCode;
  mapDistanceCodeResult.distanceEdgeDetail = distanceEdgeDetail;
  return mapDistanceCodeResult;
}

MapDistance.prototype._clean = function(){
  this.vertices = [];
  this.edges = [];
  this.vertex = [];
  this.vertexJson = {

  };
  this.linkJson = {

  };
  this.adj = [];
  this.links = [];
}

MapDistance.prototype.caculate = function(mapInfo){
  this._clean();
  var resultInfo = {
    "MapNodes" : null,
    "MapLinks" : null
  }
  var resultMapNodes = [];
  var resultMapLinks = [];
  if(mapInfo.mapInputData.length === 1){
    for(var i = 0 ; i < mapInfo.mapNodes.length ; i++){
      if(mapInfo.mapNodes[i].config.content[0].code === mapInfo.mapInputData[0].code){
        resultMapNodes.push(mapInfo.mapNodes[i]);
        break;
      }
    }
  } else {
    this._expandInfo(mapInfo.mapNodes, mapInfo.mapLinks, mapInfo.mapInputData);
    this._wholeMap();
    var resultMap = this._mapDistanceCode();
    var distanceCodeHas = {};

    var distanceEdgeDetailHas = {};
    for (var i = 0 ; i < resultMap.distanceCode.length ; i++){
      distanceCodeHas[resultMap.distanceCode[i]] = true;
    }
    for(var i = 0 ; i < mapInfo.mapNodes.length ; i++){
      if(distanceCodeHas[mapInfo.mapNodes[i].config.content[0].code] === true){
        distanceCodeHas[mapInfo.mapNodes[i].config.content[0].code] = false;
        resultMapNodes.push(mapInfo.mapNodes[i]);
      }
    }
    for (var i = 0 ; i < resultMap.distanceEdgeDetail.length ; i++){
      distanceEdgeDetailHas[resultMap.distanceEdgeDetail[i][0]+resultMap.distanceEdgeDetail[i][1]] = true;
      distanceEdgeDetailHas[resultMap.distanceEdgeDetail[i][1]+resultMap.distanceEdgeDetail[i][0]] = true;
    }
    for(var i = 0 ; i < mapInfo.mapLinks.length ; i++){
      if(distanceEdgeDetailHas[mapInfo.mapLinks[i].config.source.content[0].code + mapInfo.mapLinks[i].config.target.content[0].code] === true){
        distanceEdgeDetailHas[mapInfo.mapLinks[i].config.source.content[0].code + mapInfo.mapLinks[i].config.target.content[0].code] = false;
        distanceEdgeDetailHas[mapInfo.mapLinks[i].config.target.content[0].code + mapInfo.mapLinks[i].config.source.content[0].code] = false;
        resultMapLinks.push(mapInfo.mapLinks[i]);
      }
    }
  }
  resultInfo.MapNodes = resultMapNodes;
  resultInfo.MapLinks = resultMapLinks;
  return resultInfo;
}

module.exports = new MapDistance();
