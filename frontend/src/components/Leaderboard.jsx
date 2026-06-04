import { S, B, calcPoints } from "../styles";
import { useIsMobile } from "../hooks";
import PrizePodium from "./PrizePodium";

// Bonus: si un usuario acierta ≥2 resultados exactos en el mismo grupo,
// recibe tantos puntos bonus como exactos tuvo en ese grupo (2 exactos = +2, 3 = +3, etc.)
function calcGroupBonus(userBets, results, matchGroupMap) {
  const exactPerGroup = {};
  userBets.forEach(bet => {
    const result = results.find(r => r.match_id === bet.match_id);
    const pts = calcPoints(bet.home_score, bet.away_score, result?.home_score, result?.away_score);
    if (pts === 3) {
      const group = matchGroupMap[bet.match_id];
      if (group) exactPerGroup[group] = (exactPerGroup[group] || 0) + 1;
    }
  });
  let bonus = 0;
  Object.values(exactPerGroup).forEach(count => {
    if (count >= 2) bonus += count;
  });
  return bonus;
}

export default function Leaderboard({ allBets, results, matches, currentUser }) {
  const isMobile = useIsMobile();

  const matchGroupMap = {};
  (matches || []).forEach(m => { matchGroupMap[m.id] = m.group; });

  const scores = {};
  allBets.forEach(bet => {
    if (!scores[bet.user_id]) {
      scores[bet.user_id] = { display_name: bet.display_name, pts: 0, exact: 0, winner: 0, bonus: 0, bets: [] };
    }
    scores[bet.user_id].bets.push(bet);

    const result = results.find(r => r.match_id === bet.match_id);
    const pts = calcPoints(bet.home_score, bet.away_score, result?.home_score, result?.away_score);
    if (pts !== null) {
      scores[bet.user_id].pts += pts;
      if (pts === 3) scores[bet.user_id].exact++;
      if (pts === 1) scores[bet.user_id].winner++;
    }
  });

  Object.values(scores).forEach(s => {
    s.bonus = calcGroupBonus(s.bets, results, matchGroupMap);
    s.pts += s.bonus;
  });

  const board = Object.entries(scores)
    .map(([uid, s]) => ({ uid: parseInt(uid), ...s }))
    .sort((a, b) => b.pts - a.pts);

  return (
    <div style={S.card}>
      <div style={S.cardHeader}>
        <span style={S.cardHeaderTitle}>Tabla de posiciones</span>
        <span style={{ marginLeft: "auto", fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
          {board.length} participantes
        </span>
      </div>

      {board.length === 0 && (
        <div style={{ padding: 32, textAlign: "center", color: B.gray50, fontSize: 14 }}>
          Todavía no hay resultados confirmados. ¡Las posiciones aparecerán al cierre de los primeros partidos!
        </div>
      )}

      {board.length > 0 && <PrizePodium />}

      {board.map((p, i) => (
        <div key={p.uid} style={{ ...S.podiumRow(i + 1), padding: isMobile ? "12px 14px" : "14px 20px" }}>
          <div style={{ ...S.rankNum(i + 1), marginRight: isMobile ? 10 : 16 }}>
            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
          </div>
          <div style={{ ...S.playerName, fontSize: isMobile ? 13 : 15 }}>
            {p.display_name}
            {p.uid === currentUser.id && (
              <span style={{ fontSize: 12, color: B.blue, fontWeight: 700, marginLeft: 6, background: B.bluePale, borderRadius: 10, padding: "1px 7px" }}>vos</span>
            )}
            {isMobile && (
              <div style={{ fontSize: 12, color: B.gray50, marginTop: 2 }}>
                🎯 {p.exact} · ✓ {p.winner}{p.bonus > 0 && ` · 🎁 +${p.bonus}`}
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
              <span style={{ ...S.ptsTotal, fontSize: isMobile ? 18 : 22 }}>{p.pts}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: B.gray50, marginLeft: 3, alignSelf: "flex-end", paddingBottom: 2 }}>pts</span>
            </div>
            {!isMobile && (
              <div style={{ fontSize: 13, color: B.gray50, marginTop: 2 }}>
                🎯 {p.exact} exactos · ✓ {p.winner} ganadores
                {p.bonus > 0 && (
                  <span style={{ color: B.green, fontWeight: 700 }}> · 🎁 +{p.bonus} bonus</span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {board.length > 0 && (
        <div style={{ padding: "12px 20px", background: B.bluePale, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: 14, color: B.blue, fontWeight: 600 }}>🎯 Resultado exacto = <strong>3 pts</strong></div>
          <div style={{ fontSize: 14, color: B.blue, fontWeight: 600 }}>✓ Ganador/empate correcto = <strong>1 pt</strong></div>
          <div style={{ fontSize: 14, color: B.blue, fontWeight: 600 }}>✗ Incorrecto = <strong>0 pts</strong></div>
          <div style={{ fontSize: 14, color: B.green, fontWeight: 600 }}>🎁 2+ exactos en un grupo = bonus igual al nro. de exactos en ese grupo</div>
        </div>
      )}
    </div>
  );
}
