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
- Interface web simples e ágil com campo de busca para identificação rápida do livro em tempo real.
- Integração híbrida de dados: consulta APIs públicas de livros (ex.: Google Books API / Open Library) para obter metadados factuais imediatos (título exato, autor, ano, capa, sinopse oficial).
- Agente de IA especialista em crítica literária que concilia os metadados oficiais com o raciocínio analítico da LLM para gerar a resenha estruturada da obra.
- Resenha estruturada em dimensões fundamentais:
  - Visão Geral & Premissa (ancorada nos metadados da API, sem spoilers desnecessários);
  - Análise Temática & Subtexto;
  - Estilo de Escrita & Ritmo Narrativo;
  - Pontos Fortes e Limitações da Obra;
  - Veredito Crítico e Referências Cruzadas.
- Recurso para copiar a resenha formatada com 1 clique para a área de transferência.

**Out of scope**
- Rede social com feeds públicos, curtidas, seguidores ou comentários — *evitar complexidade no primeiro ciclo*.
- Upload e leitura de arquivos completos (PDF/EPUB) — *foco é na análise sintética e conhecimento do agente*.
- Sistema de cobrança, créditos ou faturamento complexo — *uso pessoal e validação inicial*.
- Geração de resenhas multimídia (áudio, podcast, vídeo ou imagem) — *fora do escopo textual inicial*.

## Delivery Milestones
<!-- Business outcomes, not engineering tasks. /plan turns each into a plan. -->
<!-- Status: pending | in-progress | complete -->

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Identificação Ágil via API Pública | Usuário busca um título/autor, visualiza sugestões com capa e metadados e seleciona a obra | in-progress | [.claude/plans/book-review-agent.plan.md](file:///home/willycornelissen/Desktop/Dablio/review/.claude/plans/book-review-agent.plan.md) |
| 2 | Resenha Híbrida via Agente de IA | Agente sintetiza os metadados da API com o conhecimento da LLM e gera a resenha estruturada | in-progress | [.claude/plans/book-review-agent.plan.md](file:///home/willycornelissen/Desktop/Dablio/review/.claude/plans/book-review-agent.plan.md) |
| 3 | Leitura Fluida e Exportação Rápida | Usuário visualiza a resenha em layout limpo e pode copiar ou salvar para consulta | pending | — |

## Open Questions
- [x] **Abordagem de catálogo**: Resolvido — Arquitetura híbrida conciliando dados factuais de APIs públicas de livros (Google Books / Open Library) com a análise crítica e contextual da LLM.

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Alucinação em livros raros ou muito recentes | Baixa | Médio | Ancorar o prompt do agente com a sinopse oficial e metadados retornados pela API pública |
| Latência elevada na geração de texto longo | Média | Alto | Exibir resposta em streaming na interface web conforme o agente escreve |

---
*Status: DRAFT — requirements only. Implementation planning pending via /plan.*
