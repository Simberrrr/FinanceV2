const express = require("express");
const multer = require("multer");
const sanitizeMiddleware = require("../middlewares/sanitizeMiddleware");
const { processFile } = require("../controllers/fileController");

const router = express.Router();
const upload = multer(); // For handling file uploads in memory

router.post("/upload", upload.single("file"), sanitizeMiddleware, processFile);

module.exports = router;
