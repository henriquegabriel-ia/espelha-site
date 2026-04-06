# Story 4.1: Landing page com hero e input de URL

## Status: Ready

## Descricao
Criar a landing page principal do Espelha Site com visual dark mode, contendo header com logo e theme toggle, hero section com campo de URL e botao de acao, secao de features e footer. Esta pagina e o ponto de entrada do usuario e deve comunicar claramente o proposito da ferramenta em poucos segundos.

## Acceptance Criteria
- [ ] Given a pagina carregou, When o usuario visualiza o header, Then deve ver o logo "Espelha Site" a esquerda e um toggle dark/light a direita
- [ ] Given o usuario esta na landing, When visualiza o hero, Then deve ver titulo, subtitulo explicativo, input de URL com placeholder e botao "Espelhar"
- [ ] Given o usuario digita uma URL valida e clica "Espelhar", When o evento dispara, Then a URL e enviada para o fluxo de processamento
- [ ] Given a pagina carregou, When o usuario scrolla, Then deve ver 3 cards de features: Espelha, Analisa e Otimiza, cada um com icone e descricao
- [ ] Given a pagina carregou, When o usuario visualiza o footer, Then deve ver link para o repositorio GitHub
- [ ] Given o usuario acessa de mobile (viewport < 768px), When a pagina renderiza, Then todos os elementos devem estar responsivos e usaveis
- [ ] Given o dark mode esta ativo (default), When a pagina renderiza, Then deve usar palette zinc + blue primary + green accent conforme design system

## Scope
### IN
- Componente Header com logo texto e ThemeToggle (dark/light)
- Componente HeroSection com titulo, subtitulo, UrlInput e botao
- Componente UrlInput com validacao basica de URL
- Componente FeaturesSection com 3 cards (Espelha, Analisa, Otimiza)
- Componente Footer com link GitHub
- Layout responsivo mobile-first
- Integracao com Tailwind dark mode (class strategy)

### OUT
- Logica de processamento da URL (handled by other stories/epics)
- Animacoes avancadas ou transicoes de pagina
- Internacionalizacao (i18n)
- SEO meta tags dinamicas

## Technical Notes
- Usar shadcn/ui Button, Input e Card components
- Dark mode via Tailwind `darkMode: 'class'` com toggle persistido em localStorage
- Fonte Inter para texto geral, JetBrains Mono reservada para codigo (stories futuras)
- Icones via Lucide React (ja incluso no shadcn/ui)
- Layout single-page: usar sections com scroll suave
- Botao "Espelhar" deve ter variant primary (blue) com hover state

## Dependencies
- shadcn/ui inicializado no projeto
- Tailwind CSS configurado com palette customizada (zinc, blue, green)
- Fontes Inter e JetBrains Mono importadas

## Risks
- **Responsividade:** Layout pode quebrar em viewports intermediarios (mitigacao: testar em 320px, 768px, 1024px, 1440px)
- **Dark mode inconsistencia:** Cores podem nao funcionar bem em ambos os modos (mitigacao: usar palette do design system com variantes dark/light)
- **Performance de fontes:** Import de fontes externas pode atrasar first paint (mitigacao: font-display swap, preload)

## Definition of Done
- [ ] Landing page renderiza corretamente em dark mode (default)
- [ ] Header com logo e theme toggle funcional
- [ ] Hero com input de URL e botao "Espelhar" funcional
- [ ] Secao de features com 3 cards renderizando
- [ ] Footer com link GitHub
- [ ] Responsivo em mobile (< 768px) e desktop
- [ ] Lighthouse performance score > 90
- [ ] Code review aprovado

## Estimate: 3

## File List
(preenchido durante dev)
