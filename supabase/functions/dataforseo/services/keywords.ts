
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
    // Set a shorter timeout for this specific endpoint
    const result = await makeDataForSEORequest(
      '/v3/keywords_data/google_ads/keywords_for_site/live', 
      'POST', 
      data, 
      45000 // 45 second timeout specifically for keywords endpoint
    );
    
    // Extract keywords from response with better error handling
    const keywords = extractItems(result, `No keyword data found for domain: ${domain}`);
    
    if (!keywords || keywords.length === 0) {
      console.warn(`No keywords found for domain: ${cleanedDomain}`);
      // Return empty array instead of throwing error for no results
      return {
        tasks: [{
          result: [{
            items: []
          }]
        }]
      };
    }
    
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
    
    // Enhanced error reporting with more specific messages
    const errorMessage = error.message || "Unknown error";
    const isTimeoutError = errorMessage.includes('timeout') || errorMessage.includes('aborted');
    
    const enhancedError = new Error(
      isTimeoutError 
        ? `Request timed out while fetching keywords for ${domain}. The API may be experiencing delays.`
        : `Error fetching keywords for ${domain}: ${errorMessage}`
    );
    
    enhancedError.name = isTimeoutError ? 'TimeoutError' : 'APIError';
    throw enhancedError;
  }
}
