// NOTE: shared.js ans ship.js must be included in html before this file for this class to work
'use strict';

/**
 * ShipsGenerator class.
 *
 * @constructor
 * @param {Array} - 2D grid of the current user
 */
function ShipsGenerator(grid) {
    // define the grid columns and rows
    this.gridCols = Setup.GRID_DIM.cols;
    this.gridRows = Setup.GRID_DIM.rows;

    // check if grid has expected amount of rows
    console.assert(
        grid.length === this.gridRows,
        "%s: Got grid rows of %d, but should be %d ", arguments.callee.name, grid.length, this.gridRows
    );

    // check if grid has expected amount of columns on each row
    console.assert(
        grid.every(function(row) {
            return row.length === this.gridCols;
        }),
        "%s: Got grid rows of %d, but should be %d ", arguments.callee.name, grid.length, this.gridCols
    );

    // Grid must be square
    console.assert(
        this.gridRows === this.gridCols,
        "%s: Grid must be square, but got %d rows and %d columns", arguments.callee.name, this.gridRows, this.gridCols
    );

    // create the ships array
    this.ships = [];

    // assign the grid to this shipGenerator object
    this.grid = grid;

    // add all the available ships to the ships array
    this.ships.push(Setup.DESTROYER);
    this.ships.push(Setup.SUBMARINE);
    this.ships.push(Setup.CRUISER);
    this.ships.push(Setup.BATTLESHIP);
    this.ships.push(Setup.CARRIER);
}

/**
 * Get random int between 0 and max.
 * OR 0 or 1 if direction is set to true.
 * NOTE: this method is not needed anymore and is deprecated
 * @deprecated
 * @param {Number} - The max number that Math.random is allowed to generate.
 * @param {Boolean} - if true, use Math.random for geenerating 0 or 1. Otherwise use normal implementation.
 */
ShipsGenerator.prototype.getRandomInt = function(max, randomDirection) {
    if (randomDirection) {
        // generates 0 OR 1 randomly
        return Math.floor(Math.random() * 2);
    } else {
        return Math.floor(Math.random() * Math.floor(max));
    }
}

/**
 * Places each ship in random location on the board/grid.
 * 
 * @param {Array} - The 2D grid array of current user.
 */
ShipsGenerator.prototype.placeShipsRandomly = function(grid) {
    // grid must consist of 0 in all entries
    console.assert(
        grid.every(function(row) {
            return row.every(function(val) {
                return val === 0;
            })
        }),
        "%s: Grid does not contain all 0's", arguments.callee.name
    );

    // go through all ships and place them on the grid on random locations
    for (let s = 0; s < this.ships.length; s++) {
        const currShip = this.ships[s];

        let currShipLocations;
        do {
            currShipLocations = this.generateShipLocations(currShip);
        } while(this.checkCollisions(currShipLocations));

        for (let c = 0; c < grid.length; c++) {
            
        }
        
    }
    
}


/**
 * Generate array of random ship location Coordinates given a ship.
 * 
 * @param {Object} - Ship.
 * @returns - Array of Coordinate objects of randomly generated ship locations.
 */
ShipsGenerator.prototype.generateShipLocations = function(ship) {
        // generate 0 OR 1 to place given ship vertically or horizontally
        const shipID = ship.id;
        const shipSize = ship.size;

        // generates 0 OR 1 randomly
        const direction = Math.floor(Math.random() * 2);
        
        let rowCoord, colCoord;

        // get startCoord and endCoord depending on direction
        if (direction === Setup.HORIZONTAL_DIRECTION) {
            rowCoord = Math.floor(Math.random() * this.gridRows);
            colCoord =  Math.floor(Math.random() * (this.gridCols - shipSize + 1));
        } else {
            rowCoord = Math.floor(Math.random() * (this.gridRows - shipSize + 1));
            colCoord =  Math.floor(Math.random() * this.gridCols);
        }

        let currShipRandomLocations = [];
        for (let i = 0; i < shipSize; i++) {
            if (direction === Setup.HORIZONTAL_DIRECTION) {
                currShipRandomLocations.push(new Coordinate(rowCoord, colCoord + i));
            } else {
                currShipRandomLocations.push(new Coordinate(rowCoord + i, colCoord));
            }
        }

        return currShipRandomLocations;
}


/**
 * Given a ship location array, check whether there are any collision with other ships already on the grid.
 * e.g. Destroyer ship random locations = [Coordinate(5,6), Coordinate(5,5)]
 * 
 * @param {Array} - An array of Coordinate object to indicate the position of each part of given ship.
 * @returns - true if there are no collision, else false.
 */
ShipsGenerator.prototype.checkCollisions = function(shipLocations) {
    // shipLocations must not be empty
    console.assert(
        shipLocations.length === 0,
        "%s: Ship location array must not be empty.", arguments.callee.name
    );

    for (let loc = 0; loc < shipLocations.length; loc++) {
        const currCoordinate = shipLocations[loc];
        if (this.grid[currCoordinate.x][currCoordinate.y] > 0) {
            return false;
        }
    }

    // if loop terminated without returning false means that there were no collisions
    return true;
}