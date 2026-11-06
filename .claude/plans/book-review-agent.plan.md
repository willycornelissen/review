# Plan: Book Review Agent (AaaS) - GitHub Pages (100% Estático)

**Source PRD**: [.claude/prds/book-review-agent.prd.md](file:///home/willycornelissen/Desktop/Dablio/review/.claude/prds/book-review-agent.prd.md)
**Selected Milestone**: Milestone 1, 2, 3 & 4 (Identificação de Livros, Agente de Resenha com Streaming, Arquitetura Estática sem Banco e Deploy GitHub Pages)
**Complexity**: Medium

## Summary
Construir uma aplicação web Single Page Application (SPA) em **React + TypeScript + Vite + Tailwind CSS**, concebida especificamente para hospedagem estática no **GitHub Pages** sem necessidade de banco de dados ou servidor backend. A aplicação consome Open Library API e Google Books API para busca rápida e identificação resiliente de livros, aciona um Agente de IA especialista em crítica literária para gerar resenhas estruturadas em streaming direto no navegador e permite a cópia integral da resenha com 1 clique para a área de transferência.

## Patterns to Mirror
| Category | Source | Pattern |
|---|---|---|
| Naming | `.agents/rules/common-coding-style.md` | PascalCase para componentes React, camelCase para hooks e serviços, nomes semânticos e declarativos |
| Architecture | GitHub Pages Static SPA | Arquitetura 100% cliente sem servidor próprio nem banco de dados; APIs externas acessadas via CORS com chave protegida no cliente |
| Clipboard & Export | 1-Click Copy | Cópia estruturada do conteúdo em Markdown para a área de transferência do usuário |
| Tests | `.agents/rules/common-testing.md` | Testes unitários com Vitest para o mapeamento de livros, o agente de resenha e os serviços com mocks |

## Files to Change
| File | Action | Why |
|---|---|---|
| `package.json` | CREATE/UPDATE | Dependências SPA: `react`, `react-dom`, `@google/genai`, `lucide-react`, `clsx`, `tailwind-merge`, `vite`, `typescript`, `vitest` |
| `vite.config.ts` | CREATE/UPDATE | Configuração do Vite com base path relativa `./` para funcionamento perfeito no GitHub Pages |
| `tsconfig.json` & `tsconfig.node.json` | CREATE | Tipagem estrita TypeScript |
| `tailwind.config.js` & `postcss.config.js` | CREATE | Sistema de design moderno e responsivo |
| `src/index.css` & `src/main.tsx` | CREATE | Ponto de entrada da aplicação e estilos globais |
| `src/types/index.ts` | CREATE/UPDATE | Interfaces TypeScript: `Book`, `Review`, `ReviewSection` |
| `src/services/bookCatalog.ts` | CREATE/UPDATE | Provedor primário Open Library Search API com fallback para Google Books API e identificação assistida por IA |
| `src/services/reviewAgent.ts` | CREATE/UPDATE | Agente de IA para crítica literária com prompt analítico ancorado em metadados, streaming em tempo real e fallback de modelos |
| `src/components/Navbar.tsx` | CREATE/UPDATE | Barra de navegação com status e modal de configurações de chave de IA |
| `src/components/BookSearch.tsx` | CREATE/UPDATE | Campo de busca ágil com debounce seguro, chips de sugestões rápidas, modo manual e preview |
| `src/components/BookCard.tsx` | CREATE/UPDATE | Card de destaque do livro selecionado com imagem de capa, sinopse, seletor de tom e acionamento do agente |
| `src/components/ReviewViewer.tsx` | CREATE/UPDATE | Visualizador rico da resenha com streaming dinâmico, seções críticas e botão de 1-clique para cópia |
| `src/components/SettingsModal.tsx` | CREATE/UPDATE | Modal para configuração da chave de IA (Gemini) salva em localStorage |
| `src/App.tsx` | CREATE/UPDATE | Orquestração central de estado (livro selecionado, resenha ativa, visualização) |
| `src/tests/googleBooks.test.ts` | CREATE/UPDATE | Testes unitários do catálogo de livros (Open Library + Google Books) |
| `src/tests/reviewAgent.test.ts` | CREATE/UPDATE | Testes unitários do agente e montagem do prompt estruturado |
| `.github/workflows/deploy.yml` | CREATE | GitHub Actions workflow para build e deploy automático no GitHub Pages |

## Tasks

### Task 1: Scaffolding SPA & Configuração para GitHub Pages
- **Action**: Inicializar `package.json`, Vite (com `base: './'`), TypeScript, Tailwind CSS, Vitest e dependências (`@google/genai`, `lucide-react`).
- **Mirror**: Padrão de build estático do Vite para GitHub Pages.
- **Validate**: `npm run build` gera a pasta `dist/` com arquivos estáticos válidos.

### Task 2: Tipos e Serviço de Busca de Livros com Resiliência
- **Action**: Criar `src/types/index.ts` e `src/services/bookCatalog.ts`. Utiliza Open Library Search API como catálogo primário público (imune a rate limits) e Google Books API como fallback, além de modo de entrada manual.
- **Validate**: `npm test -- src/tests/googleBooks.test.ts` passando com 100% de sucesso.

### Task 3: Agente de IA para Crítica Literária com Streaming
- **Action**: Implementar `src/services/reviewAgent.ts`. Utiliza a API do Gemini com a chave configurada no ambiente/settings para gerar a resenha crítica estruturada em 5 dimensões com streaming direto no navegador e cadeia de fallback de modelos (`gemini-3.5-flash-lite`, etc.):
  1. *Premissa & Visão Geral*;
  2. *Análise Temática & Subtexto*;
  3. *Estilo Narrativo & Ritmo*;
  4. *Pontos Fortes & Limitações Críticas*;
  5. *Veredito Crítico & Recomendações*.
- **Validate**: `npm test -- src/tests/reviewAgent.test.ts` passando com sucesso.

### Task 4: Componentes de UI (Busca, Card do Livro e Visualizador)
- **Action**: Desenvolver `Navbar.tsx`, `BookSearch.tsx`, `BookCard.tsx`, `ReviewViewer.tsx` e `SettingsModal.tsx` com design moderno, microinterações, debounce seguro sem travar o teclado e botão de cópia com 1 clique.
- **Validate**: Fluxo completo: digitar livro -> selecionar -> acionar agente -> ler resenha em streaming -> copiar texto.

### Task 5: Zero Banco de Dados e Foco em Exportação
- **Action**: Eliminar camadas de banco e persistência (Firebase), mantendo a arquitetura puramente estática, leve e privada, com transferência via área de transferência.
- **Validate**: Remoção completa de dependências e arquivos de banco sem impactos em compilação ou testes.

### Task 6: Configuração de Deploy para GitHub Pages
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
| Chave da API de IA exposta no código cliente | Alta | Nenhuma chave será commitada no repositório. As chaves são lidas de `VITE_*` no build ou inseridas pelo usuário na tela de configurações e armazenadas no `localStorage` local dele |
| Quota limit em APIs públicas de livros | Baixa | Open Library Search API é utilizada como primária pública aberta, com fallback para Google Books e entrada manual |

## Acceptance
- [x] A aplicação compila para arquivos estáticos (`dist/`) compatíveis com o GitHub Pages.
- [x] A busca de livros funciona diretamente no navegador via Open Library e Google Books.
- [x] O Agente de IA gera a resenha estruturada em streaming direto no frontend.
- [x] Cópia em 1-clique da resenha para a área de transferência funcionando.
- [x] Modal de configurações permite inserir/atualizar a chave da IA (Gemini).
- [x] Todos os testes unitários passam.
