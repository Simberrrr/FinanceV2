const { parse } = require("csv-parse");
const { Readable } = require("stream");

const pool = require("../databasepg.js");

const processFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const user = req.user;
  const client = await pool.connect();

  try {
    const parser = parse({ columns: true });
    Readable.from(req.file.buffer).pipe(parser);

    const rows = [];
    let skipped = 0;

    for await (const record of parser) {
      const dateRaw = record["Transaction Date"];
      const description = record["Description 1"];
      const amountRaw = record["CAD$"];

      // Validate required fields
      if (!dateRaw || !description || !amountRaw) {
        skipped++;
        continue;
      }

      // Validate & convert date
      const date = convertToISO(dateRaw);
      if (!date) {
        skipped++;
        continue;
      }

      // Validate amount is a number
      const amount = parseFloat(amountRaw);
      if (isNaN(amount)) {
        skipped++;
        continue;
      }

      rows.push([date, description, amount, user.id]);
    }

    if (rows.length === 0) {
      return res.status(400).json({
        error: "No valid transactions found in the file.",
        skipped,
      });
    }

    await client.query("BEGIN");

    let added = 0;
    for (const [date, description, amount, userId] of rows) {
      const result = await client.query(
        `INSERT INTO transactions (transaction_date, description, amount, user_id)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (transaction_date, description, amount, user_id) DO NOTHING`,
        [date, description, amount, userId],
      );
      if (result.rowCount > 0) added++;
    }

    await client.query("COMMIT");

    const duplicates = rows.length - added;

    res.status(200).json({
      message: "File processed successfully",
      added,
      skipped: skipped + duplicates,
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Failed to process the file." });
  } finally {
    client.release();
  }
};

/**
 * Converts MM/DD/YYYY to YYYY-MM-DD. Returns null on invalid input.
 */
function convertToISO(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;

  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;

  const [month, day, year] = parts;
  const m = parseInt(month, 10);
  const d = parseInt(day, 10);
  const y = parseInt(year, 10);

  if (isNaN(m) || isNaN(d) || isNaN(y)) return null;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

async function getTransactions(req, res) {
  const user = req.user;
  try {
    const result = await pool.query(
      "SELECT id, transaction_date, description, amount FROM transactions WHERE user_id = $1 ORDER BY transaction_date DESC;",
      [user.id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions." });
  }
}

module.exports = { processFile, getTransactions };
