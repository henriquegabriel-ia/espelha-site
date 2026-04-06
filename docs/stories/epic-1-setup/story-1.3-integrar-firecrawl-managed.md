# Story 1.3: Integrar Firecrawl managed

## Status: Draft

## Descricao
Integrar o Firecrawl (managed by Lovable ou via API key) na Edge Function `/scrape` para extrair conteudo estruturado de URLs. Definir o tipo `ScrapedPage` que sera usado por todo o pipeline downstream. Validar a integracao com uma URL real para garantir que o fluxo funciona end-to-end.

## Acceptance Criteria
- [ ] Given a Edge Function `scrape` com Firecrawl integrado, When enviar POST com `{ url: "https://example.com" }`, Then retorna o conteudo HTML/markdown extraido da pagina
- [ ] Given o tipo `ScrapedPage`, When inspecionar sua definicao, Then contem campos: `url`, `title`, `markdown`, `html`, `metadata`, `screenshot?`, `extractedAt`
- [ ] Given a API key do Firecrawl configurada nos Secrets, When a Edge Function executa, Then a key e lida de `Deno.env.get('FIRECRAWL_API_KEY')`
- [ ] Given uma URL invalida ou inacessivel, When enviar para `/scrape`, Then retorna erro estruturado com mensagem clara (ex: `{ success: false, error: "URL inacessivel" }`)
- [ ] Given o Firecrawl managed pelo Lovable, When o ambiente Lovable esta disponivel, Then a integracao funciona sem necessidade de API key manual

## Scope
### IN
- Instalacao/import do Firecrawl SDK na Edge Function `scrape` (via `npm:` specifier no Deno)
- Implementacao da chamada `firecrawl.scrapeUrl()` com opcoes adequadas
- Definicao do tipo `ScrapedPage` em `_shared/types.ts`
- Mapeamento da response do Firecrawl para `ScrapedPage`
- Tratamento de erros (URL invalida, timeout, rate limit)
- Configuracao da `FIRECRAWL_API_KEY` nos Supabase Secrets
- Teste manual com pelo menos 3 URLs de complexidade variada

### OUT
- Conversao do conteudo em JSON estruturado (Story futura — Edge Function `convert`)
- Scraping em batch / multiplas URLs simultaneas
- Cache de resultados de scraping
- UI de input de URL no frontend

## Technical Notes
- Firecrawl SDK: usar `npm:@mendable/firecrawl-js` no Deno ou chamar a REST API diretamente
- A opcao `scrapeUrl()` aceita parametros como `formats: ['markdown', 'html']`, `waitFor`, `timeout`
- Se Lovable managed: o Firecrawl pode estar disponivel via integracao built-in sem API key explicita
- Para fallback: verificar `Deno.env.get('FIRECRAWL_API_KEY')` e retornar erro claro se ausente
- Considerar timeout de 30s para scraping (paginas pesadas podem demorar)
- O campo `screenshot` e opcional e pode ser desabilitado para economizar creditos
- Rate limiting do Firecrawl: plano free tem limites — tratar erro 429 adequadamente

## Business Value
Habilita o core do produto: sem scraping, nao ha espelhamento. Firecrawl managed garante zero-config no remix (NFR-04), essencial para a experiencia de compartilhamento.

## Risks
- Firecrawl plano free tem rate limit -- mitigacao: tratar erro 429 com mensagem clara ao usuario
- Firecrawl managed pode nao estar disponivel fora do Lovable -- mitigacao: fallback para API key manual
- Timeout em paginas pesadas (>30s) -- mitigacao: AbortController com 30s e mensagem informativa
- SDK Firecrawl pode ter incompatibilidade com Deno -- mitigacao: testar `npm:` specifier no inicio, fallback para REST API

## Definition of Done
- [ ] Todos os Acceptance Criteria passam
- [ ] Teste manual com 3+ URLs de complexidade variada (statica, SPA, pagina pesada)
- [ ] Erros retornam mensagens claras e uteis
- [ ] PR aprovado e mergeado

## Dependencies
- Story 1.2 (estrutura das Edge Functions precisa existir)

## Estimate: 2 pontos

## File List
(preenchido durante dev)
