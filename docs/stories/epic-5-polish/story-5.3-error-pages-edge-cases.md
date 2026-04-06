# Story 5.3: Error pages e edge cases

## Status: InProgress

## Descricao
Tratar todos os cenarios de erro e edge cases que podem ocorrer durante o fluxo de espelhamento. O usuario deve sempre receber feedback claro e acionavel quando algo da errado, seja na entrada de dados, no scraping ou na analise por IA. Erros silenciosos ou mensagens genericas prejudicam a experiencia.

## Acceptance Criteria
- [x] Given uma URL com caracteres especiais (acentos, espacos, unicode), When submetida, Then deve ser sanitizada/encodada corretamente ou exibir mensagem de erro clara
- [ ] Given uma URL que retorna HTTP 403, When o scraping falha, Then o usuario deve ver mensagem: "O site bloqueou o acesso. Tente outra URL ou verifique se o site permite acesso publico."
- [ ] Given uma URL que retorna HTTP 404, When o scraping falha, Then o usuario deve ver mensagem: "Pagina nao encontrada. Verifique se a URL esta correta."
- [ ] Given uma URL que retorna HTTP 500, When o scraping falha, Then o usuario deve ver mensagem: "O servidor do site esta com problemas. Tente novamente mais tarde."
- [x] Given um scraping que excede 30 segundos, When o timeout e atingido, Then o usuario deve ver mensagem: "O site demorou muito para responder. Tente uma pagina mais simples ou tente novamente."
- [x] Given uma analise de IA que excede 60 segundos, When o timeout e atingido, Then o usuario deve ver mensagem: "A analise esta demorando mais que o esperado. Tente novamente."
- [x] Given um JSON invalido retornado pela IA, When o parse falha, Then o sistema deve tentar extrair JSON valido da resposta ou exibir mensagem de erro com opcao de retry
- [x] Given qualquer erro, When exibido ao usuario, Then deve incluir uma acao possivel (retry, corrigir URL, etc.)
- [ ] Given uma URL invalida (sem protocolo, formato errado), When submetida, Then o formulario deve validar e exibir erro inline antes de fazer a requisicao

## Scope
### IN
- Validacao de URL no frontend (formato, protocolo, caracteres)
- Tratamento de erros HTTP do scraping (403, 404, 500, outros)
- Tratamento de timeout de scraping (30s)
- Tratamento de timeout de analise IA (60s)
- Tratamento de JSON invalido retornado pela IA (parse error, resposta cortada)
- Mensagens de erro claras, em portugues, com acoes sugeridas
- Componente de erro reutilizavel com icone, mensagem e botao de retry

### OUT
- Pagina 404 do proprio site (SPA — nao aplicavel)
- Retry automatico (usuario deve clicar para tentar novamente)
- Log de erros em servico externo (Sentry, etc.)
- Tratamento de erros de rede do lado do cliente (offline)

## Technical Notes
- Criar um mapeamento de codigos HTTP para mensagens amigaveis
- Usar `AbortController` com `setTimeout` para implementar timeouts no fetch
- Para JSON invalido da IA: tentar regex para extrair bloco JSON da resposta antes de falhar
- Componente de erro sugerido: `ErrorMessage` com props `title`, `message`, `onRetry`
- Considerar usar toast/notification para erros nao-bloqueantes e inline error para erros de validacao
- Testar edge cases com URLs como: `https://httpstat.us/403`, `https://httpstat.us/500`, URLs com unicode

## Business Value
- Erros claros e acionaveis reduzem frustacao do usuario e abandono
- Mensagens em portugues melhoram experiencia para publico brasileiro
- Retry explicito da controle ao usuario, aumentando confianca no produto
- Tratamento robusto de edge cases previne "tela branca" que destruiria credibilidade

## Risks
| Risco | Probabilidade | Impacto | Mitigacao |
|-------|--------------|---------|-----------|
| Mensagens de erro ficarem desatualizadas se API do Firecrawl mudar codigos | Baixa | Medio | Usar fallback generico para codigos nao mapeados |
| Timeout values (30s/60s) nao serem adequados para todos os sites | Media | Medio | Tornar timeouts configuraveis ou ajustar baseado em testes da story 5.4 |
| JSON invalido da IA ser irrecuperavel mesmo com regex | Media | Alto | Implementar retry automatico com temperatura mais baixa como fallback |
| Erros de rede do cliente (offline) nao tratados | Baixa | Medio | Marcado como OUT of scope; pode virar story futura se necessario |

## Dependencies
- Story 3.x (fluxo de analise IA) deve estar implementada
- Story 2.x (scraping) deve estar implementada

## Estimate: 2

## Definition of Done
- [ ] Todos os ACs verificados e passando
- [ ] Componente ErrorMessage reutilizavel criado e documentado
- [x] Todas as mensagens de erro em portugues
- [ ] Testado com URLs de httpstat.us (403, 404, 500)
- [ ] Code review aprovado

## File List
- `supabase/functions/_shared/ai-client.ts` — Added `signal?: AbortSignal` support to LLMCallOptions and all provider fetch calls
- `supabase/functions/scrape/index.ts` — Added rate limiting (3s per IP), URL normalization via `new URL().href`, improved PT-BR error messages
- `supabase/functions/convert/index.ts` — Added AbortController 60s timeout, truncated JSON recovery, PT-BR error messages
- `supabase/functions/analyze/index.ts` — Added AbortController 60s timeout, truncated JSON recovery, PT-BR error messages
- `supabase/functions/optimize/index.ts` — Added AbortController 60s timeout, truncated JSON recovery, PT-BR error messages
