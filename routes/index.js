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
router.get('/play', function(req, res) {
  res.render('game', {
    gridDim: gridDim,
    /* TODO: send to client the grid of each players but not the grid of the rival*/
    /* as all checks of the rival grid is checked in the server side. Also make sure the grid is*/
    /* assigned and set already in the game object.*/
  });
});

// TODO:Pressing 'START' in the game page must start the game and lets the user click on the cells of the grid

module.exports = router;
