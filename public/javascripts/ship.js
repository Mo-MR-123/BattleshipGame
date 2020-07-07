class Ship {
    
    // class fields
    id;
    size;
    startCoordinate;
    endCoordinate;
    // TODO: assign color in shared.js for each ship object (if that is needed)
    color = null;
    // TODO: assign img in shared.js for each ship object (if that is needed)
    img = null;


    // constructor for a ship (shiptype MUST BE FROM shared.js !!)
    constructor (shipType, startCoordinate, endCoordinate, direction) {
        // check if ship type is an object
        console.assert(
            typeof shipType === 'object',
            "%s: Expected object ship type, but got a %s", arguments.callee.name, typeof shipType
        );

        // check if direction is a number and whether it is 0 or 1 
        // (0 and 1 are only valid and allowed numbers for direction!)
        console.assert(
            typeof (direction === 'number' && (direction === 0 || direction === 1)),
            "%s: Expected direction number type, but got a %s with number %d", arguments.callee.name, typeof direction, direction
        );

        this.id = shipType.id;
        this.size = shipType.size;
        this.startCoordinate = startCoordinate;
        this.endCoordinate = endCoordinate;
        this.direction = direction;

        // HERE ASSIGN IMG AND COLOR IF THOSE ARE IMPLEMENTED 
    }

}