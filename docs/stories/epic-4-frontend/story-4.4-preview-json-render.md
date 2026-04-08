# Story 4.4: Preview visual json-render

## Status: Ready

## Descricao
Adicionar uma tab [Preview] ao viewer que renderiza o JSON no formato json-render como componentes visuais reais usando @json-render/react. O usuario podera ver uma previa de como o site clonado ficaria reconstruido a partir do JSON, usando componentes shadcn/ui mapeados ao catalogo json-render. Isso torna o clonagem tangivel e compreensivel visualmente.

## Acceptance Criteria
- [ ] Given o JSON do clonagem foi retornado, When o usuario clica na tab [Preview], Then deve ver o JSON renderizado como componentes visuais
- [ ] Given o JSON contem um node do tipo "Section", When renderizado no preview, Then deve exibir uma section estilizada com shadcn/ui
- [ ] Given o JSON contem nodes do tipo "Heading", "Card", "Text", "Image", "Button", When renderizados, Then cada um deve mapear para o componente shadcn/ui correspondente
- [ ] Given o JSON e valido json-render, When a renderizacao ocorre, Then o layout deve respeitar a hierarquia e aninhamento dos nodes
- [ ] Given o JSON contem um node nao reconhecido ou invalido, When a renderizacao tenta processar, Then deve exibir um fallback visual (placeholder com tipo do node) em vez de quebrar
- [ ] Given o @json-render/react falha completamente, When a tab Preview esta ativa, Then deve exibir mensagem de erro amigavel com opcao de ver o JSON raw

## Scope
### IN
- Componente JsonRenderPreview como terceira tab no viewer
- Integracao com @json-render/react e Renderer
- Registro de componentes do catalogo: Section, Heading, Text, Paragraph, Card, Image, Button, Link, List, ListItem
- Mapeamento de cada componente json-render para equivalente visual shadcn/ui + Tailwind
- Error boundary com fallback
- Placeholder para nodes nao reconhecidos

### OUT
- Interatividade dos componentes renderizados (cliques, navegacao)
- Edicao visual drag-and-drop
- Preview responsivo com device frames (mobile/tablet/desktop)
- Renderizacao de componentes customizados fora do catalogo padrao

## Technical Notes
- Instalar @json-render/react e @json-render/core
- Usar `createRenderer` com mapa de componentes customizados
- Componentes do catalogo mapeados:
  - Section -> div com padding/margin shadcn
  - Heading -> h1-h6 com classes tipografia
  - Text/Paragraph -> p com prose styles
  - Card -> shadcn Card component
  - Image -> img com aspect-ratio e rounded
  - Button -> shadcn Button
  - Link -> a com hover styles
  - List/ListItem -> ul/li estilizados
- Wrap todo o preview em ErrorBoundary do React
- Preview deve ter max-width e scroll proprio para nao afetar layout da pagina
- Considerar um wrapper com borda/sombra simulando uma "janela de browser"

## Dependencies
- Story 4.3 (JSON viewer com sistema de tabs)
- @json-render/react package instalado
- Catalogo json-render definido (Epic 2)

## Risks
- **Disponibilidade do @json-render/react:** Pacote pode ter API instavel ou breaking changes (mitigacao: pinnar versao, verificar compatibilidade antes de iniciar)
- **Componentes nao mapeados:** JSON pode conter tipos nao previstos no catalogo (mitigacao: fallback visual com placeholder)
- **XSS via conteudo renderizado:** Dados scrapeados podem conter scripts maliciosos (mitigacao: sanitizar props antes de renderizar, ErrorBoundary)

## Definition of Done
- [ ] Tab Preview adicionada ao viewer (terceira tab)
- [ ] Todos os componentes do catalogo mapeados para shadcn/ui equivalentes
- [ ] Fallback visual para nodes nao reconhecidos
- [ ] ErrorBoundary implementado com mensagem amigavel
- [ ] Layout respeita hierarquia e aninhamento dos nodes
- [ ] Preview funciona com JSONs gerados pela /convert
- [ ] Code review aprovado

## Estimate: 5

## File List
(preenchido durante dev)
