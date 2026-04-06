# Fullstack Architecture: Espelha Site

## 1. Visão Geral

```
┌────────────────────────────────────────┐
│         Lovable Cloud                  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  Frontend (React + Vite)         │  │
│  │  shadcn/ui + Tailwind CSS        │  │
│  └──────────┬───────────────────────┘  │
│             │                          │
│  ┌──────────▼───────────────────────┐  │
│  │  Supabase Edge Functions (Deno)  │  │
│  │  /convert  /analyze  /optimize   │  │
│  └──────┬──────────┬────────────────┘  │
│         │          │                   │
│  ┌──────▼───┐  ┌───▼──────────────┐   │
│  │Firecrawl │  │ LLM Provider     │   │
│  │(managed) │  │ (cascata)        │   │
│  └──────────┘  └──────────────────┘   │
└────────────────────────────────────────┘
```

## 2. Stack Definitiva

| Camada | Tecnologia | Razão |
|--------|-----------|-------|
| **Runtime** | React + Vite + TypeScript | Stack nativo Lovable, remix-friendly |
| **UI** | shadcn/ui + Tailwind CSS | Nativo Lovable, componentes customizáveis |
| **Backend** | Supabase Edge Functions (Deno) | Serverless integrado ao Lovable Cloud |
| **Scraping** | Firecrawl (managed by Lovable) | Zero config, integrado nativamente |
| **IA** | Cascata: BYO Key → Lovable AI | Prioridade pra API key do user, fallback pra built-in |
| **Output Spec** | json-render (Vercel Labs) | Catálogo de componentes no frontend |
| **Database** | Supabase PostgreSQL (futuro) | Disponível se precisar de histórico |
| **Deploy** | Lovable Cloud | Remix habilitado |
| **Repo** | GitHub (henriquegabriel-ia/espelha-site) | Lovable sincroniza com GitHub |

## 3. Cascata de IA — Prioridade de Providers

```
1. API key do usuário (OpenAI / Anthropic / Gemini)  → PRIORIDADE MÁXIMA
   └── User configura via UI, salva em localStorage
   └── Enviada no header do request pra Edge Function

2. Lovable AI built-in                               → FALLBACK AUTOMÁTICO
   └── Detecta ambiente Lovable automaticamente
   └── Funciona sem config — ideal pra remix

3. Nenhum disponível                                  → AVISO
   └── Banner: "Conecte uma API key (OpenAI, Anthropic ou Gemini)
       para melhor qualidade, ou use a IA integrada do Lovable"
```

### Detecção de ambiente Lovable
```typescript
const isLovableEnv = () => {
  // Lovable Cloud injeta variáveis específicas
  return !!import.meta.env.VITE_LOVABLE_AI_AVAILABLE
    || window.location.hostname.includes('lovable');
};
```

### Provider Selection (Edge Function)
```typescript
function resolveProvider(headers: Headers) {
  const userKey = headers.get('x-api-key');
  const provider = headers.get('x-provider'); // "openai" | "anthropic" | "gemini"

  if (userKey && provider) {
    return { type: 'byo', provider, key: userKey };
  }

  if (Deno.env.get('LOVABLE_AI_ENABLED')) {
    return { type: 'lovable-ai' };
  }

  return { type: 'none' };
}
```

## 4. Estrutura do Projeto

```
espelha-site/
├── src/
│   ├── App.tsx                    # Router principal
│   ├── main.tsx                   # Entry point
│   ├── components/
│   │   ├── ui/                    # shadcn/ui (Button, Card, Input, Tabs, etc.)
│   │   ├── url-input.tsx          # Input de URL + botão "Espelhar"
│   │   ├── provider-select.tsx    # Seleção de provider IA + BYO key
│   │   ├── json-viewer.tsx        # JSON com syntax highlight + tree view
│   │   ├── json-render-preview.tsx # Preview visual dos componentes
│   │   ├── analysis-report.tsx    # Relatório IA (positivos, negativos, sugestões)
│   │   ├── result-actions.tsx     # Download Original / Gerar com Sugestões / Copy
│   │   ├── progress-stepper.tsx   # Steps de loading (scraping → convertendo → analisando)
│   │   ├── ai-provider-banner.tsx # Aviso sobre API key / Lovable AI
│   │   ├── header.tsx
│   │   └── footer.tsx
│   ├── hooks/
│   │   ├── use-espelhar.ts        # Orchestrator hook (scrape → convert → analyze)
│   │   └── use-provider.ts        # Gerencia provider IA selecionado + localStorage
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client
│   │   ├── json-render-catalog.ts # Catálogo de componentes json-render
│   │   └── utils.ts
│   └── types/
│       ├── espelhar.ts            # Types do fluxo (ScrapedPage, JsonRenderOutput, Analysis)
│       └── provider.ts            # Types de provider IA
├── supabase/
│   └── functions/
│       ├── scrape/index.ts        # Chama Firecrawl managed → retorna conteúdo
│       ├── convert/index.ts       # LLM: conteúdo → JSON (json-render spec)
│       ├── analyze/index.ts       # LLM: JSON → relatório de análise
│       └── optimize/index.ts      # LLM: JSON + sugestões → JSON otimizado
├── public/
│   └── og.png
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 5. Fluxo Principal

```
1. User cola URL → clica "Espelhar"
   └── Validação client-side (formato URL)

2. Frontend chama Edge Function /scrape
   └── Edge Function usa Firecrawl (managed by Lovable)
   └── Retorna: título, texto, metadata, headings, links, imagens

