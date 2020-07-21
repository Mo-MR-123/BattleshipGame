var expect  = require('chai').expect;
var request = require('request');

describe('Tests', function() {
    let server;
    
    this.beforeAll(function () {
        // delete require.cache[require.resolve('../app')];
        server = require('../app');
    });

    this.afterAll(function (done) {
        server.close(done);
    });
    
    it('splash page', function(done) {
        request('http://localhost:3000/' , function(error, response, body) {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    it('place ships', function(done){
        request('http://localhost:3000/place-ships', function(error, response, body) {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });
    
    it('play page', function(done){
        request('http://localhost:3000/play', function(error, response, body) {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    it('contact page', function(done){
        request('http://localhost:3000/contact.html', function(error, response, body) {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    it('non existent page', function(done){
        request('http://localhost:3000/asdasd', function(error, response, body) {
            expect(response.statusCode).to.equal(404);
            done();
        });
    });

});