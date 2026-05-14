const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { query } = require("../db/database");
const { requireAdmin } = require("../middleware/auth");
const { createLead }   = require("../services/zoho");

router.get("/users", requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await query("SELECT id, email, first_name, last_name, company, is_admin, created_at FROM users ORDER BY created_at");
    res.json(rows.map(u => ({ ...u, is_admin: !!u.is_admin, display_name: `${u.first_name} ${u.last_name}`.trim() })));
  } catch (e) { next(e); }
});

router.post("/users", requireAdmin, async (req, res, next) => {
  try {
    const { email, first_name, last_name, company, password, is_admin } = req.body;
    if (!email || !first_name || !last_name || !company || !password || password.length < 6)
      return res.status(400).json({ error: "Todos los campos son requeridos (contraseña mín. 6 caracteres)" });

    const hash = bcrypt.hashSync(password, 10);
    const { rows } = await query(
      "INSERT INTO users (email, first_name, last_name, company, password_hash, is_admin, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id",
      [email.trim().toLowerCase(), first_name.trim(), last_name.trim(), company.trim(), hash, is_admin ? 1 : 0, new Date().toISOString()]
    );
    createLead({ first_name: first_name.trim(), last_name: last_name.trim(), email: email.trim().toLowerCase(), company: company.trim() });
    res.json({ id: rows[0].id });
  } catch (e) {
    if (e.code === "23505") return res.status(409).json({ error: "Ya existe una cuenta con ese email" });
    next(e);
  }
});

router.put("/users/:id/password", requireAdmin, async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6)
      return res.status(400).json({ error: "Contraseña debe tener al menos 6 caracteres" });
    const { rows } = await query("SELECT id FROM users WHERE id = $1", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Usuario no encontrado" });
    await query("UPDATE users SET password_hash = $1 WHERE id = $2", [bcrypt.hashSync(password, 10), req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.delete("/users/:id", requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await query("SELECT id, is_admin FROM users WHERE id = $1", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Usuario no encontrado" });
    if (rows[0].is_admin && req.user.id === parseInt(req.params.id))
      return res.status(400).json({ error: "No podés eliminar tu propia cuenta de admin" });
    await query("DELETE FROM users WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
