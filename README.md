[![Build Status](https://travis-ci.org/4d6f5079/BattleshipGame.svg?branch=master)](https://travis-ci.org/4d6f5079/BattleshipGame)

# BattleshipGame
---
## Install

**NOTE:** make sure that you already have `node` installed.

Step 1: Download/clone.
```
git clone https://github.com/4d6f5079/BattleshipGame
```
Step 2: Install dependencies.
```
npm install
```
Step 3: Start server on default port 3000.
```
node app.js
```
Optional step: Start server on custom port.
```
node app.js <your-custom-port>
```
Finally, goto ```localhost:3000``` or ```localhost:<your-custom-port>``` and have fun :)
---
**❌ = not implemented/fixed yet, ✔ = implemented/fixed**

**TODO**:

1. Each ship should not have an adjecent ship next to it.
   (Add "horizontal", "x", "y" property to each ship object in shared.js to be able determine this. 
    Also `ships.js` file in `javascripts` folder can be used to store all those information for each ship.) ✔️

2. Place actual ship images when a ship is sunk. ❌

3. Add rotate button in ship placement page to give player ability to rotate a ship. ❌

4. Add functionality to enable and disable opponent grid tiles. 
(enable when it is current player turn, disable when it is the turn of the other player.) ✔️

5. Refactor server code to make it more readable and state transitions of the game more clear. ❌

6. Make style of play page better. ❌

7. Add timer to game (handled in server). ❌

8. Finish instructions on "How to play" page. Also fix payment link ( ͡° ͜ʖ ͡°) ❌

9. Make the website compatible for smaller device screens aswell. ❌

10. Make own images for hitting and missing a tile instead of using colors to show hits or miss. ❌

11. Implement functionality that makes it possible for 2 persons to join a game together via invite link. ❌

**BUGS:**

1. Fix border not showing properly when hovering on tiles on opponent grid in Mozila Firefox browser. ❌
---
## _Game Objective_

The objective of Battleship is to try and sink all of the opponent before the opponent sinks all of your ships. All of the opponent ships are somewhere on his/her board. You should try and hit them by clicking on a tile on the opponents' board. The opponent also tries to hit your ships by clicking on a tile your board. Neither you nor the other player can see the other's board so you must try to guess where the ships of the opponent are located. Each board in the game has two grids/boards.