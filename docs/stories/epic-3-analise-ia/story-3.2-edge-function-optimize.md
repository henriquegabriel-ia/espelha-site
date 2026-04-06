# Story 3.2: Edge Function /optimize — JSON com Melhorias Aplicadas

## Status: Ready

## Descricao
Criar a Supabase Edge Function `/optimize` que recebe o JSON original (json-render spec) junto com a lista de sugestoes geradas pela analise (story 3.1) e retorna um novo JSON otimizado. A funcao chama um LLM instruido a aplicar as melhorias sugeridas diretamente no JSON, mantendo a mesma estrutura de catalogo de componentes da json-render spec. O output e validado com o mesmo Zod schema usado na conversao original, garantindo compatibilidade total com o renderer. Essa funcao alimenta o botao "Gerar com Sugestoes" da interface.

## Acceptance Criteria
- [ ] Given um JSON valido (json-render spec) e uma lista de sugestoes, When a Edge Function `/optimize` e chamada via POST, Then retorna status 200 com um novo JSON otimizado
- [ ] Given o JSON otimizado retornado, When validado com o Zod schema da json-render spec, Then passa na validacao sem erros
- [ ] Given as sugestoes de impacto high, When o LLM otimiza, Then essas melhorias estao refletidas no JSON de output
- [ ] Given o JSON otimizado, When comparado ao original, Then mantem a mesma estrutura de catalogo de componentes (nao remove nem renomeia componentes existentes)
- [ ] Given um JSON invalido ou sugestoes ausentes, When a Edge Function e chamada, Then retorna status 400 com mensagem de erro descritiva
- [ ] Given falha no provider de IA primario, When a Edge Function e chamada, Then faz fallback para o proximo provider da cascata
- [ ] Given falha em todos os providers, When a Edge Function e chamada, Then retorna status 503 com mensagem de erro adequada
- [ ] Given o JSON otimizado, When renderizado pelo json-render, Then produz uma pagina funcional sem erros de runtime

## Scope
### IN
- Criacao da Edge Function `/optimize` no Supabase
- Prompt de otimizacao para o LLM que aplica sugestoes no JSON
- Tipagem TypeScript do input e output (Zod schemas)
- Validacao do output com o mesmo schema da conversao (json-render spec)
- Cascata de providers de IA (reutilizar logica da story 3.1)
- Error handling com codigos HTTP adequados
- Logs estruturados para debugging

### OUT
- UI do botao "Gerar com Sugestoes" (sera em outra story)
- Diff visual entre JSON original e otimizado
- Persistencia do JSON otimizado em banco de dados
- Selecao granular de quais sugestoes aplicar (aplica todas)

## Technical Notes
- A Edge Function deve ser criada em `supabase/functions/optimize/index.ts`
- Reutilizar o mesmo Zod schema de validacao do JSON usado no Epic 2 (conversao)
- O prompt deve instruir o LLM a:
  1. Receber o JSON original e a lista de sugestoes
  2. Aplicar cada sugestao modificando o JSON de forma coerente
  3. Manter a estrutura de componentes intacta (mesmo catalogo)
  4. Retornar somente o JSON resultante, sem explicacoes
- Tipo do input:
  ```typescript
  interface OptimizeRequest {
    json: JsonRenderSpec;        // JSON original
    suggestions: Suggestion[];   // sugestoes da analise
    url: string;                 // URL original (contexto)
  }
  ```
- O output e um `JsonRenderSpec` validado
- Extrair a logica de cascata de providers para um modulo compartilhado (`_shared/ai-cascade.ts`) reutilizado por `/analyze` e `/optimize`
- Limitar tamanho do JSON + sugestoes para nao estourar contexto do LLM
- Retornar header `X-AI-Provider` indicando qual provider foi usado

## Dependencies
- Story 3.1 (Edge Function /analyze) — fornece as sugestoes de input
- Zod schema da json-render spec definido no Epic 2
- Cascata de providers de IA (modulo compartilhado com story 3.1)
- Env vars dos providers de IA configuradas no Supabase

## Risks
- **Output invalido:** LLM pode gerar JSON que nao passa na validacao do Zod schema (mitigacao: retry com prompt mais restritivo)
- **Perda de componentes:** LLM pode remover ou renomear componentes ao otimizar (mitigacao: AC explicito + validacao pos-geracao)
- **Context window overflow:** JSON original + sugestoes podem exceder contexto (mitigacao: limitar tamanho e priorizar sugestoes high impact)
- **Inconsistencia entre providers:** Diferentes LLMs podem gerar resultados com qualidade variavel (mitigacao: Zod validation garante formato)

## Definition of Done
- [ ] Edge Function `/optimize` deployada no Supabase e respondendo via POST
- [ ] Input validado com Zod (JSON + sugestoes obrigatorios)
- [ ] Output validado com mesmo Zod schema da json-render spec
- [ ] Cascata de providers funcionando (reutilizando modulo compartilhado com 3.1)
- [ ] Header `X-AI-Provider` retornado em todas as respostas
- [ ] JSON otimizado renderiza sem erros no json-render
- [ ] Testes manuais com pelo menos 3 JSONs distintos
- [ ] Error handling: 400 para input invalido, 503 para falha total de providers
- [ ] Code review aprovado

## Estimate: 5

## File List
(preenchido durante dev)
