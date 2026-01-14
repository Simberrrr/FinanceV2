const client = require('../databasepg.js'); // import the db client

async function getUserByUsername(username) {
  const result = await client.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );

  return result.rows[0] || null;
}

module.exports = {
  getUserByUsername,
};
