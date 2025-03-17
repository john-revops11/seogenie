
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
      
      return {
        success: true,
        keywords: keywordsData.map((item: any) => ({
          keyword: item.keyword || "",
          position: null, // Not provided in this endpoint
          monthly_search: item.search_volume || 0,
          cpc: item.cpc || 0,
          competition: item.competition || 0, 
          competition_index: item.competition_index || 50,
          rankingUrl: null, // Not provided in this endpoint
        })),
        domain_metrics: overviewResult?.tasks?.[0]?.result?.[0] || null
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
        domain_metrics: null
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
