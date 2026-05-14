const router  = require("express").Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const { query } = require("../db/database");
const { requireAuth } = require("../middleware/auth");
const { createLead }  = require("../services/zoho");

function makeToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name,
      display_name: `${user.first_name} ${user.last_name}`.trim(),
      company: user.company, is_admin: !!user.is_admin },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function publicUser(u) {
  return { id: u.id, email: u.email, first_name: u.first_name, last_name: u.last_name,
           display_name: `${u.first_name} ${u.last_name}`.trim(),
           company: u.company, is_admin: !!u.is_admin };
}

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email y contraseña requeridos" });
    const { rows } = await query("SELECT * FROM users WHERE email = $1", [email.trim().toLowerCase()]);
    const user = rows[0];
    if (!user || !bcrypt.compareSync(password, user.password_hash))
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    res.json({ token: makeToken(user), user: publicUser(user) });
  } catch (e) { next(e); }
});

router.post("/register", async (req, res, next) => {
  try {
    const { email, password, first_name, last_name, company } = req.body;
    if (!email || !password || !first_name || !last_name || !company)
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    if (password.length < 6)
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    const emailLower = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower))
      return res.status(400).json({ error: "Email inválido" });

    const hash = bcrypt.hashSync(password, 10);
    const { rows } = await query(
      "INSERT INTO users (email, first_name, last_name, company, password_hash, created_at) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [emailLower, first_name.trim(), last_name.trim(), company.trim(), hash, new Date().toISOString()]
    );
    const user = rows[0];
    createLead({ first_name: user.first_name, last_name: user.last_name, email: user.email, company: user.company });
    res.status(201).json({ token: makeToken(user), user: publicUser(user) });
  } catch (e) {
    if (e.code === "23505") return res.status(409).json({ error: "Ya existe una cuenta con ese email" });
    next(e);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query("SELECT * FROM users WHERE id = $1", [req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(publicUser(rows[0]));
  } catch (e) { next(e); }
});

router.post("/change-password", requireAuth, async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password || new_password.length < 6)
      return res.status(400).json({ error: "Contraseña nueva debe tener al menos 6 caracteres" });
    const { rows } = await query("SELECT * FROM users WHERE id = $1", [req.user.id]);
    if (!bcrypt.compareSync(current_password, rows[0].password_hash))
      return res.status(401).json({ error: "Contraseña actual incorrecta" });
    await query("UPDATE users SET password_hash = $1 WHERE id = $2", [bcrypt.hashSync(new_password, 10), req.user.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
