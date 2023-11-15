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
  