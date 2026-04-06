# Project Brief: Espelha Site

## Visão Geral

**Espelha Site** é um espelho inteligente de websites. O usuário cola uma URL, o sistema scrapa a página, converte em JSON estruturado (spec json-render) e a IA analisa o site gerando um relatório com pontos positivos, negativos e sugestões de otimização. O usuário pode baixar o JSON original ou gerar uma versão otimizada com as sugestões da IA aplicadas.

## Problema

- Extrair a estrutura e componentes de um site é trabalhoso e requer scraping customizado
- Não existe ferramenta que além de extrair, analise e sugira melhorias
- Donos de negócio e vibecoders querem se inspirar em sites existentes mas não têm como "desconstruir" a estrutura facilmente
- Profissionais de SEO/marketing precisam auditar sites mas ferramentas existentes são fragmentadas

## Solução

Uma ferramenta web que:
1. Recebe qualquer URL como input
2. Faz scraping inteligente da página
3. Usa IA para estruturar o conteúdo em JSON (spec json-render)
4. Analisa o site com IA (design, SEO, conteúdo, estrutura técnica)
5. Gera relatório com positivos, negativos e sugestões
6. Permite baixar JSON original OU gerar versão com melhorias aplicadas

## Público-Alvo

| Público | Necessidade |
|---------|------------|
| **Desenvolvedores** | Extrair estrutura de sites para projetos, automações, pipelines |
| **Marketing/SEO** | Auditar sites, comparar com concorrentes, identificar melhorias |
| **Donos de negócio vibecoders** | Espelhar sites que admiram, pegar estrutura e customizar no Lovable/v0 |

## Referência de Mercado

- [site-to-json.trapiche.cloud](https://site-to-json.trapiche.cloud/pt) — produto do @acfilho_dev, usa OpenAI + json-render. Só converte, não analisa.
- [Firecrawl](https://firecrawl.dev) — scraping API com LLM extraction
- [ScrapeNinja + n8n](https://n8n.io) — workflow de scraping com IA

## Diferenciais

| Diferencial | Descrição |
|-------------|-----------|
| **Análise IA do site** | Relatório com positivos, negativos e sugestões (design, SEO, conteúdo, estrutura) |
| **JSON otimizado** | IA gera versão do JSON com melhorias sugeridas aplicadas |
| **Dual output** | Usuário escolhe: original fiel ou versão otimizada |
| **Lovable-ready** | Projeto remixável no Lovable Cloud — qualquer pessoa faz fork e customiza |
| **json-render nativo** | Output compatível com spec do Vercel Labs |
| **Design superior** | UI polida, melhor que a referência |

## Fluxo do Usuário

```
1. Cola URL → clica "Espelhar"
2. Sistema scrapa e converte → mostra JSON original + preview
3. IA analisa → mostra relatório (positivos, negativos, sugestões)
4. Usuário escolhe:
   ├── [⬇ Download Original] → baixa JSON tal como é
   └── [🤖 Gerar com Sugestões] → IA gera novo JSON com melhorias aplicadas
5. Usuário baixa/copia a versão que preferir
```

## Constraints

| ID | Constraint |
|----|-----------|
| CON-01 | **Lovable-native** — stack deve ser compatível com Lovable Cloud (React + Tailwind + Supabase) |
| CON-02 | **Deploy no Lovable Cloud** com remix habilitado |
| CON-03 | **Frontend desacoplado do backend** — UI é client que consome API |
| CON-04 | **Sem monetização** — ferramenta para uso próprio e compartilhamento com clientes |
| CON-05 | **BYO Key** — usuário pode trazer sua própria API key de IA |
| CON-06 | API keys do usuário nunca armazenadas no servidor |

## Stack (a ser definida pelo @architect)

Constraints de stack:
- Frontend: React + Tailwind (compatível Lovable)
- UI Components: shadcn/ui (compatível Lovable)
- Database: Supabase (provisionado pelo Lovable no remix)
- Deploy: Lovable Cloud
- IA: A definir (precisa funcionar com Supabase Edge Functions ou API externa)
- Scraping: A definir (Lovable tem limitações de runtime)

> **NOTA:** Stack técnica será definida pelo @architect considerando os constraints acima.

## Escopo MVP (tudo de uma vez)

### IN
- Landing page com input de URL
- Conversão URL → JSON estruturado (json-render spec)
- Visualização do JSON com syntax highlight
- Análise IA do site (design, SEO, conteúdo, estrutura técnica)
- Relatório com positivos, negativos e sugestões
- Botão "Download Original" (JSON fiel ao site)
- Botão "Gerar com Sugestões" (JSON otimizado pela IA)
- Copy to clipboard
- Seleção de provider IA
- Opção BYO Key
- Design polido e responsivo

### OUT
- Autenticação de usuários
- Histórico de conversões
- API pública
- Webhooks

## Análise IA — O que avaliar

| Dimensão | Exemplos |
|----------|---------|
| **Design/UI** | Cores, espaçamento, hierarquia visual, acessibilidade, consistência |
| **SEO** | Meta tags, headings, structured data, performance, core web vitals |
| **Conteúdo** | Clareza dos textos, CTAs, copywriting, tom de voz |
| **Estrutura Técnica** | Semântica HTML, componentes, responsividade, boas práticas |

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Lovable não suporta scraping server-side | API de scraping externa (Firecrawl, ou Supabase Edge Function) |
| Sites com anti-bot bloqueiam | Usar API de scraping com fingerprint rotation |
| Custo de IA pode escalar | BYO key + rate limiting |
| json-render spec pode mudar | Abstrair camada de output |
| Limitações do Lovable Cloud | Desacoplar lógica pesada em API externa se necessário |

---

**Status:** Validado com usuário
**Criado:** 2026-04-05
**Validado:** 2026-04-05
**Autor:** Atlas (Analyst) + Henrique Gabriel
