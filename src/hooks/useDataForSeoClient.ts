
import { useState } from "react";
import { toast } from "sonner";
import { getApiKey } from "@/services/apiIntegrationService";
import { fetchDomainKeywords } from "@/services/keywords/api/dataForSeo/dataForSeoClient";

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

  const getDomainKeywords = async (domain: string, options?: DataForSeoOptions) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchDomainKeywords(domain);
      setIsLoading(false);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setIsLoading(false);
      toast.error(`API Error: ${errorMessage}`);
      console.error('DataForSEO API error:', err);
      return { status_code: 500, status_message: errorMessage, tasks: [], error: errorMessage };
    }
  };
  
  return {
    isLoading,
    error,
    getDomainKeywords
  };
}
