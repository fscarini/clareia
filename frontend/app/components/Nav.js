export const TABS = [
  { id: "inicio", label: "Início" },
  { id: "simulador", label: "Compartilharia?" },
  { id: "cacapistas", label: "Caça-pistas" },
  { id: "sinais", label: "Sinais" },
  { id: "deepfakes", label: "Deepfakes" },
  { id: "metodo", label: "Método CLAREIA" },
  { id: "instituicoes", label: "Para instituições" },
];

export default function Nav({ active, onSelect, xp }) {
  return (
    <header className="top">
      <div className="wrap">
        <button className="logo" onClick={() => onSelect("inicio")} aria-label="Clareia, início">
          <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M4 22a12 12 0 0 1 24 0Z" fill="var(--accent)" />
            <g stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round">
              <path d="M16 3v4" />
              <path d="M5.4 7.4l2.8 2.8" />
              <path d="M26.6 7.4l-2.8 2.8" />
              <path d="M2 26h28" />
            </g>
          </svg>
          Clareia
        </button>
        <nav className="nav" aria-label="Áreas">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              aria-current={active === t.id ? "page" : undefined}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="xp" title="Pontos de prática">
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="6" fill="var(--accent)" />
          </svg>
          <b>{xp}</b> pontos
        </div>
      </div>
    </header>
  );
}
