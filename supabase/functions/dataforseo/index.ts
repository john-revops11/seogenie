
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
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey'
};

serve(async (req) => {
  // Handle CORS for preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // Parse request JSON with error handling
    let action, params;
    try {
      const body = await req.json();
      action = body.action;
      params = { ...body };
      delete params.action;
      
      console.log(`Processing request: action=${action}, params=${JSON.stringify(params, null, 2)}`);
    } catch (jsonError) {
      console.error("Error parsing request JSON:", jsonError);
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
    
    // Validate required parameters
    if (!action) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing required 'action' parameter",
      }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        },
      });
    }
    
    // Add request timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout
    
    try {
      let result;
      console.log(`Processing ${action} request with params:`, params);
      
      switch (action) {
        case "competitors_domain":
          // Validate domain parameter
          if (!params.domain) {
            throw new Error("Missing required 'domain' parameter");
          }
          
          result = await getCompetitorDomains(
            params.domain,
            params.location_code,
            params.limit
          );
          break;
        case "domain_keywords":
          try {
            if (!params.domain) {
              throw new Error("Missing required 'domain' parameter");
            }
            
            // Clean domain by removing protocol prefixes if present
            const cleanedDomain = params.domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
            console.log(`Processing domain_keywords for cleaned domain: ${cleanedDomain}`);
            
            result = await getDomainKeywords(
              cleanedDomain,
              params.location_code,
              params.sort_by
            );
            console.log(`Successfully fetched keywords for ${cleanedDomain}`);
          } catch (error) {
            console.error(`Error in domain_keywords for ${params.domain}:`, error);
            clearTimeout(timeoutId);
            
            // Determine if this is a timeout error for better client-side handling
            const isTimeoutError = 
              error.name === 'TimeoutError' || 
              error.name === 'AbortError' || 
              (error.message && (
                error.message.includes('timeout') || 
                error.message.includes('timed out') || 
                error.message.includes('aborted')
              ));
            
            return new Response(JSON.stringify({
              success: false,
              error: `${error.message || 'Unknown error'}`,
              errorType: isTimeoutError ? 'timeout' : 'api',
              domain: params.domain
            }), {
              status: isTimeoutError ? 504 : 500,
              headers: { 
                "Content-Type": "application/json",
                ...corsHeaders
              },
            });
          }
          break;
        case "domain_intersection":
          if (!params.target1 || !params.target2) {
            throw new Error("Missing required 'target1' or 'target2' parameter");
          }
          
          result = await getDomainIntersection(
            params.target1,
            params.target2,
            params.location_code
          );
          break;
        case "domain_overview":
          if (!params.domain) {
            throw new Error("Missing required 'domain' parameter");
          }
          
          result = await getDomainOverview(
            params.domain,
            params.location_code
          );
          break;
        case "ranked_keywords":
          if (!params.domain) {
            throw new Error("Missing required 'domain' parameter");
          }
          
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
      
      // Check if result is empty or undefined
      if (!result || !result.tasks || result.tasks.length === 0) {
        console.warn(`Empty or undefined result for ${action} request`);
        return new Response(JSON.stringify({
          success: true,
          results: [],
        }), {
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          },
        });
      }
      
      return new Response(JSON.stringify({
        success: true,
        results: result?.tasks?.[0]?.result?.[0]?.items || result?.tasks?.[0]?.result || [],
      }), {
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        },
      });
    } catch (actionError) {
      clearTimeout(timeoutId);
      throw actionError; // Let the outer catch handle this
    }
  } catch (error) {
    console.error("Error processing request:", error);
    
    // Determine if the error is a timeout error
    const isTimeoutError = 
      error.name === 'AbortError' || 
      error.name === 'TimeoutError' || 
      (error.message && (
        error.message.includes('timeout') || 
        error.message.includes('timed out') || 
        error.message.includes('aborted')
      ));
    
    return new Response(JSON.stringify({
      success: false,
      error: isTimeoutError 
        ? "Request timed out. The DataForSEO API may be experiencing delays." 
        : error.message || "Unknown error",
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
