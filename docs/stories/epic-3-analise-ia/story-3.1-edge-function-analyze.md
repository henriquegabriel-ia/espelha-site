# Story 3.1: Edge Function /analyze — Relatorio de Analise IA

## Status: Ready

## Descricao
Criar a Supabase Edge Function `/analyze` que recebe um JSON (json-render spec) junto com a URL original do site e retorna um relatorio estruturado de analise. A funcao chama um LLM para avaliar o site em 4 dimensoes (Design/UI, SEO, Conteudo, Estrutura Tecnica), retornando pontos positivos, negativos e sugestoes de melhoria categorizadas por impacto. Essa funcao e o alicerce da feature de analise inteligente do Espelha Site, permitindo que o usuario entenda os pontos fortes e fracos do site convertido antes de decidir aplicar otimizacoes.

## Acceptance Criteria
- [ ] Given um JSON valido (json-render spec) e uma URL, When a Edge Function `/analyze` e chamada via POST, Then retorna status 200 com o relatorio de analise tipado
- [ ] Given o relatorio retornado, When inspeciono o campo `positives`, Then ele contem um array de strings descrevendo pontos positivos do site
- [ ] Given o relatorio retornado, When inspeciono o campo `negatives`, Then ele contem um array de strings descrevendo pontos negativos do site
- [ ] Given o relatorio retornado, When inspeciono o campo `suggestions`, Then ele contem um array de objetos com `category`, `description` e `impact` (high/medium/low)
- [ ] Given a dimensao Design/UI, When o LLM analisa, Then avalia cores, espacamento, hierarquia visual, acessibilidade e consistencia
- [ ] Given a dimensao SEO, When o LLM analisa, Then avalia meta tags, headings, structured data e performance
- [ ] Given a dimensao Conteudo, When o LLM analisa, Then avalia clareza dos textos, CTAs, copywriting e tom de voz
- [ ] Given a dimensao Estrutura Tecnica, When o LLM analisa, Then avalia semantica HTML, componentes, responsividade e boas praticas
- [ ] Given um JSON invalido ou ausente, When a Edge Function e chamada, Then retorna status 400 com mensagem de erro descritiva
- [ ] Given falha no provider de IA primario, When a Edge Function e chamada, Then faz fallback para o proximo provider da cascata
- [ ] Given falha em todos os providers, When a Edge Function e chamada, Then retorna status 503 com mensagem de erro adequada

## Scope
### IN
- Criacao da Edge Function `/analyze` no Supabase
- Prompt de analise para o LLM cobrindo as 4 dimensoes
- Tipagem TypeScript do input e output (Zod schemas)
- Cascata de providers de IA (ex: OpenAI -> Anthropic -> fallback)
- Validacao do input (JSON + URL)
- Error handling com codigos HTTP adequados
- Logs estruturados para debugging

### OUT
- UI de exibicao do relatorio (sera em outra story)
- Persistencia do relatorio em banco de dados
- Rate limiting / autenticacao (tratado em epic separado)
- Cache de resultados de analise

## Technical Notes
- A Edge Function deve ser criada em `supabase/functions/analyze/index.ts`
- Usar Zod para validar tanto o input quanto o output do LLM
- O prompt deve instruir o LLM a retornar JSON puro, sem markdown
- Tipo do output:
  ```typescript
  interface AnalysisReport {
    positives: string[];
    negatives: string[];
    suggestions: Suggestion[];
  }
  interface Suggestion {
    category: 'design' | 'seo' | 'content' | 'technical';
    description: string;
    impact: 'high' | 'medium' | 'low';
  }
  ```
- Cascata de provider: tentar provider primario, se falhar (timeout/erro), tentar o proximo. Configurar via env vars `AI_PRIMARY_PROVIDER`, `AI_FALLBACK_PROVIDER`
- Limitar tamanho do JSON de input para evitar estourar contexto do LLM
- Retornar header `X-AI-Provider` indicando qual provider foi usado (util para debugging)

## Dependencies
- Epic 2 (conversao URL -> JSON) deve estar funcional para gerar o input
- Env vars dos providers de IA configuradas no Supabase
- Cascata de providers de IA implementada (pode ser util compartilhada com story 3.2)

## Risks
- **Prompt quality:** Output do LLM pode variar em qualidade e consistencia entre providers (mitigacao: Zod validation + retry)
- **Context window overflow:** JSONs muito grandes podem estourar limite do modelo (mitigacao: truncar input com limite definido)
- **Latencia:** Chamada ao LLM pode exceder 15s em modelos mais lentos (mitigacao: usar modelos rapidos como gpt-4o-mini, haiku, gemini-flash)
- **Cascata de fallback:** Se todos os providers falharem, usuario fica sem resultado (mitigacao: mensagem clara com orientacao)

## Definition of Done
- [ ] Edge Function `/analyze` deployada no Supabase e respondendo via POST
- [ ] Input validado com Zod (JSON + URL obrigatorios)
- [ ] Output validado com Zod (AnalysisReport tipado)
- [ ] Cascata de providers funcionando (BYO key -> Lovable AI -> erro 503)
- [ ] Header `X-AI-Provider` retornado em todas as respostas
- [ ] Testes manuais com pelo menos 3 URLs distintas
- [ ] Error handling: 400 para input invalido, 503 para falha total de providers
- [ ] Logs estruturados implementados
- [ ] Code review aprovado

## Estimate: 5

## File List
(preenchido durante dev)
