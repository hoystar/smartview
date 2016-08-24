"use strict";

function Concat() {

}

Concat.prototype.tranform = function(source, target, type, extra) {
  if (!target.config.isTree && !source.config.isTree) {
    return this._single2Single(target, source, type, extra);
  } else if (!target.config.isTree && source.config.isTree) {
    return this._single2Mutiply(target, source, type, extra);
  } else if (target.config.isTree && !source.config.isTree) {
    return this._single2Mutiply(source, target, type, extra);
  } else if (target.config.isTree && source.config.isTree, type) {
    return this._mutiply2Mutiply(source, target, type, extra);
  }
}

Concat.prototype._single2Single = function(source, target, type) {
  let resultNode = {
    addNode: {
      id: source.config.id + "__" + target.config.id,
      type: 2,
      name: type,
      funcType: type,
      children: [source, target],
      isTree: true,
      isLeaf: false,
      isRoot: true
    },
    addLinks: [{
      id: source.config.id + "__" + target.config.id + "__" + source.config.id,
      source: source.config.id + "__" + target.config.id,
      target: source.config.id
    }, {
      id: source.config.id + "__" + target.config.id + "__" + target.config.id,
      source: source.config.id + "__" + target.config.id,
      target: target.config.id
    }]
  };
  if (!source.config.isRoot && source.config.isLeaf && source.config.isTree) {
    resultNode.addNode.isRoot = false;
  }
  if (!target.config.isRoot && target.config.isLeaf && target.config.isTree) {
    resultNode.addNode.isRoot = false;
  }
  source.config.isTree = target.config.isTree = true;
  source.config.isRoot = target.config.isRoot = false;
  if (!source.config.children || source.config.children.length === 0) {
    source.config.isLeaf = true;
  }
  if (!target.config.children || target.config.children.length === 0) {
    target.config.isLeaf = true;
  }
  source.config.parentId = target.config.parentId = source.config.id + "__" + target.config.id;
  return resultNode;
}


Concat.prototype._single2Mutiply = function(singleNode, treeNode, type, extra) {
  if (treeNode.config.isRoot) {
    if (treeNode.config.funcType === type) {
      singleNode.config.isLeaf = true;
      singleNode.config.isTree = true;
      singleNode.config.isRoot = false;
      treeNode.config.children.push(singleNode);
      singleNode.config.parentId = treeNode.config.id;
      return {
        addNode: null,
        addLinks: [{
          id: treeNode.config.id + "__" + singleNode.config.id,
          source: treeNode.config.id,
          target: singleNode.config.id
        }],
        updateNodeId: treeNode.config.id
      };
    } else {
      return this._single2Single(singleNode, treeNode, type);
    }
  }
  if (treeNode.config.isLeaf) {
    if (treeNode.config.funcType === type) {
      return this._single2Single(singleNode, treeNode, type);
    } else {
      let parentNode = extra.findNode(treeNode.config.parentId);
      let newNode = this._single2Single(singleNode, treeNode, type);
      newNode.addLinks.push({
        id: parentNode.config.id + "__" + newNode.addNode.id,
        source: parentNode.config.id,
        target: newNode.addNode.id
      });
      newNode.delLinks = [(parentNode.config.id + "__" + treeNode.config.id)];
      newNode.addNode.parentId = parentNode.config.id;
      newNode.cb = function(_circle) {
        let _childIndex = parentNode.config.children.indexOf(treeNode);
        parentNode.config.children.splice(_childIndex, 1);
        parentNode.config.children.push(_circle);
      }
      return newNode;
    }
  }
}

Concat.prototype._mutiply2Mutiply = function(source, target, type, extra) {
  if (source.config.isRoot && target.config.isRoot) {
    return this._single2Single(source, target, type);
  } else if ((source.config.isRoot && target.config.isLeaf) || (source.config.isLeaf && target.config.isRoot)) {
    let rootNode = source.config.isRoot ? source : target;
    let leafNode = source.config.isLeaf ? source : target;

    let parentNode = extra.findNode(leafNode.config.parentId);
    let newNode = this._single2Single(rootNode, leafNode, type);

    newNode.addLinks.push({
      id: parentNode.config.id + "__" + newNode.addNode.id,
      source: parentNode.config.id,
      target: newNode.addNode.id
    });
    newNode.delLinks = [(parentNode.config.id + "__" + leafNode.config.id)];
    newNode.addNode.parentId = parentNode.config.id;
    newNode.cb = function(_circle) {
      let _childIndex = parentNode.config.children.indexOf(leafNode);
      parentNode.config.children.splice(_childIndex, 1);
      parentNode.config.children.push(_circle);
    }
    return newNode;
  }
}

module.exports = new Concat();