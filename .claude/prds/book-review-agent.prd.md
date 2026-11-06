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
- Interface web simples e ágil com campo de busca para identificação rápida do livro (título, autor e metadados visuais).
- Agente de IA especialista em crítica literária acionado sob demanda para gerar a resenha analítica da obra selecionada.
- Resenha estruturada em dimensões fundamentais:
  - Visão Geral & Premissa (sem spoilers desnecessários);
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
| 1 | Identificação Ágil de Livros na Web | Usuário busca um título/autor e seleciona o livro com metadados confirmados | pending | — |
| 2 | Geração da Resenha Crítica Estruturada | Usuário solicita a resenha e recebe o texto analítico gerado pelo agente | pending | — |
| 3 | Leitura Fluida e Exportação Rápida | Usuário visualiza a resenha em layout limpo e pode copiar ou salvar para consulta | pending | — |

## Open Questions
- [ ] Qual fonte/API de catálogo (Google Books API, Open Library ou extração do LLM) oferece a melhor combinação de latência e precisão em português?

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Alucinação em livros raros ou muito recentes | Média | Médio | Alimentar o agente com sinopse e metadados oficiais retornados pela busca |
| Latência elevada na geração de texto longo | Média | Alto | Exibir resposta em streaming na interface web conforme o agente escreve |

---
*Status: DRAFT — requirements only. Implementation planning pending via /plan.*
