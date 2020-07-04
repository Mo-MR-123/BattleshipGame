"use strict";
// TODO: generalize generateGrid method to be able to add grids for multiple players
// NOTE: generateGrid generates only grid of player A in following format ->


{
/*  <tbody>

    <tr class="battlefield_row">
        <td class="battlefield_cell2">
        </td>
        <td class="battlefield_cell2">A
        </td>
        <td class="battlefield_cell2">B
        </td>
        <td class="battlefield_cell2">C
        </td>			
        <td class="battlefield_cell2">D
        </td>
        <td class="battlefield_cell2">E
        </td>
        <td class="battlefield_cell2">F
        </td>
        <td class="battlefield_cell2">G
        </td>
        <td class="battlefield_cell2">H
        </td>
        <td class="battlefield_cell2">I
        </td>
        <td class="battlefield_cell2">J
        </td>
    </tr>

    <tr class="battlefield_row">
        <td class="battlefield_cell2">1
        </td>
        <td class="battlefield_cell1" data-x="0" data-y="0">
        </td>
        <td class="battlefield_cell1" data-x="1" data-y="0">
        </td>
        <td class="battlefield_cell1" data-x="2" data-y="0">
        </td>			
        <td class="battlefield_cell1" data-x="3" data-y="0">
        </td>
        <td class="battlefield_cell1" data-x="4" data-y="0">
        </td>
        <td class="battlefield_cell1" data-x="5" data-y="0">
        </td>
        <td class="battlefield_cell1" data-x="6" data-y="0">
        </td>
        <td class="battlefield_cell1" data-x="7" data-y="0">
        </td>
        <td class="battlefield_cell1" data-x="8" data-y="0">
        </td>
        <td class="battlefield_cell1" data-x="9" data-y="0">
        </td>
    </tr> 

    .
    .
    .
    
    <tr class="battlefield_row">
        <td class="battlefield_cell2">10
        </td>
        <td class="battlefield_cell1" data-x="0" data-y="9">
        </td>
        <td class="battlefield_cell1" data-x="1" data-y="9">
        </td>
        <td class="battlefield_cell1" data-x="2" data-y="9">
        </td>			
        <td class="battlefield_cell1" data-x="3" data-y="9">
        </td>
        <td class="battlefield_cell1" data-x="4" data-y="9">
        </td>
        <td class="battlefield_cell1" data-x="5" data-y="9">
        </td>
        <td class="battlefield_cell1" data-x="6" data-y="9">
        </td>
        <td class="battlefield_cell1" data-x="7" data-y="9">
        </td>
        <td class="battlefield_cell1" data-x="8" data-y="9">
        </td>
        <td class="battlefield_cell1" data-x="9" data-y="9">
        </td>
    </tr>

    </tbody>
    
    */
}

// html tags, ids and classes that are used to generate the grid
var tbodyTag = 'tbody';
var battlefieldRowClass = 'battlefield_row';
var TileClassSecondPlayer = 'battlefield_cell2';
var TileClassFirstPlayer = 'battlefield_cell1';

// cell used to select tiles of player A grid
var cell = ".battlefield_cell1";

// the array to be filled by current player
var arr = [
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

// tile clicked counter
var placeCounter = 0;

/* return the next character of the current char "c" in the ASCII ordering/ecnoding */
function nextChar(c) {
    return String.fromCharCode(c.charCodeAt(0) + 1);
}

function generateGrid(cols=10, rows=10) {
    // create tbody element to be added to table element
    let tbody = document.createElement(tbodyTag);

    // append initial row with alphabetical letters
    let firstBattlefieldRow = document.createElement("tr");
    firstBattlefieldRow.setAttribute("class", battlefieldRowClass);
    let blankTile = document.createElement("td");
    blankTile.setAttribute("class", TileClassSecondPlayer);
    firstBattlefieldRow.appendChild(blankTile);
    
    let firstLetter = 'A';

    for (let alpha = 0; alpha < cols; alpha++) {
        let currCol = document.createElement("td");
        currCol.setAttribute("class", TileClassSecondPlayer);
        
        // add letter A in the beginning and after add next letter in ASCII encoding
        if (alpha == 0) {
            const textOfCol = document.createTextNode(firstLetter);
            currCol.appendChild(textOfCol);
        } else {
            firstLetter = nextChar(firstLetter);
            const textOfColAlternative = document.createTextNode(firstLetter);
            currCol.appendChild(textOfColAlternative);
        }
        
        firstBattlefieldRow.appendChild(currCol);
    }

    // add first row of grid to tbody
    tbody.appendChild(firstBattlefieldRow);

    // create clickable rows and column tiles
    for (let row = 0; row < rows; row++) {
        const rowNumber = row + 1;

        let currRow = document.createElement("tr");
        currRow.setAttribute("class", battlefieldRowClass);

        // create row number tile
        let rowNumberTile = document.createElement("td");
        const rowNumAsText = document.createTextNode(rowNumber.toString());
        rowNumberTile.setAttribute("class", TileClassSecondPlayer);
        rowNumberTile.appendChild(rowNumAsText);

        // add row number tile to the current row
        currRow.appendChild(rowNumberTile);

        // create the clickable tiles
        const rowNumString = row.toString()
        for (let col = 0; col < cols; col++) {
            let rowTile = document.createElement("td");
            rowTile.setAttribute("class", TileClassFirstPlayer);
            rowTile.setAttribute("data-x", col.toString());
            rowTile.setAttribute("data-y", rowNumString);

            currRow.appendChild(rowTile);
        }

        // add current row to tbody
        tbody.appendChild(currRow);
    }

    // lastely, add the tbody in the existing table of the player
    document.getElementById("tableA").appendChild(tbody);
}


 // when the DOM creation is finished, do the following: 
 $(document).ready(() => {

    // generate the grid once
    generateGrid();   
          
    // if a tile is clicked the following happens everytime:
    $(cell).click((e)=>{  
        // check if max. possible tiles has been reached and current clicked tile is not green (not clicked before)
        if (placeCounter == 17 && !e.target.getAttribute("style")) {
            alert("Maximum tile selection of 17 has been reached. No more tiles can be added.")
            return;
        }

        let x = $(e.target).data('x');
        let y = $(e.target).data('y');

        if (arr[y][x] == 1) {
            e.target.removeAttribute("style");
            arr[y][x] = 0;
            placeCounter--;
        }
        else {
            arr[y][x] = 1;
            e.target.style.background = 'green';
            // console.log("Player:  has clicked on coordinates (" + y + "," + x + ").");
            placeCounter++;
        }

        switch (placeCounter) {
            case 17:
                $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Click start!</span>");
                $('#startgamebutton').replaceWith("<button id=\"startgamebutton\" type=\"submit\">Start Game</button>");
                break;
            case 15:
                $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Place the <b>Patrol Boat</b> on the grid</span>");
                break;
            case 12:
                $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Place the <b>Submarine</b> on the grid</span>");
                break;
            case 9:
                $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Place the <b>Destroyer</b> ship on the grid</span>");
                break;
            case 5:
                $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Place the <b>Battleship</b> on the grid</span>");
                break;
            case 0: 
                $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Place the <b>Aircraft Carrier</b> on the grid</span>");
                break;
            default:
                $('#startgamebutton').replaceWith("<button id=\"startgamebutton\" type=\"submit\" disabled>Start Game</button>");
                break;
        }; 

        // console.log("PLACECOUNTER: " + placeCounter);
        // console.log(arr)

    });

});