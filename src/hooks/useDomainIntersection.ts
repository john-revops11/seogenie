
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface IntersectionKeyword {
  keyword: string;
  search_volume: number;
  competition_level: string;
  cpc: number;
  target1_position: number;
  target2_position: number;
  is_featured_snippet: boolean;
  keyword_difficulty: number;
  core_keyword?: string;
}

interface DomainIntersectionResult {
  total_count: number;
  items_count: number;
  target1: string;
  target2: string;
  items: any[];
}

export function useDomainIntersection() {
  const [intersectionData, setIntersectionData] = useState<IntersectionKeyword[]>([]);
  const [totalKeywords, setTotalKeywords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [domains, setDomains] = useState<{target1: string, target2: string}>({target1: "", target2: ""});

  const fetchIntersectionData = async (target1Domain: string, target2Domain: string) => {
    if (!target1Domain || !target2Domain) {
      setError("Please enter both domains");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Clean the domain inputs
      const cleanTarget1 = target1Domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
      const cleanTarget2 = target2Domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
      
      toast.info(`Analyzing keyword intersection between ${cleanTarget1} and ${cleanTarget2}`);
      
      // Call the DataForSEO edge function with a timeout
      const fetchWithTimeout = async () => {
        try {
          const response = await supabase.functions.invoke('dataforseo', {
            body: {
              action: 'domain_intersection',
              target1: cleanTarget1,
              target2: cleanTarget2,
              location_code: 2840
            },
            options: {
              timeout: 60000 // 60 second timeout
            }
          });
          return response;
        } catch (e) {
          console.error("Error calling edge function:", e);
          throw new Error(`Failed to connect to the edge function. Please try again later. (${e.message})`);
        }
      };
      
      const { data, error: fetchError } = await fetchWithTimeout();
      
      if (fetchError) {
        throw new Error(`Edge function error: ${fetchError.message}`);
      }
      
      if (!data || !data.success) {
        throw new Error(data?.error || 'Failed to fetch domain intersection data');
      }
      
      // Process the results
      const result = data.results[0] as DomainIntersectionResult;
      
      if (!result || !result.items || result.items.length === 0) {
        throw new Error('No intersection data found between these domains');
      }
      
      setDomains({target1: cleanTarget1, target2: cleanTarget2});
      setTotalKeywords(result.items_count || 0);
      
      // Process and normalize the keywords
      const processedKeywords: IntersectionKeyword[] = result.items.map(item => {
        // Get target positions
        let target1Position = 0;
        let target2Position = 0;
        
        if (item.target1_metrics?.organic?.pos) {
          target1Position = item.target1_metrics.organic.pos;
        }
        
        if (item.target2_metrics?.organic?.pos) {
          target2Position = item.target2_metrics.organic.pos;
        }
        
        // Get keyword info
        const keywordInfo = item.keyword_data?.keyword_info || {};
        
        return {
          keyword: item.keyword_data?.keyword || "",
          search_volume: keywordInfo.search_volume || 0,
          competition_level: keywordInfo.competition_level || "UNKNOWN",
          cpc: keywordInfo.cpc || 0,
          target1_position: target1Position,
          target2_position: target2Position,
          is_featured_snippet: !!item.is_featured_snippet,
          keyword_difficulty: item.keyword_data?.keyword_properties?.keyword_difficulty || 0,
          core_keyword: item.keyword_data?.keyword_properties?.core_keyword || null
        };
      });
      
      setIntersectionData(processedKeywords);
      setLastUpdated(new Date().toLocaleString());
      toast.success(`Found ${processedKeywords.length} common keywords`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast.error(`Error fetching intersection data: ${errorMessage}`);
      console.error('Domain intersection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetData = () => {
    setIntersectionData([]);
    setTotalKeywords(0);
    setError(null);
    setDomains({target1: "", target2: ""});
    setLastUpdated(null);
  };

  return {
    intersectionData,
    totalKeywords,
    isLoading,
    error,
    lastUpdated,
    domains,
    fetchIntersectionData,
    resetData
  };
}
