/**
 * Edge Function: /scrape
 *
 * Receives a URL via POST { url: string }, validates it (format + SSRF blocking),
 * calls the Firecrawl API to scrape the page, and returns a structured ScrapedPage
 * response with extracted metadata, headings, links, and images.
 *
 * Headers: X-Scrape-Duration reports wall-clock time in milliseconds.
 * Timeout: 30 seconds for the Firecrawl upstream call.
 *
 * Story 2.1 — Production-ready refinement.
 */
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { getCorsHeaders, corsHeaders } from "../_shared/cors.ts";

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

const JSON_HEADERS = { ...corsHeaders, "Content-Type": "application/json" };

// ---------------------------------------------------------------------------
// Rate limiting — in-memory, resets per deploy (sufficient for MVP)
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_INTERVAL_MS = 3_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimitMap.get(ip);
  if (lastRequest && now - lastRequest < RATE_LIMIT_INTERVAL_MS) {
    return false; // rate limited
  }
  rateLimitMap.set(ip, now);
  // Cleanup old entries periodically to avoid memory leak
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
    return { valid: false, error: "URL inválida: formato incorreto." };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { valid: false, error: "URL inválida: apenas http e https são permitidos." };
  }

  const hostname = parsed.hostname;

  // Block localhost variants
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "0.0.0.0") {
    return { valid: false, error: "URL bloqueada: endereços locais não são permitidos." };
  }

  // Block private/reserved IP ranges (SSRF protection)
  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number);
    if (
      a === 10 ||                              // 10.0.0.0/8
      a === 127 ||                             // 127.0.0.0/8
      (a === 172 && b >= 16 && b <= 31) ||     // 172.16.0.0/12
      (a === 192 && b === 168) ||              // 192.168.0.0/16
      (a === 169 && b === 254) ||              // 169.254.0.0/16 (link-local / cloud metadata)
      (a === 100 && b >= 64 && b <= 127) ||    // 100.64.0.0/10 (CGNAT)
      a === 0                                  // 0.0.0.0/8
    ) {
      return { valid: false, error: "URL bloqueada: endereços IP privados não são permitidos." };
    }
  }

  // Block IPv6 shorthand notations that could bypass above checks
  if (hostname.startsWith("[") || hostname.includes(":")) {
    return { valid: false, error: "URL bloqueada: endereços IPv6 diretos não são permitidos." };
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
    // Skip image references (those starting with !)
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

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Rate limit check
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
  if (!checkRateLimit(clientIp)) {
    return new Response(
      JSON.stringify({ error: "Muitas requisições. Aguarde alguns segundos e tente novamente." }),
      { status: 429, headers: JSON_HEADERS },
    );
  }

  const startTime = performance.now();

  try {
    // Validate method
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Método não permitido. Use POST." }),
        { status: 405, headers: JSON_HEADERS }
      );
    }

    // Parse body
    let body: { url?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Body inválido: JSON esperado com { url: string }." }),
        { status: 400, headers: JSON_HEADERS }
      );
    }

    if (!body.url || typeof body.url !== "string") {
      return new Response(
        JSON.stringify({ error: "Campo 'url' é obrigatório e deve ser uma string." }),
        { status: 400, headers: JSON_HEADERS }
      );
    }

    // Validate URL
    const validation = validateUrl(body.url);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: JSON_HEADERS }
      );
    }

    // Normalize URL — encode special characters properly
    const normalizedUrl = new URL(body.url).href;

    // Get API key
    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Configuração do servidor incompleta: FIRECRAWL_API_KEY não definida." }),
        { status: 500, headers: JSON_HEADERS }
      );
    }

    // Call Firecrawl API
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    let firecrawlRes: Response;
    try {
      firecrawlRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
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
        return new Response(
          JSON.stringify({ error: "Tempo limite excedido. O site pode ser muito grande ou lento." }),
          { status: 504, headers: JSON_HEADERS }
        );
      }
      return new Response(
        JSON.stringify({ error: "Não foi possível acessar o site. Verifique se a URL está correta." }),
        { status: 502, headers: JSON_HEADERS }
      );
    } finally {
      clearTimeout(timeout);
    }

    // Handle Firecrawl error responses
    if (!firecrawlRes.ok) {
      let detail = "";
      try {
        const errBody = await firecrawlRes.json();
        detail = errBody?.error || errBody?.message || "";
      } catch {
        detail = "";
      }
      // Log full detail server-side, return sanitized message to client
      console.error(`[scrape] Firecrawl error (${firecrawlRes.status}): ${detail}`);
      const clientMessage = firecrawlRes.status === 429
        ? "Serviço de scraping com muitas requisições. Tente novamente em alguns minutos."
        : "Não foi possível processar o site. Verifique se a URL está acessível.";
      return new Response(
        JSON.stringify({ error: clientMessage }),
        { status: 502, headers: JSON_HEADERS }
      );
    }

    // Parse Firecrawl response
    const firecrawlData = await firecrawlRes.json();
    const data = firecrawlData.data ?? firecrawlData;

    const metadata = data.metadata ?? {};
    const markdown = data.markdown ?? "";

    const scrapedPage: ScrapedPage = {
      url: body.url,
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
    console.log(`[scrape] ${body.url} completed in ${durationMs}ms`);

    return new Response(
      JSON.stringify(scrapedPage),
      {
        status: 200,
        headers: {
          ...JSON_HEADERS,
          "X-Scrape-Duration": String(durationMs),
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno desconhecido.";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
});
