// IMPORTANT NOTE: shared.js and messages.js MUST BE INCLUDED BEFORE THIS SCRIPT FILE!!! 

// define current player tiles class and opponents tiles class
var selfTileClass = '.battlefield_cell_self_tile';
var opponentTileClass = '.battlefield_cell_rival_tile';

// TODO: Place this GameState class into another js file to seperate initilization of game from game class.
// TODO: also put the functions in this class seperately by using prototypes!

/* constructor of game state */
/**
 * GameState constructor.
 * 
 * @constructor
 * @param {WebSocket} socket - socket of current player. 
 */
//gamestate of a player (which player of the two it is depends on the socket of theirs)
function GameState(socket) {

    // get and initiate the grid from local storage of the current player. Clear local storage afterwards. 
    try {
        this.grid = LS.getObject("grid");
        LS.clearLocalStorage();
    } catch(e) {}
    
    this.playerType = null; //Instantiate new player (This should be either "A" or "B")
    this.amountHits = 0;    //Initiate new amountHits for every player who starts a new game
                                
    this.getPlayerType = function () {
        return this.playerType;
    };

    this.setPlayerType = function (player) {
        console.assert(
            typeof player == "string", "%s: Expecting a string, got a %s",
            arguments.callee.name,
            typeof player
        );
        this.playerType = player;
    };

    // variable to assign the player that won the game
    // this is determined by the server
    this.whoWon = null

    //here the shots are registered of the players and sent to the server and winner check is executed
    this.updateGame = function (clickedTile) {

        //check if the clicked tile coordinates is in the array of player b; if yes, then increment hitcounter player a 
        if (this.playerType == "A") {
            var clickedtiledata = Messages.O_MAKE_A_SHOT.data;
            socket.send(clickedtiledata);
        }
        
        //vice versa
        if (this.playerType == "B") {
            socket.send(clickedTile);
        }
        
        //checks in case there is a winner, if there is send out a message and close the websockets                
        if (this.whoWon != null) {
            //disabling the tiles
            disableTilesForA();
            disableTilesForB();
            
            // show in notification who won the game
            showNotificationMsg('The game has been won by ' + this.whoWon, 1);

            // close socket
            socket.close();
        }
    };
}

// function tileClickable(gamestate){

//     //only initialize for player that should actually be able to use the board
//     this.initialize = function(){

//         var elements = document.querySelectorAll(".battleship_rows"); 
//         Array.from(elements).forEach( function(el){                   

//             el.addEventListener("click", function singleClick(e){
//                 var clickedTile = $(e).data("x") + $(e).data("y");
//                 gamestate.updateGame(clickedTile);

//                 //every Tile can only be selected once;

//                 el.removeEventListener("click", singleClick, false);
//             });
//         });
//     };
// }

// TODO: maybe replace these functions in shipsRenderer class
//Functions for enabling and disabling the tiles for the players 
function enableTilesForA(){
    $(selfTileClass).attr("disabled", false);
}

function disableTilesForA() {
    $(selfTileClass).setAttribute('disabled', 'disabled');
}

function enableTilesForB(){
    $(opponentTileClass).attr("disabled", false);
}

function disableTilesForB() {
    $(opponentTileClass).setAttribute('disabled', 'disabled');
}

//////////////////////////////////// START SOCKET AND GAME ////////////////////////////////////////////////
//set everything up, including the WebSocket
(function setup() {
    //this makes connection with the websocket in app.js and executes the code there first
    //after the connection execution it continues here
    var socket = new WebSocket(Setup.WEB_SOCKET_URL);
    
    // the GameState object coordinates everything
    var game = new GameState(socket);

    // 1- initilize ships renderer object to render the ships of current player
    // 2- render the ships on the grid of current player
    // THIS shipsRenderer object HANDLES ALL THE RENDERING ON BOTH PLAYERS GRIDS
    var shipsRenderer = new ShipsRenderer();
    shipsRenderer.renderSelfGrid(game.grid);

    socket.onmessage = function (event) {

        let incomingMsg = JSON.parse(event.data);
 
        if (incomingMsg.type == Messages.T_PLAYER_TYPE) {
            //setting player type
            //should be "A" or "B"
            game.setPlayerType( incomingMsg.data );

            // Show that this player is assigned as player A
            // And send grid of this player afterward
            if (game.getPlayerType() == "A") {
                showNotificationMsg(Status.PlayerAWait);
                // socket.send()
            }
        }

        // TODO: change bellow if statements to correct behaviour
        //Player B: when player b makes a shot
        if (incomingMsg.type == Messages.T_MAKE_A_SHOT && game.getPlayerType() == "B") {
            
            game.checkTile(incomingMsg.data);
        }

        //Player A: when player a makes a shot
        if( incomingMsg.type == Messages.T_MAKE_A_SHOT && game.getPlayerType()=="A"){
            alert("Player B has shot the tile on " + incomingMsg.data);
            game.updateGame(incomingMsg.data);
        }
    };

    socket.onopen = function(){
        socket.send("{}");
    };
    
    //server sends a close event only if the game was aborted from some side
    socket.onclose = function(){
        if (game.whoWon !== null) {
            if (game.whoWon == game.getPlayerType) {
                showNotificationMsg(Status.gameWon);
            } else {
                showNotificationMsg(Status.aborted);
            }
        }
    };
    
    socket.onerror = function(){ 
        console.log("Oops! something went wrong!");  
    };

})(); //execute immediately