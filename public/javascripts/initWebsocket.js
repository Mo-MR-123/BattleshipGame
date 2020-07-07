// IMPORTANT NOTE: shared.js and messages.js MUST BE INCLUDED BEFORE THIS SCRIPT FILE!!! 

/* constructor of game state */
//gamestate of a player (which player of the two it is depends on the socket of theirs)
function GameState(socket) {

    //initiate a new array for every player with a websocket
    this.array = [
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0]
    ];
    
    this.playerType = null; //Instantiate new player
    this.amountHits = 0;    //Initiate new amountHits for every player who starts a new game
                                
    this.getPlayerType = function () {
        return this.playerType;
    };

    this.setPlayerType = function (player) {
        console.assert(typeof player == "string", "%s: Expecting a string, got a %s", arguments.callee.name, typeof player);
        this.playerType = player;
    };

    // TODO: this MUST BE IMPLEMENTED IN THE SERVER!!
    //this functions determines who of the players won the game
    this.whoWon = function(){
        //Player A wins if HE can get 17 hits which is equal to all the ship tiles
        if( this.amountHits == this.MAX_HITS && this.getPlayerType == "A"){  
            return "A";
        }
        //Player B wins if he can get 17 hits which is equal to all the ship tiles
        if( this.amountHits == this.MAX_HITS && this.getPlayerType == "B"){                                       
            return "B";
        }                        

        return null; //nobody won yet
    };

    //here the shots are registered of the players and sent to the server and winner check is executed
    this.updateGame = function (clickedTile) {

        //check if the clicked tile coordinates is in the array of player b; if yes, then increment hitcounter player a 
        if (this.playerType == "A") {
            var clickedtiledata = Messages.O_MAKE_A_SHOT.data;
            socket.send(clickedtiledata);
        }
        
        //vice vera
        if (this.playerType == "B") {
            socket.send(clickedTile);
        }

        //is the game complete?
        let winner = this.whoWon();
        
        //checks in case there is a winner, if there is send out a message and close the websockets                
        if(winner != null){
            //disabling the tiles
            disableTilesForA();
            disableTilesForB();
            
            let alertString;

            if (winner == "A") {
                alertString = "Player A won the game!";
            }
            else {
                alertString = "Player B won the game!";
            }
            
            alert(alertString);
            
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

//Functions for enabling and disabling the tiles for the players 
function enableTilesForA(){
    $(".battlefield_cell1").attr("disabled", false);
}

function disableTilesForA() {
    $(".battlefield_cell1").setAttribute('disabled', 'disabled');
}

function enableTilesForB(){
    $(".battlefield_cell").attr("disabled", false);
}

function disableTilesForB() {
    $(".battlefield_cell").setAttribute('disabled', 'disabled');
}



//set everything up, including the WebSocket
(function setup() {
    //this makes connection with the websocket in app.js and executes the code there first
    //after the connection execution it continues here
    var socket = new WebSocket(Setup.WEB_SOCKET_URL);
    
    // the GameState object coordinates everything
    var gamestate = new GameState(socket);

    socket.onmessage = function (event) {

        let incomingMsg = JSON.parse(event.data);
 
        if (incomingMsg.type == Messages.T_PLAYER_TYPE) {
            //setting player type
            //should be "A" or "B"
            gamestate.setPlayerType( incomingMsg.data );

            // TODO: if player type is A 
            // (1) show that it is player A turn in the notification
            // (2) when tile is clicked -> sent it to server -> block tile selection for player A
            if (gamestate.getPlayerType() == "A") {
                
                alert("You are assigned as Player A. Please wait for a player to join before the game can start.");
                // TODO: why is this method here? it does not exist!
                // ShipPlacement();
            }

            else { //otherwise it is player b
                // TODO: why is this method here? it does not exist!
                // ShipPlacement();

                // redirecting players to the page where the game starts
                // TODO: DO NOT REDIRECT USER LIKE THIS!!!! THIS BREAKS WEBSOCKET CONNECTION!!!!
                const currentURL = window.location.href.split('/');
                const baseURL = currentURL[0]; 
                window.location.replace(baseURL + '/play');
            }
        }

        //Player B: when player b makes a shot
        if( incomingMsg.type == Messages.T_MAKE_A_SHOT && gamestate.getPlayerType() == "B"){
            gamestate.checkTile(incomingMsg.data);
        }

        //Player A: when player a makes a shot
        if( incomingMsg.type == Messages.T_MAKE_A_SHOT && gamestate.getPlayerType()=="A"){
            alert("Player B has shot the tile on " + incomingMsg.data);
            gamestate.updateGame(incomingMsg.data);
        }
    };

    socket.onopen = function(){
        socket.send("{}");
    };
    
    //server sends a close event only if the game was aborted from some side
    socket.onclose = function(){
        if(gamestate.whoWon() == null){
           alert("ABORTED! Nobody won!");
        }
    };
    
    socket.onerror = function(){ 
        console.log("Oops! something went wrong!");  
    };

})(); //execute immediately