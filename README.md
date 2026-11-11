# Clareia

Protótipo interativo de uma plataforma educativa que ensina a **verificar informações antes de compartilhar** — identificar notícias falsas, conteúdo fora de contexto e deepfakes.

Projeto do **Grupo G14** — UC *Inteligência Artificial e Sociedade*, Universidade São Judas Tadeu (USJT), 2026.

> **Compromisso:** todos os casos são fictícios. O Clareia **nunca** afirma se um conteúdo real é verdadeiro ou falso. Ele mostra **sinais** e **caminhos de verificação** para a pessoa decidir.

## O que o app faz

- **Compartilharia?** — simulador com 7 casos fictícios (notícia, corrente, foto fora de contexto, deepfake de voz/vídeo, alerta oficial). Você decide e vê a análise.
- **Caça-pistas** — jogo de encontrar os trechos suspeitos de cada mensagem.
- **Sinais de confiabilidade** — checklist que gera um *nível de cuidado* (não um veredito).
- **Assistente de sinais** — cole um texto e o servidor aponta sinais, perguntas de verificação e passos do método. **Sem veredito.**
- **Deepfakes** — explicação + quiz.
- **Método CLAREIA** — 7 passos de verificação (Calma, Leia além do título, Autor e origem, Reconfirme, Examine imagens e áudios, Intenção, Avalie e decida).
- **Para instituições** — planos, métricas e roteiro (go-to-market).
- **Pontuação** persistida no backend.

## Arquitetura

Monorepo com duas aplicações:

| Camada | Tecnologia | Pasta |
|---|---|---|
| Backend / API | Java 21, Spring Boot 3.1.4 (Web, Data JPA, Validation), H2 em memória | raiz (`pom.xml`, `src/`) |
| Frontend | Next.js 16 (App Router) + React 19 | `frontend/` |

O frontend fala com o backend via `/api`, encaminhado pelo *rewrite* do [`frontend/next.config.mjs`](frontend/next.config.mjs) — assim o navegador usa sempre a mesma origem (**sem CORS**). O conteúdo educativo fica em [`src/main/resources/content/content.json`](src/main/resources/content/content.json). O **Assistente de sinais** é uma *engine determinística de regras* (`SignalAnalyzer`) — sem IA generativa —, transparente e, por construção, incapaz de dar veredito.

### Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET  | `/api/content` | Todo o conteúdo (casos, caça-pistas, checklist, quiz, método) |
| POST | `/api/players` | Cria um jogador anônimo (retorna `id`) |
| GET  | `/api/players/{id}` | Pontuação atual |
| POST | `/api/players/{id}/score` | Credita pontos de uma atividade (idempotente por chave) |
| POST | `/api/assistant/signals` | Analisa um texto → sinais, perguntas e passos (nunca veredito) |

## Rodar localmente

Pré-requisitos: **JDK 21**, **Maven 3.9+** e **Node 20+**. Em dois terminais:

```bash
# 1) Backend (porta 8080)
mvn spring-boot:run
```

```bash
# 2) Frontend (porta 3000)
cd frontend
npm install
npm run dev
```

Abra **http://localhost:3000**. O frontend encaminha `/api` para o backend em `http://localhost:8080`.

## Deploy no Render (grátis)

O repositório já traz um **Blueprint** ([`render.yaml`](render.yaml)) que sobe os dois serviços no plano gratuito do [Render](https://render.com): o backend via Docker ([`Dockerfile`](Dockerfile)) e o frontend como serviço Node.

1. Faça login no Render e conecte sua conta do GitHub.
2. **New → Blueprint** e selecione este repositório. O Render lê o `render.yaml` e cria `clareia-backend` e `clareia-frontend`.
3. Confirme e aguarde o build. A URL do backend é injetada automaticamente no frontend (`CLAREIA_API_URL`).
4. Acesse a URL do `clareia-frontend`.

> No plano gratuito os serviços "dormem" após ~15 min de inatividade — a primeira chamada depois disso leva ~30–60s. Como o H2 é em memória, a pontuação zera quando o backend reinicia.

## Privacidade

Não há cadastro nem login. O "jogador" é anônimo (um UUID) e guarda apenas a pontuação. O console do H2 fica **desligado** por padrão (ligue em dev com `H2_CONSOLE=true`).
