
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

 //Checks which tile the player has clicked and returns the coordinate of it
 $(document).ready(() => {
    var cell = ".battlefield_cell1"; 
    var x;  
    var y;     
    var placeCounter = 0;
                
    $(cell).click((e)=>{
                    
        x = $(e.target).data('x');
        y = $(e.target).data('y');

        if (arr[y][x] == 1) {
            e.target.removeAttribute("style");
            arr[y][x] = 0;
            placeCounter--;
        }
        else {
            arr[y][x] = 1;
            e.target.style.background = 'green';
            console.log("Player:  has clicked on coordinates (" + y + "," + x + ").");
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
        }; 

        console.log("PLACECOUNTER: " + placeCounter);
        console.log(arr)

    });

});