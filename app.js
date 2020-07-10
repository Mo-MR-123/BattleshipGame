const express = require("express");
const http = require("http");
const sessionConfig = require('./sessionConfig');
const session = require('express-session');
const credentials = require("./cookiecredential");
const gameStatus = require("./games_tracker")
const indexRouter = require("./routes/index")
const messages = require("./public/javascripts/messages");
const Game = require("./game");
const _ = require("lodash");
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
            // 1. Before closing sockets, send who won the game to both players.
            // 2. remove reference of websockets of both players from game object
            // 3. set finalStatus to true
            // 4. increment games complete by 1
            // TODO: check if below alternative is better!
            // 1. Before closing sockets, send who won the game to both players.
            // 2. Close sockets of each player in current game.
            // 3. increment games complete by 1
            if (gameObj.gameWonBy && !gameObj.finalStatus) {
                // setup the message of the player that won the game
                let whoWonMessage = _.cloneDeep(messages.GAME_WON_BY);
                whoWonMessage.data = gameObj.gameWonBy;
                
                // step 1 of process:
                gameObj.playerA.send(JSON.stringify(whoWonMessage));
                gameObj.playerB.send(JSON.stringify(whoWonMessage));

                // step 2 of process:
                gameObj.playerA = null;
                gameObj.playerB = null;

                // step 3 of process:
                gameObj.finalStatus = true;

                // step 4 of process (last step):
                gameStatus.gamesComplete++;

                // TODO: ALTERNATIVE see if this is better than letting the client close the socket instead of the server
                // when the game is won.

                // step 2 of process:
                // give the messages some time to arrive to both client before closing sockets
                // setTimeout(() => {
                //     try {
                //         gameObj.playerA.close();
                //         gameObj.playerA = null;
                //     }
                //     catch(e) {
                //         console.log("Player A closing: "+ e);
                //     }
        
                //     try {
                //         gameObj.playerB.close(); 
                //         gameObj.playerB = null;
                //     }
                //     catch(e) {
                //         console.log("Player B closing: " + e);
                //     }
                // }, 500);
            }
        } catch (e) {
            console.log(`Error occured at handling incoming messages from client socket`);
            console.log(`THE ERROR: ${e}`);
            console.log(`DEBUG INFO:`);
            console.log(`GAME OBJECT: ${websockets[con.id]}, CLIENT SOCKET ID: ${con.id}`);
            console.log(`GAME OBJECT PLAYER A SOCKET: ${websockets[con.id] ? websockets[con.id].playerA : null}, GAME OBJECT PLAYER B SOCKET: ${websockets[con.id] ? websockets[con.id].playerB : null}`);
            console.log(`POSSIBLE CAUSE: game object is accessed after garbage collector deleted it
            which caused this error to occur. It is also possible that game was won and because both player sockets are set to null
            and socket is not properly closed by client, the client can send messages and when gameObj.playerA is checked this error is thrown.`);
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
        
        // code 1001 means almost always closing initiated by the client;
        // code 1001 is only when 1 player disconnects and that player is only one in the game.
        // THIS DOES NOT HOLD IF 2 PLAYERS ALREADY JOINED THE GAME
        // CODE 1001 WOULD NOT BE RETURNED BY ONE OF THE PLAYERS WHEN ONE OF THEM DISCONNECTS!
        if (code == "1001") {
            //if possible, abort the game; if not, the game is already completed
            if (gameObj.isValidTransition(gameObj.gameState, "ABORTED")) {
                gameObj.setStatus("ABORTED"); 
                gameStatus.gamesExited++;

                //determine whose connection remains open and close it
                try {
                    gameObj.playerA.close();
                    gameObj.playerA = null;
                }
                catch(e) {
                    console.log("Player A closing: "+ e);
                }

                try {
                    gameObj.playerB.close(); 
                    gameObj.playerB = null;
                }
                catch(e) {
                    console.log("Player B closing: " + e);
                }
                
                gameObj.finalStatus = true;
            }
        } 
        // TODO: check if this else statement is needed for debugging in the future?
        else {
            console.log(`CLOSING SOCKET CODE: ${code}`)
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