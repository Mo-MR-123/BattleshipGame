"use strict";

/**
 * Game constructor.
 * 
 * @constructor
 * @param {WebSocket} socket - the socket of the client of the current player
 */
function Game(socket) {
    // socket to send messages to server
    this.socket = socket;
    
    // initilize ships renderer object
    // THIS shipsRenderer object HANDLES ALL THE RENDERING ON BOTH PLAYERS GRIDS
    this.shipsRenderer = new ShipsRenderer();
    
    this.grid = null;

    // get the grid from local storage of the current player. Only render grid if it is valid, otherwise force end the game.
    this.initAndRenderGrid();

    // define opponent tiles class
    this.opponentTileClass = 'td.battlefield_cell_rival_tile';

    // current player (either "A" or "B")
    this.playerType = null;
    
    // amount of hits current player has done
    this.amountHits = 0;

    // amount of hits the opponent has done
    this.opponentHits = 0;  

    // variable to assign the player that won the game
    // this is determined by the server
    this.whoWon = null

    // indicator that the game has been forced to end by closing client socket.
    this.forceExited = false;
}

Game.prototype.getPlayerType = function () {
    return this.playerType;
}

Game.prototype.setPlayerType = function (player) {
    this.playerType = player;
};

Game.prototype.setWhoWon = function (player) {
    this.whoWon = player;
};

Game.prototype.increaseSelfScore = function () {
    this.amountHits++;
};

Game.prototype.increaseOpponentScore = function () {
    this.opponentHits++;
};

/**
 * @description 
 * Get the grid from localstorage if grid exists and render the ships on the grid of current player.
 * IF grid is not valid, the server would eventually send an error that calls the forceEnd method which causes the game to end.
 */
Game.prototype.initAndRenderGrid = function() {
    try {
        this.grid = LS.getObject("grid");

        // only render grid if grid is valid grid.
        if (this.isValidGrid()) {
            this.shipsRenderer.renderSelfGrid(this.grid);
        }
    } catch(e) {
        {};
    }
};

/**
 * @description Send coordinates of clicked tile to server.
 * @param {Number} x - row number in the grid of tile clicked
 * @param {Number} y - column number in the grid  of tile clicked
 */
Game.prototype.tileClick = function(x, y) {
    var coodinatesMsg = Messages.TILE_SHOT;
    coodinatesMsg.data = {
            x: x,
            y: y
    };
    this.sendMessage(coodinatesMsg);
};

/**
 * Function to send a message to the server.
 * @param {Object} msg - Message object from messages.js
 */
Game.prototype.sendMessage = function(msg) {
    var msgToSend = JSON.stringify(msg);
    this.socket.send(msgToSend);
};

/**
 * @description Adds event listener to all clickable tiles of the opponent and handles sending coordinates if tile is clicked.
 */
Game.prototype.enableTilesOpponent = function() {
    var game = this;
    $(game.opponentTileClass).each(function() {
        var tile = this;
        $(tile).on("click", function oneClickTile(e) {
            // if tile is disabled (tile is either missed or hit), then do not send clicked tile coordinates to server
            // as that causes unnecessary overhead.
            var isTileDisabled = $(e.target).prop('disabled');
            if (isTileDisabled) return;

            var xCoord = $(e.target).data("x");
            var yCoord = $(e.target).data("y");
            game.tileClick(yCoord, xCoord);
        });
    })
};

/**
 * @description Disable all opponents' tiles by removing all event handlers from all <td></td> tags of the tiles.
 */
Game.prototype.disableTilesOpponent = function() {
    $(this.opponentTileClass).off();
};

/**
 * @description adds "disabled" value to a tile. 
 *              This is needed to prevent sending tiles coordinates that are already clicked and handled.
 * 
 * @param {Number} x - column coordinate of tile
 * @param {Number} y - row coordinate of tile
 */
Game.prototype.addDisabledToTile = function(x, y) {
    $(this.opponentTileClass + "[data-x='" + y + "'][data-y='" + x + "']").prop('disabled', true);
};

/**
 * @description Assign a player type to current player and send grid of current player to server.
 * 
 * 1- Assign the player to either "A" or "B"  
 * 2- Setup expected message to send current player grid to server
 *    
 * @param {String} data - The player type to assign to the game (must be either "A" or "B"). 
 */
Game.prototype.handlePlayerAssignment = function(data) {
    this.setPlayerType(data);
            
    // Assign player type
    // And send grid of this player afterwards
    if (this.getPlayerType() === "A") {
        showNotificationMsg(Status.playerAWait);
        var msgSendGridPlayerA = Messages.GRID_PLAYER_A;
        msgSendGridPlayerA.data = this.grid;
        this.sendMessage(msgSendGridPlayerA);
    } else if (this.getPlayerType() === "B") {
        var msgSendGridPlayerB = Messages.GRID_PLAYER_B;
        msgSendGridPlayerB.data = this.grid;
        this.sendMessage(msgSendGridPlayerB);
    }
};

/**
 * @description 
 * Shows which player is allowed to shoot first when the game starts.
 * and enable tiles event listeners of player the can start shooting.
 *
 * when second player joins, the game starts so add event listeners on opponent grid
 * 
 *  NOTE: this happens only at the start of the game!
 * @param {String} data - The player to assign the turn to.
 */
Game.prototype.handlePlayerTurn = function(data) {
    var playerTurn = data;
    if (this.getPlayerType() === playerTurn) {
        this.enableTilesOpponent();
        showNotificationMsg(Status.currentPlayerTurn);
    } else {
        showNotificationMsg(Status.opponentTurn, 3);
    }
};

