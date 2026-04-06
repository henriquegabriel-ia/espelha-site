// ai-client.ts — Node.js port of Supabase Edge Functions ai-cascade + ai-client
//
// Cascata de prioridade: headers BYO → env ANTHROPIC → env OPENAI → env GOOGLE
// Chamadas via fetch nativo do Node.js (sem SDK).

export type ProviderName = "openai" | "anthropic" | "gemini";
export type ProviderType = "byo" | "server-default";

export interface ResolvedProvider {
  type: ProviderType;
  provider: ProviderName;
  apiKey: string;
  model: string;
}

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
 * Recebe headers do Express (Record<string, string | string[] | undefined>).
 */
export function resolveProvider(headers: Record<string, string | string[] | undefined>): ResolvedProvider {
  // 1. Check BYO key (user envia sua propria chave)
  const userKey = headers["x-api-key"] as string | undefined;
  const userProvider = headers["x-provider"] as ProviderName | undefined;

  if (userKey && userProvider) {
    if (!DEFAULT_MODELS[userProvider]) {
      throw new Error(
        `INVALID_PROVIDER: Provider "${userProvider}" nao e suportado. Use: openai, anthropic ou gemini.`,
      );
    }
    return {
      type: "byo",
      provider: userProvider,
      apiKey: userKey,
      model: getDefaultModel(userProvider),
    };
  }

  // 2. Check server-side default keys (ordem: Anthropic → OpenAI → Gemini)
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    return {
      type: "server-default",
      provider: "anthropic",
      apiKey: anthropicKey,
      model: "claude-haiku-4-5",
    };
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    return {
      type: "server-default",
      provider: "openai",
      apiKey: openaiKey,
      model: "gpt-4o-mini",
    };
  }

  const googleKey = process.env.GOOGLE_API_KEY;
  if (googleKey) {
    return {
      type: "server-default",
      provider: "gemini",
      apiKey: googleKey,
      model: "gemini-2.0-flash",
    };
  }

  // Nenhum provider disponivel
  throw new Error(
    "NO_PROVIDER: Nenhum provider de IA disponivel. Configure uma API key ou envie via headers x-api-key e x-provider.",
  );
}

// ---------------------------------------------------------------------------
// LLM Call interfaces
// ---------------------------------------------------------------------------

export interface LLMCallOptions {
  provider: ResolvedProvider;
  systemPrompt: string;
  userPrompt: string;
  jsonMode?: boolean;
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface LLMResponse {
  content: string;
  provider: string;
  model: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
}

/**
 * Chama o LLM correto baseado no provider resolvido.
 */
export async function callLLM(options: LLMCallOptions): Promise<LLMResponse> {
  const { provider, systemPrompt, userPrompt, jsonMode = false, maxTokens = 4096, signal } = options;

  switch (provider.provider) {
    case "openai":
      return callOpenAI(provider, systemPrompt, userPrompt, jsonMode, maxTokens, signal);
    case "anthropic":
      return callAnthropic(provider, systemPrompt, userPrompt, jsonMode, maxTokens, signal);
    case "gemini":
      return callGemini(provider, systemPrompt, userPrompt, jsonMode, maxTokens, signal);
    default:
      throw new Error(`Provider "${provider.provider}" nao suportado.`);
  }
}

// ---------------------------------------------------------------------------
// OpenAI
// ---------------------------------------------------------------------------
async function callOpenAI(
  provider: ResolvedProvider,
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean,
  maxTokens: number,
  signal?: AbortSignal,
): Promise<LLMResponse> {
  const body: Record<string, unknown> = {
    model: provider.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: maxTokens,
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify(body),
    ...(signal && { signal }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${error}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0];

  return {
    content: choice?.message?.content ?? "",
    provider: "openai",
    model: provider.model,
    usage: {
      inputTokens: data.usage?.prompt_tokens,
      outputTokens: data.usage?.completion_tokens,
    },
  };
}

// ---------------------------------------------------------------------------
// Anthropic
// ---------------------------------------------------------------------------
async function callAnthropic(
  provider: ResolvedProvider,
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean,
  maxTokens: number,
  signal?: AbortSignal,
): Promise<LLMResponse> {
  const effectiveSystem = jsonMode
    ? `${systemPrompt}\n\nIMPORTANT: You MUST respond with valid JSON only. No markdown, no explanation — just the JSON object.`
    : systemPrompt;

  const body = {
    model: provider.model,
    max_tokens: maxTokens,
    system: effectiveSystem,
    messages: [{ role: "user", content: userPrompt }],
  };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": provider.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
    ...(signal && { signal }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${error}`);
  }

  const data = await res.json();
  const textBlock = data.content?.find(
    (block: { type: string }) => block.type === "text",
  );

  return {
    content: textBlock?.text ?? "",
    provider: "anthropic",
    model: provider.model,
    usage: {
      inputTokens: data.usage?.input_tokens,
      outputTokens: data.usage?.output_tokens,
    },
  };
}

// ---------------------------------------------------------------------------
// Gemini
// ---------------------------------------------------------------------------
async function callGemini(
  provider: ResolvedProvider,
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean,
  maxTokens: number,
  signal?: AbortSignal,
): Promise<LLMResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent`;

  const body: Record<string, unknown> = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      maxOutputTokens: maxTokens,
      ...(jsonMode && { responseMimeType: "application/json" }),
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": provider.apiKey,
    },
    body: JSON.stringify(body),
    ...(signal && { signal }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${error}`);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text ?? "";

  return {
    content: text,
    provider: "gemini",
    model: provider.model,
    usage: {
      inputTokens: data.usageMetadata?.promptTokenCount,
      outputTokens: data.usageMetadata?.candidatesTokenCount,
    },
  };
}
