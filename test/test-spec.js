var expect  = require('chai').expect;
var request = require('request');


describe('Tests', () => {
    let server = null;
    
    beforeEach( () => {
        server = require('../app');
    });
    
    afterEach( (done) => {
        new Promise((resolve, reject) => {
            server.close((err) => {
                if (err) {
                    reject(err);
                };
                resolve();
            })
        })
        .then(() => {
            // delete the cached server object to create a fresh one for next test
            delete require.cache[require.resolve('../app')];
            done();
        })
        .catch((err) => console.log(err));
    });
    
    it('splash page', (done) => {
        request('http://localhost:3000/' , function(error, response, body) {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    it('place ships', (done) => {
        request('http://localhost:3000/place-ships', function(error, response, body) {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });
    
    it('play page', (done) => {
        request('http://localhost:3000/play', function(error, response, body) {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    it('contact page', (done) => {
        request('http://localhost:3000/contact.html', function(error, response, body) {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    it('non existent page', (done) => {
        request('http://localhost:3000/asdasd', function(error, response, body) {
            expect(response.statusCode).to.equal(404);
            done();
        });
    });

});