import { useState } from "react";
import { S, B, FLAG, fmtDate, calcPoints, calcPenaltyBonus } from "../styles";
import { api } from "../api";
import { useIsMobile } from "../hooks";

const isKnockout = (m) => m.id >= 73;

export default function Fixture({ matches, myBets, setMyBets, results }) {
  const [betDraft, setBetDraft] = useState({});
  const [saving, setSaving]     = useState({});
  const [sortMode, setSortMode] = useState("group");
  const isMobile = useIsMobile();

  const getBet    = (matchId) => myBets.find(b => b.match_id === matchId);
  const getResult = (matchId) => results.find(r => r.match_id === matchId);
  const isLocked  = (m) => new Date(m.date).getTime() - Date.now() < 60 * 60 * 1000;

  const saveBet = async (m) => {
    const matchId = m.id;
    const draft = betDraft[matchId];
    if (!draft || draft.home === "" || draft.away === "") return;
    const isTie = parseInt(draft.home) === parseInt(draft.away);
    const needsPenalty = isTie && isKnockout(m);
    if (needsPenalty && !draft.penalty) return;
    setSaving(s => ({ ...s, [matchId]: true }));
    try {
      const penaltyWinner = needsPenalty ? draft.penalty : null;
      await api.saveBet(matchId, parseInt(draft.home), parseInt(draft.away), penaltyWinner);
      setMyBets(prev => {
        const without = prev.filter(b => b.match_id !== matchId);
        return [...without, { match_id: matchId, home_score: parseInt(draft.home), away_score: parseInt(draft.away), penalty_winner: penaltyWinner }];
      });
    } catch (e) {
      alert("Error al guardar: " + e.message);
    } finally {
      setSaving(s => ({ ...s, [matchId]: false }));
    }
  };

  const renderMatch = (m) => {
    const locked = isLocked(m);
    const result = getResult(m.id);
    const myBet  = getBet(m.id);
    const pts    = myBet && result ? calcPoints(myBet.home_score, myBet.away_score, result.home_score, result.away_score) : null;
    const penPts = myBet && result ? calcPenaltyBonus(myBet.home_score, myBet.away_score, myBet.penalty_winner, result.home_score, result.away_score, result.penalty_winner) : 0;
    const totalPts = pts !== null ? pts + penPts : null;
    const draftH = betDraft[m.id]?.home ?? (myBet?.home_score ?? "");
    const draftA = betDraft[m.id]?.away ?? (myBet?.away_score ?? "");
    const draftPenalty = betDraft[m.id]?.penalty ?? myBet?.penalty_winner;
    const isTieDraft = draftH !== "" && draftA !== "" && parseInt(draftH) === parseInt(draftA);
    const showPenaltyPicker = isTieDraft && isKnockout(m);
    const confirmDisabled = saving[m.id] || (showPenaltyPicker && !draftPenalty);

    const penaltyTeamName = (winner) => winner === "home" ? m.home : winner === "away" ? m.away : null;

    const penaltyPicker = showPenaltyPicker && (
      <div style={{ marginTop: 8, padding: "8px 10px", background: B.bluePale, borderRadius: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: B.blue, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
          🥅 Victoria por penales
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button type="button"
            style={{ ...S.betBtn(draftPenalty === "home"), flex: 1, fontSize: 12, padding: "6px 8px", opacity: draftPenalty && draftPenalty !== "home" ? 0.5 : 1 }}
            onClick={() => setBetDraft(d => ({ ...d, [m.id]: { ...d[m.id], penalty: "home" } }))}>
            {FLAG(m.homeCode)} {m.home}
          </button>
          <button type="button"
            style={{ ...S.betBtn(draftPenalty === "away"), flex: 1, fontSize: 12, padding: "6px 8px", opacity: draftPenalty && draftPenalty !== "away" ? 0.5 : 1 }}
            onClick={() => setBetDraft(d => ({ ...d, [m.id]: { ...d[m.id], penalty: "away" } }))}>
            {m.away} {FLAG(m.awayCode)}
          </button>
        </div>
      </div>
    );

    if (isMobile) {
      return (
        <div key={m.id} style={{ padding: "12px 14px", borderBottom: `1px solid ${B.grayBorder}`, background: myBet ? "rgba(0,92,185,0.04)" : B.white }}>
          {/* Date */}
          <div style={{ fontSize: 12, color: B.gray50, fontWeight: 600, marginBottom: 8 }}>
            {fmtDate(m.date)}
          </div>
          {/* Teams */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: result || locked || !locked ? 10 : 0 }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#2a2a2a", textAlign: "right" }}>{m.home}</span>
              <span style={{ fontSize: 22 }}>{FLAG(m.homeCode)}</span>
            </div>
            <div style={{ background: B.grayLight, borderRadius: 6, padding: "3px 8px", fontWeight: 800, fontSize: 12, color: B.gray50 }}>VS</div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 22 }}>{FLAG(m.awayCode)}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#2a2a2a" }}>{m.away}</span>
            </div>
          </div>
          {/* Result / bet */}
          {result ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ ...S.resultBox, fontSize: 14 }}>{result.home_score} – {result.away_score}</div>
              {result.penalty_winner && (
                <div style={{ fontSize: 11, color: B.gray50, fontWeight: 600 }}>🥅 {penaltyTeamName(result.penalty_winner)}</div>
              )}
              {totalPts !== null && <div style={S.ptsTag(pts)}>{pts === 3 ? "🎯" : pts === 1 ? "✓" : "✗"} +{totalPts}</div>}
            </div>
          ) : locked ? (
            <div style={{ fontSize: 12, color: B.gray50, fontWeight: 500, background: B.grayLight, borderRadius: 6, padding: "5px 10px", display: "inline-block" }}>
              {myBet ? `Mi apuesta: ${myBet.home_score}–${myBet.away_score}${myBet.penalty_winner ? ` (Pen: ${penaltyTeamName(myBet.penalty_winner)})` : ""}` : "Cerrado"}
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="number" min="0" max="20" style={{ ...S.scoreInput, width: 40 }} placeholder="-"
                  value={draftH} onChange={e => setBetDraft(d => ({ ...d, [m.id]: { ...d[m.id], home: e.target.value } }))} />
                <span style={{ fontWeight: 700, color: B.gray50 }}>–</span>
                <input type="number" min="0" max="20" style={{ ...S.scoreInput, width: 40 }} placeholder="-"
                  value={draftA} onChange={e => setBetDraft(d => ({ ...d, [m.id]: { ...d[m.id], away: e.target.value } }))} />
                <button style={{ ...S.betBtn(!!myBet), fontSize: 12, padding: "6px 12px" }}
                  onClick={() => saveBet(m)} disabled={confirmDisabled}>
                  {saving[m.id] ? "..." : myBet ? "✓" : "Confirmar"}
                </button>
              </div>
              {penaltyPicker}
            </div>
          )}
        </div>
      );
    }

    // Desktop layout
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
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={S.resultBox}>{result.home_score} – {result.away_score}</div>
            {result.penalty_winner && (
              <div style={{ fontSize: 12, color: B.gray50, fontWeight: 600 }}>🥅 {penaltyTeamName(result.penalty_winner)}</div>
            )}
            {totalPts !== null && <div style={S.ptsTag(pts)}>{pts === 3 ? "🎯" : pts === 1 ? "✓" : "✗"} +{totalPts}</div>}
          </div>
        ) : locked ? (
          <div style={{ fontSize: 14, color: B.gray50, fontWeight: 500, background: B.grayLight, borderRadius: 6, padding: "6px 12px" }}>
            {myBet ? `Mi apuesta: ${myBet.home_score}–${myBet.away_score}${myBet.penalty_winner ? ` (Pen: ${penaltyTeamName(myBet.penalty_winner)})` : ""}` : "Cerrado"}
          </div>
        ) : (
          <div>
            <div style={S.betInputGroup}>
              <input type="number" min="0" max="20" style={S.scoreInput} placeholder="-"
                value={draftH} onChange={e => setBetDraft(d => ({ ...d, [m.id]: { ...d[m.id], home: e.target.value } }))} />
              <span style={{ fontWeight: 700, color: B.gray50 }}>–</span>
              <input type="number" min="0" max="20" style={S.scoreInput} placeholder="-"
                value={draftA} onChange={e => setBetDraft(d => ({ ...d, [m.id]: { ...d[m.id], away: e.target.value } }))} />
              <button style={S.betBtn(!!myBet)} onClick={() => saveBet(m)} disabled={confirmDisabled}>
                {saving[m.id] ? "..." : myBet ? "✓ Guardado" : "Confirmar"}
              </button>
            </div>
            {penaltyPicker}
          </div>
        )}
      </div>
    );
  };

  const grouped = {};
  matches.forEach(m => {
    if (!grouped[m.group]) grouped[m.group] = [];
    grouped[m.group].push(m);
  });

  const chronological = [...matches].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ ...S.tabBar, marginBottom: 0 }}>
        <button style={S.tab(sortMode === "group")} onClick={() => setSortMode("group")}>Por Grupo</button>
        <button style={S.tab(sortMode === "chrono")} onClick={() => setSortMode("chrono")}>Por Fecha</button>
      </div>

      {sortMode === "group" ? (
        Object.entries(grouped).map(([group, gMatches]) => (
          <div key={group} style={S.card}>
            <div style={S.cardHeader}>
              <span style={S.cardHeaderTitle}>{group}</span>
              <span style={{ marginLeft: "auto", fontSize: 13, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>
                {gMatches.filter(m => !isLocked(m)).length} pendientes
              </span>
            </div>
            {gMatches.map(renderMatch)}
          </div>
        ))
      ) : (
        <div style={S.card}>
          <div style={S.cardHeader}>
            <span style={S.cardHeaderTitle}>Todos los Partidos</span>
            <span style={{ marginLeft: "auto", fontSize: 13, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>
              {chronological.filter(m => !isLocked(m)).length} pendientes
            </span>
          </div>
          {chronological.map(renderMatch)}
        </div>
      )}
    </div>
  );
}
