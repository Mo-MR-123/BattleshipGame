// NOTE: shared.js ans ship.js must be included in html before this file for this class to work

/**
 * ShipsGenerator class.
 *
 * @constructor
 */
function ShipsGenerator() {
    // create the ships array
    this.ships = [];

    // define the grid columns and rows
    this.gridCols = Setup.GRID_DIM.cols;
    this.gridRows = Setup.GRID_DIM.rows;

    // add all the available ships to the ships array
    this.ships.push(Setup.DESTROYER);
    this.ships.push(Setup.SUBMARINE);
    this.ships.push(Setup.CRUISER);
    this.ships.push(Setup.BATTLESHIP);
    this.ships.push(Setup.CARRIER);

    // Number of ships to be generated
    this.numShips = this.ships.length;
}

/**
 * Get random int between 0 and max.
 * OR 0 or 1 if direction is set to true.
 *
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
 * TODO: 
 * @param {Array} - The 2D grid array of current user.
 */
ShipsGenerator.prototype.generateShipsRandomly = function(grid) {
    // grid must consist of 0 in all entries
    console.assert(
        grid.every(function(row) {
            return row.every(function(val) {
                return val === 0;
            })
        }),
        "%s: Grid does not contain all 0's", arguments.callee.name
    );

    this.ships.forEach(ship => {
        // generate 0 OR 1 to place given ship vertically or horizontally
        const direction = this.getRandomInt(null, true);
        let startCoord, endCoord;
        
        // get startCoord and endCoord depending on direction
        if (direction === Setup.HORIZONTAL_DIRECTION) {
            //TODO: 
        } else {
            //TODO: 
        }
    })
    
}