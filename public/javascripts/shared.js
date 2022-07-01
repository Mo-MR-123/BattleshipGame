/* Code shared between client and server: game setup.
 *
 * The different properties (MIN_WORD_LENGTH and so on) are game properties that
 * need to be shared between client and server (both the client and server need to
 * be in agreement of the game properties of course).
 * 
 * We can of course maintain two separate files (one for the Node.js env and one for the browser)
 * but it is less work and less error-prone to simply havea  single *.js file that contains the
 * properties both the client and server can use.
 * 
 * We can achieve this with the code snippet below: if the 'exports' is undefined, we are in the web 
 * browser environment and need to create a property ('Setup') for the 'this' object.
 * If 'exports' is defined, we are on the server and can simply return the exports object.
 * 
 * This is a common JavaScript construct to share code between the Node.js and web browser environments. 
 */
(function(exports) {
    exports.VERTICAL_DIRECTION = 0; /* Used to indicate vertical placement of a ship */
    exports.HORIZONTAL_DIRECTION = 1; /* Used to indicate horizontal placement of a ship */
    exports.GRID_DIM = { /* Dimensions of each grid (rows must always be equal to columns) */
      rows: 10,
      cols: 10
    };
    exports.AMOUNT_HITS_WIN = 17; /* Amount of hits needed to win the game. NOTE: this is equivalent to  */
    exports.DESTROYER = { id: 1, name: 'Destroyer',  size: 2, hits: 0, color: '#8d8d8d', x: null, y: null, horizontal: null }; /* Destoryer ship properties (ID is used when placed on the board) */
    exports.SUBMARINE = { id: 2, name: 'Submarine', size: 3, hits: 0, color: '#009d00', x: null, y: null, horizontal: null }; /* Submarine ship properties (ID is used when placed on the board) */
    exports.CRUISER = { id: 3, name: 'Cruiser', size: 3, hits: 0, color: '#0000ff', x: null, y: null, horizontal: null }; /* Cruiser ship properties (ID is used when placed on the board) */
    exports.BATTLESHIP = { id: 4, name: 'Battleship', size: 4, hits: 0, color: '#996633', x: null, y: null, horizontal: null }; /* Battleship ship properties (ID is used when placed on the board) */
    exports.CARRIER = { id: 5, name: 'Carrier', size: 5, hits: 0, color: '#FF8C00', x: null, y: null, horizontal: null }; /* Carrier ship properties (ID is used when placed on the board) */
    exports.WEB_SOCKET_URL = "ws://localhost:8080"; /* WebSocket URL */
    exports.COLOR_HIT = "#FF0000"; /* Hexadecimial color shown when ship is hit on clicked tile */
    exports.COLOR_MISS = "#FFFFFF"; /* Hexadecimial color shown when no ship is hit on clicked tile */
  })(typeof exports === "undefined" ? (this.Setup = {}) : exports);
  /* this.Setup is added to the window object in the client! so by using "this" the Setup object can be accessed */
