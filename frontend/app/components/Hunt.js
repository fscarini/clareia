import { useState } from "react";

function HuntRound({ hunt, index, total, award, toast, onNext }) {
  const clueTotal = hunt.segments.filter((s) => s.clue).length;
  const [states, setStates] = useState(() => hunt.segments.map(() => "none"));
  const [revealed, setRevealed] = useState(false);
  const [log, setLog] = useState([]);

  const found = states.filter((s) => s === "found").length;
  const miss = states.filter((s) => s === "miss").length;
  const score = Math.max(0, found * 10 - miss * 5);

  function prepend(entries) {
    setLog((l) => [...entries, ...l]);
  }

  function doReveal(base) {
    const arr = [...(base || states)];
    const missing = [];
    hunt.segments.forEach((s, i) => {
      if (s.clue && arr[i] !== "found") {
        arr[i] = "revealed";
        missing.push({ text: `Pista que faltou: “${s.text.trim()}”. ${s.explanation}` });
      }
    });
    setStates(arr);
    setRevealed(true);
    if (missing.length) prepend(missing.reverse());
    const curFound = arr.filter((x) => x === "found").length;
    toast(curFound === clueTotal ? "Todas as pistas encontradas!" : `Você encontrou ${curFound} de ${clueTotal} pistas`);
  }

  function tap(i) {
    if (revealed || states[i] !== "none") return;
    const s = hunt.segments[i];
    const next = [...states];
    next[i] = s.clue ? "found" : "miss";
    setStates(next);
    if (s.clue) {
      award("hunt:" + index + ":" + i, 10);
      prepend([{ text: `“${s.text.trim()}”: ${s.explanation}` }]);
    } else {
      prepend([{ text: `“${s.text.trim()}” não é, sozinho, um sinal de alerta.`, neg: true }]);
    }
    if (next.filter((x) => x === "found").length === clueTotal) doReveal(next);
  }

  return (
    <div className="sim">
      <div style={{ display: "grid", gap: 14, minWidth: 0 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="fict">Mensagem fictícia</span>
          <span className="counter">Mensagem {index + 1} de {total}</span>
        </div>
        <div className="post">
          <div className="meta">
            <div className="avatar">{hunt.avatar}</div>
            <div className="who">
              <b>{hunt.who}</b>
              <span>{hunt.where}</span>
            </div>
            <span className="kind">{hunt.kind}</span>
          </div>
          <div className="body">
            <p>
              {hunt.segments.map((s, i) => (
                <span
                  key={i}
                  className={"seg" + (states[i] !== "none" ? " " + states[i] : "")}
                  role="button"
                  tabIndex={0}
                  onClick={() => tap(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      tap(i);
                    }
                  }}
                >
                  {s.text}
                </span>
              ))}
            </p>
          </div>
        </div>
        <div className="row">
          {!revealed ? (
            <button className="btn" type="button" onClick={() => doReveal(null)}>Revelar pistas</button>
          ) : (
            <button className="btn ghost" type="button" onClick={onNext}>Próxima mensagem</button>
          )}
        </div>
      </div>

      <div className="panel" style={{ display: "grid", gap: 12 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="eyebrow">Pontuação da rodada</span>
          <span className="counter">{found} de {clueTotal} pistas</span>
        </div>
        <div className="score">{score}</div>
        <div className="log" aria-live="polite">
          {log.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>As explicações das pistas aparecem aqui.</p>
          ) : (
            log.map((e, i) => <div key={i} className={e.neg ? "neg" : undefined}>{e.text}</div>)
          )}
        </div>
      </div>
    </div>
  );
}

export default function Hunt({ hunts, award, toast }) {
  const [hIdx, setHIdx] = useState(0);
  return (
    <section className="view hunt" aria-labelledby="h-hunt">
      <div className="vhead">
        <span className="eyebrow">Jogo educativo</span>
        <h1 id="h-hunt">Caça-pistas</h1>
        <p>Toque nos trechos que deveriam acender um alerta. Cada pista certa vale 10 pontos; um trecho comum tocado tira 5. Quando achar que terminou, revele o resto.</p>
      </div>
      <HuntRound
        key={hIdx}
        hunt={hunts[hIdx]}
        index={hIdx}
        total={hunts.length}
        award={award}
        toast={toast}
        onNext={() => setHIdx((hIdx + 1) % hunts.length)}
      />
    </section>
  );
}
