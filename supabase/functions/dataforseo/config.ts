
// DataForSEO API configuration and credentials
import { encode } from "https://deno.land/std@0.177.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Get DataForSEO credentials from environment variables
// Fall back to default credentials if environment variables are not set
const DFS_USERNAME = Deno.env.get("DATAFORSEO_USERNAME") || "armin@revologyanalytics.com";
const DFS_PASSWORD = Deno.env.get("DATAFORSEO_PASSWORD") || "ab4016dc9302b8cf";
export const AUTH_HEADER = encode(`${DFS_USERNAME}:${DFS_PASSWORD}`);

// Supabase configuration
export const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://rgtptfhlkplnahzehpci.supabase.co";
export const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndHB0Zmhsa3BsbmFoemVocGNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMDI5ODEsImV4cCI6MjA1NjY3ODk4MX0.rhXFrgtnfQMfpDue4DvnxqMW59FRbscNp1Nib4VRyIQ";

// Initialize Supabase client for edge function
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a hash for request caching
export function generateRequestHash(requestData: any): string {
  const str = JSON.stringify(requestData);
  return Array.from(
    new Uint8Array(
      crypto.subtle.digestSync("SHA-256", new TextEncoder().encode(str))
    )
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Estimate cost of API requests
export const ENDPOINT_COSTS: Record<string, number> = {
  '/v3/dataforseo_labs/google/domain_rank_overview/live': 0.03,
  '/v3/serp/google/organic/live/regular': 0.05,
  '/v3/on_page/tasks_post': 0.02,
  '/v3/backlinks/backlinks_overview/live': 0.03,
  '/v3/keywords_data/google_ads/live/regular': 0.04,
  '/v3/competitors_domain/google/organic/live/regular': 0.05,
  '/v3/keywords_data/google_ads/keywords_for_site/live': 0.05,
  '/v3/keywords_data/google/search_volume/live': 0.01,
  '/v3/dataforseo_labs/google/domain_intersection/live': 0.08,
  '/v3/dataforseo_labs/google/competitors_domain/live': 0.05,
  '/v3/dataforseo_labs/google/related_keywords/live': 0.04,
  '/v3/dataforseo_labs/google/keyword_suggestions/live': 0.04,
};
