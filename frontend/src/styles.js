export const B = {
  blue:       "#005cb9",
  blueDark:   "#004a96",
  blueLight:  "#1a7ad4",
  bluePale:   "#e8f1fb",
  white:      "#ffffff",
  gray70:     "#706f6f",
  gray50:     "#9d9d9c",
  grayLight:  "#f2f4f8",
  grayBorder: "#dde3ed",
  gold:       "#c9a84c",
  red:        "#c0392b",
  green:      "#1e8a3c",
};

export const S = {
  app: { fontFamily: "'Montserrat', sans-serif", background: B.grayLight, minHeight: "100vh", color: B.gray70 },
  header: { background: B.blue, padding: "0", boxShadow: "0 3px 16px rgba(0,92,185,0.25)", position: "sticky", top: 0, zIndex: 100 },
  headerInner: { maxWidth: 1080, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  logoGroup: { display: "flex", alignItems: "center", gap: 14 },
  brandName: { fontWeight: 800, fontSize: 22, letterSpacing: 2, color: B.white, textTransform: "uppercase" },
  dividerV: { width: 1, height: 36, background: "rgba(255,255,255,0.25)", margin: "0 4px" },
  proDeTitle: { fontWeight: 700, fontSize: 18, color: B.white, letterSpacing: 1 },
  proDeYear: { fontWeight: 300, fontSize: 14, color: "rgba(255,255,255,0.65)", letterSpacing: 2, textTransform: "uppercase" },
  playerPill: { background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "6px 14px", fontSize: 15, fontWeight: 600, color: B.white, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "background 0.2s" },
  main: { maxWidth: 1080, margin: "0 auto", padding: "28px 20px 60px" },
  tabBar: { display: "flex", gap: 4, marginBottom: 24, borderBottom: `2px solid ${B.grayBorder}` },
  tab: (active) => ({ padding: "10px 20px", fontFamily: "'Montserrat', sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: 0.5, color: active ? B.blue : B.gray50, background: "none", border: "none", cursor: "pointer", borderBottom: active ? `2px solid ${B.blue}` : "2px solid transparent", marginBottom: -2, transition: "all 0.2s", textTransform: "uppercase" }),
  card: { background: B.white, borderRadius: 10, border: `1px solid ${B.grayBorder}`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" },
  cardHeader: { background: B.blue, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10 },
  cardHeaderTitle: { fontWeight: 700, fontSize: 14, color: B.white, letterSpacing: 1, textTransform: "uppercase" },
  matchRow: (hasBet) => ({ display: "flex", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${B.grayBorder}`, background: hasBet ? "rgba(0,92,185,0.04)" : B.white, gap: 12 }),
  matchDate: { fontSize: 13, color: B.gray50, fontWeight: 600, minWidth: 100 },
  teams: { flex: 1, display: "flex", alignItems: "center", gap: 10, justifyContent: "center" },
  vsBox: { background: B.grayLight, borderRadius: 6, padding: "4px 10px", fontWeight: 800, fontSize: 14, color: B.gray50 },
  resultBox: { background: B.blue, borderRadius: 6, padding: "4px 12px", fontWeight: 800, fontSize: 15, color: B.white, minWidth: 60, textAlign: "center" },
  betInputGroup: { display: "flex", alignItems: "center", gap: 8 },
  scoreInput: { width: 44, padding: "6px 4px", textAlign: "center", fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 16, border: `2px solid ${B.grayBorder}`, borderRadius: 6, outline: "none", color: "#2a2a2a" },
  betBtn: (saved) => ({ background: saved ? B.green : B.blue, color: B.white, border: "none", borderRadius: 6, padding: "6px 14px", fontFamily: "'Montserrat', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer", letterSpacing: 0.5, transition: "background 0.2s", whiteSpace: "nowrap" }),
  ptsTag: (pts) => ({ background: pts === 3 ? B.green : pts === 1 ? B.gold : pts === 0 ? B.red : B.grayBorder, color: pts >= 0 ? B.white : B.gray50, borderRadius: 20, padding: "2px 10px", fontSize: 13, fontWeight: 700, minWidth: 36, textAlign: "center" }),
  podiumRow: (rank) => ({ display: "flex", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${B.grayBorder}`, background: rank === 1 ? "rgba(201,168,76,0.08)" : rank === 2 ? "rgba(0,92,185,0.04)" : B.white }),
  rankNum: (rank) => ({ width: 32, height: 32, borderRadius: "50%", background: rank === 1 ? B.gold : rank === 2 ? B.blue : rank === 3 ? B.gray50 : B.grayBorder, color: rank <= 3 ? B.white : B.gray70, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, marginRight: 16, flexShrink: 0 }),
  playerName: { fontWeight: 600, fontSize: 15, color: "#2a2a2a", flex: 1 },
  ptsTotal: { fontWeight: 800, fontSize: 22, color: B.blue },
  loginWrap: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: `linear-gradient(160deg, ${B.blue} 0%, ${B.blueDark} 60%, #002d5c 100%)`, padding: 24 },
  loginCard: { background: B.white, borderRadius: 16, padding: "40px 40px 36px", width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" },
  loginLogoRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 32 },
  loginTitle: { fontWeight: 800, fontSize: 26, color: B.blue, letterSpacing: 1, textTransform: "uppercase", textAlign: "center", marginBottom: 4 },
  loginSub: { fontWeight: 400, fontSize: 14, color: B.gray50, textAlign: "center", marginBottom: 28 },
  label: { display: "block", fontWeight: 600, fontSize: 13, color: B.gray70, marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase" },
  inputField: { width: "100%", padding: "10px 14px", fontFamily: "'Montserrat', sans-serif", fontWeight: 500, fontSize: 14, border: `2px solid ${B.grayBorder}`, borderRadius: 8, outline: "none", color: "#2a2a2a", marginBottom: 16, boxSizing: "border-box" },
  primaryBtn: { width: "100%", padding: "12px", background: B.blue, color: B.white, border: "none", borderRadius: 8, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase", transition: "background 0.2s" },
  errorMsg: { background: "#fdecea", border: "1px solid #f5c6cb", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: B.red, marginBottom: 16 },
};

// Special subdivision flags (England, Scotland) + standard regional indicator flags
const FLAG_SPECIAL = {
  EN: "🏴󠁧󠁢󠁥󠁮󠁦󠁿",
  SC: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
};

export const FLAG = (code) => {
  if (!code || code.length !== 2 || code === "??") return "🏴";
  if (FLAG_SPECIAL[code]) return FLAG_SPECIAL[code];
  return code.toUpperCase().replace(/./g, c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0)));
};

const TZ = "America/Argentina/Buenos_Aires";

export const fmtDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("es-AR", {
    timeZone: TZ,
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
};

export const fmtDateTime = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleString("es-AR", { timeZone: TZ });
};

export const calcPoints = (betH, betA, resH, resA) => {
  if (resH == null || resA == null || betH == null || betA == null) return null;
  if (betH === resH && betA === resA) return 3;
  if (Math.sign(betH - betA) === Math.sign(resH - resA)) return 1;
  return 0;
};
