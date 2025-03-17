
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getDomainKeywords, getKeywordVolume } from "./services.ts";
import { corsHeaders, AUTH_HEADER } from "./config.ts";
import { makeDataForSEORequest } from "./api-client.ts";

// CORS headers for cross-origin requests
function formatErrorResponse(error: unknown) {
  let errorMessage = "Unknown error occurred";
  let errorDetails = {};
  
  if (error instanceof Error) {
    // Try to parse if this is a structured error message from our API client
    try {
      const parsedError = JSON.parse(error.message);
      errorMessage = parsedError.message;
      errorDetails = parsedError.details || {};
    } catch {
      // Not a JSON string, use the error message directly
      errorMessage = error.message;
    }
  }
  
  return {
    success: false, 
    error: errorMessage,
    errorDetails
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Only POST requests are supported' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    console.log("DataForSEO Edge Function received a request");
    
    let body;
    try {
      body = await req.json();
      console.log("Request body:", JSON.stringify(body).substring(0, 200));
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { action, domain, keywords, location_code = 2840, endpoint, data } = body;
    
    if (!action) {
      throw new Error('Action is required');
    }
    
    let result;
    
    switch (action) {
      case 'domain_keywords':
        if (!domain) {
          throw new Error('Domain is required');
        }
        console.log(`Fetching keywords for domain: ${domain}`);
        result = await getDomainKeywords(domain, location_code);
        break;
        
      case 'keyword_volume':
        if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
          throw new Error('Keywords array is required');
        }
        result = await getKeywordVolume(keywords, location_code);
        break;
        
      case 'proxy_request':
        if (!endpoint) {
          throw new Error('Endpoint is required');
        }
        if (!data) {
          throw new Error('Data is required');
        }
        console.log(`Proxying request to DataForSEO API: ${endpoint}`);
        result = await makeDataForSEORequest(endpoint, "POST", data);
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    const formattedError = formatErrorResponse(error);
    
    return new Response(
      JSON.stringify(formattedError),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
