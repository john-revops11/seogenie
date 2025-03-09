import { KeywordData, DomainKeywordResponse } from '../types';
import { getApiKey } from '@/services/apiIntegrationService';

/**
 * Function to fetch domain keywords using the original fallback API
 */
export const fetchFallbackDomainKeywords = async (domainUrl: string): Promise<KeywordData[]> => {
  try {
    const queryParams = new URLSearchParams({
      url: domainUrl,
      place_id: "2840", // Updated to use US location code
      lang_id: "1", // Updated language ID for English
      scan_type: "url"
    });

    console.log(`Falling back to original API for domain: ${domainUrl}`);
    
    const API_HOST = "domain-seo-analysis.p.rapidapi.com";
    const API_URL = "https://domain-seo-analysis.p.rapidapi.com/domain-seo-analysis";
    
    const response = await fetch(`${API_URL}?${queryParams}`, {
      method: "GET",
      headers: {
        "x-rapidapi-host": API_HOST,
        "x-rapidapi-key": getApiKey('rapidapi')
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
