
import { toast } from "sonner";
import { 
  KeywordData, 
  DomainKeywordResponse, 
  GoogleKeywordInsightResponse 
} from './types';
import { 
  API_HOST, 
  API_KEY, 
  API_URL, 
  GOOGLE_KEYWORD_API_HOST, 
  GOOGLE_KEYWORD_API_URL,
  DATAFORSEO_LOGIN,
  DATAFORSEO_PASSWORD,
  DATAFORSEO_API_URL,
  DATAFORSEO_KEYWORDS_API_URL
} from './apiConfig';

// Helper function to convert difficulty number to competition label
function getCompetitionLabel(difficulty: number): string {
  if (difficulty < 30) return "low";
  if (difficulty < 60) return "medium";
  return "high";
}

// New function to fetch related keywords using DataForSEO API
export const fetchRelatedKeywords = async (seedKeywords: string[]): Promise<KeywordData[]> => {
  try {
    console.log(`Fetching related keywords from DataForSEO API for keywords:`, seedKeywords);
    
    // Create authorization string
    const credentials = `${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`;
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
        sort_by: "relevance"
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

// New function to fetch DataForSEO API for domain keywords
export const fetchDataForSEOKeywords = async (domainUrl: string): Promise<KeywordData[]> => {
  try {
    console.log(`Fetching keywords from DataForSEO API for domain: ${domainUrl}`);
    
    // Create authorization string
    const credentials = `${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`;
    const encodedCredentials = btoa(credentials);
    
    // Prepare the request body
    const requestBody = JSON.stringify([
      {
        location_code: 2840, // US location code
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

// Function to fetch keywords using Google Keyword Insight API
export const fetchGoogleKeywordInsights = async (domainUrl: string): Promise<KeywordData[]> => {
  try {
    const queryParams = new URLSearchParams({
      url: domainUrl,
      lang: 'en'
    });

    console.log(`Fetching keywords from Google Keyword Insight API for domain: ${domainUrl}`);
    
    const response = await fetch(`${GOOGLE_KEYWORD_API_URL}?${queryParams}`, {
      method: "GET",
      headers: {
        "x-rapidapi-host": GOOGLE_KEYWORD_API_HOST,
        "x-rapidapi-key": API_KEY
      }
    });

    // Check for API errors
    if (!response.ok) {
      console.warn(`Google Keyword API error ${response.status} for ${domainUrl}`);
      throw new Error(`API error ${response.status}`);
    }

    const data: GoogleKeywordInsightResponse = await response.json();
    
    if (data.status !== "success" || !data.keywords || data.keywords.length === 0) {
      console.warn(`Google Keyword API unsuccessful for ${domainUrl}`);
      throw new Error("API returned no keywords");
    }

    // Transform the API response to our KeywordData format
    return data.keywords.map(item => ({
      keyword: item.keyword,
      monthly_search: item.volume,
      competition: getCompetitionLabel(item.difficulty),
      competition_index: item.difficulty,
      cpc: item.cpc,
      position: item.current_rank,
      rankingUrl: null,
    }));
  } catch (error) {
    console.error(`Error fetching Google keywords for ${domainUrl}:`, error);
    throw error;
  }
};

export const fetchDomainKeywords = async (domainUrl: string): Promise<KeywordData[]> => {
  // Try the DataForSEO API first
  try {
    const dataForSEOKeywords = await fetchDataForSEOKeywords(domainUrl);
    if (dataForSEOKeywords.length > 0) {
      console.log(`Successfully fetched ${dataForSEOKeywords.length} keywords from DataForSEO API`);
      return dataForSEOKeywords;
    }
  } catch (error) {
    console.error("Error with DataForSEO API, falling back to alternatives:", error);
  }
  
  // Try the Google Keyword Insight API next
  try {
    const googleKeywords = await fetchGoogleKeywordInsights(domainUrl);
    if (googleKeywords.length > 0) {
      console.log(`Successfully fetched ${googleKeywords.length} keywords from Google Keyword Insight API`);
      return googleKeywords;
    }
  } catch (error) {
    console.error("Error with Google Keyword Insight API, falling back to alternative:", error);
  }
  
  // Fall back to the original API
  try {
    const queryParams = new URLSearchParams({
      url: domainUrl,
      place_id: "2840", // Updated to use US location code
      lang_id: "1", // Updated language ID for English
      scan_type: "url"
    });

    console.log(`Falling back to original API for domain: ${domainUrl}`);
    
    const response = await fetch(`${API_URL}?${queryParams}`, {
      method: "GET",
      headers: {
        "x-rapidapi-host": API_HOST,
        "x-rapidapi-key": API_KEY
      }
    });

    // Check for API errors
    if (!response.ok) {
      console.warn(`API error ${response.status} for ${domainUrl}`);
      throw new Error(`API error ${response.status}`);
    }

    const data: DomainKeywordResponse = await response.json();
    
    if (!data.success) {
      console.warn(`API unsuccessful for ${domainUrl}: ${data.reason || 'Unknown reason'}`);
      throw new Error(`API unsuccessful: ${data.reason || 'Unknown reason'}`);
    }

    // If API returns no keywords, throw error
    if (!data.data || data.data.length === 0) {
      console.warn(`API returned no keywords for ${domainUrl}`);
      throw new Error("API returned no keywords");
    }

    // Transform the API response to our KeywordData format
    return data.data.map(item => ({
      keyword: item.keyword,
      monthly_search: item.monthly_search,
      competition: item.competition,
      competition_index: item.competition_index,
      cpc: ((item.low_bid + item.high_bid) / 2) || 0, // Average of low and high bid
      position: null,
      rankingUrl: null,
    }));
  } catch (error) {
    console.error(`Error fetching domain keywords for ${domainUrl}:`, error);
    throw error;
  }
};

// Ensure a string is a valid URL with protocol
export function ensureValidUrl(urlString: string): string {
  try {
    // If it's already a valid URL, return it
    new URL(urlString);
    return urlString;
  } catch (e) {
    // If not, try adding https://
    try {
      const withHttps = `https://${urlString}`;
      new URL(withHttps);
      return withHttps;
    } catch (e) {
      throw new Error(`Invalid URL: ${urlString}`);
    }
  }
}
