"use strict";

import Layout from "../dag/layout";

let HttpRequest = require("../httpCenter/request");

function TopicDag(option) {
  this.canvasId = option.canvasId;
  this._init(option);
}

TopicDag.prototype._init = function(option) {
  this._layout = new Layout(option);
  // layout._testTopicDraw(data1);
}

TopicDag.prototype.draw = function() {
  this.getData().then((data) => {
    // this._draw(data);
    // console.log(data);
    this._layout.topicDraw(data);
  }.bind(this))
}

TopicDag.prototype.getData = function() {
  return HttpRequest.GetFolderLoad({
    folderId: this.canvasId
  }).then(function(data) {
    return this._dealWithData(data);
  }.bind(this));
}

TopicDag.prototype._dealWithData = function(data) {
  let vertexs = data.vertexs.map((item) => ({
    content: [{
      code: item.objectId,
      name: item.name,
      domainType: 6
    }],
    identifier: item.identifier,
    type: 6
  }));
  let edges = data.edges.map((item) => {
    item.type = 1;
    return item;
  });
  return {
    vertexs: vertexs,
    edges: edges
  }
}

export default TopicDag;
