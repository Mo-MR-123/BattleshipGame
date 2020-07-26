const messages = require('./public/javascripts/messages.js');
const gameStatus = require('./games_tracker');
const WebSocket = require("ws");

/**
 * game can be started when both grids are present in the game object
 * @param {game} gameObj - game object to set player grid
 * @param {Object} data - message data object sent from client
 * @param {Boolean} isPlayerA - indicates whether to set player A or player B grid depending on which client socket sent the grid.
 */
const handleSetupPlayerGrid = (gameObj, data, isPlayerA) => {
    let isValidGrid;
    if (isPlayerA) {
        isValidGrid = gameObj.setPlayerAGrid(data);
    } else {
        isValidGrid = gameObj.setPlayerBGrid(data);
    }
    
    if (data && isValidGrid) {
        if (gameObj.isGameStarted()) {
            // send whos turn it is to start shooting
            msgWhoCanStart = Object.assign({}, messages.PLAYER_TURN);
            msgWhoCanStart.data = gameObj.getTurn();
    
            gameObj.playerA.send(JSON.stringify(msgWhoCanStart));
            gameObj.playerB.send(JSON.stringify(msgWhoCanStart));
        }
    } else {
        console.log(`
            ${"Player B" ? !isPlayerA : "Player A"} either did not send valid data (invalid data: null or undefined). Data: ${true ? data : false}
            Or grid of ${"Player B" ? !isPlayerA : "Player A"} is invalid. Grid valid: ${isValidGrid}  ----> force end game ...
        `);
        forceEndGame(gameObj);
    }
}

/**
* @description Close sockets of players in a game that has been won by a player OR when game is aborted.
* 
*              NOTE: THIS ALSO SETS THE finalStatus FIELD OF THE GAME OBJECT TO true 
*                    SO THAT THE PLAYERS CLIENT SOCKETS OF THE GAME OBJECT ARE GARBAGE COLLECTED
* @param {Game} gameObj - game object to close the sockets of
*/
const handleEndGame = (gameObj) => {
    //determine whose connection remains open and close it
    try {
        gameObj.playerA.close();
        gameObj.playerA = null;
    }
    catch(e) {
        console.log(`Error closing socket of Player A in game with ID ${gameObj.id}:`, e);
    }

    try {
        gameObj.playerB.close(); 
        gameObj.playerB = null;
    }
    catch(e) {
        console.log(`Error closing socket of Player B in game with ID ${gameObj.id}:`, e);
    }

    // set finalStatus to true as client sockets are aborted to make sure 
    // that the client sockets are are garbage collected
    gameObj.finalStatus = true;
};

/**
 * Sends ERROR message to client, so that client is able to force game exit and close sockets.
 * @param {game} gameObj - game object to get playerA and playerB socket references.
 */
const forceEndGame = (gameObj) => {
    // grid is invalid, force exit game both players.
    forceEndGameMsg = Object.assign({}, messages.ERROR);
    if (gameObj.playerA) {
        gameObj.playerA.send(JSON.stringify(forceEndGameMsg));
    }
    if (gameObj.playerB) {
        gameObj.playerB.send(JSON.stringify(forceEndGameMsg));
    }
};

/**
 * @description Handle what message needs to be returned to both players depending on what message player A sent.
 * @param {game} gameObj - The game object to handle game state and message to return to client
 * @param {Object} oMsg - Message sent from a client of player A containing type and data props
 */
const handleLogicPlayerA = (gameObj, oMsg) => {
    // get opponent of player A
    const opponent = gameObj.playerB;
    const currPlayer = gameObj.playerA;

    const tileShotMsg = gameObj.tileFired(oMsg.data, true);
                        
    // check if tileShotMsg is not null (means that coordinates are handled correctly without any errors)
    if (tileShotMsg) {
        // change turn to player B
        gameObj.changeTurn();
        
        opponent.send(JSON.stringify(tileShotMsg));
        currPlayer.send(JSON.stringify(tileShotMsg));
    }
};

/**
 * @description Handle what message needs to be returned to both players depending on what message player B sent.
 * @param {game} gameObj - The game object to handle game state and message to return to client
 * @param {Object} oMsg - Message sent from a client of player B containing type and data props
 */
const handleLogicPlayerB = (gameObj, oMsg) => {
    // get opponent of player B
    const opponent = gameObj.playerA;
    const currPlayer = gameObj.playerB;

    const tileShotMsg = gameObj.tileFired(oMsg.data, false);

    // check if tileShotMsg is not null (means that coordinates are handled correctly without any errors)
    if (tileShotMsg) {
        // change turn to player A
        gameObj.changeTurn();
        
        opponent.send(JSON.stringify(tileShotMsg));
        currPlayer.send(JSON.stringify(tileShotMsg));
    }
};

/**
 * @description  Send who won the game to each player. Also closes both sockets if both are not closed after some timeout.
 * @param {game} gameObj - Game object to get players sockets and send winning message
 */
const handleGameWon = (gameObj) => {
     // setup the message of the player that won the game
     let whoWonMessage = Object.assign({}, messages.GAME_WON_BY);
     whoWonMessage.data = gameObj.gameWonBy;

     // step 1:
     gameObj.playerA.send(JSON.stringify(whoWonMessage));
     gameObj.playerB.send(JSON.stringify(whoWonMessage));

     // step 2:
     setTimeout(() => {
         // check if both players are either closing or closed
         // if one of the players sockets is not doing that then force closing of both sockets
         if (
             gameObj.playerA.readyState !== WebSocket.CLOSED
             || gameObj.playerB.readyState !== WebSocket.CLOSED
         ) {
             console.log(`
                 FORCE CLOSING SOCKETS OF GAME ${gameObj.id}.
                 STATE SOCKET PLAYER A: ${gameObj.playerA.readyState}
                 STATE SOCKET PLAYER B: ${gameObj.playerB.readyState}
             `);

             handleEndGame(gameObj);
         } else {
             // if both sockets are closed then just de-reference sockets and set finalSatus to true
             gameObj.playerA = null;
             gameObj.playerB = null;
             gameObj.finalStatus = true;
         }
     }, 1500);

     // step 3:
     gameStatus.gamesComplete++;
};

/**
 * @description Closes sockets of game when both players left the game OR resets the game if only 1 player joined game and left afterwards.
 * @param {game} gameObj - game object to handle closing of sockets
 * @param {String} code - the returned number as string that socket sent when closing
 */
 const handleSocketClose = (gameObj, code) => {
     // socket closes with code 1001 only when both players leave the game.
     // Thus if 1 player is in the game and that player leaves, that player socket will not close with 1001 
     if (code == "1001") {
         //if possible, abort the game; if not, the game is already completed
         if (gameObj.isValidTransition(gameObj.gameState, "ABORTED")) {
             gameObj.setStatus("ABORTED"); 
             gameStatus.gamesExited++;
             
             handleEndGame(gameObj);
             
             // ongoing games decremented as a player left a game
             gameStatus.gamesInit--;
         }
     }

     // if first player is only one in the game and left, the set status to "0 JOINED"
     // which resets the game so that new game can start on this game object
     if (gameObj.gameState === "1 JOINED") {
         gameObj.setStatus("0 JOINED");
     }
     
};

module.exports = {
    forceEndGame,
    handleLogicPlayerA,
    handleLogicPlayerB,
    handleGameWon,
    handleSocketClose,
    handleSetupPlayerGrid
}