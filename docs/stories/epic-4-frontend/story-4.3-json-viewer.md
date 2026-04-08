# Story 4.3: JSON viewer com syntax highlight e tree view

## Status: Ready

## Descricao
Criar o componente JsonViewer com duas visualizacoes: uma aba JSON com syntax highlight e line numbers, e uma aba Tree com navegacao collapsible dos nodes. O viewer e a principal interface para o usuario inspecionar o resultado do clonagem em formato json-render. Deve suportar busca dentro do JSON e usar fonte monospacada (JetBrains Mono).

## Acceptance Criteria
- [ ] Given o JSON do clonagem foi retornado, When o usuario visualiza o JsonViewer, Then deve ver duas tabs: [JSON] e [Tree]
- [ ] Given a tab JSON esta ativa, When o usuario visualiza o conteudo, Then deve ver o JSON formatado com syntax highlight (keys, strings, numbers, booleans em cores distintas) e line numbers
- [ ] Given a tab JSON esta ativa, When o JSON e maior que a area visivel, Then deve haver scroll vertical com line numbers acompanhando
- [ ] Given a tab Tree esta ativa, When o usuario visualiza o conteudo, Then deve ver os nodes do JSON em formato arvore collapsible
- [ ] Given a tab Tree esta ativa, When o usuario clica em um node, Then deve expandir/colapsar seus filhos
- [ ] Given a tab Tree esta ativa, When o usuario clica "Expandir tudo" ou "Colapsar tudo", Then todos os nodes devem responder
- [ ] Given qualquer tab esta ativa, When o usuario digita no campo de busca, Then os matches devem ser destacados no conteudo
- [ ] Given o viewer esta renderizado, When o usuario observa a fonte, Then deve ser JetBrains Mono

## Scope
### IN
- Componente JsonViewer com sistema de tabs
- Tab JSON: syntax highlight com cores do theme, line numbers, scroll
- Tab Tree: nodes collapsible, botoes expandir/colapsar tudo
- Campo de busca (search) com highlight de matches
- Fonte JetBrains Mono no conteudo do viewer
- Copy do JSON via botao no header do viewer

### OUT
- Edicao inline do JSON
- Diff view entre versoes
- Export para outros formatos (YAML, XML)
- Validacao de schema json-render

## Technical Notes
- Avaliar libs: react-json-view-lite (leve, ~3kb) ou implementacao custom com Shiki/Prism para highlight
- Se custom: usar Shiki para syntax highlight (melhor suporte a themes dark/light) com language json
- Tree view pode ser custom com recursao sobre Object.entries + estado de collapse por path
- Search: filtrar por key name ou value, usar highlight com `<mark>` nos matches
- Performance: para JSONs grandes (>1MB), considerar virtualizacao com react-window
- Tabs via shadcn/ui Tabs component
- Line numbers como coluna separada com CSS grid ou flex, sync de scroll

## Dependencies
- Story 4.1 (layout base)
- Dados JSON vindos do fluxo de clonagem (Epic 2/3)
- Fonte JetBrains Mono carregada no projeto

## Risks
- **Performance com JSONs grandes:** JSONs > 1MB podem travar o browser (mitigacao: virtualizacao com react-window ou limite de renderizacao)
- **Lib de syntax highlight:** Dependencia de lib externa pode ter breaking changes ou peso excessivo (mitigacao: avaliar react-json-view-lite vs Shiki, escolher mais leve)
- **Acessibilidade:** Tree view custom pode nao ser acessivel por teclado (mitigacao: implementar aria-expanded, aria-controls, keyboard nav)

## Definition of Done
- [ ] JsonViewer renderiza com duas tabs: JSON e Tree
- [ ] Tab JSON com syntax highlight, line numbers e scroll
- [ ] Tab Tree com nodes collapsible e botoes expandir/colapsar tudo
- [ ] Campo de busca com highlight de matches
- [ ] Fonte JetBrains Mono aplicada
- [ ] Botao copy no header do viewer
- [ ] Performance aceitavel com JSONs de ate 500KB
- [ ] Code review aprovado

## Estimate: 5

## File List
(preenchido durante dev)
