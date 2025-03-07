
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
    const taskPosts = await Promise.all(
      tasks.map(task => postTaskAndGetId('/v3/serp/google/organic/task_post', [task]))
    );
    
    // Wait for all tasks to complete
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const results = await Promise.all(
      taskPosts.map(taskId => 
        waitForTaskResults('/v3/serp/google/organic/task_get', taskId)
      )
    );
    
    return {
      success: true,
      results: results.map((result, index) => {
        const keyword = keywords[index];
        const items = result?.items || [];
        
        // Find the position of the domain in search results
        const domainPosition = items.findIndex((item: any) => {
          const itemUrl = item.url || '';
          return itemUrl.includes(domain.replace(/^https?:\/\//i, ''));
        });
        
        return {
          keyword,
          position: domainPosition >= 0 ? domainPosition + 1 : null,
          url: domainPosition >= 0 ? items[domainPosition]?.url : null,
          title: domainPosition >= 0 ? items[domainPosition]?.title : null,
          snippet: domainPosition >= 0 ? items[domainPosition]?.description : null,
          total_results: result?.total_count || 0,
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
    const taskId = await postTaskAndGetId('/v3/keywords_data/google_ads/search_volume/task_post', tasks);
    
    // Wait for the task to complete
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const result = await waitForTaskResults('/v3/keywords_data/google_ads/search_volume/task_get', taskId);
    
    return {
      success: true,
      results: (result?.tasks?.[0]?.result || []).map((item: any) => ({
        keyword: item.keyword,
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
    const taskId = await postTaskAndGetId('/v3/traffic_analytics/domain_estimated_traffic/task_post', task);
    
    // Wait for the task to complete
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const result = await waitForTaskResults('/v3/traffic_analytics/domain_estimated_traffic/task_get', taskId);
    
    return {
      success: true,
      results: {
        organic_traffic: result?.items?.[0]?.organic_traffic || 0,
        paid_traffic: result?.items?.[0]?.paid_traffic || 0,
        total_traffic: result?.items?.[0]?.total_traffic || 0,
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
    const result = await makeDataForSEORequest('/v3/dataforseo_labs/competitors_domain/live', 'POST', data);
    
    const competitors = result?.tasks?.[0]?.result?.[0]?.items || [];
    
    return {
      success: true,
      results: competitors.map((item: any) => ({
        domain: item.domain,
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
