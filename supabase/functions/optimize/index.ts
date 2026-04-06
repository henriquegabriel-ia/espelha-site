import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { resolveProvider } from "../_shared/ai-cascade.ts";
import { callLLM } from "../_shared/ai-client.ts";

// ---------------------------------------------------------------------------
// System prompt — optimization specialist + json-render component catalog
// (catalog replicated from /convert)
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `Você é um especialista em otimização de websites. Recebeu um JSON json-render representando um site e uma lista de sugestões de melhoria.

Sua tarefa é gerar uma NOVA versão do JSON json-render com as melhorias aplicadas.

Regras:
- Mantenha a mesma estrutura json-render: { root, elements }
- Cada element tem: type, props, children
- Use APENAS estes componentes:
- Aplique TODAS as sugestões fornecidas
- Mantenha os elementos existentes que não são afetados pelas sugestões
- Retorne APENAS JSON válido, sem markdown

# json-render Component Catalog

Available component types and their props:

## Section
Generic container / section wrapper

| Prop | Type | Required |
| ---- | ---- | -------- |
| title | \`string\` | no |
| id | \`string\` | no |

## Heading
Text heading (h1-h6)

| Prop | Type | Required |
| ---- | ---- | -------- |
| level | \`1 | 2 | 3 | 4 | 5 | 6\` | yes |
| text | \`string\` | yes |

## Paragraph
Block of text

| Prop | Type | Required |
| ---- | ---- | -------- |
| text | \`string\` | yes |

## Image
Image element

| Prop | Type | Required |
| ---- | ---- | -------- |
| src | \`string\` | yes |
| alt | \`string\` | yes |
| width | \`number\` | no |
| height | \`number\` | no |

## Link
Anchor / hyperlink

| Prop | Type | Required |
| ---- | ---- | -------- |
| href | \`string\` | yes |
| text | \`string\` | yes |
| external | \`boolean\` | no |

## Card
Content card with title, description, and optional image

| Prop | Type | Required |
| ---- | ---- | -------- |
| title | \`string\` | yes |
| description | \`string\` | yes |
| image | \`string\` | no |

## List
Ordered or unordered list

| Prop | Type | Required |
| ---- | ---- | -------- |
| items | \`string[]\` | yes |
| ordered | \`boolean\` | yes |

## Table
Data table with headers and rows

| Prop | Type | Required |
| ---- | ---- | -------- |
| headers | \`string[]\` | yes |
| rows | \`string[][]\` | yes |

## Badge
Small label / badge

| Prop | Type | Required |
| ---- | ---- | -------- |
| text | \`string\` | yes |
| variant | \`"default" | "secondary" | "outline" | "destructive"\` | no |

## Button
Clickable button, optionally linking somewhere

| Prop | Type | Required |
| ---- | ---- | -------- |
| text | \`string\` | yes |
| href | \`string\` | no |
| variant | \`"default" | "secondary" | "outline" | "ghost"\` | no |

## Hero
Hero / banner section with title, subtitle, and CTA

| Prop | Type | Required |
| ---- | ---- | -------- |
| title | \`string\` | yes |
| subtitle | \`string\` | no |
| cta | \`string\` | no |
| ctaHref | \`string\` | no |

## Nav
Navigation bar with link items

| Prop | Type | Required |
| ---- | ---- | -------- |
| items | \`Array<{ text: string; href: string }>\` | yes |

## Footer
Page footer with text and optional links

| Prop | Type | Required |
| ---- | ---- | -------- |
| text | \`string\` | yes |
| links | \`Array<{ text: string; href: string }>\` | no |

O JSON de saída deve seguir exatamente o mesmo formato do JSON de entrada.`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface JsonRenderDocument {
  root: string;
  elements: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

interface Suggestion {
  category: string;
  description: string;
  impact: string;
}

interface OptimizeRequestBody {
  jsonRender?: JsonRenderDocument;
  suggestions?: Suggestion[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonHeaders(status = 200) {
  return { status, headers: { ...corsHeaders, "Content-Type": "application/json" } };
}

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), jsonHeaders(status));
}

