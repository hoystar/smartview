"use strict";

var Edge = require("./edge");

var FlowEdgeArrow = Class.create({
    Extends: Edge,
    initialize: function(data) {
        FlowEdgeArrow.superclass.initialize.apply(this, arguments);
        this.hasArrow = true;
    },
    active: function() {
        var lineDom = document.createElementNS("http://www.w3.org/2000/svg", "line");
        var line = d3.select(lineDom);

        line
            .attr("class", "link")
            .attr("id", "line-" + this.config.id)
            .attr("marker-end", "url("+window.location.pathname+window.location.search+"#arrow)");

        line.classed("link-weight", true);

        this.hover(line);
        this.attachClickEvent(line);
        this.element = lineDom;
        this.updatePosition();
    },
    hover: function(container) {
        var self = this;
/*        //探索按钮
        if (this.config.detectable) {
            container.append(function() {
            return this._genExploreBtn(container);
            }.bind(this));
        }*/

        container.on("mouseover", function() {
            this.highlight();
            
        }.bind(this));
        container.on("mouseout", function() {
            this.unHighlight();
        }.bind(this))
    },
    highlight: function() {
        var text = d3.select(this.element);
        text.classed("link-focus", true);
        text.attr("marker-end","url("+window.location.pathname+window.location.search+"#arrow-highlight)")
    },
    unHighlight: function() {
        var text = d3.select(this.element);
        text.classed("link-focus", false);
        text.attr("marker-end","url("+window.location.pathname+window.location.search+"#arrow)")
    },
    attachClickEvent: function($dom) {
        $dom.on("click", function() {
            this.showDeleteBtn();
        }.bind(this));
    },
});

module.exports = FlowEdgeArrow;
