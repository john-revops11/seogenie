
/**
 * Fallback keyword API service
 */

import { toast } from "sonner";
import { KeywordData, DomainKeywordResponse } from '../types';
import { API_HOST, API_KEY, API_URL } from '../apiConfig';

// Fallback to the original API
export const fetchFallbackKeywords = async (domainUrl: string): Promise<KeywordData[]> => {
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
    console.error(`Error fetching fallback keywords for ${domainUrl}:`, error);
    throw error;
  }
};
