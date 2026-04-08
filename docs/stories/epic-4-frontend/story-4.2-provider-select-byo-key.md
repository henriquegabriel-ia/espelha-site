# Story 4.2: Provider select + BYO key input + banner

## Status: Ready

## Descricao
Implementar o sistema de selecao de provider de IA e input de API key propria (BYO - Bring Your Own). O usuario pode escolher entre OpenAI, Anthropic ou Gemini, inserir sua API key que sera salva no localStorage, e ver um banner informativo mostrando qual provider esta ativo. Isso permite que o usuario use sua propria key para ter mais controle sobre as chamadas de IA.

## Acceptance Criteria
- [ ] Given o usuario acessa a area de configuracao, When visualiza o ProviderSelect, Then deve ver um dropdown com opcoes: OpenAI, Anthropic, Gemini
- [ ] Given o usuario selecionou um provider, When visualiza o ApiKeyInput, Then deve ver um campo password para inserir a API key com botao toggle de visibilidade
- [ ] Given o usuario inseriu uma API key, When clica fora do campo ou confirma, Then a key deve ser salva no localStorage de forma segura
- [ ] Given o usuario tem uma API key salva, When visualiza o AiProviderBanner, Then deve ver "Usando {provider} (sua API key)"
- [ ] Given o usuario nao tem API key mas o Lovable AI esta disponivel, When visualiza o banner, Then deve ver "Usando Lovable AI (conecte uma API key para mais controle)"
- [ ] Given nenhum provider esta configurado, When visualiza o banner, Then deve ver "Conecte uma API key para comecar"
- [ ] Given o usuario troca de provider, When seleciona outro no dropdown, Then o banner atualiza imediatamente e a key do provider anterior permanece salva

## Scope
### IN
- Componente ProviderSelect: dropdown com 3 opcoes de provider
- Componente ApiKeyInput: input password com toggle visibility
- Componente AiProviderBanner: banner contextual com status do provider
- Hook useProvider: gerencia estado do provider selecionado, API keys e persistencia localStorage
- Validacao basica de formato de API key por provider

### OUT
- Validacao de API key contra a API real (chamada de teste)
- Encriptacao da key no localStorage (fora do escopo MVP)
- Suporte a multiplas keys por provider
- Configuracoes avancadas de provider (modelo, temperatura, etc.)

## Technical Notes
- localStorage keys: `clonador_provider`, `clonador_key_openai`, `clonador_key_anthropic`, `clonador_key_gemini`
- Hook useProvider deve expor: `{ provider, setProvider, apiKey, setApiKey, isConfigured, providerLabel }`
- Usar shadcn/ui Select para dropdown, Input para key, Alert/Banner para status
- API key masks: mostrar apenas ultimos 4 chars quando salva (sk-...xxxx)
- Banner deve usar cores semanticas: green se configurado, yellow se Lovable AI, zinc/muted se nenhum
- Considerar React Context para compartilhar estado do provider globalmente

## Dependencies
- Story 4.1 (landing page com layout base)
- shadcn/ui Select, Input, Alert components

## Risks
- **Seguranca da API key:** Armazenar em localStorage pode ser vulneravel a XSS (mitigacao: sanitizar inputs, CSP headers; aceito como trade-off do MVP per CON-05)
- **UX de configuracao:** Usuario pode nao entender o conceito de BYO key (mitigacao: banner informativo claro)
- **Persistencia de keys:** Limpar localStorage perde todas as keys (mitigacao: documentar no UI que keys ficam no browser)

## Definition of Done
- [ ] ProviderSelect renderiza dropdown com 3 opcoes
- [ ] ApiKeyInput salva key no localStorage ao confirmar
- [ ] AiProviderBanner mostra status correto para cada cenario (BYO, Lovable AI, nenhum)
- [ ] Hook useProvider expoe estado completo do provider
- [ ] Troca de provider atualiza banner imediatamente
- [ ] Keys persistidas entre reloads da pagina
- [ ] Mascara de key funcional (sk-...xxxx)
- [ ] Code review aprovado

## Estimate: 3

## File List
(preenchido durante dev)
