# BattleshipGame

---
**How to run server:**

1. Open terminal in root folder of the project (where `package.json` is located)

2. Type `npm install` to install all the dependencies.

3. Make sure you have `node` installed.

4. To run the server, type `node app.js` to run server on port 3000 (default port). 
   A custom port on which the server needs to run can also be given as argument e.g. `node app.js 9000` (runs server on port 9000)
---
**TODO**:

1. Each ship should not have an adjecent ship next to it.
   (Add "horizontal", "x", "y" property to each ship object in shared.js to be able determine this. 
    Also `ships.js` file in `javascripts` folder can be used to store all those information for each ship.)

2. Place actual ship images when a ship is sunk.

3. Add rotate button in ship placement page to give player ability to rotate a ship.

4. Add functionality to enable and disable opponent grid tiles. 
(enable when it is current player turn, disable when it is the turn of the other player.)

5. Refactor server code to make it more readable and state transitions of the game more clear.

6. Make style of play page better.

7. Add timer to game (handled in server).

8. Finish instructions on "How to play" page. Also fix payment link ( ͡° ͜ʖ ͡°)

9. Make the website compatible for smaller device screens aswell. 

10. Make own images for hitting and missing a tile instead of using colors to show hits or miss.

11. Remove event handler from missed or hit tile on opponent grid permanently.
---
**BUGS:**

1. Fix event listener being unbound on tile clicked on opponent grid even though it is not the turn of the current player to shoot.

2. Fix border not showing properly when hovering on tiles on opponent grid in Mozila Firefox browser.
---

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