const { parse } = require("csv-parse");
const { Readable } = require("stream");
const ALLOWED_COLUMNS = new Set(["Transaction Date", "Description 1", "CAD$"]);

const pool = require("../databasepg.js");

const processFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const user = req.user;
  console.log(user.id);
  try {
    const parser = parse({ columns: true });

    Readable.from(req.file.buffer).pipe(parser);

    for await (const record of parser) {
      const filtered = Object.fromEntries(
        Object.entries(record).filter(([key]) => ALLOWED_COLUMNS.has(key)),
      );
      console.log(filtered);
      await pool.query(
        "INSERT INTO transactions (transaction_date, description, amount, user_id) VALUES ($1, $2, $3, $4)",
        [
          convertToISO(filtered["Transaction Date"]),
          filtered["Description 1"],
          filtered["CAD$"],
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

module.exports = { processFile };
