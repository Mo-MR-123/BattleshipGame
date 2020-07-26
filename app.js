const express = require("express");
const http = require("http");
const sessionConfig = require('./sessionConfig');
const session = require('express-session');
const gameStatus = require("./games_tracker")
const indexRouter = require("./routes/index")
const messages = require("./public/javascripts/messages");
const {
    handleLogicPlayerA,
    handleLogicPlayerB,
    handleGameWon,
    handleSocketClose,
    handleSetupPlayerGrid
} = require('./gameLogicHelperFuncs'); 
const Game = require("./game");
const WebSocket = require("ws");

const port = process.argv[2] || 3000;
const hostName = 'localhost';
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
app.get("/", indexRouter);

// html file for placing the ships before starting the game
app.get("/place-ships", indexRouter);

// transporting the user to the game page when the "play" button has been clicked
app.get("/play", indexRouter);

// instruction page
app.get("/instructions", indexRouter);

// creating the server to be able to run/use express
const server = http.createServer(app);

//creating webSocket Server
const wss = new WebSocket.Server({ server });

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

    /*
     * If current game already has 2 players connected,
     * then just make a new game and connect the new 2 players to it
     */ 
    if (currentGame.hasTwoConnectedPlayers()) {
        currentGame = new Game(gameStatus.gamesInit++);
    }

    /*
     * message coming in from a player (handle all logic of game here):
     *  1. determine which player has current id (Player A or Player B)
     *  2. determine the game object where this player is linked to
     *  3. determine the opponent.
     *  4. handle message data if there is any
     *  5. broadcast the message to both players A and B
     */ 
    con.on("message", function incoming(message) {
        try {
            const oMsg = JSON.parse(message);
            const hasData = oMsg.data ? true : false;
            
            // get the id of the connection that sent a message, to get game object linked to player this con.id
            const gameObj = websockets[con.id];
            const isPlayerA = (gameObj.playerA === con) ? true : false;
            
            // handle grid initialization of player A if the game is still not started
            // and when player A grid is still not set
            if (isPlayerA 
                && oMsg.type === messages.T_GRID_PLAYER_A 
                && !gameObj.playerAGrid)
            {
                handleSetupPlayerGrid(gameObj, oMsg.data, isPlayerA);
            }

            // handle grid initialization of player B if the game is still not started 
            // and when player B grid is still not set
            if (!isPlayerA 
                && oMsg.type === messages.T_GRID_PLAYER_B 
                && !gameObj.playerBGrid) 
            {
                handleSetupPlayerGrid(gameObj, oMsg.data, isPlayerA);
            }

            // Here game state and game logic is handled: 
            // check if current game object has 2 players, whether the game is started and can be played
            // AND check that the game is not won by a player
            if (gameObj.hasTwoConnectedPlayers() 
                && gameObj.isGameStarted() 
                && !gameObj.gameWonBy)
            {
                if (isPlayerA) {
                    // handle case where player A shoots tile on player B grid when it is player A turn
                    if (oMsg.type === messages.T_TILE_SHOT && gameObj.getTurn() === "A") {
                        if (hasData) {
                            handleLogicPlayerA(gameObj, oMsg);
                        } else {
                            console.log(`Player A shot a tile but did not pass any data. Data: ${oMsg.data}`);
                        }
                    }
                }
                else {
                    // handle case where player B shoots tile on player A grid when it is player B turn to shoot
                    if (oMsg.type === messages.T_TILE_SHOT && gameObj.getTurn() === "B") {
                        if (hasData) {
                            handleLogicPlayerB(gameObj, oMsg);
                        } else {
                            console.log(`Player B shot a tile but did not pass any data. Data: ${oMsg.data}`);
                        }
                    }
                }

            }
            else {
                console.log(`Player A connected to the game with id ${gameObj.id}? ${gameObj.playerA ? true : false}`);
                console.log(`Player B connected to the game with id ${gameObj.id}? ${gameObj.playerB ? true : false}`);
                console.log(`Game with id ${gameObj.id} started: ${!!gameObj.playerB && !!gameObj.playerA}`);
            }

            // Check if a winner has been announced, if so then do following:
            // 1. Send who won the game to both players.
            // 2. Check after some timeout if both players sockets are not closed,
            //    then force both sockets to close by calling endGame() function.
            // 3. Increment games complete by 1.
            if (gameObj.gameWonBy && !gameObj.finalStatus) {
                handleGameWon(gameObj);
            }
        } catch (e) {
            console.log(`
                Error occured at handling incoming messages from client socket
                THE ERROR: ${e}
                DEBUG INFO:
                GAME OBJECT: ${websockets[con.id]}, CLIENT SOCKET ID: ${con.id}
                GAME OBJECT PLAYER A SOCKET: ${websockets[con.id] ? websockets[con.id].playerA : null}, GAME OBJECT PLAYER B SOCKET: ${websockets[con.id] ? websockets[con.id].playerB : null}
                POSSIBLE CAUSE: game object is accessed after garbage collector deleted it which caused this error to occur
                It is also possible that game was won and because both player sockets are set to null 
                and socket is not properly closed by client, the client can send messages and when gameObj.playerA is checked this error is thrown.
            `);
        }
    });

    //NOTE: The socket must always be closed by the client when somebody wins OR when 1 of the players disconnects.
    // On the client, when somebody wins, boolean needs to be true indicating game is won (on the client).
    // After that the client needs to close the socket, on client when socket is closed -> check whether gameWon boolean is true.
    // If yes, then show who won, otherwise say nobody won with ABORTED mesage
    // THIS NEEDS TO HAPPEN ON EACH CLIENT OF BOTH PLAYERS
    con.on("close", function (code) {
        
        console.log(con.id + " disconnected ...");

        let gameObj = websockets[con.id];
        
        // only try to abort the game if the game object still exists in websockets object
        // this check is done in case the game object got removed.
        if (gameObj) {
            handleSocketClose(gameObj, code);
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

// making sure only 1 instance of the server is listening
if (!module.parent) {
    server.listen(port, hostName, () => {
        console.log(`Server running at ${hostName}:${port}`);
    });
}

// exporting server to be able to test it
module.exports = server;
