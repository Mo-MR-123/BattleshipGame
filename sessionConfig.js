const cookieSecret = require('./cookiecredential');

const sessionConfig = {
    secret: cookieSecret.cookieSecret,
    // name: 'The Battleship Game',
    resave: false,
    saveUninitialized: true,
    // cookie : {
    //   sameSite: 'strict',
    // }
}

module.exports = sessionConfig;