
import { callDataForSeoApi, DataForSEOEndpoint } from "./dataForSeoClient";
import { DataForSeoResponse } from "@/hooks/useDataForSeoClient";

export interface CompetitorDomainRequest {
  target: string;
  location_code?: number;
  language_code?: string;
  exclude_top_domains?: boolean;
  ignore_synonyms?: boolean;
  include_clickstream_data?: boolean;
  intersecting_domains?: string[];
  item_types?: string[];
  limit?: number;
  order_by?: string[];
}

export interface CompetitorData {
  domain: string;
  avg_position: number;
  intersections: number;
  overall_etv: number;  // full_domain_metrics.organic.etv
  intersection_etv: number;  // metrics.organic.etv
  rank_diff?: number;  // Optional for UI enhancement
}

export async function fetchCompetitorsDomainData(
  targetDomain: string,
  locationCode: number = 2840,
  limit: number = 10
): Promise<DataForSeoResponse | null> {
  const endpoint: DataForSEOEndpoint = '/v3/dataforseo_labs/google/competitors_domain/live';
  
  const requestData: CompetitorDomainRequest[] = [{
    target: targetDomain,
    location_code: locationCode,
    language_code: "en",
    exclude_top_domains: false,
    ignore_synonyms: false,
    include_clickstream_data: false,
    item_types: ["organic", "paid"],
    limit: limit,
    order_by: ["sum_position,desc"]
  }];
  
  return callDataForSeoApi<DataForSeoResponse>(endpoint, requestData);
}

// Process raw API data into a more usable format
export function processCompetitorData(apiResponse: DataForSeoResponse | null): CompetitorData[] {
  if (!apiResponse || 
      !apiResponse.tasks || 
      apiResponse.tasks.length === 0 || 
      !apiResponse.tasks[0].result || 
      apiResponse.tasks[0].result.length === 0 ||
      !apiResponse.tasks[0].result[0].items) {
    return [];
  }
  
  const items = apiResponse.tasks[0].result[0].items || [];
  
  return items.map(item => ({
    domain: item.domain || '',
    avg_position: parseFloat((item.avg_position || 0).toFixed(2)),
    intersections: item.intersections || 0,
    overall_etv: parseFloat((item.full_domain_metrics?.organic?.etv || 0).toFixed(2)),
    intersection_etv: parseFloat((item.metrics?.organic?.etv || 0).toFixed(2))
  }));
}
