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

    // Parse response with better error handling
    let data;
    try {
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        throw new Error("Empty response from API");
      }
      data = JSON.parse(responseText);
    } catch (error) {
      console.error("Failed to parse DataForSEO API response:", error);
      throw new Error(`Failed to parse API response: ${error instanceof Error ? error.message : 'Unknown parsing error'}`);
    }
    
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
            monthly_search: safeNumberConversion(keywordItem.search_volume) || 0,
            competition: getCompetitionLabel(safeNumberConversion(keywordItem.competition_index) || 50),
            competition_index: safeNumberConversion(keywordItem.competition_index) || 50,
            cpc: safeNumberConversion(keywordItem.cpc) || 0,
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
            monthly_search: safeNumberConversion(item.search_volume) || 0,
            competition: getCompetitionLabel(safeNumberConversion(item.competition_index) || 50),
            competition_index: safeNumberConversion(item.competition_index) || 50,
            cpc: safeNumberConversion(item.cpc) || 0,
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

    // Parse response with better error handling
    let data;
    try {
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        throw new Error("Empty response from API");
      }
      data = JSON.parse(responseText);
    } catch (error) {
      console.error("Failed to parse DataForSEO API response:", error);
      throw new Error(`Failed to parse API response: ${error instanceof Error ? error.message : 'Unknown parsing error'}`);
    }
    
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
          monthly_search: safeNumberConversion(item.search_volume) || 0,
          competition: getCompetitionLabel(safeNumberConversion(item.competition_index) || 50),
          competition_index: safeNumberConversion(item.competition_index) || 50,
          cpc: safeNumberConversion(item.cpc) || 0,
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

    // Parse response with better error handling
    let data;
    try {
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        throw new Error("Empty response from API");
      }
      data = JSON.parse(responseText);
    } catch (error) {
      console.error("Failed to parse DataForSEO Task API response:", error);
      throw new Error(`Failed to parse API response: ${error instanceof Error ? error.message : 'Unknown parsing error'}`);
    }
    
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

    // Parse response with better error handling
    let data;
    try {
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        throw new Error("Empty response from API");
      }
      data = JSON.parse(responseText);
    } catch (error) {
      console.error("Failed to parse DataForSEO Task Get API response:", error);
      throw new Error(`Failed to parse API response: ${error instanceof Error ? error.message : 'Unknown parsing error'}`);
    }
    
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
              monthly_search: safeNumberConversion(item.search_volume) || 0,
              competition: getCompetitionLabel(safeNumberConversion(item.competition_index) || 50),
              competition_index: safeNumberConversion(item.competition_index) || 50,
              cpc: safeNumberConversion(item.cpc) || 0,
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

/**
 * New function to fetch keywords for multiple seed keywords with improved error handling
 */
