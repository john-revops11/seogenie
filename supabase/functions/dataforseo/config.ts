
// DataForSEO API configuration and credentials
import { encode } from "https://deno.land/std@0.177.0/encoding/base64.ts";

// DataForSEO credentials from environment variables
const DFS_USERNAME = Deno.env.get("DATAFORSEO_USERNAME") || "";
const DFS_PASSWORD = Deno.env.get("DATAFORSEO_PASSWORD") || "";

// Create the base64 encoded authentication header
export const AUTH_HEADER = encode(`${DFS_USERNAME}:${DFS_PASSWORD}`);

// CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
