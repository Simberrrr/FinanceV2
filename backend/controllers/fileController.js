const { parse } = require("csv-parse");
const { Readable } = require("stream");
const ALLOWED_COLUMNS = new Set(["Transaction Date", "Description 1", "CAD$"]);

const pool = require("../databasepg.js");

const processFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const parser = parse({ columns: true });

    Readable.from(req.file.buffer).pipe(parser);

    for await (const record of parser) {
      const filtered = Object.fromEntries(
        Object.entries(record).filter(([key]) => ALLOWED_COLUMNS.has(key)),
      );
      console.log(filtered);
      await pool.query(
        "INSERT INTO transactions (transaction_date, description, amount) VALUES ($1, $2, $3)",
        [
          filtered["Transaction Date"],
          filtered["Description 1"],
          filtered["CAD$"],
        ],
      );
    }

    console.log("Finished processing uploaded file");

    res.status(200).json({ message: "File processing started" });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Failed to process the file." });
  }
};

module.exports = { processFile };
