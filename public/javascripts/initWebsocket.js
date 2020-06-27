/* constructor of game state */
//gamestate of a player (which player of the two it is depends on the socket of theirs)
function GameState(socket){

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
    
    console.log(this.array); //test the array
    this.playerType = null; //Instantiate new player
    this.MAX_HITS = 17;     //Max hits is 17 (5x1 + 4x1 + 3x2 + 2x1)
    this.amountHits = 0;    //Initiate new amountHits for every player who starts a new game
                                
    this.getPlayerType = function () {
        return this.playerType;
    };

    this.setPlayerType = function (player) {
        console.assert(typeof player == "string", "%s: Expecting a string, got a %s", arguments.callee.name, typeof player);
        this.playerType = player;
    };

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

    //function for ship placement
    this.ShipPlacement = ()=>{
        var cell; 
        var x;  
        var y;     
        var placeCounter = 0;
        if(this.playerType == "A"){ cell = "#battlefield_cell1";    disableTilesForB();}
        else { cell =  "#battlefield_cell";    disableTilesForA();}
                    
        $(cell).click((e)=>{
                        
            x = $(e.target).data('x');
            y = $(e.target).data('y');
            if(this.array[x][y] == 1){
                alert("You already placed a ship here! Try another tile.");
                return;
            }
            else{
                    this.array[x][y] = 1;
                    e.target.style.background = 'green';
                    console.log("Player:  has clicked on coordinates (" + x + "," + y + ").");
                    placeCounter++;
                    switch(placeCounter){
                                case 17:
                                    $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Click start!</span>");
                                    $('#startgamebutton').replaceWith("<button id=\"startgamebutton\" value=\"START\">Start Game</button>");
                                    break;
                                case 15:
                                    $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Place now a ship of 2 Tiles</span>");
                                    break;
                                case 12:
                                    $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Place now another ship of 3 Tiles</span>");
                                    break;
                                case 9:
                                    $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Place now a ship of 3 Tiles</span>");
                                    break;
                                case 5:
                                    $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Place now aship of 3 Tiles</span>");
                                    break;
                                case 0: 
                                    $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Place now a ship of 5 Tiles</span>");
                                    break;
                                }; 
                    }
                });
            
    
    };

    //here the shots are registered of the players and sent to the server and winner check is executed
    this.updateGame = function(clickedTile) {

        //check if the clicked tile coordinates is in the array of player b; if yes, then increment hitcounter player a 
        if(this.playerType == "A"){
            var clickedtiledata = Messages.O_MAKE_A_SHOT.data;
            socket.send(clickedtiledata);
        }
        
        //vice vera
        if(this.playerType == "B"){
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
            if( winner == "A"){
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
(function setup(){
    //this makes connection with the websocket in app.js and executes the code there first
    //after the connection execution it continues here
    var socket = new WebSocket("ws://localhost:3000");
    
// the GameState object coordinates everything
    


    var gamestate = new GameState(socket);

    socket.onmessage = function (event) {

        let incomingMsg = JSON.parse(event.data);
 
        if (incomingMsg.type == Messages.T_PLAYER_TYPE) {
            //setting player type
            gamestate.setPlayerType( incomingMsg.data );//should be "A" or "B"

            // TODO: if player type is A 
            // (1) show that it is player A turn in the notification
            // (2) when tile is clicked -> sent it to server -> block tile selection for player A
            if (gamestate.getPlayerType() == "A") {
                
                alert("Player A. Please place your ships on the fleet.");
                // TODO: why is this method here? it does not exist!
                // ShipPlacement();
            }

            else { //otherwise it is player b
                // TODO: why is this method here? it does not exist!
                // ShipPlacement();
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
        if(gamestate.whoWon()==null){
           alert("ABORTED! Nobody won!");
        }
    };
    
    socket.onerror = function(){ 
        console.log("Oops! something went wrong!");  
    };

})(); //execute immediately