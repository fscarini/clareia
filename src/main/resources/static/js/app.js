/* Clareia - frontend. Consome a API Spring Boot:
   - conteudo educativo em /api/content
   - pontuacao persistida em /api/players
   - assistente de sinais em /api/assistant/signals
*/
(() => {
"use strict";

const API = "/api";
const $ = s => document.querySelector(s);
const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };

const store = {
  get(k, d) { try { const v = localStorage.getItem("clareia:" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("clareia:" + k, JSON.stringify(v)); } catch (e) {} }
};

async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) { const e = new Error("HTTP " + r.status); e.status = r.status; throw e; }
  return r.json();
}
async function postJSON(url, body) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) });
  if (!r.ok) { const e = new Error("HTTP " + r.status); e.status = r.status; throw e; }
  return r.json();
}

/* ---------- jogador e pontuacao (backend) ---------- */
let playerId = null, xp = 0;
function setXP() { $("#xp").textContent = xp; }
function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("on"), 1800); }

async function initPlayer() {
  playerId = store.get("playerId", null);
  if (playerId) {
    try { const p = await getJSON(API + "/players/" + playerId); xp = p.xp; setXP(); return; }
    catch (e) { if (e.status !== 404) { setXP(); return; } /* 404: recria abaixo */ }
  }
  const p = await postJSON(API + "/players", {});
  playerId = p.id; xp = p.xp; store.set("playerId", playerId); setXP();
}

/** Credita pontos por uma atividade. O backend ignora repeticoes da mesma chave. */
async function award(activityKey, points, msg) {
  if (!playerId) return;
  const before = xp;
  try {
    const p = await postJSON(API + "/players/" + playerId + "/score", { activityKey, points });
    xp = p.xp; setXP();
    if (msg && xp > before) toast(msg);
  } catch (e) { /* silencioso: pratica continua mesmo sem registrar pontos */ }
}

/* ---------- conteudo ---------- */
let METHOD = [];   // [letra, titulo, descricao]
let SIM = [], HUNT = [], CHECK = [], DQ = [];

function methodIndexByLetter(letter) {
  const i = METHOD.findIndex(m => m[0] === letter);
  return i < 0 ? 0 : i;
}

function buildMethod() {
  const ml = $("#methodList");
  ml.textContent = "";
  METHOD.forEach(([L, t, d]) => { const li = el("li"); li.append(el("span", "L", L), el("b", null, t), el("p", null, d)); ml.append(li); });
}

/* post visual reutilizado por simulador e caca-pistas */
function postEl(c) {
  const p = el("div", "post");
  const m = el("div", "meta");
  m.append(el("div", "avatar", c.avatar));
  const w = el("div", "who"); w.append(el("b", null, c.who), el("span", null, c.where));
  m.append(w, el("span", "kind", c.kind));
  p.append(m);
  const b = el("div", "body");
  if (c.headline) b.append(el("p", "headline", c.headline));
  if (c.media) {
    const md = el("div", "media");
    md.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 15l5-4 4 3 3-2 6 5"/></svg>';
    md.append(el("span", null, c.media));
    b.append(md);
  }
  p.append(b);
  return p;
}

