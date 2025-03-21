
import { makeDataForSEORequest } from "../api-client.ts";
import { cleanDomain, formatErrorResponse, extractItems } from "./utils.ts";

/**
 * Get competitor domains for a specific target domain
 */
export async function getCompetitorDomains(domain: string, location_code = 2840, limit = 10) {
  if (!domain) {
    console.error("getCompetitorDomains called with empty domain");
    throw new Error("Domain is required");
  }
  
  const cleanedDomain = cleanDomain(domain);
  console.log(`Getting competitors for domain: ${cleanedDomain}, location: ${location_code}`);
  
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
    const result = await makeDataForSEORequest('/v3/dataforseo_labs/google/competitors_domain/live', 'POST', data, 120000);
    
    // Handle errors or no data scenarios
    if (!result || result.error) {
      console.error(`Error or no data returned from competitors API: ${result?.message || 'Unknown error'}`);
      return {
        success: false,
        competitors: [],
        error: result?.message || "No competitor data available"
      };
    }
    
    if (!result.tasks || result.tasks.length === 0 || !result.tasks[0].result) {
      console.log(`No competitor results found for domain: ${domain}`);
      return {
        success: true,
        competitors: []
      };
    }
    
    const competitorData = result.tasks[0].result?.[0]?.items || [];
    console.log(`Got ${competitorData.length} competitors for domain ${domain}`);
    
    if (competitorData.length === 0) {
      console.log(`No competitors found for domain: ${domain}`);
      return {
        success: true,
        competitors: []
      };
    }
    
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
