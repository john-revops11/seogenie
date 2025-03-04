
import { toast } from "sonner";
import { KeywordData } from '../types';
import { 
  DATAFORSEO_LOGIN, 
  DATAFORSEO_PASSWORD, 
  DATAFORSEO_API_URL,
  DATAFORSEO_KEYWORDS_API_URL
} from '../apiConfig';
import { getApiKey } from './apiBase';
import { getCompetitionLabel } from './apiUtils';

/**
 * Function to fetch related keywords using DataForSEO API
 */
export const fetchRelatedKeywords = async (seedKeywords: string[]): Promise<KeywordData[]> => {
  try {
    console.log(`Fetching related keywords from DataForSEO API for keywords:`, seedKeywords);
    
    // Get API credentials from dynamic API keys
    const dataForSeoCredentials = getApiKey("dataforseo");
    
    if (!dataForSeoCredentials) {
      throw new Error("DataForSEO API credentials not configured");
    }
    
    let login, password;
    
    // Check if credentials are in username:password format
    if (dataForSeoCredentials.includes(':')) {
      [login, password] = dataForSeoCredentials.split(':');
    } else {
      // Fall back to default credentials if format is incorrect
      login = DATAFORSEO_LOGIN;
      password = DATAFORSEO_PASSWORD;
    }
    
    // Create authorization string
    const credentials = `${login}:${password}`;
    const encodedCredentials = btoa(credentials);
    
    // Prepare the request body - remove any empty keywords
    const filteredKeywords = seedKeywords.filter(kw => kw.trim() !== "");
    
    if (filteredKeywords.length === 0) {
      throw new Error("No valid keywords provided");
    }
    
    // Modify the request structure to match the API format
    const requestBody = JSON.stringify([
      {
        location_code: 2840, // US location code
        language_code: "en",
        keywords: filteredKeywords,
        sort_by: "relevance",
        limit: 50 // Add limit for better results
      }
    ]);
    
    console.log("DataForSEO request body:", requestBody);
    
    const response = await fetch(DATAFORSEO_KEYWORDS_API_URL, {
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
      console.warn(`DataForSEO API error ${response.status}: ${errorText}`);
      throw new Error(`API error ${response.status}: ${errorText.substring(0, 100)}`);
    }

    const data = await response.json();
    
    // Debug the actual response structure
    console.log("DataForSEO keywords response:", JSON.stringify(data).substring(0, 500) + "...");
    
    // Check for DataForSEO API-specific error status
    if (data.status_code !== 20000) {
      const errorMsg = data.status_message || "Unknown DataForSEO API error";
      throw new Error(`DataForSEO API error: ${errorMsg}`);
    }
    
    // Check if we have a valid response with tasks
    if (!data.tasks || data.tasks.length === 0) {
      console.warn(`DataForSEO API returned no tasks`);
      throw new Error("API returned no tasks");
    }
    
    const task = data.tasks[0];
    
    // Check if the task has result data
    if (!task.result || task.result.length === 0) {
      console.warn(`DataForSEO API task has no results`);
      throw new Error("API task has no results");
    }
    
    // Parse the keywords from the response
    const keywords: KeywordData[] = [];
    
    // Process all keywords in the results
    for (const item of task.result) {
      if (item.keyword_data) {
        // Check for the keywords array
        const keywordItems = item.keyword_data?.keywords || [];
        
        for (const keywordItem of keywordItems) {
          keywords.push({
            keyword: keywordItem.keyword,
            monthly_search: keywordItem.search_volume || 0,
            competition: getCompetitionLabel(keywordItem.competition_index || 50),
            competition_index: keywordItem.competition_index || 50,
            cpc: keywordItem.cpc || 0,
            position: null,
            rankingUrl: null,
          });
        }
      }
    }
    
    if (keywords.length === 0) {
      // If no keywords were found in the primary structure, check for alternative structure
      for (const item of task.result) {
        if (item.keyword) {
          keywords.push({
            keyword: item.keyword,
            monthly_search: item.search_volume || 0,
            competition: getCompetitionLabel(item.competition_index || 50),
            competition_index: item.competition_index || 50,
            cpc: item.cpc || 0,
            position: null,
            rankingUrl: null,
          });
        }
      }
    }
    
    if (keywords.length === 0) {
      console.warn(`DataForSEO API returned no valid keywords`);
      throw new Error("API returned no valid keywords");
    }
    
    console.log(`Successfully extracted ${keywords.length} keywords from DataForSEO API`);
    return keywords;
  } catch (error) {
    console.error(`Error fetching related keywords:`, error);
    throw error;
  }
};

/**
 * Enhanced function to fetch DataForSEO API for domain keywords with location support
 */
export const fetchDataForSEOKeywords = async (
  domainUrl: string, 
  locationCode: number = 2840
): Promise<KeywordData[]> => {
  try {
    console.log(`Fetching keywords from DataForSEO API for domain: ${domainUrl} in location: ${locationCode}`);
    
    // Get API credentials from dynamic API keys
    const dataForSeoCredentials = getApiKey("dataforseo");
    
    if (!dataForSeoCredentials) {
      throw new Error("DataForSEO API credentials not configured");
    }
    
    let login, password;
    
    // Check if credentials are in username:password format
    if (dataForSeoCredentials.includes(':')) {
      [login, password] = dataForSeoCredentials.split(':');
    } else {
      // Fall back to default credentials if format is incorrect
      login = DATAFORSEO_LOGIN;
      password = DATAFORSEO_PASSWORD;
    }
    
    // Create authorization string
    const credentials = `${login}:${password}`;
    const encodedCredentials = btoa(credentials);
    
    // Prepare the request body
    const requestBody = JSON.stringify([
      {
        location_code: locationCode, // Use the provided location code
        language_code: "en",
        target: domainUrl,
        sort_by: "relevance"
      }
    ]);
    
    console.log("DataForSEO domain keywords request body:", requestBody);
    
    const response = await fetch(DATAFORSEO_API_URL, {
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
      console.warn(`DataForSEO API error ${response.status}: ${errorText}`);
      throw new Error(`API error ${response.status}: ${errorText.substring(0, 100)}`);
    }

    const data = await response.json();
    
    // Debug the actual response structure
    console.log("DataForSEO domain keywords response:", JSON.stringify(data).substring(0, 500) + "...");
    
    // Check if we have a valid response with tasks
    if (!data.tasks || data.tasks.length === 0) {
      console.warn(`DataForSEO API returned no tasks for ${domainUrl}`);
      throw new Error("API returned no tasks");
    }
    
    const task = data.tasks[0];
    
    // Check if the task has result data
    if (!task.result || task.result.length === 0) {
      console.warn(`DataForSEO API task has no results for ${domainUrl}`);
      throw new Error("API task has no results");
    }
    
    // Parse the keywords from the response
    const keywords: KeywordData[] = [];
    
    // Process all keywords in the results
    for (const item of task.result) {
      if (item.keyword) {
        keywords.push({
          keyword: item.keyword,
          monthly_search: item.search_volume || 0,
          competition: getCompetitionLabel(item.competition_index || 50),
          competition_index: item.competition_index || 50,
          cpc: item.cpc || 0,
          position: null,
          rankingUrl: null,
        });
      }
    }
    
    if (keywords.length === 0) {
      console.warn(`DataForSEO API returned no valid keywords for ${domainUrl}`);
      throw new Error("API returned no valid keywords");
    }
    
    console.log(`Successfully extracted ${keywords.length} keywords from DataForSEO API`);
    return keywords;
  } catch (error) {
    console.error(`Error fetching DataForSEO keywords for ${domainUrl}:`, error);
    throw error;
  }
};

/**
 * New function to handle DataForSEO Tasks API for domain keywords
 */
export const createDataForSEOKeywordTask = async (
  domainUrl: string, 
  locationCode: number = 2840
): Promise<{ task_id: string }> => {
  try {
    console.log(`Creating DataForSEO task for domain: ${domainUrl} in location: ${locationCode}`);
    
    // Get API credentials from dynamic API keys
    const dataForSeoCredentials = getApiKey("dataforseo");
    
    if (!dataForSeoCredentials) {
      throw new Error("DataForSEO API credentials not configured");
    }
    
    let login, password;
    
    // Check if credentials are in username:password format
    if (dataForSeoCredentials.includes(':')) {
      [login, password] = dataForSeoCredentials.split(':');
    } else {
      // Fall back to default credentials if format is incorrect
      login = DATAFORSEO_LOGIN;
      password = DATAFORSEO_PASSWORD;
    }
    
    // Create authorization string
    const credentials = `${login}:${password}`;
    const encodedCredentials = btoa(credentials);
    
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

    const data = await response.json();
    
    // Debug the actual response structure
    console.log("DataForSEO task response:", JSON.stringify(data).substring(0, 500) + "...");
    
    // Check for DataForSEO API-specific error status
    if (data.status_code !== 20000) {
      const errorMsg = data.status_message || "Unknown DataForSEO API error";
      throw new Error(`DataForSEO API error: ${errorMsg}`);
    }
    
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
    
    // Get API credentials from dynamic API keys
    const dataForSeoCredentials = getApiKey("dataforseo");
    
    if (!dataForSeoCredentials) {
      throw new Error("DataForSEO API credentials not configured");
    }
    
    let login, password;
    
    // Check if credentials are in username:password format
    if (dataForSeoCredentials.includes(':')) {
      [login, password] = dataForSeoCredentials.split(':');
    } else {
      // Fall back to default credentials if format is incorrect
      login = DATAFORSEO_LOGIN;
      password = DATAFORSEO_PASSWORD;
    }
    
    // Create authorization string
    const credentials = `${login}:${password}`;
    const encodedCredentials = btoa(credentials);
    
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

    const data = await response.json();
    
    // Debug the actual response structure
    console.log("DataForSEO task results:", JSON.stringify(data).substring(0, 500) + "...");
    
    // Check for DataForSEO API-specific error status
    if (data.status_code !== 20000) {
      const errorMsg = data.status_message || "Unknown DataForSEO API error";
      throw new Error(`DataForSEO API error: ${errorMsg}`);
    }
    
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
            keywords.push({
              keyword: item.keyword,
              monthly_search: item.search_volume || 0,
              competition: getCompetitionLabel(item.competition_index || 50),
              competition_index: item.competition_index || 50,
              cpc: item.cpc || 0,
              position: null,
              rankingUrl: null,
            });
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