/* ---------- SIMULADOR ---------- */
let simIdx = 0;
const LBL = {
  fab: ["b-alert", "Fabricada (na simulação)"],
  ctx: ["b-care", "Enganosa ou fora de contexto (na simulação)"],
  real: ["b-trust", "Verdadeira (na simulação)"]
};
function renderSim() {
  const c = SIM[simIdx];
  const host = $("#simPost"); host.textContent = ""; host.append(postEl(c));
  $("#simCount").textContent = "Caso " + (simIdx + 1) + " de " + SIM.length;
  document.querySelectorAll("#simChoices button").forEach(b => { b.classList.remove("picked"); b.disabled = false; });
  const r = $("#simResult"); r.textContent = "";
  r.append(el("h3", null, "O que você faria?"), el("p", null, "Escolha uma opção para ver a análise deste caso. Não existe pegadinha: o objetivo é treinar o olhar."));
  r.lastChild.style.color = "var(--muted)";
}
function feedback(choice, c) {
  if (choice === "check") return ["Boa escolha. Verificar antes é o hábito que o Clareia quer construir.", 15];
  if (c.truth === "real") return choice === "share"
    ? ["Neste caso os sinais eram bons, mas o ideal é confirmar a fonte antes de repassar.", 8]
    : ["Cautela é bem-vinda. Aqui, porém, a fonte era confiável e a informação era útil.", 8];
  return choice === "no"
    ? ["Você evitou espalhar um conteúdo problemático. Melhor ainda é saber explicar por quê.", 12]
    : ["Esta é a armadilha: o conteúdo tinha sinais de alerta. Veja abaixo como perceber.", 2];
}
function wireSim() {
  document.querySelectorAll("#simChoices button").forEach(b => b.onclick = async () => {
    const c = SIM[simIdx], choice = b.dataset.c;
    document.querySelectorAll("#simChoices button").forEach(x => { x.classList.toggle("picked", x === b); x.disabled = true; });
    const [msg, pts] = feedback(choice, c);
    award("sim:" + c.id, pts, "+" + pts + " pontos");
    const r = $("#simResult"); r.textContent = "";
    r.append(el("p", null, msg));
    const [cls, lab] = LBL[c.truth]; r.append(el("span", "badge " + cls, lab));
    r.append(el("h3", null, "Sinais nesta mensagem"));
    const ul = el("ul", "signals");
    c.signals.forEach(s => { const li = el("li"); li.append(el("span", "dot " + s.type, s.type === "a" ? "!" : s.type === "t" ? "✓" : "?"), el("span", null, s.text)); ul.append(li); });
    r.append(ul);
    r.append(el("h3", null, "Como verificar"));
    const ol = el("ol", "steps");
    c.steps.forEach(i => { const li = el("li"); const [L, t, d] = METHOD[i]; li.append(el("span", "letter", L)); const s = el("span"); s.append(el("b", null, t + ": "), document.createTextNode(d)); li.append(s); ol.append(li); });
    r.append(ol);
    r.append(el("p", null, c.note)); r.lastChild.style.fontSize = ".92em";
    const nx = el("button", "btn", "Próximo caso"); nx.type = "button";
    nx.onclick = () => { simIdx = (simIdx + 1) % SIM.length; store.set("simIdx", simIdx); renderSim(); };
    r.append(nx);
  });
}

/* ---------- CAÇA-PISTAS ---------- */
let hIdx = 0, hScore = 0, hFound = 0, hRevealed = false;
function huntTotal() { return HUNT[hIdx].segments.filter(s => s.clue).length; }
function updHunt() { $("#huntScore").textContent = hScore; $("#huntFound").textContent = hFound + " de " + huntTotal() + " pistas"; }
function logLine(t, neg) { const L = $("#huntLog"); if (L.firstChild && L.firstChild.tagName === "P") L.textContent = ""; const d = el("div", neg ? "neg" : null, t); L.prepend(d); }
function renderHunt() {
  const h = HUNT[hIdx]; hScore = 0; hFound = 0; hRevealed = false;
  const post = postEl({ who: h.who, where: h.where, avatar: h.avatar, kind: h.kind, headline: "" });
  const body = post.querySelector(".body"); body.textContent = "";
  const p = el("p");
  h.segments.forEach((s, i) => {
    const sp = el("span", "seg", s.text); sp.tabIndex = 0; sp.setAttribute("role", "button"); sp.dataset.i = i;
    const act = () => tapSeg(sp, s, i); sp.onclick = act;
    sp.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); } };
    p.append(sp);
  });
  body.append(p);
  const host = $("#huntPost"); host.textContent = ""; host.append(post);
  $("#huntCount").textContent = "Mensagem " + (hIdx + 1) + " de " + HUNT.length;
  $("#huntLog").innerHTML = '<p style="color:var(--muted)">As explicações das pistas aparecem aqui.</p>';
  $("#huntReveal").hidden = false; $("#huntNext").hidden = true; updHunt();
}
function tapSeg(sp, s, i) {
  if (hRevealed || sp.classList.contains("found") || sp.classList.contains("miss")) return;
  if (s.clue) {
    sp.classList.add("found"); hScore += 10; hFound++;
    award("hunt:" + hIdx + ":" + i, 10);
    logLine("“" + s.text.trim() + "”: " + s.explanation);
  } else {
    sp.classList.add("miss"); hScore = Math.max(0, hScore - 5);
    logLine("“" + s.text.trim() + "” não é, sozinho, um sinal de alerta.", true);
  }
  updHunt();
  if (hFound === huntTotal()) revealHunt();
}
function revealHunt() {
  hRevealed = true; const h = HUNT[hIdx];
  document.querySelectorAll("#huntPost .seg").forEach(sp => {
    const s = h.segments[+sp.dataset.i];
    if (s.clue && !sp.classList.contains("found")) { sp.classList.add("revealed"); logLine("Pista que faltou: “" + s.text.trim() + "”. " + s.explanation); }
  });
  $("#huntReveal").hidden = true; $("#huntNext").hidden = false;
  toast(hFound === huntTotal() ? "Todas as pistas encontradas!" : "Você encontrou " + hFound + " de " + huntTotal() + " pistas");
}
function wireHunt() {
  $("#huntReveal").onclick = revealHunt;
  $("#huntNext").onclick = () => { hIdx = (hIdx + 1) % HUNT.length; renderHunt(); };
}

