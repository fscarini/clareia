export default function Institutions() {
  return (
    <section className="view" aria-labelledby="h-inst">
      <div className="vhead">
        <span className="eyebrow">Go-to-market</span>
        <h1 id="h-inst">Clareia para escolas, empresas e governo</h1>
        <p>Gratuito para o cidadão. Sustentado por instituições que precisam formar pessoas para um ambiente de informação cada vez mais manipulado.</p>
      </div>

      <div className="plans">
        <div className="panel plan">
          <span className="tag">Cidadão</span>
          <h3>Clareia Aberto</h3>
          <p className="price">Gratuito</p>
          <ul>
            <li>Simulador, jogos e método completo</li>
            <li>Sem cadastro e sem coleta de dados</li>
            <li>Modo leve para pacote de dados</li>
          </ul>
        </div>
        <div className="panel plan hl">
          <span className="tag">Escolas e universidades</span>
          <h3>Clareia Escola</h3>
          <p className="price">Licença anual por instituição</p>
          <ul>
            <li>Painel do professor com progresso da turma</li>
            <li>Trilhas por série e planos de aula prontos</li>
            <li>Alinhado à competência geral 5 da BNCC (cultura digital) e à Política Nacional de Educação Digital</li>
          </ul>
        </div>
        <div className="panel plan">
          <span className="tag">Empresas e órgãos públicos</span>
          <h3>Clareia Equipes</h3>
          <p className="price">Assinatura por colaborador</p>
          <ul>
            <li>Simulações de golpes com deepfake de voz e vídeo</li>
            <li>Campanhas periódicas e relatórios de evolução</li>
            <li>Conteúdo personalizado para o setor</li>
          </ul>
        </div>
      </div>

      <div className="tbl">
        <table>
          <thead>
            <tr><th>Como medimos o resultado</th><th>Por que importa</th></tr>
          </thead>
          <tbody>
            <tr><td>Taxa de “verificaria antes” no simulador</td><td>Mostra mudança de hábito, o objetivo central do produto.</td></tr>
            <tr><td>Pistas encontradas no Caça-pistas, antes e depois da trilha</td><td>Mede a capacidade de reconhecer sinais de manipulação.</td></tr>
            <tr><td>Queda de cliques em simulações de golpe (Equipes)</td><td>Traduz o aprendizado em redução de risco para a organização.</td></tr>
            <tr><td>Alcance nas classes C, D e E (Aberto)</td><td>Garante que o produto não amplie a desigualdade de acesso.</td></tr>
          </tbody>
        </table>
      </div>

      <div className="panel" style={{ display: "grid", gap: 18 }}>
        <h3>Roteiro</h3>
        <ol className="road">
          <li className="now"><span className="k">Agora</span><b>MVP web</b><p>Simulador, Caça-pistas, sinais, deepfakes e método. Teste com turmas piloto.</p></li>
          <li><span className="k">Próximo</span><b>Painel do educador</b><p>Turmas, relatórios e banco de casos por faixa etária.</p></li>
          <li><span className="k">Depois</span><b>Clareia no WhatsApp</b><p>Exercícios curtos onde a desinformação circula, com modo de baixo consumo de dados.</p></li>
          <li><span className="k">Escala</span><b>Equipes e governo</b><p>Simulações de golpes corporativos e campanhas públicas em períodos eleitorais.</p></li>
        </ol>
      </div>

      <div className="tbl">
        <table>
          <thead>
            <tr><th>Princípio do Manifesto pela IA Consciente</th><th>Como o Clareia aplica</th></tr>
          </thead>
          <tbody>
            <tr><td>1. Supervisão humana</td><td>A decisão de compartilhar é sempre da pessoa. A plataforma treina o julgamento, não o substitui.</td></tr>
            <tr><td>2. Transparência</td><td>Todo caso é marcado como fictício, e o assistente de sinais é identificado como ferramenta automatizada.</td></tr>
            <tr><td>3. Verificação antes da publicação</td><td>É o próprio produto: o método CLAREIA aparece em todas as análises.</td></tr>
            <tr><td>4. Privacidade desde o início</td><td>Sem cadastro no plano Aberto. A pontuação é anônima.</td></tr>
            <tr><td>6. Responsabilidade</td><td>Nenhum veredito automatizado sobre conteúdos reais.</td></tr>
            <tr><td>10. Alfabetização em IA</td><td>Explica deepfakes e os limites da detecção automática.</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
