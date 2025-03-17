
import { useState, useEffect } from 'react';
import { useDataForSeoClient, DataForSeoResponse } from './useDataForSeoClient';
import { toast } from 'sonner';

export interface DomainAnalytics {
  organicTraffic: number;
  paidTraffic: number;
  organicKeywords: number;
  paidKeywords: number;
  estimatedTrafficCost: number;
  authorityScore: number | null;
  totalBacklinks: number | null;
  referringDomains: number | null;
  keywordDistribution: {
    position: string;
    count: number;
  }[];
  topKeywords: {
    keyword: string;
    position: number;
    search_volume: number;
    cpc: number;
  }[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDomainSeoAnalytics(domain: string): DomainAnalytics {
  const [analytics, setAnalytics] = useState<Omit<DomainAnalytics, 'refetch'>>({
    organicTraffic: 0,
    paidTraffic: 0,
    organicKeywords: 0,
    paidKeywords: 0,
    estimatedTrafficCost: 0,
    authorityScore: null,
    totalBacklinks: null,
    referringDomains: null,
    keywordDistribution: [],
    topKeywords: [],
    isLoading: false,
    error: null
  });
  
  const dataForSeoClient = useDataForSeoClient();
  
  const fetchDomainAnalytics = async (domainUrl: string) => {
    if (!domainUrl) return;
    
    const cleanDomain = domainUrl.replace(/^https?:\/\//i, '').replace(/\/$/, '');
    setAnalytics(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Fetch domain overview
      const overviewResponse = await dataForSeoClient.getDomainOverview(cleanDomain);
      console.log('Domain overview response:', overviewResponse);
      
      // Fetch domain keywords
      const keywordsResponse = await dataForSeoClient.getDomainKeywords(cleanDomain);
      console.log('Domain keywords response:', keywordsResponse);
      
      // Fetch backlink summary
      let backlinkResponse: DataForSeoResponse | null = null;
      try {
        backlinkResponse = await dataForSeoClient.getBacklinkSummary(cleanDomain);
        console.log('Backlink response:', backlinkResponse);
      } catch (backlinksError) {
        console.warn('Failed to fetch backlink data:', backlinksError);
        // Continue with other data even if backlinks fail
      }
      
      // Process domain overview data
      let organicTraffic = 0;
      let paidTraffic = 0;
      let organicKeywords = 0;
      let paidKeywords = 0;
      let estimatedTrafficCost = 0;
      let keywordDistribution: { position: string, count: number }[] = [];
      
      if (overviewResponse && overviewResponse.tasks && overviewResponse.tasks.length > 0 && 
          overviewResponse.tasks[0]?.result && overviewResponse.tasks[0]?.result.length > 0) {
        const result = overviewResponse.tasks[0].result[0];
        
        // Check if we have metrics data and handle potential deeply nested structure
        if (result) {
          // Check if metrics are nested under 'items' or directly in result
          const metricsData = result.items?.[0]?.metrics || result.metrics || result;
          
          // Extract organic metrics
          if (metricsData.organic) {
            organicTraffic = metricsData.organic.etv || 0;
            organicKeywords = calculateTotalKeywords(metricsData.organic);
            estimatedTrafficCost = metricsData.organic.estimated_paid_traffic_cost || 0;
            
            // Create keyword distribution
            keywordDistribution = createKeywordDistribution(metricsData.organic);
          }
          
          // Extract paid metrics
          if (metricsData.paid) {
            paidTraffic = metricsData.paid.etv || 0;
            paidKeywords = calculateTotalKeywords(metricsData.paid);
          }
        }
      }
      
      // Process domain keywords for top keywords
      let topKeywords: any[] = [];
      if (keywordsResponse && keywordsResponse.tasks && keywordsResponse.tasks.length > 0 &&
          keywordsResponse.tasks[0]?.result && keywordsResponse.tasks[0]?.result.length > 0) {
        
        // Handle potentially nested items structure
        const keywordItems = keywordsResponse.tasks[0].result[0]?.items || 
                            keywordsResponse.tasks[0].result[0] || 
                            [];
                            
        if (Array.isArray(keywordItems)) {
          topKeywords = keywordItems
            .slice(0, 10)
            .map((item: any) => ({
              keyword: item.keyword || '',
              position: item.serp_info?.position || item.position || 0,
              search_volume: item.keyword_info?.search_volume || item.search_volume || 0,
              cpc: item.keyword_info?.cpc || item.cpc || 0
            }))
            .filter((item: any) => item.keyword); // Only include items with keywords
        }
      }
      
      // Process backlink data with fallbacks
      let authorityScore = null;
      let totalBacklinks = null;
      let referringDomains = null;
      
      if (backlinkResponse && backlinkResponse.tasks && backlinkResponse.tasks.length > 0 &&
          backlinkResponse.tasks[0]?.result && backlinkResponse.tasks[0]?.result.length > 0) {
        const backlinksData = backlinkResponse.tasks[0].result[0];
        
        // Handle different data formats from backlinks_overview endpoint
        if (backlinksData.domain_info) {
          // New endpoint format
          authorityScore = backlinksData.domain_info.rank || backlinksData.domain_info.trust_score || 0;
          totalBacklinks = backlinksData.backlinks_summary?.total_count || backlinksData.total_count || 0;
          referringDomains = backlinksData.backlinks_summary?.referring_domains_count || 
                            backlinksData.referring_domains_count || 0;
        } else {
          // Old/fallback format
          authorityScore = backlinksData.domain_rank || backlinksData.trust_score || 0;
          totalBacklinks = backlinksData.backlinks_count || 0;
          referringDomains = backlinksData.referring_domains_count || 0;
        }
      }
      
      setAnalytics({
        organicTraffic,
        paidTraffic,
        organicKeywords,
        paidKeywords,
        estimatedTrafficCost,
        authorityScore,
        totalBacklinks,
        referringDomains,
        keywordDistribution,
        topKeywords,
        isLoading: false,
        error: null
      });
      
      if (organicTraffic === 0 && organicKeywords === 0 && authorityScore === null) {
        toast.warning("Limited data available for this domain. Some metrics may not display.");
      }
      
    } catch (error) {
      console.error('Error fetching domain analytics:', error);
      setAnalytics(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch domain analytics'
      }));
      toast.error("Failed to load domain analytics");
    }
  };
  
  // Helper function to calculate total keywords from position data
  const calculateTotalKeywords = (data: any): number => {
    if (!data) return 0;
    
    let total = 0;
    // Try to account for different API response formats
    const positionFields = [
      'pos_1', 'pos_2_3', 'pos_4_10', 'pos_11_20', 'pos_21_30', 
      'pos_31_40', 'pos_41_50', 'pos_51_60', 'pos_61_70', 
      'pos_71_80', 'pos_81_90', 'pos_91_100'
    ];
    
    positionFields.forEach(field => {
      if (data[field] !== undefined) {
        total += data[field];
      }
    });
    
    // If we couldn't find position data, try to use keywords_count if available
    if (total === 0 && data.keywords_count !== undefined) {
      total = data.keywords_count;
    }
    
    return total;
  };
  
  // Helper function to create keyword distribution
  const createKeywordDistribution = (data: any): { position: string, count: number }[] => {
    if (!data) return [];
    
    return [
      { position: "1", count: data.pos_1 || 0 },
      { position: "2-3", count: data.pos_2_3 || 0 },
      { position: "4-10", count: data.pos_4_10 || 0 },
      { position: "11-20", count: data.pos_11_20 || 0 },
      { position: "21-50", count: (data.pos_21_30 || 0) + 
                                 (data.pos_31_40 || 0) + 
                                 (data.pos_41_50 || 0) },
      { position: "51-100", count: (data.pos_51_60 || 0) + 
                                  (data.pos_61_70 || 0) +
                                  (data.pos_71_80 || 0) +
                                  (data.pos_81_90 || 0) +
                                  (data.pos_91_100 || 0) }
    ];
  };
  
  useEffect(() => {
    if (domain) {
      fetchDomainAnalytics(domain);
    }
  }, [domain]);
  
  return {
    ...analytics,
    refetch: () => fetchDomainAnalytics(domain)
  };
}
