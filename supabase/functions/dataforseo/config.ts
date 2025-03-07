
// CORS headers for cross-domain requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create base64 encoded credentials for DataForSEO API
const login = "armin@revologyanalytics.com";
const password = "ab4016dc9302b8cf";
export const AUTH_HEADER = btoa(`${login}:${password}`);
