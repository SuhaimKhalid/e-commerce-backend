const {
  getAllUsers,
  getSingalUser,
} = require("/controllers/users-Controlller.js");

const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());

app.use(express.json());

app.get("/api/users", getAllUsers);
app.get("/api/users/:user_id", getSingalUser);

module.exports = app;
