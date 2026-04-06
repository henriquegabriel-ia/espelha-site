import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { resolveProvider } from "../_shared/ai-cascade.ts";
import { callLLM } from "../_shared/ai-client.ts";

const SYSTEM_PROMPT = `Você é um analista especialista em websites. Analise o site convertido em JSON e gere um relatório detalhado.

Avalie nas 4 dimensões:
1. Design/UI: cores, espaçamento, hierarquia visual, acessibilidade, consistência
2. SEO: meta tags, headings hierarchy, structured data, performance indicators
3. Conteúdo: clareza dos textos, CTAs, copywriting, tom de voz
4. Estrutura Técnica: semântica HTML, uso de componentes, responsividade, boas práticas

Retorne APENAS um JSON válido (sem markdown) com esta estrutura:
{
  "positives": ["string descrevendo ponto positivo", ...],
  "negatives": ["string descrevendo ponto negativo", ...],
  "suggestions": [
    {
      "category": "design" | "seo" | "content" | "structure",
      "description": "descrição da sugestão",
      "impact": "high" | "medium" | "low"
    },
    ...
  ]
}

Seja específico e acionável nas sugestões. Limite a 5-8 positivos, 5-8 negativos, e 8-12 sugestões.`;

interface Suggestion {
  category: "design" | "seo" | "content" | "structure";
  description: string;
  impact: "high" | "medium" | "low";
}

interface AnalysisReport {
  positives: string[];
  negatives: string[];
  suggestions: Suggestion[];
}

function validateReport(data: unknown): data is AnalysisReport {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.positives) || !obj.positives.every((p: unknown) => typeof p === "string")) return false;
  if (!Array.isArray(obj.negatives) || !obj.negatives.every((n: unknown) => typeof n === "string")) return false;
  if (!Array.isArray(obj.suggestions)) return false;

  const validCategories = ["design", "seo", "content", "structure"];
  const validImpacts = ["high", "medium", "low"];

  for (const s of obj.suggestions) {
    if (!s || typeof s !== "object") return false;
    const sug = s as Record<string, unknown>;
    if (typeof sug.description !== "string") return false;
    if (!validCategories.includes(sug.category as string)) return false;
    if (!validImpacts.includes(sug.impact as string)) return false;
  }

  return true;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

  try {
    // 1. Validate request method and body
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed. Use POST." }),
        { status: 400, headers: jsonHeaders },
      );
    }

    let body: { jsonRender?: unknown; originalUrl?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body." }),
        { status: 400, headers: jsonHeaders },
      );
    }

    const { jsonRender, originalUrl } = body;

    if (!jsonRender || typeof jsonRender !== "object") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'jsonRender' in request body." }),
        { status: 400, headers: jsonHeaders },
      );
    }

    if (!originalUrl || typeof originalUrl !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'originalUrl' in request body." }),
        { status: 400, headers: jsonHeaders },
      );
    }

    // 2. Resolve AI provider
    let provider;
    try {
      provider = resolveProvider(req.headers);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to resolve AI provider.";
      return new Response(
        JSON.stringify({ error: message }),
        { status: 400, headers: jsonHeaders },
      );
    }

    // 3. Build user prompt
    const userPrompt = `URL original: ${originalUrl}\n\nJSON do site:\n${JSON.stringify(jsonRender)}`;

    // 4. Call LLM
    let llmResponse;
    try {
      llmResponse = await callLLM({
        provider,
        systemPrompt: SYSTEM_PROMPT,
        userPrompt,
        jsonMode: true,
        maxTokens: 4096,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "LLM call failed.";
      return new Response(
        JSON.stringify({ error: `AI provider error: ${message}` }),
        { status: 502, headers: jsonHeaders },
      );
    }

    // 5. Parse and validate response
    let report: unknown;
    try {
      report = JSON.parse(llmResponse.content);
    } catch {
      return new Response(
        JSON.stringify({ error: "AI returned invalid JSON.", raw: llmResponse.content }),
        { status: 502, headers: jsonHeaders },
      );
    }

    if (!validateReport(report)) {
      return new Response(
        JSON.stringify({
          error: "AI response does not match expected schema (positives, negatives, suggestions).",
          raw: report,
        }),
        { status: 502, headers: jsonHeaders },
      );
    }

    // 6. Return validated report
    return new Response(
      JSON.stringify({
        report,
        meta: {
          provider: llmResponse.provider,
          model: llmResponse.model,
          usage: llmResponse.usage,
        },
      }),
      { status: 200, headers: jsonHeaders },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error.";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: jsonHeaders },
    );
  }
});
