const express = require("express");
const http = require("http");
const sessionConfig = require('./sessionConfig');
const session = require('express-session');
const credentials = require("./cookiecredential");
const gameStatus = require("./games_tracker")
const indexRouter = require("./routes/index")
const messages = require("./public/javascripts/messages");
const Game = require("./game");
const websocket = require("ws");

const port = process.argv[2] || 3000;
const app = express();

// init session middleware using specified config
app.use(session(sessionConfig));

// set extended to true, to be able to send JSON formatted data in any way we want it to be send
// if extended is set to false, we can not post nested objects
// e.g. person[name] = 'cw' is equivalent to nested object { person: { name: cw } }
app.use(express.urlencoded({ extended: true }))

// with code below, the default folder to search for .ejs file can be changed
// NOTE: default folder foe searching for .ejs files is "views" 
// app.set('views', __dirname + '/views');

//initializing the ejs engine
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// route to homepage and add homepage cookie
app.get("/", (req, res, next) => {
    //creating cookie for the home page
    res.cookie("splash_cookie_enjoy", "cookie_from_the_splash_page", {
        signed: false,
        sameSite: true
    });
    next();
});
app.get("/", indexRouter);

// html file for placing the ships before starting the game
app.get("/place-ships", indexRouter);

// waiting for other players
app.get("/waiting-page", indexRouter);

// transporting the user to the game page when the "play" button has been clicked
app.get("/play", (req, res, next)=>{
	//creating a cookie that expires over 10 minutes when game page is accessed
    res.cookie("game_cookie_enjoy", "cookie_from_the_game_page", { 
        signed: false,
        httpOnly: false,
        sameSite: true,
        expires: new Date(Date.now() + 600000)
    });
    next();
});
app.get("/play", indexRouter);

// creating the server to be able to run/use express
const server = http.createServer(app);

//creating webSocket Server
const wss = new websocket.Server({ server });

//websockets object -> property (= key): websocket, value: game
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

// init a game object used to handle connection and logic of the first game
var currentGame = new Game(0);

//givig each websocket a unique connection ID
var connectionID = 0;

wss.on("connection", function connection(ws) {
    let con = ws;                                // binding the connected client/user (which is the param of the callback function) to a constant called con
    con.id = connectionID++;                     // assigning the current connected player an ID and increment the ID afterwards 
    let playerType = currentGame.addPlayer(con); // adding the current websocket of this specific client/player to its game object (see game.js for the function instructions)
    websockets[con.id] = currentGame;            // assigning the connectionID of every player to its game object to track the states of specific player
                                                 // in other words: this maps the connectionID to the game the player is connected to
    console.log(
        "Player %s placed in game %s as %s",
        con.id,
        currentGame.id,
        playerType
    );

    /*
     * inform the client about its assigned player type
     */ 
    con.send((playerType === "A") ? messages.S_PLAYER_A : messages.S_PLAYER_B);

    // /*
    //  * TODO: check if we even need the below if statement
    //  * client B receives the target word (if already available)
    //  */ 
    // if (playerType == "B") {
    //     let msg = messages.S_PLAYER_B;
    //     //TODO: implement what player b receives
    //     con.send(JSON.stringify(msg));
    // }

    /*
     * If current game already has 2 players connected,
     * then just make a new game and connect the new 2 players to it
     */ 
    if (currentGame.hasTwoConnectedPlayers()) {
        currentGame = new Game(gameStatus.gamesInit++);
    }

    /*
     * message coming in from a player:
     *  1. determine which player has current id (Player A or Player B)
     *  2. determine the game object where this player is linked to
     *  3. determine the opponent.
     *  4. handle message data if there is any
     *  5. send the message to opponent
     */ 
    con.on("message", function incoming(message) {
        let oMsg = JSON.parse(message);
        // get the id of the connection that sent a message, to get game object linked to player this con.id
        let gameObj = websockets[con.id];
        let isPlayerA = (gameObj.playerA == con) ? true : false;

        if (isPlayerA) {
            if (gameObj.hasTwoConnectedPlayers()) {
                gameObj.playerB.send(message); 
            }
        }
        else {
            /*
             * player B can shoot; 
             * this shot is forwarded to A
             */ 
            if (oMsg.type == messages.T_MAKE_A_SHOT) {
                gameObj.playerA.send(message);
                gameObj.setStatus("TILE SHOT");
            }

            /*
             * player B can state who won/lost
             */ 
            if (oMsg.type == messages.T_GAME_WON_BY) {
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

//handle 404 errors
app.use((req, res, next) => {
    const error = new Error('404 NOT FOUND');
    error.status = 404;
    next(error);
})

//handle all other errors if they occur
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.render('error', { error: error.message })
})

server.listen(port, function(err) {
    if (err) throw err;
    console.log(`Listening on port ${server.address().port}`)
});