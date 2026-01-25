require("dotenv").config();
const express = require("express");
const app = express();

const filesRouter = require("./routes/files");
const cors = require('cors'); 
const usersRouter = require('./routes/users');
// Middleware
app.use(express.json());
app.use(cors());
// Mount the router at /users
app.use("/users", usersRouter);
app.use("/files", filesRouter);
app.listen(3300, () => {
  console.log("Server running on port 3300");
});

// const users = [];
// const bodyParser = require("body-parser");
// app.use(bodyParser.json());

// app.get('/users', (req, res) => {
//     res.json(users)})

// app.post('/users', async (req, res) => {
//     try{
//         const salt = await bcrypt.genSalt();
//         const hashedPassword = await bcrypt.hash(req.body.password, salt);
//     const user = {name: req.body.name,
//         password: hashedPassword};
//     users.push(user);
//     // Logic to add a new user would go here
//     res.status(201).send('User created');
//     } catch {
//         res.status(500).send();
//     }
// })

// app.post('/users/login', async (req, res) => {
//     const user = users.find(user => user.name === req.body.name);
//     if (user == null) {
//         return res.status(400).send('Cannot find user');
//     }
//     try {
//         if (await bcrypt.compare(req.body.password, user.password)) {
//             res.send('Success');
//         } else {
//             res.send('Not Allowed');
//         }
//     } catch {
//         res.status(500).send();
//     }
// })

// app.use('/api', router);

// app.listen(3300)
