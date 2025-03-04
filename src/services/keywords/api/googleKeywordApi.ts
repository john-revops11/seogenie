
import { KeywordData, GoogleKeywordInsightResponse } from '../types';
import { 
  GOOGLE_KEYWORD_API_HOST, 
  GOOGLE_KEYWORD_API_URL,
  API_KEY
} from '../apiConfig';
import { getCompetitionLabel } from './apiUtils';

/**
 * Function to fetch keywords using Google Keyword Insight API
 */
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
    
    if (!data.status || data.status !== "success" || !data.keywords || data.keywords.length === 0) {
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
      position: item.current_rank || null,
      rankingUrl: null,
    }));
  } catch (error) {
    console.error(`Error fetching Google keywords for ${domainUrl}:`, error);
    throw error;
  }
};
