import { useState } from "react";
import { Post, SignalsList, StepsList } from "./common";

const LBL = {
  fab: ["b-alert", "Fabricada (na simulação)"],
  ctx: ["b-care", "Enganosa ou fora de contexto (na simulação)"],
  real: ["b-trust", "Verdadeira (na simulação)"],
};

function feedback(choice, c) {
  if (choice === "check") return ["Boa escolha. Verificar antes é o hábito que o Clareia quer construir.", 15];
  if (c.truth === "real")
    return choice === "share"
      ? ["Neste caso os sinais eram bons, mas o ideal é confirmar a fonte antes de repassar.", 8]
      : ["Cautela é bem-vinda. Aqui, porém, a fonte era confiável e a informação era útil.", 8];
  return choice === "no"
    ? ["Você evitou espalhar um conteúdo problemático. Melhor ainda é saber explicar por quê.", 12]
    : ["Esta é a armadilha: o conteúdo tinha sinais de alerta. Veja abaixo como perceber.", 2];
}

const CHOICES = [
  { c: "share", label: "Compartilharia" },
  { c: "check", label: "Verificaria antes" },
  { c: "no", label: "Não compartilharia" },
];

export default function Simulator({ cases, method, award }) {
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState(null);
  const c = cases[idx];

  function choose(choice) {
    if (answered) return;
    setAnswered(choice);
    const [msg, pts] = feedback(choice, c);
    award("sim:" + c.id, pts, "+" + pts + " pontos");
  }

  function next() {
    setIdx((idx + 1) % cases.length);
    setAnswered(null);
  }

  const [msg] = answered ? feedback(answered, c) : [null];
  const [badgeCls, badgeLabel] = LBL[c.truth];

  return (
    <section className="view" aria-labelledby="h-sim">
      <div className="vhead">
        <span className="eyebrow">Simulação</span>
        <h1 id="h-sim">Você compartilharia?</h1>
        <p>Leia a mensagem como se ela tivesse chegado no seu celular. Escolha o que faria. Depois, veja os sinais que ela trazia e como verificar.</p>
      </div>
      <div className="sim">
        <div style={{ display: "grid", gap: 14, minWidth: 0 }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="fict">Caso fictício para treino</span>
            <span className="counter">Caso {idx + 1} de {cases.length}</span>
          </div>
          <Post who={c.who} where={c.where} avatar={c.avatar} kind={c.kind} headline={c.headline} media={c.media} />
          <div className="choices">
            {CHOICES.map((ch) => (
              <button
                key={ch.c}
                type="button"
                disabled={!!answered}
                className={answered === ch.c ? "picked" : undefined}
                onClick={() => choose(ch.c)}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>

        <div className="panel result" aria-live="polite">
          {!answered ? (
            <>
              <h3>O que você faria?</h3>
              <p style={{ color: "var(--muted)" }}>Escolha uma opção para ver a análise deste caso. Não existe pegadinha: o objetivo é treinar o olhar.</p>
            </>
          ) : (
            <>
              <p>{msg}</p>
              <span className={"badge " + badgeCls}>{badgeLabel}</span>
              <h3>Sinais nesta mensagem</h3>
              <SignalsList signals={c.signals} />
              <h3>Como verificar</h3>
              <StepsList indices={c.steps} method={method} />
              <p style={{ fontSize: ".92em" }}>{c.note}</p>
              <button className="btn" type="button" onClick={next}>Próximo caso</button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
