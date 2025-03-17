
import { makeDataForSEORequest } from "../api-client.ts";
import { cleanDomain, formatErrorResponse, extractItems } from "./utils.ts";

/**
 * Get domain keywords data
 */
export async function getDomainKeywords(domain: string, location_code = 2840, sort_by = "relevance") {
  const cleanedDomain = cleanDomain(domain);
  console.log(`Getting keywords for domain: ${cleanedDomain}, location: ${location_code}`);
  
  const data = [{
    target: cleanedDomain,
    location_code,
    language_code: "en",
    sort_by
  }];
  
  try {
    const result = await makeDataForSEORequest('/v3/keywords_data/google_ads/keywords_for_site/live', 'POST', data);
    
    // Extract keywords from response
    const keywords = extractItems(result, `No keyword data found for domain: ${domain}`);
    console.log(`Successfully extracted ${keywords.length} keywords for ${domain}`);
    
    return {
      tasks: [{
        result: [{
          items: keywords
        }]
      }]
    };
  } catch (error) {
    console.error(`Error getting domain keywords for ${domain}:`, error);
    throw error;
  }
}
