const express = require("express");
const multer = require("multer");

const {
  processFile,
  getTransactions,
} = require("../controllers/fileController");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();
const upload = multer(); // For handling file uploads in memory

router.post("/upload", authenticateToken, upload.single("file"), processFile);

router.get("/transactions", authenticateToken, getTransactions);

module.exports = router;
