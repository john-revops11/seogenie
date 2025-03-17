
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  getCompetitorDomains, 
  getDomainKeywords, 
  getDomainIntersection, 
  getDomainOverview, 
  getRankedKeywords 
} from "./services.ts";

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

serve(async (req) => {
  // Handle CORS for preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { action, ...params } = await req.json();
    
    let result;
    console.log(`Processing ${action} request with params:`, params);
    
    switch (action) {
      case "competitors_domain":
        result = await getCompetitorDomains(
          params.domain,
          params.location_code,
          params.limit
        );
        break;
      case "domain_keywords":
        try {
          result = await getDomainKeywords(
            params.domain,
            params.location_code,
            params.sort_by
          );
          console.log(`Successfully fetched keywords for ${params.domain}`);
        } catch (error) {
          console.error(`Error in domain_keywords for ${params.domain}:`, error);
          return new Response(JSON.stringify({
            success: false,
            error: `Error fetching keywords: ${error.message || 'Unknown error'}`
          }), {
            status: 500,
            headers: { 
              "Content-Type": "application/json",
              ...corsHeaders
            },
          });
        }
        break;
      case "domain_intersection":
        result = await getDomainIntersection(
          params.target1,
          params.target2,
          params.location_code
        );
        break;
      case "domain_overview":
        result = await getDomainOverview(
          params.domain,
          params.location_code
        );
        break;
      case "ranked_keywords":
        result = await getRankedKeywords(
          params.domain,
          params.location_code,
          params.language_code,
          params.limit,
          params.order_by
        );
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return new Response(JSON.stringify({
      success: true,
      results: result.tasks?.[0]?.result?.[0]?.items || result.tasks?.[0]?.result || [],
    }), {
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      },
    });
  }
});
