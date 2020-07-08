const shared = require('./public/javascripts/shared');
const messages = require('./public/javascripts/messages');
const lodashClonedeep = require("lodash.clonedeep");

/* every game has two players, identified by their WebSocket */
// constructor for the game object
var game = function (gameID) {
    this.id = gameID;

    // NOTE: Client must be player A or player B but not both and not none
    // this.playerA and this.playerB must be assigned to the websocket of the client of either player A or B
    this.playerA = null;
    this.playerB = null;

    // deep clone all ships needed for the game for both players
    // NOTE: ships must be pushed in this order to be able to fetch them by their id !!
    this.shipsPlayerA = [];
    this.shipsPlayerA.push(lodashClonedeep(shared.DESTROYER));
    this.shipsPlayerA.push(lodashClonedeep(shared.SUBMARINE));
    this.shipsPlayerA.push(lodashClonedeep(shared.CRUISER));
    this.shipsPlayerA.push(lodashClonedeep(shared.BATTLESHIP));
    this.shipsPlayerA.push(lodashClonedeep(shared.CARRIER));

    this.shipsPlayerB = [];
    this.shipsPlayerB.push(lodashClonedeep(shared.DESTROYER));
    this.shipsPlayerB.push(lodashClonedeep(shared.SUBMARINE));
    this.shipsPlayerB.push(lodashClonedeep(shared.CRUISER));
    this.shipsPlayerB.push(lodashClonedeep(shared.BATTLESHIP));
    this.shipsPlayerB.push(lodashClonedeep(shared.CARRIER));

    this.gridRows = shared.GRID_DIM.rows;
    this.gridCols = shared.GRID_DIM.cols;
    this.playerAGrid = null;
    this.playerBGrid = null;
    this.playerAHitCounter = 0;
    this.playerBHitCounter = 0;

    // randomly select who begins with shooting
    this.playerTurn = ((Math.floor(Math.random() * 2)) === 0) ? "A" : "B";
    
    this.gameState = "0 JOINED"; //"A" means A won, "B" means B won, "ABORTED" means the game was aborted
};

// game can be started when both players grid is set
game.prototype.isGameStarted = function() {
    return this.playerAGrid && this.playerBGrid;
}

// setter for player A grid
game.prototype.setPlayerAGrid = function(playerAGrid) {
    this.playerAGrid = playerAGrid;
}

// setter for player B grid
game.prototype.setPlayerBGrid = function(playerBGrid) {
    this.playerBGrid = playerBGrid;
}

// function to create board
game.prototype.createGrid = function(width=this.gridRows, height=this.gridCols) {
    // create row
    let column = new Array(width);
    for (let k = 0; k < width; k++) {
        column[k] = 0;
    }

    // add rows to grid
    let grid = [];
    for (let c = 0; c < height; c++) {
        grid.push(column);
    }

    return grid;
}

// check if ships don't overlap and whether all ships have been placed on the grid
// also check whether ships are out of bounds
// game.prototype.isValidGrid = function(grid) {
//     // check if ships is an array of ships
//     console.assert(
//         Array.isArray(this.ships),
//         "%s: Expecting an Array of ships, got a %s", arguments.callee.name, typeof this.ships
//     );

//     // check if grid is an array object
//     console.assert(
//         Array.isArray(grid),
//         "%s: Expecting the grid to be an Array object, got a %s", arguments.callee.name, typeof grid
//     );

//     // check if grid is a 2d grid with correct column dimensions
//     console.assert(
//         grid.every(function (row) {
//             return Array.isArray(row) && row.length === this.gridCols;
//         }),
//         "%s: Expecting the grid to be an Array object, got a %s", arguments.callee.name, typeof grid
//     );

//     let counterShips = 0;
//     let shipOutOfBound = false;

//     this.ships.forEach(ship => {
//         // TODO: 
//     })

//     for(let i = 0; i < grid.length; i++){
//         for(let j = 0 ; j < grid[i].length; j++){
//             if (grid[i][j] > 0) {
//                 counterShips += 1
//             }
//         }
//     }
    
//     return (counterShips === shared.AMOUNT_HITS_WIN ? true : false);
// }

// TODO: handle game state transition and validation of those states
// TODO: refactor this method to be simpler
game.prototype.tileFired = function(coordinate, playerAShot) {
    console.log(coordinate);
    try {
        const x = coordinate.x;
        const y = coordinate.y;

        let msgResult = null;

        if (playerAShot) {
            const id = this.playerBGrid[x][y];

            if (id === 0) {

                // player A missed
                msgResult = lodashClonedeep(messages.TILE_MISS);
                msgResult.data = "A"; 

            } else if (id > 0) {

                // player A hit a ship on grid of player B
                // increment hits of the hit ship and player A hit counter by 1
                const shipHit = this.shipsPlayerB[id - 1];
                this.playerAHitCounter++;
                shipHit.hits++;

                // check if the hit ship sank because of this hit
                if (shipHit.hits === shipHit.size) {
                    msgResult = lodashClonedeep(messages.TILE_HIT_SINK);
                    msgResult.data = { player: "A", ship: shipHit.name, shipId: id };
                } else {
                    msgResult = lodashClonedeep(messages.TILE_HIT);
                    msgResult.data = "A";
                }

                // check if player A won
                if (this.playerAHitCounter === shared.AMOUNT_HITS_WIN) {
                    msgResult = lodashClonedeep(messages.GAME_WON_BY);
                    msgResult.data = "A";
                    this.setStatus("A");
                }

            }

            // set ship part on x and y to -1, so that it can not be hit anymore
            this.playerBGrid[x][y] = -1;

        } else {

            const id = this.playerAGrid[x][y];

            if (id === 0) {

                // player B missed
                msgResult = lodashClonedeep(messages.TILE_MISS);
                msgResult.data = "B"; 

            } else if (id > 0) {

                // player B hit a ship on grid of player A,
                // increment hits of the hit ship and player B hit counter by 1
                const shipHit = this.shipsPlayerA[id - 1];
                this.playerBHitCounter++;
                shipHit.hits++;

                // check if the hit ship sank because of this hit
                if (shipHit.hits === shipHit.size) {
                    msgResult = lodashClonedeep(messages.TILE_HIT_SINK);
                    msgResult.data = { player: "B", ship: shipHit.name, shipId: id };
                } else {
                    msgResult = lodashClonedeep(messages.TILE_HIT);
                    msgResult.data = "B";
                }

                // check if player B won
                if (this.playerBHitCounter === shared.AMOUNT_HITS_WIN) {
                    msgResult = lodashClonedeep(messages.GAME_WON_BY);
                    msgResult.data = "B";
                    this.setStatus("B");
                }

            }

            // set ship part on x and y to -1, so that it can not be hit anymore
            this.playerAGrid[x][y] = -1;
        }

        return msgResult;

    } catch (e) {
        console.log(e);
    }
}

