
// DataForSEO API client service
import { toast } from 'sonner';
import { DataForSeoResponse } from '@/hooks/useDataForSeoClient';
import { supabase } from "@/integrations/supabase/client";
import { v5 as uuidv5 } from 'uuid';

// DataForSEO credentials
const username = "armin@revologyanalytics.com";
const password = "ab4016dc9302b8cf";

// Price mapping for DataForSEO endpoints (estimated cost per request in USD)
const ENDPOINT_COSTS: Record<string, number> = {
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

// UUID namespace for generating consistent hashes
const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

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

// In-memory API response cache for even faster responses
const apiCache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes for in-memory cache

// Generate a consistent hash for caching
const generateRequestHash = (endpoint: string, data: any): string => {
  const requestString = `${endpoint}${JSON.stringify(data)}`;
  return uuidv5(requestString, NAMESPACE);
};

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
  
  // Check if we have a cached response in the database
  if (userId) {
    const { data: cachedResponse, error } = await supabase
      .from('api_requests')
      .select('response_data, created_at')
      .eq('request_hash', requestHash)
      .eq('user_id', userId)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (!error && cachedResponse.length > 0) {
      console.log(`Using database cached DataForSEO API response for: ${endpoint}`);
      
      // Update in-memory cache
      const responseData = cachedResponse[0].response_data;
      apiCache[requestHash] = {
        data: responseData,
        timestamp: Date.now()
      };
      
      return responseData as T;
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
      const fallbackResponse = {
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
      
      // Cache the fallback response
      apiCache[requestHash] = {
        data: fallbackResponse,
        timestamp: Date.now()
      };
      
      // Store in database if user is authenticated
      if (userId) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7); // Cache for 7 days
        
        await supabase.from('api_requests').insert({
          user_id: userId,
          endpoint,
          request_data: data,
          response_data: fallbackResponse,
          expires_at: expirationDate.toISOString(),
          request_hash: requestHash,
          cost: ENDPOINT_COSTS[endpoint] || 0.01
        });
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
    
    // Store in database if user is authenticated
    if (userId) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7); // Cache for 7 days
      
      await supabase.from('api_requests').insert({
        user_id: userId,
        endpoint,
        request_data: data,
        response_data: responseData,
        expires_at: expirationDate.toISOString(),
        request_hash: requestHash,
        cost: ENDPOINT_COSTS[endpoint] || 0.01
      });
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

// Domain Analytics - this can provide most metrics in a single API call
export const fetchDomainAnalytics = async (domain: string, locationCode: number = 2840): Promise<DataForSeoResponse | null> => {
  return callDataForSeoApi<DataForSeoResponse>('/v3/dataforseo_labs/google/domain_rank_overview/live', [{ 
    target: domain,
    location_code: locationCode,
    language_code: "en",
    ignore_synonyms: false
  }]);
};

// Domain Keywords
export const fetchDomainKeywords = async (domain: string): Promise<DataForSeoResponse | null> => {
  return callDataForSeoApi<DataForSeoResponse>('/v3/keywords_data/google_ads/keywords_for_site/live', [
    {
      target: domain,
      location_code: 2840,
      language_code: "en",
      sort_by: "relevance"
    }
  ]);
};

// Backlinks Analytics
export const fetchBacklinkData = async (domain: string): Promise<DataForSeoResponse | null> => {
  return callDataForSeoApi<DataForSeoResponse>('/v3/backlinks/backlinks_overview/live', [{ 
    target: domain,
    limit: 10
  }]);
};

// Domain Intersection for Keyword Gaps
export const fetchDomainIntersection = async (
  target1Domain: string, 
  target2Domain: string,
  locationCode: number = 2840
): Promise<DataForSeoResponse | null> => {
  console.log(`DataForSEO Intersection - Target1: ${target1Domain}, Target2: ${target2Domain}, Location: ${locationCode}`);
  
  return callDataForSeoApi<DataForSeoResponse>('/v3/dataforseo_labs/google/domain_intersection/live', [{ 
    target1: target1Domain,
    target2: target2Domain,
    location_code: locationCode,
    language_code: "en",
    include_serp_info: true,
    include_clickstream_data: false,
    intersections: true,
    item_types: ["organic", "paid", "featured_snippet"],
    limit: 100
  }]);
};

// Keyword Search Volume - used for bulk keyword data
export const fetchKeywordVolume = async (keywords: string[]): Promise<DataForSeoResponse | null> => {
  return callDataForSeoApi<DataForSeoResponse>('/v3/keywords_data/google/search_volume/live', [
    {
      language_code: "en",
      location_code: 2840,
      keywords
    }
  ]);
};

// Competitors Domain - new function for the competitors feature
export const fetchCompetitorsDomain = async (
  targetDomain: string,
  locationCode: number = 2840,
  limit: number = 10
): Promise<DataForSeoResponse | null> => {
  return callDataForSeoApi<DataForSeoResponse>('/v3/dataforseo_labs/google/competitors_domain/live', [{ 
    target: targetDomain,
    location_code: locationCode,
    language_code: "en",
    exclude_top_domains: false,
    ignore_synonyms: false,
    include_clickstream_data: false,
    item_types: ["organic", "paid"],
    limit: limit,
    order_by: ["sum_position,desc"]
  }]);
};

// Related Keywords
export const fetchRelatedKeywords = async (
  keyword: string,
  locationCode: number = 2840,
  depth: number = 2,
  limit: number = 100
): Promise<DataForSeoResponse | null> => {
  return callDataForSeoApi<DataForSeoResponse>('/v3/dataforseo_labs/google/related_keywords/live', [{ 
    keyword,
    location_code: locationCode,
    language_code: "en",
    depth,
    include_seed_keyword: false,
    include_serp_info: false,
    ignore_synonyms: false,
    include_clickstream_data: false,
    limit
  }]);
};

// Keyword Suggestions
export const fetchKeywordSuggestions = async (
  keyword: string,
  locationCode: number = 2840,
  limit: number = 100
): Promise<DataForSeoResponse | null> => {
  return callDataForSeoApi<DataForSeoResponse>('/v3/dataforseo_labs/google/keyword_suggestions/live', [{ 
    keyword,
    location_code: locationCode,
    language_code: "en",
    include_seed_keyword: false,
    include_serp_info: false,
    ignore_synonyms: false,
    include_clickstream_data: false,
    exact_match: false,
    limit
  }]);
};

// Get the estimated cost of DataForSEO API usage
export const getDataForSEOUsageCost = async (userId?: string): Promise<{ totalCost: number, requestCount: number } | null> => {
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id;
  }
  
  if (!userId) return null;
  
  const { data, error } = await supabase
    .from('api_usage')
    .select('estimated_cost, request_count')
    .eq('user_id', userId)
    .eq('api_name', 'DataForSEO')
    .order('usage_date', { ascending: false });
  
  if (error || !data) {
    console.error('Error fetching API usage:', error);
    return null;
  }
  
  // Sum up total cost and requests
  const totalCost = data.reduce((sum, record) => sum + (record.estimated_cost || 0), 0);
  const requestCount = data.reduce((sum, record) => sum + (record.request_count || 0), 0);
  
  return { totalCost, requestCount };
};

// Clear API cache
export const clearApiCache = (): void => {
  Object.keys(apiCache).forEach(key => delete apiCache[key]);
  console.log("DataForSEO API cache cleared");
};
