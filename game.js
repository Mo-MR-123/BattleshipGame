const shared = require('./public/javascripts/shared');
const messages = require('./public/javascripts/messages');
const _ = require('lodash');

/* every game has two players, identified by their WebSocket */

/** 
 * Game constructor.
 * @constructor
 * @param {Number} gameID - The id of the game (must be unique for every game)
 */
var game = function (gameID) {
    this.id = gameID;

    // NOTE: Client must be player A or player B but not both and not none
    // this.playerA and this.playerB must be assigned to the websocket of the client of player A and B respectively
    this.playerA = null;
    this.playerB = null;

    // deep clone all ships needed for the game for both players
    // NOTE: ships must be pushed in this order to be able to fetch them by their id !!
    this.shipsPlayerA = [];
    this.shipsPlayerA.push(_.cloneDeep(shared.DESTROYER));
    this.shipsPlayerA.push(_.cloneDeep(shared.SUBMARINE));
    this.shipsPlayerA.push(_.cloneDeep(shared.CRUISER));
    this.shipsPlayerA.push(_.cloneDeep(shared.BATTLESHIP));
    this.shipsPlayerA.push(_.cloneDeep(shared.CARRIER));

    this.shipsPlayerB = [];
    this.shipsPlayerB.push(_.cloneDeep(shared.DESTROYER));
    this.shipsPlayerB.push(_.cloneDeep(shared.SUBMARINE));
    this.shipsPlayerB.push(_.cloneDeep(shared.CRUISER));
    this.shipsPlayerB.push(_.cloneDeep(shared.BATTLESHIP));
    this.shipsPlayerB.push(_.cloneDeep(shared.CARRIER));

    this.gridRows = shared.GRID_DIM.rows;
    this.gridCols = shared.GRID_DIM.cols;
    this.playerAGrid = null;
    this.playerBGrid = null;
    this.playerAHitCounter = 0;
    this.playerBHitCounter = 0;

    // randomly select who begins with shooting
    this.playerTurn = ((Math.floor(Math.random() * 2)) === 0) ? "A" : "B";
    
    this.gameWonBy = null;
    this.gameState = "0 JOINED"; //"A" means A won, "B" means B won, "ABORTED" means the game was aborted

    // indicator for when the game is completed (when a player wins) or when the game is aborted
    // this is also needed so that the game object is garbage collected if it is ended.
    this.finalStatus = null;
};

/* Game can be started when both players grid is set */
game.prototype.isGameStarted = function() {
    return (this.playerAGrid && this.playerBGrid);
}

/**
 * Set the grid of player A only if the grid is valid
 * TODO: is it better to just generate a random valid grid if the grid is not valid? 
 * (using ShipsGenerator class and createGrid method)
 * 
 * @param {Array} playerAGrid - 2D array of player A 
 */
game.prototype.setPlayerAGrid = function(playerAGrid) {
    // if(this.isValidGrid(playerAGrid)) {
    this.playerAGrid = playerAGrid;
    // }
}

/**
 * Set the grid of player B only if the grid is valid.
 * TODO: is it better to just generate a random valid grid if the grid is not valid? 
 * (using ShipsGenerator class and createGrid method)
 * 
 * @param {Array} playerBGrid - 2D array of player B
 */
game.prototype.setPlayerBGrid = function(playerBGrid) {
    // if(this.isValidGrid(playerBGrid)) {
    this.playerBGrid = playerBGrid;
    // }
}

// TODO: check wether function "createGrid" is needed here or client
// function to create board
// game.prototype.createGrid = function(width=this.gridRows, height=this.gridCols) {
//     // create row
//     let column = new Array(width);
//     for (let k = 0; k < width; k++) {
//         column[k] = 0;
//     }

//     // add rows to grid
//     let grid = [];
//     for (let c = 0; c < height; c++) {
//         grid.push(column);
//     }

//     return grid;
// }

/**
 * TODO: check whether checking for validity is needed, as grid creation is controlled in client?
 * Checks if all ships have been placed on the grid.
 * Thus also implicitely checks whether ships are out of bounds.
 * NOTE: this assumes that all ships do not overlap! 
 * 
 * @param {Array} grid - 2D array to check for validity
 * @returns - true if the grid is valid and all checks returned true, else false if grid is not valid. 
 */ 
