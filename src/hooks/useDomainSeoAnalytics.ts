
import { useState, useEffect } from 'react';
import { useDataForSeoClient, DataForSeoResponse } from './useDataForSeoClient';

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
}

export function useDomainSeoAnalytics(domain: string) {
  const [analytics, setAnalytics] = useState<DomainAnalytics>({
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
      
      // Fetch domain keywords
      const keywordsResponse = await dataForSeoClient.getDomainKeywords(cleanDomain);
      
      // Fetch backlink summary
      let backlinkResponse: DataForSeoResponse | null = null;
      try {
        backlinkResponse = await dataForSeoClient.getBacklinkSummary(cleanDomain);
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
        
        // Extract organic metrics
        if (result.organic) {
          organicTraffic = result.organic.etv || 0;
          organicKeywords = result.organic.pos_1 + 
                           result.organic.pos_2_3 + 
                           result.organic.pos_4_10 + 
                           result.organic.pos_11_20 + 
                           result.organic.pos_21_30 + 
                           result.organic.pos_31_40 + 
                           result.organic.pos_41_50 + 
                           result.organic.pos_51_60 + 
                           result.organic.pos_61_70 + 
                           result.organic.pos_71_80 + 
                           result.organic.pos_81_90 + 
                           result.organic.pos_91_100 || 0;
          
          // Create keyword distribution
          keywordDistribution = [
            { position: "1", count: result.organic.pos_1 || 0 },
            { position: "2-3", count: result.organic.pos_2_3 || 0 },
            { position: "4-10", count: result.organic.pos_4_10 || 0 },
            { position: "11-20", count: result.organic.pos_11_20 || 0 },
            { position: "21-50", count: (result.organic.pos_21_30 || 0) + 
                                        (result.organic.pos_31_40 || 0) + 
                                        (result.organic.pos_41_50 || 0) },
            { position: "51-100", count: (result.organic.pos_51_60 || 0) + 
                                         (result.organic.pos_61_70 || 0) +
                                         (result.organic.pos_71_80 || 0) +
                                         (result.organic.pos_81_90 || 0) +
                                         (result.organic.pos_91_100 || 0) }
          ];
          
          estimatedTrafficCost = result.organic.estimated_paid_traffic_cost || 0;
        }
        
        // Extract paid metrics
        if (result.paid) {
          paidTraffic = result.paid.etv || 0;
          paidKeywords = result.paid.pos_1 + 
                        result.paid.pos_2_3 + 
                        result.paid.pos_4_10 + 
                        result.paid.pos_11_20 || 0;
        }
      }
      
      // Process domain keywords for top keywords
      let topKeywords: any[] = [];
      if (keywordsResponse && keywordsResponse.tasks && keywordsResponse.tasks.length > 0 &&
          keywordsResponse.tasks[0]?.result && keywordsResponse.tasks[0]?.result.length > 0 &&
          keywordsResponse.tasks[0]?.result[0]?.items) {
        topKeywords = keywordsResponse.tasks[0].result[0].items
          .slice(0, 10)
          .map((item: any) => ({
            keyword: item.keyword,
            position: item.serp_info?.position || 0,
            search_volume: item.keyword_info?.search_volume || 0,
            cpc: item.keyword_info?.cpc || 0
          }));
      }
      
      // Process backlink data with fallbacks
      let authorityScore = null;
      let totalBacklinks = null;
      let referringDomains = null;
      
      if (backlinkResponse && backlinkResponse.tasks && backlinkResponse.tasks.length > 0 &&
          backlinkResponse.tasks[0]?.result && backlinkResponse.tasks[0]?.result.length > 0) {
        const backlinksData = backlinkResponse.tasks[0].result[0];
        authorityScore = backlinksData.domain_rank || 0;
        totalBacklinks = backlinksData.backlinks_count || 0;
        referringDomains = backlinksData.referring_domains_count || 0;
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
      
    } catch (error) {
      console.error('Error fetching domain analytics:', error);
      setAnalytics(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch domain analytics'
      }));
    }
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
