const {
  getAllUsers,
  getSingalUser,
  postUser,
} = require("/controllers/users-Controlller.js");

const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());

app.use(express.json());

// User Table EndPoints
app.get("/api/users", getAllUsers);
app.get("/api/users/:user_id", getSingalUser);
app.post("/api/users", postUser);
// 404 handler - Handle invalid ID
app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
});

// 404 handler - This must be after all routes
app.all("/*slpat", (req, res) => {
  res.status(404).send({ msg: "Not Found" });
  next(err);
});
// 500 Error Status
app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error !" });
});

module.exports = app;
