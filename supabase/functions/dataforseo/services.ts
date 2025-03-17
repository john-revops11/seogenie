
import { makeDataForSEORequest } from "./api-client.ts";

// Function to get domain keywords - updated endpoint to match the one in useDataForSeoClient
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
    // Use the correct endpoint that matches what's in useDataForSeoClient.ts
    const result = await makeDataForSEORequest('/v3/keywords_data/google_ads/keywords_for_site/live', 'POST', data);
    
    if (!result || !result.tasks || result.tasks.length === 0 || !result.tasks[0].result) {
      throw new Error(`No results found for domain: ${domain}`);
    }
    
    const keywordsData = result.tasks[0].result || [];
    console.log(`Got ${keywordsData.length} keywords for domain ${domain}`);
    
    return {
      success: true,
      results: keywordsData.map((item: any) => ({
        keyword: item.keyword || "",
        position: null, // Not provided in this endpoint
        monthly_search: item.search_volume || 0,
        cpc: item.cpc || 0,
        competition: item.competition || 0, 
        competition_index: item.competition_index || 50,
        rankingUrl: null, // Not provided in this endpoint
      })),
    };
  } catch (error) {
    console.error(`Error getting domain keywords for ${domain}:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Keep only essential functions that are actually used
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
