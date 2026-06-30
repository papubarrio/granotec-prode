const router = require("express").Router();
const { query } = require("../db/database");
const { requireAuth } = require("../middleware/auth");

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query("SELECT match_id, home_score, away_score, penalty_winner FROM bets WHERE user_id = $1", [req.user.id]);
    res.json(rows);
  } catch (e) { next(e); }
});

router.get("/all", requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT b.user_id, (u.first_name || ' ' || u.last_name) AS display_name,
             b.match_id, b.home_score, b.away_score, b.penalty_winner
      FROM bets b JOIN users u ON u.id = b.user_id
      WHERE u.hidden_from_leaderboard = 0
    `);
    res.json(rows);
  } catch (e) { next(e); }
});

router.post("/:matchId", requireAuth, async (req, res, next) => {
  try {
    const matchId = parseInt(req.params.matchId);
    const { home_score, away_score, penalty_winner } = req.body;
    if (home_score == null || away_score == null || isNaN(matchId))
      return res.status(400).json({ error: "Datos incompletos" });
    if (penalty_winner != null && !["home", "away"].includes(penalty_winner))
      return res.status(400).json({ error: "penalty_winner inválido" });

    await query(`
      INSERT INTO bets (user_id, match_id, home_score, away_score, penalty_winner, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, match_id) DO UPDATE SET
        home_score = EXCLUDED.home_score,
        away_score = EXCLUDED.away_score,
        penalty_winner = EXCLUDED.penalty_winner,
        updated_at = EXCLUDED.updated_at
    `, [req.user.id, matchId, parseInt(home_score), parseInt(away_score), penalty_winner || null, new Date().toISOString()]);

    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
