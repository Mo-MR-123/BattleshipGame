const express = require('express');
const router = express.Router();
const shared = require('../public/javascripts/shared');
const gameStatus = require("../games_tracker");

// home page
router.get("/", (req, res, next) => {
  //creating cookie for the home page
  res.cookie("splash_cookie_enjoy", "cookie_from_the_splash_page", {
      signed: false,
      sameSite: true
  });
  next();
});
router.get("/", (req, res) => {
  res.render("splash.ejs", { 
      exitedGames: gameStatus.gamesExited,
      gamesInitialized: gameStatus.gamesInit,
      gamesCompleted: gameStatus.gamesComplete
  });
});

router.get('/place-ships', function(req, res) {
  res.render('shipplacement', { gridDim: shared.GRID_DIM });
});

/* Pressing the 'START GAME' button, returns game page */
router.get("/play", (req, res, next)=>{
	//creating a cookie that expires over 10 minutes when game page is accessed
  res.cookie("game_cookie_enjoy", "cookie_from_the_game_page", { 
      signed: false,
      httpOnly: false,
      sameSite: true,
      expires: new Date(Date.now() + 600000)
  });
  next();
});
router.get('/play', function(req, res) {
  res.render('game', {
    gridDim: shared.GRID_DIM
  });
});

router.get('/instructions', function(req, res) {
  res.render('instructions', {});
});

module.exports = router;
