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
          const users = result.body.users;
          expect(users[0]).toMatchObject({
            username: expect.any(String),
            email: expect.any(String),
            password: expect.any(String),
          });
        });
    });
    test("200: Return Singal User", () => {
      return request(app)
        .get("/api/users/1")
        .expect(200)
        .then((result) => {
          console.log(result);
          const user = result.body.user;
          expect(user).toMatchObject({
            username: expect.any(String),
            email: expect.any(String),
            password: expect.any(String),
          });
        });
    });
  });
  describe("User Get Error Handling", () => {
    test("400:  InValid User", () => {
      return request(app)
        .get("/api/users/as")
        .expect(400)
        .then((result) => {
          expect(result.body.msg).toBe("Invalid user ID");
        });
    });
    test("404:  User Not Found", () => {
      return request(app)
        .get("/api/users/20")
        .expect(404)
        .then((result) => {
          expect(result.body.msg).toBe("Not Found");
        });
    });
  });

  describe("Post /api/users", () => {
    test("201: Post a User", () => {
      const newUser = {
        username: "Suhaim",
        email: "suhaimkhalid007@gmail.com",
        password: "12345",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(201)
        .then((result) => {
          const user = result.body.user;

          expect(user.username).toBe("Suhaim");
          expect(user.email).toBe("suhaimkhalid007@gmail.com");
          expect(user.password).toBe("12345");
        });
    });
  });
  describe("User Post Method Error Handling", () => {
    test("400: Missing Fiels", () => {
      const newUser = {
        email: "suhaimkhalid007@gmail.com",
        password: "12345",
      };
      return request(app)
        .post("/api/users/")
        .send(newUser)
        .expect(400)
        .then((result) => {
          expect(result.body.msg).toBe("Missing required fields");
        });
    });
  });
});
