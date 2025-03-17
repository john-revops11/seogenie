
import { useState } from "react";
import { toast } from "sonner";
import { fetchDomainKeywords, fetchDomainAnalytics, fetchBacklinkData } from "@/services/keywords/api/dataForSeo/dataForSeoClient";

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

export function useDataForSeoClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDomainKeywords = async (domain: string): Promise<DataForSeoResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchDomainKeywords(domain);
      setIsLoading(false);
      return response as DataForSeoResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setIsLoading(false);
      toast.error(`API Error: ${errorMessage}`);
      console.error('DataForSEO API error:', err);
      return { status_code: 500, status_message: errorMessage, tasks: [], error: errorMessage };
    }
  };
  
  const getDomainOverview = async (domain: string): Promise<DataForSeoResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchDomainAnalytics(domain);
      setIsLoading(false);
      return response as DataForSeoResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setIsLoading(false);
      toast.error(`API Error: ${errorMessage}`);
      console.error('DataForSEO Domain Overview API error:', err);
      return { status_code: 500, status_message: errorMessage, tasks: [], error: errorMessage };
    }
  };
  
  const getBacklinkSummary = async (domain: string): Promise<DataForSeoResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchBacklinkData(domain);
      setIsLoading(false);
      return response as DataForSeoResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setIsLoading(false);
      toast.error(`API Error: ${errorMessage}`);
      console.error('DataForSEO Backlink API error:', err);
      return { status_code: 500, status_message: errorMessage, tasks: [], error: errorMessage };
    }
  };
  
  return {
    isLoading,
    error,
    getDomainKeywords,
    getDomainOverview,
    getBacklinkSummary
  };
}
