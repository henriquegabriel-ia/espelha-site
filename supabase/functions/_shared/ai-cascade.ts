// ai-cascade.ts — Cascata de prioridade de providers IA
//
// Ordem de resolução:
// 1. BYO Key (enviada pelo user no header x-api-key + x-provider)
// 2. Lovable AI (detectar via env var LOVABLE_AI_ENABLED)
// 3. Default keys nos Secrets (OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_API_KEY)
// 4. Nenhum → erro

export type ProviderName = "openai" | "anthropic" | "gemini";
export type ProviderType = "byo" | "lovable-ai" | "server-default";

export interface ResolvedProvider {
  type: ProviderType;
  provider: ProviderName;
  apiKey: string;
  model: string;
}

// Modelos default por provider (cost-effective para scraping)
const DEFAULT_MODELS: Record<ProviderName, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-haiku-4-5",
  gemini: "gemini-2.0-flash",
};

export function getDefaultModel(provider: ProviderName): string {
  return DEFAULT_MODELS[provider];
}

/**
 * Resolve qual provider de IA usar, seguindo a cascata de prioridade.
 * Lança erro se nenhum provider estiver disponível.
 */
export function resolveProvider(headers: Headers): ResolvedProvider {
  // 1. Check BYO key (user envia sua própria chave)
  const userKey = headers.get("x-api-key");
  const userProvider = headers.get("x-provider") as ProviderName | null;

  if (userKey && userProvider) {
    if (!DEFAULT_MODELS[userProvider]) {
      throw new Error(
        `INVALID_PROVIDER: Provider "${userProvider}" não é suportado. Use: openai, anthropic ou gemini.`,
      );
    }
    return {
      type: "byo",
      provider: userProvider,
      apiKey: userKey,
      model: getDefaultModel(userProvider),
    };
  }

  // 2. Check Lovable AI (managed hosting)
  if (Deno.env.get("LOVABLE_AI_ENABLED") === "true") {
    return {
      type: "lovable-ai",
      provider: "openai",
      apiKey: "lovable-managed",
      model: "lovable-ai",
    };
  }

  // 3. Check server-side default keys (ordem: OpenAI → Anthropic → Gemini)
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (openaiKey) {
    return {
      type: "server-default",
      provider: "openai",
      apiKey: openaiKey,
      model: "gpt-4o-mini",
    };
  }

  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (anthropicKey) {
    return {
      type: "server-default",
      provider: "anthropic",
      apiKey: anthropicKey,
      model: "claude-haiku-4-5",
    };
  }

  const googleKey = Deno.env.get("GOOGLE_API_KEY");
  if (googleKey) {
    return {
      type: "server-default",
      provider: "gemini",
      apiKey: googleKey,
      model: "gemini-2.0-flash",
    };
  }

  // 4. Nenhum provider disponível
  throw new Error(
    "NO_PROVIDER: Nenhum provider de IA disponível. Configure uma API key ou envie via headers x-api-key e x-provider.",
  );
}
