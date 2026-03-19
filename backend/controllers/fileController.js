const { parse } = require("csv-parse");
const { Readable } = require("stream");
const axios = require("axios");
const ALLOWED_COLUMNS = new Set(["Transaction Date", "Description 1", "CAD$"]);

const pool = require("../databasepg.js");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5000";

const processFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const user = req.user;
  console.log(user.id);
  try {
    const parser = parse({ columns: true });

    Readable.from(req.file.buffer).pipe(parser);

    const rows = [];
    for await (const record of parser) {
      const filtered = Object.fromEntries(
        Object.entries(record).filter(([key]) => ALLOWED_COLUMNS.has(key)),
      );
      rows.push(filtered);
    }

    const descriptions = rows.map((row) => row["Description 1"]);
    const { data: classifications } = await axios.post(
      `${ML_SERVICE_URL}/classify`,
      { descriptions },
    );

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const category = classifications[i]?.category || "Unknown";
      await pool.query(
        "INSERT INTO transactions (transaction_date, description, amount, category, user_id) VALUES ($1, $2, $3, $4, $5)",
        [
          convertToISO(row["Transaction Date"]),
          row["Description 1"],
          row["CAD$"],
          category,
          user.id,
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

function convertToISO(dateStr) {
  const [month, day, year] = dateStr.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

async function getTransactions(req, res) {
  const user = req.user;
  try {
    const result = await pool.query(
      "SELECT id, transaction_date, description, amount, category FROM transactions WHERE user_id = $1 ORDER BY transaction_date DESC;",
      [user.id],
    );
    res.json(result.rows); // returns the actual transactions
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions." });
  }
}

module.exports = { processFile, getTransactions };
