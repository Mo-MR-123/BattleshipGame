//messages to let the server and the client communicate with each other 
(function(exports) {

    ////////////////////////////// GAME STATE LOGIC MESSAGES //////////////////////////////

    /* 
     * Server to client: game is complete, the winner is ... 
     */
    exports.T_GAME_WON_BY = "GAME-WON-BY";             
    exports.GAME_WON_BY = {
        type: exports.T_GAME_WON_BY,
        //this needs to be replaced with which player won
        data: null 
    };

    /*
     * Server to client: abort game (if first or second player exited the game) 
     * TODO: check whether this is used or will be used!
     */
    exports.O_GAME_ABORTED = {                          
        type: "GAME-ABORTED"
    };
    exports.S_GAME_ABORTED = JSON.stringify(exports.O_GAME_ABORTED);

    /*
     * Server to client: inform client to set its player as player A 
     */
    exports.T_PLAYER_TYPE = "PLAYER-TYPE";
    exports.O_PLAYER_A = {                            
        type: exports.T_PLAYER_TYPE,
        data: "A"
    };
    exports.S_PLAYER_A = JSON.stringify(exports.O_PLAYER_A);

    /* 
     * Server to client: inform client to set its player as player B
     */
    exports.O_PLAYER_B = {                            
        type: exports.T_PLAYER_TYPE,
        data: "B"
    };
    exports.S_PLAYER_B = JSON.stringify(exports.O_PLAYER_B);

    /* 
     * Server to client: indicate which player is allowed to shoot a tile (happens after each turn)
     */
    exports.T_PLAYER_TURN = "PLAYER-TURN";
    exports.PLAYER_TURN = {                            
        type: exports.T_PLAYER_TURN,
        // data must be either "A" or "B"
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

    /////////////////////////////// TILE LOGIC MESSAGES ///////////////////////////////////

    /* 
     * Client to server: Player B OR Player A clicked tile, send coordinates of tile to server 
     */
    exports.T_TILE_SHOT = "CLICK-ON-TILE";         
    exports.TILE_SHOT = {
        type: exports.T_TILE_SHOT,
        // this needs to be replace with which player shot (not here but when a tile is actually clicked)
        // NOTE: this must be an object containing x coordinate and y coordinate of clicked tile
        // e.g. data { player: "A", coordinates: { x: 0, y: 1 } }
        data: null 
    };

    /* 
     * Server to client: clicked tile contained part of ship and is hit 
     */
    exports.T_TILE_HIT = "TILE-HIT";              
    exports.TILE_HIT = {
        type: exports.T_TILE_HIT,
        // data must contain which player hit the tile (either "A" or "B") and what tile is hit
        // e.g. { player: "A", coordinates: { x: 0, y: 2 } }
        data: null
    };

    /* 
     * Server to client: clicked tile contained part of ship and that part is last part of that ship, thus hit and sink 
     */
    exports.T_TILE_HIT_SINK = "TILE-HIT-SINK";              
    exports.TILE_HIT_SINK = {
        type: exports.T_TILE_HIT_SINK,
        // data must contain which player hit and sank a ship (either "A" or "B") 
        // so e.g. data: { player: "A", coordinates: { x: 1, y: 1 }, ship: "Destoyer" }
        data: null
    };

    /* 
     * Server to client: clicked tile contained no ship part and is a miss 
     */
    exports.T_TILE_MISS = "TILE-MISS";              
    exports.TILE_MISS = {
        type: exports.T_TILE_MISS,
        // data must contain which player missed (either "A" or "B") and coordinate missed
        // e.g. { player: "A", coordinates: { x: 0, y: 1 } }
        data: null
    };

    ////////////////////////////// SENDING GRID OF PLAYERS TO SERVER MESSAGES ///////////////////////

    /* 
     * Client to server: Send grid of player A to server when player A connects to the socket 
     */
    exports.T_GRID_PLAYER_A = "GRID-PLAYER-A";              
    exports.GRID_PLAYER_A = {
        type: exports.T_GRID_PLAYER_A,
        // NOTE: data must be the 2D array of the grid of player A
        data: null
    };

    /* 
     * Client to server: Send grid of player B to server when player B connects to the socket 
     */
    exports.T_GRID_PLAYER_B = "GRID-PLAYER-B";              
    exports.GRID_PLAYER_B = {
        type: exports.T_GRID_PLAYER_B,
        // NOTE: data must be the 2D array of the grid of player B
        data: null
    };


}

(typeof exports === "undefined" ? this.Messages = {} : exports));
//if exports is undefined, we are on the client; else the server