3. Frontend chama Edge Function /convert
   └── Resolve provider (BYO key → Lovable AI → erro)
   └── Prompt: system prompt (json-render spec + catálogo) + conteúdo scrapeado
   └── Retorna: JSON estruturado (json-render spec)

4. Frontend mostra JSON original + preview visual

5. Frontend chama Edge Function /analyze
   └── Prompt: JSON original + instruções de análise (design, SEO, conteúdo, estrutura)
   └── Retorna: relatório com positivos, negativos, sugestões

6. Frontend mostra relatório de análise

7. User escolhe:
   ├── [⬇ Download Original] → baixa JSON tal como está
   └── [🤖 Gerar com Sugestões] → chama Edge Function /optimize
       └── Prompt: JSON original + lista de sugestões aceitas
       └── Retorna: JSON otimizado
       └── User baixa/copia versão otimizada
```

## 6. Edge Functions — Detalhamento

### /scrape
```typescript
// supabase/functions/scrape/index.ts
// Input:  { url: string }
// Output: { title, text, metadata, headings, links, images }
// Usa: Firecrawl managed (SDK ou REST API integrado ao Lovable)
```

### /convert
```typescript
// supabase/functions/convert/index.ts
// Input:  { scrapedData: ScrapedPage, provider?: string, apiKey?: string }
// Output: { root, elements, metadata } (json-render spec)
// Usa: LLM com structured output
// Prompt: define catálogo de componentes permitidos + regras json-render
```

### /analyze
```typescript
// supabase/functions/analyze/index.ts
// Input:  { jsonRender: JsonRenderOutput, originalUrl: string }
// Output: { positives: string[], negatives: string[], suggestions: Suggestion[] }
// Usa: LLM
// Analisa: design/UI, SEO, conteúdo, estrutura técnica
```

### /optimize
```typescript
// supabase/functions/optimize/index.ts
// Input:  { jsonRender: JsonRenderOutput, suggestions: Suggestion[] }
// Output: { root, elements, metadata } (json-render spec otimizado)
// Usa: LLM
// Aplica sugestões selecionadas ao JSON original
```

## 7. json-render — Catálogo de Componentes

```typescript
// src/lib/json-render-catalog.ts
// Componentes que a IA pode gerar no output:

const catalog = {
  Section:   { props: { title?: string, id?: string } },
  Heading:   { props: { level: 1|2|3|4|5|6, text: string } },
  Paragraph: { props: { text: string } },
  Image:     { props: { src: string, alt: string, width?: number } },
  Link:      { props: { href: string, text: string, external?: boolean } },
  Card:      { props: { title: string, description: string, image?: string } },
  List:      { props: { items: string[], ordered: boolean } },
  Table:     { props: { headers: string[], rows: string[][] } },
  Badge:     { props: { text: string, variant?: string } },
  Button:    { props: { text: string, href?: string, variant?: string } },
  Hero:      { props: { title: string, subtitle?: string, cta?: string } },
  Nav:       { props: { items: { text: string, href: string }[] } },
  Footer:    { props: { text: string, links?: { text: string, href: string }[] } },
};
```

## 8. Gestão de Secrets

| Secret | Onde | Injetado em |
|--------|------|-------------|
| `FIRECRAWL_API_KEY` | Lovable Cloud → Secrets (ou managed) | Edge Function /scrape |
| `OPENAI_API_KEY` (default) | Lovable Cloud → Secrets | Edge Functions /convert, /analyze, /optimize |
| BYO keys do usuário | localStorage (client) | Header `x-api-key` nos requests |

## 9. Security

| Concern | Mitigation |
|---------|-----------|
| BYO key exposure | Client-side only (localStorage), enviada por HTTPS no header |
| SSRF via scraping | Firecrawl managed lida com isso |
| XSS via conteúdo scrapeado | Sanitizar tudo que é renderizado no preview |
| Prompt injection | Conteúdo scrapeado isolado na user message, não no system prompt |
| Edge Function abuse | Rate limit nativo do Supabase |

## 10. Performance

| Etapa | Target | Estratégia |
|-------|--------|-----------|
| Scraping (Firecrawl) | < 10s | Firecrawl otimiza internamente |
| Conversão (LLM) | < 15s | Modelos rápidos (gpt-4o-mini, haiku, gemini-flash) |
| Análise (LLM) | < 15s | Prompt focado, sem streaming necessário |
| Otimização (LLM) | < 15s | Usa JSON original como base (menos geração) |
| UI initial load | < 2s | Vite build otimizado, lazy load do viewer |

## 11. Remix Experience

Quando alguém faz remix no Lovable:
1. **Copia:** frontend + edge functions + estrutura completa
2. **Firecrawl managed:** funciona automaticamente
3. **Lovable AI:** funciona como fallback sem config
4. **Personalizável:** user pode trocar design, adicionar features, conectar API key própria

**Resultado: remix → funciona de cara, zero config.**

## 12. Dependências

```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "react-router-dom": "^6",
    "@json-render/core": "latest",
    "@json-render/react": "latest",
    "@supabase/supabase-js": "^2",
    "zod": "^3",
    "tailwindcss": "^4",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "lucide-react": "latest"
  }
}
```

## 13. Futuro (pós-MVP)

- Histórico de conversões (Supabase PostgreSQL)
- Comparação lado a lado (original vs otimizado)
- API pública
- Templates de extração por tipo de site
- Auth (se necessário para histórico)

---

**Status:** Validado
**Criado:** 2026-04-05
**Autor:** Aria (Architect) + Atlas (Analyst) + Henrique Gabriel
