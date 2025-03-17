
// DataForSEO API client service
import { toast } from 'sonner';
import { DataForSeoResponse } from '@/hooks/useDataForSeoClient'; 

// DataForSEO credentials
const username = "armin@revologyanalytics.com";
const password = "ab4016dc9302b8cf";

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
  | '/v3/dataforseo_labs/google/competitors_domain/live';

// In-memory API response cache
const apiCache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes

export const callDataForSeoApi = async <T>(endpoint: DataForSEOEndpoint, data: any): Promise<T | null> => {
  const credentials = btoa(`${username}:${password}`);
  const url = `https://api.dataforseo.com${endpoint}`;
  
  // Create a cache key based on the endpoint and request data
  const cacheKey = `${endpoint}_${JSON.stringify(data)}`;
  
  // Check if we have a valid cached response
  const cachedItem = apiCache[cacheKey];
  if (cachedItem && (Date.now() - cachedItem.timestamp < CACHE_EXPIRATION)) {
    console.log(`Using cached DataForSEO API response for: ${endpoint}`);
    return cachedItem.data as T;
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DataForSEO API ${endpoint} responded with ${response.status}: ${errorText}`);
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const responseData = await response.json();
    
    if (responseData.status_code !== 20000) {
      throw new Error(`DataForSEO API error: ${responseData.status_message || 'Unknown error'}`);
    }
    
    // Cache the successful response
    apiCache[cacheKey] = {
      data: responseData,
      timestamp: Date.now()
    };
    
    console.log("DataForSEO API response:", responseData);
    return responseData as T;
  } catch (error) {
    console.error(`Error calling DataForSEO API ${endpoint}:`, error);
    toast.error(`API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    include_clickstream_data: true,
    intersections: false,
    item_types: ["organic", "featured_snippet"],
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

// Clear API cache
export const clearApiCache = (): void => {
  Object.keys(apiCache).forEach(key => delete apiCache[key]);
  console.log("DataForSEO API cache cleared");
};
