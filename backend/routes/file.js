const express = require("express");
const multer = require("multer");

const { processFile } = require("../controllers/fileController");

const router = express.Router();
const upload = multer(); // For handling file uploads in memory

router.post("/upload", upload.single("file"), processFile);
module.exports = router;
