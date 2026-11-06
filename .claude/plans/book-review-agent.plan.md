# Plan: Book Review Agent (AaaS) - GitHub Pages + Firebase

**Source PRD**: [.claude/prds/book-review-agent.prd.md](file:///home/willycornelissen/Desktop/Dablio/review/.claude/prds/book-review-agent.prd.md)
**Selected Milestone**: Milestone 1, 2, 3 & 4 (Identificação de Livros, Agente de Resenha com Streaming, Persistência Firebase e Deploy GitHub Pages)
**Complexity**: Medium

## Summary
Construir uma aplicação web Single Page Application (SPA) em **React + TypeScript + Vite + Tailwind CSS**, concebida especificamente para hospedagem estática no **GitHub Pages** e persistência de dados no **Firebase (Firestore)**. A aplicação consome a API pública do Google Books para busca e identificação rápida de livros, aciona um Agente de IA especialista em crítica literária para gerar resenhas estruturadas em streaming direto no navegador e salva automaticamente o histórico de resenhas no Firestore.

## Patterns to Mirror
| Category | Source | Pattern |
|---|---|---|
| Naming | `.agents/rules/common-coding-style.md` | PascalCase para componentes React, camelCase para hooks e serviços, nomes semânticos e declarativos |
| Architecture | GitHub Pages + Firebase SPA | Arquitetura 100% cliente sem servidor próprio dedicado; APIs externas acessadas via CORS com chave protegida no cliente (ou fallback gracioso) |
| Persistence | Firebase Firestore + Offline Fallback | Gravação e leitura no Firestore (`reviews` collection) com fallback automático para `localStorage` caso as credenciais do Firebase ainda não tenham sido configuradas |
| Tests | `.agents/rules/common-testing.md` | Testes unitários com Vitest para o mapeamento de livros, o agente de resenha e os serviços de dados com mocks |

## Files to Change
| File | Action | Why |
|---|---|---|
| `package.json` | CREATE | Dependências SPA: `react`, `react-dom`, `firebase`, `@google/genai`, `lucide-react`, `clsx`, `tailwind-merge`, `vite`, `typescript`, `vitest` |
| `vite.config.ts` | CREATE | Configuração do Vite com base path relativa `./` para funcionamento perfeito no GitHub Pages |
| `tsconfig.json` & `tsconfig.node.json` | CREATE | Tipagem estrita TypeScript |
| `tailwind.config.js` & `postcss.config.js` | CREATE | Sistema de design moderno e responsivo |
| `src/index.css` & `src/main.tsx` | CREATE | Ponto de entrada da aplicação e estilos globais |
| `src/types/index.ts` | CREATE | Interfaces TypeScript: `Book`, `Review`, `ReviewSection`, `FirebaseConfig` |
| `src/services/googleBooks.ts` | CREATE | Integração direta com Google Books API para busca em tempo real com normalização de capas e autores |
| `src/services/firebase.ts` | CREATE | Inicialização do Firebase e operações do Firestore (`saveReview`, `getReviews`, `deleteReview`) com fallback para localStorage |
| `src/services/reviewAgent.ts` | CREATE | Agente de IA para crítica literária com prompt analítico fundamentado nos metadados e streaming em tempo real |
| `src/components/Navbar.tsx` | CREATE | Barra de navegação com alternância de abas ("Nova Resenha" vs "Histórico Salvo") e modal de configurações de API |
| `src/components/BookSearch.tsx` | CREATE | Campo de busca ágil com debounce, preview de resultados e seleção interativa |
| `src/components/BookCard.tsx` | CREATE | Card de destaque do livro selecionado com imagem de capa, sinopse e badges de categoria |
| `src/components/ReviewViewer.tsx` | CREATE | Visualizador rico da resenha com streaming dinâmico, seções críticas e botão de 1-clique para cópia |
| `src/components/HistoryList.tsx` | CREATE | Lista de resenhas salvas no Firebase/Firestore com busca e leitura rápida |
| `src/components/SettingsModal.tsx` | CREATE | Modal para configuração das credenciais do Firebase e da chave de IA (salvas em localStorage para uso estático no GitHub Pages) |
| `src/App.tsx` | CREATE | Orquestração central de estado (livro selecionado, resenha ativa, visualização) |
| `src/tests/googleBooks.test.ts` | CREATE | Testes unitários do serviço de livros |
| `src/tests/reviewAgent.test.ts` | CREATE | Testes unitários do agente e montagem do prompt estruturado |
| `.github/workflows/deploy.yml` | CREATE | GitHub Actions workflow para build e deploy automático no GitHub Pages |

## Tasks

### Task 1: Scaffolding SPA & Configuração para GitHub Pages
- **Action**: Inicializar `package.json`, Vite (com `base: './'`), TypeScript, Tailwind CSS, Vitest e dependências (`firebase`, `@google/genai`, `lucide-react`).
- **Mirror**: Padrão de build estático do Vite para GitHub Pages.
- **Validate**: `npm run build` gera a pasta `dist/` com arquivos estáticos válidos.

### Task 2: Tipos e Serviço de Busca de Livros (TDD)
- **Action**: Criar `src/types/index.ts` e `src/services/googleBooks.ts`. Consome a API pública `https://www.googleapis.com/books/v1/volumes?q=...` sem necessidade de proxy de backend, com tratamento de capas e campos nulos.
- **Validate**: `npm test -- src/tests/googleBooks.test.ts` passando com 100% de sucesso.

### Task 3: Serviço do Firebase (Firestore) com Fallback Local (TDD)
- **Action**: Criar `src/services/firebase.ts`. Conecta ao Firestore caso as credenciais estejam presentes no `.env` ou `localStorage`. Caso contrário, armazena no `localStorage` sem quebrar a aplicação, exibindo status amigável de conexão.
- **Validate**: Testes simulando operações de salvar, listar e recuperar resenhas.

### Task 4: Agente de IA para Crítica Literária com Streaming
- **Action**: Implementar `src/services/reviewAgent.ts`. Utiliza a API do Gemini com a chave configurada no ambiente/settings para gerar a resenha crítica estruturada em 5 dimensões com streaming direto no navegador:
  1. *Premissa & Visão Geral*;
  2. *Análise Temática & Subtexto*;
  3. *Estilo Narrativo & Ritmo*;
  4. *Pontos Fortes & Limitações Críticas*;
  5. *Veredito Crítico & Recomendações*.
- **Validate**: `npm test -- src/tests/reviewAgent.test.ts` passando com sucesso.

### Task 5: Componentes de UI (Busca, Card do Livro e Visualizador)
- **Action**: Desenvolver `Navbar.tsx`, `BookSearch.tsx`, `BookCard.tsx`, `ReviewViewer.tsx` e `SettingsModal.tsx` com design moderno, microinterações e acessibilidade.
- **Validate**: Fluxo completo: digitar livro -> selecionar -> acionar agente -> ler resenha em streaming -> copiar texto.

### Task 6: Histórico de Resenhas Salvas no Firebase
- **Action**: Implementar `HistoryList.tsx` para listar todas as resenhas salvas no Firestore, permitindo ao usuário reabrir qualquer resenha anterior instantaneamente.
- **Validate**: Resenha gerada salva no Firestore/Local e acessível na aba de histórico.

### Task 7: Configuração de Deploy para GitHub Pages
- **Action**: Criar `.github/workflows/deploy.yml` com ação oficial de deploy para GitHub Pages, além de script auxiliar `npm run deploy` via `gh-pages`.
- **Validate**: `npm run build` produz bundle estático limpo e testado.

## Validation
```bash
# Checagem de tipagem estrita
npm run typecheck

# Execução da suíte de testes unitários
npm test

# Build de produção estática para GitHub Pages
npm run build

# Execução local em modo dev
npm run dev
```

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| Repositório no GitHub Pages sem credenciais do Firebase configuradas de imediato | Média | Sistema híbrido: se não houver credenciais do Firebase informadas, a app salva no `localStorage` do navegador e permite adicionar a configuração a qualquer momento via modal na UI |
| Chave da API de IA exposta no código cliente | Alta | Nenhuma chave será commitada no repositório. As chaves são lidas de `VITE_*` no build ou inseridas pelo usuário na tela de configurações e armazenadas no `localStorage` local dele |
| Roteamento no GitHub Pages | Baixa | Uso de navegação por abas em SPA ou HashRouter para evitar erros 404 em sub-rotas no GitHub Pages |

## Acceptance
- [ ] A aplicação compila para arquivos estáticos (`dist/`) compatíveis com o GitHub Pages.
- [ ] A busca de livros funciona diretamente no navegador via Google Books API.
- [ ] O Agente de IA gera a resenha estruturada em streaming direto no frontend.
- [ ] As resenhas geradas são persistidas no Firebase (Firestore) com fallback gracioso.
- [ ] Aba de histórico permite rever resenhas salvas anteriormente.
- [ ] Modal de configurações permite inserir/atualizar as credenciais do Firebase e a chave de IA.
- [ ] Todos os testes unitários passam.
