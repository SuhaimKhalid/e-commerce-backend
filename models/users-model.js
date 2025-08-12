const db = require("../db/connection.js");

exports.selectAllUsers = () => {
  return db.query("SELECT * FROM users").then((result) => {
    return result.rows;
  });
};

exports.selectSingalUser = (user_id) => {
  return db
    .query("SELECT * FROM users WHERE user_id= $1", [user_id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not Found" });
      }
      return result.rows[0];
    });
};

exports.insertUser = ({ username, email, password }) => {
  return db
    .query(
      `INSERT INTO users (username,email,password) VALUES ($1,$2,$3) RETURNING *;`,
      [username, email, password]
    )
    .then((result) => {
      return result.rows[0];
    });
};
