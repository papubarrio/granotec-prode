import { S, B, calcPoints } from "../styles";

export default function Leaderboard({ allBets, results, currentUser }) {
  const scores = {};
  allBets.forEach(bet => {
    const result = results.find(r => r.match_id === bet.match_id);
    const pts = calcPoints(bet.home_score, bet.away_score, result?.home_score, result?.away_score);
    if (!scores[bet.user_id]) {
      scores[bet.user_id] = { display_name: bet.display_name, pts: 0, exact: 0, winner: 0 };
    }
    if (pts !== null) {
      scores[bet.user_id].pts += pts;
      if (pts === 3) scores[bet.user_id].exact++;
      if (pts === 1) scores[bet.user_id].winner++;
    }
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

      {board.map((p, i) => (
        <div key={p.uid} style={S.podiumRow(i + 1)}>
          <div style={S.rankNum(i + 1)}>
            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
          </div>
          <div style={S.playerName}>
            {p.display_name}
            {p.uid === currentUser.id && (
              <span style={{ fontSize: 13, color: B.blue, fontWeight: 700, marginLeft: 8, background: B.bluePale, borderRadius: 10, padding: "1px 8px" }}>vos</span>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
              <span style={S.ptsTotal}>{p.pts}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: B.gray50, marginLeft: 4, alignSelf: "flex-end", paddingBottom: 3 }}>pts</span>
            </div>
            <div style={{ fontSize: 13, color: B.gray50, marginTop: 2 }}>
              🎯 {p.exact} exactos · ✓ {p.winner} ganadores
            </div>
          </div>
        </div>
      ))}

      {board.length > 0 && (
        <div style={{ padding: "12px 20px", background: B.bluePale, display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div style={{ fontSize: 14, color: B.blue, fontWeight: 600 }}>🎯 Resultado exacto = <strong>3 pts</strong></div>
          <div style={{ fontSize: 14, color: B.blue, fontWeight: 600 }}>✓ Ganador/empate correcto = <strong>1 pt</strong></div>
          <div style={{ fontSize: 14, color: B.blue, fontWeight: 600 }}>✗ Incorrecto = <strong>0 pts</strong></div>
        </div>
      )}
    </div>
  );
}
