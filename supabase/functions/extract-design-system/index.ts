import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { getCorsHeaders, corsHeaders } from "../_shared/cors.ts";
import { resolveProvider } from "../_shared/ai-cascade.ts";
import { callLLM } from "../_shared/ai-client.ts";

const SYSTEM_PROMPT = `Você é um especialista em Design Systems. Analise o conteúdo do site fornecido e extraia os Design Tokens (paleta de cores, tipografia, espaçamentos).

Retorne APENAS JSON válido com esta estrutura:
{
  "colors": [
    { "name": "Primary", "hex": "#...", "rgb": "rgb(...)", "usage": "descrição" },
    ...
  ],
  "typography": [
    { "name": "Heading 1", "fontFamily": "...", "fontSize": "...", "fontWeight": "...", "lineHeight": "...", "usage": "descrição" },
    ...
  ],
  "spacing": [
    { "name": "xs", "value": "4px" },
    { "name": "sm", "value": "8px" },
    ...
  ],
  "borderRadius": ["4px", "8px", "16px"],
  "shadows": ["0 1px 3px rgba(0,0,0,0.1)", ...],
  "cssVariables": { "--primary": "#...", ... }
}

Extraia entre 6-12 cores, 4-8 tipografias, 4-6 espaçamentos.
Identifique padrões visuais do site: se é dark theme, se usa gradientes, se é minimalista, etc.
Para cores, inclua sempre: primary, secondary, background, surface, text-primary, text-secondary, accent, border.
Se não conseguir identificar um token específico, faça sua melhor estimativa baseada no conteúdo.`;

interface ScrapedData {
  url?: string;
  title: string;
  description?: string;
  textContent: string;
  metadata?: Record<string, unknown>;
  headings?: Array<{ level: number; text: string }>;
  links?: Array<{ href: string; text: string }>;
  images?: Array<{ src: string; alt: string }>;
}

function buildDesignSystemUserPrompt(data: ScrapedData): string {
  const parts: string[] = [];

  parts.push(`# Website: ${data.title}`);
  if (data.description) parts.push(`Description: ${data.description}`);
  if (data.url) parts.push(`URL: ${data.url}`);

  if (data.metadata && Object.keys(data.metadata).length > 0) {
    parts.push(`\n## Metadata\n${JSON.stringify(data.metadata, null, 2)}`);
  }

  if (data.headings && data.headings.length > 0) {
    parts.push("\n## Headings");
    for (const h of data.headings) {
      parts.push(`${"#".repeat(h.level)} ${h.text}`);
    }
  }

  if (data.textContent) {
    const maxChars = 12_000;
    const text =
      data.textContent.length > maxChars
        ? data.textContent.slice(0, maxChars) + "\n... [truncated]"
        : data.textContent;
    parts.push(`\n## Page Text Content\n${text}`);
  }

  parts.push(
    "\n---\nAnalise o conteúdo acima e extraia os Design Tokens do site. Retorne APENAS o JSON.",
  );

  return parts.join("\n");
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
        JSON.stringify({ error: "Método não permitido. Use POST." }),
        { status: 405, headers: jsonHeaders },
      );
    }

    let body: { scrapedData?: ScrapedData };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Body inválido: JSON esperado com { scrapedData }." }),
        { status: 400, headers: jsonHeaders },
      );
    }

    const scrapedData = body.scrapedData;

    if (!scrapedData || typeof scrapedData.title !== "string" || typeof scrapedData.textContent !== "string") {
      return new Response(
        JSON.stringify({
          error: "Dados de scraping ausentes ou inválidos. Campos obrigatórios: title (string), textContent (string).",
        }),
        { status: 400, headers: jsonHeaders },
      );
    }

    // 2. Resolve AI provider
    let provider;
    try {
      provider = resolveProvider(req.headers);
    } catch {
      return new Response(
        JSON.stringify({ error: "Nenhum provider de IA disponível. Configure uma API key." }),
        { status: 400, headers: jsonHeaders },
      );
    }

    // 3. Build user prompt
    const userPrompt = buildDesignSystemUserPrompt(scrapedData);

    // 4. Call LLM with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    let llmResponse;
    try {
      llmResponse = await callLLM({
        provider,
        systemPrompt: SYSTEM_PROMPT,
        userPrompt,
        jsonMode: true,
        maxTokens: 4096,
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof DOMException && err.name === "AbortError") {
        return new Response(
          JSON.stringify({ error: "Tempo limite excedido. O site pode ser muito grande ou lento." }),
          { status: 504, headers: jsonHeaders },
        );
      }
      console.error("LLM call failed:", err);
      return new Response(
        JSON.stringify({ error: "Erro na extração de design tokens. Tente novamente." }),
        { status: 502, headers: jsonHeaders },
      );
    } finally {
      clearTimeout(timeout);
    }

    // 5. Parse and validate response
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(llmResponse.content);
    } catch {
      const partialMatch = llmResponse.content.match(/\{[\s\S]*\}/);
      if (partialMatch) {
        try {
          parsed = JSON.parse(partialMatch[0]);
        } catch {
          return new Response(
            JSON.stringify({ error: "A resposta da IA foi truncada. Tente novamente ou use um modelo com mais capacidade." }),
            { status: 502, headers: jsonHeaders },
          );
        }
      } else {
        return new Response(
          JSON.stringify({ error: "A resposta da IA foi truncada. Tente novamente ou use um modelo com mais capacidade." }),
          { status: 502, headers: jsonHeaders },
        );
      }
    }

    if (!Array.isArray(parsed!.colors) || !Array.isArray(parsed!.typography) || !Array.isArray(parsed!.spacing)) {
      return new Response(
        JSON.stringify({
          error: "A resposta da IA não corresponde ao formato esperado (colors, typography, spacing). Tente novamente.",
        }),
        { status: 502, headers: jsonHeaders },
      );
    }

    // 6. Return design system
    return new Response(
      JSON.stringify({
        ...parsed,
        meta: {
          provider: llmResponse.provider,
          model: llmResponse.model,
          usage: llmResponse.usage,
          extractedAt: new Date().toISOString(),
        },
      }),
      { status: 200, headers: jsonHeaders },
    );
  } catch (error) {
    console.error("Unhandled error in /extract-design-system:", error);
    const message = error instanceof Error ? error.message : "Erro interno desconhecido.";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: jsonHeaders },
    );
  }
});
