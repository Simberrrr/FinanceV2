const express = require('express');
const router = express.Router();
const client = require('../databasepg.js'); // import the db client
const bcrypt = require('bcrypt');
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

router.get('/:user', (req, res) => {
    const username = req.params.user; // from the URL
    client.query(`SELECT * FROM users WHERE username=$1`, [username], (err, result) => {
    if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Database query failed' });
    }
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]); // return the first matching user

  });
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

module.exports = router;
