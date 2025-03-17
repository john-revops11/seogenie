
import { useState } from "react";
import { toast } from "sonner";
import { getApiKey } from "@/services/apiIntegrationService";

export interface DataForSeoOptions {
  location_name?: string;
  language_name?: string;
}

export interface DataForSeoResponse {
  status_code: number;
  status_message: string;
  tasks: any[];
  error?: string;
}

export function useDataForSeoClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callDataForSeoApi = async (
    endpoint: string, 
    data: any,
    options: { showToast?: boolean } = { showToast: true }
  ): Promise<DataForSeoResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First try to get credentials from the API integration service
      const apiCredentials = getApiKey('dataforseo');
      
      if (!apiCredentials) {
        // If no credentials are found in the frontend, use the Supabase Edge Function
        const response = await fetch(`https://rgtptfhlkplnahzehpci.supabase.co/functions/v1/dataforseo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'proxy_request',
            endpoint: endpoint,
            data: data
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
          throw new Error(`DataForSEO error: ${result.error}`);
        }
        
        return result as DataForSeoResponse;
      } else {
        // If credentials are found in the frontend, use them directly
        const [login, password] = apiCredentials.split(':');
        const auth = 'Basic ' + btoa(`${login}:${password}`);
        
        const response = await fetch(`https://api.dataforseo.com${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        
        if (result.status_code !== 20000) {
          throw new Error(`DataForSEO error: ${result.status_message}`);
        }
        
        return result as DataForSeoResponse;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      if (options.showToast) {
        toast.error(`API Error: ${errorMessage}`);
      }
      console.error('DataForSEO API error:', err);
      return { status_code: 500, status_message: errorMessage, tasks: [], error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Updated to use the correct endpoint for keyword data
  const getDomainKeywords = async (domain: string, options?: DataForSeoOptions) => {
    const data = [{
      target: domain,
      location_name: options?.location_name || "United States",
      language_name: options?.language_name || "English",
      limit: 100
    }];
    
    // Change from dataforseo_labs endpoint to keywords_data endpoint which is more reliable
    return callDataForSeoApi('/v3/keywords_data/google_ads/keywords_for_site/live', data);
  };
  
  const getDomainOverview = async (domain: string, options?: DataForSeoOptions) => {
    const data = [{
      target: domain,
      location_name: options?.location_name || "United States",
      language_name: options?.language_name || "English"
    }];
    
    return callDataForSeoApi('/v3/dataforseo_labs/google/domain_rank_overview/live', data);
  };
  
  const getBacklinkSummary = async (domain: string) => {
    const data = [{
      target: domain,
      limit: 100
    }];
    
    return callDataForSeoApi('/v3/backlinks/summary/live', data);
  };

  return {
    isLoading,
    error,
    getDomainOverview,
    getDomainKeywords,
    getBacklinkSummary
  };
}
