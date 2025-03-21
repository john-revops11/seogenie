
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RankedKeyword {
  keyword: string;
  position: number;
  search_volume: number;
  cpc: number;
  traffic_cost: number;
  url: string;
  is_featured_snippet: boolean;
}

export function useRankedKeywords() {
  const [keywords, setKeywords] = useState<RankedKeyword[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchRankedKeywords = async (domain: string) => {
    if (!domain) {
      setError("Please enter a domain");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cleanDomain = domain.trim().replace(/^https?:\/\//i, '').replace(/^www\./, '');
      
      // Call the DataForSEO edge function
      const { data, error } = await supabase.functions.invoke('dataforseo', {
        body: {
          action: 'ranked_keywords',
          domain: cleanDomain,
          location_code: 2840,
          language_code: "en",
          limit: 100,
          order_by: ["keyword_data.keyword_info.search_volume,desc"]
        }
      });
      
      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      if (!data || !data.success) {
        throw new Error(data?.error || 'Failed to fetch ranked keywords');
      }
      
      // Process the results
      const processedKeywords: RankedKeyword[] = [];
      
      if (data.results && data.results.items && data.results.items.length > 0) {
        data.results.items.forEach((item: any) => {
          if (item.keyword_data) {
            processedKeywords.push({
              keyword: item.keyword_data.keyword,
              position: item.rank_absolute || item.rank_group,
              search_volume: item.keyword_data.keyword_info?.search_volume || 0,
              cpc: item.keyword_data.keyword_info?.cpc || 0,
              traffic_cost: item.keyword_data.keyword_info?.estimated_paid_traffic_cost || 0,
              url: item.url || '',
              is_featured_snippet: item.is_featured_snippet || false
            });
          }
        });
      }
      
      setKeywords(processedKeywords);
      setLastUpdated(new Date().toLocaleString());
      toast.success(`Found ${processedKeywords.length} ranked keywords for ${cleanDomain}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast.error(`Error fetching ranked keywords: ${errorMessage}`);
      console.error('Ranked keywords error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    keywords,
    isLoading,
    error,
    lastUpdated,
    fetchRankedKeywords
  };
}
