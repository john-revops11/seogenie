
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCompetitorsDomain } from "./services.ts";
import { getDomainKeywords } from "./services.ts";
import { getDomainIntersection } from "./services.ts";
import { getDomainOverview } from "./services.ts";
import { getRankedKeywords } from "./services.ts";

serve(async (req) => {
  // Handle CORS for preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const { action, ...params } = await req.json();
    
    let result;
    
    switch (action) {
      case "competitors_domain":
        result = await getCompetitorsDomain(
          params.domain,
          params.location_code,
          params.limit
        );
        break;
      case "domain_keywords":
        result = await getDomainKeywords(
          params.domain,
          params.location_code,
          params.sort_by
        );
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
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 400,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
    });
  }
});
