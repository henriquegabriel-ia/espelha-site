# Story 4.8: Loading states e error handling

## Status: Ready

## Descricao
Implementar os estados de loading (skeletons) e tratamento de erros (toasts) em toda a aplicacao. Inclui skeleton loading para o JSON viewer e relatorio de analise, toasts de erro com mensagens contextuais e retry, e empty state para quando nenhuma URL foi espelhada. Esses estados garantem que o usuario sempre tenha feedback visual claro sobre o que esta acontecendo.

## Acceptance Criteria
- [ ] Given o JSON esta carregando, When o usuario visualiza a area do viewer, Then deve ver um skeleton loading que simula a estrutura do JSON (linhas de codigo)
- [ ] Given a analise esta carregando, When o usuario visualiza a area do relatorio, Then deve ver um skeleton loading que simula cards de analise
- [ ] Given a URL digitada e invalida, When o usuario clica "Espelhar", Then deve ver um toast de erro "URL invalida. Verifique o formato e tente novamente."
- [ ] Given o site alvo esta inacessivel, When o scraping falha, Then deve ver um toast de erro "Site inacessivel. Verifique se a URL esta correta e o site esta online."
- [ ] Given a chamada de IA falhou, When o erro retorna, Then deve ver um toast de erro "Falha na analise. Verifique sua API key ou tente novamente." com botao Retry
- [ ] Given o rate limit foi atingido, When o erro retorna, Then deve ver um toast de erro "Limite de requisicoes atingido. Aguarde alguns minutos."
- [ ] Given todos os toasts de erro, When exibidos, Then devem ter botao de Retry que re-executa a acao que falhou
- [ ] Given nenhuma URL foi espelhada ainda, When o usuario esta na pagina de resultados, Then deve ver um empty state com ilustracao e mensagem "Cole uma URL acima para comecar"

## Scope
### IN
- Componente JsonViewerSkeleton: skeleton simulando linhas de codigo
- Componente AnalysisReportSkeleton: skeleton simulando cards
- Sistema de toast para erros com mensagens contextuais
- Botao Retry nos toasts que re-executa a acao original
- Componente EmptyState para area de resultados
- Mapeamento de codigos de erro para mensagens user-friendly

### OUT
- Logging de erros para servico externo (Sentry, etc.)
- Retry automatico com backoff exponencial
- Modo offline / cache de resultados anteriores
- Notificacoes push ou por email

## Technical Notes
- Usar shadcn/ui Skeleton component para loading states
- JsonViewerSkeleton: ~15 linhas de skeleton com larguras variadas simulando indentacao JSON
- AnalysisReportSkeleton: 3 secoes com 2-3 card skeletons cada
- Usar shadcn/ui Toast (via sonner) para notificacoes de erro
- Mapeamento de erros:
  ```ts
  const ERROR_MESSAGES: Record<string, string> = {
    'INVALID_URL': 'URL invalida. Verifique o formato e tente novamente.',
    'SITE_UNREACHABLE': 'Site inacessivel. Verifique se a URL esta correta.',
    'AI_FAILED': 'Falha na analise. Verifique sua API key ou tente novamente.',
    'RATE_LIMIT': 'Limite de requisicoes atingido. Aguarde alguns minutos.',
    'UNKNOWN': 'Erro inesperado. Tente novamente.',
  };
  ```
- Retry: passar callback da acao original para o toast via closure
- Empty state: usar icone Search ou FileQuestion com texto e CTA apontando para o input
- Skeletons devem respeitar dark/light mode (cores zinc)
- Considerar hook `useAsyncAction` que encapsula loading + error + retry

## Dependencies
- Story 4.1 (layout base)
- Story 4.3 (JSON viewer - para saber a forma do skeleton)
- Story 4.5 (relatorio de analise - para saber a forma do skeleton)
- shadcn/ui Skeleton e Toast components

## Risks
- **Mensagens de erro genericas:** Erros nao mapeados podem mostrar mensagens tecnicas ao usuario (mitigacao: fallback para mensagem generica amigavel "Erro inesperado")
- **Toast overflow:** Muitos erros simultaneos podem poluir a UI com toasts empilhados (mitigacao: limitar toasts visiveis, auto-dismiss)

## Definition of Done
- [ ] JsonViewerSkeleton renderiza com linhas simulando codigo
- [ ] AnalysisReportSkeleton renderiza com cards simulados
- [ ] Toasts de erro com mensagens contextuais para cada tipo de erro
- [ ] Botao Retry funcional em todos os toasts de erro
- [ ] EmptyState renderiza quando nenhuma URL foi espelhada
- [ ] Mapeamento de codigos de erro implementado
- [ ] Skeletons respeitam dark/light mode
- [ ] Code review aprovado

## Estimate: 2

## File List
(preenchido durante dev)
