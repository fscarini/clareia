// Cliente da API Spring Boot. As chamadas /api sao encaminhadas ao backend
// pelo rewrite do next.config.mjs, entao nao ha CORS.

async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) { const e = new Error("HTTP " + r.status); e.status = r.status; throw e; }
  return r.json();
}

async function postJSON(url, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  if (!r.ok) { const e = new Error("HTTP " + r.status); e.status = r.status; throw e; }
  return r.json();
}

const PLAYER_KEY = "clareia:playerId";

export function getContent() {
  return getJSON("/api/content");
}

/** Recupera o jogador salvo ou cria um novo (anonimo). Retorna { id, xp }. */
export async function initPlayer() {
  let id = null;
  try { id = localStorage.getItem(PLAYER_KEY); } catch (e) { /* ignore */ }

  if (id) {
    try { return await getJSON("/api/players/" + id); }
    catch (e) { if (e.status !== 404) throw e; /* 404: o servidor reiniciou; recria abaixo */ }
  }
  const p = await postJSON("/api/players", {});
  try { localStorage.setItem(PLAYER_KEY, p.id); } catch (e) { /* ignore */ }
  return p;
}

/** Credita pontos de uma atividade (idempotente por chave no backend). Retorna { id, xp }. */
export function postScore(playerId, activityKey, points) {
  return postJSON("/api/players/" + playerId + "/score", { activityKey, points });
}

/** Analisa um texto. Retorna { signals, questions, steps, disclaimer }. Nunca da veredito. */
export function analyzeSignals(text) {
  return postJSON("/api/assistant/signals", { text });
}
