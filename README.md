# BattleshipGame

**TODO**: 

1. Make sure that on the ship placement route when the user places all the ships that when the user clicks on the start game button that the board created by the user is propagated to the "game" route **AND** also make sure when the "start game" is clicked that the board is sent to the server before the game can start.

2. **BUG**: When "start game" is clicked after ship placement, and it is the second player that join (player B), then the socket is left and new socket connection is made which is not supposed to happen. When player B (2nd player) joins the game, the player should stay connected to the same socket and not create a new one. This Bug is caused because player B goes to a new page that has "initWebsocket.js" which makes a new connection. Player B should stay on the same page in which the "initWebsocket.js" is in and not go to anther page that also has that script. Solve this with EJS to auto-generate the grids depending on which player has connected to the websocket!