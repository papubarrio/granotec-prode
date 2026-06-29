const router = require("express").Router();
const { query } = require("../db/database");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { MATCHES, TLA_TO_ISO2, TLA_TO_NAME } = require("./matches");

const TLA_INDEX = {};
MATCHES.forEach(m => {
  if (m.homeTla !== "??") TLA_INDEX[`${m.homeTla}|${m.awayTla}`] = m.id;
});

const STAGE_RANGES = {
  LAST_32:        [73, 88],
  LAST_16:        [89, 96],
  QUARTER_FINALS: [97, 100],
  SEMI_FINALS:    [101, 102],
  THIRD_PLACE:    [103, 103],
  FINAL:          [104, 104],
};

function localIdsByStage(startId, endId) {
  return MATCHES
    .filter(m => m.id >= startId && m.id <= endId)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(m => m.id);
}

async function syncFromApi() {
  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) return { ok: false, error: "API key no configurada" };
  try {
    const res = await fetch(
      "https://api.football-data.org/v4/competitions/WC/matches",
      { headers: { "X-Auth-Token": apiKey } }
    );
    const remaining = res.headers.get("X-RequestsAvailable");
    const resetIn   = res.headers.get("X-RequestCounter-Reset");
    if (remaining !== null) {
      console.log(`[sync] Requests remaining: ${remaining}, resets in: ${resetIn}s`);
      if (parseInt(remaining) <= 2) return { ok: false, error: "Rate limit casi alcanzado" };
    }
    if (res.status === 429) return { ok: false, error: "Rate limit alcanzado" };
    if (!res.ok) throw new Error(`API error ${res.status}`);

    const { matches = [] } = await res.json();
    const now = new Date().toISOString();
    let savedResults = 0, savedTeams = 0;

    // Group stage: match by TLA pair
    for (const m of matches) {
      if (m.status !== "FINISHED") continue;
      const hTla = m.homeTeam?.tla;
      const aTla = m.awayTeam?.tla;
      if (!hTla || !aTla) continue;
      const localId = TLA_INDEX[`${hTla}|${aTla}`];
      if (!localId) continue;
      const h = m.score?.fullTime?.home;
      const a = m.score?.fullTime?.away;
      if (h != null && a != null) {
        await query(`
          INSERT INTO results (match_id, home_score, away_score, updated_at)
          VALUES ($1,$2,$3,$4)
          ON CONFLICT (match_id) DO UPDATE SET
            home_score = EXCLUDED.home_score,
            away_score = EXCLUDED.away_score,
            updated_at = EXCLUDED.updated_at
        `, [localId, h, a, now]);
        savedResults++;
      }
    }

    // Knockout stages: match by chronological position within each stage
    for (const [stage, [startId, endId]] of Object.entries(STAGE_RANGES)) {
      const apiMatches = matches
        .filter(m => m.stage === stage && m.homeTeam?.tla && m.homeTeam.tla !== "??")
        .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
      const localIds = localIdsByStage(startId, endId);

      for (let i = 0; i < Math.min(apiMatches.length, localIds.length); i++) {
        const am = apiMatches[i];
        const localId = localIds[i];
        const hTla = am.homeTeam.tla;
        const aTla = am.awayTeam.tla;

        await query(`
          INSERT INTO match_teams (match_id, home, home_code, away, away_code, date)
          VALUES ($1,$2,$3,$4,$5,$6)
          ON CONFLICT (match_id) DO UPDATE SET
            home = EXCLUDED.home, home_code = EXCLUDED.home_code,
            away = EXCLUDED.away, away_code = EXCLUDED.away_code,
            date = EXCLUDED.date
        `, [localId,
            TLA_TO_NAME[hTla] || am.homeTeam.name, TLA_TO_ISO2[hTla] || "??",
            TLA_TO_NAME[aTla] || am.awayTeam.name, TLA_TO_ISO2[aTla] || "??",
            am.utcDate]);
        savedTeams++;

        if (am.status === "FINISHED") {
          const h = am.score?.fullTime?.home;
          const a = am.score?.fullTime?.away;
          if (h != null && a != null) {
            await query(`
              INSERT INTO results (match_id, home_score, away_score, updated_at)
              VALUES ($1,$2,$3,$4)
              ON CONFLICT (match_id) DO UPDATE SET
                home_score = EXCLUDED.home_score,
                away_score = EXCLUDED.away_score,
                updated_at = EXCLUDED.updated_at
            `, [localId, h, a, now]);
            savedResults++;
          }
        }
      }
    }

    await query("INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
      ["last_sync", now]);
    console.log(`[sync] Resultados: ${savedResults} | Equipos resueltos: ${savedTeams}`);
    return { ok: true, savedResults, savedTeams };
  } catch (e) {
    console.error("[sync] Error:", e.message);
    return { ok: false, error: e.message };
  }
}

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { rows }    = await query("SELECT match_id, home_score, away_score FROM results");
    const { rows: s } = await query("SELECT value FROM settings WHERE key = 'last_sync'");
    res.json({ results: rows, last_sync: s[0]?.value || null });
  } catch (e) { next(e); }
});

router.post("/sync", requireAdmin, async (req, res) => {
  res.json(await syncFromApi());
});

router.post("/:matchId", requireAdmin, async (req, res, next) => {
  try {
    const matchId = parseInt(req.params.matchId);
    const { home_score, away_score } = req.body;
    if (home_score == null || away_score == null || isNaN(matchId))
      return res.status(400).json({ error: "Datos incompletos" });
    await query(`
      INSERT INTO results (match_id, home_score, away_score, updated_at)
      VALUES ($1,$2,$3,$4)
      ON CONFLICT (match_id) DO UPDATE SET
        home_score = EXCLUDED.home_score,
        away_score = EXCLUDED.away_score,
        updated_at = EXCLUDED.updated_at
    `, [matchId, parseInt(home_score), parseInt(away_score), new Date().toISOString()]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
module.exports.syncFromApi = syncFromApi;