/**
 * @description #
 * 
 * If current player hit a ship:  
 *      1- increase amount of hits of current player  
 *      2- Color the ship tile that is hit on opponents grid.  
 *      3- Show the updated hits of current player  
 *      4- disable the hit tile  
 *      5- Show notification that current player has hit a ship.  
 * If opponent has hit a ship of current player:  
 *      1- increase amount of hits of opponent player  
 *      2- Color the ship tile that is hit on current player grid.  
 *      3- Show the updated hits of opponent player  
 *      4- Show notification that opponent has hit a ship.  
 *  
 * ShipsRenderer object to render updated score and hit tile.
 * @param {Object} dataObj - The data object that should contain coordinates of the hit tile.
 */
Game.prototype.handlePlayerHit = function(dataObj) {
    var coordinates = dataObj.coordinates;
    if (this.getPlayerType() === dataObj.player) {
        this.increaseSelfScore();
        this.shipsRenderer.renderTileHit(coordinates.x, coordinates.y, true);
        this.shipsRenderer.updateHitsSelf(this.amountHits);
        this.addDisabledToTile(coordinates.x, coordinates.y);
        this.disableTilesOpponent();
        showNotificationMsg(Status.currentPlayerShipHit, 3);
    } else {
        this.increaseOpponentScore();
        this.shipsRenderer.renderTileHit(coordinates.x, coordinates.y, false);
        this.shipsRenderer.updateHitsOpponent(this.opponentHits);
        this.enableTilesOpponent();
        showNotificationMsg(Status.opponentShipHit);
    }
};

/**
 * @description #
 * 
 * If current player missed:  
 *      1- Color the tile that is missed on opponents grid.  
 *      2- disable missed tile  
 *      3- disable tiles of opponent  
 *      4- Show notification that current player has missed.  
 * If opponent has missed:  
 *      1- Color the tile that is missed on current player grid.   
 *      2- enable opponent tile selection, as it is current player turn.  
 *      3- Show notification that opponent has missed.  
 * 
 * ShipsRenderer object to render missed tile.
 * @param {Object} dataObj - The data object that should contain coordinates of the missed tile.
 */
Game.prototype.handlePlayerMiss = function(dataObj) {
    var coordinates = dataObj.coordinates;
    if (this.getPlayerType() === dataObj.player) {
        this.shipsRenderer.renderTileMiss(coordinates.x, coordinates.y, true);
        this.addDisabledToTile(coordinates.x, coordinates.y);
        this.disableTilesOpponent();
        showNotificationMsg(Status.currentPlayerMiss, 3);
    } else {
        this.shipsRenderer.renderTileMiss(coordinates.x, coordinates.y, false);
        this.enableTilesOpponent();
        showNotificationMsg(Status.opponentMiss);
    }
};

/**
 * @description #
 * 
 * If current player hit and sank a ship:  
 *     1- increase amount of hits of current player  
 *     2- Color the tile that is hit on opponents grid.  
 *     3- Show the updated hits of current player  
 *     4- disable the hit tile  
 *     5- Show notification that current player has hit and sank a ship.  
 * If opponent has hit and sank a ship:  
 *     1- increase amount of hits of opponent player  
 *     2- Color the tile that is hit on current player grid.   
 *     3- Show the updated hits of opponent player  
 *     4- Show notification that opponent has hit and sank a ship.  
 * 
 * ShipsRenderer object to render hit tile.
 * 
 * @param {Object} dataObj - The data object that should contain coordinates of the hit tile.
 */
Game.prototype.handlePlayerSunkShip = function(dataObj) {
    var coordinates = dataObj.coordinates;
    if (this.getPlayerType() === dataObj.player) {
        this.increaseSelfScore();
        this.shipsRenderer.renderTileHit(coordinates.x, coordinates.y, true);
        this.shipsRenderer.updateHitsSelf(this.amountHits);
        this.addDisabledToTile(coordinates.x, coordinates.y);
        this.disableTilesOpponent();
        showNotificationMsg(Status.currentPlayerShipSink.replace("%s", dataObj.ship), 3);
    } else {
        this.increaseOpponentScore();
        this.shipsRenderer.renderTileHit(coordinates.x, coordinates.y, false);
        this.shipsRenderer.updateHitsOpponent(this.opponentHits);
        this.enableTilesOpponent();
        showNotificationMsg(Status.opponentShipSink.replace("%s", dataObj.ship));
    }
};

/**
 * @description checks if the grid is a valid grid.
 * @returns true if grid is valid.
 * @returns false if grid is not valid.
 */
Game.prototype.isValidGrid = function() {
    // check if grid is an array object
    const isGridAnArray = Array.isArray(this.grid);

    // immidiately return false if grid is not an array
    if(!isGridAnArray) return false;
    
    const isEmpty = (this.grid.length === 0);

    // immidiately return false if grid array is empty
    if(isEmpty) return false;

    // check if grid is a 2d grid with correct column dimensions
    const isCorrentColumnDims = this.grid.every((row) => {
        return Array.isArray(row) && row.length === Setup.GRID_DIM.cols;
    });

    // immidiately return false if grid does not have correct grid dims
    if (!isCorrentColumnDims) return false;

    return true;
}

/**
 * @description set who won the game and close current player client socket.
 * @param {String} data - either "A" or "B" indicating which player won the game
 */
Game.prototype.handleWhoWon= function(data) {
    this.setWhoWon(data);
    this.socket.close();
}

/**
 * Force end game if error occured or if error has been send by server.
 * NOTE: This function must only be called when server sends an error message.
 */
Game.prototype.forceExit = function() {
    this.forceExited = true;
    this.socket.close();
}