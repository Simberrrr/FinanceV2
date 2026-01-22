const sanitizeMiddleware = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const csvData = req.file.buffer.toString("utf-8");
    const sanitizedData = csvData
      .split("\n")
      .filter((row) => row.trim() !== "") // Remove empty rows
      .map((row) => row.split(",").map((value) => value.trim())); // Trim each value

    req.sanitizedData = sanitizedData;
    next();
  } catch (error) {
    console.error("Error sanitizing CSV data:", error);
    res.status(500).json({ error: "Failed to process the file." });
  }
};

module.exports = sanitizeMiddleware;
