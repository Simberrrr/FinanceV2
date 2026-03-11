require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const filesRouter = require("./routes/file");
const usersRouter = require("./routes/users");
// Middleware
app.use(express.json());
app.use(cors());
// Mount the router at /users
app.use("/users", usersRouter);
app.use("/file", filesRouter);
app.listen(3300, () => {
  console.log("Server running on port 3300");
});
