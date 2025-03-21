
import { v5 as uuidv5 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

// DataForSEO credentials
const username = "armin@revologyanalytics.com";
const password = "ab4016dc9302b8cf";

// UUID namespace for generating consistent hashes
const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

// In-memory API response cache for even faster responses
const apiCache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes for in-memory cache

export type DataForSEOEndpoint = 
  | '/v3/dataforseo_labs/google/domain_rank_overview/live'
  | '/v3/serp/google/organic/live/regular'
  | '/v3/on_page/tasks_post'
  | '/v3/backlinks/backlinks_overview/live'
  | '/v3/keywords_data/google_ads/live/regular'
  | '/v3/competitors_domain/google/organic/live/regular'
  | '/v3/keywords_data/google_ads/keywords_for_site/live'
  | '/v3/keywords_data/google/search_volume/live'
  | '/v3/dataforseo_labs/google/domain_intersection/live'
  | '/v3/dataforseo_labs/google/competitors_domain/live'
  | '/v3/dataforseo_labs/google/related_keywords/live'
  | '/v3/dataforseo_labs/google/keyword_suggestions/live';

// Generate a consistent hash for caching
export const generateRequestHash = (endpoint: string, data: any): string => {
  const requestString = `${endpoint}${JSON.stringify(data)}`;
  return uuidv5(requestString, NAMESPACE);
};

// Price mapping for DataForSEO endpoints (estimated cost per request in USD)
export const ENDPOINT_COSTS: Record<string, number> = {
  '/v3/dataforseo_labs/google/domain_rank_overview/live': 0.03,
  '/v3/serp/google/organic/live/regular': 0.05,
  '/v3/on_page/tasks_post': 0.02,
  '/v3/backlinks/backlinks_overview/live': 0.03,
  '/v3/keywords_data/google_ads/live/regular': 0.04,
  '/v3/competitors_domain/google/organic/live/regular': 0.05,
  '/v3/keywords_data/google_ads/keywords_for_site/live': 0.05,
  '/v3/keywords_data/google/search_volume/live': 0.01,
  '/v3/dataforseo_labs/google/domain_intersection/live': 0.08,
  '/v3/dataforseo_labs/google/competitors_domain/live': 0.05,
  '/v3/dataforseo_labs/google/related_keywords/live': 0.04,
  '/v3/dataforseo_labs/google/keyword_suggestions/live': 0.04,
};

// Helper function to check if a table exists
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('count')
      .limit(1);
      
    return !error;
  } catch (e) {
    return false;
  }
}

// Create a fallback response for certain endpoints
export function createFallbackResponse(endpoint: DataForSEOEndpoint, target: string): any {
  if (endpoint === '/v3/backlinks/backlinks_overview/live') {
    return {
      status_code: 200,
      status_message: "No backlink data available for this domain",
      tasks: [
        {
          id: "fallback",
          status_code: 200,
          status_message: "No data",
          time: new Date().toISOString(),
          result: [
            {
              target: target,
              domain_rank: 0,
              backlinks_count: 0,
              referring_domains_count: 0
            }
          ]
        }
      ]
    };
  }
  
  return {
    status_code: 200,
    status_message: "No data available",
    tasks: [
      {
        id: "fallback",
        status_code: 200,
        status_message: "No data",
        time: new Date().toISOString(),
        result: []
      }
    ]
  };
}

// Clear API cache
export const clearApiCache = (): void => {
  Object.keys(apiCache).forEach(key => delete apiCache[key]);
  console.log("DataForSEO API cache cleared");
};

