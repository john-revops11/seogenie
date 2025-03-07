
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
    
    // Prepare the request body for DataForSEO Labs domain_keywords endpoint
    // This is the correct format for the DataForSEO Labs endpoint
    const requestBody = JSON.stringify([
      {
        target: domainUrl,
        location_code: locationCode, // Use the provided location code
        language_code: "en",
        limit: 100,
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
    
    // Process the keywords from the response - the structure is different in the DataForSEO Labs API
    const keywords: KeywordData[] = [];
    
    // Extract data from the items array in the result
    if (task.result[0] && task.result[0].items) {
      for (const item of task.result[0].items) {
        if (item.keyword) {
          keywords.push({
            keyword: item.keyword,
            volume: item.search_volume || 0,
            difficulty: item.keyword_difficulty || 0,
            cpc: item.cpc || 0,
            competition: item.competition_index || 0,
            rankingUrl: `https://${domainUrl}`, // Use domain as fallback
            position: item.position || null,
            traffic: item.traffic || 0,
            trafficCost: item.traffic_cost || 0
          });
        }
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
