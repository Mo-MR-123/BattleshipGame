$(document).ready(function(){

    var elem = document.documentElement;
    
    $('#fullscreen').click(  
    function openFullscreen() {

      if (elem.requestFullscreen) {
        elem.requestFullscreen();
        // $("#fullscreen").replaceWith("<input type=\"image\" id=\"fullscreenclose\" src=\"images/minimize.png\" action=\"closeFullscreen();\">");
      } 

      else if (elem.mozRequestFullScreen) { /* for Firefox */
        elem.mozRequestFullScreen();
        // $("#fullscreen").replaceWith("<input type=\"image\" id=\"fullscreenclose\" src=\"images/minimize.png\" action=\"closeFullscreen();\">");
      } 
      
      else if (elem.webkitRequestFullscreen) { /* for Chrome, Safari & Opera */
        elem.webkitRequestFullscreen();
        // $("#fullscreen").replaceWith("<input type=\"image\" id=\"fullscreenclose\" src=\"images/minimize.png\" action=\"closeFullscreen();\">");
      } 

    }

    );

    // we had this idea but because of time we couldn't implement this part
    // $('#fullscreenclose').click( 
     
    //   function closeFullscreen() {
    //     console.log("fullscreenclose"); 
    //     if (document.exitFullscreen) {
    //       document.exitFullscreen();
    //       $("#fullscreenclose").replaceWith( "<input type=\"image\" id=\"fullscreen\" src=\"images/expand.png\" action=\"openFullscreen();\">");
          
    //     } else if (document.mozCancelFullScreen) {
    //       document.mozCancelFullScreen();
    //       $("#fullscreenclose").replaceWith( "<input type=\"image\" id=\"fullscreen\" src=\"images/expand.png\" action=\"openFullscreen();\">");
    //     } else if (document.webkitExitFullscreen) {
    //       document.webkitExitFullscreen();
    //       $("#fullscreenclose").replaceWith( "<input type=\"image\" id=\"fullscreen\" src=\"images/expand.png\" action=\"openFullscreen();\">");
    //     } else if (document.msExitFullscreen) {
    //       document.msExitFullscreen();
    //       $("#fullscreenclose").replaceWith( "<input type=\"image\" id=\"fullscreen\" src=\"images/expand.png\" action=\"openFullscreen();\">");
    //     }
    //   }
    
    // );
    
    });