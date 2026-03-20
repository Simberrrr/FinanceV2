const express = require("express");
const multer = require("multer");

const {
  processFile,
  getTransactions,
  updateCategories,
} = require("../controllers/fileController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "text/csv" && !file.originalname.endsWith(".csv")) {
      return cb(new Error("Only CSV files are allowed"));
    }
    cb(null, true);
  },
});

router.post(
  "/upload",
  authenticateToken,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res
            .status(413)
            .json({ error: "File too large. Maximum size is 5 MB." });
        }
        return res.status(400).json({ error: err.message });
      }
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  processFile,
);

router.get("/transactions", authenticateToken, getTransactions);
router.patch("/transactions/categories", authenticateToken, updateCategories);

module.exports = router;
