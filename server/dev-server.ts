// dev-server.ts — Servidor Express que simula as Edge Functions do Supabase
// Para desenvolvimento local sem Docker/Supabase CLI.
//
// Rotas:
//   POST /functions/v1/scrape
//   POST /functions/v1/convert
//   POST /functions/v1/analyze
//   POST /functions/v1/optimize
//   POST /functions/v1/extract-design-system

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { resolveProvider, callLLM } from "./ai-client.js";
import { CONVERT_SYSTEM_PROMPT, ANALYZE_SYSTEM_PROMPT, OPTIMIZE_SYSTEM_PROMPT, EXTRACT_DESIGN_SYSTEM_PROMPT } from "./prompts.js";

const app = express();
const PORT = 3001;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "5mb" }));

// Request logger
app.use((req, _res, next) => {
  const start = Date.now();
  // Log AI provider headers for debugging
  const hasApiKey = !!req.headers["x-api-key"];
  const provider = req.headers["x-provider"] || "none";
  const hasServerKey = !!(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || process.env.GOOGLE_API_KEY);
  if (req.method === "POST") {
    console.log(`[debug] headers x-api-key: ${hasApiKey ? "present" : "missing"}, x-provider: ${provider}, server keys: ${hasServerKey ? "configured" : "MISSING"}`);
  }
  _res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} — ${_res.statusCode} (${duration}ms)`);
  });
  next();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function errorJson(res: express.Response, message: string, status: number) {
  return res.status(status).json({ error: message });
}

// ---------------------------------------------------------------------------
// POST /functions/v1/scrape
// ---------------------------------------------------------------------------

// Rate limiting — in-memory
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_INTERVAL_MS = 3_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimitMap.get(ip);
  if (lastRequest && now - lastRequest < RATE_LIMIT_INTERVAL_MS) {
    return false;
  }
  rateLimitMap.set(ip, now);
  if (rateLimitMap.size > 10_000) {
    const cutoff = now - RATE_LIMIT_INTERVAL_MS;
    for (const [key, ts] of rateLimitMap) {
      if (ts < cutoff) rateLimitMap.delete(key);
    }
  }
  return true;
}

function validateUrl(raw: string): { valid: boolean; error?: string } {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { valid: false, error: "URL invalida: formato incorreto." };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { valid: false, error: "URL invalida: apenas http e https sao permitidos." };
  }

  const hostname = parsed.hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "0.0.0.0") {
    return { valid: false, error: "URL bloqueada: enderecos locais nao sao permitidos." };
  }

  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, aStr, bStr] = ipv4Match;
    const a = Number(aStr);
    const b = Number(bStr);
    if (
      a === 10 ||
      a === 127 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) ||
      (a === 100 && b >= 64 && b <= 127) ||
      a === 0
    ) {
      return { valid: false, error: "URL bloqueada: enderecos IP privados nao sao permitidos." };
    }
  }

  if (hostname.startsWith("[") || hostname.includes(":")) {
    return { valid: false, error: "URL bloqueada: enderecos IPv6 diretos nao sao permitidos." };
  }

  return { valid: true };
}

function parseHeadings(markdown: string): Array<{ level: number; text: string }> {
  const headings: Array<{ level: number; text: string }> = [];
  const lines = markdown.split("\n");
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)/);
    if (match) {
      headings.push({ level: match[1].length, text: match[2].trim() });
    }
  }
  return headings;
}

function parseLinks(markdown: string): Array<{ href: string; text: string }> {
  const links: Array<{ href: string; text: string }> = [];
  const regex = /\[([^\]]*)\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown)) !== null) {
    const text = match[1];
    const href = match[2];
    if (href && !href.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)(\?.*)?$/i)) {
      links.push({ href, text });
    }
  }
  return links;
}

function parseImages(markdown: string): Array<{ src: string; alt: string }> {
  const images: Array<{ src: string; alt: string }> = [];
  const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown)) !== null) {
    images.push({ alt: match[1], src: match[2] });
  }
  return images;
}

interface ScrapedPage {
  url: string;
  title: string;
  description: string;
  textContent: string;
  metadata: {
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonical?: string;
    lang?: string;
  };
  links: Array<{ href: string; text: string }>;
  images: Array<{ src: string; alt: string }>;
  headings: Array<{ level: number; text: string }>;
}

app.post("/functions/v1/scrape", async (req, res) => {
  const startTime = performance.now();

  try {
    // Rate limit
    const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
      || (req.headers["x-real-ip"] as string)
      || req.ip
      || "unknown";
    if (!checkRateLimit(clientIp)) {
      return errorJson(res, "Muitas requisicoes. Aguarde alguns segundos e tente novamente.", 429);
    }

    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return errorJson(res, "Campo 'url' e obrigatorio e deve ser uma string.", 400);
    }

    const validation = validateUrl(url);
    if (!validation.valid) {
      return errorJson(res, validation.error!, 400);
    }

    const normalizedUrl = new URL(url).href;

    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return errorJson(res, "Configuracao do servidor incompleta: FIRECRAWL_API_KEY nao definida.", 500);
    }

    // Call Firecrawl API
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90_000);

    let firecrawlRes: Response;
    try {
      firecrawlRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: normalizedUrl,
          formats: ["markdown", "html"],
        }),
        signal: controller.signal,
      });
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (err instanceof DOMException && err.name === "AbortError") {
        return errorJson(res, "Tempo limite excedido. O site pode ser muito grande ou lento.", 504);
      }
      return errorJson(res, "Nao foi possivel acessar o site. Verifique se a URL esta correta.", 502);
    } finally {
      clearTimeout(timeout);
    }

    if (!firecrawlRes.ok) {
      let detail = "";
      try {
        const errBody = await firecrawlRes.json();
        detail = errBody?.error || errBody?.message || "";
      } catch {
        detail = "";
      }
      console.error(`[scrape] Firecrawl error (${firecrawlRes.status}): ${detail}`);
      const clientMessage = firecrawlRes.status === 429
        ? "Servico de scraping com muitas requisicoes. Tente novamente em alguns minutos."
        : "Nao foi possivel processar o site. Verifique se a URL esta acessivel.";
      return errorJson(res, clientMessage, 502);
    }

    const firecrawlData = await firecrawlRes.json();
    const data = firecrawlData.data ?? firecrawlData;
    const metadata = data.metadata ?? {};
    const markdown = data.markdown ?? "";

    const scrapedPage: ScrapedPage = {
      url,
      title: metadata.title ?? "",
      description: metadata.description ?? "",
      textContent: markdown,
      metadata: {
        ogTitle: metadata.ogTitle ?? metadata["og:title"] ?? undefined,
        ogDescription: metadata.ogDescription ?? metadata["og:description"] ?? undefined,
        ogImage: metadata.ogImage ?? metadata["og:image"] ?? undefined,
        canonical: metadata.canonical ?? undefined,
        lang: metadata.language ?? metadata.lang ?? undefined,
      },
      headings: parseHeadings(markdown),
      links: parseLinks(markdown),
      images: parseImages(markdown),
    };

    const durationMs = Math.round(performance.now() - startTime);
    console.log(`[scrape] ${url} completed in ${durationMs}ms`);

    res.setHeader("X-Scrape-Duration", String(durationMs));
    return res.json(scrapedPage);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno desconhecido.";
    return errorJson(res, message, 500);
  }
});

// ---------------------------------------------------------------------------
// POST /functions/v1/convert
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

function buildConvertUserPrompt(data: ScrapedData): string {
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

app.post("/functions/v1/convert", async (req, res) => {
  try {
    const scrapedData: ScrapedData | undefined = req.body?.scrapedData;
    if (!scrapedData || typeof scrapedData.title !== "string" || typeof scrapedData.textContent !== "string") {
      return errorJson(
        res,
        "Dados de scraping ausentes ou invalidos. Campos obrigatorios: title (string), textContent (string).",
        400,
      );
    }

    let resolvedProvider;
    try {
      resolvedProvider = resolveProvider(req.headers);
    } catch {
      return errorJson(res, "Nenhum provider de IA disponivel. Configure uma API key.", 400);
    }

    const userPrompt = buildConvertUserPrompt(scrapedData);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    let llmResponse;
    try {
      llmResponse = await callLLM({
        provider: resolvedProvider,
        systemPrompt: CONVERT_SYSTEM_PROMPT,
        userPrompt,
        jsonMode: true,
        maxTokens: 8192,
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof DOMException && err.name === "AbortError") {
        return errorJson(res, "Tempo limite excedido. O site pode ser muito grande ou lento.", 504);
      }
      console.error("LLM call failed:", err);
      return errorJson(res, "Erro na analise da IA. Tente novamente.", 502);
    } finally {
      clearTimeout(timeout);
    }

    let parsed: { root?: string; elements?: Record<string, unknown> };
    try {
      parsed = JSON.parse(llmResponse.content);
    } catch {
      console.error("Failed to parse LLM JSON:", llmResponse.content.slice(0, 500));
      const partialMatch = llmResponse.content.match(/\{[\s\S]*\}/);
      if (partialMatch) {
        try {
          parsed = JSON.parse(partialMatch[0]);
        } catch {
          return errorJson(res, "A resposta da IA foi truncada. Tente novamente ou use um modelo com mais capacidade.", 502);
        }
      } else {
        return errorJson(res, "A resposta da IA foi truncada. Tente novamente ou use um modelo com mais capacidade.", 502);
      }
    }

    if (!parsed!.root || typeof parsed!.root !== "string") {
      return errorJson(res, "Erro na conversao da IA: campo 'root' ausente ou invalido na resposta.", 500);
    }

    if (!parsed!.elements || typeof parsed!.elements !== "object" || Array.isArray(parsed!.elements)) {
      return errorJson(res, "Erro na conversao da IA: campo 'elements' ausente ou invalido na resposta.", 500);
    }

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

    return res.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno desconhecido.";
    return errorJson(res, message, 500);
  }
});

// ---------------------------------------------------------------------------
// POST /functions/v1/analyze
// ---------------------------------------------------------------------------

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

app.post("/functions/v1/analyze", async (req, res) => {
  try {
    const { jsonRender, originalUrl } = req.body;

    if (!jsonRender || typeof jsonRender !== "object") {
      return errorJson(res, "Campo 'jsonRender' ausente ou invalido no body.", 400);
    }

    if (!originalUrl || typeof originalUrl !== "string") {
      return errorJson(res, "Campo 'originalUrl' ausente ou invalido no body.", 400);
    }

    let provider;
    try {
      provider = resolveProvider(req.headers);
    } catch {
      return errorJson(res, "Nenhum provider de IA disponivel. Configure uma API key.", 400);
    }

    const userPrompt = `URL original: ${originalUrl}\n\nJSON do site:\n${JSON.stringify(jsonRender)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    let llmResponse;
    try {
      llmResponse = await callLLM({
        provider,
        systemPrompt: ANALYZE_SYSTEM_PROMPT,
        userPrompt,
        jsonMode: true,
        maxTokens: 4096,
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof DOMException && err.name === "AbortError") {
        return errorJson(res, "Tempo limite excedido. O site pode ser muito grande ou lento.", 504);
      }
      console.error("LLM call failed:", err);
      return errorJson(res, "Erro na analise da IA. Tente novamente.", 502);
    } finally {
      clearTimeout(timeout);
    }

    let report: unknown;
    try {
      report = JSON.parse(llmResponse.content);
    } catch {
      const partialMatch = llmResponse.content.match(/\{[\s\S]*\}/);
      if (partialMatch) {
        try {
          report = JSON.parse(partialMatch[0]);
        } catch {
          return errorJson(res, "A resposta da IA foi truncada. Tente novamente ou use um modelo com mais capacidade.", 502);
        }
      } else {
        return errorJson(res, "A resposta da IA foi truncada. Tente novamente ou use um modelo com mais capacidade.", 502);
      }
    }

    if (!validateReport(report)) {
      return errorJson(
        res,
        "A resposta da IA nao corresponde ao formato esperado (positives, negatives, suggestions). Tente novamente.",
        502,
      );
    }

    return res.json({
      report,
      meta: {
        provider: llmResponse.provider,
        model: llmResponse.model,
        usage: llmResponse.usage,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno desconhecido.";
    return errorJson(res, message, 500);
  }
});

// ---------------------------------------------------------------------------
// POST /functions/v1/optimize
// ---------------------------------------------------------------------------

interface JsonRenderDocument {
  root: string;
  elements: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

function buildOptimizeUserPrompt(jsonRender: JsonRenderDocument, suggestions: Suggestion[]): string {
  const parts: string[] = [];

  parts.push("## JSON json-render original\n");
  parts.push(JSON.stringify(jsonRender, null, 2));

  parts.push("\n\n## Sugestoes de melhoria\n");
  for (const s of suggestions) {
    parts.push(`- **[${s.category}]** ${s.description} (Impacto: ${s.impact})`);
  }

  parts.push(
    "\n---\nAplique TODAS as sugestoes acima ao JSON json-render e retorne a versao otimizada. Retorne APENAS o JSON.",
  );

  return parts.join("\n");
}

app.post("/functions/v1/optimize", async (req, res) => {
  try {
    const jsonRender: JsonRenderDocument | undefined = req.body?.jsonRender;
    const suggestions: Suggestion[] | undefined = req.body?.suggestions;

    if (
      !jsonRender ||
      typeof jsonRender.root !== "string" ||
      !jsonRender.elements ||
      typeof jsonRender.elements !== "object" ||
      Array.isArray(jsonRender.elements)
    ) {
      return errorJson(
        res,
        "Dados jsonRender ausentes ou invalidos. Campos obrigatorios: root (string), elements (object).",
        400,
      );
    }

    if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
      return errorJson(
        res,
        "Array de sugestoes ausente ou vazio. Pelo menos uma sugestao e obrigatoria.",
        400,
      );
    }

    let resolvedProvider;
    try {
      resolvedProvider = resolveProvider(req.headers);
    } catch {
      return errorJson(res, "Nenhum provider de IA disponivel. Configure uma API key.", 400);
    }

    const userPrompt = buildOptimizeUserPrompt(jsonRender, suggestions);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    let llmResponse;
    try {
      llmResponse = await callLLM({
        provider: resolvedProvider,
        systemPrompt: OPTIMIZE_SYSTEM_PROMPT,
        userPrompt,
        jsonMode: true,
        maxTokens: 8192,
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof DOMException && err.name === "AbortError") {
        return errorJson(res, "Tempo limite excedido. O site pode ser muito grande ou lento.", 504);
      }
      console.error("LLM call failed:", err);
      return errorJson(res, "Erro na analise da IA. Tente novamente.", 502);
    } finally {
      clearTimeout(timeout);
    }

    let parsed: { root?: string; elements?: Record<string, unknown> };
    try {
      parsed = JSON.parse(llmResponse.content);
    } catch {
      console.error("Failed to parse LLM JSON:", llmResponse.content.slice(0, 500));
      const partialMatch = llmResponse.content.match(/\{[\s\S]*\}/);
      if (partialMatch) {
        try {
          parsed = JSON.parse(partialMatch[0]);
        } catch {
          return errorJson(res, "A resposta da IA foi truncada. Tente novamente ou use um modelo com mais capacidade.", 502);
        }
      } else {
        return errorJson(res, "A resposta da IA foi truncada. Tente novamente ou use um modelo com mais capacidade.", 502);
      }
    }

    if (!parsed!.root || typeof parsed!.root !== "string") {
      return errorJson(res, "Erro na otimizacao da IA: campo 'root' ausente ou invalido na resposta.", 500);
    }

    if (!parsed!.elements || typeof parsed!.elements !== "object" || Array.isArray(parsed!.elements)) {
      return errorJson(res, "Erro na otimizacao da IA: campo 'elements' ausente ou invalido na resposta.", 500);
    }

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

    return res.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno desconhecido.";
    return errorJson(res, message, 500);
  }
});

// ---------------------------------------------------------------------------
// POST /functions/v1/extract-design-system
// ---------------------------------------------------------------------------

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
    "\n---\nAnalise o conteudo acima e extraia os Design Tokens do site. Retorne APENAS o JSON.",
  );

  return parts.join("\n");
}

app.post("/functions/v1/extract-design-system", async (req, res) => {
  try {
    const scrapedData: ScrapedData | undefined = req.body?.scrapedData;
    if (!scrapedData || typeof scrapedData.title !== "string" || typeof scrapedData.textContent !== "string") {
      return errorJson(
        res,
        "Dados de scraping ausentes ou invalidos. Campos obrigatorios: title (string), textContent (string).",
        400,
      );
    }

    let resolvedProvider;
    try {
      resolvedProvider = resolveProvider(req.headers);
    } catch {
      return errorJson(res, "Nenhum provider de IA disponivel. Configure uma API key.", 400);
    }

    const userPrompt = buildDesignSystemUserPrompt(scrapedData);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    let llmResponse;
    try {
      llmResponse = await callLLM({
        provider: resolvedProvider,
        systemPrompt: EXTRACT_DESIGN_SYSTEM_PROMPT,
        userPrompt,
        jsonMode: true,
        maxTokens: 4096,
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof DOMException && err.name === "AbortError") {
        return errorJson(res, "Tempo limite excedido. O site pode ser muito grande ou lento.", 504);
      }
      console.error("LLM call failed:", err);
      return errorJson(res, "Erro na extracao de design tokens. Tente novamente.", 502);
    } finally {
      clearTimeout(timeout);
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(llmResponse.content);
    } catch {
      console.error("Failed to parse LLM JSON:", llmResponse.content.slice(0, 500));
      const partialMatch = llmResponse.content.match(/\{[\s\S]*\}/);
      if (partialMatch) {
        try {
          parsed = JSON.parse(partialMatch[0]);
        } catch {
          return errorJson(res, "A resposta da IA foi truncada. Tente novamente ou use um modelo com mais capacidade.", 502);
        }
      } else {
        return errorJson(res, "A resposta da IA foi truncada. Tente novamente ou use um modelo com mais capacidade.", 502);
      }
    }

    if (!Array.isArray(parsed!.colors) || !Array.isArray(parsed!.typography) || !Array.isArray(parsed!.spacing)) {
      return errorJson(
        res,
        "A resposta da IA nao corresponde ao formato esperado (colors, typography, spacing). Tente novamente.",
        502,
      );
    }

    return res.json({
      ...parsed,
      meta: {
        provider: llmResponse.provider,
        model: llmResponse.model,
        usage: llmResponse.usage,
        extractedAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno desconhecido.";
    return errorJson(res, message, 500);
  }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`\n  Espelha Dev Server running at http://localhost:${PORT}`);
  console.log(`  CORS enabled for http://localhost:5173`);
  console.log(`\n  Routes:`);
  console.log(`    POST /functions/v1/scrape`);
  console.log(`    POST /functions/v1/convert`);
  console.log(`    POST /functions/v1/analyze`);
  console.log(`    POST /functions/v1/optimize`);
  console.log(`    POST /functions/v1/extract-design-system`);
  console.log();
});
