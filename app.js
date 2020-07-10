const express = require("express");
const http = require("http");
const sessionConfig = require('./sessionConfig');
const session = require('express-session');
const gameStatus = require("./games_tracker")
const indexRouter = require("./routes/index")
const messages = require("./public/javascripts/messages");
const Game = require("./game");
const WebSocket = require("ws");
const _ = require("lodash");

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
app.get("/", indexRouter);

// html file for placing the ships before starting the game
app.get("/place-ships", indexRouter);

// transporting the user to the game page when the "play" button has been clicked
app.get("/play", indexRouter);

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

/**
 * Close sockets of players in a game that has been won by a player OR when game is aborted.
 * NOTE: THIS ALSO SETS THE finalStatus FIELD OF THE GAME OBJECT TO true SO THAT IT GETS GARBAGE COLLECTED
 * @param {Game} gameObj - game object to close the sockets of
 */
const endGame = function (gameObj) {
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

    // set finalStatus to true as client socket is aborted to make sure 
    // the corresponding game object is garbage collected
    gameObj.finalStatus = true;
}

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
                && !gameObj.playerAGrid 
                && !gameObj.isGameStarted())
            {
                if (hasData) {
                    gameObj.setPlayerAGrid(oMsg.data);
                    
                    // game can be started when both grids are present in the game obj.
                    if (gameObj.isGameStarted()) {
                        // send whos turn it is to start shooting
                        msgWhoCanStart = _.cloneDeep(messages.PLAYER_TURN);
                        msgWhoCanStart.data = gameObj.getTurn();

                        gameObj.playerA.send(JSON.stringify(msgWhoCanStart));
                        gameObj.playerB.send(JSON.stringify(msgWhoCanStart));
                    }
                } else {
                    console.log(`Player A client did not send a grid in data of message. Data: ${oMsg.data}`);
                }
            }

            // handle grid initialization of player B if the game is still not started 
            // and when player B grid is still not set
            // TODO: check whether !gameObj.isGameStarted() is needed here and whether !gameObj.playerBGrid is enough 
            if (!isPlayerA 
                && oMsg.type === messages.T_GRID_PLAYER_B 
                && !gameObj.playerBGrid 
                && !gameObj.isGameStarted()) 
            {
                    
                if (hasData) {
                    gameObj.setPlayerBGrid(oMsg.data);

                    // game can be started when both grids are present in the game obj.
                    if (gameObj.isGameStarted()) {
                        // send whos turn it is to start shooting
                        msgWhoCanStart = _.cloneDeep(messages.PLAYER_TURN);
                        msgWhoCanStart.data = gameObj.getTurn();

                        gameObj.playerA.send(JSON.stringify(msgWhoCanStart));
                        gameObj.playerB.send(JSON.stringify(msgWhoCanStart));
                    }
                } else {
                    console.log(`Player B client did not send a grid in data of message. Data: ${oMsg.data}`);
                }
            }

            // Here goes main flow of game logic: 
            // check if current game object has 2 players, whether the game is started and can be played
            // AND check that the game is not won by a player
            if (gameObj.hasTwoConnectedPlayers() 
                && gameObj.isGameStarted() 
                && !gameObj.gameWonBy)
            {
                if (isPlayerA) {
                    // handle all logic of player A

                    // get opponent of player A
                    const opponent = gameObj.playerB;
                    const currPlayer = gameObj.playerA;
                    
                    // handle case where player A shoots tile on player B grid when it is player A turn
                    if (oMsg.type === messages.T_TILE_SHOT && gameObj.getTurn() === "A") {
                        if (hasData) {
                            const tileShotMsg = gameObj.tileFired(oMsg.data, true);
                            
                            // check if tileShotMsg is not null (so there is a message)
                            if (tileShotMsg) {
                                // if player A missed, change turn to player B
                                if (tileShotMsg.type === messages.T_TILE_MISS) {
                                    gameObj.changeTurn();
                                }
                                opponent.send(JSON.stringify(tileShotMsg));
                                currPlayer.send(JSON.stringify(tileShotMsg));
                            }
                        } else {
                            console.log(`Player A shot a tile but did not pass any data. Data: ${oMsg.data}`);
                        }
                    }
                }
                else {
                    // handle all logic of player B

                    // get opponent of player B
                    const opponent = gameObj.playerA;
                    const currPlayer = gameObj.playerB;

                    // handle case where player B shoots tile on player A grid when it is player B turn to shoot
                    if (oMsg.type === messages.T_TILE_SHOT && gameObj.getTurn() === "B") {
                        if (hasData) {
                            const tileShotMsg = gameObj.tileFired(oMsg.data, false);

                            // TODO: check if tileShotMsg can be null and whether this check is even needed
                            if (tileShotMsg) {
                                // if player B missed, change turn to player A
                                if (tileShotMsg.type === messages.T_TILE_MISS) {
                                    gameObj.changeTurn();
                                }
                                opponent.send(JSON.stringify(tileShotMsg));
                                currPlayer.send(JSON.stringify(tileShotMsg));
                            }
                        } else {
                            console.log(`Player B shot a tile but did not pass any data. Data: ${oMsg.data}`);
                        }
                    }
                }

            }
            else {
                console.log(`Player A connected to the game with id ${gameObj.id}? ${gameObj.playerA ? true : false}`);
                console.log(`Player B connected to the game with id ${gameObj.id}? ${gameObj.playerB ? true : false}`);
                console.log(`Game with id ${gameObj.id} does not have 2 players connected OR is not started yet.`);
            }

            // Check if a winner has been announced, if so then do following:
            // 1. Send who won the game to both players.
            // 2. Check after some timeout if both players are not closed,
            //    then force both sockets to close by calling endGame() function.
            // 3. Increment games complete by 1.
            if (gameObj.gameWonBy && !gameObj.finalStatus) {
                // setup the message of the player that won the game
                let whoWonMessage = _.cloneDeep(messages.GAME_WON_BY);
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

                        endGame(gameObj);
                    } else {
                        // if both sockets are closed then just de-reference sockets and set finalSatus to true
                        gameObj.playerA = null;
                        gameObj.playerB = null;
                        gameObj.finalStatus = true;
                    }
                }, 1500);

                // step 3:
                gameStatus.gamesComplete++;
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
            // socket closes with code 1001 only when both players leave the game.
            // Thus if 1 player is in the game and that player leaves, that player socket will not close with 1001 
            if (code == "1001") {
                //if possible, abort the game; if not, the game is already completed
                if (gameObj.isValidTransition(gameObj.gameState, "ABORTED")) {
                    gameObj.setStatus("ABORTED"); 
                    gameStatus.gamesExited++;
    
                    endGame(gameObj);
                }
            }

            // if first player is only one in the game and left, the set status to "0 JOINED"
            // which resets the game so that new game can start on this game object
            if (gameObj.gameState === "1 JOINED") {
                gameObj.setStatus("0 JOINED");
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