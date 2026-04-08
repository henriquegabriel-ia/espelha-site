# Front-End Specification: Clonador de Sites

## 1. Design System

### Tema
- **Estilo:** Dark mode default, toggle para light
- **Referência:** Melhor que site-to-json.trapiche.cloud — clean, polido, profissional
- **Palette:**
  - Background: `#09090b` (zinc-950)
  - Surface: `#18181b` (zinc-900)
  - Border: `#27272a` (zinc-800)
  - Primary: `#3b82f6` (blue-500)
  - Accent: `#22c55e` (green-500) — sucesso/JSON
  - Text: `#fafafa` (zinc-50)
  - Muted: `#a1a1aa` (zinc-400)

### Typography
- **Body:** Inter
- **Code/JSON:** JetBrains Mono
- **Sizes:** text-sm (14px) base, text-lg+ headings

### Components (shadcn/ui)
- Button, Input, Card, Badge, Tabs, Select, Textarea
- Tooltip, Sheet (mobile), Skeleton (loading)
- Alert (banner de provider IA)

## 2. Layout

```
┌─────────────────────────────────────┐
│ Header: Logo + Theme Toggle         │
├─────────────────────────────────────┤
│                                     │
│           Page Content              │
│                                     │
├─────────────────────────────────────┤
│ Footer: GitHub + Créditos           │
└─────────────────────────────────────┘
```

### Single Page — Home/Converter (rota: `/`)

**Seção 1: Hero + Input**
```
┌─────────────────────────────────────┐
│                                     │
│     🔗 Clonador de Sites           │
│     Clone qualquer site.            │
│     Analise. Otimize. Copie.        │
│                                     │
│  ┌─────────────────────────┐ ┌────┐ │
│  │ https://example.com     │ │ ▶  │ │
│  └─────────────────────────┘ └────┘ │
│                                     │
│  Provider: [OpenAI ▼] [🔑 API Key] │
│  ℹ️ Usando Lovable AI (fallback)    │
│                                     │
└─────────────────────────────────────┘
```

**Seção 2: Resultado (após clonar)**
```
┌─────────────────────────────────────┐
│ Tabs: [JSON] [Tree] [Preview]       │
├─────────────────────────────────────┤
│  {                                  │
│    "root": "section-1",             │
│    "elements": { ... }              │
│  }                                  │
├─────────────────────────────────────┤
│ [⬇ Download Original] [📋 Copiar]  │
└─────────────────────────────────────┘
```

**Seção 3: Análise IA**
```
┌─────────────────────────────────────┐
│ 📊 Análise do Site                  │
├─────────────────────────────────────┤
│ ✅ Positivos:                       │
│   • Hierarquia de headings correta  │
│   • Boa estrutura semântica         │
│                                     │
│ ⚠️ Negativos:                       │
│   • Falta meta description          │
│   • Contraste insuficiente no CTA   │
│                                     │
│ 💡 Sugestões:                       │
│   • Adicionar structured data       │
│   • Melhorar hierarchy visual       │
├─────────────────────────────────────┤
│ [🤖 Gerar JSON com Sugestões]       │
└─────────────────────────────────────┘
```

**Seção 4: JSON Otimizado (após gerar)**
```
┌─────────────────────────────────────┐
│ ✨ JSON Otimizado                   │
├─────────────────────────────────────┤
│  { "root": "section-1", ... }       │
├─────────────────────────────────────┤
│ [⬇ Download Otimizado] [📋 Copiar] │
└─────────────────────────────────────┘
```

**Seção 5: Features (abaixo do hero quando idle)**
```
┌───────┐ ┌───────┐ ┌───────┐
│  🔗   │ │  🤖   │ │  ✨   │
│Clona  │ │Analisa│ │Otimiza│
└───────┘ └───────┘ └───────┘
```

## 3. Componentes Principais

### `<UrlInput />`
- Input com validação de URL
- Botão "Clonar" com loading state
- Estado: idle → loading → success/error

### `<ProviderSelect />`
- Select: OpenAI / Anthropic / Gemini
- Input de API key (type password, toggle visibility)
- Salva em localStorage
- Clear button

### `<AiProviderBanner />`
- Mostra qual provider está ativo
- Se BYO key: "Usando OpenAI (sua API key)"
- Se Lovable AI: "Usando Lovable AI (conecte uma API key para mais controle)"
- Se nenhum: "Conecte uma API key para começar"

### `<JsonViewer />`
- Syntax highlight (JSON)
- Collapsible tree view
- Line numbers
- Search

### `<JsonRenderPreview />`
- Renderiza json-render spec como componentes visuais
- Usa @json-render/react + Renderer
- Mostra como o site ficaria

### `<AnalysisReport />`
- Três seções: Positivos (✅), Negativos (⚠️), Sugestões (💡)
- Cards com ícones
- Categorias: Design, SEO, Conteúdo, Estrutura

### `<ResultActions />`
- Download Original (.json)
- Download Otimizado (.json) — aparece após gerar
- Copy to clipboard (com feedback visual ✓)

### `<ProgressStepper />`
- Steps: Scraping... → Convertendo... → Analisando...
- Indicador visual de progresso por etapa

## 4. Estados da Aplicação

```
IDLE
  └── User cola URL e clica "Clonar"
SCRAPING
  └── Firecrawl extraindo conteúdo
CONVERTING
  └── IA gerando JSON (json-render)
ANALYZING
  └── IA analisando o site
SUCCESS
  ├── JSON original disponível
  ├── Relatório de análise disponível
  └── Botão "Gerar com Sugestões" habilitado
OPTIMIZING
  └── IA gerando JSON otimizado
COMPLETE
  ├── JSON original disponível
  ├── JSON otimizado disponível
  └── Relatório disponível
ERROR
  └── Toast com mensagem + opção retry
```

## 5. Responsividade

| Breakpoint | Layout |
|-----------|--------|
| Mobile (<640px) | Stack vertical, full-width, tabs empilhados |
| Tablet (640-1024px) | Input centralizado, resultado abaixo |
| Desktop (>1024px) | Layout amplo, seções com max-width |

## 6. Animações

- Input focus: border glow
- Submit: button pulse
- Steps: fade transition entre estados
- JSON: fade-in quando carrega
- Copy: checkmark → volta ao ícone original
- Tabs: slide transition

## 7. Acessibilidade

- Todos os inputs com labels e aria-*
- Keyboard navigation completa
- JSON viewer com role="code"
- Contrast ratio > 4.5:1
- Focus visible

---

**Status:** Validado
**Criado:** 2026-04-05
