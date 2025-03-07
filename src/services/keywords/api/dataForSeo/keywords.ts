
import { toast } from "sonner";
import { KeywordData } from '../../types';
import { DATAFORSEO_KEYWORDS_API_URL } from '../../apiConfig';
import { getDataForSeoCredentials } from './auth';
import { parseApiResponse, convertToKeywordData, checkApiResponseStatus } from './utils';

/**
 * Function to fetch related keywords using DataForSEO API
 */
export const fetchRelatedKeywords = async (seedKeywords: string[]): Promise<KeywordData[]> => {
  try {
    console.log(`Fetching related keywords from DataForSEO API for keywords:`, seedKeywords);
    
    const { encodedCredentials } = getDataForSeoCredentials();
    
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

    // Parse response
    const data = await parseApiResponse(response);
    
    // Debug the actual response structure
    console.log("DataForSEO keywords response:", JSON.stringify(data).substring(0, 500) + "...");
    
    // Check for DataForSEO API-specific error status
    checkApiResponseStatus(data);
    
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
          keywords.push(convertToKeywordData(keywordItem));
        }
      }
    }
    
    if (keywords.length === 0) {
      // If no keywords were found in the primary structure, check for alternative structure
      for (const item of task.result) {
        if (item.keyword) {
          keywords.push(convertToKeywordData(item));
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
 * New function to fetch keywords for multiple seed keywords with improved error handling
 */
export const fetchKeywordsForMultipleKeywords = async (
  seedKeywords: string[],
  locationCode: number = 2840
): Promise<KeywordData[]> => {
  try {
    console.log(`Fetching keywords from DataForSEO API for keywords:`, seedKeywords);
    
    const { encodedCredentials, login } = getDataForSeoCredentials();
    console.log(`Using provided DataForSEO credentials for user: ${login}`);
    
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

    // Parse response
    const data = await parseApiResponse(response);
    
    // Debug the actual response structure
    console.log("DataForSEO keywords response status_code:", data.status_code);
    console.log("DataForSEO keywords response status_message:", data.status_message);
    console.log("DataForSEO keywords response structure:", JSON.stringify(data).substring(0, 500) + "...");
    
    // Check for DataForSEO API-specific error status
    checkApiResponseStatus(data);
    
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
          keywords.push(convertToKeywordData(keywordItem));
        }
      } else if (item.keyword) {
        // Fallback for different response structure
        keywords.push(convertToKeywordData(item));
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
