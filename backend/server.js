require("dotenv").config();
const express    = require("express");
const path       = require("path");
const cron       = require("node-cron");
const { initDB } = require("./db/database");
const { syncFromApi } = require("./routes/results");

const app = express();
app.use(express.json());

app.use("/api/auth",    require("./routes/auth"));
app.use("/api/matches", require("./routes/matches"));
app.use("/api/bets",    require("./routes/bets"));
app.use("/api/results", require("./routes/results"));
app.use("/api/admin",   require("./routes/admin"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Error interno del servidor" });
});

const DIST = path.join(__dirname, "public", "dist");
app.use(express.static(DIST));
app.get("*", (req, res) => res.sendFile(path.join(DIST, "index.html")));

cron.schedule("*/5 * * * *", async () => { await syncFromApi(); });

const PORT = process.env.PORT || 3001;

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Granotec Prode running on port ${PORT}`);
      if (!process.env.FOOTBALL_API_KEY) console.warn("FOOTBALL_API_KEY not set");
    });
  })
  .catch(err => {
    console.error("DB init failed:", err);
    process.exit(1);
  });
