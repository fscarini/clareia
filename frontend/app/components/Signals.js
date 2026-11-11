import { useRef, useState } from "react";
import { analyzeSignals } from "../lib/api";
import { dotChar } from "./common";

const DEFAULT_TEXT = "Cada resposta “não sei” também conta: ela mostra o que ainda falta verificar.";

function evaluate(ans, checklist) {
  const answered = ans.filter(Boolean).length;
  if (!answered) return { title: "Responda à lista ao lado", text: DEFAULT_TEXT, width: 0, color: null, items: [] };

  let alert = 0, unk = 0;
  const items = [];
  checklist.forEach((item, i) => {
    const a = ans[i];
    if (!a) return;
    const q = item.question;
    if (a === "ns") {
      unk++;
      items.push({ k: "c", text: "Ainda falta conferir: " + q.replace("?", "").toLowerCase() });
    } else if ((a === "sim") === item.good) {
      /* sinal de confiança: nada a listar */
    } else {
      alert++;
      items.push({
        k: "a",
        text: item.good
          ? "Falta: " + q.replace("?", "").replace(/^Dá para saber /, "saber ").toLowerCase()
          : "Sinal de alerta: " + q.replace("?", "").toLowerCase(),
      });
    }
  });

  const risk = (alert * 2 + unk) / (answered * 2);
  const width = Math.max(8, Math.round(risk * 100));
  let title, text, color;
  if (alert >= 3 || risk > 0.55) {
    title = "Cuidado alto: não compartilhe agora";
    text = "A informação traz vários sinais de alerta. Use o método CLAREIA antes de qualquer decisão.";
    color = "var(--alert)";
  } else if (alert > 0 || unk > 0) {
    title = "Cuidado médio: verifique os pontos em aberto";
    text = "Há perguntas sem resposta ou algum sinal de alerta. Confira antes de repassar.";
    color = "var(--care)";
  } else {
    title = "Sinais de confiança presentes";
    text = "Isso não prova que a informação é verdadeira, mas ela tem origem e contexto conferíveis. Confirme em mais uma fonte se for repassar.";
    color = "var(--trust)";
  }
  if (answered < checklist.length) text += ` (${answered} de ${checklist.length} respondidas)`;
  return { title, text, width, color, items, complete: answered === checklist.length };
}

function Checklist({ checklist, award }) {
  const [ans, setAns] = useState(() => checklist.map(() => null));
  const awarded = useRef(false);
  const r = evaluate(ans, checklist);

  function pick(i, v) {
    const next = [...ans];
    next[i] = v;
    setAns(next);
    if (next.every(Boolean) && !awarded.current) {
      awarded.current = true;
      award("check:done", 10, "+10 pontos");
    }
  }
  function reset() {
    setAns(checklist.map(() => null));
    awarded.current = false;
  }

  return (
    <div className="sig-grid">
      <div className="panel">
        <span className="eyebrow">Responda pensando na informação que você recebeu</span>
        {checklist.map((item, i) => (
          <div className="check-item" key={item.id}>
            <span className="ql">{i + 1}. {item.question}</span>
            <div className="seg3" role="group" aria-label={item.question}>
              {[["sim", "Sim"], ["nao", "Não"], ["ns", "Não sei"]].map(([v, l]) => (
                <button key={v} type="button" aria-pressed={ans[i] === v} onClick={() => pick(i, v)}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: 16, minWidth: 0 }}>
        <div className="panel" style={{ display: "grid", gap: 10 }} aria-live="polite">
          <span className="eyebrow">Nível de cuidado</span>
          <div className="meter">
            <i style={{ width: r.width + "%", background: r.color || undefined }} />
          </div>
          <h3>{r.title}</h3>
          <p style={{ color: "var(--muted)", fontSize: ".93em" }}>{r.text}</p>
          <ul className="signals">
            {r.items.map((it, i) => (
              <li key={i}>
                <span className={"dot " + it.k}>{it.k === "a" ? "!" : "?"}</span>
                <span>{it.text}</span>
              </li>
            ))}
          </ul>
          <button className="btn ghost" type="button" onClick={reset}>Avaliar outra informação</button>
        </div>
        <Assistant method={undefined} award={award} />
      </div>
    </div>
  );
}

function Assistant({ award }) {
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    const t = text.trim();
    if (t.length < 12) {
      setMsg("Cole um texto um pouco maior.");
      return;
    }
    setBusy(true);
    setMsg("Analisando os sinais…");
    setResult(null);
    try {
      const r = await analyzeSignals(t);
      setResult(r);
      setMsg("");
      award("ai:use", 5, "+5 pontos");
    } catch (e) {
      setResult(null);
      setMsg(e.status === 400 ? "Cole um texto um pouco maior." : "Não deu certo desta vez. Tente de novo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel" style={{ display: "grid", gap: 10 }}>
      <span className="eyebrow">Assistente de sinais</span>
      <h3>Cole um texto para ver os sinais que ele traz</h3>
      <p style={{ fontSize: ".88em", color: "var(--muted)" }}>
        O assistente aponta trechos que merecem atenção e sugere perguntas de verificação. Ele nunca diz se o
        conteúdo é verdadeiro ou falso. Não cole dados pessoais.
      </p>
      <label className="fict" htmlFor="aiText">Texto da mensagem ou notícia</label>
      <textarea
        id="aiText"
        placeholder="Cole aqui o texto que você recebeu"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="row">
        <button className="btn" type="button" onClick={run} disabled={busy}>Mostrar sinais</button>
        <span style={{ fontSize: ".88em", color: "var(--muted)" }}>{msg}</span>
      </div>

      {result && (
        <div style={{ display: "grid", gap: 10 }}>
          <span className="badge b-care">Sinais apontados · não é um veredito</span>
          {result.signals && result.signals.length ? (
            <ul className="signals">
              {result.signals.map((s, i) => {
                const k = s.type === "alerta" ? "a" : s.type === "confianca" ? "t" : "c";
                return (
                  <li key={i}>
                    <span className={"dot " + k}>{dotChar(k)}</span>
                    <span>
                      <b>“{String(s.excerpt || "").slice(0, 120)}” </b>
                      {s.explanation}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>Não encontramos sinais de alerta evidentes, mas isso não garante que a informação seja verdadeira. Verifique a origem assim mesmo.</p>
          )}
          {result.questions && result.questions.length ? (
            <>
              <h3>Perguntas para verificar</h3>
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                {result.questions.slice(0, 5).map((q, i) => <li key={i}>{q}</li>)}
              </ol>
            </>
          ) : null}
          {result.steps && result.steps.length ? (
            <p style={{ fontSize: ".9em", color: "var(--muted)" }}>
              Passos sugeridos do método: <b>{result.steps.join(" · ")}</b>
            </p>
          ) : null}
          <p style={{ fontSize: ".85em", color: "var(--muted)" }}>
            {result.disclaimer || "Lembre: só você pode concluir, depois de conferir as fontes."}
          </p>
        </div>
      )}
    </div>
  );
}

export default function Signals({ checklist, award }) {
  return (
    <section className="view" aria-labelledby="h-sig">
      <div className="vhead">
        <span className="eyebrow">Classificação de sinais</span>
        <h1 id="h-sig">Sinais de confiabilidade</h1>
        <p>Use esta lista com qualquer informação que chegar até você. Ela não diz se algo é verdadeiro: mostra quanto cuidado a informação pede antes de ser compartilhada.</p>
      </div>
      <Checklist checklist={checklist} award={award} />
    </section>
  );
}
