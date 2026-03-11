const pool = require("../databasepg.js"); // import the db pool

async function getUserByUsername(username) {
  const result = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);

  return result.rows[0] || null;
}

module.exports = {
  getUserByUsername,
};
