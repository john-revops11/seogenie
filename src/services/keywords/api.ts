
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

// Validate DataForSEO credentials to ensure they're properly formatted
function validateDataForSEOCredentials(): boolean {
  if (!DATAFORSEO_LOGIN || typeof DATAFORSEO_LOGIN !== 'string' || DATAFORSEO_LOGIN.trim() === '') {
    console.error("DataForSEO login is missing or invalid");
    return false;
  }
  
  if (!DATAFORSEO_PASSWORD || typeof DATAFORSEO_PASSWORD !== 'string' || DATAFORSEO_PASSWORD.trim() === '') {
    console.error("DataForSEO password is missing or invalid");
    return false;
  }
  
  return true;
}

// New function to fetch related keywords using DataForSEO API
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

// Function to fetch keywords using Google Keyword Insight API with proper error handling
export const fetchGoogleKeywordInsights = async (domainUrl: string): Promise<KeywordData[]> => {
  try {
    toast.info(`Trying Google Keyword API for ${domainUrl}...`, { id: "google-api" });
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
      },
      // Add a timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000)
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
    const keywords = data.keywords.map(item => ({
      keyword: item.keyword,
      monthly_search: item.volume,
      competition: getCompetitionLabel(item.difficulty),
      competition_index: item.difficulty,
      cpc: item.cpc,
      position: item.current_rank,
      rankingUrl: null,
    }));
    
    toast.success(`Google API: Found ${keywords.length} keywords for ${domainUrl}`, { id: "google-success" });
    return keywords;
  } catch (error) {
    console.error(`Error fetching Google keywords for ${domainUrl}:`, error);
    toast.warning(`Google Keyword API failed: ${(error as Error).message}`, { id: "google-error" });
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
    toast.info(`Trying fallback API for ${domainUrl}...`, { id: "fallback-api" });
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
      },
      // Add a timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000)
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
    const keywords = data.data.map(item => ({
      keyword: item.keyword,
      monthly_search: item.monthly_search,
      competition: item.competition,
      competition_index: item.competition_index,
      cpc: ((item.low_bid + item.high_bid) / 2) || 0, // Average of low and high bid
      position: null,
      rankingUrl: null,
    }));
    
    toast.success(`Fallback API: Found ${keywords.length} keywords for ${domainUrl}`, { id: "fallback-success" });
    return keywords;
  } catch (error) {
    console.error(`Error fetching domain keywords for ${domainUrl}:`, error);
    toast.error(`All keyword APIs failed for ${domainUrl}. Using mock data.`, { id: "all-apis-failed" });
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
