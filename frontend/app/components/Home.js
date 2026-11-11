import { Disclaimer, Post } from "./common";

const FEATURES = [
  { tab: "simulador", title: "Compartilharia?", text: "Notícias simuladas, verdadeiras e falsas. Você decide e depois vê como verificar.",
    icon: (<><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M7 9h10M7 13h6" /></>) },
  { tab: "cacapistas", title: "Caça-pistas", text: "Jogo: encontre os sinais de manipulação escondidos em cada mensagem.",
    icon: (<><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5" /></>) },
  { tab: "sinais", title: "Sinais de confiabilidade", text: "Avalie qualquer informação com uma lista de sinais. O resultado é um nível de cuidado, não um veredito.",
    icon: (<path d="M4 18h4V10H4zM10 18h4V6h-4zM16 18h4v-5h-4z" />) },
  { tab: "deepfakes", title: "Deepfakes", text: "O que são, como são feitos e por que o contexto vale mais que procurar defeitos na imagem.",
    icon: (<><circle cx="12" cy="9" r="4" /><path d="M5 20c1.5-4 12.5-4 14 0" /><path d="M3 3l18 18" /></>) },
  { tab: "metodo", title: "Método CLAREIA", text: "Sete passos para verificar qualquer informação, fáceis de lembrar pelo nome.",
    icon: (<path d="M4 6h16M4 12h16M4 18h10" />) },
  { tab: "instituicoes", title: "Para instituições", text: "Planos para escolas, empresas e órgãos públicos, com acompanhamento de resultados.",
    icon: (<path d="M3 10l9-6 9 6M5 10v9h14v-9M9 19v-5h6v5" />) },
];

export default function Home({ onNavigate }) {
  return (
    <section className="view" aria-labelledby="h-inicio">
      <div className="hero">
        <div>
          <span className="eyebrow">Educação para a verificação de informações</span>
          <h1 id="h-inicio">
            Antes de compartilhar, <span>clareia</span>.
          </h1>
          <p className="lead">
            O Clareia ensina a reconhecer conteúdos manipulados, notícias falsas e deepfakes praticando com casos
            simulados. Aqui ninguém diz o que é verdade por você: você aprende a conferir sozinho.
          </p>
          <div className="row">
            <button className="btn" onClick={() => onNavigate("simulador")}>Começar a praticar</button>
            <button className="btn ghost" onClick={() => onNavigate("metodo")}>Conhecer o método</button>
          </div>
        </div>
        <div className="demo" aria-label="Exemplo de exercício">
          <span className="fict">Exemplo fictício</span>
          <Post
            who="Encaminhada com frequência"
            where="Grupo da família · 07:42"
            avatar="?"
            kind=""
            headline="URGENTE: vacina da gripe será suspensa no país a partir de amanhã. Repasse para todos!"
          />
          <p className="q">Você compartilharia essa informação?</p>
          <button className="btn" style={{ textAlign: "center" }} onClick={() => onNavigate("simulador")}>
            Responder no simulador
          </button>
        </div>
      </div>

      <div className="cards3">
        {FEATURES.map((f) => (
          <button key={f.tab} className="panel feat" onClick={() => onNavigate(f.tab)}>
            <span className="ic">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {f.icon}
              </svg>
            </span>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </button>
        ))}
      </div>

      <Disclaimer>
        <b>Nosso compromisso:</b> todos os casos do Clareia são fictícios e criados para ensinar. Para conteúdos
        reais, o Clareia nunca afirma se algo é verdadeiro ou falso com base em análise automatizada; ele mostra
        sinais e caminhos de verificação para você decidir.
      </Disclaimer>
    </section>
  );
}
