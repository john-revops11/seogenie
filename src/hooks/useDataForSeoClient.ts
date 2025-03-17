
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

  const getCredentials = () => {
    const apiCredentials = getApiKey('dataforseo');
    
    if (!apiCredentials) {
      throw new Error('DataForSEO API credentials not configured');
    }
    
    const [login, password] = apiCredentials.split(':');
    return { login, password };
  };

  const callDataForSeoApi = async (
    endpoint: string, 
    data: any,
    options: { showToast?: boolean } = { showToast: true }
  ): Promise<DataForSeoResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { login, password } = getCredentials();
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

  const getDomainOverview = async (domain: string, options?: DataForSeoOptions) => {
    const data = [{
      target: domain,
      location_name: options?.location_name || "United States",
      language_name: options?.language_name || "English"
    }];
    
    return callDataForSeoApi('/v3/dataforseo_labs/google/domain_rank_overview/live', data);
  };
  
  const getDomainKeywords = async (domain: string, options?: DataForSeoOptions) => {
    const data = [{
      target: domain,
      location_name: options?.location_name || "United States",
      language_name: options?.language_name || "English",
      limit: 100
    }];
    
    return callDataForSeoApi('/v3/dataforseo_labs/google/domain_keywords/live', data);
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
