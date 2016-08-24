"use strict";

var Edge = require("./edge");

var DashWithDoubleArrow = Class.create({
    Extends: Edge,
    initialize: function(data) {
        DashWithDoubleArrow.superclass.initialize.apply(this, arguments);
    },
    active: function() {
        var lineDom = document.createElementNS("http://www.w3.org/2000/svg", "line");
        var line = d3.select(lineDom);

        line
            .attr("class", "link")
            .attr("id", "line-" + this.config.id)
            .attr("stroke-dasharray", "3,3")
            .attr("marker-start", "url(/smartview#arrow)")
            .attr("marker-end", "url(/smartview#arrow)");


        this.element = lineDom;

        this.updatePosition();
    }
});

module.exports = DashWithDoubleArrow;