/* ---------- SINAIS ---------- */
let ans = [];
function renderCheck() {
  const host = $("#checklist"); host.textContent = "";
  host.append(el("span", "eyebrow", "Responda pensando na informação que você recebeu"));
  CHECK.forEach((item, i) => {
    const d = el("div", "check-item"); d.append(el("span", "ql", (i + 1) + ". " + item.question));
    const g = el("div", "seg3"); g.setAttribute("role", "group"); g.setAttribute("aria-label", item.question);
    [["sim", "Sim"], ["nao", "Não"], ["ns", "Não sei"]].forEach(([v, l]) => {
      const b = el("button", null, l); b.type = "button"; b.setAttribute("aria-pressed", ans[i] === v);
      b.onclick = () => { ans[i] = v; renderCheck(); evalCheck(); }; g.append(b);
    });
    d.append(g); host.append(d);
  });
}
function evalCheck() {
  const answered = ans.filter(a => a).length;
  const list = $("#careList"); list.textContent = "";
  if (!answered) { $("#careTitle").textContent = "Responda à lista ao lado"; $("#meter").style.width = "0"; return; }
  let alert = 0, unk = 0;
  function add(k, t) { const li = el("li"); li.append(el("span", "dot " + k, k === "a" ? "!" : "?"), el("span", null, t)); list.append(li); }
  CHECK.forEach((item, i) => {
    const a = ans[i]; if (!a) return;
    const q = item.question;
    if (a === "ns") { unk++; add("c", "Ainda falta conferir: " + q.replace("?", "").toLowerCase()); }
    else if ((a === "sim") === item.good) { /* sinal de confianca */ }
    else { alert++; add("a", item.good ? "Falta: " + q.replace("?", "").replace(/^Dá para saber /, "saber ").toLowerCase() : "Sinal de alerta: " + q.replace("?", "").toLowerCase()); }
  });
  const risk = (alert * 2 + unk) / (answered * 2);
  const m = $("#meter"); m.style.width = Math.max(8, Math.round(risk * 100)) + "%";
  let t, x, col;
  if (alert >= 3 || risk > .55) { t = "Cuidado alto: não compartilhe agora"; x = "A informação traz vários sinais de alerta. Use o método CLAREIA antes de qualquer decisão."; col = "var(--alert)"; }
  else if (alert > 0 || unk > 0) { t = "Cuidado médio: verifique os pontos em aberto"; x = "Há perguntas sem resposta ou algum sinal de alerta. Confira antes de repassar."; col = "var(--care)"; }
  else { t = "Sinais de confiança presentes"; x = "Isso não prova que a informação é verdadeira, mas ela tem origem e contexto conferíveis. Confirme em mais uma fonte se for repassar."; col = "var(--trust)"; }
  m.style.background = col; $("#careTitle").textContent = t;
  $("#careText").textContent = x + (answered < CHECK.length ? " (" + answered + " de " + CHECK.length + " respondidas)" : "");
  if (answered === CHECK.length) award("check:done", 10, "+10 pontos");
}
function wireCheck() {
  $("#resetCheck").onclick = () => {
    ans = CHECK.map(() => null); renderCheck(); evalCheck();
    $("#careText").textContent = "Cada resposta “não sei” também conta: ela mostra o que ainda falta verificar.";
  };
}

/* ---------- DEEPFAKE QUIZ ---------- */
let dqi = 0;
function renderDQ() {
  const h = $("#dfQuiz"); h.textContent = ""; const q = DQ[dqi];
  h.append(el("span", "eyebrow", "Exercício " + (dqi + 1) + " de " + DQ.length), el("h3", null, q.question));
  const o = el("div", "opts"); const fb = el("p"); fb.setAttribute("role", "status");
  const nx = el("button", "btn", dqi < DQ.length - 1 ? "Próximo exercício" : "Recomeçar"); nx.type = "button"; nx.hidden = true;
  nx.onclick = () => { dqi = (dqi + 1) % DQ.length; renderDQ(); };
  q.options.forEach((t, i) => {
    const b = el("button", null, t); b.type = "button";
    b.onclick = () => {
      o.querySelectorAll("button").forEach(x => { x.disabled = true; });
      b.classList.add(i === q.correct ? "right" : "wrong");
      o.children[q.correct].classList.add("right");
      fb.textContent = (i === q.correct ? "Isso. " : "Não exatamente. ") + q.explanation;
      if (i === q.correct) award("quiz:" + q.id, 10, "+10 pontos");
      nx.hidden = false;
    };
    o.append(b);
  });
  h.append(o, fb, nx);
}