// The main API call function with caching
export const callDataForSeoApi = async <T>(endpoint: DataForSEOEndpoint, data: any): Promise<T | null> => {
  const credentials = btoa(`${username}:${password}`);
  const url = `https://api.dataforseo.com${endpoint}`;
  
  // Generate a request hash for caching
  const requestHash = generateRequestHash(endpoint, data);
  
  // Try to get the user's ID for database caching
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  
  // Check if we have a valid cached response in memory
  const cachedItem = apiCache[requestHash];
  if (cachedItem && (Date.now() - cachedItem.timestamp < CACHE_EXPIRATION)) {
    console.log(`Using in-memory cached DataForSEO API response for: ${endpoint}`);
    return cachedItem.data as T;
  }
  
  // Check if the api_requests table exists
  const apiRequestsTableExists = await tableExists('api_requests');
  
  // Check if we have a cached response in the database
  if (userId && apiRequestsTableExists) {
    try {
      const { data: cachedResponse, error } = await supabase.rpc(
        'get_cached_api_response',
        { 
          p_request_hash: requestHash,
          p_user_id: userId
        }
      );
      
      if (!error && cachedResponse) {
        console.log(`Using database cached DataForSEO API response for: ${endpoint}`);
        
        // Update in-memory cache
        apiCache[requestHash] = {
          data: cachedResponse,
          timestamp: Date.now()
        };
        
        return cachedResponse as T;
      }
    } catch (e) {
      console.error("Error accessing cached response:", e);
      // Continue with API call if cache access fails
    }
  }

  try {
    console.log(`Calling DataForSEO API: ${endpoint}`);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${credentials}`
      },
      body: JSON.stringify(data)
    });

    // Special handling for backlinks API - create a fallback response for 404 errors
    if (endpoint === '/v3/backlinks/backlinks_overview/live' && response.status === 404) {
      console.log(`Backlink data not found for domain, creating fallback response`);
      const target = data[0]?.target || "unknown";
      
      // Create a fallback response with zero values
      const fallbackResponse = createFallbackResponse(endpoint, target);
      
      // Cache the fallback response
      apiCache[requestHash] = {
        data: fallbackResponse,
        timestamp: Date.now()
      };
      
      // Store in database if user is authenticated and table exists
      if (userId && apiRequestsTableExists) {
        try {
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + 7); // Cache for 7 days
          
          await supabase.rpc(
            'store_api_request',
            {
              p_user_id: userId,
              p_endpoint: endpoint,
              p_request_data: data,
              p_response_data: fallbackResponse,
              p_expires_at: expirationDate.toISOString(),
              p_request_hash: requestHash,
              p_cost: ENDPOINT_COSTS[endpoint] || 0.01
            }
          );
        } catch (e) {
          console.error("Error storing API response:", e);
        }
      }
      
      return fallbackResponse as T;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DataForSEO API ${endpoint} responded with ${response.status}: ${errorText}`);
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const responseData = await response.json();
    
    if (responseData.status_code !== 20000) {
      throw new Error(`DataForSEO API error: ${responseData.status_message || 'Unknown error'}`);
    }
    
    // Cache the successful response in memory
    apiCache[requestHash] = {
      data: responseData,
      timestamp: Date.now()
    };
    
    // Store in database if user is authenticated and table exists
    if (userId && apiRequestsTableExists) {
      try {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7); // Cache for 7 days
        
        await supabase.rpc(
          'store_api_request',
          {
            p_user_id: userId,
            p_endpoint: endpoint,
            p_request_data: data,
            p_response_data: responseData,
            p_expires_at: expirationDate.toISOString(),
            p_request_hash: requestHash,
            p_cost: ENDPOINT_COSTS[endpoint] || 0.01
          }
        );
      } catch (e) {
        console.error("Error storing API response:", e);
      }
    }
    
    console.log("DataForSEO API response:", responseData);
    return responseData as T;
  } catch (error) {
    console.error(`Error calling DataForSEO API ${endpoint}:`, error);
    
    // Don't show toast for backlinks 404 error as we handle it gracefully
    if (!(endpoint === '/v3/backlinks/backlinks_overview/live' && error instanceof Error && error.message.includes('404'))) {
      toast.error(`API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return null;
  }
};
