import Setup from './shared';

class ShipsGenerator {

    ships = [];

    constructor () {
        this.ships.push(Setup.DESTROYER);
        this.ships.push(Setup.SUBMARINE);
        this.ships.push(Setup.CRUISER);
        this.ships.push(Setup.BATTLESHIP);
        this.ships.push(Setup.CARRIER);
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    // TODO: place ships randomly on the grid 
    generateShipsRandomly(grid) {

    }

}