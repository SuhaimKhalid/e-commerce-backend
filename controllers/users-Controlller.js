const {
  selectAllUsers,
  selectSingalUser,
} = require("../models/users-model.js");

exports.getAllUsers = (req, res, next) => {
  return selectAllUsers().then((result) => {
    res.status(200).send({ users: result });
  });
};

exports.getSingalUser = (req, res, next) => {
  const { user_id } = req.params;

  return selectSingalUser(user_id).then((result) => {
    res.status(200).send({ user: result });
  });
};
