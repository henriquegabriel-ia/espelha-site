# Story 5.1: Design polish — dark mode, animacoes, responsivo

## Status: Draft

## Descricao
Revisar e polir toda a interface visual do Espelha Site antes do lancamento. Garantir que o dark mode funcione corretamente em todos os componentes, adicionar animacoes sutis que melhorem a experiencia do usuario, e validar responsividade em diferentes tamanhos de tela. O objetivo e entregar uma experiencia visual coesa e profissional.

## Acceptance Criteria
- [ ] Given qualquer componente da aplicacao, When renderizado em dark mode, Then todas as cores, bordas e sombras devem estar consistentes com o tema escuro (sem elementos "brancos" perdidos)
- [ ] Given o campo de input de URL, When o usuario foca no campo, Then um glow sutil deve aparecer ao redor do input
- [ ] Given o botao de submit, When o usuario passa o mouse, Then um efeito de pulse sutil deve ser visivel
- [ ] Given as tabs de resultado (JSON/Analise/Preview), When o usuario troca de tab, Then a transicao deve ser com fade suave
- [ ] Given o botao de copiar JSON, When o usuario clica e a copia e bem-sucedida, Then um checkmark animado deve aparecer temporariamente
- [ ] Given a aplicacao em tela de 320px (mobile), When renderizada, Then todos os elementos devem estar visiveis e usaveis sem scroll horizontal
- [ ] Given a aplicacao em tela de 768px (tablet), When renderizada, Then o layout deve se adaptar aproveitando o espaco disponivel
- [ ] Given a aplicacao em tela de 1440px (desktop), When renderizada, Then o layout deve estar centralizado com largura maxima adequada
- [ ] Espacamentos e alinhamentos consistentes em toda a aplicacao (padding, margin, gap)
- [ ] Todos os estados interativos (hover, focus, active, disabled, loading) devem ter feedback visual adequado

## Scope
### IN
- Revisao de dark mode em todos os componentes existentes
- Animacoes CSS/Framer Motion: input focus glow, button pulse, tab fade, copy checkmark
- Teste e ajuste de responsividade (mobile 320px+, tablet 768px+, desktop 1024px+)
- Ajuste de espacamentos, alinhamentos e tipografia
- Consistencia visual em estados interativos (hover, focus, active, disabled, loading)

### OUT
- Criacao de novos componentes
- Mudanca de layout/estrutura de pagina
- Light mode (o projeto usa dark mode por padrao)
- Testes automatizados de visual regression

## Technical Notes
- Usar Tailwind CSS para animacoes simples (`animate-pulse`, `transition-all`, `duration-300`)
- Para animacoes mais complexas (checkmark), considerar CSS keyframes customizados ou Framer Motion se ja estiver no projeto
- Dark mode e o padrao — verificar se nao ha classes `bg-white` ou cores hardcoded que quebrem o tema
- Testar com DevTools em diferentes breakpoints: 320px, 375px, 768px, 1024px, 1440px
- shadcn/ui ja tem suporte a dark mode — garantir que customizacoes nao quebrem isso

## Business Value
- Experiencia visual coesa e profissional aumenta confianca do usuario e credibilidade do produto
- Responsividade garante acesso mobile (NFR-03), ampliando alcance
- Polish visual e diferencial competitivo — sites de ferramentas dev com boa UI se destacam
- Remix experience: usuarios que fizerem remix ja recebem um produto visualmente polido

## Risks
| Risco | Probabilidade | Impacto | Mitigacao |
|-------|--------------|---------|-----------|
| Framer Motion aumentar bundle size significativamente | Media | Medio | Preferir animacoes CSS/Tailwind; usar Framer Motion apenas se ja estiver no projeto |
| Inconsistencia cross-browser em animacoes CSS | Baixa | Medio | Testar em Chrome, Firefox, Safari; usar prefixos quando necessario |
| Dark mode quebrar em componentes shadcn/ui customizados | Media | Alto | Revisar todas as customizacoes; usar CSS variables do tema |
| Breakpoints nao cobrirem devices reais | Baixa | Medio | Testar com DevTools + device real se possivel |

## Dependencies
- Stories 1.x a 4.x devem estar concluidas (todos os componentes existem)

## Estimate: 3

## Definition of Done
- [ ] Todos os ACs verificados e passando
- [ ] Revisao visual em 3 breakpoints (320px, 768px, 1440px)
- [ ] Nenhum elemento com cores hardcoded fora do tema
- [ ] Animacoes funcionando sem jank (60fps)
- [ ] Code review aprovado

## File List
(preenchido durante dev)
