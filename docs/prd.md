# PRD: Clonador de Sites

## 1. Visão do Produto

**Clonador de Sites** é um clonador inteligente de websites. Converte qualquer URL em JSON estruturado (json-render spec), analisa o site com IA e permite gerar uma versão otimizada com melhorias sugeridas. Ferramenta para uso próprio e compartilhamento com clientes. Deploy no Lovable Cloud com remix habilitado.

## 2. Público-Alvo

| Público | Necessidade |
|---------|------------|
| **Desenvolvedores** | Extrair estrutura de sites para projetos, automações, pipelines |
| **Marketing/SEO** | Auditar sites, comparar com concorrentes, identificar melhorias |
| **Donos de negócio vibecoders** | Clonar sites que admiram, pegar estrutura e customizar no Lovable/v0 |

## 3. Requisitos Funcionais

### FR-01: Input de URL
- Campo para colar URL
- Validação de formato
- Botão "Clonar" como CTA principal

### FR-02: Scraping (Firecrawl managed)
- Extração via Firecrawl integrado ao Lovable
- Retorna: título, texto, metadata, headings, links, imagens
- Suporte a SPAs e páginas dinâmicas

### FR-03: Conversão IA → JSON (json-render)
- Conteúdo scrapeado enviado pro LLM
- Output: JSON estruturado seguindo spec json-render
- Catálogo de componentes definido (Section, Heading, Card, List, etc.)

### FR-04: Seleção de Provider IA (cascata)
- Prioridade 1: API key do usuário (OpenAI / Anthropic / Gemini)
- Prioridade 2: Lovable AI built-in (fallback automático em ambiente Lovable)
- Prioridade 3: Aviso pedindo para conectar API key
- BYO key salva em localStorage
- Banner informativo sobre qual provider está ativo

### FR-05: Visualização do JSON
- JSON viewer com syntax highlight
- Tree view colapsável
- Preview visual dos componentes (json-render renderer)

### FR-06: Análise IA do Site
- Análise automática após conversão
- 4 dimensões: Design/UI, SEO, Conteúdo, Estrutura Técnica
- Relatório com: pontos positivos, pontos negativos, sugestões de otimização

### FR-07: Geração de JSON Otimizado
- Botão "Gerar com Sugestões" → IA aplica melhorias ao JSON original
- Resultado: novo JSON com otimizações incorporadas
- Usuário pode baixar/copiar esta versão

### FR-08: Ações sobre Resultado
- Download JSON original (.json)
- Download JSON otimizado (.json)
- Copy to clipboard (ambas versões)

### FR-09: Landing Page
- Hero com input de URL (CTA principal)
- Seção de features
- Design polido, dark mode
- Responsiva

## 4. Requisitos Não-Funcionais

| ID | Requisito | Target |
|----|-----------|--------|
| NFR-01 | Tempo de scraping | < 10s |
| NFR-02 | Tempo de conversão IA | < 15s |
| NFR-03 | Mobile responsive | Sim |
| NFR-04 | Funcionar sem config no remix | Sim (via Lovable AI fallback) |
| NFR-05 | Acessibilidade | WCAG 2.1 AA |

## 5. Constraints

| ID | Constraint |
|----|-----------|
| CON-01 | Stack Lovable-native (React + Vite + Tailwind + Supabase) |
| CON-02 | Deploy no Lovable Cloud com remix habilitado |
| CON-03 | Firecrawl managed by Lovable para scraping |
| CON-04 | Sem monetização — uso próprio + clientes |
| CON-05 | API keys do usuário em localStorage, nunca no servidor |
| CON-06 | Frontend desacoplado do backend (Edge Functions) |

## 6. Epics & Stories

### Epic 1: Setup & Infraestrutura
| Story | Descrição | Pontos |
|-------|-----------|--------|
| 1.1 | Setup projeto React + Vite + Tailwind + shadcn/ui | 2 |
| 1.2 | Configurar Supabase + Edge Functions base | 3 |
| 1.3 | Integrar Firecrawl managed | 2 |
| 1.4 | Setup provider IA com cascata (BYO → Lovable AI → aviso) | 3 |

### Epic 2: Core — Clonagem
| Story | Descrição | Pontos |
|-------|-----------|--------|
| 2.1 | Edge Function /scrape com Firecrawl | 3 |
| 2.2 | Edge Function /convert com prompt json-render | 5 |
| 2.3 | Catálogo de componentes json-render | 3 |

### Epic 3: Core — Análise IA
| Story | Descrição | Pontos |
|-------|-----------|--------|
| 3.1 | Edge Function /analyze (relatório de análise) | 5 |
| 3.2 | Edge Function /optimize (JSON com melhorias) | 5 |

### Epic 4: Frontend — Interface
| Story | Descrição | Pontos |
|-------|-----------|--------|
| 4.1 | Landing page com hero e input de URL | 3 |
| 4.2 | Provider select + BYO key input + banner | 3 |
| 4.3 | JSON viewer com syntax highlight e tree view | 5 |
| 4.4 | Preview visual json-render (component rendering) | 5 |
| 4.5 | Relatório de análise (positivos, negativos, sugestões) | 3 |
| 4.6 | Result actions (download original, gerar otimizado, copy) | 2 |
| 4.7 | Progress stepper (scraping → convertendo → analisando) | 2 |
| 4.8 | Loading states e error handling | 2 |

### Epic 5: Polish & Launch
| Story | Descrição | Pontos |
|-------|-----------|--------|
| 5.1 | Design polish (dark mode, animações, responsivo) | 3 |
| 5.2 | SEO, meta tags, OG image | 2 |
| 5.3 | Error pages e edge cases | 2 |
| 5.4 | Teste end-to-end com URLs variadas | 3 |

## 7. Ordem de Desenvolvimento

```
Epic 1 (Setup) → Epic 2 (Clonagem) → Epic 3 (Análise) → Epic 4 (Frontend) → Epic 5 (Polish)
```

## 8. Fora do Escopo

- Autenticação de usuários
- Histórico de conversões
- API pública
- Webhooks
- Billing / planos pagos

---

**Status:** Validado
**Criado:** 2026-04-05
**Total de pontos:** ~62 pontos
