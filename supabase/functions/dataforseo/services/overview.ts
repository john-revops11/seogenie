
import { makeDataForSEORequest } from "../api-client.ts";
import { cleanDomain } from "./utils.ts";

/**
 * Get domain overview data
 */
export async function getDomainOverview(domain: string, location_code = 2840) {
  const cleanedDomain = cleanDomain(domain);
  
  const data = [{
    target: cleanedDomain,
    location_code,
    language_code: "en",
    ignore_synonyms: false
  }];
  
  try {
    const result = await makeDataForSEORequest('/v3/dataforseo_labs/google/domain_rank_overview/live', 'POST', data);
    
    if (!result || !result.tasks || result.tasks.length === 0 || !result.tasks[0].result) {
      throw new Error(`No overview results found for domain: ${domain}`);
    }
    
    return result;
  } catch (error) {
    console.error(`Error getting domain overview for ${domain}:`, error);
    throw error;
  }
}
