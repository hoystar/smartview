"use strict";

var Node = require("./node");

let EVENTS = require("../../../events");

var Diamond = Class.create({
  Extends: Node,
  menuData: [{
    name: "删除节点",
    type: "DEL"
  }],
  initialize: function(data) {
    Diamond.superclass.initialize.apply(this, arguments);

    this.isShowDetailCircle = false;
    this.isDrawFlow = true;
    this.config.width = this.config.width || 60;
    this.config.height = this.config.height || 40;
  },
  active: function() {

    var containerDom = document.createElementNS("http://www.w3.org/2000/svg", "g");
    var container = d3.select(containerDom);

    container
      .attr("class", "node")
      .attr("id", "node-" + this.config.id);

    var polygon = container
      .append("polygon")
      .attr("class", "diamond");

    let _tmpName = "";
    if (this.config.content[0].name.length > 4) {
      _tmpName = this.config.content[0].name.substr(0, 5) + "..";
    } else {
      _tmpName = this.config.content[0].name;
    }
    let diamondText = this.config.content.length > 1 ? ("关系" + "(" + this.config.content.length + ")") : _tmpName;

    var label = container
      .append("text")
      .attr("class", "label")
      .text(diamondText)
      .attr("transform", function() {
        var x = this.config.width / 2;
        var y = (this.config.height - 14);
        return "translate(" + x + "," + y + ")";
      }.bind(this));

    var title = container
      .append("title")
      .text(this.config.name);

    if (this.config.content.length > 1) {
      this.showDetailCircle(polygon);
    } else {
      this.attachFlowEvent(polygon);
      if (!!this.config.content[0].tagCount) {
        this._genTagIcon(container);
      }
    }

    this.element = containerDom;

    if (this.config.content.length === 1) {
      this.menuData = ["DEL", "LINK_DETAIL"];
    } else {
      this.menuData = ["DEL"];
    }

    this._genCtxMenu(containerDom);

    this.updatePosition();

    this.hover(container);

    if (this.config.content[0].recType === 2 || this.config.content[0].recType === 3) {
      this.attachRecommentEvent(polygon);
      this.unRelateRect();
    }
  },
  updateContent:function(){
    if(this.config.content && this.config.content.length > 0){
      let _tmpName = "";
      if (this.config.content[0].name.length > 4) {
        _tmpName = this.config.content[0].name.substr(0, 5) + "..";
      } else {
        _tmpName = this.config.content[0].name;
      }
      let diamondText = this.config.content.length > 1 ? ("关系" + "(" + this.config.content.length + ")") : _tmpName;
      d3.select(this.element).select("text").text(diamondText);
    }
  },  
  attachFlowEvent: function($dom) {
    if (this.isDrawFlow) {
      $dom.on("click", function() {
        if (d3.event.defaultPrevented) return;
        this.emitEvent(EVENTS.ADD_FLOW, [this]);
        this.getTag().then((data) => {
          this.showAnnular(data, this.config.id, this.config.x, this.config.y);
        });
      }.bind(this));
    }
  },
  hover: function(container) {
    //探索按钮
    if (true) {
      container.append(function() {
        return this._genExploreBtn(container);
      }.bind(this));
    }

    container.on("mouseover", function() {
      this.focus();
    }.bind(this));
    container.on("mouseout", function() {
      this.unFocus();
    }.bind(this))
  },
  updatePosition: function() {
    var x = this.config.x || this.config.x1;
    var y = this.config.y || this.config.y1;
    var w = this.config.width || 60;
    var h = this.config.height || 40;
    var container = d3.select(this.element);
    container.attr("transform", function() {
      return "translate(" + (x - w / 2) + "," + (y - h / 2) + ")";
    });

    var _x = 0 - w / 2 + 20;
    var _y = 0 - h / 2 + 10;
    container
      .select("polygon")
      .attr("points", [_x, _y + 30, _x + 40, _y, _x + 80, _y + 30, _x + 40, _y + 60].join(","));

  },
  showDetailCircle: function($dom) {
    $dom.on("click", function() {
      if (d3.event.defaultPrevented) return;
      let contents = this.config.content;

      if (this.isShowDetailCircle) {
        let nodeIds = contents.map(function(item) {
          return "diamondDetail_"+item.code;
        });
        this.emitEvent(EVENTS.REMOVE_DOMAINDETIAL, [
          nodeIds
        ]);
      } else {
        let radius = 120 / (contents.length - 1);
        let R = 60;
        let result = [];
        for (let i = 0; i < contents.length; i++) {
          var pos_x = this.config.x + Math.cos((radius * i - 60) / 180 * Math.PI) * R + 40;
          var pos_y = this.config.y + Math.sin((radius * i - 60) / 180 * Math.PI) * R
          result.push({
            x: pos_x,
            y: pos_y,
            x1:pos_x,
            y1:pos_y,
            x2:pos_x,
            y2:pos_y,
            type: 7, //圆形
            content: [contents[i]]
          })
        }
        this.emitEvent(EVENTS.SHOW_DETAILCIRCLE, [{
          nodeId: this.config.id,
          nodes: result
        }]);
      }

      this.isShowDetailCircle = !this.isShowDetailCircle;
    }.bind(this));
  },
  changeColor: function(color) {
    var node = d3.select(this.element)
      .select("polygon")
      .style("fill", color);
  },
  highlight: function() {
    var node = d3.select(this.element)
      .select("polygon")
      .classed('diamond-focus', true);
  },
  unHighlight: function() {
    var node = d3.select(this.element)
      .select("polygon")
      .classed('diamond-focus', false);
  }
})

module.exports = Diamond;
