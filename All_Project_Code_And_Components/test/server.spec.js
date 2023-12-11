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

  // ===========================================================================
  // TO-DO: Part A Login unit test case
  // login test

  // Test case : Register a New User
  // Tests the register route (/register)
  // Positive
  it('Positive Test Case: Registers a new user successfully', done => {
    chai.request(server)
      .post('/register')
      .set('Test-Header', 'unit-test') // This makes sure the register route will return a JSON if its being called by a test, otherwise, it will render the register page. 
      .send({ username: 'booklover', password: 'love' }) // This user will be deleted in the final test case, this is to ensure the test can be run every time the container is run and we won't end up with dozens of test users. 
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal('Registration successful'); // This is why the register route needs to return a json, the test can't see this message if a json is not returned. 
        done();
      });

  });

  // Test case: Login existing user
  // Tests the login route (/login)
  // Positive
it('Positive Test Case: Valid User Login', done => {
    chai
      .request(server)
      .post('/login')
      .send({ username: 'booklover', password: 'love' }) // This user was just created in the register a new user test. 
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  // Test case: Login invalid user
  // Tests the login route (/login)
  // Negative
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

  

  // Test case: Attempt to register a user that already exists
  // Primarily tests register (/register) route, but also tests delete user (/delete_user) route. 
  // Negative
  it('Negative Test Case: Fails to register a user with an existing username', done => {
    chai.request(server)
      .post('/register')
      .set('Test-Header', 'unit-test')
      .send({ username: 'booklover', password: 'love' })
      .end((err, res) => {
        expect(res).to.have.status(400); 
        expect(res.body.message).to.equal('Username already exists, please try again.');
      });

      chai.request(server)
      .post('/delete_user')
      .send({username: 'booklover', password: 'love'}) // Deletes the user that was created for positive test cases. 
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.message).to.equal('User has been deleted')
        done();
      });
  });

});