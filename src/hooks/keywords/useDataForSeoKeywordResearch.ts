
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DataForSEOKeywordResult {
  keyword: string;
  searchVolume?: number;
  cpc?: number;
  competition?: number;
  trend?: number[];
  categories?: string[];
}

export function useDataForSeoKeywordResearch() {
  const [keywordResults, setKeywordResults] = useState<DataForSEOKeywordResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchKeywords = async (keyword: string, method: "related" | "suggestions") => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching ${method} keywords for: ${keyword}`);
      const functionName = method === "related" ? "related_keywords" : "keyword_suggestions";
      
      // Call the DataForSEO edge function
      const { data, error: fetchError } = await supabase.functions.invoke('dataforseokeywords', {
        body: {
          action: functionName,
          keyword: keyword.trim(),
          location_code: 2840, // US
          language_code: "en",
          limit: 100,
          depth: method === "related" ? 2 : undefined, // Only for related keywords
          include_seed_keyword: false
        },
      });
      
      if (fetchError) {
        throw new Error(`API request failed: ${fetchError.message}`);
      }
      
      if (!data) {
        throw new Error('No data returned from API');
      }
      
      if (!data.success) {
        throw new Error(data.error || 'API returned an error');
      }
      
      // Transform the API response to our format
      const transformedResults = data.results.map((item: any) => {
        // Different APIs have slightly different response formats
        return {
          keyword: item.keyword || "",
          searchVolume: item.search_volume || item.keyword_data?.keyword_info?.search_volume || 0,
          cpc: item.cpc || item.keyword_data?.keyword_info?.cpc || 0,
          competition: item.competition_index ? item.competition_index / 100 : 
                      (item.keyword_data?.keyword_info?.competition || 0),
          trend: item.monthly_searches?.map((m: any) => m.search_volume) || 
                item.keyword_data?.keyword_info?.monthly_searches?.map((m: any) => m.search_volume) || [],
          categories: item.categories || []
        };
      });
      
      setKeywordResults(transformedResults);
      
      if (transformedResults.length === 0) {
        setError(`No ${method === "related" ? "related keywords" : "keyword suggestions"} found for "${keyword}"`);
      } else {
        toast.success(`Found ${transformedResults.length} ${method === "related" ? "related keywords" : "keyword suggestions"}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Keyword research failed: ${errorMessage}`);
      console.error('Keyword research error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return {
    keywordResults,
    loading,
    error,
    fetchKeywords
  };
}