function buildUserPrompt(jsonRender: JsonRenderDocument, suggestions: Suggestion[]): string {
  const parts: string[] = [];

  parts.push("## JSON json-render original\n");
  parts.push(JSON.stringify(jsonRender, null, 2));

  parts.push("\n\n## Sugestões de melhoria\n");
  for (const s of suggestions) {
    parts.push(`- **[${s.category}]** ${s.description} (Impacto: ${s.impact})`);
  }

  parts.push(
    "\n---\nAplique TODAS as sugestões acima ao JSON json-render e retorne a versão otimizada. Retorne APENAS o JSON.",
  );

  return parts.join("\n");
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // --- 1. Validate input ---------------------------------------------------
  let body: OptimizeRequestBody;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Body inválido: JSON esperado com { jsonRender, suggestions }.", 400);
  }

  const jsonRender = body?.jsonRender;
  const suggestions = body?.suggestions;

  if (
    !jsonRender ||
    typeof jsonRender.root !== "string" ||
    !jsonRender.elements ||
    typeof jsonRender.elements !== "object" ||
    Array.isArray(jsonRender.elements)
  ) {
    return errorResponse(
      "Dados jsonRender ausentes ou inválidos. Campos obrigatórios: root (string), elements (object).",
      400,
    );
  }

  if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
    return errorResponse(
      "Array de sugestões ausente ou vazio. Pelo menos uma sugestão é obrigatória.",
      400,
    );
  }

  // --- 2. Resolve AI provider ----------------------------------------------
  let resolvedProvider;
  try {
    resolvedProvider = resolveProvider(req.headers);
  } catch {
    return errorResponse("Nenhum provider de IA disponível. Configure uma API key.", 400);
  }

  // --- 3. Build prompts & call LLM ----------------------------------------
  const userPrompt = buildUserPrompt(jsonRender, suggestions);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  let llmResponse;
  try {
    llmResponse = await callLLM({
      provider: resolvedProvider,
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      jsonMode: true,
      maxTokens: 8192,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === "AbortError") {
      return errorResponse("Tempo limite excedido. O site pode ser muito grande ou lento.", 504);
    }
    console.error("LLM call failed:", err);
    return errorResponse("Erro na análise da IA. Tente novamente.", 502);
  } finally {
    clearTimeout(timeout);
  }

  // --- 4. Parse & validate response ----------------------------------------
  let parsed: { root?: string; elements?: Record<string, unknown> };
  try {
    parsed = JSON.parse(llmResponse.content);
  } catch {
    // Try to extract partial JSON if the response was truncated
    console.error("Failed to parse LLM JSON:", llmResponse.content.slice(0, 500));
    const partialMatch = llmResponse.content.match(/\{[\s\S]*\}/);
    if (partialMatch) {
      try {
        parsed = JSON.parse(partialMatch[0]);
      } catch {
        return errorResponse(
          "A resposta da IA foi truncada. Tente novamente ou use um modelo com mais capacidade.",
          502,
        );
      }
    } else {
      return errorResponse(
        "A resposta da IA foi truncada. Tente novamente ou use um modelo com mais capacidade.",
        502,
      );
    }
  }

  if (!parsed!.root || typeof parsed!.root !== "string") {
    return errorResponse(
      "Erro na otimização da IA: campo 'root' ausente ou inválido na resposta.",
      500,
    );
  }

  if (!parsed!.elements || typeof parsed!.elements !== "object" || Array.isArray(parsed!.elements)) {
    return errorResponse(
      "Erro na otimização da IA: campo 'elements' ausente ou inválido na resposta.",
      500,
    );
  }

  // --- 5. Attach metadata & return -----------------------------------------
  const result = {
    root: parsed.root,
    elements: parsed.elements,
    metadata: {
      provider: resolvedProvider.provider,
      model: resolvedProvider.model,
      optimizedAt: new Date().toISOString(),
      suggestionsApplied: suggestions.length,
    },
  };

  return new Response(JSON.stringify(result), jsonHeaders(200));
});
