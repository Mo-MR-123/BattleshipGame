# BattleshipGame

**TODO**: 

1. Make sure that on the ship placement route when the user places all the ships that when the user clicks on the start game button that the board created by the user is propagated to the "game" route **AND** also make sure when the "start game" is clicked that the board is sent to the server before the game can start.

2. **BUG**: When "start game" is clicked after ship placement, and it is the second player that join (player B), then the socket is left and new socket connection is made which is not supposed to happen. When player B (2nd player) joins the game, the player should stay connected to the same socket and not create a new one. This Bug is caused because player B goes to a new page that has "initWebsocket.js" which makes a new connection. Player B should stay on the same page in which the "initWebsocket.js" is in and not go to anther page that also has that script. Solve this with EJS to auto-generate the grids depending on which player has connected to the websocket!

**INFO ABOUT HOW BATTLESHIP IS PLAYED:**
Rules for BattleShip (a Milton Bradley Game)
_Game Objective_

The objective of Battleship is to try and sink all of the other player's before they sink all of your ships. All of the other player's ships are somewhere on his/her board.  You try and hit them by calling out the coordinates of one of the squares on the board.  The other player also tries to hit your ships by calling out coordinates.  Neither you nor the other player can see the other's board so you must try to guess where they are.  Each board in the physical game has two grids:  the lower (horizontal) section for the player's ships and the upper part (vertical during play) for recording the player's guesses.

_Starting a New Game_

Each player places the 5 ships somewhere on their board.  The ships can only be placed vertically or horizontally. Diagonal placement is not allowed. No part of a ship may hang off the edge of the board.  Ships may not overlap each other.  No ships may be placed on another ship. 

Once the guessing begins, the players may not move the ships.

The 5 ships are:  Carrier (occupies 5 spaces), Battleship (4), Cruiser (3), Submarine (3), and Destroyer (2).  
Playing the Game

Player's take turns guessing by calling out the coordinates. The opponent responds with "hit" or "miss" as appropriate. Both players should mark their board with pegs: red for hit, white for miss. For example, if you call out F6 and your opponent does not have any ship located at F6, your opponent would respond with "miss". You record the miss F6 by placing a white peg on the lower part of your board at F6. Your opponent records the miss by placing.

When all of the squares that one your ships occupies have been hit, the ship will be sunk. You should announce "hit and sunk". In the physical game, a red peg is placed on the top edge of the vertical board to indicate a sunk ship. 
As soon as all of one player's ships have been sunk, the game ends. 