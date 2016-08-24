"use strict";

var Rect = require("./node/rect");
var Diamond = require("./node/diamond");
var Annular = require("./node/annular");

import Ellipse from "./node/ellipse";
import Circle from "./node/circle";
import Topic from "./node/topic";


var TYPE = {
    Rect: 1,
    Diamond: 2,
    Annular: 4,
    Circle: 5,
    Topic: 6,
    Ellipse: 7
}

module.exports = function(data) {
    switch (data.type) {
        case TYPE.Rect:
            return new Rect(data);
        case TYPE.Diamond:
            return new Diamond(data);
        case TYPE.Annular:
            return new Annular(data);
        case TYPE.Circle:
            return new Circle(data);
        case TYPE.Topic:
            return new Topic(data);
        case TYPE.Ellipse:
            return new Ellipse(data);
        default:
            return new Diamond(data);
    }
}
