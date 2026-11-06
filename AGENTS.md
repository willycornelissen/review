# Diretrizes Agênticas do Repositório (AGENTS.md)

Este repositório opera sob a esteira de engenharia de software governada pelo **ECC (*Everything Claude Code*)**.

---

## 🧭 Princípios de Operação

1. **Janela de Contexto Saudável**:
   - Manter respostas e investigações focadas e cirúrgicas.
   - Utilizar subagentes para tarefas pontuais (revisão de código, resolução de erros de build, pesquisa profunda).
2. **Qualidade e Verificação Contínua**:
   - Nenhuma funcionalidade é considerada concluída sem testes e verificação mecânica.
   - Consultar as regras em [`.agents/rules/`](file:///home/willycornelissen/Desktop/Dablio/review/.agents/rules) antes de introduzir padrões ou alterações estruturais.
3. **Respeito aos Guardrails**:
   - Sempre executar comandos com menor privilégio necessário e verificar diffs antes de alterações destrutivas.