//different states of the game
game.prototype.transitionStates = {};
game.prototype.transitionStates["0 JOINED"] = 0;
game.prototype.transitionStates["1 JOINED"] = 1;
game.prototype.transitionStates["2 JOINED"] = 2;
game.prototype.transitionStates["TILE SHOT"] = 3;
game.prototype.transitionStates["A"] = 4; //A won
game.prototype.transitionStates["B"] = 5; //B won
game.prototype.transitionStates["ABORTED"] = 6;

/*
 * Not all game states can be transformed into each other;
 * the matrix contains the valid transitions.
 * They are checked each time a state change is attempted.
 */ 
game.prototype.transitionMatrix = [
    [0, 1, 0, 0, 0, 0, 0],   //0 JOINED
    [1, 0, 1, 0, 0, 0, 0],   //1 JOINED
    [0, 0, 0, 1, 0, 0, 1],   //2 JOINED (note: once we have two players, there is no way back!)
    [0, 0, 0, 1, 1, 1, 1],   //TILE SHOT
    [0, 0, 0, 0, 0, 0, 0],   //A WON
    [0, 0, 0, 0, 0, 0, 0],   //B WON
    [0, 0, 0, 0, 0, 0, 0]    //ABORTED
];

game.prototype.isValidTransition = function (from, to) {
    
    //checking for the validation of a transition
    console.assert(typeof from == "string", "%s: Expecting a string, got a %s", arguments.callee.name, typeof from);
    console.assert(typeof to == "string", "%s: Expecting a string, got a %s", arguments.callee.name, typeof to);
    console.assert( from in game.prototype.transitionStates == true, "%s: Expecting %s to be a valid transition state", arguments.callee.name, from);
    console.assert( to in game.prototype.transitionStates == true, "%s: Expecting %s to be a valid transition state", arguments.callee.name, to);


    let i, j;
    //checking whether the transition 'from' is in one of our transitionStates
    if (! (from in game.prototype.transitionStates)) {
        return false;
    }
    else {
        i = game.prototype.transitionStates[from];
    }

    if (!(to in game.prototype.transitionStates)) {
        return false;
    }
    else {
        j = game.prototype.transitionStates[to];
    }

    return (game.prototype.transitionMatrix[i][j] > 0);
};

//return boolean value. if true, then transitionState is valid. If false, then transitionState is invalid.
game.prototype.isValidState = function (s) {
    return (s in game.prototype.transitionStates);
};

//setting a new game state by transitioning
game.prototype.setStatus = function (w) {

    if (game.prototype.isValidState(w) && game.prototype.isValidTransition(this.gameState, w)) {
        this.gameState = w;
        console.log("[STATUS] %s", this.gameState);
    }
    else {
        return new Error("Impossible status change from %s to %s", this.gameState, w);
    }
};

game.prototype.hasTwoConnectedPlayers = function () {
    return (this.gameState == "2 JOINED");
};

game.prototype.changeTurn = function() {
    turnMessage = lodashClonedeep(messages.PLAYER_TURN);
    if (this.getTurn() === "A") {
        this.playerTurn = "B";
        turnMessage.data = "B";
    } else {
        this.playerTurn = "A";
        turnMessage.data = "A";
    }
    return turnMessage;
} 

game.prototype.getTurn = function() {
    return this.playerTurn;
} 

game.prototype.addPlayer = function (player) {

    // when a player connects to the game scoket, the game needs to be either in 1 JOINED state 
    // (which means this new player is 2nd player to join the game)
    // OR the game needs to be in ) 0 JOINED state which means that this player is the 1st player to join this game.
    // This means if game state is 2 JOINED then no player can join this game instance.
    if (this.gameState != "0 JOINED" && this.gameState != "1 JOINED") {
        return new Error("Invalid call to addPlayer, current state is %s", this.gameState);
    }

    //making sure who has to be the first one (so who is player A)
    var error = this.setStatus("1 JOINED");
    if(error instanceof Error){
        this.setStatus("2 JOINED");
    }

    if (this.playerA == null) {
        this.playerA = player;
        console.log("You are assigned as Player A");
        return "A";
    }
    else {
        this.playerB = player;
        console.log("You are assigned as Player B");
        return "B";
    }
};


module.exports = game;