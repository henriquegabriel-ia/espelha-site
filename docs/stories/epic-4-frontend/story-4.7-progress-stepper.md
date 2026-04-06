# Story 4.7: Progress stepper

## Status: Ready

## Descricao
Criar o componente ProgressStepper que mostra o progresso do fluxo de espelhamento em 3 etapas: Scraping, Convertendo e Analisando. Cada step tem indicador visual de estado (ativo, completo, pendente) com animacao de transicao. O stepper da feedback claro ao usuario sobre o que esta acontecendo enquanto aguarda o resultado.

## Acceptance Criteria
- [ ] Given o processo de espelhamento iniciou, When o usuario visualiza o ProgressStepper, Then deve ver 3 steps: "Scraping", "Convertendo", "Analisando"
- [ ] Given o step atual e "Scraping", When o usuario observa, Then o step 1 deve estar no estado "ativo" (highlight), steps 2 e 3 no estado "pendente" (dimmed)
- [ ] Given o step "Scraping" completou, When transita para "Convertendo", Then o step 1 deve mudar para "completo" (check icon) e step 2 para "ativo" com animacao de transicao
- [ ] Given todos os steps completaram, When o usuario observa, Then todos os 3 steps devem estar no estado "completo" com icone de check
- [ ] Given o stepper esta visivel, When as transicoes ocorrem, Then deve haver animacao suave (fade/scale) entre estados
- [ ] Given o processo nao iniciou ainda, When o usuario observa, Then o stepper nao deve estar visivel ou deve estar em estado inicial neutro

## Scope
### IN
- Componente ProgressStepper com 3 steps fixos
- Estados visuais: pending (cinza), active (azul com pulse/glow), completed (verde com check)
- Linhas de conexao entre steps que preenchem conforme progresso
- Animacao de transicao entre estados (CSS transitions)
- Labels descritivos abaixo de cada step
- Icone contextual por step: Globe (scraping), Code (convertendo), Brain (analisando)

### OUT
- Steps dinamicos ou configuraveis
- Estimativa de tempo por step
- Log detalhado de sub-steps
- Cancelamento do processo via stepper

## Technical Notes
- Componente controlado via prop `currentStep: 0 | 1 | 2 | 3` (0 = nao iniciado, 3 = todos completos)
- CSS transitions para mudanca de estado: `transition-all duration-300`
- Step ativo: ring azul com `animate-pulse` sutil
- Step completo: background verde com icone CheckCircle
- Step pendente: background zinc-700/zinc-300 com icone em cinza
- Linhas de conexao: div horizontal entre circles, background transition de cinza para azul/verde
- Icones Lucide: Globe, Code2, Brain, CheckCircle
- Layout horizontal em desktop, pode ser vertical em mobile
- Considerar aria-labels para acessibilidade: `aria-current="step"`, role="progressbar"

## Dependencies
- Story 4.1 (layout base)
- Fluxo de processamento que emite eventos de progresso (Epic 2/3)

## Risks
- **Sincronia de estado:** Stepper pode ficar dessincronizado com o estado real do processamento (mitigacao: prop controlada via hook use-espelhar)
- **Acessibilidade:** Stepper custom pode nao ser acessivel por screen readers (mitigacao: aria-labels, role progressbar)

## Definition of Done
- [ ] ProgressStepper renderiza 3 steps com icones contextuais
- [ ] Estados visuais: pending, active, completed funcionando
- [ ] Linhas de conexao animam conforme progresso
- [ ] Animacoes de transicao suaves (CSS transitions)
- [ ] Layout horizontal em desktop, adaptado em mobile
- [ ] Aria-labels implementados para acessibilidade
- [ ] Code review aprovado

## Estimate: 2

## File List
(preenchido durante dev)
