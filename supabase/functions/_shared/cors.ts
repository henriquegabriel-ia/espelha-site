// Allowed origins — add your Lovable Cloud domain here
const ALLOWED_ORIGINS = [
  "https://espelha-site.lovable.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

export function getCorsHeaders(req?: Request): Record<string, string> {
  const origin = req?.headers.get("origin") ?? "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-api-key, x-provider",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

// Backward compat — default headers for cases where request is not available
export const corsHeaders = getCorsHeaders();
