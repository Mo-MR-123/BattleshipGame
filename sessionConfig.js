const cookieSecret = require('./cookiecredential');

const sessionConfig = {
    secret: cookieSecret.cookieSecret,
    // name: 'The Battleship Game',
    resave: false,
    // "saveUninitialized" keeps and stores the session id in-memory even though the session is empty
    // NOTE: it can also be saved in REDIS in-memory database for fast and efficient session ids retrieval/store
    saveUninitialized: false,
    // cookie : {
    //   sameSite: 'strict',
    // }
}

module.exports = sessionConfig;