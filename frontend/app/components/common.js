// Blocos de UI reutilizados por varias telas.

export function dotChar(type) {
  return type === "a" ? "!" : type === "t" ? "✓" : "?";
}

/** Card visual de uma mensagem/post (usado no simulador e no caca-pistas). */
export function Post({ who, where, avatar, kind, headline, media, children }) {
  return (
    <div className="post">
      <div className="meta">
        <div className="avatar">{avatar}</div>
        <div className="who">
          <b>{who}</b>
          <span>{where}</span>
        </div>
        <span className="kind">{kind}</span>
      </div>
      <div className="body">
        {headline ? <p className="headline">{headline}</p> : null}
        {children}
        {media ? (
          <div className="media">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 15l5-4 4 3 3-2 6 5" />
            </svg>
            <span>{media}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Lista de sinais no formato { type: 'a'|'t'|'c', text }. */
export function SignalsList({ signals }) {
  return (
    <ul className="signals">
      {signals.map((s, i) => (
        <li key={i}>
          <span className={"dot " + s.type}>{dotChar(s.type)}</span>
          <span>{s.text}</span>
        </li>
      ))}
    </ul>
  );
}

/** Passos do metodo CLAREIA a partir de indices no array `method`. */
export function StepsList({ indices, method }) {
  return (
    <ol className="steps">
      {indices.map((idx, i) => {
        const step = method[idx];
        if (!step) return null;
        return (
          <li key={i}>
            <span className="letter">{step.letter}</span>
            <span>
              <b>{step.title}: </b>
              {step.description}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16v.5" />
  </svg>
);

export function Disclaimer({ children }) {
  return (
    <div className="disclaimer">
      <InfoIcon />
      <span>{children}</span>
    </div>
  );
}
