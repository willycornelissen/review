# Book Review Agent (AaaS)

## Problem
Quem escreve resenhas literárias frequentemente precisa de uma perspectiva crítica prévia, aprofundada e consistente para consultar e enriquecer suas próprias resenhas. Sem uma solução dedicada, o autor depende de prompts genéricos improvisados em LLMs convencionais ou pesquisas manuais dispersas, o que consome tempo e entrega análises rasas sem rigor literário ou estrutura padronizada.

## Evidence
- Observação empírica direta do próprio usuário/desenvolvedor em sua rotina de leitura e produção de resenhas (*dogfooding*).
- Ausência no mercado de soluções dedicadas de Agent-as-a-Service (AaaS) focadas em análise literária crítica estruturada sob demanda.

## Users
- **Primary**: Escritores, criadores de resenhas literárias e leitores analíticos que buscam embasamento crítico rápido e estruturado para consulta prévia à sua própria escrita.
- **Not for**: Usuários casuais buscando apenas algoritmos de recomendação estilo feed social, ou usuários buscando download de e-books e PDFs.

## Hypothesis
Acreditamos que disponibilizar uma aplicação web simples com um agente de IA especialista em crítica literária permitirá a identificação ágil de livros e gerará resenhas analíticas ricas.
Saberemos que tivemos sucesso quando as resenhas geradas servirem concretamente como referência para a produção e consulta do usuário, com tempo de busca e resposta inferior a 30 segundos.

## Success Metrics
| Metric | Target | How measured |
|---|---|---|
| Acurácia na identificação do livro | > 95% para obras comerciais/conhecidas | Teste de busca com títulos comuns |
| Tempo total de resposta (busca + resenha) | < 30s | Medição de latência ponta a ponta |
| Estruturação completa da resenha | 100% de conformidade com seções analíticas | Inspeção das dimensões temáticas geradas |
| Utilidade percebida pelo revisor | Resenha utilizada como insumo efetivo | Validação de uso contínuo (*dogfooding*) |

## Scope
**MVP**
- Interface web Single Page Application (SPA) responsiva e estática, compatível com deploy no **GitHub Pages**.
- Integração híbrida de dados: consulta APIs públicas de livros (Open Library Search API como primária e Google Books API como fallback) diretamente do cliente para obter metadados factuais imediatos (título exato, autor, ano, capa, sinopse oficial).
- Agente de IA especialista em crítica literária rodando no cliente via SDK oficial de IA com streaming em tempo real, ancorando-se nos metadados da obra.
- Zero dependência de banco de dados: geração sob demanda sem complexidade de persistência remota.
- Resenha estruturada em dimensões fundamentais:
  - Visão Geral & Premissa (ancorada nos metadados da API, sem spoilers desnecessários);
  - Análise Temática & Subtexto;
  - Estilo de Escrita & Ritmo Narrativo;
  - Pontos Fortes e Limitações da Obra;
  - Veredito Crítico e Recomendações.
- Recurso para copiar a resenha formatada em Markdown com 1 clique para a área de transferência.

**Out of scope**
- Banco de dados remoto ou persistência em servidor — *dispensado pelo usuário em favor de cópia direta via clipboard*.
- Rede social com feeds públicos, curtidas, seguidores ou comentários — *evitar complexidade*.
- Upload e leitura de arquivos completos (PDF/EPUB) — *foco é na análise sintética e conhecimento do agente*.
- Sistema de cobrança, créditos ou faturamento complexo — *uso pessoal e validação ágil*.
- Servidor de backend tradicional em Node/Python — *substituído por arquitetura 100% estática cliente no GitHub Pages*.
- Geração de resenhas multimídia (áudio, podcast, vídeo ou imagem) — *fora do escopo textual inicial*.

## Delivery Milestones
<!-- Business outcomes, not engineering tasks. /plan turns each into a plan. -->
<!-- Status: pending | in-progress | complete -->

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Identificação Ágil via API Pública | Usuário busca um título/autor, visualiza sugestões com capa e metadados e seleciona a obra | complete | [.claude/plans/book-review-agent.plan.md](file:///home/willycornelissen/Desktop/Dablio/review/.claude/plans/book-review-agent.plan.md) |
| 2 | Resenha Híbrida via Agente de IA | Agente sintetiza os metadados da API com o conhecimento da LLM e gera a resenha estruturada | complete | [.claude/plans/book-review-agent.plan.md](file:///home/willycornelissen/Desktop/Dablio/review/.claude/plans/book-review-agent.plan.md) |
| 3 | Arquitetura Estática & Cópia Rápida | Operação 100% no cliente sem banco, com botão de cópia formatada em 1 clique | complete | [.claude/plans/book-review-agent.plan.md](file:///home/willycornelissen/Desktop/Dablio/review/.claude/plans/book-review-agent.plan.md) |
| 4 | Deploy Estático no GitHub Pages | Aplicação empacotada e publicada via workflow de GitHub Pages | complete | [.claude/plans/book-review-agent.plan.md](file:///home/willycornelissen/Desktop/Dablio/review/.claude/plans/book-review-agent.plan.md) |

## Open Questions
- [x] **Abordagem de catálogo**: Resolvido — Arquitetura híbrida conciliando dados factuais de APIs públicas de livros (Google Books / Open Library) com a análise crítica e contextual da LLM.

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Alucinação em livros raros ou muito recentes | Baixa | Médio | Ancorar o prompt do agente com a sinopse oficial e metadados retornados pela API pública |
| Latência elevada na geração de texto longo | Média | Alto | Exibir resposta em streaming na interface web conforme o agente escreve |

---
*Status: DRAFT — requirements only. Implementation planning pending via /plan.*
