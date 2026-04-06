# Story 2.3: Catalogo de componentes json-render

## Status: Draft

## Descricao
Definir o catalogo completo de componentes permitidos para o json-render em `src/lib/json-render-catalog.ts`. Cada componente deve ter suas props tipadas com Zod schemas, permitindo tanto a validacao do output da IA quanto a geracao automatica do texto do catalogo para inclusao no system prompt. Esse catalogo e a "fonte da verdade" que garante que a IA so gere componentes validos e que o frontend saiba renderiza-los.

## Acceptance Criteria
- [ ] O arquivo `src/lib/json-render-catalog.ts` exporta o catalogo com todos os 13 componentes: Section, Heading, Paragraph, Image, Link, Card, List, Table, Badge, Button, Hero, Nav, Footer
- [ ] Cada componente tem um Zod schema definindo suas props aceitas (tipos, obrigatoriedade, defaults)
- [ ] Existe um Zod schema composto (`JsonRenderDocumentSchema`) que valida o documento completo `{ root, elements }` verificando que cada element.type pertence ao catalogo
- [ ] Existe uma funcao `getCatalogPromptText()` que retorna o catalogo formatado como texto legivel para inclusao no system prompt da LLM
- [ ] Given um JSON valido com componentes do catalogo, When validado com `JsonRenderDocumentSchema.parse()`, Then passa sem erros
- [ ] Given um JSON com componente fora do catalogo (ex: "Accordion"), When validado, Then falha com erro descritivo
- [ ] Given um JSON com props invalidas para um componente (ex: Heading sem `level`), When validado, Then falha indicando a prop ausente
- [ ] Os tipos TypeScript sao inferidos dos Zod schemas (`z.infer<>`) e exportados

## Scope
### IN
- Arquivo `src/lib/json-render-catalog.ts`
- Zod schemas individuais por componente (props)
- Zod schema do documento json-render completo
- Funcao `getCatalogPromptText()` para gerar texto do catalogo
- Tipos TypeScript inferidos e exportados
- Os 13 componentes: Section, Heading, Paragraph, Image, Link, Card, List, Table, Badge, Button, Hero, Nav, Footer

### OUT
- Implementacao React dos componentes (Epic 4)
- Componentes interativos (Accordion, Modal, Tabs, etc.)
- Temas / variantes de estilo dos componentes
- Validacao de acessibilidade das props

## Technical Notes
- Usar Zod para definicao de schemas (ja na stack do projeto)
- Catalogo de componentes com suas props:
  ```
  Section:    { id?, className?, background? }
  Heading:    { level: 1-6, text: string, id? }
  Paragraph:  { text: string, className? }
  Image:      { src: string, alt: string, width?, height?, className? }
  Link:       { href: string, text: string, target?, className? }
  Card:       { title?: string, description?: string, image?: string, className? }
  List:       { items: string[], ordered?: boolean, className? }
  Table:      { headers: string[], rows: string[][], className? }
  Badge:      { text: string, variant?: 'default'|'secondary'|'outline', className? }
  Button:     { text: string, href?: string, variant?: 'default'|'secondary'|'outline'|'ghost', className? }
  Hero:       { title: string, subtitle?: string, image?: string, ctaText?: string, ctaHref?, className? }
  Nav:        { items: { text: string, href: string }[], logo?: string, className? }
  Footer:     { text?: string, links?: { text: string, href: string }[], className? }
  ```
- O `JsonRenderDocumentSchema` deve validar:
  1. `root` tem `type`, `props` opcional, e `children` como array de IDs
  2. Cada ID em `children` existe em `elements`
  3. Cada element em `elements` tem `type` pertencente ao catalogo
  4. As `props` de cada element passam no schema do respectivo componente
- `getCatalogPromptText()` deve gerar algo como:
  ```
  Componentes disponiveis:
  - Section: container de secao. Props: { id?: string, className?: string, background?: string }
  - Heading: titulo. Props: { level: 1-6 (obrigatorio), text: string (obrigatorio), id?: string }
  ...
  ```
- Considerar usar `z.discriminatedUnion` ou mapeamento manual por type para validacao por componente

## Dependencies
- Zod como dependencia do projeto (ja instalado)
- Spec json-render do Vercel Labs como referencia

## Estimate: 3

## File List
(preenchido durante dev)
