"use strict";

(function setup() {
    // init sound player
    var soundPlayer = new SoundPlayer();

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

            if (incomingMsg.type === Messages.T_PLAYER_TYPE) {
                game.handlePlayerAssignment(incomingMsg.data);
            }

            if (incomingMsg.type === Messages.T_PLAYER_TURN) {
                game.handlePlayerTurn(incomingMsg.data);
            }

            if (incomingMsg.type === Messages.T_TILE_HIT) {
                game.handlePlayerHit(incomingMsg.data);
            }

            if (incomingMsg.type === Messages.T_TILE_MISS) {
                game.handlePlayerMiss(incomingMsg.data);
            }

            if (incomingMsg.type === Messages.T_TILE_HIT_SINK) {
                game.handlePlayerSunkShip(incomingMsg.data);
                
                // the Audio object to play when ship has been sunk
                soundPlayer.playShipSinking();
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