import { makeDataForSEORequest } from "./api-client.ts";

// Function to get domain keywords - updated to return more complete data
export async function getDomainKeywords(domain: string, location_code = 2840) {
  // Format domain by removing http/https if present
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
  
  // Format the request based on the API documentation example
  const data = [{
    target: cleanDomain,
    location_code,
    language_code: "en",
    sort_by: "relevance"
  }];
  
  try {
    // Use the correct endpoint
    const result = await makeDataForSEORequest('/v3/keywords_data/google_ads/keywords_for_site/live', 'POST', data);
    
    if (!result || !result.tasks || result.tasks.length === 0 || !result.tasks[0].result) {
      throw new Error(`No results found for domain: ${domain}`);
    }
    
    const keywordsData = result.tasks[0].result || [];
    console.log(`Got ${keywordsData.length} keywords for domain ${domain}`);
    
    // Get domain overview data to enrich the response with traffic and other metrics
    // This avoids the client having to make multiple API calls
    try {
      const overviewResult = await makeDataForSEORequest('/v3/dataforseo_labs/google/domain_rank_overview/live', 'POST', [{
        target: cleanDomain,
        location_code
      }]);
      
      // Also fetch competitor data in the same call to optimize API usage
      const competitorResult = await makeDataForSEORequest('/v3/dataforseo_labs/google/competitors_domain/live', 'POST', [{
        target: cleanDomain,
        location_code,
        language_code: "en",
        limit: 10
      }]);
      
      return {
        success: true,
        keywords: keywordsData.map((item: any) => ({
          keyword: item.keyword || "",
          position: null, // Not provided in this endpoint
          monthly_search: item.search_volume || 0,
          cpc: item.cpc || 0,
          competition: item.competition || 0, 
          competition_index: item.competition_index || 50,
          rankingUrl: null // Not provided in this endpoint
        })),
        domain_metrics: overviewResult?.tasks?.[0]?.result?.[0] || null,
        competitors: competitorResult?.tasks?.[0]?.result?.[0]?.items || []
      };
    } catch (overviewError) {
      console.warn(`Error getting domain overview for ${domain}:`, overviewError);
      // Return just the keywords without the domain metrics
      return {
        success: true,
        keywords: keywordsData.map((item: any) => ({
          keyword: item.keyword || "",
          monthly_search: item.search_volume || 0,
          cpc: item.cpc || 0,
          competition: item.competition || 0, 
          competition_index: item.competition_index || 50,
        })),
        domain_metrics: null,
        competitors: []
      };
    }
  } catch (error) {
    console.error(`Error getting domain keywords for ${domain}:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Keyword volume data
export async function getKeywordVolume(keywords: string[], location_code = 2840) {
  const tasks = [{
    language_code: "en",
    location_code,
    keywords,
  }];
  
  try {
    const result = await makeDataForSEORequest('/v3/keywords_data/google/search_volume/live', 'POST', tasks);
    
    if (!result.tasks || result.tasks.length === 0 || !result.tasks[0].result) {
      throw new Error('No tasks or results returned from API');
    }
    
    const items = result.tasks[0].result || [];
    
    return {
      success: true,
      results: items.map((item: any) => ({
        keyword: item.keyword || "",
        search_volume: item.search_volume || 0,
        cpc: item.cpc || 0,
        competition: item.competition || 0,
      })),
    };
  } catch (error) {
    console.error('Error getting keyword volume:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Get competitor domains for a specific target domain
export async function getCompetitorDomains(domain: string, location_code = 2840) {
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
  
  const data = [{
    target: cleanDomain,
    location_code,
    language_code: "en",
    exclude_top_domains: false,
    ignore_synonyms: false,
    include_clickstream_data: false,
    item_types: ["organic", "paid"],
    limit: 10,
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
    return {
      success: false,
      error: error.message,
    };
  }
}

// Add a new function to handle ranked keywords
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

// Add domain intersection function
export async function getDomainIntersection(
  target1: string,
  target2: string, 
  location_code = 2840
) {
  // Format domains by removing http/https if present
  const cleanTarget1 = target1.replace(/^https?:\/\//, '').replace(/^www\./, '');
  const cleanTarget2 = target2.replace(/^https?:\/\//, '').replace(/^www\./, '');
  
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
