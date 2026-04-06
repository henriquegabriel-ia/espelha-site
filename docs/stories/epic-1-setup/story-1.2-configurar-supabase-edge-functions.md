# Story 1.2: Configurar Supabase + Edge Functions base

## Status: Draft

## Descricao
Configurar o Supabase como backend do Espelha Site, incluindo o client no frontend e a estrutura base das 4 Edge Functions que formarao o pipeline de processamento (scrape, convert, analyze, optimize). Estabelecer os tipos compartilhados entre frontend e backend para garantir type-safety end-to-end.

## Acceptance Criteria
- [ ] Given o Supabase client configurado, When chamar `supabase.functions.invoke('scrape')`, Then a requisicao chega na Edge Function e retorna 200
- [ ] Given a pasta `supabase/functions/`, When listar seu conteudo, Then existem 4 diretorios: `scrape/`, `convert/`, `analyze/`, `optimize/`
- [ ] Given cada Edge Function, When inspecionar o `index.ts`, Then cada uma tem o boilerplate Deno com CORS headers e tratamento de erro padrao
- [ ] Given os tipos compartilhados, When importar `types/api.ts` no frontend, Then os tipos de request/response das Edge Functions estao disponiveis
- [ ] Given o arquivo `.env.local`, When o app iniciar, Then `SUPABASE_URL` e `SUPABASE_ANON_KEY` sao carregados corretamente
- [ ] Given a funcao `scrape` deployada localmente, When enviar POST com `{ url: "https://example.com" }`, Then retorna JSON com status de sucesso (mesmo que stub)

## Scope
### IN
- Instalacao do `@supabase/supabase-js` no frontend
- Criacao do client Supabase em `lib/supabase.ts`
- Criacao da estrutura `supabase/functions/` com 4 Edge Functions stub
- Boilerplate Deno padrao para cada function (CORS, error handling, tipagem)
- Tipos compartilhados em `src/types/api.ts` (request/response de cada endpoint)
- Helper `lib/api.ts` no frontend para invocar as Edge Functions com tipagem
- Arquivo `.env.local.example` com variaveis necessarias

### OUT
- Logica real de scraping (Story 1.3)
- Logica real de conversao/analise/otimizacao (epics futuros)
- Banco de dados / tabelas no Supabase (sera em outro epic)
- Autenticacao de usuarios

## Technical Notes
- Edge Functions do Supabase rodam em Deno (nao Node.js) — imports usam URLs ou `npm:` specifiers
- CORS deve ser tratado em todas as functions para permitir chamadas do frontend
- Criar um `_shared/` dentro de `supabase/functions/` para codigo compartilhado (cors headers, tipos)
- O boilerplate de cada function deve incluir: validacao de input, try/catch, response padronizada
- Para dev local, usar `supabase functions serve` (requer Supabase CLI instalado)
- Tipo base de response: `{ success: boolean; data?: T; error?: string }`

## Business Value
Estabelece a camada de backend serverless que todas as features core dependem. Sem as Edge Functions, nao ha scraping, conversao, analise ou otimizacao. Type-safety end-to-end reduz bugs em producao.

## Risks
- Supabase CLI local pode ter versao incompativel com Edge Functions Deno -- mitigacao: fixar versao da CLI e documentar no README
- CORS mal configurado pode bloquear chamadas do frontend -- mitigacao: testar cross-origin desde o AC inicial
- Deno runtime tem diferentas de Node.js (imports, APIs) -- mitigacao: documentar padroes no `_shared/`

## Definition of Done
- [ ] Todos os Acceptance Criteria passam
- [ ] `supabase functions serve` roda sem erros
- [ ] Tipos compilam sem erros (`npm run typecheck`)
- [ ] PR aprovado e mergeado

## Dependencies
- Story 1.1 (projeto base precisa estar configurado)

## Estimate: 3 pontos

## File List
(preenchido durante dev)
