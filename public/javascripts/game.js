/**
 * Game constructor.
 * 
 * @constructor
 */
function Game(socket) {
    // get and initiate the grid from local storage of the current player.
    // NOTE: this is with the assumption that grid array is in the local storage.
    this.grid = LS.getObject("grid");
    
    // socket to send messages to server
    this.socket = null;

    // current player (either "A" or "B")
    this.playerType = null;
    
    // amount of hits current player has done
    this.amountHits = 0;

    // amount of hits the opponent has done
    this.opponentHits = 0;  

    // variable to assign the player that won the game
    // this is determined by the server
    this.whoWon = null
}

/**
 * @description Set the socket of current player in this game to be able to send messages to server.
 * @param {WebSocket} socket - The socket of current player
 */
Game.prototype.setSocket = function (socket) {
    this.socket = socket;
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
}

/**
 * Function to send a message to the server.
 * @param {Object} msg - Message object from messages.js
 */
Game.prototype.sendMessage = function(msg) {
    var msgToSend = JSON.stringify(msg);
    this.socket.send(msgToSend);
}