// game.prototype.isValidGrid = function(grid) {
//     // check if grid is an array object
//     const isGridAnArray = Array.isArray(grid);

//     // check if grid is a 2d grid with correct column dimensions
//     const isCorrentColumnDims = grid.every((row) => {
//         return Array.isArray(row) && row.length === this.gridCols;
//     });

//     // output debug assertions in case one of above conditions is false
//     console.assert(
//         isGridAnArray,
//         "Expecting the grid to be an Array object, got a %s", typeof grid
//     );

//     console.assert(
//         isCorrentColumnDims,
//         "Expecting every row to have correct column dimension. Not the case with the grid given: %O", grid
//     );

//     // immidiately return false if grid does not have correct grid dims or if grid is not an array
//     if (!isGridAnArray || !isCorrentColumnDims) {
//         console.log(`Grid is either not an array or does not have correct column dims:
//         colsDimsCorrect = ${isCorrentColumnDims}, isGridArray = ${isGridAnArray}`);

//         return false;
//     }

//     // define counter of the ships and the ships to check
//     let counterShips = 0;
//     let counterDestroyer = _.cloneDeep(shared.DESTROYER);
//     let counterSubmarine = _.cloneDeep(shared.SUBMARINE);
//     let counterCruiser = _.cloneDeep(shared.CRUISER);
//     let counterBattleship = _.cloneDeep(shared.BATTLESHIP);
//     let counterCarrier = _.cloneDeep(shared.CARRIER);

//     for(let i = 0; i < grid.length; i++){
//         for(let j = 0 ; j < grid[i].length; j++){
//             const tileId = grid[i][j];

//             // if tileId is 0 or higher, then it means that it is part of ship
//             if (tileId > 0) {
//                 counterShips += 1

//                 // determine which ship this tileId correspond to and increment the hits of that ship
//                 // NOTE: hits here do not mean anything, here the hits property of each ship is a counter for
//                 // parts of each ship found on the grid (to determine whether all ships are placed on grid)
//                 switch (tileId) {
//                     case counterDestroyer.id:
//                         counterDestroyer.hits++;
//                         break;
//                     case counterSubmarine.id:
//                         counterSubmarine.hits++;
//                         break;
//                     case counterCruiser.id:
//                         counterCruiser.hits++;
//                         break
//                     case counterBattleship.id:
//                         counterBattleship.hits++;
//                         break;
//                     case counterCarrier.id:
//                         counterCarrier.hits++;
//                         break;
//                 }
//             } else if (tileId < 0) {
//                 // if tileId is lower than 0, then it means that there is an invalid value found
//                 // as the minimum number on the grid allowed is 0. 
//                 // This is not allowed and thus immidiately return flase.
//                 console.log(`Found tileId ${tileId} which is lower than 0 in the grid: `, grid);
//                 return false;
//             }
//         }
//     }
    
//     // checks if counterShips is equal to expected amount of ships that should be on the grid
//     // this also checks whether each ship is placed on the grid
//     const isGridValid = (
//         counterShips === shared.AMOUNT_HITS_WIN &&
//         counterDestroyer.hits === counterDestroyer.size && 
//         counterSubmarine.hits === counterSubmarine.size &&
//         counterCruiser.hits === counterCruiser.size &&
//         counterBattleship.hits === counterBattleship.size &&
//         counterCarrier.hits === counterCarrier.size
//     );

//     return (isGridValid ? true : false);
// }

/**
 * The different possible states of the game
 * TODO: Update it to contain the TILE HIT, TILE MISS, TILE-HIT_SINK etc...
 */
game.prototype.transitionStates = {};
game.prototype.transitionStates["0 JOINED"] = 0;
game.prototype.transitionStates["1 JOINED"] = 1;
game.prototype.transitionStates["2 JOINED"] = 2;
// game.prototype.transitionStates["TILE SHOT"] = 3;
game.prototype.transitionStates["A"] = 3; //A won
game.prototype.transitionStates["B"] = 4; //B won
game.prototype.transitionStates["ABORTED"] = 5;

