
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "./config.ts";
import {
  getDomainSERP,
  getKeywordVolume,
  getDomainTraffic,
  getCompetitorDomains,
  getDomainKeywords
} from "./services.ts";

serve(async (req) => {
  console.log("DataForSEO Edge Function received a request");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    console.error("Method not allowed:", req.method);
    return new Response(
      JSON.stringify({ error: 'Only POST requests are supported' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    console.log("DataForSEO Edge Function processing request");
    
    // Parse request body, with error handling
    let body;
    try {
      body = await req.json();
      console.log("Request body:", JSON.stringify(body).substring(0, 500) + "...");
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { action, domain, keywords, location_code = 2840 } = body;
    
    if (!action) {
      console.error("Missing action parameter");
      throw new Error('Action is required');
    }
    
    let result;
    console.log(`Processing action: ${action}`);
    
    switch (action) {
      case 'domain_serp':
        if (!domain) {
          throw new Error('Domain is required');
        }
        if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
          throw new Error('Keywords array is required');
        }
        result = await getDomainSERP(domain, keywords, location_code);
        break;
        
      case 'keyword_volume':
        if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
          throw new Error('Keywords array is required');
        }
        result = await getKeywordVolume(keywords, location_code);
        break;
        
      case 'domain_traffic':
        if (!domain) {
          throw new Error('Domain is required');
        }
        result = await getDomainTraffic(domain, location_code);
        break;
        
      case 'competitor_domains':
        if (!domain) {
          throw new Error('Domain is required');
        }
        result = await getCompetitorDomains(domain, location_code);
        break;
        
      case 'domain_keywords':
        if (!domain) {
          throw new Error('Domain is required');
        }
        console.log(`Fetching domain keywords for: ${domain} with location: ${location_code}`);
        result = await getDomainKeywords(domain, location_code);
        break;
        
      default:
        console.error(`Unknown action: ${action}`);
        throw new Error(`Unknown action: ${action}`);
    }
    
    console.log(`Action ${action} completed successfully`);
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
