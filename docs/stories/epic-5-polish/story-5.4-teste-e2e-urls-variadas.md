# Story 5.4: Teste end-to-end com URLs variadas

## Status: Draft

## Descricao
Validar o fluxo completo do Clonador de Sites (URL -> scraping -> JSON -> analise IA -> preview) com pelo menos 10 URLs de diferentes tipos e complexidades. Documentar os resultados, identificar falhas e ajustar prompts ou logica conforme necessario. Esta story e essencial para garantir que o produto funcione de forma confiavel antes do lancamento.

## Acceptance Criteria
- [ ] Given pelo menos 10 URLs diferentes, When processadas pelo fluxo completo, Then os resultados devem ser documentados em uma tabela com: URL, tipo, status (sucesso/falha), tempo total, observacoes
- [ ] Given um site estatico simples, When clonado, Then o JSON e a analise devem ser gerados com sucesso
- [ ] Given uma landing page com muitos componentes, When clonada, Then todos os componentes principais devem ser capturados no JSON
- [ ] Given um blog/artigo, When clonado, Then o conteudo textual deve ser preservado na estrutura JSON
- [ ] Given um e-commerce (pagina de produto), When clonado, Then imagens, preco e descricao devem aparecer no JSON
- [ ] Given uma SPA (React/Vue), When clonada, Then o conteudo renderizado deve ser capturado (nao apenas o shell vazio)
- [ ] Given um site em portugues e um em ingles, When clonados, Then ambos devem ser processados corretamente
- [ ] Given um site com muitas imagens, When clonado, Then as URLs das imagens devem ser preservadas no JSON
- [ ] Given um site minimalista, When clonado, Then o JSON deve refletir a simplicidade sem inventar componentes
- [ ] Given um site com problemas de SEO/design, When analisado pela IA, Then a analise deve identificar os problemas reais
- [ ] Given os resultados dos testes, When problemas sao encontrados, Then os prompts de IA ou logica de scraping devem ser ajustados e retestados

## Scope
### IN
- Teste manual do fluxo completo com 10+ URLs
- Documentacao dos resultados em tabela markdown
- URLs a testar (sugestoes):
  1. Site estatico simples (ex: exemplo de portfolio)
  2. Landing page complexa (ex: stripe.com, linear.app)
  3. Blog/artigo (ex: blog.google, medium.com)
  4. E-commerce produto (ex: amazon.com.br produto)
  5. SPA React (ex: react.dev)
  6. Site em portugues (ex: gov.br, globo.com)
  7. Site em ingles (ex: apple.com)
  8. Site com muitas imagens (ex: unsplash.com)
  9. Site minimalista (ex: motherfuckingwebsite.com)
  10. Site com problemas de design (ex: arngren.net)
- Ajuste de prompts de IA baseado nos resultados
- Ajuste de logica de scraping se necessario

### OUT
- Testes automatizados (Cypress, Playwright)
- Testes de performance/carga
- Testes de seguranca
- Correcao de bugs estruturais (devem virar stories separadas se encontrados)

## Technical Notes
- Criar arquivo `docs/test-results/e2e-urls.md` para documentar resultados
- Formato sugerido da tabela:

| # | URL | Tipo | Status | Tempo | JSON OK | Analise OK | Observacoes |
|---|-----|------|--------|-------|---------|------------|-------------|
| 1 | ... | ...  | ...    | ...   | ...     | ...        | ...         |

- Para SPAs, verificar se o scraper espera o JS renderizar (headless browser vs fetch simples)
- Se muitos sites falharem no scraping, considerar usar puppeteer/playwright no backend
- Prompts de IA podem precisar de ajuste para diferentes tipos de site — documentar o que mudou
- Testar tanto o fluxo happy path quanto erros (complementa story 5.3)
- Medir tempo total de processamento por URL para identificar gargalos

## Business Value
- Validacao com URLs reais garante confiabilidade do produto antes do lancamento
- Identificacao proativa de falhas evita experiencia ruim dos primeiros usuarios
- Ajustes de prompts baseados em dados reais melhoram qualidade do output de IA
- Documentacao dos resultados serve como baseline de qualidade para futuras regressoes

## Risks
| Risco | Probabilidade | Impacto | Mitigacao |
|-------|--------------|---------|-----------|
| Sites externos bloquearem scraping durante testes | Alta | Medio | Ter lista alternativa de URLs; usar sites proprios como fallback |
| Resultados nao reproduziveis (conteudo dinamico, A/B testing) | Media | Medio | Documentar data/hora do teste; aceitar variacao em sites dinamicos |
| Testes manuais consumirem mais tempo que o estimado | Media | Medio | Priorizar 10 URLs core; adicionar mais apenas se sobrar tempo |
| Prompts de IA precisarem de muitos ajustes iterativos | Media | Alto | Limitar a 2 iteracoes de ajuste; bugs estruturais viram stories separadas |
| Custos de API (LLM) para 10+ testes completos | Baixa | Baixo | Usar modelos mais baratos (gpt-4o-mini, gemini-flash) para testes |

## Dependencies
- Todas as stories dos Epics 1-4 devem estar concluidas
- Story 5.3 (error handling) preferencialmente concluida antes

## Estimate: 3

## Definition of Done
- [ ] Todos os ACs verificados e passando
- [ ] Tabela de resultados documentada em docs/test-results/e2e-urls.md
- [ ] Minimo 10 URLs testadas com fluxo completo
- [ ] Taxa de sucesso >= 80% (8/10 URLs processadas com sucesso)
- [ ] Ajustes de prompt documentados (o que mudou e por que)
- [ ] Code review aprovado

## File List
(preenchido durante dev)
