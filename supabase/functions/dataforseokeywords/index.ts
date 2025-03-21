
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const DATAFORSEO_USERNAME = Deno.env.get("DATAFORSEO_USERNAME") || "armin@revologyanalytics.com";
const DATAFORSEO_PASSWORD = Deno.env.get("DATAFORSEO_PASSWORD") || "ab4016dc9302b8cf";
const AUTH_HEADER = btoa(`${DATAFORSEO_USERNAME}:${DATAFORSEO_PASSWORD}`);

async function callDataForSeoApi(endpoint: string, data: any) {
  try {
    const response = await fetch(`https://api.dataforseo.com${endpoint}`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${AUTH_HEADER}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DataForSEO API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    
    const result = await response.json();
    
    // Check for API-level errors
    if (result.status_code !== 20000) {
      throw new Error(`DataForSEO API error: ${result.status_message}`);
    }
    
    return result;
  } catch (error) {
    console.error("Error calling DataForSEO API:", error);
    throw error;
  }
}

/**
 * Fetch related keywords from DataForSEO
 */
async function getRelatedKeywords(
  keyword: string, 
  locationCode: number = 2840, 
  languageCode: string = "en",
  depth: number = 2,
  limit: number = 100
) {
  const data = [{
    keyword,
    location_code: locationCode,
    language_code: languageCode,
    depth,
    include_seed_keyword: false,
    include_serp_info: false,
    ignore_synonyms: false,
    include_clickstream_data: false,
    limit
  }];
  
  try {
    const result = await callDataForSeoApi("/v3/dataforseo_labs/google/related_keywords/live", data);
    
    if (!result.tasks || !result.tasks[0] || !result.tasks[0].result) {
      return [];
    }
    
    return result.tasks[0].result;
  } catch (error) {
    console.error("Error fetching related keywords:", error);
    throw error;
  }
}

/**
 * Fetch keyword suggestions from DataForSEO
 */
async function getKeywordSuggestions(
  keyword: string, 
  locationCode: number = 2840, 
  languageCode: string = "en",
  limit: number = 100
) {
  const data = [{
    keyword,
    location_code: locationCode,
    language_code: languageCode,
    include_seed_keyword: false,
    include_serp_info: false,
    ignore_synonyms: false,
    include_clickstream_data: false,
    exact_match: false,
    limit
  }];
  
  try {
    const result = await callDataForSeoApi("/v3/dataforseo_labs/google/keyword_suggestions/live", data);
    
    if (!result.tasks || !result.tasks[0] || !result.tasks[0].result) {
      return [];
    }
    
    return result.tasks[0].result;
  } catch (error) {
    console.error("Error fetching keyword suggestions:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const body = await req.json();
    const action = body.action;
    
    console.log(`DataForSEO Keywords function called with action: ${action}`);
    let results = [];

    // Route the request to the appropriate service based on the action
    switch (action) {
      case 'related_keywords':
        results = await getRelatedKeywords(
          body.keyword,
          body.location_code || 2840,
          body.language_code || "en",
          body.depth || 2,
          body.limit || 100
        );
        break;
      case 'keyword_suggestions':
        results = await getKeywordSuggestions(
          body.keyword,
          body.location_code || 2840,
          body.language_code || "en",
          body.limit || 100
        );
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Return the result
    return new Response(JSON.stringify({
      success: true,
      results: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(`Error in DataForSEO Keywords function:`, error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
