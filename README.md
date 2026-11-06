# Review

Repositório preparado e estruturado seguindo os padrões de engenharia agêntica do **ECC (*Everything Claude Code*)**.

---

## 📁 Estrutura do Repositório

```text
review/
├── .agents/                    # Catálogo de agentes, regras, workflows e skills do ECC
│   ├── agents/                 # Subagentes especializados (arquitetura, code review, etc.)
│   ├── rules/                  # Diretrizes e boas práticas técnicas
│   ├── skills/                 # Habilidades e ferramentas agênticas
│   ├── workflows/              # Fluxos de trabalho orquestrados (ex: /plan, /plan-prd)
│   └── ecc-install-state.json  # Manifesto de instalação e governança do ECC
├── .gitignore                  # Regras de exclusão Git padronizadas
├── AGENTS.md                   # Orientações operacionais para agentes de IA no repositório
└── README.md                   # Este documento
```

---

## 🚀 Status e Próximos Passos

- [x] **Fase 0: Onboarding & Setup**
  - Repositório Git inicializado na branch `main`.
  - ECC Universal integrado com catálogo de agentes, regras e workflows.
  - Template base configurado.
- [ ] **Fase 1: Concepção & Discovery (PRD Lean)**
  - Definir proposta de valor, público-alvo e problema a resolver (`/plan-prd`).
- [ ] **Fase 2: Arquitetura & Stack**
  - Definição formal de tecnologias, contratos e modelagem.
