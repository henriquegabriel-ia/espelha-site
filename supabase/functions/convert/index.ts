import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { resolveProvider } from "../_shared/ai-cascade.ts";
import { callLLM } from "../_shared/ai-client.ts";

// ---------------------------------------------------------------------------
// System prompt — json-render spec + component catalog (replicated from
// src/lib/json-render-catalog.ts getCatalogPromptText() since we cannot
// import browser-side code in Deno)
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a web-content-to-JSON converter. Your job is to analyze scraped website data and produce a valid json-render document.

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

## Document structure

\`\`\`json
{
  "root": "<element-id>",
  "elements": {
    "<element-id>": {
      "type": "<ComponentType>",
      "props": { ... },
      "children": ["<child-element-id>", ...]
    }
  }
}
\`\`\`

# Instructions

Analyze the scraped website content provided by the user and convert it into a valid json-render structure.

Rules:
1. Use ONLY the components listed in the catalog above.
2. The JSON MUST have a "root" key pointing to the root element ID and an "elements" object containing all elements.
3. Use meaningful element IDs (e.g. "hero-1", "nav-1", "section-about", "heading-main").
4. Nest elements using the "children" array which contains element IDs.
5. The root element should typically be a Section that wraps the entire page.
6. Faithfully represent the original site structure — use Hero for hero sections, Nav for navigation, Footer for footers, etc.
7. Return ONLY valid JSON. No markdown code blocks, no explanation, no extra text — just the JSON object.`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonHeaders(status = 200) {
  return { status, headers: { ...corsHeaders, "Content-Type": "application/json" } };
}

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), jsonHeaders(status));
}

function buildUserPrompt(data: ScrapedData): string {
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

  if (data.links && data.links.length > 0) {
    parts.push("\n## Links");
    for (const l of data.links.slice(0, 50)) {
      parts.push(`- [${l.text}](${l.href})`);
    }
    if (data.links.length > 50) {
      parts.push(`... and ${data.links.length - 50} more links`);
    }
  }

  if (data.images && data.images.length > 0) {
    parts.push("\n## Images");
    for (const img of data.images.slice(0, 30)) {
      parts.push(`- ![${img.alt}](${img.src})`);
    }
    if (data.images.length > 30) {
      parts.push(`... and ${data.images.length - 30} more images`);
    }
  }

  if (data.textContent) {
    // Truncate to avoid blowing up the context window
    const maxChars = 12_000;
    const text =
      data.textContent.length > maxChars
        ? data.textContent.slice(0, maxChars) + "\n... [truncated]"
        : data.textContent;
    parts.push(`\n## Page Text Content\n${text}`);
  }

  parts.push(
    "\n---\nConvert this website content into a json-render document. Return ONLY the JSON.",
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
  let body: { scrapedData?: ScrapedData };
  try {
    body = await req.json();
  } catch {
    return errorResponse("Body inválido: JSON esperado com { scrapedData }.", 400);
  }

  const scrapedData = body?.scrapedData;
  if (!scrapedData || typeof scrapedData.title !== "string" || typeof scrapedData.textContent !== "string") {
    return errorResponse(
      "Dados de scraping ausentes ou inválidos. Campos obrigatórios: title (string), textContent (string).",
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
  const userPrompt = buildUserPrompt(scrapedData);

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
      "Erro na conversão da IA: campo 'root' ausente ou inválido na resposta.",
      500,
    );
  }

  if (!parsed!.elements || typeof parsed!.elements !== "object" || Array.isArray(parsed!.elements)) {
    return errorResponse(
      "Erro na conversão da IA: campo 'elements' ausente ou inválido na resposta.",
      500,
    );
  }

  // --- 5. Attach metadata & return -----------------------------------------
  const result = {
    root: parsed.root,
    elements: parsed.elements,
    metadata: {
      url: scrapedData.url || "",
      title: scrapedData.title,
      scrapedAt: new Date().toISOString(),
      provider: resolvedProvider.provider,
      model: resolvedProvider.model,
    },
  };

  return new Response(JSON.stringify(result), jsonHeaders(200));
});
