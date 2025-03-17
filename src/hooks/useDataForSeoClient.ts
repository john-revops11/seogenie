
import { useState } from "react";
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

export function useDataForSeoClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDomainKeywords = async (domain: string): Promise<DataForSeoResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchDomainKeywords(domain);
      setIsLoading(false);
      return response as DataForSeoResponse || DEFAULT_ERROR_RESPONSE;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setIsLoading(false);
      toast.error(`API Error: ${errorMessage}`);
      console.error('DataForSEO API error:', err);
      return { ...DEFAULT_ERROR_RESPONSE, status_message: errorMessage, error: errorMessage };
    }
  };
  
  const getDomainOverview = async (domain: string): Promise<DataForSeoResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchDomainAnalytics(domain);
      setIsLoading(false);
      return response as DataForSeoResponse || DEFAULT_ERROR_RESPONSE;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setIsLoading(false);
      toast.error(`API Error: ${errorMessage}`);
      console.error('DataForSEO Domain Overview API error:', err);
      return { ...DEFAULT_ERROR_RESPONSE, status_message: errorMessage, error: errorMessage };
    }
  };
  
  const getBacklinkSummary = async (domain: string): Promise<DataForSeoResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchBacklinkData(domain);
      
      // When the backlinks API returns a null/404, provide a fallback with empty data
      if (!response) {
        console.warn('Backlink API not available for this domain, returning empty data');
        setIsLoading(false);
        return {
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
      }
      
      setIsLoading(false);
      return response as DataForSeoResponse;
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
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching domain intersection for ${target1Domain} vs ${target2Domain} (location: ${locationCode})`);
      const response = await fetchDomainIntersection(target1Domain, target2Domain, locationCode);
      
      if (!response) {
        console.warn(`Domain intersection API not available for ${target1Domain} vs ${target2Domain}`);
        setIsLoading(false);
        return {
          status_code: 200,
          status_message: "No intersection data available",
          tasks: [{
            id: "fallback",
            status_code: 200,
            status_message: "No data",
            time: new Date().toISOString(),
            result: []
          }],
        };
      }
      
      // Properly type-cast the response before accessing properties
      const typedResponse = response as DataForSeoResponse;
      
      // Log more details for debugging
      if (typedResponse.tasks && typedResponse.tasks[0] && typedResponse.tasks[0].result) {
        console.log(`Domain intersection found ${typedResponse.tasks[0].result.length} results`);
        
        if (typedResponse.tasks[0].result.length > 0) {
          const firstResult = typedResponse.tasks[0].result[0];
          console.log(`Sample result: ${JSON.stringify(firstResult).substring(0, 200)}...`);
        }
      } else {
        console.warn("Domain intersection API returned no results");
      }
      
      setIsLoading(false);
      return typedResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setIsLoading(false);
      toast.error(`API Error: ${errorMessage}`);
      console.error('DataForSEO Domain Intersection API error:', err);
      return { ...DEFAULT_ERROR_RESPONSE, status_message: errorMessage, error: errorMessage };
    }
  };
  
  return {
    isLoading,
    error,
    getDomainKeywords,
    getDomainOverview,
    getBacklinkSummary,
    getDomainIntersection
  };
}
