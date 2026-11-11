import { useState } from "react";

function Quiz({ quiz, award }) {
  const [dqi, setDqi] = useState(0);
  const [chosen, setChosen] = useState(null);
  const q = quiz[dqi];

  function choose(i) {
    if (chosen !== null) return;
    setChosen(i);
    if (i === q.correct) award("quiz:" + q.id, 10, "+10 pontos");
  }
  function next() {
    setDqi((dqi + 1) % quiz.length);
    setChosen(null);
  }

  return (
    <div className="panel quiz">
      <span className="eyebrow">Exercício {dqi + 1} de {quiz.length}</span>
      <h3>{q.question}</h3>
      <div className="opts">
        {q.options.map((opt, i) => {
          let cls;
          if (chosen !== null) {
            if (i === q.correct) cls = "right";
            else if (i === chosen) cls = "wrong";
          }
          return (
            <button key={i} type="button" className={cls} disabled={chosen !== null} onClick={() => choose(i)}>
              {opt}
            </button>
          );
        })}
      </div>
      {chosen !== null && (
        <p role="status">{(chosen === q.correct ? "Isso. " : "Não exatamente. ") + q.explanation}</p>
      )}
      {chosen !== null && (
        <button className="btn" type="button" onClick={next}>
          {dqi < quiz.length - 1 ? "Próximo exercício" : "Recomeçar"}
        </button>
      )}
    </div>
  );
}

export default function Deepfakes({ quiz, award }) {
  return (
    <section className="view" aria-labelledby="h-df">
      <div className="vhead">
        <span className="eyebrow">Explicação e prática</span>
        <h1 id="h-df">Deepfakes, sem mistério</h1>
        <p>Deepfakes são imagens, vídeos ou áudios criados ou alterados por IA para parecer que alguém disse ou fez algo que não aconteceu.</p>
      </div>
      <div className="df-grid">
        <div className="panel">
          <h3>Como são feitos</h3>
          <p style={{ fontSize: ".93em" }}>Um modelo de IA aprende, a partir de muitas fotos, vídeos ou gravações de uma pessoa, como é o rosto ou a voz dela. Depois, gera conteúdo novo com essas características. Hoje, poucos segundos de áudio bastam para imitar uma voz.</p>
        </div>
        <div className="panel">
          <h3>Sinais que ainda podem ajudar</h3>
          <ul>
            <li>Boca fora de sincronia com a fala</li>
            <li>Piscadas estranhas ou olhar fixo</li>
            <li>Mãos, dentes e orelhas deformados</li>
            <li>Textos ilegíveis em placas e roupas</li>
            <li>Voz sem respiração, com ritmo robótico</li>
          </ul>
        </div>
        <div className="panel">
          <h3>Por que os sinais não bastam</h3>
          <p style={{ fontSize: ".93em" }}>Os geradores melhoram rápido, e muitos defeitos já desapareceram. Procurar falhas na imagem ajuda, mas não é prova. O que funciona melhor é checar o <b>contexto</b>: quem publicou, onde mais aparece e se a pessoa confirma por um canal oficial.</p>
        </div>
        <div className="panel">
          <h3>Golpes mais comuns</h3>
          <ul>
            <li>Áudio com a voz de um parente pedindo dinheiro</li>
            <li>Vídeo de famoso “oferecendo” prêmio ou investimento</li>
            <li>Ligação com a voz do chefe pedindo transferência</li>
            <li>Vídeo de político dizendo algo que nunca disse</li>
          </ul>
        </div>
      </div>
      <Quiz quiz={quiz} award={award} />
    </section>
  );
}
