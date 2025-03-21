
import { makeDataForSEORequest } from "../api-client.ts";
import { cleanDomain, formatErrorResponse, extractItems, safeGet } from "./utils.ts";

/**
 * Get domain keywords data
 */
export async function getDomainKeywords(domain: string, location_code = 2840, sort_by = "relevance") {
  if (!domain) {
    console.error("getDomainKeywords called with empty domain");
    throw new Error("Domain is required");
  }
  
  // Clean domain and make sure to remove any protocol prefixes
  const cleanedDomain = cleanDomain(domain);
  console.log(`Getting keywords for domain: ${cleanedDomain}, location: ${location_code}`);
  
  // Prepare request data
  const data = [{
    target: cleanedDomain,
    location_code,
    language_code: "en",
    sort_by
  }];
  
  try {
    // Set a longer timeout for this specific endpoint
    const result = await makeDataForSEORequest(
      '/v3/keywords_data/google_ads/keywords_for_site/live', 
      'POST', 
      data, 
      180000 // Increased to 180 second timeout specifically for keywords endpoint
    );
    
    // Check if the result is valid and has the expected structure
    if (!result || !result.tasks || result.tasks.length === 0) {
      console.warn(`Received empty or invalid response for domain: ${cleanedDomain}`);
      return {
        tasks: [{
          result: [{
            items: []
          }]
        }]
      };
    }
    
    // Extract keywords from response with better error handling
    let keywords = [];
    
    try {
      // Check if there are actual results in the tasks
      if (result.tasks[0].result && result.tasks[0].result.length > 0) {
        keywords = result.tasks[0].result[0]?.items || [];
      } else {
        console.warn(`No result data found in task for domain: ${domain}`);
        keywords = [];
      }
    } catch (extractError) {
      console.warn(`Error extracting keyword data: ${extractError.message}`);
      // Return empty array instead of throwing for extraction errors
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
    
    // Create a more descriptive error that will be easier to handle in the frontend
    const enhancedError = new Error(
      isTimeoutError 
        ? `Request timed out while fetching keywords for ${domain}. The API may be experiencing delays.`
        : `Error fetching keywords for ${domain}: ${errorMessage}`
    );
    
    // Ensure the error type is preserved for better handling on the frontend
    if (isTimeoutError) {
      enhancedError.name = 'TimeoutError';
    }
    
    // Ensure we throw the enhanced error with more descriptive message
    throw enhancedError;
  }
}
