
import { useState, useRef } from "react";
import { toast } from "sonner";
import { 
  fetchDomainKeywords, 
  fetchDomainAnalytics, 
  fetchBacklinkData,
  fetchDomainIntersection
} from "@/services/keywords/api/dataForSeo/dataForSeoClient";

export interface DataForSeoOptions {
  location_name?: string;
  language_name?: string;
}

export interface DataForSeoResponse {
  status_code: number;
  status_message: string;
  tasks: {
    id: string;
    status_code: number;
    status_message: string;
    time: string;
    result: any[];
  }[];
  error?: string;
}

// Default empty response for when an API call fails
const DEFAULT_ERROR_RESPONSE: DataForSeoResponse = {
  status_code: 500,
  status_message: "No data available",
  tasks: [],
  error: "Failed to fetch data"
};

// Cache to store API responses
interface CacheItem {
  response: DataForSeoResponse;
  timestamp: number;
}

// Cache expiration time (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

export function useDataForSeoClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use useRef for cache to persist between renders
  const cache = useRef<Record<string, CacheItem>>({});
  
  // Helper for API calls with caching
  const cachedApiCall = async (
    cacheKey: string,
    apiFn: () => Promise<DataForSeoResponse | null>
  ): Promise<DataForSeoResponse> => {
    // Check if we have a valid cached response
    const cachedItem = cache.current[cacheKey];
    if (cachedItem && (Date.now() - cachedItem.timestamp < CACHE_EXPIRY)) {
      console.log(`Using cached data for: ${cacheKey}`);
      return cachedItem.response;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiFn();
      
      // If the API call fails, return an error response
      if (!response) {
        throw new Error("API call failed");
      }
      
      // Cache the response
      cache.current[cacheKey] = {
        response: response,
        timestamp: Date.now()
      };
      
      setIsLoading(false);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setIsLoading(false);
      toast.error(`API Error: ${errorMessage}`);
      console.error('DataForSEO API error:', err);
      return { ...DEFAULT_ERROR_RESPONSE, status_message: errorMessage, error: errorMessage };
    }
  };

  const getDomainKeywords = async (domain: string): Promise<DataForSeoResponse> => {
    return cachedApiCall(`domain_keywords_${domain}`, () => fetchDomainKeywords(domain));
  };
  
  const getDomainOverview = async (domain: string): Promise<DataForSeoResponse> => {
    return cachedApiCall(`domain_overview_${domain}`, () => fetchDomainAnalytics(domain));
  };
  
  const getBacklinkSummary = async (domain: string): Promise<DataForSeoResponse> => {
    // For backlink API, we need special handling since it might return null for some domains
    const cacheKey = `backlink_summary_${domain}`;
    const cachedItem = cache.current[cacheKey];
    
    if (cachedItem && (Date.now() - cachedItem.timestamp < CACHE_EXPIRY)) {
      console.log(`Using cached backlink data for: ${domain}`);
      return cachedItem.response;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchBacklinkData(domain);
      
      // When the backlinks API returns a null/404, provide a fallback with empty data
      if (!response) {
        console.warn('Backlink API not available for this domain, returning empty data');
        setIsLoading(false);
        
        const fallbackResponse = {
          status_code: 200,
          status_message: "No backlink data available for this domain",
          tasks: [{
            id: "fallback",
            status_code: 200,
            status_message: "No data",
            time: new Date().toISOString(),
            result: [{
              target: domain,
              domain_rank: 0,
              backlinks_count: 0,
              referring_domains_count: 0
            }]
          }],
        };
        
        // Cache the fallback response
        cache.current[cacheKey] = {
          response: fallbackResponse,
          timestamp: Date.now()
        };
        
        return fallbackResponse;
      }
      
      // Cache the actual response
      cache.current[cacheKey] = {
        response: response,
        timestamp: Date.now()
      };
      
      setIsLoading(false);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setIsLoading(false);
      toast.error(`API Error: ${errorMessage}`);
      console.error('DataForSEO Backlink API error:', err);
      return { ...DEFAULT_ERROR_RESPONSE, status_message: errorMessage, error: errorMessage };
    }
  };
  
  const getDomainIntersection = async (
    target1Domain: string, 
    target2Domain: string,
    locationCode: number = 2840
  ): Promise<DataForSeoResponse> => {
    const cacheKey = `domain_intersection_${target1Domain}_${target2Domain}_${locationCode}`;
    return cachedApiCall(cacheKey, () => fetchDomainIntersection(target1Domain, target2Domain, locationCode));
  };
  
  const clearCache = () => {
    cache.current = {};
    console.log("DataForSEO API cache cleared");
  };
  
  return {
    isLoading,
    error,
    getDomainKeywords,
    getDomainOverview,
    getBacklinkSummary,
    getDomainIntersection,
    clearCache
  };
}
