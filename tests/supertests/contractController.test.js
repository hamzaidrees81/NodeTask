const request = require('supertest');
const assert = require('assert');
const app = require('../../src/app');

describe('Contract API', function () {
    it('should get contract by ID', function (done) {
        request(app)
            .get('/contracts/1') 
            .set('profile_id', 1) 
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                assert(res.body); 
                done();
            });
    });

    it('should return 404 for non-existent contract', function (done) {
        request(app)
            .get('/contracts/999')
            .set('profile_id', 1)
            .expect(404, done);
    });

    it('should get contracts by profile', function (done) {
        request(app)
            .get('/contracts')
            .set('profile_id', 1)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                assert(Array.isArray(res.body)); 
                done();
            });
    });

    //ADD More tests to confirm the structure received is standard
});