/* ---------- ASSISTENTE DE SINAIS (backend) ---------- */
function wireAI() {
  $("#aiGo").onclick = async () => {
    const txt = $("#aiText").value.trim(), msg = $("#aiMsg"), out = $("#aiOut"), btn = $("#aiGo");
    if (txt.length < 12) { msg.textContent = "Cole um texto um pouco maior."; return; }
    btn.disabled = true; msg.textContent = "Analisando os sinais…"; out.textContent = "";
    try {
      const r = await postJSON(API + "/assistant/signals", { text: txt });
      out.append(el("span", "badge b-care", "Sinais apontados · não é um veredito"));
      if (Array.isArray(r.signals) && r.signals.length) {
        const ul = el("ul", "signals");
        r.signals.forEach(s => {
          const k = s.type === "alerta" ? "a" : s.type === "confianca" ? "t" : "c";
          const li = el("li"); const sp = el("span");
          sp.append(el("b", null, "“" + String(s.excerpt || "").slice(0, 120) + "” "), document.createTextNode(String(s.explanation || "")));
          li.append(el("span", "dot " + k, k === "a" ? "!" : k === "t" ? "✓" : "?"), sp); ul.append(li);
        });
        out.append(ul);
      } else {
        out.append(el("p", null, "Não encontramos sinais de alerta evidentes, mas isso não garante que a informação seja verdadeira. Verifique a origem assim mesmo."));
      }
      if (Array.isArray(r.questions) && r.questions.length) {
        out.append(el("h3", null, "Perguntas para verificar"));
        const ol = el("ol"); ol.style.margin = "0"; ol.style.paddingLeft = "20px";
        r.questions.slice(0, 5).forEach(p => ol.append(el("li", null, String(p)))); out.append(ol);
      }
      if (Array.isArray(r.steps) && r.steps.length) {
        out.append(el("h3", null, "Passos do método CLAREIA"));
        const sl = el("ol", "steps");
        r.steps.forEach(L => { const idx = methodIndexByLetter(L); const [letter, t, d] = METHOD[idx]; const li = el("li"); li.append(el("span", "letter", letter)); const s = el("span"); s.append(el("b", null, t + ": "), document.createTextNode(d)); li.append(s); sl.append(li); });
        out.append(sl);
      }
      out.append(el("p", null, r.disclaimer || "Lembre: só você pode concluir, depois de conferir as fontes."));
      out.lastChild.style.cssText = "font-size:.85em;color:var(--muted)";
      msg.textContent = "";
      award("ai:use", 5, "+5 pontos");
    } catch (e) {
      msg.textContent = e.status === 400 ? "Cole um texto um pouco maior." : "Não deu certo desta vez. Tente de novo.";
    } finally { btn.disabled = false; }
  };
}

/* ---------- ROTAS ---------- */
const VIEWS = ["inicio", "simulador", "cacapistas", "sinais", "deepfakes", "metodo", "instituicoes"];
function route() {
  const v = VIEWS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "inicio";
  VIEWS.forEach(n => { $("#v-" + n).hidden = n !== v; });
  document.querySelectorAll(".nav a").forEach(a => { if (a.getAttribute("href") === "#" + v) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
  const cur = document.querySelector('.nav a[aria-current="page"]'); if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: "nearest", inline: "nearest" });
  window.scrollTo(0, 0);
}

/* ---------- BOOTSTRAP ---------- */
async function main() {
  try {
    await initPlayer();
    const content = await getJSON(API + "/content");
    METHOD = content.method.map(m => [m.letter, m.title, m.description]);
    SIM = content.cases;
    HUNT = content.hunts;
    CHECK = content.checklist;
    DQ = content.deepfakeQuiz;
    ans = CHECK.map(() => null);
    simIdx = store.get("simIdx", 0) % SIM.length;

    buildMethod();
    renderSim(); wireSim();
    renderHunt(); wireHunt();
    renderCheck(); wireCheck();
    renderDQ();
    wireAI();
  } catch (e) {
    console.error("Falha ao carregar o Clareia", e);
    toast("Não foi possível carregar o conteúdo. Recarregue a página.");
  }
  window.addEventListener("hashchange", route);
  route();
}

main();
})();
