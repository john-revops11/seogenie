
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, supabase, generateRequestHash, ENDPOINT_COSTS } from "./config.ts";
import {
  getDomainKeywords,
  getCompetitorDomains,
  getRankedKeywords,
  getDomainIntersection,
  getDomainOverview
} from "./services/index.ts";

// Check cache before making API call
async function checkCache(endpoint: string, requestData: any, userId?: string): Promise<any | null> {
  if (!userId) return null;
  
  try {
    const requestHash = generateRequestHash({endpoint, requestData});
    
    // Check if we have a cached response in the database
    const { data: cachedResponse, error } = await supabase
      .from('api_requests')
      .select('response_data, created_at')
      .eq('request_hash', requestHash)
      .eq('user_id', userId)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error || !cachedResponse || cachedResponse.length === 0) {
      return null;
    }
    
    console.log(`Using cached response for request hash: ${requestHash}`);
    return cachedResponse[0].response_data;
  } catch (error) {
    console.error("Error checking cache:", error);
    return null;
  }
}

// Save response to cache
async function saveToCache(endpoint: string, requestData: any, responseData: any, userId?: string): Promise<void> {
  if (!userId) return;
  
  try {
    const requestHash = generateRequestHash({endpoint, requestData});
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7); // Cache for 7 days
    
    // Insert into api_requests table
    const { error } = await supabase.from('api_requests').insert({
      user_id: userId,
      endpoint,
      request_data: requestData,
      response_data: responseData,
      expires_at: expirationDate.toISOString(),
      request_hash: requestHash,
      cost: ENDPOINT_COSTS[endpoint] || 0.01
    });
    
    if (error) {
      console.error("Error saving to cache:", error);
    } else {
      console.log(`Saved response to cache for endpoint ${endpoint}`);
    }
  } catch (error) {
    console.error("Error saving to cache:", error);
  }
}

// Extract userId from request
function getUserId(req: Request): string | undefined {
  try {
    const authHeader = req.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) return undefined;
    
    const token = authHeader.substring(7);
    // In a real implementation, you would verify the JWT token
    // For now, let's extract the sub claim directly
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return undefined;
    
    const payload = JSON.parse(atob(tokenParts[1]));
    return payload.sub;
  } catch {
    return undefined;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the request body
    const body = await req.json();
    const action = body.action;
    const userId = getUserId(req);
    
    console.log(`DataForSEO function called with action: ${action}${userId ? ' (authenticated)' : ' (anonymous)'}`);
    
    // First check if we have a cached response
    let endpoint: string;
    let requestData: any;
    
    switch (action) {
      case 'domain_keywords':
        endpoint = '/v3/keywords_data/google_ads/keywords_for_site/live';
        requestData = {
          target: body.domain,
          location_code: body.location_code,
          language_code: body.language_code || "en"
        };
        break;
      case 'competitor_domains':
        endpoint = '/v3/dataforseo_labs/google/competitors_domain/live';
        requestData = {
          target: body.domain,
          location_code: body.location_code || 2840,
          limit: body.limit || 10
        };
        break;
      case 'ranked_keywords':
        endpoint = '/v3/serp/google/organic/live/regular';
        requestData = {
          target: body.domain,
          location_code: body.location_code || 2840,
          language_code: body.language_code || "en",
          limit: body.limit || 100
        };
        break;
      case 'domain_intersection':
        endpoint = '/v3/dataforseo_labs/google/domain_intersection/live';
        requestData = {
          target1: body.target1,
          target2: body.target2,
          location_code: body.location_code || 2840,
          limit: body.limit || 100
        };
        break;
      case 'domain_overview':
        endpoint = '/v3/dataforseo_labs/google/domain_rank_overview/live';
        requestData = {
          target: body.domain,
          location_code: body.location_code || 2840
        };
        break;
      default:
        endpoint = '';
        requestData = null;
    }
    
    // Check cache if we have a valid endpoint and request data
    let result;
    if (endpoint && requestData) {
      const cachedResult = await checkCache(endpoint, requestData, userId);
      if (cachedResult) {
        console.log(`Cache hit for ${action} - returning cached data`);
        result = cachedResult;
      }
    }
    
    // If no cached result, proceed with the API call
    if (!result) {
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
      
      // Save successful response to cache
      if (result && !result.error && endpoint && requestData) {
        await saveToCache(endpoint, requestData, result, userId);
      }
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
