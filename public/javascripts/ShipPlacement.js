
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
        if(arr[x][y] == 1){
            alert("You already placed a ship here! Try another tile.");
            return;
        }
        else{
                arr[x][y] = 1;
                e.target.style.background = 'green';
                console.log("Player:  has clicked on coordinates (" + x + "," + y + ").");
                placeCounter++;
                switch(placeCounter){
                            case 17:
                                $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Click start!</span>");
                                $('#startgamebutton').replaceWith("<button id=\"startgamebutton\" value=\"START\">Start Game</button>");
                                break;
                            case 15:
                                $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Place now a ship of 2 Tiles</span>");
                                break;
                            case 12:
                                $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Place now another ship of 3 Tiles</span>");
                                break;
                            case 9:
                                $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Place now a ship of 3 Tiles</span>");
                                break;
                            case 5:
                                $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Place now aship of 3 Tiles</span>");
                                break;
                            case 0: 
                                $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Place now a ship of 5 Tiles</span>");
                                break;
                            }; 
                }
                console.log("PLACECOUNTER: " + placeCounter);
            });
        

});