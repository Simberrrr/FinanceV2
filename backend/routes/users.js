const express = require('express');
const router = express.Router();
const client = require('../databasepg.js'); // import the db client
const bcrypt = require('bcrypt');
const { getUserByUsername } = require('../db/users');
// GET /users
router.get('/', (req, res) => {
  client.query('SELECT * FROM users', (err, result) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Database query failed' });
    }
    console.log("Database query successful");
    res.json(result.rows);
  });
});

router.get('/:user', async (req, res) => {
  try {
    const user = await getUserByUsername(req.params.user);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log("User found:", user);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
  });


router.post('/user', async (req, res) => {
    try{
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const user = {username: req.body.username,
        password: hashedPassword};
    let insertQuery = `insert into users(username, password) 
                       values('${user.username}', '${user.password}')`

    client.query(insertQuery, (err, result)=>{
        if(!err){
            console.log('Insertion was successful');
        }
        else{ console.log(err.message) }
    })

    res.status(201).json({
        message: 'User created',
        user: { username: req.body.username }
    });
    } catch {
        res.status(500).send();
    }
})


router.post('/login', async (req, res) => {
    const user = await getUserByUsername(req.body.username);
    if (user == null) {
        return res.status(400).json({ error: 'Cannot find user' });
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            res.status(200).json({
                message: 'Login successful'
            });
        } else {
            res.status(401).json({
                error: 'Invalid email or password'
            });
        }
    } catch {
        res.status(500).send();
    }
})


router.post('/user', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await client.query(
      `INSERT INTO users (username, password)
       VALUES ($1, $2)
       RETURNING id, username`,
      [username, hashedPassword]
    );

    res.status(201).json({
      message: 'User created',
      user: result.rows[0]
    });

  } catch (err) {
    console.error(err.message);

    // Handle duplicate username (Postgres unique constraint)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username already exists' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});


router.delete('/:user', async (req, res) => {
    const userId = req.params.user;
    try{
     const result = await client.query(
      'DELETE FROM users WHERE username = $1',
      [userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Database error' });
    client.end;
}});

module.exports = router;
