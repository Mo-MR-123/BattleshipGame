const chai = require('chai');
const chaiHttp = require('chai-http');
const expect  = chai.expect;

chai.use(chaiHttp);

let server = require('../app');

describe('Pages Tests', () => {
    
    it('splash page', (done) => {
        chai.request(server)
        .get('/')
        .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            done();
        });
    });

    it('place ships', (done) => {
        chai.request(server)
        .get('/place-ships')
        .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            done();
        });
    });

    it('play page', (done) => {
        chai.request(server)
        .get('/play')
        .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            done();
        });
    });

    it('instructions page', (done) => {
        chai.request(server)
        .get('/instructions')
        .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            done();
        });
    });

    it('non existent page', (done) => {
        chai.request(server)
        .get('/asdasd')
        .end((err, res) => {
            expect(res.statusCode).to.equal(404);
            done();
        });
    });
});