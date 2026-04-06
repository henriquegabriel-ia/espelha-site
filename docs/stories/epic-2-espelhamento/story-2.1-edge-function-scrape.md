# Story 2.1: Edge Function /scrape com Firecrawl

## Status: Draft

## Descricao
Implementar a Supabase Edge Function `/scrape` que recebe uma URL, valida o input, chama a Firecrawl API para fazer o scraping da pagina e retorna os dados estruturados no tipo `ScrapedPage`. Essa funcao e o ponto de entrada do pipeline de espelhamento -- sem ela nenhuma conversao acontece.

## Acceptance Criteria
- [ ] Given uma URL valida, When POST /scrape e chamado, Then a Firecrawl API e invocada e os dados da pagina sao retornados como `ScrapedPage`
- [ ] Given uma URL valida, When o scraping completa, Then o retorno contem: titulo, textos, metadata (og tags, description, canonical, lang), headings, links e imagens
- [ ] Given uma URL com formato invalido, When POST /scrape e chamado, Then retorna 400 com mensagem de erro descritiva
- [ ] Given uma URL apontando para localhost ou IP privado (127.x, 10.x, 192.168.x, 172.16-31.x), When POST /scrape e chamado, Then retorna 400 rejeitando a URL por seguranca (SSRF protection)
- [ ] Given uma URL valida mas o site esta inacessivel, When POST /scrape e chamado, Then retorna 502 com erro indicando que o site nao respondeu
- [ ] Given uma URL valida mas o Firecrawl excede o timeout, When POST /scrape e chamado, Then retorna 504 com erro de timeout
- [ ] Given uma chamada sem body ou sem campo `url`, When POST /scrape e chamado, Then retorna 400 com mensagem de campo obrigatorio
- [ ] O tipo `ScrapedPage` esta definido e exportado em `src/types/scraped-page.ts`

## Scope
### IN
- Edge Function `supabase/functions/scrape/index.ts`
- Validacao de URL (formato + blocklist de IPs privados)
- Chamada a Firecrawl API (managed, via env `FIRECRAWL_API_KEY`)
- Mapeamento da resposta Firecrawl para o tipo `ScrapedPage`
- Tipo `ScrapedPage` em `src/types/scraped-page.ts`
- Error handling com status codes HTTP adequados (400, 502, 504)
- CORS headers para chamadas do frontend

### OUT
- Persistencia dos dados scrapeados (sera feita em story futura)
- Rate limiting (sera tratado no Epic 5)
- Fila / processamento assincrono
- Scraping de SPAs com rendering JS (limitacao do Firecrawl basic)

## Technical Notes
- Usar Deno runtime (padrao Supabase Edge Functions)
- Firecrawl API key via `Deno.env.get('FIRECRAWL_API_KEY')`
- A Firecrawl managed retorna HTML + metadata; mapear para `ScrapedPage` extraindo campos relevantes
- Tipo `ScrapedPage` deve incluir no minimo:
  ```ts
  interface ScrapedPage {
    url: string;
    title: string;
    description: string | null;
    lang: string | null;
    canonical: string | null;
    ogTags: Record<string, string>;
    headings: { level: number; text: string }[];
    paragraphs: string[];
    links: { href: string; text: string }[];
    images: { src: string; alt: string }[];
    rawMarkdown: string;
  }
  ```
- Validacao de IP privado: resolver DNS da URL e checar contra ranges privados antes de chamar Firecrawl
- Timeout da Firecrawl: usar AbortController com 30s

## Business Value
Ponto de entrada do pipeline de espelhamento. Sem esta funcao, o produto nao tem funcionalidade core. Qualidade do scraping impacta diretamente a qualidade da conversao IA downstream.

## Risks
- SSRF: URLs maliciosas podem tentar acessar rede interna -- mitigacao: validacao de IP privado antes de chamar Firecrawl
- Firecrawl timeout em paginas pesadas -- mitigacao: AbortController com 30s
- Paginas com protecao anti-bot podem falhar -- mitigacao: retornar erro claro, nao tentar bypass
- Dados scrapeados podem conter XSS -- mitigacao: sanitizacao sera feita no frontend (Epic 4)

## Definition of Done
- [ ] Todos os Acceptance Criteria passam
- [ ] SSRF protection testada com URLs de IP privado
- [ ] Timeout testado (simular pagina lenta)
- [ ] Tipo `ScrapedPage` usado consistentemente
- [ ] PR aprovado e mergeado

## Dependencies
- Story 1.3 (integracao Firecrawl + tipo ScrapedPage base)
- Story 1.2 (estrutura das Edge Functions)
- Firecrawl API key configurada como secret no Supabase

## Estimate: 3

## File List
(preenchido durante dev)
