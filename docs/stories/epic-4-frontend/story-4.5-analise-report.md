# Story 4.5: Relatorio de analise IA

## Status: Draft

## Descricao
Criar o componente AnalysisReport que exibe o resultado da analise feita pela IA sobre o site espelhado. O relatorio e dividido em tres secoes — Positivos, Negativos e Sugestoes — com cards individuais para cada item. As sugestoes incluem badges de impacto e todos os itens sao categorizados (Design, SEO, Conteudo, Estrutura). Isso ajuda o usuario a entender rapidamente o que esta bom, o que precisa melhorar e como melhorar.

## Acceptance Criteria
- [ ] Given a analise da IA retornou, When o usuario visualiza o AnalysisReport, Then deve ver 3 secoes distintas: Positivos, Negativos e Sugestoes
- [ ] Given a secao Positivos esta visivel, When o usuario observa, Then cada item deve ser um card com icone verde de check e texto descritivo
- [ ] Given a secao Negativos esta visivel, When o usuario observa, Then cada item deve ser um card com icone amarelo de alerta e texto descritivo
- [ ] Given a secao Sugestoes esta visivel, When o usuario observa, Then cada item deve ser um card com icone de lampada e texto descritivo
- [ ] Given uma sugestao e exibida, When o usuario observa o card, Then deve ver um badge de impacto: High (vermelho), Medium (amarelo) ou Low (verde)
- [ ] Given qualquer item do relatorio, When o usuario observa, Then deve ver uma categoria com icone: Design (palette), SEO (search), Conteudo (file-text) ou Estrutura (layout)
- [ ] Given a analise retornou vazia em alguma secao, When renderiza, Then deve mostrar estado vazio com mensagem contextual

## Scope
### IN
- Componente AnalysisReport com layout de 3 secoes
- Componente AnalysisCard para cada item individual
- Componente ImpactBadge: High, Medium, Low com cores
- Componente CategoryTag: Design, SEO, Conteudo, Estrutura com icones
- Contadores por secao (ex: "3 pontos positivos")
- Layout responsivo: cards em grid

### OUT
- Filtragem ou ordenacao dos itens
- Exportacao do relatorio (PDF, Markdown)
- Comparacao entre analises
- Detalhamento expandivel com sugestoes de codigo

## Technical Notes
- Interface TypeScript para dados da analise:
  ```ts
  interface AnalysisItem {
    id: string;
    type: 'positive' | 'negative' | 'suggestion';
    category: 'design' | 'seo' | 'content' | 'structure';
    title: string;
    description: string;
    impact?: 'high' | 'medium' | 'low'; // apenas suggestions
  }
  ```
- Usar shadcn/ui Card, Badge components
- Icones via Lucide: CheckCircle (positivos), AlertTriangle (negativos), Lightbulb (sugestoes)
- Categorias com icones: Palette (Design), Search (SEO), FileText (Conteudo), Layout (Estrutura)
- Badge de impacto: destructive variant para High, warning para Medium, secondary para Low
- Secoes podem ser collapsible para relatorios longos
- Animacao sutil de entrada dos cards (fade-in stagger)

## Dependencies
- Story 4.1 (layout base)
- Endpoint /analyze retornando dados estruturados (Epic 3)

## Estimate: 3

## File List
(preenchido durante dev)
