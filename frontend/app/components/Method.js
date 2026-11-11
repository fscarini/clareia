import { Disclaimer } from "./common";

export default function Method({ method }) {
  return (
    <section className="view" aria-labelledby="h-met">
      <div className="vhead">
        <span className="eyebrow">O método</span>
        <h1 id="h-met">Sete passos que o nome ensina</h1>
        <p>Cada letra de CLAREIA é um passo para verificar uma informação antes de compartilhar. Ele aparece em todas as análises da plataforma.</p>
      </div>
      <p className="wordmark" aria-hidden="true">
        <span>C</span>L<span>A</span>R<span>E</span>I<span>A</span>
      </p>
      <ol className="method">
        {method.map((m, i) => (
          <li key={i}>
            <span className="L">{m.letter}</span>
            <b>{m.title}</b>
            <p>{m.description}</p>
          </li>
        ))}
      </ol>
      <Disclaimer>
        Ferramentas úteis para os passos R e E: busca reversa de imagens (Google Lens, Bing Visual Search, TinEye),
        sites oficiais de órgãos públicos e agências de checagem de fatos.
      </Disclaimer>
    </section>
  );
}