export const fetchKeywordsForMultipleKeywords = async (
  seedKeywords: string[],
  locationCode: number = 2840
): Promise<KeywordData[]> => {
  try {
    console.log(`Fetching keywords from DataForSEO API for keywords:`, seedKeywords);
    
    // Get API credentials from dynamic API keys
    const dataForSeoCredentials = getApiKey("dataforseo");
    
    if (!dataForSeoCredentials) {
      console.error("DataForSEO API credentials not found");
      throw new Error("DataForSEO API credentials not configured");
    }
    
    let login, password;
    
    // Check if credentials are in username:password format
    if (dataForSeoCredentials.includes(':')) {
      [login, password] = dataForSeoCredentials.split(':');
      console.log(`Using provided DataForSEO credentials for user: ${login}`);
    } else {
      // Fall back to default credentials if format is incorrect
      login = DATAFORSEO_LOGIN;
      password = DATAFORSEO_PASSWORD;
      console.log(`Using default DataForSEO credentials for user: ${login}`);
    }
    
    // Create authorization string
    const credentials = `${login}:${password}`;
    const encodedCredentials = btoa(credentials);
    
    // Filter out empty keywords
    const filteredKeywords = seedKeywords.filter(kw => kw.trim() !== "");
    
    if (filteredKeywords.length === 0) {
      throw new Error("No valid keywords provided");
    }
    
    // Prepare the request body with explicit sort_by parameter
    const requestBody = JSON.stringify([
      {
        location_code: locationCode,
        language_code: "en",
        keywords: filteredKeywords,
        sort_by: "relevance"  // Adding the sort_by parameter as specified in the example
      }
    ]);
    
    console.log("DataForSEO keywords API URL:", DATAFORSEO_KEYWORDS_API_URL);
    console.log("DataForSEO keywords request body:", requestBody);
    console.log("DataForSEO credentials (encoded):", encodedCredentials.substring(0, 10) + "...");
    
    const response = await fetch(DATAFORSEO_KEYWORDS_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${encodedCredentials}`,
        "Content-Type": "application/json"
      },
      body: requestBody
    });

    console.log("DataForSEO API response status:", response.status);
    
    // Check for API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DataForSEO API error ${response.status}: ${errorText}`);
      throw new Error(`API error ${response.status}: ${errorText.substring(0, 100)}`);
    }

    // Parse response with better error handling
    let data;
    try {
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        throw new Error("Empty response from API");
      }
      data = JSON.parse(responseText);
    } catch (error) {
      console.error("Failed to parse DataForSEO API response:", error);
      throw new Error(`Failed to parse API response: ${error instanceof Error ? error.message : 'Unknown parsing error'}`);
    }
    
    // Debug the actual response structure
    console.log("DataForSEO keywords response status_code:", data.status_code);
    console.log("DataForSEO keywords response status_message:", data.status_message);
    console.log("DataForSEO keywords response structure:", JSON.stringify(data).substring(0, 500) + "...");
    
    // Check for DataForSEO API-specific error status
    if (data.status_code !== 20000) {
      const errorMsg = data.status_message || "Unknown DataForSEO API error";
      console.error(`DataForSEO API returned error status: ${data.status_code}, message: ${errorMsg}`);
      throw new Error(`DataForSEO API error: ${errorMsg}`);
    }
    
    // Parse the response
    if (!data.tasks || data.tasks.length === 0 || !data.tasks[0].result) {
      console.error(`DataForSEO API returned no results for keywords`);
      throw new Error("API returned no results");
    }
    
    // Process the keywords from the response
    const keywords: KeywordData[] = [];
    
    // Loop through each result
    for (const item of data.tasks[0].result) {
      if (item.keyword_data && item.keyword_data.keywords) {
        // Process each keyword
        for (const keywordItem of item.keyword_data.keywords) {
          keywords.push({
            keyword: keywordItem.keyword,
            monthly_search: safeNumberConversion(keywordItem.search_volume) || 0,
            competition: getCompetitionLabel(safeNumberConversion(keywordItem.competition_index) || 50),
            competition_index: safeNumberConversion(keywordItem.competition_index) || 50,
            cpc: safeNumberConversion(keywordItem.cpc) || 0,
            position: null,
            rankingUrl: null,
          });
        }
      } else if (item.keyword) {
        // Fallback for different response structure
        keywords.push({
          keyword: item.keyword,
          monthly_search: safeNumberConversion(item.search_volume) || 0,
          competition: getCompetitionLabel(safeNumberConversion(item.competition_index) || 50),
          competition_index: safeNumberConversion(item.competition_index) || 50,
          cpc: safeNumberConversion(item.cpc) || 0,
          position: null,
          rankingUrl: null,
        });
      }
    }
    
    if (keywords.length === 0) {
      console.error(`DataForSEO API returned no valid keywords`);
      throw new Error("API returned no valid keywords");
    }
    
    console.log(`Successfully extracted ${keywords.length} keywords from DataForSEO API`);
    return keywords;
  } catch (error) {
    console.error(`Error fetching keywords for multiple keywords:`, error);
    throw error;
  }
};

/**
 * Function to safely convert potential string numbers to actual numbers
 */
const safeNumberConversion = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};
