//messages to let the server and the client communicate with each other 
(function(exports) {

    /* 
     * Client to server: game is complete, the winner is ... 
     */
    exports.T_GAME_WON_BY = "GAME-WON-BY";             
    exports.GAME_WON_BY = {
        type: exports.T_GAME_WON_BY,
        //this needs to be replaced with which player won
        data: null 
    };

    /*
     * Server to client: abort game (if first or second player exited the game) 
     */
    exports.O_GAME_ABORTED = {                          
        type: "GAME-ABORTED"
    };
    exports.S_GAME_ABORTED = JSON.stringify(exports.O_GAME_ABORTED);


    /*
     * Server to client: set as player A 
     */
    exports.T_PLAYER_TYPE = "PLAYER-TYPE";
    exports.O_PLAYER_A = {                            
        type: exports.T_PLAYER_TYPE,
        data: "A"
    };
    exports.S_PLAYER_A = JSON.stringify(exports.O_PLAYER_A);

    /* 
     * Server to client: set as player B 
     */
    exports.O_PLAYER_B = {                            
        type: exports.T_PLAYER_TYPE,
        data: "B"
    };
    exports.S_PLAYER_B = JSON.stringify(exports.O_PLAYER_B);


    /* 
     * Player B OR Player A clicked tile: sens coordinates to server 
     */
    exports.T_TILE_SHOT = "CLICK-ON-TILE";         
    exports.TILE_SHOT = {
        type: exports.T_TILE_SHOT,
        // this needs to be replace with which player shot (not here but when a tile is actually clicked)
        // NOTE: this must be a Coordinate object
        data: null 
    };

    /* 
     * Server to Player A & B: game over with result won/loss 
     */
    exports.T_GAME_OVER = "GAME-OVER";              
    exports.GAME_OVER = {
        type: exports.T_GAME_OVER,
        data: null
    };

    /* 
     * Server to client: clicked tile contained part of ship and is hit 
     */
    exports.T_TILE_HIT = "TILE-HIT";              
    exports.TILE_HIT = {
        type: exports.T_TILE_HIT,
        data: null //TODO: check if data needs to be sent
    };

    /* 
     * Server to client: clicked tile contained no ship part and is a miss 
     */
    exports.T_TILE_MISS = "TILE-MISS";              
    exports.TILE_HIT = {
        type: exports.T_TILE_MISS,
        data: null //TODO: check if data needs to be sent
    };


}

(typeof exports === "undefined" ? this.Messages = {} : exports));
//if exports is undefined, we are on the client; else the server