
import { makeDataForSEORequest } from "../api-client.ts";

/**
 * Get ranked keywords for a domain
 */
export async function getRankedKeywords(
  domain: string,
  locationCode: number,
  languageCode: string,
  limit: number,
  orderBy: string[]
) {
  const endpoint = "/v3/dataforseo_labs/google/ranked_keywords/live";
  
  const payload = [{
    target: domain,
    location_code: locationCode,
    language_code: languageCode,
    historical_serp_mode: "live",
    ignore_synonyms: false,
    include_clickstream_data: false,
    item_types: ["organic", "paid", "featured_snippet"],
    load_rank_absolute: false,
    limit: limit,
    order_by: orderBy
  }];
  
  console.log(`Fetching ranked keywords for ${domain}`);
  
  try {
    const response = await makeDataForSEORequest(endpoint, "POST", payload);
    return response;
  } catch (error) {
    console.error("Error fetching ranked keywords:", error);
    throw error;
  }
}
