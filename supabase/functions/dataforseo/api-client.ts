
import { AUTH_HEADER } from "./config.ts";

// Helper function to make DataForSEO API requests using fetch
export async function makeDataForSEORequest(endpoint: string, method: string, data: any = null) {
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
    console.log(`Making DataForSEO request to ${url}`);
    if (data) {
      console.log(`Request data: ${JSON.stringify(data).substring(0, 200)}...`);
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DataForSEO API request failed with status ${response.status}: ${errorText}`);
      throw new Error(`API request failed with status ${response.status}: ${errorText.substring(0, 200)}`);
    }
    
    // Try to parse JSON response, handle empty or malformed responses
    const text = await response.text();
    
    if (!text || text.trim() === '') {
      console.error('DataForSEO returned empty response');
      throw new Error('API returned empty response');
    }
    
    try {
      const json = JSON.parse(text);
      console.log(`DataForSEO response success: ${json.status_code === 20000}`);
      
      // Check for API-level errors
      if (json.status_code !== 20000) {
        throw new Error(`DataForSEO API error: ${json.status_message}`);
      }
      
      return json;
    } catch (parseError) {
      console.error(`Failed to parse DataForSEO response: ${text.substring(0, 200)}...`);
      throw new Error(`Failed to parse API response: ${parseError.message}`);
    }
  } catch (error) {
    console.error(`Error making DataForSEO request to ${endpoint}:`, error);
    throw error;
  }
}

// Helper function to post a task and get the task ID
export async function postTaskAndGetId(endpoint: string, data: any) {
  const response = await makeDataForSEORequest(endpoint, 'POST', data);
  
  if (response?.tasks?.[0]?.id) {
    return response.tasks[0].id;
  }
  
  // For live endpoints, there might not be a task ID
  if (response?.tasks?.[0]?.status_code === 20000) {
    return "live_endpoint"; // Placeholder for live endpoints
  }
  
  if (response?.tasks?.[0]?.status_message) {
    throw new Error(response.tasks[0].status_message);
  }
  
  throw new Error('Failed to create task');
}

// Helper function to wait for a task to complete and get results
export async function waitForTaskResults(endpoint: string, taskId: string, maxAttempts = 5, delay = 2000) {
  // For live endpoints, we don't need to wait
  if (taskId === "live_endpoint") {
    return {};
  }
  
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
