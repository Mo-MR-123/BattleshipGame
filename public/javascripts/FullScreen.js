$(document).ready(function() {

  var elem = document.documentElement;
  var fullScreenButton = $('#fullscreen');
  
  /* View in fullscreen */
  function openFullscreen() {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
      elem.msRequestFullscreen();
    }
  }

  /* Close fullscreen */
  function closeFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
      document.msExitFullscreen();
    }
  }

  // event handler for disabling fullscreen
  function disableFullScreen() {
    closeFullscreen();
    fullScreenButton.off();
    fullScreenButton.on("click", enableFullScreen);
  }
  
  // event handler for opening fullscreen
  function enableFullScreen() {
    openFullscreen();
    fullScreenButton.off();
    fullScreenButton.on("click", disableFullScreen)
  }

  fullScreenButton.on("click", enableFullScreen)

});