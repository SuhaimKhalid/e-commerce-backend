const endpointsJson = require("../endpoint.json");

/* Set up your test imports here */
const request = require("supertest");
const db = require("../db/connection.js");
const app = require("../api.js");

const data = require("../db/data/development-data/index.js");

const seed = require("../db/seeds/seed.js");

/* Set up your beforeEach & afterAll functions here */

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("User EndPoints", () => {
  describe("Get /api/users", () => {
    test("200: Return all Users", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then((result) => {
          console.log(result.body);
        });
    });
    test("200: Return Singal User", () => {
      return request(app)
        .get("/api/users/1")
        .expect(200)
        .then((result) => {
          const user = result.body.user;
          expect(user).toMatchObject({
            username: expect.any(String),
            email: expect.any(String),
            password: expect.any(String),
          });
          console.log(user);
        });
    });
  });
});
