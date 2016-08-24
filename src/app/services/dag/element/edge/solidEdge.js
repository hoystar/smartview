"use strict";

var Edge = require("./edge");

var SolidEdge = Class.create({
    Extends: Edge,
    initialize: function(data) {
        SolidEdge.superclass.initialize.apply(this, arguments);
    },
    active: function() {

        var lineDom = document.createElementNS("http://www.w3.org/2000/svg", "line");
        var line = d3.select(lineDom);

        line
            .attr("class", "link")
            .attr("id", "line-" + this.config.id);

        this.element = lineDom;

        this.updatePosition();
    }
});

module.exports = SolidEdge;
