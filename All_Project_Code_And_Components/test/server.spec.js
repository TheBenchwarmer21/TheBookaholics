// Imports the index.js file to be tested.
const server = require('../index'); //TO-DO Make sure the path to your index.js is correctly added
// Importing libraries

// Chai HTTP provides an interface for live integration testing of the API's.
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });

  // ===========================================================================
  // TO-DO: Part A Login unit test case
  // login test


it('Positive Test Case: Valid User Login', done => {
    chai
      .request(server)
      .post('/login')
      .send({ username: 'booklover', password: 'love' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('Negative Test Case: Invalid User Login', done => {
    chai
      .request(server)
      .post('/login')
      .send({ username: 'invalidUser', password: 'wrongPassword' })
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
  

});