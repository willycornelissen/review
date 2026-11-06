# Plan: Book Review Agent (AaaS)

**Source PRD**: [.claude/prds/book-review-agent.prd.md](file:///home/willycornelissen/Desktop/Dablio/review/.claude/prds/book-review-agent.prd.md)
**Selected Milestone**: Milestone 1 & 2 (Identificação Ágil via API Pública & Resenha Crítica Híbrida via Agente)
**Complexity**: Medium

## Summary
Construir uma aplicação web completa (Frontend React + TypeScript + Vite e Backend Node.js/Express) que permite identificar rapidamente qualquer livro através de APIs públicas (Google Books / Open Library) e acionar um Agente de IA especialista em crítica literária para produzir uma resenha aprofundada e estruturada em streaming, servindo como referência analítica de escrita.

## Patterns to Mirror
| Category | Source | Pattern |
|---|---|---|
| Naming | `.agents/rules/common-coding-style.md` | CamelCase para componentes, kebab-case para arquivos, nomes de métodos imperativos e descritivos |
| Errors | `.agents/rules/common-patterns.md` | Respostas de erro tipadas com códigos HTTP adequados, feedback visual imediato na UI |
| Tests | `.agents/rules/common-testing.md` | TDD para serviços de API e lógica do agente (mocks de rede sem bater em APIs externas em testes de unidade) |

## Files to Change
| File | Action | Why |
|---|---|---|
| `package.json` | CREATE | Configuração de scripts, dependências de frontend (React, Tailwind, Lucide, React-Markdown) e backend (Express, SDK de IA) |
| `tsconfig.json` & `vite.config.ts` | CREATE | Compilação TypeScript e proxy de API para desenvolvimento |
| `tailwind.config.js` & `src/index.css` | CREATE | Estilização minimalista, moderna e responsiva |
| `server/index.ts` | CREATE | Servidor backend Express com endpoints de busca de livros e geração de resenhas |
| `server/services/booksService.ts` | CREATE | Integração com Google Books API pública para busca e extração de metadados |
| `server/services/reviewAgent.ts` | CREATE | Agente de IA para crítica literária estruturada com suporte a streaming |
| `server/tests/booksService.test.ts` | CREATE | Testes unitários do serviço de livros com mocks |
| `server/tests/reviewAgent.test.ts` | CREATE | Testes do agente de resenha e montagem de contexto |
| `src/types/index.ts` | CREATE | Interfaces compartilhadas para `Book`, `ReviewSection` e `ReviewPayload` |
| `src/services/api.ts` | CREATE | Cliente HTTP de comunicação com o backend e consumo de streaming |
| `src/components/BookSearch.tsx` | CREATE | Campo de busca reativo com debouncing e dropdown visual de seleção |
| `src/components/BookCard.tsx` | CREATE | Exibição em destaque do livro selecionado com capa e sinopse |
| `src/components/ReviewViewer.tsx` | CREATE | Visualizador elegante da resenha com streaming, seções analíticas e botão de copiar |
| `src/App.tsx` | CREATE | Orquestrador de estado da aplicação web |

## Tasks

### Task 1: Scaffolding do Projeto & Configuração de Tipos e Ferramental
- **Action**: Inicializar `package.json`, configurar Vite, React, TypeScript, Tailwind CSS, Vitest e dependências de servidor (Express, dotenv, SDKs de IA).
- **Mirror**: Padrões modernos TypeScript com módulos ESM e scripts claros (`dev`, `build`, `test`).
- **Validate**: `npm run build` e `npm test` executam sem erros.

### Task 2: Serviço de Busca de Livros (TDD)
- **Action**: Implementar `server/services/booksService.ts` consumindo a Google Books API pública (sem necessidade de autenticação obrigatória para buscas básicas) com mapeamento normalizado para `Book { id, title, authors, publishedYear, thumbnail, description, categories }`.
- **Mirror**: Tratamento resiliente de dados ausentes (capas faltantes, datas truncadas).
- **Validate**: `npm test -- server/tests/booksService.test.ts` passando com 100% de sucesso.

### Task 3: Agente de IA Especialista em Crítica Literária (TDD)
- **Action**: Implementar `server/services/reviewAgent.ts`. O agente recebe o livro ancorado pelos metadados da API e aplica uma persona crítica rigorosa dividida em 5 seções analíticas:
  1. *Premissa & Visão Geral*;
  2. *Análise Temática & Subtexto*;
  3. *Estilo Narrativo & Ritmo*;
  4. *Pontos Fortes & Limitações Críticas*;
  5. *Veredito Crítico & Recomendações*.
  Suporta resposta em streaming via Server-Sent Events (SSE).
- **Mirror**: Ancoragem em metadados factuais para blindagem contra alucinações.
- **Validate**: `npm test -- server/tests/reviewAgent.test.ts` passando com sucesso.

### Task 4: Endpoints de Backend & Integração
- **Action**: Configurar `server/index.ts` com rotas `GET /api/books/search?q=:query` e `POST /api/reviews/generate` (com streaming SSE), além de middleware de CORS e tratamento de erros.
- **Mirror**: APIs RESTful previsíveis com fallback gracioso se as APIs de IA/livros apresentarem lentidão.
- **Validate**: `curl` local validando a busca de um livro e a resposta do endpoint.

### Task 5: Componentes de Busca e Seleção de Livros
- **Action**: Implementar `BookSearch.tsx` com input reativo, debouncing de 300ms, indicador de carregamento e seleção interativa com miniaturas de capa; e `BookCard.tsx` para apresentar o livro focado.
- **Mirror**: Acessibilidade, estados de foco e layout responsivo.
- **Validate**: Busca interativa funcionando e livro selecionado atualizando o estado do app.

### Task 6: Visualizador de Resenha com Streaming e Ação de Cópia
- **Action**: Implementar `ReviewViewer.tsx` capaz de receber o streaming do agente em tempo real, renderizar markdown formatado com tipografia agradável e fornecer botão de 1-clique para copiar a resenha formatada.
- **Mirror**: Feedback visual contínuo durante a geração do texto.
- **Validate**: Resenha gerada e exibida com botão de cópia funcionando perfeitamente.

## Validation
```bash
# Validação de tipos e build
npm run typecheck
npm run build

# Validação da suíte de testes unitários
npm test

# Validação do servidor e interface em execução
npm run dev
```

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| Rate limit ou instabilidade na API pública de livros | Baixa | Cache em memória de buscas recentes e sanitização de query |
| Ausência de chave de IA em novos ambientes | Média | Suporte híbrido automático tanto a GEMINI_API_KEY quanto a OPENAI_API_KEY existentes no ambiente, com mensagem explicativa amigável caso nenhuma esteja setada |
| Livros sem capa na API pública | Média | Placeholder visual elegante com título e autor |

## Acceptance
- [ ] Interface web abre localmente de forma responsiva e limpa.
- [ ] Busca de livros retorna resultados em tempo real com capa e metadados.
- [ ] Ao clicar em um livro, o Agente de IA gera a resenha estruturada em streaming.
- [ ] A resenha é apresentada nas 5 seções analíticas solicitadas.
- [ ] O usuário consegue copiar a resenha com um clique para usar em seus próprios artigos.
- [ ] Todos os testes unitários passam.
