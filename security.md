# Diretrizes de Segurança e Publicação Web (security.md)

Este documento descreve a arquitetura de segurança, o gerenciamento de credenciais da API do Google Gemini e as recomendações para publicação web do **Agente de Resenhas**.

---

## 1. Arquitetura de Credenciais & Modelo BYOK

O projeto foi projetado como uma **Single Page Application (SPA)** 100% estática, operando sob o modelo **BYOK (*Bring Your Own Key* — Traga sua própria chave)**.

### Como funciona:
* **Armazenamento no Cliente:** A chave fornecida pelo usuário através do modal de configurações é gravada exclusivamente no `localStorage` do navegador daquele visitante.
* **Comunicação Direta:** As chamadas de inferência e streaming são realizadas diretamente do navegador do usuário para os endpoints da API do Google Gemini (`https://generativelanguage.googleapis.com/...`).
* **Zero Servidor Intermediário:** Não há banco de dados nem servidores proprietários interceptando ou gravando chaves de API.

---

## 2. O que funciona com e sem chave?

| Recurso | Requer Chave Gemini? | Detalhes |
| :--- | :---: | :--- |
| **Busca de Livros** | ❌ Não | Utiliza acervos públicos (Open Library e Google Books) sem necessidade de credenciais. |
| **Visualização de Detalhes** | ❌ Não | Capas, sinopses, autores e metadados são carregados livremente. |
| **Geração de Resenhas com IA** | ✅ **Sim** | Exige a chave para autenticar na API do Google Gemini. Se não houver chave salva, a aplicação solicita a inclusão via modal. |

---

## 3. Alerta Crítico: Uso de `VITE_GEMINI_API_KEY`

O código-fonte possui suporte de fallback para a variável de ambiente:
```ts
import.meta.env.VITE_GEMINI_API_KEY
```

> [!CAUTION]
> **NUNCA configure sua chave pessoal como variável de build (`VITE_GEMINI_API_KEY`) para deploys públicos estáticos.**
>
> Como este projeto é uma aplicação puramente frontend (*client-side*), qualquer variável iniciada por `VITE_` é injetada em **texto puro** dentro dos arquivos JavaScript compilados (`dist/assets/*.js`).
> 
> Se você compilar o projeto com sua chave embutida:
> 1. Qualquer visitante poderá visualizá-la inspecionando o código ou a aba *Network (Rede)* do navegador.
> 2. Sua cota da API poderá ser esgotada ou você poderá incorrer em custos indevidos.
> 3. Motores de busca e scanners de segurança automáticos podem detectar o vazamento e revogar a chave.

---

## 4. Estratégias para Publicação na Web

### Cenário A: Publicação Estática com BYOK (Recomendado)
* **Como opera:** O site é hospedado em provedores estáticos gratuitos (GitHub Pages, Vercel, Netlify, Cloudflare Pages). Cada usuário insere sua própria chave gratuita obtida no [Google AI Studio](https://aistudio.google.com/app/apikey).
* **Vantagens:** Custo zero de infraestrutura, risco zero de vazamento de credenciais pessoais e sem responsabilidade pelo consumo de cota de terceiros.
* **Deploy pronto:** O repositório já conta com o workflow do GitHub Actions em [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### Cenário B: Fornecer a IA sem pedir chave ao usuário (Exige Backend)
Se o objetivo for disponibilizar o serviço onde o visitante não precise inserir chave alguma:
* **Não utilize variáveis de ambiente no frontend.**
* **Implemente uma camada de backend/proxy segura:**
  1. Crie uma função serverless (ex.: Vercel Serverless Function, Netlify Function ou Cloudflare Worker).
  2. Mantenha a chave da API como segredo de ambiente restrito ao servidor (`GEMINI_API_KEY`, sem o prefixo `VITE_`).
  3. Adicione mecanismos de proteção contra abuso (ex.: *Rate Limiting*, CORS restrito, autenticação ou CAPTCHA).

---

## 5. Boas Práticas para Usuários da Aplicação

1. **Obtenção de Chave:** Obtenha uma chave de desenvolvimento gratuita diretamente no [Google AI Studio](https://aistudio.google.com/app/apikey).
2. **Restrições de Chave:** No Google Cloud Console, configure restrições de IP/referenciador HTTP ou limites diários de requisição.
3. **Limpeza de Dados:** Para remover sua chave da aplicação a qualquer momento, abra o modal de configurações ("Chave Gemini") e selecione a opção de exclusão do `localStorage`.
