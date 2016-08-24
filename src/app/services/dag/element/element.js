"use strict";

var Ele = Class.create({
    initialize: function() {
        this.element = null;
    },
    hide: function() {
        d3.select(this.element)
            .attr("hidden", true);
    },
    show: function() {
        d3.select(this.element)
            .attr("hidden", null);
    },
    neighbor: function() {
        throw "This interface is not overloaded";
    },
    updatePosition: function() {
        throw "This interface is not overloaded";
    }
});


module.exports = Ele;
