
import { KeywordData } from '../../types';
import { getDataForSeoCredentials } from './auth';
import { parseApiResponse, convertToKeywordData, checkApiResponseStatus } from './utils';

/**
 * New function to handle DataForSEO Tasks API for domain keywords
 */
export const createDataForSEOKeywordTask = async (
  domainUrl: string, 
  locationCode: number = 2840
): Promise<{ task_id: string }> => {
  try {
    console.log(`Creating DataForSEO task for domain: ${domainUrl} in location: ${locationCode}`);
    
    const { encodedCredentials } = getDataForSeoCredentials();
    
    // Prepare the request body - this is the task post endpoint
    const DATAFORSEO_TASK_POST_URL = "https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_site/task_post";
    
    const requestBody = JSON.stringify([
      {
        location_code: locationCode,
        language_code: "en",
        target: domainUrl,
        sort_by: "relevance"
      }
    ]);
    
    console.log("DataForSEO task request body:", requestBody);
    
    const response = await fetch(DATAFORSEO_TASK_POST_URL, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${encodedCredentials}`,
        "Content-Type": "application/json"
      },
      body: requestBody
    });

    // Check for API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`DataForSEO Task API error ${response.status}: ${errorText}`);
      throw new Error(`API error ${response.status}: ${errorText.substring(0, 100)}`);
    }

    // Parse response
    const data = await parseApiResponse(response);
    
    // Debug the actual response structure
    console.log("DataForSEO task response:", JSON.stringify(data).substring(0, 500) + "...");
    
    // Check for DataForSEO API-specific error status
    checkApiResponseStatus(data);
    
    // Return the task ID for later retrieval
    if (data.tasks && data.tasks.length > 0 && data.tasks[0].id) {
      return { task_id: data.tasks[0].id };
    } else {
      throw new Error("No task ID returned from DataForSEO");
    }
  } catch (error) {
    console.error(`Error creating DataForSEO task for ${domainUrl}:`, error);
    throw error;
  }
};

/**
 * New function to retrieve results from a DataForSEO task
 */
export const getDataForSEOTaskResults = async (taskId: string): Promise<KeywordData[]> => {
  try {
    console.log(`Retrieving DataForSEO task results for task: ${taskId}`);
    
    const { encodedCredentials } = getDataForSeoCredentials();
    
    // Task get endpoint
    const DATAFORSEO_TASK_GET_URL = `https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_site/task_get/${taskId}`;
    
    const response = await fetch(DATAFORSEO_TASK_GET_URL, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${encodedCredentials}`,
        "Content-Type": "application/json"
      }
    });

    // Check for API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`DataForSEO Task Get API error ${response.status}: ${errorText}`);
      throw new Error(`API error ${response.status}: ${errorText.substring(0, 100)}`);
    }

    // Parse response
    const data = await parseApiResponse(response);
    
    // Debug the actual response structure
    console.log("DataForSEO task results:", JSON.stringify(data).substring(0, 500) + "...");
    
    // Check for DataForSEO API-specific error status
    checkApiResponseStatus(data);
    
    // Check if the task is still in progress
    if (data.tasks && data.tasks.length > 0) {
      const task = data.tasks[0];
      if (task.status_code === 40602) {
        // Task is in progress
        throw new Error("Task is still in progress, try again later");
      } else if (task.result && task.result.length > 0) {
        // Process the results similar to the live API
        const keywords: KeywordData[] = [];
        
        // Process all keywords in the results
        for (const item of task.result) {
          if (item.keyword) {
            keywords.push(convertToKeywordData(item));
          }
        }
        
        if (keywords.length === 0) {
          console.warn(`DataForSEO API task returned no valid keywords`);
          throw new Error("API task returned no valid keywords");
        }
        
        console.log(`Successfully extracted ${keywords.length} keywords from DataForSEO Task API`);
        return keywords;
      } else {
        throw new Error("Task completed but no results were found");
      }
    } else {
      throw new Error("No task data returned from DataForSEO");
    }
  } catch (error) {
    console.error(`Error retrieving DataForSEO task results:`, error);
    throw error;
  }
};
