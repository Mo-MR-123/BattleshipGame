// NOTE: this file must be included in html before any game logic js script inclusion
'use strict';

function Coordinate(x ,y) {
    this.x = x;
    this.y = y;
}

Coordinate.prototype.getX = function() {
    return this.x;
}

Coordinate.prototype.getY = function() {
    return this.y;
}