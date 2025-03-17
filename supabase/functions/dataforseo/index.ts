
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./config.ts";
import {
  getDomainKeywords,
  getCompetitorDomains,
  getRankedKeywords,
  getDomainIntersection,
  getDomainOverview
} from "./services.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the request body
    const body = await req.json();
    const action = body.action;
    
    console.log(`DataForSEO function called with action: ${action}`);
    let result;

    // Route the request to the appropriate service based on the action
    switch (action) {
      case 'domain_keywords':
        result = await getDomainKeywords(body.domain, body.location_code, body.language_code);
        break;
      case 'competitor_domains':
        result = await getCompetitorDomains(body.domain, body.location_code, body.limit);
        break;
      case 'ranked_keywords':
        result = await getRankedKeywords(
          body.domain, 
          body.location_code || 2840, 
          body.language_code || "en", 
          body.limit || 100,
          body.order_by || ["keyword_data.keyword_info.search_volume,desc"]
        );
        break;
      case 'domain_intersection':
        result = await getDomainIntersection(
          body.target1, 
          body.target2, 
          body.location_code, 
          body.limit
        );
        break;
      case 'domain_overview':
        result = await getDomainOverview(body.domain, body.location_code);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Return the result
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(`Error in DataForSEO function:`, error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
