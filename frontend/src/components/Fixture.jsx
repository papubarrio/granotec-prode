import { useState } from "react";
import { S, B, FLAG, fmtDate, calcPoints } from "../styles";
import { api } from "../api";

export default function Fixture({ matches, myBets, setMyBets, results }) {
  const [betDraft, setBetDraft] = useState({});
  const [saving, setSaving]     = useState({});

  const getBet     = (matchId) => myBets.find(b => b.match_id === matchId);
  const getResult  = (matchId) => results.find(r => r.match_id === matchId);
  // Lock bets 1 hour before kickoff
  const isLocked = (m) => new Date(m.date).getTime() - Date.now() < 60 * 60 * 1000;

  const saveBet = async (matchId) => {
    const draft = betDraft[matchId];
    if (!draft || draft.home === "" || draft.away === "") return;
    setSaving(s => ({ ...s, [matchId]: true }));
    try {
      await api.saveBet(matchId, parseInt(draft.home), parseInt(draft.away));
      setMyBets(prev => {
        const without = prev.filter(b => b.match_id !== matchId);
        return [...without, { match_id: matchId, home_score: parseInt(draft.home), away_score: parseInt(draft.away) }];
      });
    } catch (e) {
      alert("Error al guardar: " + e.message);
    } finally {
      setSaving(s => ({ ...s, [matchId]: false }));
    }
  };

  const grouped = {};
  matches.forEach(m => {
    if (!grouped[m.group]) grouped[m.group] = [];
    grouped[m.group].push(m);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {Object.entries(grouped).map(([group, gMatches]) => (
        <div key={group} style={S.card}>
          <div style={S.cardHeader}>
            <span style={S.cardHeaderTitle}>{group}</span>
            <span style={{ marginLeft: "auto", fontSize: 13, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>
              {gMatches.filter(m => !isLocked(m)).length} pendientes
            </span>
          </div>
          {gMatches.map(m => {
            const locked   = isLocked(m);
            const result   = getResult(m.id);
            const myBet    = getBet(m.id);
            const pts      = myBet && result ? calcPoints(myBet.home_score, myBet.away_score, result.home_score, result.away_score) : null;
            const draftH   = betDraft[m.id]?.home ?? (myBet?.home_score ?? "");
            const draftA   = betDraft[m.id]?.away ?? (myBet?.away_score ?? "");

            return (
              <div key={m.id} style={S.matchRow(!!myBet)}>
                <div style={S.matchDate}>{fmtDate(m.date)}</div>

                <div style={S.teams}>
                  <div style={{ textAlign: "right", minWidth: 110 }}>
                    <span style={{ marginRight: 4 }}>{FLAG(m.homeCode)}</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#2a2a2a" }}>{m.home}</span>
                  </div>
                  <div style={S.vsBox}>VS</div>
                  <div style={{ minWidth: 110 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#2a2a2a" }}>{m.away}</span>
                    <span style={{ marginLeft: 4 }}>{FLAG(m.awayCode)}</span>
                  </div>
                </div>

                {result ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={S.resultBox}>{result.home_score} – {result.away_score}</div>
                    {pts !== null && (
                      <div style={S.ptsTag(pts)}>
                        {pts === 3 ? "🎯 +3" : pts === 1 ? "✓ +1" : "✗ 0"}
                      </div>
                    )}
                  </div>
                ) : locked ? (
                  <div style={{ fontSize: 14, color: B.gray50, fontWeight: 500, background: B.grayLight, borderRadius: 6, padding: "6px 12px" }}>
                    {myBet ? `Mi apuesta: ${myBet.home_score}–${myBet.away_score}` : "Cerrado"}
                  </div>
                ) : (
                  <div style={S.betInputGroup}>
                    <input type="number" min="0" max="20" style={S.scoreInput} placeholder="0"
                      value={draftH}
                      onChange={e => setBetDraft(d => ({ ...d, [m.id]: { ...d[m.id], home: e.target.value } }))}
                    />
                    <span style={{ fontWeight: 700, color: B.gray50 }}>–</span>
                    <input type="number" min="0" max="20" style={S.scoreInput} placeholder="0"
                      value={draftA}
                      onChange={e => setBetDraft(d => ({ ...d, [m.id]: { ...d[m.id], away: e.target.value } }))}
                    />
                    <button style={S.betBtn(!!myBet)} onClick={() => saveBet(m.id)} disabled={saving[m.id]}>
                      {saving[m.id] ? "..." : myBet ? "✓ Guardado" : "Apostar"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
