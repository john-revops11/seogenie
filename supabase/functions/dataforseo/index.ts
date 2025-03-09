
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// DataForSEO API credentials - should be moved to environment variables in production
const DFS_USERNAME = Deno.env.get("DATAFORSEO_USERNAME") || "armin@revologyanalytics.com";
const DFS_PASSWORD = Deno.env.get("DATAFORSEO_PASSWORD") || "ab4016dc9302b8cf";
const AUTH_HEADER = btoa(`${DFS_USERNAME}:${DFS_PASSWORD}`);

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to make DataForSEO API requests
async function makeDataForSEORequest(endpoint: string, data: any = null) {
  const url = `https://api.dataforseo.com${endpoint}`;
  
  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${AUTH_HEADER}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  
  try {
    console.log(`Making DataForSEO request to ${url}`);
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DataForSEO API error (${response.status}): ${errorText.substring(0, 200)}`);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const text = await response.text();
    
    if (!text || text.trim() === '') {
      throw new Error('API returned empty response');
    }
    
    const json = JSON.parse(text);
    console.log(`DataForSEO response status code: ${json.status_code}`);
    
    if (json.status_code !== 20000) {
      throw new Error(`API error: ${json.status_message || 'Unknown error'}`);
    }
    
    return json;
  } catch (error) {
    console.error(`DataForSEO request failed:`, error);
    throw error;
  }
}

// Get domain keywords
async function getDomainKeywords(domain: string, locationCode: number = 2840) {
  const data = [{
    target: domain.startsWith('http') ? domain : `https://${domain}`,
    location_code: locationCode,
    language_code: "en",
    limit: 100
  }];
  
  try {
    const result = await makeDataForSEORequest('/v3/keywords_data/google/organic/live', data);
    
    if (!result.tasks || result.tasks.length === 0 || !result.tasks[0].result) {
      throw new Error(`No results found for domain: ${domain}`);
    }
    
    const keywordsData = result.tasks[0].result[0]?.items || [];
    console.log(`Got ${keywordsData.length} keywords for domain ${domain}`);
    
    return {
      success: true,
      results: keywordsData.map((item: any) => ({
        keyword: item.keyword || "",
        position: item.position || null,
        monthly_search: item.search_volume || 0,
        cpc: item.cpc || 0,
        competition: item.competition || 0, 
        competition_index: item.competition_index || 50,
        rankingUrl: item.url || null,
      })),
    };
  } catch (error) {
    console.error(`Error getting domain keywords for ${domain}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get keyword volume data
async function getKeywordVolume(keywords: string[], locationCode: number = 2840) {
  if (!keywords || keywords.length === 0) {
    return { success: false, error: "No keywords provided" };
  }
  
  const tasks = [{
    language_code: "en",
    location_code: locationCode,
    keywords,
  }];
  
  try {
    const result = await makeDataForSEORequest('/v3/keywords_data/google/search_volume/live', tasks);
    
    if (!result.tasks || result.tasks.length === 0 || !result.tasks[0].result) {
      throw new Error('No data returned from API');
    }
    
    const items = result.tasks[0].result || [];
    
    return {
      success: true,
      results: items.map((item: any) => ({
        keyword: item.keyword || "",
        search_volume: item.search_volume || 0,
        cpc: item.cpc || 0,
        competition: item.competition || 0,
      })),
    };
  } catch (error) {
    console.error('Error getting keyword volume:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
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
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