/*
 * Not all game states can be transformed into each other;
 * the matrix contains the valid transitions.
 * They are checked each time a state change is attempted.
 * TODO: Update it to contain allowed transitions of states TILE HIT, TILE MISS, TILE-HIT_SINK etc...
 */ 
game.prototype.transitionMatrix = [
    [0, 1, 0, 0, 0, 0],   //0 JOINED
    [1, 0, 1, 0, 0, 0],   //1 JOINED
    [0, 0, 0, 1, 1, 1],   //2 JOINED (note: once we have two players, there is no way back!)
    // [0, 0, 0, 1, 1, 1, 1],   //TILE SHOT
    [0, 0, 0, 0, 0, 0],   //A WON
    [0, 0, 0, 0, 0, 0],   //B WON
    [0, 0, 0, 0, 0, 0]    //ABORTED
];

/**
 * Checks whether the transition of current to the "to" state is valid
 * @param {String} from - current state
 * @param {String} to - state to transition to
 */
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

/**
 * Check if given state is a valid state 
 * 
 * @param {String} s - the State to check 
 * @returns - true if transitionState is valid. Else false if then transitionState is invalid.
 */
game.prototype.isValidState = function (s) {
    return (s in game.prototype.transitionStates);
};

/**
 * Determine which player was only player and first player to join and leave the game
 * and reset that players game properties.
 * 
 * TODO: maybe add if statements to check if new ships, grid etc... need to be reset,
 * to prevent reseting properties that don't need to be reset
 * as much as possible which is maybe faster and efficient?
 */
game.prototype.resetGame = function() {
    if (this.playerA) {
        this.playerA = null;

        this.shipsPlayerA = [];
        this.shipsPlayerA.push(_.cloneDeep(shared.DESTROYER));
        this.shipsPlayerA.push(_.cloneDeep(shared.SUBMARINE));
        this.shipsPlayerA.push(_.cloneDeep(shared.CRUISER));
        this.shipsPlayerA.push(_.cloneDeep(shared.BATTLESHIP));
        this.shipsPlayerA.push(_.cloneDeep(shared.CARRIER));
        
        this.playerAGrid = null;
        this.playerAHitCounter = 0;
    } else {
        this.playerB = null;

        this.shipsPlayerB = [];
        this.shipsPlayerB.push(_.cloneDeep(shared.DESTROYER));
        this.shipsPlayerB.push(_.cloneDeep(shared.SUBMARINE));
        this.shipsPlayerB.push(_.cloneDeep(shared.CRUISER));
        this.shipsPlayerB.push(_.cloneDeep(shared.BATTLESHIP));
        this.shipsPlayerB.push(_.cloneDeep(shared.CARRIER));

        this.playerBGrid = null;
        this.playerBHitCounter = 0;
    }
}

/**
 * setting a new game state by transitioning and check if w is valid transition
 * 
 * @param {String} w - Change game state to this state 
 */
game.prototype.setStatus = function (w) {
    
    if (game.prototype.isValidState(w) && game.prototype.isValidTransition(this.gameState, w)) {
        const isResetGame = (this.gameState === "1 JOINED" && w === "0 JOINED");
        
        this.gameState = w;

        // if game is transitioning to winning state, assign the winner of the game
        (w === "A") ? this.gameWonBy = "A" : ((w === "B") ? this.gameWonBy = "B" : {});

        // if first player left game and that player is only one in that game
        // reset the game so that new players get connect to this game and start over again
        if (isResetGame) {
            this.resetGame();
        }

        console.log("[STATUS] %s", this.gameState);
    }
    else {
        return new Error("Impossible status change from %s to %s", this.gameState, w);
    }
};

/**
 * Indicates whether this game has 2 players connected to it
 * 
 * @returns - true if 2 players are joined to this game, else false.
 */
game.prototype.hasTwoConnectedPlayers = function () {
    return (this.gameState == "2 JOINED");
};

/**
 * Change turn of players
 * NOTE: This is only called when the game initially starts and when a players misses
 */ 
game.prototype.changeTurn = function() {
    let turnMessage = _.cloneDeep(messages.PLAYER_TURN);
    if (this.getTurn() === "A") {
        this.playerTurn = "B";
        turnMessage.data = "B";
    } else {
        this.playerTurn = "A";
        turnMessage.data = "A";
    }
    return turnMessage;
} 

