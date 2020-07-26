"use strict";

/**
 * Constructor for sound player class.
 * 
 * @constructor
 * @param {Number} volume - indicates the volume of playing a sound (default = 0.2)
 */
function SoundPlayer(volume=0.2) {
    this.splashSoundUrl = '../sounds/splash.mp3';
    this.fireSoundUrl = '../sounds/fire.mp3';
    this.audioVolume = volume;
}

/**
 * Plays the ship sinking sound
 */
SoundPlayer.prototype.playShipSinking = function() {
    var sound = new Audio(this.splashSoundUrl);
    sound.volume = this.audioVolume;
    sound.play();
}

/**
 * Plays fired sound
 */
SoundPlayer.prototype.playTileFired = function() {
    // TODO:
}