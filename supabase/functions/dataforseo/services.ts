
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
    const response = await makeDataForSEORequest('/v3/serp/google/organic/live/advanced', 'POST', tasks);
    
    if (!response.tasks || response.tasks.length === 0) {
      throw new Error('No tasks returned from API');
    }
    
    const results = response.tasks.map((task: any, index: number) => {
      const result = task.result && task.result[0];
      let position = null;
      let url = null;
      
      if (result && result.items) {
        // Find the domain in the results
        const targetDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        for (const item of result.items) {
          if (item.url && item.url.includes(targetDomain)) {
            position = item.rank_absolute || item.rank_group;
            url = item.url;
            break;
          }
        }
      }
      
      return {
        keyword: keywords[index],
        position,
        url,
        title: null,
        snippet: null,
        total_results: result?.total_count || 0,
      };
    });
    
    return {
      success: true,
      results,
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

// Function to get domain estimated traffic
export async function getDomainTraffic(domain: string, location_code = 2840) {
  const task = [{
    target: domain.startsWith('http') ? domain : `https://${domain}`,
    location_code,
    language_code: "en",
  }];
  
  try {
    // Use the correct endpoint for traffic analytics
    const result = await makeDataForSEORequest('/v3/traffic_analytics/summary/live', 'POST', task);
    
    if (!result.tasks || result.tasks.length === 0 || !result.tasks[0].result) {
      throw new Error('No tasks or results returned from API');
    }
    
    const traffic = result.tasks[0].result[0] || {};
    
    return {
      success: true,
      results: {
        organic_traffic: traffic.organic_traffic || 0,
        paid_traffic: traffic.paid_traffic || 0,
        total_traffic: (traffic.organic_traffic || 0) + (traffic.paid_traffic || 0),
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
    const result = await makeDataForSEORequest('/v3/domain_analytics/competitors/live', 'POST', data);
    
    if (!result.tasks || result.tasks.length === 0 || !result.tasks[0].result) {
      throw new Error('No tasks or results returned from API');
    }
    
    const competitors = result.tasks[0].result[0]?.items || [];
    
    return {
      success: true,
      results: competitors.map((item: any) => ({
        domain: item.domain || "",
        score: item.intersections || 0,
        common_keywords: item.keywords_count || 0,
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

// Function to get domain keywords
export async function getDomainKeywords(domain: string, location_code = 2840) {
  const data = [{
    target: domain.startsWith('http') ? domain : `https://${domain}`,
    location_code,
    language_code: "en",
    limit: 100
  }];
  
  try {
    // Use the domain_organic_keywords endpoint to get domain keywords
    const result = await makeDataForSEORequest('/v3/keywords_data/google/organic/live', 'POST', data);
    
    if (!result.tasks || result.tasks.length === 0 || !result.tasks[0].result) {
      throw new Error('No tasks or results returned from API');
    }
    
    const keywordsData = result.tasks[0].result[0]?.items || [];
    
    return {
      success: true,
      results: keywordsData.map((item: any) => ({
        keyword: item.keyword || "",
        position: item.position || null,
        monthly_search: item.search_volume || 0,
        cpc: item.cpc || 0,
        competition: item.competition || 0, 
        competition_index: item.competition_index || 50,
        rankingUrl: item.url || null,
      })),
    };
  } catch (error) {
    console.error('Error getting domain keywords:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
