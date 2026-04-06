# Story 1.4: Setup provider IA com cascata BYO -> Lovable AI -> aviso

## Status: Draft

## Descricao
Implementar a logica de selecao de provider de IA nas Edge Functions com sistema de cascata (fallback). A prioridade e: (1) usar a API key propria do usuario se fornecida, (2) usar o Lovable AI built-in se disponivel no ambiente, (3) retornar erro orientando o usuario a fornecer uma API key. Isso garante flexibilidade maxima de deploy e uso.

## Acceptance Criteria
- [ ] Given um request com header `x-ai-api-key: sk-xxx` e `x-ai-provider: openai`, When `resolveProvider()` executa, Then retorna provider OpenAI configurado com a key do usuario
- [ ] Given um request sem API key do usuario mas em ambiente Lovable, When `resolveProvider()` executa, Then retorna provider Lovable AI built-in
- [ ] Given um request sem API key e fora do ambiente Lovable, When `resolveProvider()` executa, Then retorna erro `{ success: false, error: "API key necessaria", code: "NO_AI_PROVIDER" }`
- [ ] Given `resolveProvider()` retornando OpenAI, When chamar `provider.complete(prompt)`, Then a resposta vem da API da OpenAI
- [ ] Given `resolveProvider()` retornando Anthropic, When chamar `provider.complete(prompt)`, Then a resposta vem da API da Anthropic
- [ ] Given providers suportados, When listar, Then inclui: OpenAI (GPT-4o), Anthropic (Claude), Google (Gemini)

## Scope
### IN
- Funcao `resolveProvider()` em `supabase/functions/_shared/ai-provider.ts`
- Interface `AIProvider` com metodo `complete(prompt, options)` padronizado
- Implementacao para OpenAI (via `npm:openai`)
- Implementacao para Anthropic (via `npm:@anthropic-ai/sdk`)
- Implementacao para Google Gemini (via REST API ou SDK)
- Deteccao de ambiente Lovable AI (variavel de ambiente ou endpoint disponivel)
- Tratamento do cenario sem provider (erro claro com instrucoes)
- Headers customizados: `x-ai-provider`, `x-ai-api-key`, `x-ai-model` (opcional)

### OUT
- UI para input de API key no frontend (story futura)
- Persistencia de API keys (serao enviadas por request, nao armazenadas)
- Streaming de responses (pode ser adicionado depois)
- Fine-tuning ou configuracoes avancadas de modelo
- Metricas de uso por provider

## Technical Notes
- A cascata deve ser deterministica: BYO key > Lovable AI > erro
- Para detectar Lovable AI: verificar `Deno.env.get('LOVABLE_AI_ENDPOINT')` ou similar (confirmar com docs do Lovable)
- Interface `AIProvider`:
  ```typescript
  interface AIProvider {
    name: string;
    complete(prompt: string, options?: CompletionOptions): Promise<CompletionResult>;
  }
  interface CompletionOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }
  interface CompletionResult {
    content: string;
    model: string;
    provider: string;
    usage?: { promptTokens: number; completionTokens: number };
  }
  ```
- API keys do usuario NUNCA sao logadas ou persistidas — somente usadas no request atual
- Cada provider deve ter seu proprio wrapper para normalizar a interface de response
- Considerar timeout de 60s para chamadas de IA (modelos grandes podem demorar)
- Para testes, criar um `MockProvider` que retorna respostas fixas

## Dependencies
- Story 1.2 (estrutura das Edge Functions e `_shared/` precisa existir)

## Estimate: 3 pontos

## File List
(preenchido durante dev)
