
/**
 * Google Keyword Insight API service
 */

import { toast } from "sonner";
import { KeywordData, GoogleKeywordInsightResponse } from '../types';
import { 
  API_KEY, 
  GOOGLE_KEYWORD_API_HOST, 
  GOOGLE_KEYWORD_API_URL 
} from '../apiConfig';
import { getCompetitionLabel } from '../utils/credentialUtils';

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
