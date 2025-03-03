
/**
 * DataForSEO API service
 */

import { toast } from "sonner";
import { KeywordData } from '../types';
import { 
  DATAFORSEO_LOGIN, 
  DATAFORSEO_PASSWORD, 
  DATAFORSEO_API_URL,
  DATAFORSEO_KEYWORDS_API_URL
} from '../apiConfig';
import { validateDataForSEOCredentials, getCompetitionLabel } from '../utils/credentialUtils';

// Fetch related keywords using DataForSEO API
export const fetchRelatedKeywords = async (seedKeywords: string[]): Promise<KeywordData[]> => {
  try {
    console.log(`Fetching related keywords from DataForSEO API for keywords:`, seedKeywords);
    
    // Validate credentials first
    if (!validateDataForSEOCredentials()) {
      throw new Error("Invalid DataForSEO credentials");
    }
    
    // Create authorization string with the correct password for keyword research
    const credentials = `${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`;
    const encodedCredentials = btoa(credentials);
    
    // Prepare the request body - remove any empty keywords
    const filteredKeywords = seedKeywords.filter(kw => kw.trim() !== "");
    
    if (filteredKeywords.length === 0) {
      throw new Error("No valid keywords provided");
    }
    
    const requestBody = JSON.stringify([
      {
        location_code: 2840, // US location code
        keywords: filteredKeywords
      }
    ]);
    
    const response = await fetch(DATAFORSEO_KEYWORDS_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${encodedCredentials}`,
        "Content-Type": "application/json"
      },
      body: requestBody
    });

    // Detailed error handling for API responses
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`DataForSEO API error ${response.status} for keywords search:`, errorBody);
      throw new Error(`API error ${response.status}: ${errorBody.substring(0, 100)}`);
    }

    const data = await response.json();
    
    // Debug the actual response structure
    console.log("DataForSEO keywords_for_keywords response:", JSON.stringify(data).substring(0, 500) + "...");
    
    // More detailed response validation
    if (!data || !data.tasks) {
      console.error(`DataForSEO API returned invalid response format:`, data);
      throw new Error("API returned invalid response format");
    }
    
    if (data.tasks.length === 0) {
      console.error(`DataForSEO API returned no tasks for keywords search:`, data);
      throw new Error("API returned no tasks");
    }
    
    // For task_post endpoints, we need to check the task_id
    const task = data.tasks[0];
    if (!task.id) {
      console.error(`DataForSEO API task has no ID:`, task);
      throw new Error("API task has no ID");
    }
    
    // Since this is a task_post endpoint, it will return a task ID
    // You would normally poll for results with a separate endpoint
    // For now, we'll return basic information based on the seed keywords
    const keywords: KeywordData[] = filteredKeywords.map(keyword => ({
      keyword: keyword,
      monthly_search: 0, // Will be updated when task completes
      competition: "medium",
      competition_index: 50,
      cpc: 0,
      position: null,
      rankingUrl: null,
    }));
    
    console.log(`Successfully created task for ${keywords.length} keywords from DataForSEO API`);
    toast.success(`Keyword task submitted to DataForSEO. Task ID: ${task.id}`);
    
    return keywords;
  } catch (error) {
    console.error(`Error fetching related keywords:`, error);
    toast.error(`Error fetching related keywords: ${(error as Error).message}`);
    throw error;
  }
};

// Fetch keywords from DataForSEO API with improved error handling
export const fetchDataForSEOKeywords = async (domainUrl: string): Promise<KeywordData[]> => {
  try {
    console.log(`Fetching keywords from DataForSEO API for domain: ${domainUrl}`);
    toast.info(`Trying DataForSEO API for ${domainUrl}...`, { id: "dataforseo-api" });
    
    // Validate credentials first
    if (!validateDataForSEOCredentials()) {
      throw new Error("Invalid DataForSEO credentials");
    }
    
    // Create authorization string with the right password for domain analysis
    const credentials = `${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`;
    const encodedCredentials = btoa(credentials);
    
    // Prepare the request body
    const requestBody = JSON.stringify([
      {
        location_code: 2840, // US location code
        target: domainUrl
      }
    ]);
    
    console.log(`Making DataForSEO API request to ${DATAFORSEO_API_URL} with credentials ${DATAFORSEO_LOGIN}:***`);
    
    const response = await fetch(DATAFORSEO_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${encodedCredentials}`,
        "Content-Type": "application/json"
      },
      body: requestBody,
      // Add a timeout to prevent hanging requests
      signal: AbortSignal.timeout(15000) // Increased timeout
    });

    // Detailed error handling for API responses
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`DataForSEO API error ${response.status} for ${domainUrl}:`, errorBody);
      throw new Error(`API error ${response.status}: ${errorBody.substring(0, 100)}`);
    }

    const data = await response.json();
    
    // Log the full response for debugging if it's small enough
    if (JSON.stringify(data).length < 1000) {
      console.log("DataForSEO full response:", data);
    } else {
      console.log("DataForSEO response excerpt:", JSON.stringify(data).substring(0, 500) + "...");
    }
    
    // More detailed response validation
    if (!data || !data.tasks) {
      console.error(`DataForSEO API returned invalid response format:`, data);
      throw new Error("API returned invalid response format");
    }
    
    if (data.tasks.length === 0) {
      console.error(`DataForSEO API returned no tasks for ${domainUrl}:`, data);
      throw new Error("API returned no tasks");
    }
    
    const task = data.tasks[0];
    
    // Check for API-level errors
    if (task.status_code !== 20000) {
      console.error(`DataForSEO API task failed with status ${task.status_code} for ${domainUrl}:`, task);
      throw new Error(`API task failed: ${task.status_message || 'Unknown error'}`);
    }
    
    // Check if the task has result data
    if (!task.result || task.result.length === 0) {
      console.error(`DataForSEO API task has no results for ${domainUrl}:`, task);
      throw new Error("API task has no results");
    }
    
    // The actual results are in task.result, not task.result[0].keywords
    const keywords = [];
    
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
      console.error(`DataForSEO API returned no valid keywords for ${domainUrl}:`, task.result);
      throw new Error("API returned no valid keywords");
    }
    
    console.log(`Successfully extracted ${keywords.length} keywords from DataForSEO API`);
    toast.success(`DataForSEO: Found ${keywords.length} keywords for ${domainUrl}`, { id: "dataforseo-success" });
    return keywords;
  } catch (error) {
    console.error(`Error fetching DataForSEO keywords for ${domainUrl}:`, error);
    toast.warning(`DataForSEO API failed: ${(error as Error).message}`, { id: "dataforseo-error" });
    throw error;
  }
};