/**
 *  Returns whos turn it is to shoot (either "A" or "B")
 */
game.prototype.getTurn = function() {
    return this.playerTurn;
} 

/**
 * Adding player to this game
 * 
 * @param {WebSocket} player 
 * @returns - "A" if the added players is first one, "B" if second player is added.
 *            Else Error object.
 */
game.prototype.addPlayer = function (player) {

    // when a player connects to the game socket, the game needs to be either in 1 JOINED state 
    // (which means this new player is 2nd player to join the game)
    // OR the game needs to be in 0 JOINED state which means that this player is the 1st player to join this game.
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


/**
 * TODO: Check if we need to handle game state transition and validation 
 * of those states using methods "isValidTransition" and "isValidState".
 * 
 * @param {Object} coordinate - object containing x and y coordiantes -> {x: x, y: y}.
 *                              NOTE: x represents row of tile and y represents column of tile
 * @param {Boolean} playerAShot - true if player A fired, else false.
 * @returns - message that is one of following types: TILE_MISS, TILE_HIT and TILE_HIT_SINK
 *            depending on the game state and on the tile that has been shot, one of the messages is returned.
 */
game.prototype.tileFired = function(coordinates, playerAShot) {
    try {
        const { x, y } = coordinates;

        let msgResult = null;
        
        // check if x and y values are within the boundary of the grid.
        if (x >= 0 && x < this.gridRows && y >= 0 && y < this.gridCols) {

            // define opponent grid array, opponent ships array and current player
            // depending on who shot a tile
            let opponentGrid, opponentShips, currentPlayer;
            if (playerAShot) {
                currentPlayer = "A";
                opponentGrid = this.playerBGrid;
                opponentShips = this.shipsPlayerB;
            } else {
                currentPlayer = "B";
                opponentGrid = this.playerAGrid;
                opponentShips = this.shipsPlayerA;
            }

            const id = opponentGrid[x][y];

            if (id === 0) {

                // current player (A or B) missed
                msgResult = _.cloneDeep(messages.TILE_MISS);
                msgResult.data = { player: currentPlayer, coordinates: coordinates }; 

            } else if (id > 0) {

                // current player (A or B) hit a ship on grid of the opponent
                // increment hits of the hit ship and current player hit counter by 1
                const shipHit = opponentShips[id - 1];
                shipHit.hits++;

                // depending on what player shot, define hit counter of the player that shot
                // to be used to check whether that player has won or not.
                // this also increments the current player counter of the game.  
                let currentPlayerHitCounter;
                if (playerAShot) {
                    this.playerAHitCounter++;
                    currentPlayerHitCounter = this.playerAHitCounter;
                } else {
                    this.playerBHitCounter++;
                    currentPlayerHitCounter = this.playerBHitCounter;
                }

                // check if the hit ship sank because of this hit
                // else it is just hit and did not sink
                if (shipHit.hits === shipHit.size) {
                    msgResult = _.cloneDeep(messages.TILE_HIT_SINK);
                    msgResult.data = { player: currentPlayer, coordinates: coordinates, ship: shipHit.name };
                } else {
                    msgResult = _.cloneDeep(messages.TILE_HIT);
                    msgResult.data = { player: currentPlayer, coordinates: coordinates };
                }

                // check if player A or B won the game
                if (currentPlayerHitCounter === shared.AMOUNT_HITS_WIN) {
                    // set game state to the player that won the game.
                    // NOTE: this also sets this.gameWonBy to the player that won the game!
                    this.setStatus(currentPlayer);
                }

            }

            // set ship part of given coordiantes to -1, so that it can not be hit anymore
            opponentGrid[x][y] = -1;

        } else {
            // either x or y is out of bounds
            console.error(`
            Invalid coordinates: { x: ${x}, y: ${y} }.
            From player ${playerAShot ? 'A' : 'B'}. At ${ new Date(new Date().getTime()) }
            `)
        }

        return msgResult;

    } catch (e) {
        console.error(e);
    }

    return null;
}

module.exports = game;