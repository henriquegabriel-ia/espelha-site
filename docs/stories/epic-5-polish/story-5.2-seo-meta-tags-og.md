# Story 5.2: SEO, meta tags, OG image

## Status: Draft

## Descricao
Configurar todas as meta tags necessarias para SEO e compartilhamento social do Clonador de Sites. Incluir Open Graph, Twitter Cards, favicon e manifest basico. Isso garante que o site apareca bem em buscas e quando compartilhado em redes sociais e mensageiros.

## Acceptance Criteria
- [ ] Given o index.html, When inspecionado, Then deve conter title, meta description e meta keywords adequados
- [ ] Given o link do site compartilhado no WhatsApp/LinkedIn/Twitter, When o preview e gerado, Then deve exibir titulo, descricao e imagem OG corretos
- [ ] Given as meta tags Open Graph, When presentes, Then devem incluir og:title, og:description, og:image, og:url e og:type
- [ ] Given as meta tags Twitter, When presentes, Then devem incluir twitter:card, twitter:title, twitter:description e twitter:image
- [ ] Given o arquivo public/og.png, When verificado, Then deve ter dimensoes 1200x630 e representar visualmente o Clonador de Sites
- [ ] Given o favicon, When a aba do navegador e visualizada, Then o icone deve aparecer corretamente
- [ ] Given o manifest.json, When presente, Then deve conter name, short_name, icons, theme_color e background_color

## Scope
### IN
- Meta tags no index.html: title, description, keywords
- Open Graph tags: og:title, og:description, og:image, og:url, og:type, og:site_name
- Twitter Card tags: twitter:card (summary_large_image), twitter:title, twitter:description, twitter:image
- Criacao de OG image estatica (1200x630) em public/og.png
- Favicon (pode ser simples, SVG ou PNG)
- manifest.json basico para PWA-readiness

### OUT
- Service Worker completo
- PWA offline support
- Structured data (JSON-LD)
- Sitemap.xml
- Robots.txt avancado

## Technical Notes
- Meta tags devem ser adicionadas diretamente no `index.html` (SPA — nao ha SSR)
- OG image pode ser criada com Figma, Canva ou gerada programaticamente — minimo 1200x630
- Favicon: incluir pelo menos favicon.ico e um apple-touch-icon (180x180)
- manifest.json: colocar em `public/manifest.json` e referenciar no index.html com `<link rel="manifest">`
- theme_color deve combinar com o dark mode do projeto (ex: `#0f172a` ou similar)
- Testar OG tags com: https://www.opengraph.xyz/ ou Facebook Sharing Debugger

## Business Value
- SEO bem configurado garante discoverability organica do Clonador de Sites em buscas
- OG tags fazem o link compartilhado em WhatsApp/LinkedIn/Twitter ter preview profissional, aumentando cliques
- Favicon e manifest melhoram percepao de qualidade e profissionalismo
- Essencial para viralidade: quando usuarios compartilham resultados, o link precisa ter boa aparencia

## Risks
| Risco | Probabilidade | Impacto | Mitigacao |
|-------|--------------|---------|-----------|
| OG image nao renderizar corretamente em todos os mensageiros | Media | Medio | Testar com opengraph.xyz e Facebook Sharing Debugger; seguir spec 1200x630 |
| Cache de preview social desatualizado apos mudancas | Alta | Baixo | Documentar como invalidar cache (Facebook Debugger, Twitter Card Validator) |
| SPA nao ser indexada corretamente por crawlers | Media | Alto | Verificar se meta tags estao no HTML estatico (index.html), nao injetadas via JS |
| Favicon nao aparecer em todos os navegadores | Baixa | Baixo | Incluir multiplos formatos: .ico, .svg, apple-touch-icon |

## Dependencies
- Nenhuma dependencia tecnica forte -- pode ser feita em paralelo com outras stories do Epic 5

## Estimate: 2

## Definition of Done
- [ ] Todos os ACs verificados e passando
- [ ] OG tags validadas com opengraph.xyz
- [ ] Favicon visivel em Chrome, Firefox, Safari
- [ ] manifest.json referenciado corretamente no index.html
- [ ] Code review aprovado

## File List
(preenchido durante dev)
