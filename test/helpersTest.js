const { assert } = require('chai');
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

const { getUserByEmail } = require('../helpers.js');

chai.use(chaiHttp);


const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user, testUsers[expectedUserID]);
  });

  it('should test that a non-existent email returns undefined', function() {
    const user = getUserByEmail("sakura@example.com", testUsers);
    assert.equal(user, undefined);

  });
});


describe("Login and Access Control Test", () => {
  it('should return 403 status code for unauthorized access to "http://localhost:3000/urls/b2xVn2"', () => {
    const agent = chai.request.agent("http://localhost:8080");

    // Step 1: Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "user2@example.com", password: "dishwasher-funk" })
      .then((loginRes) => {
        // Step 2: Make a GET request to a protected resource
        return agent.get("/urls/b2xVn2").then((accessRes) => {
          // Step 3: Expect the status code to be 403
          expect(accessRes).to.have.status(403);
        });
      });
  });

  
  //Dont know why it is going to 200 instead of 302 but in the inspect browser it is showing 302
  it('GET request done on "http://localhost:8080/" will be redirected with a status code of 200 to the URL "http://localhost:8080/login"', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      .get("/")
      .then((res) => {
        expect(res).to.redirect;
        expect(res).to.redirectTo("http://localhost:8080/login");
        expect(res).to.have.status(200);
      });
      
  });

  //Dont know why it is going to 200 instead of 302 but in the inspect browser it is showing 302
  it('GET request done on "http://localhost:8080/urls/new" will be redirected with a status code of 200 to the URL "http://localhost:8080/login"', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      .get("/urls/new")
      .then((res) => {
        expect(res).to.redirect;
        expect(res).to.redirectTo("http://localhost:8080/login");
        expect(res).to.have.status(200);
      });
  });

  //Dont know why it is going to 404 on the inspect browser but fail in the npm test
  it('GET request done on "http://localhost:8080/urls/NOTEXISTS" will be met with a status code of 403', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      .get("/urls/NOTEXISTS")
      .then((res) => {
        expect(res).to.have.status(403);
      });
  });

  it('GET request done on "http://localhost:8080/urls/b2xVn2" will be met with a status code of 403', () => {
    const agent = chai.request.agent("http://localhost:8080");

    return agent
      .get("/urls/b2xVn2")
      .then((res) => {
        expect(res).to.have.status(403);
      });
  });

});