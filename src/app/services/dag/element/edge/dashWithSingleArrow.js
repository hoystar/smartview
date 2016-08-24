"use strict";

var Edge = require("./edge");

var DashWithSingleArrow = Class.create({
    Extends: Edge,
    initialize: function(data) {
        DashWithSingleArrow.superclass.initialize.apply(this, arguments);
        this.hasArrow = true;
    },
    active: function() {
        var lineDom = document.createElementNS("http://www.w3.org/2000/svg", "line");
        var line = d3.select(lineDom);

        line
            .attr("class", "link")
            .attr("id", "line-" + this.config.id)
            .attr("stroke-dasharray", "3,3")
            .attr("marker-end", "url(/smartview#arrow)");

        this.element = lineDom;
        //marker-end="url(/smartview#arrow)" x1="429.356542550606" y1="196.61711123843233"
        this.updatePosition();
    },
    highlight: function() {
        var text = d3.select(this.element);
        text
            .classed("link-focus", true)
            .attr("marker-end", "url(/smartview#arrow-highlight)");
    },
    unHighlight: function() {
        var text = d3.select(this.element);
        text
            .classed("link-focus", false)
            .attr("marker-end", "url(/smartview#arrow)");
    },
});

module.exports = DashWithSingleArrow;
