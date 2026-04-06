# Story 2.2: Edge Function /convert com prompt json-render

## Status: Draft

## Descricao
Implementar a Supabase Edge Function `/convert` que recebe um `ScrapedPage` e usa uma LLM para gerar o JSON estruturado seguindo a spec json-render do Vercel Labs. A funcao resolve o provider de IA em cascata (BYO key do usuario ou Lovable AI como fallback), monta o system prompt com a spec + catalogo de componentes permitidos, e valida o output com Zod antes de retornar. Essa e a funcao que transforma dados brutos em componentes renderizaveis.

## Acceptance Criteria
- [ ] Given um `ScrapedPage` valido, When POST /convert e chamado, Then retorna JSON no formato json-render `{ root, elements }` com componentes do catalogo
- [ ] Given um `ScrapedPage` valido, When o usuario tem BYO API key configurada, Then a LLM do provider BYO e utilizada
- [ ] Given um `ScrapedPage` valido sem BYO key, When POST /convert e chamado, Then o Lovable AI e utilizado como fallback
- [ ] Given o output da LLM, When o JSON e gerado, Then cada `element` possui: type (do catalogo), props e children
- [ ] Given o output da LLM, When a validacao Zod falha, Then retorna 422 com detalhes dos erros de validacao
- [ ] Given o output da LLM contem componentes fora do catalogo, When a validacao roda, Then rejeita o output com erro especifico
- [ ] Given um `ScrapedPage` vazio ou malformado, When POST /convert e chamado, Then retorna 400 com mensagem de erro
- [ ] Given a LLM falha ou timeout, When POST /convert e chamado, Then retorna 502 com erro descritivo
- [ ] O system prompt inclui a spec json-render completa e o catalogo de componentes exportado da Story 2.3

## Scope
### IN
- Edge Function `supabase/functions/convert/index.ts`
- Resolucao de provider IA em cascata: BYO API key (header `x-ai-api-key` + `x-ai-provider`) → Lovable AI
- System prompt com spec json-render + catalogo de componentes (importado de `src/lib/json-render-catalog.ts`)
- User prompt com conteudo do `ScrapedPage` (titulo, headings, paragrafos, imagens, links, metadata)
- Parsing e validacao do output LLM com Zod schema (do catalogo)
- Tipagem do retorno: `JsonRenderDocument` com `{ root, elements }`
- Error handling (input invalido, LLM failure, output invalido)
- CORS headers

### OUT
- Rendering dos componentes no frontend (Epic 4)
- Persistencia do JSON gerado
- Streaming da resposta LLM (pode ser adicionado depois)
- Suporte a multiplos modelos simultaneos / A-B testing
- Retry automatico com outro provider em caso de falha

## Technical Notes
- Deno runtime (padrao Supabase Edge Functions)
- Cascata de provider:
  1. Se headers `x-ai-api-key` e `x-ai-provider` presentes → usar provider BYO (OpenAI, Anthropic, etc.)
  2. Senao → usar Lovable AI (endpoint e key via env vars)
- System prompt deve ser claro e estruturado:
  ```
  Voce e um conversor de paginas web para componentes UI.
  Siga estritamente a spec json-render.
  Use APENAS os componentes do catalogo abaixo.
  Output APENAS JSON valido, sem markdown fences.
  [catalogo de componentes com props]
  [spec json-render resumida]
  ```
- User prompt: serializar o `ScrapedPage` de forma que a LLM entenda a hierarquia do conteudo
- Validacao Zod: importar schema do catalogo (Story 2.3)
- Formato json-render:
  ```ts
  interface JsonRenderDocument {
    root: { type: string; props?: Record<string, unknown>; children: string[] };
    elements: Record<string, JsonRenderElement>;
  }
  interface JsonRenderElement {
    type: string; // componente do catalogo
    props: Record<string, unknown>;
    children?: string[] | string;
  }
  ```
- Timeout da LLM: 60s via AbortController
- Considerar limitar tokens de output para evitar custos excessivos

## Business Value
Funcao central do produto: transforma dados brutos em componentes UI renderizaveis. E o "espelhamento" propriamente dito. Qualidade do prompt e validacao determinam a utilidade do output para o usuario final.

## Risks
- LLM pode gerar JSON invalido ou componentes fora do catalogo -- mitigacao: validacao Zod com rejeicao clara (422)
- Custo de tokens pode ser alto para paginas grandes -- mitigacao: limitar tokens de output, usar modelos rapidos (gpt-4o-mini, haiku, gemini-flash)
- Prompt injection via conteudo scrapeado -- mitigacao: conteudo isolado na user message (nao no system prompt), conforme arquitetura
- Latencia variavel entre providers -- mitigacao: timeout de 60s, feedback de progresso no frontend
- Output pode variar muito entre execucoes -- mitigacao: temperature baixa, structured output quando disponivel

## Definition of Done
- [ ] Todos os Acceptance Criteria passam
- [ ] Output validado com Zod em 100% dos casos
- [ ] Testado com pelo menos 2 providers diferentes (ex: OpenAI + Anthropic)
- [ ] System prompt documentado e revisado
- [ ] PR aprovado e mergeado

## Dependencies
- Story 2.1 (tipo `ScrapedPage`)
- Story 2.3 (catalogo de componentes + Zod schema + texto para prompt)
- Story 1.4 (provider IA com cascata)
- Lovable AI endpoint configurado como env var no Supabase
- Supabase project configurado (Epic 1)

## Estimate: 5

## File List
(preenchido durante dev)
