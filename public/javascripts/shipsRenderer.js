'use strict';

/**
 * ShipsRenderer class.
 *
 * @constructor
 */
function ShipsRenderer() {
    // mapping object from ship_id to their respective color
    this.ships = {
        1: Setup.DESTROYER.color,
        2: Setup.SUBMARINE.color,
        3: Setup.CRUISER.color,
        4: Setup.BATTLESHIP.color,
        5: Setup.CARRIER.color
    };
}

/**
 * Render all ships on the given grid of the current player.
 * @param {Array} grid - 2D grid to draw the ships on
 */
ShipsRenderer.prototype.renderSelfGrid = function (grid) {
    var selfTileClass = 'td.battlefield_cell_self_tile'
    var r, c;
    for (r = 0; r < grid.length; r++) {
        for (c = 0; c < grid[r].length; c++) {
            var currTileId = grid[r][c];
            if (currTileId > 0) {
                var currShipColor = this.ships[currTileId]
                var tileToColor = $(selfTileClass + "[data-x='" + c + "', data-y='" + r + "']")
                
                // color the tile corresponding to the ship id with corresponding color
                tileToColor.css("background-color", currShipColor)
            }
        }
    }
}

// TODO: 
ShipsRenderer.prototype.renderTileHit = function (grid) {

}

// TODO: 
ShipsRenderer.prototype.renderTileMiss = function (grid) {

}