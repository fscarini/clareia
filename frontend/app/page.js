"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getContent, initPlayer, postScore } from "./lib/api";
import Nav from "./components/Nav";
import Home from "./components/Home";
import Simulator from "./components/Simulator";
import Hunt from "./components/Hunt";
import Signals from "./components/Signals";
import Deepfakes from "./components/Deepfakes";
import Method from "./components/Method";
import Institutions from "./components/Institutions";

export default function Page() {
  const [content, setContent] = useState(null);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState("inicio");

  const [playerId, setPlayerId] = useState(null);
  const [xp, setXp] = useState(0);

  const [toastMsg, setToastMsg] = useState("");
  const [toastOn, setToastOn] = useState(false);
  const toastTimer = useRef(null);

  const toast = useCallback((m) => {
    setToastMsg(m);
    setToastOn(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastOn(false), 1800);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [player, data] = await Promise.all([initPlayer(), getContent()]);
        if (!alive) return;
        setPlayerId(player.id);
        setXp(player.xp);
        setContent(data);
      } catch (e) {
        if (alive) setError(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  const award = useCallback(
    async (activityKey, points, msg) => {
      if (!playerId) return;
      const before = xp;
      try {
        const p = await postScore(playerId, activityKey, points);
        setXp(p.xp);
        if (msg && p.xp > before) toast(msg);
      } catch (e) {
        /* silencioso: a prática continua mesmo sem registrar pontos */
      }
    },
    [playerId, xp, toast]
  );

  function navigate(id) {
    setTab(id);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }

  if (error) {
    return (
      <main className="wrap" style={{ paddingTop: 48 }}>
        <div className="panel">
          <h3>Não foi possível carregar o Clareia</h3>
          <p style={{ color: "var(--muted)" }}>Verifique se o backend está no ar em http://localhost:8080 e recarregue a página.</p>
        </div>
      </main>
    );
  }

  if (!content) {
    return (
      <main className="wrap" style={{ paddingTop: 48 }}>
        <p style={{ color: "var(--muted)" }}>Carregando…</p>
      </main>
    );
  }

  return (
    <>
      <Nav active={tab} onSelect={navigate} xp={xp} />
      <main className="wrap">
        {tab === "inicio" && <Home onNavigate={navigate} />}
        {tab === "simulador" && <Simulator cases={content.cases} method={content.method} award={award} />}
        {tab === "cacapistas" && <Hunt hunts={content.hunts} award={award} toast={toast} />}
        {tab === "sinais" && <Signals checklist={content.checklist} award={award} />}
        {tab === "deepfakes" && <Deepfakes quiz={content.deepfakeQuiz} award={award} />}
        {tab === "metodo" && <Method method={content.method} />}
        {tab === "instituicoes" && <Institutions />}
      </main>
      <footer>
        <div className="wrap">
          <p><b>Clareia</b> · Protótipo do Grupo G14, UC Inteligência Artificial e Sociedade, Universidade São Judas Tadeu, 2026.</p>
          <p>Pessoas, veículos e cidades citados nos casos são fictícios. Qualquer semelhança é coincidência.</p>
        </div>
      </footer>
      <div className={"toast" + (toastOn ? " on" : "")} role="status">{toastMsg}</div>
    </>
  );
}
