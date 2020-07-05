const express = require('express');
const router = express.Router();
const gridDim = require('../gridDimension');
const gameStatus = require("../games_tracker");

// home page
router.get("/", (req, res) => {
  res.render("splash.ejs", { 
      exitedGames: gameStatus.gamesExited,
      gamesInitialized: gameStatus.gamesInit,
      gamesCompleted: gameStatus.gamesComplete
  });
});

router.get('/place-ships', function(req, res) {
  res.render('shipplacement', { gridDim: gridDim });
});

router.get('/waiting-page', function(req, res) {
  res.sendFile('waitingpage.html', { root: './public' });
});

/* Pressing the 'START GAME' button, returns game page */
// TODO: make this with ejs to dynamically generate grid of both players
router.get('/play', function(req, res) {
  res.sendFile('game.html', { root: './public' }); 
});

// TODO:Pressing 'START' in the game page must start the game and lets the user click on the cells of the grid

module.exports = router;
