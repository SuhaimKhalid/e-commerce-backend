const db = require("../db/connection.js");

exports.selectAllUsers = () => {
  return db.query("SELECT * FROM users").then((result) => {
    return result.rows[0];
  });
};

exports.selectSingalUser = (user_id) => {
  return db
    .query("SELECT * FROM users WHERE user_id= $1", [user_id])
    .then((result) => {
      return result.rows[0];
    });
};
