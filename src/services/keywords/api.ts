
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
  DATAFORSEO_API_URL
} from './apiConfig';

// Helper function to convert difficulty number to competition label
function getCompetitionLabel(difficulty: number): string {
  if (difficulty < 30) return "low";
  if (difficulty < 60) return "medium";
  return "high";
}

// New function to fetch keywords using DataForSEO API
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
        target: domainUrl
      }
    ]);
    
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
      console.warn(`DataForSEO API error ${response.status} for ${domainUrl}`);
      throw new Error(`API error ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.tasks || data.tasks.length === 0 || !data.tasks[0].result || data.tasks[0].result.length === 0) {
      console.warn(`DataForSEO API returned no results for ${domainUrl}`);
      throw new Error("API returned no keywords");
    }

    // Transform the DataForSEO response to our KeywordData format
    const keywordsData = data.tasks[0].result[0].keywords || [];
    
    if (keywordsData.length === 0) {
      console.warn(`DataForSEO API returned no keywords for ${domainUrl}`);
      throw new Error("API returned no keywords");
    }
    
    return keywordsData.map(item => ({
      keyword: item.keyword,
      monthly_search: item.search_volume || 0,
      competition: getCompetitionLabel(item.competition_index || 50),
      competition_index: item.competition_index || 50,
      cpc: item.cpc || 0,
      position: null,
      rankingUrl: null,
    }));
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
