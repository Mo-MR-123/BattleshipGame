// object containing all the game status message to show as notification to the user
var Status = {
    "playerAWait": "Welcome commander. Please wait for a player to join before the game can start.",
    "currentPlayerTurn": "It is your turn to fire!",
    "opponentTurn": "It is the turn of the opponent to fire!",
    "gameWon": "Congratulations! You won! Click <a href='/play'>here</a> to play again with the same grid. Click " + 
               "<a href='/place-ships'>here</a> to choose another grid.",
    "gameLost": "Game over. You lost! Click <a href='/play'>here</a> to play again with the same grid. Click " + 
                "<a href='/place-ships'>here</a> to choose another grid.",
    "aborted": "The opponent is no longer available, game aborted. Click <a href='/play'>here</a> to play again with the same grid. Click " + 
               "<a href='/place-ships'>here</a> to choose another grid.",
    "generalErrorMsg": "Unexpected error occured! If this error keeps showing up then please contact us about this issue. " +
               "Start a new game by clicking <a href='/place-ships'>here</a>. We are sorry for the inconvenience.",
    "currentPlayerShipHit": "You hit a ship! It is still your turn to fire.",
    "opponentShipHit": "The opponent has hit one of your ships! It is the opponents' turn to fire.",
    "currentPlayerMiss": "You missed! It is the opponents' turn to fire.",
    "opponentMiss": "The opponent has missed! It is your turn to fire.",
    "currentPlayerShipSink": "You have sunk the %s! It is still your turn to fire.",
    "opponentShipSink": "The opponent has sunk your %s! It is the opponents' turn to fire.",
}