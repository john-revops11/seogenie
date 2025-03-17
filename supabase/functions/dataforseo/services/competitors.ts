
import { makeDataForSEORequest } from "../api-client.ts";
import { cleanDomain, formatErrorResponse } from "./utils.ts";

/**
 * Get competitor domains for a specific target domain
 */
export async function getCompetitorDomains(domain: string, location_code = 2840, limit = 10) {
  const cleanedDomain = cleanDomain(domain);
  
  const data = [{
    target: cleanedDomain,
    location_code,
    language_code: "en",
    exclude_top_domains: false,
    ignore_synonyms: false,
    include_clickstream_data: false,
    item_types: ["organic", "paid"],
    limit: limit,
    order_by: ["sum_position,desc"]
  }];
  
  try {
    const result = await makeDataForSEORequest('/v3/dataforseo_labs/google/competitors_domain/live', 'POST', data);
    
    if (!result || !result.tasks || result.tasks.length === 0 || !result.tasks[0].result) {
      throw new Error(`No competitor results found for domain: ${domain}`);
    }
    
    const competitorData = result.tasks[0].result?.[0]?.items || [];
    console.log(`Got ${competitorData.length} competitors for domain ${domain}`);
    
    return {
      success: true,
      competitors: competitorData.map((item: any) => ({
        domain: item.domain || "",
        avg_position: item.avg_position || 0,
        intersections: item.intersections || 0,
        overall_etv: item.full_domain_metrics?.organic?.etv || 0,
        intersection_etv: item.metrics?.organic?.etv || 0
      }))
    };
  } catch (error) {
    console.error(`Error getting competitors for ${domain}:`, error);
    return formatErrorResponse(domain, error);
  }
}
