//CODE BELOW CHECKS WHETHER THE CLICKED CELL CONTAINS A SHIP OR NOT (THIS MUST BE RUN DURING THE GAME ONLY, SO AFTER THE USER PLACED THE SHIPS ON THE GRID
$(document).ready(function(){			
		"use strict";


		/* tracking when the game is won by tracking how may hits are made and how many ship (parts) are hit 
		
		*/
		var hitCount = 0;

		/* create the 2d array that will contain the status of each square on the board
		and place ships on the board

		*NOTE*: the first row and the first column of the array below is not used during the game, but is necessary to make all the cells clickable.
					it is not used because the first clickable cell is on row 1 and column 1 not 0!

		0 = empty, 1 = part of a ship, 2 = sunken part of a ship, 3 = missed shot
		*/
		var gameBoard = [
			[0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0]
		];

	
		//calculating how many ships are placed to establish a max. hitcount to determine whether the game has won or not
		var maxHits = 17;

		// disable the right mouse click menu
		// $(document).contextmenu(function() {  
		// 	return false;
		// });
		var cell;
		if( playerType == A){
			cell =".battlefield_cell1";
		}
		else{
			cell = ".battlefield_cell";
		}
		
		     
        $(cell).click(function() {
			
            var col = parseInt( $(this).index() ) ;
			var row = parseInt( $(this).parent().index() );  

			// if player clicks a square with no ship, change the color and change square's value
			if (gameBoard[row][col] == 0) {
				this.style.background = 'darkred';
				// set this square's value to 3 to indicate that they fired and missed
				gameBoard[row][col] = 3;
			}	

			// if player clicks a square with a ship, change the color and change square's value
			else if (gameBoard[row][col] == 1) {
				this.style.background = 'green';
				// set this square's value to 2 to indicate the ship has been hit
				gameBoard[row][col] = 2;
				
				// increment hitCount each time a ship is hit
				hitCount++;
				
				$('#hitsself').html(hitCount);
			
				// this definitely shouldn't be hard-coded. simple solution:
				if (hitCount == maxHits) {
					$("#notification").html("All enemy ships have been sunk! You have won the game!");
				}
			}	

			// if player clicks a square that's been previously hit, let them know
			else if (gameBoard[row][col] > 1) {
				alert("You already clicked on this tile! Please try another tile.");
			}	
    	});
    
	
});

