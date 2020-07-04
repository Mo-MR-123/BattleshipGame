var express = require("express");
var http = require("http");
var websocket = require("ws");
var cookies = require("cookie-parser");
var credentials = require("./cookiecredential");
var gameStatus = require("./games_tracker")
var indexRouter = require("./routes/index")
var Game = require("./game");
var messages = require("./public/javascripts/messages");

var port = process.argv[2] || 3000;
var app = express();

//use the secret cookie
app.use(cookies(credentials.cookieSecret));

//initializing the ejs engine
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

//getting root file via routing
app.get("/", (req, res) => {
    res.render("splash.ejs", { exitedGames: gameStatus.gamesExited, gamesInitialized: gameStatus.gamesInit, gamesCompleted: gameStatus.gamesComplete});
});
app.get("/", (req, res)=>{
    //creating cookie for the home page
    res.cookie("splash_cookie_enjoy", "cookie_from_the_splash_page", { signed:true });
    res.send();
})

// html file for placing the ships before starting the game
app.get("/place-ships", indexRouter);

// waiting for other players
app.get("/waiting-page", indexRouter);

// transporting the user to the game page when the "play" button has been clicked
app.get("/play", indexRouter);
app.get("/play", (req, res)=>{
	//creating a cookie that expires over 10 minutes when game page is accessed
    res.cookie("game_cookie_enjoy", "cookie_from_the_game_page", { signed:true, httpOnly:true, expires:new Date(Date.now()+600000)});
    res.send();
});


var server = http.createServer(app);

//creating webSocket Server
const wss = new websocket.Server({ server });

//websockets object -> property: websocket, value: game
var websockets = {};

// cleaning up the websockets object every 50 seconds
setInterval(function() {
    for(let i in websockets){
        if(websockets.hasOwnProperty(i)){
            let gameObj = websockets[i];
            //if the gameObj has a final status, the game is complete/aborted
            if(gameObj.finalStatus != null){
                console.log("\tDeleting element "+ i);
                delete websockets[i];
            }
        }
    }
}, 50000);

var currentGame = new Game(0); //making a game object and indicating a game has been initialized/ongoing (when player is assigned to a game object)
var connectionID = 0;                                       //givig each websocket a unique connection ID

wss.on("connection", function connection(ws) {
    console.log(`I am in wss.on with following ws: `, ws);
    let con = ws;                                //binding the connected client/user (which is the param of the callback function) to a constant called con
    con.id = connectionID++;                     //assigning the current connected player an ID and increment the ID afterwards 
    let playerType = currentGame.addPlayer(con); // adding the current websocket of this specific client/player to its game object (see game.js for the function instructions)
    websockets[con.id] = currentGame;            //assigning the connectionID of every player to its game object to track the states of specific player
   
    //confirmation of beginning of a new game
    console.log("Player %s placed in game %s as %s", con.id, currentGame.id, playerType);

    //TODO: when the start button in the game page is clicked remove the script element of the ship placement and insert script for ship selection (gamelogic)

    /*
     * inform the client about its assigned player type
     */ 
    con.send((playerType == "A") ? messages.S_PLAYER_A : messages.S_PLAYER_B);

    /*
     * TODO: check if we even need the below if statement
     * client B receives the target word (if already available)
     */ 
    if (playerType == "B") {
        let msg = messages.S_PLAYER_B;
        //TODO: implement what player b receives
        con.send(JSON.stringify(msg));
    }

    /*
     * once we have two players, there is no way back; 
     * a new game object is created, to start a new game for another 2 players;
     * if a player now leaves, the game is aborted (player is not preplaced)
     */ 
    if (currentGame.hasTwoConnectedPlayers()) {
        currentGame = new Game(gameStatus.gamesInit++);
    }

    /*
     * message coming in from a player:
     *  1. determine the game object
     *  2. determine the opposing player OP
     *  3. send the message to OP 
     */ 
    con.on("message", function incoming(message) {

        let oMsg = JSON.parse(message);
 
        let gameObj = websockets[con.id];
        let isPlayerA = (gameObj.playerA == con) ? true : false;

        if (isPlayerA) {
            
            

                if(gameObj.hasTwoConnectedPlayers()){
                    gameObj.playerB.send(message); 
                }                
            
        }
        else {
            /*
             * player B can shoot; 
             * this shot is forwarded to A
             */ 
            if(oMsg.type == messages.T_MAKE_A_SHOT){
                gameObj.playerA.send(message);
                gameObj.setStatus("TILE SHOT");
            }

            /*
             * player B can state who won/lost
             */ 
            if( oMsg.type == messages.T_GAME_WON_BY){
                gameObj.setStatus(oMsg.data);
                //game was won by somebody, update statistics
                gameStatus.gamesCompleted++;
            }            
        }
    });

    con.on("close", function (code) {
        
        // code 1001 means almost always closing initiated by the client;

        console.log(con.id + " disconnected ...");

        if (code == "1001") {
            //if possible, abort the game; if not, the game is already completed
            
            let gameObj = websockets[con.id];

            if (gameObj.isValidTransition(gameObj.gameState, "ABORTED")) {
                gameObj.setStatus("ABORTED"); 
                gameStatus.gamesExited++;

                //determine whose connection remains open and close it
                 
                try {
                    gameObj.playerA.close();
                    gameObj.playerA = null;
                }
                catch(e){
                    console.log("Player A closing: "+ e);
                }

                try {
                    gameObj.playerB.close(); 
                    gameObj.playerB = null;
                }
                catch(e){
                    console.log("Player B closing: " + e);
                }                
            }
            
        }
    });
});

server.listen(port);