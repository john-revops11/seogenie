
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchCompetitorsDomainData, processCompetitorData, CompetitorData } from "@/services/keywords/api/dataForSeo/competitorsDomain";

export interface SortConfig {
  key: keyof CompetitorData;
  direction: 'asc' | 'desc';
}

export function useCompetitorAnalysis(domain: string) {
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'intersection_etv',
    direction: 'desc'
  });
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [domainMetrics, setDomainMetrics] = useState<{
    organicTraffic: number;
    organicKeywords: number;
    trafficValue: number;
  }>({
    organicTraffic: 0,
    organicKeywords: 0,
    trafficValue: 0
  });

  // Sort the competitors based on the sort configuration
  const sortedCompetitors = [...competitors].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Handle sort change
  const handleSort = (key: keyof CompetitorData) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.key === key) {
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return {
        key,
        direction: 'desc'
      };
    });
  };

  // Fetch competitor data
  const fetchCompetitorData = async (targetDomain: string) => {
    if (!targetDomain) {
      setError("Please enter a domain to analyze competitors");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const cleanDomain = targetDomain.replace(/^https?:\/\//, '').replace(/^www\./, '');
      const apiResponse = await fetchCompetitorsDomainData(cleanDomain);
      
      if (!apiResponse) {
        throw new Error("No data received from API");
      }
      
      if (apiResponse.status_code !== 20000) {
        throw new Error(`API Error: ${apiResponse.status_message}`);
      }
      
      // Extract the domain metrics from the response (target domain data)
      if (apiResponse.tasks?.[0]?.result?.[0]?.target_metrics?.organic) {
        const targetMetrics = apiResponse.tasks[0].result[0].target_metrics.organic;
        setDomainMetrics({
          organicTraffic: targetMetrics.etv || 0,
          organicKeywords: targetMetrics.count || 0,
          trafficValue: targetMetrics.estimated_paid_traffic_cost || 0
        });
      }
      
      const processedData = processCompetitorData(apiResponse);
      
      if (processedData.length === 0) {
        setError("No competitor data found for this domain");
      } else {
        setCompetitors(processedData);
        setLastUpdated(new Date().toLocaleString());
        
        // If we have at least 3 competitors, highlight them as recommended
        if (processedData.length >= 3) {
          toast.success(`Found ${processedData.length} competitors for ${cleanDomain}`);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error("Error fetching competitor data:", err);
      setError(errorMessage);
      toast.error(`Failed to fetch competitor data: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset the state
  const resetCompetitorData = () => {
    setCompetitors([]);
    setError(null);
    setLastUpdated(null);
    setDomainMetrics({
      organicTraffic: 0,
      organicKeywords: 0,
      trafficValue: 0
    });
  };

  return {
    competitors: sortedCompetitors,
    domainMetrics,
    isLoading,
    error,
    lastUpdated,
    sortConfig,
    handleSort,
    fetchCompetitorData,
    resetCompetitorData
  };
}
