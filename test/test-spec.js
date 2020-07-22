let chai = require('chai');
let expect  = chai.expect;
let chaiHttp = require('chai-http');

chai.use(chaiHttp);

describe('Tests', () => {
    let server = require('../app');
    
    describe('Test Splash Page', () => {
        
        it('splash page', (done) => {
            chai.request(server)
            .get('/')
            .end((err, res) => {
                expect(res.statusCode).to.equal(200);
                done();
            });
        });
    });

    describe('Test Place Ships Page', () => {
        it('place ships', (done) => {
            chai.request(server)
            .get('/place-ships')
            .end((err, res) => {
                expect(res.statusCode).to.equal(200);
                done();
            });
        });
    })

    describe('Test Play Page', () => {
        it('play page', (done) => {
            chai.request(server)
            .get('/play')
            .end((err, res) => {
                expect(res.statusCode).to.equal(200);
                done();
            });
        });
    })

    describe('Test Contact Page', () => {
        it('contact page', (done) => {
            chai.request(server)
            .get('/contact.html')
            .end((err, res) => {
                expect(res.statusCode).to.equal(200);
                done();
            });
        });
    })

    describe('Test Non Existent Page', () => {
        it('non existent page', (done) => {
            chai.request(server)
            .get('/asdasd')
            .end((err, res) => {
                expect(res.statusCode).to.equal(404);
                done();
            });
        });
    })

});