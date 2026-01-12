require('dotenv').config();
const express = require('express');
const requireAuth = require("../authmiddleware");
const app = express();
const bcrypt = require('bcrypt');
app.use(express.json());
const router = express.Router();

router.use(requireAuth);


const users = []; 


router.get('/users', (req, res) => {
    res.json(users)})

app.post('/users', async (req, res) => {
    try{
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const user = {name: req.body.name,
        password: hashedPassword};
    users.push(user);
    // Logic to add a new user would go here
    res.status(201).send('User created');
    } catch {
        res.status(500).send();
    }
})

app.post("/login", async (req, res) => {
  const { password } = req.body;

  const valid = await bcrypt.compare(
    password,
    process.env.DASHBOARD_PASSWORD_HASH
  );

  if (!valid) {
    return res.status(401).json({ error: "Invalid password" });
  }

  res.sendStatus(200);
});

app.post('/users/login', async (req, res) => {
    const user = users.find(user => user.name === req.body.name);
    if (user == null) {
        return res.status(400).send('Cannot find user');
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            res.send('Success');
        } else {
            res.send('Not Allowed');
        }
    } catch {
        res.status(500).send();
    }
})

app.use('/api', router);

app.listen(3000)

