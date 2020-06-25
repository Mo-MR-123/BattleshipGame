//TODO: This has to be implemented in the app.js file
/*this is what the idea of this is = when the START button has been clicked the current/first user gets the turn to play
  , so the gameState must be assigned to 'true' when the current user gets the turn but must be assigned back to false
  when the other user gets the turn which makes the gameState of the other user true and so on 
*/
let gameState = false;
if(gameState == true){
  var timeleft = 30;

  var timerfunc = setInterval(countdown, 1000);

  function countdown() {

    if(timeleft >= 0){
      timer.innerHTML = timeleft--;
    }

    else{
      clearInterval(timerfunc);
    }

  };

  var timer = document.getElementById("timertext");
}

//making the var gameState visible for the server to read in app.js
module.exports = gameState;