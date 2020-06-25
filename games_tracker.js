// this object is the tacker of the status of the games
var gameStatus = {
    creation: Date.now(),
    gamesInit: 0, //initilized games
    gamesExited: 0, //exited games
    gamesComplete: 0 //completed games
};

module.exports = gameStatus;

