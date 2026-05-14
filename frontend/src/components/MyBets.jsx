import { S, B, FLAG, fmtDate, calcPoints } from "../styles";

export default function MyBets({ matches, myBets, results, currentUser }) {
  const bettedMatches = matches.filter(m => myBets.find(b => b.match_id === m.id));

  return (
    <div style={S.card}>
      <div style={S.cardHeader}>
        <span style={S.cardHeaderTitle}>Apuestas de {currentUser.display_name}</span>
      </div>

      {bettedMatches.length === 0 && (
        <div style={{ padding: 32, textAlign: "center", color: B.gray50, fontSize: 14 }}>
          Todavía no cargaste ninguna apuesta. Andá a la pestaña <strong>Fixture</strong> para apostar.
        </div>
      )}

      {bettedMatches.map(m => {
        const myBet  = myBets.find(b => b.match_id === m.id);
        const result = results.find(r => r.match_id === m.id);
        const pts    = myBet && result ? calcPoints(myBet.home_score, myBet.away_score, result.home_score, result.away_score) : null;

        return (
          <div key={m.id} style={S.matchRow(true)}>
            <div style={S.matchDate}>{fmtDate(m.date)}</div>
            <div style={S.teams}>
              <div style={{ textAlign: "right", minWidth: 110 }}>
                <span style={{ marginRight: 4 }}>{FLAG(m.homeCode)}</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#2a2a2a" }}>{m.home}</span>
              </div>
              <div style={{ ...S.vsBox, background: B.bluePale, color: B.blue, fontWeight: 800 }}>
                {myBet.home_score} – {myBet.away_score}
              </div>
              <div style={{ minWidth: 110 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#2a2a2a" }}>{m.away}</span>
                <span style={{ marginLeft: 4 }}>{FLAG(m.awayCode)}</span>
              </div>
            </div>
            {result ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 14, color: B.gray50 }}>Real: {result.home_score}–{result.away_score}</div>
                <div style={S.ptsTag(pts ?? -1)}>
                  {pts === 3 ? "🎯 +3" : pts === 1 ? "✓ +1" : "✗ 0"}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 14, color: B.gray50, fontWeight: 500, background: B.grayLight, borderRadius: 6, padding: "4px 10px" }}>
                Pendiente
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
