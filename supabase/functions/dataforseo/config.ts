
// DataForSEO API configuration and credentials
import { encode } from "https://deno.land/std@0.177.0/encoding/base64.ts";

// DataForSEO credentials - these should be moved to environment variables in production
const DFS_USERNAME = Deno.env.get("DATAFORSEO_USERNAME") || "armin@revologyanalytics.com";
const DFS_PASSWORD = Deno.env.get("DATAFORSEO_PASSWORD") || "ab4016dc9302b8cf";
export const AUTH_HEADER = encode(`${DFS_USERNAME}:${DFS_PASSWORD}`);

// CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
