// IMPORTANT NOTE: shared.js and messages.js MUST BE INCLUDED BEFORE THIS SCRIPT FILE!!! 
"use strict";

// define opponents tiles class
var opponentTileClass = '.battlefield_cell_rival_tile';


/**
 * @description Adds event listener to all clickable tiles of the opponent and handles sending coordinates if tile is clicked.
 * @param {Game} game - The game object 
 */
function addEventListenerOpponentTiles(game) {
    $(opponentTileClass).each(function(el) {
        this.addEventListener("click", function singleClick(tile) {
            var xCoord = $(tile).data("x");
            var yCoord = $(tile).data("y");
            game.clickedTile(xCoord, yCoord);

            // every tile can only be selected once
            el.removeEventListener("click", singleClick, false);
        });
    })
}

//Functions for enabling and disabling the tiles for the players 
function enableTilesOpponent() {
    $(opponentTileClass).attr("disabled", false);
}

function disableTilesOpponent() {
    $(opponentTileClass).setAttribute('disabled', 'disabled');
}

function removeAllEventListenersOpponent() {
    $(opponentTileClass).off();
}

//////////////////////////////////// START SOCKET AND GAME ////////////////////////////////////////////////
//set everything up, including the WebSocket
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

    socket.onmessage = function (event) {

        let incomingMsg = JSON.parse(event.data);
 
        // 1- Assign the player to either "A" or "B"
        // 2- Setup expected message to send current player grid to server
        // 3- when second player joins, the game starts so add event listeners on opponent grid
        if (incomingMsg.type === Messages.T_PLAYER_TYPE) {
            game.setPlayerType( incomingMsg.data );

            // Show that this player is assigned as player A
            // And send grid of this player afterwards
            if (game.getPlayerType() == "A") {
                showNotificationMsg(Status.playerAWait);
                var msgSendGridPlayerA = Messages.GRID_PLAYER_A;
                msgSendGridPlayerA.data = game.grid;
                game.sendMessage(msgSendGridPlayerA);
            } else if (game.getPlayerType() == "B") {
                var msgSendGridPlayerB = Messages.GRID_PLAYER_B;
                msgSendGridPlayerB.data = game.grid;
                game.sendMessage(msgSendGridPlayerB);
                addEventListenerOpponentTiles(game);
            }
        }

        // Notify whether current player or opponent can start shooting.
        // NOTE: this happens only at the start of the game!
        if (incomingMsg.type === Messages.T_PLAYER_TURN) {
            var playerTurn = incomingMsg.data;
            if (game.getPlayerType() === playerTurn) {
                showNotificationMsg(Status.currentPlayerTurn);
            } else {
                showNotificationMsg(Status.opponentTurn);
            }
        }

        // If current player hit a ship:
        //      1- Show notification that current player has hit a ship.
        //      2- Color the ship tile that is hit on opponents grid.
        //      3- increase amount of hits of current player
        //      4- Show the updated hits of current player
        // If opponent has hit a ship of current player:
        //      1- Show notification that opponent has hit a ship.
        //      2- Color the ship tile that is hit on current player grid.
        //      3- increase amount of hits of opponent player
        //      4- Show the updated hits of opponent player
        if (incomingMsg.type === Messages.T_TILE_HIT) {
            var dataObj = incomingMsg.data;
            if (game.getPlayerType() === dataObj.player) {
                game.increaseSelfScore();
                shipsRenderer.renderTileHit(dataObj.x, dataObj.y, true);
                shipsRenderer.updateHitsSelf(game.amountHits);
                showNotificationMsg(Status.currentPlayerShipHit);
            } else {
                game.increaseOpponentScore();
                shipsRenderer.renderTileHit(dataObj.x, dataObj.y, false);
                shipsRenderer.updateHitsOpponent(game.opponentHits);
                showNotificationMsg(Status.opponentShipHit);
            }
        }

        // If current player missed:
        //      1- Show notification that current player has missed.
        //      2- Color the tile that is missed on opponents grid.
        //      3- disable tiles of opponent
        // If opponent has missed:
        //      1- Show notification that opponent has missed.
        //      2- Color the tile that is missed on current player grid. 
        //      3- enable opponent tile selection, as it is current player turn.
        if (incomingMsg.type === Messages.T_TILE_MISS) {
            var dataObj = incomingMsg.data;
            if (game.getPlayerType() === dataObj.player) {
                shipsRenderer.renderTileMiss(dataObj.x, dataObj.y, true);
                disableTilesOpponent();
                showNotificationMsg(Status.currentPlayerMiss);
            } else {
                shipsRenderer.renderTileMiss(dataObj.x, dataObj.y, false);
                enableTilesOpponent();
                showNotificationMsg(Status.opponentMiss);
            }
        }

        // If current player hit and sank a ship:
        //      1- Show notification that current player has hit and sank a ship.
        //      2- Color the tile that is missed on opponents grid.
        //      3- increase amount of hits of current player
        //      4- Show the updated hits of current player
        // If opponent has missed:
        //      1- Show notification that opponent has missed.
        //      2- Color the tile that is missed on current player grid. 
        //      3- increase amount of hits of opponent player
        //      4- Show the updated hits of opponent player
        if (incomingMsg.type === Messages.T_TILE_HIT_SINK) {
            var dataObj = incomingMsg.data;
            if (game.getPlayerType() === dataObj.player) {
                game.increaseSelfScore();
                shipsRenderer.renderTileMiss(dataObj.x, dataObj.y, true);
                shipsRenderer.updateHitsSelf(game.amountHits);
                showNotificationMsg(Status.currentPlayerShipSink);
            } else {
                game.increaseOpponentScore();
                shipsRenderer.renderTileMiss(dataObj.x, dataObj.y, false);
                shipsRenderer.updateHitsOpponent(game.opponentHits);
                showNotificationMsg(Status.opponentShipSink);
            }
        }

        // 1- Set who won the game 
        // 2- remove all EventListeners of Opponents' grid
        // 3- close the socket
        if (incomingMsg.type === Messages.T_GAME_WON_BY) {
            game.setPlayerType(incomingMsg.data);
            
            removeAllEventListenersOpponent();

            socket.close();
        }

    };

    socket.onopen = function(){
        socket.send("{}");
    };
    
    //server sends a close event only if the game was aborted from some side
    socket.onclose = function() {
        if (game.whoWon) {
            if (game.whoWon == game.getPlayerType) {
                showNotificationMsg(Status.gameWon, 1);
            } else {
                showNotificationMsg(Status.gameLost, 0);
            }
        } else {
            showNotificationMsg(Status.aborted, 2);
        }
    };
    
    socket.onerror = function() { 
        {}  
    };

})(); //execute immediately