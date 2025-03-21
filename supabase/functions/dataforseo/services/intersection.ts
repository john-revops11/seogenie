
import { makeDataForSEORequest } from "../api-client.ts";
import { cleanDomain } from "./utils.ts";

/**
 * Get domain intersection data between two domains
 */
export async function getDomainIntersection(
  target1: string,
  target2: string, 
  location_code = 2840
) {
  // Format domains by removing http/https if present
  const cleanTarget1 = cleanDomain(target1);
  const cleanTarget2 = cleanDomain(target2);
  
  // Format the request based on the API documentation example
  const data = [{
    target1: cleanTarget1,
    target2: cleanTarget2,
    location_code,
    language_code: "en",
    include_serp_info: true,
    include_clickstream_data: false,
    intersections: true,
    item_types: ["organic", "paid", "featured_snippet"],
    limit: 100
  }];
  
  console.log(`Fetching domain intersection data for ${cleanTarget1} and ${cleanTarget2}`);
  
  try {
    // Use the correct endpoint
    const result = await makeDataForSEORequest('/v3/dataforseo_labs/google/domain_intersection/live', 'POST', data);
    
    if (!result || !result.tasks || result.tasks.length === 0 || !result.tasks[0].result) {
      throw new Error(`No intersection results found for domains: ${target1} and ${target2}`);
    }
    
    const intersectionData = result.tasks[0].result || [];
    console.log(`Got ${intersectionData[0]?.items_count || 0} intersection keywords for domains ${cleanTarget1} and ${cleanTarget2}`);
    
    return result;
  } catch (error) {
    console.error(`Error getting domain intersection for ${cleanTarget1} and ${cleanTarget2}:`, error);
    throw error;
  }
}
