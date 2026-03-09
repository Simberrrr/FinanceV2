require('dotenv').config();
const {Client} = require('pg');

const client = new Client ({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: Number(process.env.DB_PORT),
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

// Connect once when the app starts
client.connect(err => {
  if (err) {
    console.error('Database connection error', err.stack);
  } else {
    console.log('Connected to database');
  }
});

// Export the client so other files can use it
module.exports = client;

