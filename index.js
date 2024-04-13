const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

mongoose
  .connect(
    "mongodb+srv://priyanshg615:p87lEoTCim6jnidH@cluster0.kjvtciy.mongodb.net/",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB Atlas:", error);
  });

const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String,
});

const URL = mongoose.model("URL", urlSchema);

app.use(cors());
app.use(express.json());

const BASE62_CHARS =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function toBase62(num) {
  let base62 = "";
  do {
    base62 = BASE62_CHARS[num % 62] + base62;
    num = Math.floor(num / 62);
  } while (num > 0);
  return base62;
}

app.post("/shorten", async (req, res) => {
  const { originalUrl } = req.body;

  const uniqueId = Date.now();
  const shortCode = toBase62(uniqueId);

  try {
    const shortUrl = `${req.protocol}://${req.get("host")}/${shortCode}`;
    const url = new URL({ originalUrl, shortUrl });
    await url.save();
    res.json({ shortUrl: shortUrl });
  } catch (error) {
    console.error("Error saving URL to database:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/:shortCode", async (req, res) => {
  const { shortCode } = req.params;
  try {
    const url = await URL.findOne({
      shortUrl: `https://make-it-easyy/${shortCode}`,
    });
    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }
    res.redirect(url.originalUrl);
  } catch (error) {
    console.error("Error fetching URL from database:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
