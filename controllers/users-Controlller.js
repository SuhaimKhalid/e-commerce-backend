const {
  selectAllUsers,
  selectSingalUser,
  insertUser,
} = require("../models/users-model.js");

exports.getAllUsers = (req, res, next) => {
  return selectAllUsers().then((result) => {
    res.status(200).send({ users: result });
  });
};

exports.getSingalUser = (req, res, next) => {
  const { user_id } = req.params;
  // Check if it's a number
  if (isNaN(Number(user_id))) {
    return res.status(400).send({ msg: "Invalid user ID" });
  }
  return selectSingalUser(user_id)
    .then((result) => {
      res.status(200).send({ user: result });
    })
    .catch(next);
};

exports.postUser = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send({ msg: "Missing required fields" });
  }
  return insertUser({ username, email, password })
    .then((result) => {
      res.status(201).send({ user: result });
    })
    .catch(next);
};
