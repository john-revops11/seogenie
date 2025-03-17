
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
    // Add request timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout
    
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
            clearTimeout(timeoutId);
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
      
      // Clear the timeout since the request completed successfully
      clearTimeout(timeoutId);
      
      return new Response(JSON.stringify({
        success: true,
        results: result.tasks?.[0]?.result?.[0]?.items || result.tasks?.[0]?.result || [],
      }), {
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        },
      });
    } catch (jsonError) {
      clearTimeout(timeoutId);
      console.error("Error parsing request:", jsonError);
      
      return new Response(JSON.stringify({
        success: false,
        error: `Invalid request format: ${jsonError.message}`,
      }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        },
      });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    
    // Determine if the error is a timeout error
    const isTimeoutError = error.name === 'AbortError' || error.message.includes('timeout');
    
    return new Response(JSON.stringify({
      success: false,
      error: isTimeoutError 
        ? "Request timed out. The DataForSEO API may be experiencing delays." 
        : error.message,
      errorType: isTimeoutError ? "timeout" : "general"
    }), {
      status: isTimeoutError ? 504 : 500,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      },
    });
  }
});
