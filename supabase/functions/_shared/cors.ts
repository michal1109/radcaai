// Shared CORS configuration for all edge functions
const allowedOrigins = [
  "https://radcaai.lovable.app",
  "https://id-preview--1ff3e7d4-6fce-45f4-946d-e754f87165c8.lovable.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080"
];

export function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin") || "";
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

export function handleCorsRequest(request: Request): Response | null {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(request) });
  }
  return null;
}

// Generic error messages for security
export const GENERIC_ERRORS = {
  SERVICE_UNAVAILABLE: "Usługa tymczasowo niedostępna.",
  INTERNAL_ERROR: "Wystąpił błąd. Spróbuj ponownie później.",
  UNAUTHORIZED: "Nieautoryzowany dostęp",
  AUTH_MISSING: "Brak autoryzacji",
  RATE_LIMITED: "Przekroczono limit zapytań. Spróbuj ponownie za chwilę.",
  PAYMENT_REQUIRED: "Wymagana płatność. Dodaj środki do workspace.",
} as const;
