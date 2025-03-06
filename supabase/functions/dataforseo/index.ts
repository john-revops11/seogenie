
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { encode } from "https://deno.land/std@0.177.0/encoding/base64.ts";

// DataForSEO credentials
const DFS_USERNAME = "armin@revologyanalytics.com";
const DFS_PASSWORD = "ab4016dc9302b8cf";
const AUTH_HEADER = encode(`${DFS_USERNAME}:${DFS_PASSWORD}`);

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to make DataForSEO API requests using fetch (Deno's native HTTP client)
async function makeDataForSEORequest(endpoint: string, method: string, data: any = null) {
  const url = `https://api.dataforseo.com${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Basic ${AUTH_HEADER}`,
      'Content-Type': 'application/json',
    },
  };
  
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error making DataForSEO request to ${endpoint}:`, error);
    throw error;
  }
}

// Helper function to post a task and get the task ID
async function postTaskAndGetId(endpoint: string, data: any) {
  const response = await makeDataForSEORequest(endpoint, 'POST', data);
  
  if (response?.tasks?.[0]?.id) {
    return response.tasks[0].id;
  }
  
  if (response?.tasks?.[0]?.status_message) {
    throw new Error(response.tasks[0].status_message);
  }
  
  throw new Error('Failed to create task');
}

// Helper function to wait for a task to complete and get results
async function waitForTaskResults(endpoint: string, taskId: string, maxAttempts = 5, delay = 2000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await makeDataForSEORequest(`${endpoint}/${taskId}`, 'GET');
    
    if (response?.tasks?.[0]?.result) {
      return response.tasks[0].result;
    }
    
    if (response?.tasks?.[0]?.status_message?.includes('in progress')) {
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
    
    if (response?.tasks?.[0]?.status_message) {
      throw new Error(response.tasks[0].status_message);
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  throw new Error('Task did not complete in allowed time');
}

// Function to get domain SERP positions
async function getDomainSERP(domain: string, keywords: string[], location_code = 2840) {
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
async function getKeywordVolume(keywords: string[], location_code = 2840) {
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
async function getDomainTraffic(domain: string, location_code = 2840) {
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
async function getCompetitorDomains(domain: string, location_code = 2840) {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Only POST requests are supported' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    const body = await req.json();
    const { action, domain, keywords, location_code = 2840 } = body;
    
    if (!domain) {
      throw new Error('Domain is required');
    }
    
    let result;
    
    switch (action) {
      case 'domain_serp':
        if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
          throw new Error('Keywords array is required');
        }
        result = await getDomainSERP(domain, keywords, location_code);
        break;
        
      case 'keyword_volume':
        if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
          throw new Error('Keywords array is required');
        }
        result = await getKeywordVolume(keywords, location_code);
        break;
        
      case 'domain_traffic':
        result = await getDomainTraffic(domain, location_code);
        break;
        
      case 'competitor_domains':
        result = await getCompetitorDomains(domain, location_code);
        break;
        
      case 'full_analysis':
        // Get all data in parallel for efficiency
        const [serpData, volumeData, trafficData, competitorsData] = await Promise.all([
          getDomainSERP(domain, keywords, location_code),
          getKeywordVolume(keywords, location_code),
          getDomainTraffic(domain, location_code),
          getCompetitorDomains(domain, location_code),
        ]);
        
        result = {
          serp: serpData,
          volume: volumeData,
          traffic: trafficData,
          competitors: competitorsData,
        };
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
