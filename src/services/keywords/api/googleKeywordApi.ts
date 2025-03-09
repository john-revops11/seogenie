import { KeywordData, GoogleKeywordInsightResponse } from '../types';
import { getApiKey } from '@/services/apiIntegrationService';

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
    
    const GOOGLE_KEYWORD_API_HOST = "google-keyword-research-api.p.rapidapi.com";
    const GOOGLE_KEYWORD_API_URL = "https://google-keyword-research-api.p.rapidapi.com/keywords";
    
    const response = await fetch(`${GOOGLE_KEYWORD_API_URL}?${queryParams}`, {
      method: "GET",
      headers: {
        "x-rapidapi-host": GOOGLE_KEYWORD_API_HOST,
        "x-rapidapi-key": getApiKey('rapidapi')
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
    // Fixed: ensure all numeric values are properly converted and competition is a number
    return data.keywords.map(item => ({
      keyword: item.keyword,
      monthly_search: Number(item.volume) || 0,
      competition: Number(item.difficulty) || 0, // Convert competition to number
      competition_index: Number(item.difficulty) || 0,
      cpc: Number(item.cpc) || 0,
      position: item.current_rank ? Number(item.current_rank) : null,
      rankingUrl: null,
    }));
  } catch (error) {
    console.error(`Error fetching Google keywords for ${domainUrl}:`, error);
    throw error;
  }
};
