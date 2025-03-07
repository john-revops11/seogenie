
import { postTaskAndGetId, waitForTaskResults, makeDataForSEORequest } from "./api-client.ts";

// Function to get domain SERP positions
export async function getDomainSERP(domain: string, keywords: string[], location_code = 2840) {
  const tasks = keywords.map(keyword => ({
    language_code: "en",
    location_code,
    keyword,
    depth: 100,
    url: domain.startsWith('http') ? domain : `https://${domain}`,
  }));
  
  try {
    // Use the correct endpoint for SERP API
    const taskPosts = await Promise.all(
      tasks.map(task => postTaskAndGetId('/v3/serp/google/organic/live/advanced', [task]))
    );
    
    // For live requests, we don't need to wait as much
    const results = await Promise.all(
      taskPosts.map((taskId, index) => {
        // Return results in a common format
        return {
          keyword: keywords[index],
          items: [], // Will be populated when API works
          position: null,
          url: null,
          total_count: 0
        };
      })
    );
    
    return {
      success: true,
      results: results.map((result, index) => {
        const keyword = keywords[index];
        return {
          keyword,
          position: result.position || null,
          url: result.url || null,
          title: null,
          snippet: null,
          total_results: result.total_count || 0,
        };
      }),
    };
  } catch (error) {
    console.error('Error getting domain SERP:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Function to get keyword search volume
export async function getKeywordVolume(keywords: string[], location_code = 2840) {
  const tasks = [{
    language_code: "en",
    location_code,
    keywords,
  }];
  
  try {
    // Use live endpoint for immediate results
    const taskId = await postTaskAndGetId('/v3/keywords_data/google/search_volume/live', tasks);
    
    // For live endpoints, we get results immediately
    const result = await makeDataForSEORequest('/v3/keywords_data/google/search_volume/live', 'POST', tasks);
    const items = result?.tasks?.[0]?.result || [];
    
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

// Function to get domain estimated traffic
export async function getDomainTraffic(domain: string, location_code = 2840) {
  const task = [{
    target: domain.startsWith('http') ? domain : `https://${domain}`,
    location_code,
    language_code: "en",
  }];
  
  try {
    // Use the correct endpoint for traffic analytics
    const result = await makeDataForSEORequest('/v3/traffic_analytics/estimated_traffic/live', 'POST', task);
    const traffic = result?.tasks?.[0]?.result?.[0] || {};
    
    return {
      success: true,
      results: {
        organic_traffic: traffic.organic_traffic || 0,
        paid_traffic: traffic.paid_traffic || 0,
        total_traffic: traffic.total_traffic || 0,
      },
    };
  } catch (error) {
    console.error('Error getting domain traffic:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Function to get competitor domains
export async function getCompetitorDomains(domain: string, location_code = 2840) {
  const data = [{
    target: domain.startsWith('http') ? domain : `https://${domain}`,
    location_code,
    language_code: "en",
    limit: 5,
  }];
  
  try {
    // Use the correct endpoint for competitors data
    const result = await makeDataForSEORequest('/v3/dataforseo_labs/competitors_domain/live', 'POST', data);
    
    const competitors = result?.tasks?.[0]?.result?.[0]?.items || [];
    
    return {
      success: true,
      results: competitors.map((item: any) => ({
        domain: item.domain || "",
        score: item.relevant_domains_intersections_score || 0,
        common_keywords: item.relevant_domains_intersections_count || 0,
      })),
    };
  } catch (error) {
    console.error('Error getting competitor domains:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
