/* every game has two players, identified by their WebSocket */
var game = function (gameID) {
    this.playerA = null;
    this.playerB = null;
    this.id = gameID;
    this.gameJoinedFirst = false; //first player to join the game, is able to start first so the timer can begin
    this.gameState = "0 JOINED"; //"A" means A won, "B" means B won, "ABORTED" means the game was aborted
};

//different states of the game
game.prototype.transitionStates = {};
game.prototype.transitionStates["0 JOINED"] = 0;
game.prototype.transitionStates["1 JOINED"] = 1;
game.prototype.transitionStates["2 JOINED"] = 2;
game.prototype.transitionStates["TILE SHOT"] = 3;
game.prototype.transitionStates["A"] = 4; //A won
game.prototype.transitionStates["B"] = 5; //B won
game.prototype.transitionStates["ABORTED"] = 6;

/*
 * Not all game states can be transformed into each other;
 * the matrix contains the valid transitions.
 * They are checked each time a state change is attempted.
 */ 
game.prototype.transitionMatrix = [
    [0, 1, 0, 0, 0, 0, 0],   //0 JOINED
    [1, 0, 1, 0, 0, 0, 0],   //1 JOINED
    [0, 0, 0, 1, 0, 0, 1],   //2 JOINED (note: once we have two players, there is no way back!)
    [0, 0, 0, 1, 1, 1, 1],   //TILE SHOT
    [0, 0, 0, 0, 0, 0, 0],   //A WON
    [0, 0, 0, 0, 0, 0, 0],   //B WON
    [0, 0, 0, 0, 0, 0, 0]    //ABORTED
];

game.prototype.isValidTransition = function (from, to) {
    
    //checking for the validation of a transition
    console.assert(typeof from == "string", "%s: Expecting a string, got a %s", arguments.callee.name, typeof from);
    console.assert(typeof to == "string", "%s: Expecting a string, got a %s", arguments.callee.name, typeof to);
    console.assert( from in game.prototype.transitionStates == true, "%s: Expecting %s to be a valid transition state", arguments.callee.name, from);
    console.assert( to in game.prototype.transitionStates == true, "%s: Expecting %s to be a valid transition state", arguments.callee.name, to);


    let i, j;
    //checking whether the transition 'from' is in one of our transitionStates
    if (! (from in game.prototype.transitionStates)) {
        return false;
    }
    else {
        i = game.prototype.transitionStates[from];
    }

    if (!(to in game.prototype.transitionStates)) {
        return false;
    }
    else {
        j = game.prototype.transitionStates[to];
    }

    return (game.prototype.transitionMatrix[i][j] > 0);
};

//return boolean value. if true, then transitionState is valid. If false, then transitionState is invalid.
game.prototype.isValidState = function (s) {
    return (s in game.prototype.transitionStates);
};

//setting a new game state by transitioning
game.prototype.setStatus = function (w) {


    if (game.prototype.isValidState(w) && game.prototype.isValidTransition(this.gameState, w)) {
        this.gameState = w;
        console.log("[STATUS] %s", this.gameState);
    }
    else {
        return new Error("Impossible status change from %s to %s", this.gameState, w);
    }
};

game.prototype.hasTwoConnectedPlayers = function () {
    return (this.gameState == "2 JOINED");
};

game.prototype.addPlayer = function (player) {


    if (this.gameState != "0 JOINED" && this.gameState != "1 JOINED") {
        return new Error("Invalid call to addPlayer, current state is %s", this.gameState);
    }

    //making sure who has to be the first one (so who is player A)
    var error = this.setStatus("1 JOINED");
    if(error instanceof Error){
        this.setStatus("2 JOINED");
    }

    if (this.playerA == null) {
        this.playerA = player;
        this.gameJoinedFirst = true;
        console.log("You are assigned as Player A");
        return "A";
    }
    else {
        this.playerB = player;
        console.log("You are assigned as Player B");
        return "B";
    }
};


module.exports = game;