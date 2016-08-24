"use strict";

var Element = require("../element");
var EventEmitter = require("wolfy87-eventemitter");
let EVENTS = require("../../../events");
let TYPE = require("../../nodeViewType");

var HttpRequest = require("../../../httpCenter/request");

var Node = Class.create({
  Extends: Element,
  Implements: EventEmitter,
  MENUDATA: [{
    name: "删除节点",
    type: "DEL"
  }, {
    name: "实体详情",
    type: "ENTITY_DETAIL"
  }, {
    name: "关系详情",
    type: "LINK_DETAIL"
  }],
  initialize: function(data) {
    Node.superclass.initialize.apply(this, arguments);
    this.config = data;
    //默认全部打开
    this.isShowPie = true;
    this.isPieOpen = false;
    this.isFocus = false;
    this.isHide = false;
    this.isExploring = false;
    this.hasExplore = false;
    this.exploreNodeIds = [];
    this.exploreLinkIds = [];
    this.isExplored = false;
    this.isShowCtxMenu = true;
    this.tagData = null;

    if (!this.config.nameChain) {
      this.config.nameChain = [];
    }
  },
  changeView: function(viewType) {
    if (viewType === 0) {
      this.config.x = this.config.x1;
      this.config.y = this.config.y1;
      if (this.config.showType === TYPE.SHOW_IN_FLOWVIEW) {
        this.hide();
      } else {
        this.show();
      }
    } else {
      this.config.x = this.config.x2;
      this.config.y = this.config.y2;
      if (this.config.type !== 2) {
        this.hide();
      }
      if (this.config.showType === TYPE.SHOW_IN_NEXUSVIEW) {
        this.hide();
      } else if (this.config.showType === TYPE.SHOW_IN_FLOWVIEW) {
        this.show();
      }
    }
  },
  isExploreLeaf: function(){
    return (this.exploreNodeIds.length+this.exploreLinkIds.length)===0;
  },

  active: function() {
    throw "This interface is not overloaded";
  },
  attachAnnularEvent: function($dom) {
    if (this.isShowPie) {
      $dom.on("click", function() {
        if (d3.event.defaultPrevented) return;
        this.getTag().then((data) => {
          this.showAnnular(data, this.config.id, this.config.x, this.config.y);
        });
      }.bind(this));
    }
  },
  _detectDept: function(data) {
    let maxDept = 0;
    let queue = [{
      id: -1,
      name: "null",
      dept: 0,
      children: data
    }];
    while (queue.length !== 0) {
      let obj = queue.shift();
      if (obj.children && obj.children.length > 0) {
        maxDept = Math.max(maxDept, obj.dept + 1);
        obj.children.forEach((item) => {
          item.dept = obj.dept + 1;
          item.parent = obj;
          queue.push(item);
        });
      }
    }
    return maxDept;
  },
  showAnnular: function(data, nodeId, centerX, centerY) {
    if (!this.isShowPie) return;

    var result = [];

    if (data === undefined || data.length <= 0)
      return;

    let nodeData = this._genAnnularData({
      data: data || [],
      nodeId: nodeId,
      centerX: centerX,
      centerY: centerY,
      insideR: 55,
      outsideR: 105,
      radius: 60
    });

    var objectDom = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
    var object = d3.select(objectDom)
      .attr("class", "explore-btn-object")
      .attr("transform", "translate(" + (this.config.x - 8) + "," + (this.config.y + 20) + ")");
    object
      .append("xhtml:div")
      .attr("class", "close-container")
      .append(function() {

        var icon = $("<i class='iconfont annular-close-btn'>&#xe607;</i>");

        icon.click(function() {
          this.isPieOpen = false;
          this.emitEvent(EVENTS.REMOVE_ANNULAR);
        }.bind(this));

        return icon[0];
      }.bind(this));

    var result = {
      data: nodeData,
      close: objectDom
    }
    if (this.isPieOpen) {
      this.isPieOpen = false;
      this.emitEvent(EVENTS.REMOVE_ANNULAR);
    } else {
      this.isPieOpen = true;
      this.emitEvent(EVENTS.ADD_ANNULAR, [result]);
    }
  },
  _genAnnularData: function(option) {
    let result = [];
    let data = option.data;
    let nodeId = option.nodeId;
    let centerX = option.centerX || 0;
    let centerY = option.centerY || 0;
    let outsideR = option.outsideR || 105;
    let insideR = option.insideR || 55;
    let radius = option.radius || 60;
    let startRadius = option.startRadius || 0;

    if (!data) {
      return [];
    }

    for (let i = 0; i < data.length; i++) {
      let startX = centerX + Math.cos((startRadius + i * radius) / 180 * Math.PI) * outsideR;
      let startY = centerY + Math.sin((startRadius + i * radius) / 180 * Math.PI) * outsideR;
      let endX = centerX + Math.cos((startRadius + (i + 1) * radius) / 180 * Math.PI) * outsideR;
      let endY = centerY + Math.sin((startRadius + (i + 1) * radius) / 180 * Math.PI) * outsideR;
      let startX2 = centerX + Math.cos((startRadius + (i + 1) * radius) / 180 * Math.PI) * insideR;
      let startY2 = centerY + Math.sin((startRadius + (i + 1) * radius) / 180 * Math.PI) * insideR;
      let endX2 = centerX + Math.cos((startRadius + i * radius) / 180 * Math.PI) * insideR;
      let endY2 = centerY + Math.sin((startRadius + i * radius) / 180 * Math.PI) * insideR;
      let textX = centerX + Math.cos(((2 * i + 1) * 60 / 2 + startRadius) / 180 * Math.PI) * (insideR + outsideR) / 2 - 24;
      let textY = centerY + Math.sin(((2 * i + 1) * 60 / 2 + startRadius) / 180 * Math.PI) * (insideR + outsideR) / 2 + 5;

      let cmd = [
        "M", startX, startY,
        //A的属性：x的半径，y的半径，旋转角度，大弧还是小弧，顺时针还是逆时针，结束为坐标(X,Y)
        "A", outsideR, outsideR, 0, 0, 1, endX, endY,
        "L", startX2, startY2,
        "A", insideR, insideR, 0, 0, 0, endX2, endY2
      ];

      result.push({
        d: cmd.join(" "),
        id: data[i].id,
        nameChain: this.config.nameChain.concat([data[i].name]),
        text: data[i].name.length > 4 ? (data[i].name.substring(0, 4) + "..") : data[i].name,
        data: data[i],
        centerNodeId: nodeId,
        centerX: centerX,
        centerY: centerY,
        insideR: insideR,
        outsideR: outsideR,
        textX: textX,
        textY: textY
      })
    }

    return result;
  },
  _genExploreBtn: function(container) {
    var x = this.config.width;
    var y = this.config.height / 2 - 11;

    var object = container
      .append("foreignObject")
      .attr("class", "explore-btn-object")
      .attr("transform", "translate(" + -8 + "," + y + ")");

    object
      .append("xhtml:div")
      .attr("class", "node-container")
      .append(function() {

        var icon = $("<i class='iconfont'>&#xe60f;</i>");

        return icon[0];
      }.bind(this))
      .on("click", function() {
        this.explore();
      }.bind(this));

    return object[0][0];
  },
  hideExploreBtn: function() {
    $(this.element).find(".explore-btn-object").css("display", "none");
  },
  showExploreBtn: function() {
    $(this.element).find(".explore-btn-object").css("display", "inherit");
  },
  _genTagIcon: function(container) {
    var x = this.config.width - 4;
    var y = this.config.height / 2 - 7;
    var object = container
      .append("foreignObject")
      .attr("class", "tag-btn-object")
      .attr("transform", "translate(" + x + "," + y + ") scale(0.75)");

    object
      .append("xhtml:div")
      .attr("class", "info-container")
      .append(function() {

        var icon = $("<i class='iconfont'>&#xe62f;</i>");

        return icon[0];
      }.bind(this));
    return object[0][0];
  },
  _genCtxMenu: function(container) {
    var data = this.menuData.map(function(item) {
      for (let i = 0; i < this.MENUDATA.length; i++) {
        if (item === this.MENUDATA[i].type) {
          return $.extend(true, {}, this.MENUDATA[i], {
            nodeId: this.config.id,
            code: this.config.content[0].code
          })
        }
      }
    }.bind(this));

    if (this.isShowCtxMenu) {
      d3.select(container).on("contextmenu.node", function(event) {
        d3.event.preventDefault();
        this.emitEvent(EVENTS.SHOW_CXTMENU, [{
          nodeId: this.config.id,
          x: d3.event.layerX,
          y: d3.event.layerY,
          data: data
        }]);
      }.bind(this));
    }

  },
  explore: function() {
    var result = {
      id: this.config.id,
      exploreNodeIds: this.exploreNodeIds,
      exploreLinkIds: this.exploreLinkIds,
      hasExplore: this.hasExplore
    }
    this.isExploring = true;
    this.emitEvent(EVENTS.EXPLORE_NODE, [result]);
  },
  unExplore: function() {
    this.isExploring = false;
    this.emitEvent(EVENTS.UNEXPLORE_NODE, [this.config.id]);
    this.setUnExploreBtn();
  },
  setUnExploreBtn: function(){
    var btnContainer = d3.select(this.element)
      .select(".node-container");

    btnContainer.select("i").remove();
    btnContainer.append(function() {

      var icon = $("<i class='iconfont'>&#xe60f;</i>");

      icon.click(function() {
        this.explore();
      }.bind(this));

      return icon[0];
    }.bind(this));
  },
  afterExplore: function(result) {

    this.hasExplore = true;
    this.config.critical = true;
    if (result) {
      this.exploreNodeIds = result.nodes.map(function(item) {
        return item.id;
      });
      this.exploreLinkIds = result.links.map(function(item) {
        return item.id;
      });
    }

    var btnContainer = d3.select(this.element)
      .select(".node-container");

    if (this.exploreNodeIds.length === 0 && this.exploreLinkIds.length === 0) {
      //假如没有结果直接把icon隐藏
      btnContainer.attr("hidden", true);
    } else {
      //假如有结果把icon替换
      btnContainer.select("i").remove();
      btnContainer.append(function() {

        var icon = $("<i class='iconfont'>&#xe60e;</i>");

        icon.click(function() {
          this.unExplore();
        }.bind(this));

        return icon[0];
      }.bind(this));
    }

  },
  getExploreData: function() {
    return {
      id: this.config.id,
      exploreNodeIds: this.exploreNodeIds,
      exploreLinkIds: this.exploreLinkIds
    }
  },
  remove: function() {
    if (this.isPieOpen) {
      this.emitEvent(EVENTS.REMOVE_ANNULAR);
    }
    this.emitEvent(EVENTS.REMOVE_NODE, [
      [this.config.id]
    ]);
  },
  focus: function() {
    if (this.isFocus) {
      return;
    }
    this.isFocus = true;
    this.emitEvent(EVENTS.FOCUS_NODE, [
      [this.config.id]
    ]);
  },
  unFocus: function() {
    if (!this.isFocus) {
      return;
    }
    this.isFocus = false;
    this.emitEvent(EVENTS.UNFOCUS_NODE, [
      [this.config.id]
    ]);
  },
  highlight: function() {
    var node = d3.select(this.element);
    node.classed('node-focus', true);
  },
  unHighlight: function() {
    var node = d3.select(this.element);
    node.classed('node-focus', false);
  },
  closeExploreNodes: function() {
    this.emitEvent(EVENTS.CLOSE_EXPLORENODE, [
      [this.config.id]
    ]);
  },
  getTag: function() {
    if (this.config.content[0].tagCount === 0) {
      return Promise.resolve([]);
    }

    if (this.tagData) {
      return Promise.resolve(this.tagData);
    } else {
      return HttpRequest.getTag({
        domainCode: this.config.content[0].code
      });
    }
  },
  updatePosition: function() {
    throw "This interface is not overloaded";
  },
  unRelateRect: function() {
    d3
      .select(this.element)
      .classed('node-dash', true);
  },
  relateRect: function() {
    d3
      .select(this.element)
      .classed('node-dash', false);
  },
  attachRecommentEvent: function($dom) {
    $dom.on("click", function() {
      if (d3.event.defaultPrevented) return;
      this.emitEvent(EVENTS.ENTITY_RECOMMENT_MODAL, [this]);
    }.bind(this));
  },
  changeColor: function(color) {
    var node = d3.select(this.element)
      .style("fill", color);
  },
  destroy: function() {

  }
});

module.exports = Node;
