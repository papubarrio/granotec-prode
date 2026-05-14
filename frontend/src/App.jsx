import { useState, useEffect, useCallback } from "react";
import { S, B, fmtDateTime } from "./styles";
import { useIsMobile } from "./hooks";
import { api, getToken, clearToken } from "./api";
import Login from "./components/Login";
import GranotecLogo from "./components/GranotecLogo";
import Fixture from "./components/Fixture";
import Leaderboard from "./components/Leaderboard";
import MyBets from "./components/MyBets";
import Admin from "./components/Admin";

export default function App() {
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [matches, setMatches]   = useState([]);
  const [myBets, setMyBets]     = useState([]);
  const [allBets, setAllBets]   = useState([]);
  const [results, setResults]   = useState([]);
  const [lastSync, setLastSync] = useState(null);
  const [syncing, setSyncing]   = useState(false);
  const [tab, setTab]           = useState("fixture");

  // Restore session from stored JWT
  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    api.getMe()
      .then(u => { setUser(u); })
      .catch(() => { clearToken(); })
      .finally(() => setLoading(false));
  }, []);

  const loadData = useCallback(async () => {
    if (!user) return;
    const [m, b, ab, r] = await Promise.all([
      api.getMatches().catch(() => []),
      api.getMyBets().catch(() => []),
      api.getAllBets().catch(() => []),
      api.getResults().catch(() => ({ results: [], last_sync: null })),
    ]);
    setMatches(m);
    setMyBets(b);
    setAllBets(ab);
    setResults(r.results || []);
    setLastSync(r.last_sync);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // Poll results every 5 minutes
  useEffect(() => {
    if (!user) return;
    const iv = setInterval(() => {
      api.getResults()
        .then(r => { setResults(r.results || []); setLastSync(r.last_sync); })
        .catch(() => {});
    }, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, [user]);

  const handleLogin = (u) => {
    setUser(u);
  };

  const handleLogout = () => {
    clearToken();
    setUser(null);
    setMatches([]); setMyBets([]); setAllBets([]); setResults([]);
    setTab("fixture");
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.syncResults();
      const r = await api.getResults();
      setResults(r.results || []);
      setLastSync(r.last_sync);
      // Refresh all bets after sync (scores may have changed)
      const ab = await api.getAllBets().catch(() => []);
      setAllBets(ab);
    } catch (e) {
      alert("Error al sincronizar: " + e.message);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: B.blue, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <GranotecLogo height={32} white />
        <div style={{ color: B.white, fontFamily: "'Montserrat',sans-serif", fontWeight: 600, fontSize: 14, opacity: 0.8 }}>Cargando prode...</div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const isMobile = useIsMobile();

  const tabs = [
    { key: "fixture", label: "🗓 Fixture & Apuestas", short: "🗓 Fixture" },
    { key: "tabla",   label: "🏅 Tabla de posiciones", short: "🏅 Tabla" },
    { key: "mis",     label: "📋 Mis apuestas",        short: "📋 Mis bets" },
    ...(user.is_admin ? [{ key: "admin", label: "⚙ Admin", short: "⚙ Admin" }] : []),
  ];

  return (
    <div style={S.app}>
      <div style={S.header}>
        <div style={{ ...S.headerInner, padding: isMobile ? "10px 14px" : "14px 24px" }}>
          <div style={S.logoGroup}>
            <GranotecLogo height={isMobile ? 18 : 28} white />
            {!isMobile && (
              <>
                <div style={S.dividerV} />
                <div>
                  <div style={S.proDeTitle}>🏆 Prode Mundial 2026</div>
                  <div style={S.proDeYear}>USA · Canadá · México</div>
                </div>
              </>
            )}
            {isMobile && (
              <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: 14, marginLeft: 8 }}>
                🏆 Prode 2026
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 10 }}>
            {syncing && !isMobile && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>🔄</div>}
            {lastSync && !syncing && !isMobile && (
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
                ✓ {new Date(lastSync.includes("Z") || lastSync.includes("+") ? lastSync : lastSync.replace(" ", "T") + "Z").toLocaleTimeString("es-AR", { timeZone: "America/Argentina/Buenos_Aires", hour: "2-digit", minute: "2-digit" })}
              </div>
            )}
            <div style={{ ...S.playerPill, fontSize: isMobile ? 13 : 15, padding: isMobile ? "5px 10px" : "6px 14px" }}
              onClick={handleLogout} title="Cerrar sesión">
              👤 {isMobile ? user.first_name : user.display_name}
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...S.main, padding: isMobile ? "16px 12px 60px" : "28px 20px 60px" }}>
        <div className="tab-bar" style={{ ...S.tabBar, gap: isMobile ? 0 : 4 }}>
          {tabs.map(t => (
            <button key={t.key}
              style={{ ...S.tab(tab === t.key), fontSize: isMobile ? 12 : 14, padding: isMobile ? "10px 12px" : "10px 20px", whiteSpace: "nowrap" }}
              onClick={() => setTab(t.key)}>
              {isMobile ? t.short : t.label}
            </button>
          ))}
        </div>

        {tab === "fixture" && (
          <Fixture matches={matches} myBets={myBets} setMyBets={setMyBets} results={results} />
        )}
        {tab === "tabla" && (
          <Leaderboard allBets={allBets} results={results} currentUser={user} />
        )}
        {tab === "mis" && (
          <MyBets matches={matches} myBets={myBets} results={results} currentUser={user} />
        )}
        {tab === "admin" && user.is_admin && (
          <Admin
            matches={matches}
            results={results}
            setResults={setResults}
            lastSync={lastSync}
            onSync={handleSync}
            syncing={syncing}
          />
        )}
      </div>

      <div style={{ borderTop: `3px solid ${B.blue}`, background: B.white, padding: "16px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <GranotecLogo height={20} />
          <span style={{ fontSize: 13, color: B.gray50, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase" }}>
            Prode Mundial 2026 · Nutrición y Biociencia para un Mundo Mejor
          </span>
        </div>
      </div>
    </div>
  );
}
