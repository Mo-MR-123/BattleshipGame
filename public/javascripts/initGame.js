"use strict";

// define opponent tiles class
var opponentTileClass = '.battlefield_cell_rival_tile';

/**
 * @description Adds event listener to all clickable tiles of the opponent and handles sending coordinates if tile is clicked.
 * @param {Game} game - The game object to send the coordiantes to the server
 */
function enableTilesOpponent(game) {
    $(opponentTileClass).each(function() {
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
}

/**
 * @description Disable all opponents' tiles by removing all event handlers from all <td></td> tags of the tiles.
 */
function disableTilesOpponent() {
    $(opponentTileClass).off();
}

/**
 * @description adds "disabled" value to a tile. 
 *              This is needed to prevent sending tiles coordinates that are already clicked and handled.
 * 
 * @param {Number} x - column coordinate of tile
 * @param {Number} y - row coordinate of tile
 */
function addDisabledToTile(x, y) {
    $('td'+ opponentTileClass + "[data-x='" + y + "'][data-y='" + x + "']").prop('disabled', true);
}


//////////////////////////////////// START SOCKET AND GAME ////////////////////////////////////////////////
(function setup() {    
    // the GameState object coordinates everything
    var game = new Game(socket);
    
    // 1- initilize ships renderer object to render the ships of current player
    // 2- render the ships on the grid of current player
    // THIS shipsRenderer object HANDLES ALL THE RENDERING ON BOTH PLAYERS GRIDS
    var shipsRenderer = new ShipsRenderer();
    shipsRenderer.renderSelfGrid(game.grid);

    // NOTE: only initialize a websocket AFTER the game object is initilized first, as the grid is sent 
    // to the server almost immidiately when player connects to server socket. To ensure that the grid 
    // is already set and can be sent properly, websocket should be initialized after game object. 
    var socket = new WebSocket(Setup.WEB_SOCKET_URL);
    game.setSocket(socket);

    socket.onmessage = function (event) {

        let incomingMsg = JSON.parse(event.data);

        // 1- Assign the player to either "A" or "B"
        // 2- Setup expected message to send current player grid to server
        if (incomingMsg.type === Messages.T_PLAYER_TYPE) {
            game.setPlayerType(incomingMsg.data);
            
            // Show that this player is assigned as player A
            // And send grid of this player afterwards
            if (game.getPlayerType() === "A") {
                showNotificationMsg(Status.playerAWait);
                var msgSendGridPlayerA = Messages.GRID_PLAYER_A;
                msgSendGridPlayerA.data = game.grid;
                game.sendMessage(msgSendGridPlayerA);
            } else if (game.getPlayerType() === "B") {
                var msgSendGridPlayerB = Messages.GRID_PLAYER_B;
                msgSendGridPlayerB.data = game.grid;
                game.sendMessage(msgSendGridPlayerB);
            }
        }

        // Notify whether current player or opponent can start shooting and enable tiles event listeners of player the can start shooting.
        // NOTE: this happens only at the start of the game!
        // when second player joins, the game starts so add event listeners on opponent grid
        if (incomingMsg.type === Messages.T_PLAYER_TURN) {
            var playerTurn = incomingMsg.data;
            if (game.getPlayerType() === playerTurn) {
                enableTilesOpponent(game);
                showNotificationMsg(Status.currentPlayerTurn);
            } else {
                showNotificationMsg(Status.opponentTurn);
            }
        }

        // If current player hit a ship:
        //      1- increase amount of hits of current player
        //      2- Color the ship tile that is hit on opponents grid.
        //      3- Show the updated hits of current player
        //      4- disable the hit tile
        //      5- Show notification that current player has hit a ship.
        // If opponent has hit a ship of current player:
        //      1- increase amount of hits of opponent player
        //      2- Color the ship tile that is hit on current player grid.
        //      3- Show the updated hits of opponent player
        //      4- Show notification that opponent has hit a ship.
        if (incomingMsg.type === Messages.T_TILE_HIT) {
            var dataObj = incomingMsg.data;
            var coordinates = dataObj.coordinates;
            if (game.getPlayerType() === dataObj.player) {
                game.increaseSelfScore();
                shipsRenderer.renderTileHit(coordinates.x, coordinates.y, true);
                shipsRenderer.updateHitsSelf(game.amountHits);
                addDisabledToTile(coordinates.x, coordinates.y);
                showNotificationMsg(Status.currentPlayerShipHit);
            } else {
                game.increaseOpponentScore();
                shipsRenderer.renderTileHit(coordinates.x, coordinates.y, false);
                shipsRenderer.updateHitsOpponent(game.opponentHits);
                showNotificationMsg(Status.opponentShipHit);
            }
        }

        // If current player missed:
        //      1- Color the tile that is missed on opponents grid.
        //      2- disable missed tile
        //      3- disable tiles of opponent
        //      4- Show notification that current player has missed.
        // If opponent has missed:
        //      1- Color the tile that is missed on current player grid. 
        //      2- enable opponent tile selection, as it is current player turn.
        //      3- Show notification that opponent has missed.
        if (incomingMsg.type === Messages.T_TILE_MISS) {
            var dataObj = incomingMsg.data;
            var coordinates = dataObj.coordinates;
            if (game.getPlayerType() === dataObj.player) {
                shipsRenderer.renderTileMiss(coordinates.x, coordinates.y, true);
                addDisabledToTile(coordinates.x, coordinates.y);
                disableTilesOpponent();
                showNotificationMsg(Status.currentPlayerMiss);
            } else {
                shipsRenderer.renderTileMiss(coordinates.x, coordinates.y, false);
                enableTilesOpponent(game);
                showNotificationMsg(Status.opponentMiss);
            }
        }

        // If current player hit and sank a ship:
        //      1- increase amount of hits of current player
        //      2- Color the tile that is missed on opponents grid.
        //      3- Show the updated hits of current player
        //      4- disable the hit tile
        //      5- Show notification that current player has hit and sank a ship.
        // If opponent has missed:
        //      1- increase amount of hits of opponent player
        //      2- Color the tile that is missed on current player grid. 
        //      3- Show the updated hits of opponent player
        //      4- Show notification that opponent has missed.
        if (incomingMsg.type === Messages.T_TILE_HIT_SINK) {
            var dataObj = incomingMsg.data;
            var coordinates = dataObj.coordinates;
            if (game.getPlayerType() === dataObj.player) {
                game.increaseSelfScore();
                shipsRenderer.renderTileHit(coordinates.x, coordinates.y, true);
                shipsRenderer.updateHitsSelf(game.amountHits);
                addDisabledToTile(coordinates.x, coordinates.y);
                showNotificationMsg(Status.currentPlayerShipSink);
            } else {
                game.increaseOpponentScore();
                shipsRenderer.renderTileHit(coordinates.x, coordinates.y, false);
                shipsRenderer.updateHitsOpponent(game.opponentHits);
                showNotificationMsg(Status.opponentShipSink);
            }
        }

        // 1- Set who won the game 
        // 2- close the socket
        if (incomingMsg.type === Messages.T_GAME_WON_BY) {
            game.setWhoWon(incomingMsg.data);
            socket.close();
        }

    };

    socket.onopen = function(){
        socket.send("{}");
    };
    
    //server sends a close event only if the game was aborted from some side
    socket.onclose = function() {
        if (game.whoWon) {
            if (game.whoWon === game.getPlayerType()) {
                showNotificationMsg(Status.gameWon, 1);
            } else {
                showNotificationMsg(Status.gameLost, 0);
            }
        } else {
            showNotificationMsg(Status.aborted, 2);
        }

        // Remove all EventListeners from Opponents' grid
        disableTilesOpponent();
    };
    
    socket.onerror = function() { 
        {}  
    };

})(); //execute immediately