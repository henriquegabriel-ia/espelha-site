// ai-client.ts — Wrapper genérico para chamadas LLM
//
// Usa fetch direto (Deno) — não precisa de SDK.
// Suporta OpenAI, Anthropic e Gemini.

import { type ResolvedProvider } from "./ai-cascade.ts";

export interface LLMCallOptions {
  provider: ResolvedProvider;
  systemPrompt: string;
  userPrompt: string;
  jsonMode?: boolean;
  maxTokens?: number;
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
 * Retorna o texto de resposta do modelo.
 */
export async function callLLM(options: LLMCallOptions): Promise<LLMResponse> {
  const { provider, systemPrompt, userPrompt, jsonMode = false, maxTokens = 4096 } = options;

  switch (provider.provider) {
    case "openai":
      return callOpenAI(provider, systemPrompt, userPrompt, jsonMode, maxTokens);
    case "anthropic":
      return callAnthropic(provider, systemPrompt, userPrompt, jsonMode, maxTokens);
    case "gemini":
      return callGemini(provider, systemPrompt, userPrompt, jsonMode, maxTokens);
    default:
      throw new Error(`Provider "${provider.provider}" não suportado.`);
  }
}

// ---------------------------------------------------------------------------
// OpenAI — POST https://api.openai.com/v1/chat/completions
// ---------------------------------------------------------------------------
async function callOpenAI(
  provider: ResolvedProvider,
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean,
  maxTokens: number,
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
// Anthropic — POST https://api.anthropic.com/v1/messages
// ---------------------------------------------------------------------------
async function callAnthropic(
  provider: ResolvedProvider,
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean,
  maxTokens: number,
): Promise<LLMResponse> {
  // Anthropic não tem jsonMode nativo — instruímos via system prompt
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
// Gemini — POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
// ---------------------------------------------------------------------------
async function callGemini(
  provider: ResolvedProvider,
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean,
  maxTokens: number,
): Promise<LLMResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent?key=${provider.apiKey}`;

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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
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
