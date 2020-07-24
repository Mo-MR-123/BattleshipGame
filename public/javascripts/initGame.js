"use strict";

(function setup() {    
    // init client socket
    var socket = new WebSocket(Setup.WEB_SOCKET_URL);

    // the Game object coordinates everything
    var game = new Game(socket);

    socket.onmessage = function (event) {

        if (!game.forceExited) {
            var incomingMsg = JSON.parse(event.data);

            // force socket exit to end game when error message is sent by server (e.g. grid has been invalidated by the server).
            if (incomingMsg.type === Messages.T_ERROR) {
                game.forceExit();
            }

            // 1- Assign the player to either "A" or "B"
            // 2- Setup expected message to send current player grid to server
            if (incomingMsg.type === Messages.T_PLAYER_TYPE) {
                game.handlePlayerAssignment(incomingMsg.data);
            }

            // Notify whether current player or opponent can start shooting and enable tiles event listeners of player the can start shooting.
            // NOTE: this happens only at the start of the game!
            // when second player joins, the game starts so add event listeners on opponent grid
            if (incomingMsg.type === Messages.T_PLAYER_TURN) {
                game.handlePlayerTurn(incomingMsg.data);
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
                game.handlePlayerHit(incomingMsg.data);
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
                game.handlePlayerMiss(incomingMsg.data);
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
                game.handlePlayerSunkShip(incomingMsg.data);
            }

            // 1- Set who won the game 
            // 2- close the socket
            if (incomingMsg.type === Messages.T_GAME_WON_BY) {
                game.handleWhoWon(incomingMsg.data);
            }
        } else {
            showNotificationMsg(Status.generalErrorMsg, 0);
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
            if (game.forceExited) {
                showNotificationMsg(Status.generalErrorMsg, 0);
            } else {
                showNotificationMsg(Status.aborted, 2);
            }
        }

        // Remove all EventListeners from Opponents' grid
        game.disableTilesOpponent();
    };
    
    socket.onerror = function() { 
        {}; 
    };

})(); //execute immediately