import { useState } from "react";
import { S, B, FLAG, fmtDate, fmtDateTime } from "../styles";
import { api } from "../api";

function ManualResult({ match, current, onSave }) {
  const [h, setH] = useState(current?.home_score ?? "");
  const [a, setA] = useState(current?.away_score ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (h === "" || a === "") return;
    setSaving(true);
    try {
      await onSave(parseInt(h), parseInt(a));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input type="number" min="0" max="20" style={{ ...S.scoreInput, width: 40 }}
        value={h} onChange={e => setH(e.target.value)} />
      <span style={{ fontWeight: 700, color: B.gray50 }}>–</span>
      <input type="number" min="0" max="20" style={{ ...S.scoreInput, width: 40 }}
        value={a} onChange={e => setA(e.target.value)} />
      <button style={S.betBtn(!!current)} onClick={save} disabled={saving}>
        {saving ? "..." : current ? "Actualizar" : "Guardar"}
      </button>
    </div>
  );
}

function UserManager() {
  const [users, setUsers]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [form, setForm]         = useState({ email: "", first_name: "", last_name: "", company: "", password: "", is_admin: false });
  const [error, setError]       = useState("");
  const [newPwd, setNewPwd]     = useState({});

  const loadUsers = async () => {
    setLoading(true);
    try { setUsers(await api.getUsers()); } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const createUser = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.createUser(form);
      setForm({ email: "", first_name: "", last_name: "", company: "", password: "", is_admin: false });
      await loadUsers();
    } catch (e) { setError(e.message); }
  };

  const deleteUser = async (id, name) => {
    if (!confirm(`¿Eliminar usuario "${name}"?`)) return;
    try { await api.deleteUser(id); await loadUsers(); } catch (e) { alert(e.message); }
  };

  const resetPwd = async (id) => {
    const pwd = newPwd[id];
    if (!pwd || pwd.length < 6) { alert("Contraseña mín. 6 caracteres"); return; }
    try {
      await api.resetPassword(id, pwd);
      setNewPwd(p => ({ ...p, [id]: "" }));
      alert("Contraseña actualizada");
    } catch (e) { alert(e.message); }
  };

  return (
    <div style={S.card}>
      <div style={S.cardHeader}>
        <span style={S.cardHeaderTitle}>Gestión de usuarios</span>
        <button onClick={loadUsers} style={{ marginLeft: "auto", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 6, color: B.white, padding: "4px 12px", cursor: "pointer", fontSize: 14, fontFamily: "'Montserrat',sans-serif", fontWeight: 600 }}>
          {loading ? "Cargando..." : users ? "Recargar" : "Ver usuarios"}
        </button>
      </div>

      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${B.grayBorder}` }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: B.gray70, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Nuevo usuario</div>
        {error && <div style={S.errorMsg}>{error}</div>}
        <form onSubmit={createUser} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label style={{ ...S.label, marginBottom: 4 }}>Nombre</label>
            <input style={{ ...S.inputField, marginBottom: 0, width: 130 }} placeholder="Juan"
              value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
          </div>
          <div>
            <label style={{ ...S.label, marginBottom: 4 }}>Apellido</label>
            <input style={{ ...S.inputField, marginBottom: 0, width: 130 }} placeholder="García"
              value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
          </div>
          <div>
            <label style={{ ...S.label, marginBottom: 4 }}>Empresa</label>
            <input style={{ ...S.inputField, marginBottom: 0, width: 160 }} placeholder="Empresa S.A."
              value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
          </div>
          <div>
            <label style={{ ...S.label, marginBottom: 4 }}>Email</label>
            <input type="email" style={{ ...S.inputField, marginBottom: 0, width: 190 }} placeholder="juan@empresa.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label style={{ ...S.label, marginBottom: 4 }}>Contraseña</label>
            <input type="password" style={{ ...S.inputField, marginBottom: 0, width: 130 }} placeholder="mín. 6 chars"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, paddingBottom: 2 }}>
            <input type="checkbox" id="is_admin" checked={form.is_admin}
              onChange={e => setForm(f => ({ ...f, is_admin: e.target.checked }))} />
            <label htmlFor="is_admin" style={{ fontSize: 13, color: B.gray70, cursor: "pointer" }}>Admin</label>
          </div>
          <button type="submit" style={{ ...S.primaryBtn, width: "auto", padding: "10px 20px" }}>Crear</button>
        </form>
      </div>

      {users && (
        <div>
          {users.map(u => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", padding: "12px 20px", borderBottom: `1px solid ${B.grayBorder}`, gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#2a2a2a" }}>{u.display_name}</span>
                <span style={{ fontSize: 14, color: B.gray50, marginLeft: 8 }}>{u.email}</span>
                {u.company && <span style={{ fontSize: 14, color: B.gray50, marginLeft: 6 }}>· {u.company}</span>}
                {u.is_admin && <span style={{ marginLeft: 8, fontSize: 13, background: B.bluePale, color: B.blue, borderRadius: 10, padding: "1px 8px", fontWeight: 700 }}>admin</span>}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="password" placeholder="nueva contraseña" style={{ ...S.inputField, marginBottom: 0, width: 160, padding: "6px 10px", fontSize: 14 }}
                  value={newPwd[u.id] || ""}
                  onChange={e => setNewPwd(p => ({ ...p, [u.id]: e.target.value }))} />
                <button onClick={() => resetPwd(u.id)} style={{ background: B.gold, color: B.white, border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontFamily: "'Montserrat',sans-serif", fontWeight: 600, fontSize: 14 }}>
                  Reset pwd
                </button>
                <button onClick={() => deleteUser(u.id, u.display_name)} style={{ background: B.red, color: B.white, border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontFamily: "'Montserrat',sans-serif", fontWeight: 600, fontSize: 14 }}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Admin({ matches, results, setResults, lastSync, onSync, syncing }) {
  const lockedMatches = matches.filter(m => new Date(m.date) < new Date());

  const saveResult = async (matchId, h, a) => {
    await api.saveResult(matchId, h, a);
    setResults(prev => {
      const without = prev.filter(r => r.match_id !== matchId);
      return [...without, { match_id: matchId, home_score: h, away_score: a }];
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={S.card}>
        <div style={S.cardHeader}>
          <span style={S.cardHeaderTitle}>Panel de resultados</span>
        </div>
        <div style={{ padding: "16px 20px" }}>
          <p style={{ fontSize: 13, color: B.gray70, marginBottom: 12 }}>
            Los resultados se sincronizan automáticamente cada 5 minutos desde <strong>football-data.org</strong>. También podés forzar la sincronización.
          </p>
          <button style={{ ...S.primaryBtn, width: "auto", padding: "10px 28px" }} onClick={onSync} disabled={syncing}>
            {syncing ? "Sincronizando..." : "🔄 Sincronizar ahora"}
          </button>
          {lastSync && (
            <div style={{ marginTop: 10, fontSize: 14, color: B.gray50 }}>
              Última sincronización: {fmtDateTime(lastSync.includes("Z") || lastSync.includes("+") ? lastSync : lastSync.replace(" ", "T") + "Z")}
            </div>
          )}
        </div>
      </div>

      <div style={S.card}>
        <div style={S.cardHeader}>
          <span style={S.cardHeaderTitle}>Carga manual de resultados</span>
        </div>
        {lockedMatches.length === 0 && (
          <div style={{ padding: 24, textAlign: "center", color: B.gray50, fontSize: 13 }}>
            Aún no hay partidos finalizados para cargar.
          </div>
        )}
        {lockedMatches.map(m => {
          const current = results.find(r => r.match_id === m.id);
          return (
            <div key={m.id} style={S.matchRow(!!current)}>
              <div style={S.matchDate}>{fmtDate(m.date)}</div>
              <div style={{ ...S.teams, justifyContent: "flex-start", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>
                  {FLAG(m.homeCode)} {m.home} vs {m.away} {FLAG(m.awayCode)}
                </span>
              </div>
              <ManualResult match={m} current={current} onSave={(h, a) => saveResult(m.id, h, a)} />
            </div>
          );
        })}
      </div>

      <UserManager />
    </div>
  );
}
