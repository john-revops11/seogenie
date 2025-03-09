
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "./config.ts";
import { getDomainKeywords, getKeywordVolume } from "./services.ts";

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
    
    // Parse request body, with error handling
    let body;
    try {
      body = await req.json();
      console.log("Request body:", JSON.stringify(body).substring(0, 500));
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { action, domain, keywords, location_code = 2840 } = body;
    
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
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
