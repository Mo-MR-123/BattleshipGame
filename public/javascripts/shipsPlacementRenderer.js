"use strict";

// this js file handles the rendering of ships on the grid in html given a grid array using jquery
// NOTE: this must be the last js file to be included in html document of shipplacement.ejs file
// AND this file is only for rendering ships on the shipplacements.ejs page and should only be included there
// TODO: make sure all ids and classes of divs are assigned and don't change anymore

// cell used to select tiles of player A grid
var cell = ".battlefield_cell1";
// buttons in shipplacement.ejs page
var randomizeButtonId = "randomize-button";
var startButtonId = "startgamebutton";

// global grid of player
var grid = [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0]
];

// object to handle random ships placement
var shipsGenerator = new ShipsGenerator(grid);

// place ships randomly
shipsGenerator.placeShipsRandomly();

// TODO: remove this console log after testing
console.table(grid);

// when the DOM creation is finished, do the following:
$(document).ready(function() {
    
    // when start button is clicked, store the players grid in local storage and go to "play" page
    document.getElementById(startButtonId).addEventListener("click", function(btn) {
        btn.preventDefault();
        try {
            LS.addObject("grid", grid);
            window.location.href = "/play";
        } catch (e) {
            // TODO: remove error logging
            console.error(e);
        }
    });

    // when randomize grid button is clicked, should reset the global grid and place the ships randomly again
    document.getElementById(randomizeButtonId).addEventListener("click", function() {
        // reset grid
        grid = [
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0]
        ];

        // place ships randomly again
        shipsGenerator.rerandomizeShips(grid);

        // TODO: remove this console log after testing
        console.table(grid);
    });
          
    // // if a tile is clicked the following happens everytime:
    // $(cell).click(function(e) {  
    //     // check if max. possible tiles has been reached and current clicked tile is not green (not clicked before)
    //     if (placeCounter == 17 && !e.target.getAttribute("style")) {
    //         alert("Maximum tile selection of 17 has been reached. No more tiles can be added.")
    //         return;
    //     }

    //     var x = $(e.target).data('x');
    //     var y = $(e.target).data('y');

    //     if (arr[y][x] == 1) {
    //         e.target.removeAttribute("style");
    //         arr[y][x] = 0;
    //         placeCounter--;
    //     }
    //     else {
    //         arr[y][x] = 1;
    //         e.target.style.background = 'green';
    //         // console.log("Player:  has clicked on coordinates (" + y + "," + x + ").");
    //         placeCounter++;
    //     }
        
    //     switch (placeCounter) {
    //         case 17:
    //             $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Click start!</span>");
    //             $('#startgamebutton').replaceWith("<button id=\"startgamebutton\" type=\"submit\">Start Game</button>");
    //             break;
    //         case 15:
    //             $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Place the <b>Patrol Boat</b> on the grid</span>");
    //             break;
    //         case 12:
    //             $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Place the <b>Submarine</b> on the grid</span>");
    //             break;
    //         case 9:
    //             $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Place the <b>Destroyer</b> ship on the grid</span>");
    //             break;
    //         case 5:
    //             $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Place the <b>Battleship</b> on the grid</span>");
    //             break;
    //         case 0: 
    //             $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Place the <b>Aircraft Carrier</b> on the grid</span>");
    //             break;
    //         default:
    //             $('#startgamebutton').replaceWith("<button id=\"startgamebutton\" type=\"submit\" disabled>Start Game</button>");
    //             break;
    //     }; 

    //     // console.log("PLACECOUNTER: " + placeCounter);
    //     // console.log(arr)

    // }); 

        
});

// CODE BELOW WAS USED TO GENERATE THE GRID FOR SHIP PLACEMENT BUT THAT IS ALREADY DONE USING EJS!!!!

/* return the next character of the current char "c" in the ASCII ordering/ecnoding */
/* IMPORTANT NOTE: THIS FUNCTION IS EMBEDDED AND USED IN THE shipplacement.ejs !!! */
/* THUS NO NEED TO USE IT HERE */
// function nextChar(c) {
//     return String.fromCharCode(c.charCodeAt(0) + 1);
// }

// html tags, ids and classes that are used to generate the grid
// NOTE: THIS WAS USED TO GENERATE THE GRID, THIS IS NOT USED ANYMORE AS NOW EJS HANDLES THE GENERATION
// var tbodyTag = 'tbody';
// var battlefieldRowClass = 'battlefield_row';
// var TileClassSecondPlayer = 'battlefield_cell2';
// var TileClassFirstPlayer = 'battlefield_cell1';

// function generateGrid(cols=10, rows=10) {
//     // create tbody element to be added to table element
//     let tbody = document.createElement(tbodyTag);

//     // append initial row with alphabetical letters
//     let firstBattlefieldRow = document.createElement("tr");
//     firstBattlefieldRow.setAttribute("class", battlefieldRowClass);
//     let blankTile = document.createElement("td");
//     blankTile.setAttribute("class", TileClassSecondPlayer);
//     firstBattlefieldRow.appendChild(blankTile);
    
//     let firstLetter = 'A';

//     for (let alpha = 0; alpha < cols; alpha++) {
//         let currCol = document.createElement("td");
//         currCol.setAttribute("class", TileClassSecondPlayer);
        
//         // add letter A in the beginning and after add next letter in ASCII encoding
//         if (alpha == 0) {
//             const textOfCol = document.createTextNode(firstLetter);
//             currCol.appendChild(textOfCol);
//         } else {
//             firstLetter = nextChar(firstLetter);
//             const textOfColAlternative = document.createTextNode(firstLetter);
//             currCol.appendChild(textOfColAlternative);
//         }
        
//         firstBattlefieldRow.appendChild(currCol);
//     }

//     // add first row of grid to tbody
//     tbody.appendChild(firstBattlefieldRow);

//     // create clickable rows and column tiles
//     for (let row = 0; row < rows; row++) {
//         const rowNumber = row + 1;

//         let currRow = document.createElement("tr");
//         currRow.setAttribute("class", battlefieldRowClass);

//         // create row number tile
//         let rowNumberTile = document.createElement("td");
//         const rowNumAsText = document.createTextNode(rowNumber.toString());
//         rowNumberTile.setAttribute("class", TileClassSecondPlayer);
//         rowNumberTile.appendChild(rowNumAsText);

//         // add row number tile to the current row
//         currRow.appendChild(rowNumberTile);

//         // create the clickable tiles
//         const rowNumString = row.toString()
//         for (let col = 0; col < cols; col++) {
//             let rowTile = document.createElement("td");
//             rowTile.setAttribute("class", TileClassFirstPlayer);
//             rowTile.setAttribute("data-x", col.toString());
//             rowTile.setAttribute("data-y", rowNumString);

//             currRow.appendChild(rowTile);
//         }

//         // add current row to tbody
//         tbody.appendChild(currRow);
//     }

//     // lastely, add the tbody in the existing table of the player
//     document.getElementById("tableA").appendChild(tbody);
// }