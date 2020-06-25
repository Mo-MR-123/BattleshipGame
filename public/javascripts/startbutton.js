$(document).ready(()=>{
        //When player clicks on the start button (game.html),  this function is called which removes the shipplacement menu and changes notification and initiates websockets.
        $('#startgamebutton').click(function(){

            $('#roster-sidebar').remove();
            $('#notification').replaceWith("<span class=\"marquee\" id=\"notification\">Ready for ship placement!</span>");
            $('#shipplacement').remove();
            $('body').append('<script type="text/javascript" src="javascripts/initWebsocket.js"></script>');

        });
});                 


