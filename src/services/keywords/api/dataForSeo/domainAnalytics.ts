
import { DataForSeoResponse } from '@/hooks/useDataForSeoClient';
import { callDataForSeoApi } from './base/apiClient';

// Domain Analytics - this can provide most metrics in a single API call
export const fetchDomainAnalytics = async (domain: string, locationCode: number = 2840): Promise<DataForSeoResponse | null> => {
  return callDataForSeoApi<DataForSeoResponse>('/v3/dataforseo_labs/google/domain_rank_overview/live', [{ 
    target: domain,
    location_code: locationCode,
    language_code: "en",
    ignore_synonyms: false
  }]);
};

// Domain Keywords
export const fetchDomainKeywords = async (domain: string): Promise<DataForSeoResponse | null> => {
  return callDataForSeoApi<DataForSeoResponse>('/v3/keywords_data/google_ads/keywords_for_site/live', [
    {
      target: domain,
      location_code: 2840,
      language_code: "en",
      sort_by: "relevance"
    }
  ]);
};

// Domain Intersection for Keyword Gaps
export const fetchDomainIntersection = async (
  target1Domain: string, 
  target2Domain: string,
  locationCode: number = 2840
): Promise<DataForSeoResponse | null> => {
  console.log(`DataForSEO Intersection - Target1: ${target1Domain}, Target2: ${target2Domain}, Location: ${locationCode}`);
  
  return callDataForSeoApi<DataForSeoResponse>('/v3/dataforseo_labs/google/domain_intersection/live', [{ 
    target1: target1Domain,
    target2: target2Domain,
    location_code: locationCode,
    language_code: "en",
    include_serp_info: true,
    include_clickstream_data: false,
    intersections: true,
    item_types: ["organic", "paid", "featured_snippet"],
    limit: 100
  }]);
};

// Competitors Domain - function for the competitors feature
export const fetchCompetitorsDomain = async (
  targetDomain: string,
  locationCode: number = 2840,
  limit: number = 10
): Promise<DataForSeoResponse | null> => {
  return callDataForSeoApi<DataForSeoResponse>('/v3/dataforseo_labs/google/competitors_domain/live', [{ 
    target: targetDomain,
    location_code: locationCode,
    language_code: "en",
    exclude_top_domains: false,
    ignore_synonyms: false,
    include_clickstream_data: false,
    item_types: ["organic", "paid"],
    limit: limit,
    order_by: ["sum_position,desc"]
  }]);
};
