
import { AUTH_HEADER } from "./config.ts";

/**
 * Make a request to the DataForSEO API
 */
export async function makeDataForSEORequest(
  endpoint: string, 
  method: string = 'POST', 
  data: any = []
) {
  const baseUrl = "https://api.dataforseo.com";
  const url = `${baseUrl}${endpoint}`;
  
  console.log(`Making ${method} request to ${url}`);
  console.log("Request data:", JSON.stringify(data).substring(0, 500) + "...");

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Basic ${AUTH_HEADER}`,
        'Content-Type': 'application/json'
      },
      body: method !== 'GET' ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DataForSEO API error ${response.status}: ${errorText}`);
      throw new Error(`DataForSEO API error ${response.status}: ${errorText.substring(0, 100)}`);
    }

    const result = await response.json();
    console.log(`DataForSEO response status code: ${result.status_code}`);
    
    if (result.status_code !== 20000) {
      console.error(`DataForSEO API returned error: ${result.status_message}`);
      throw new Error(`DataForSEO API error: ${result.status_message}`);
    }
    
    return result;
  } catch (error) {
    console.error(`Error in DataForSEO API request:`, error);
    throw error;
  }
}

/**
 * Post a task to DataForSEO and get the task ID
 */
export async function postTaskAndGetId(endpoint: string, data: any = []) {
  try {
    const result = await makeDataForSEORequest(endpoint, 'POST', data);
    
    if (!result.tasks || !result.tasks.length || !result.tasks[0].id) {
      throw new Error('No task ID returned from DataForSEO API');
    }
    
    return result.tasks[0].id;
  } catch (error) {
    console.error(`Error posting task to DataForSEO:`, error);
    throw error;
  }
}

/**
 * Wait for task results from DataForSEO
 */
export async function waitForTaskResults(endpoint: string, taskId: string, maxAttempts = 5) {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const result = await makeDataForSEORequest(`${endpoint}/${taskId}`, 'GET');
      
      if (result.tasks && result.tasks.length && result.tasks[0].result) {
        return result.tasks[0].result;
      }
      
      // Task is still running, wait before trying again
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    } catch (error) {
      console.error(`Error checking task status:`, error);
      throw error;
    }
  }
  
  throw new Error(`Task results not available after ${maxAttempts} attempts`);
}
