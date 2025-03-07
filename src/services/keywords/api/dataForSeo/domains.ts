
import { KeywordData } from '../../types';
import { DATAFORSEO_API_URL } from '../../apiConfig';
import { getDataForSeoCredentials } from './auth';
import { parseApiResponse, convertToKeywordData, checkApiResponseStatus } from './utils';

/**
 * Enhanced function to fetch DataForSEO API for domain keywords with location support
 */
export const fetchDataForSEOKeywords = async (
  domainUrl: string, 
  locationCode: number = 2840
): Promise<KeywordData[]> => {
  try {
    console.log(`Fetching keywords from DataForSEO API for domain: ${domainUrl} in location: ${locationCode}`);
    
    const { encodedCredentials } = getDataForSeoCredentials();
    
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

    // Parse response
    const data = await parseApiResponse(response);
    
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
        keywords.push(convertToKeywordData(item));
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
