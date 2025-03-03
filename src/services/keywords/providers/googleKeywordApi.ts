
/**
 * Google Keyword Insight API service
 */

import { toast } from "sonner";
import { KeywordData } from '../types';
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
    
    // Make sure the URL parameter is properly formatted
    let url = domainUrl;
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }
    
    // Create the full API URL with query parameters
    const apiUrl = `${GOOGLE_KEYWORD_API_URL}?url=${encodeURIComponent(url)}&lang=en`;
    
    console.log(`Fetching keywords from Google Keyword Insight API for domain: ${url}`);
    console.log(`Full API URL: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-host": GOOGLE_KEYWORD_API_HOST,
        "x-rapidapi-key": API_KEY
      },
      // Add a timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000) // Increased timeout for potentially slow API
    });

    // Check for API errors and log the status
    console.log(`Google Keyword API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`Google Keyword API error ${response.status} for ${url}: ${errorText}`);
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`Google Keyword API response data:`, data);
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn(`Google Keyword API unsuccessful for ${url} - no keywords returned`);
      throw new Error("API returned no keywords");
    }

    // Transform the API response to our KeywordData format
    const keywords = data.map(item => ({
      keyword: item.text || item.keyword,
      monthly_search: item.volume || 0,
      competition: getCompetitionLabel(item.competition_index || 0),
      competition_index: item.competition_index || 0,
      cpc: item.high_bid || item.cpc || 0,
      position: null,
      rankingUrl: null,
    }));
    
    toast.success(`Google API: Found ${keywords.length} keywords for ${url}`, { id: "google-success" });
    return keywords;
  } catch (error) {
    console.error(`Error fetching Google keywords for ${domainUrl}:`, error);
    // Store the error in localStorage for the system health card to display
    localStorage.setItem('googleKeywordErrors', (error as Error).message);
    toast.warning(`Google Keyword API failed: ${(error as Error).message}`, { id: "google-error" });
    throw error;
  }
};
