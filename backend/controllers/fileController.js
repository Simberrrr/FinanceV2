const processFile = (req, res) => {
  try {
    const sanitizedData = req.sanitizedData;

    // Example: Extract specific columns or perform additional processing
    const processedData = sanitizedData.map((row) => ({
      column1: row[0], // Replace with actual column index
      column2: row[1], // Replace with actual column index
    }));

    res.status(200).json({ data: processedData });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Failed to process the file." });
  }
};

module.exports = { processFile };
