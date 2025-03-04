
import { toast } from "sonner";
import { KeywordData } from './types';
import { ensureValidUrl } from './api/apiUtils';

// Re-export all API functions and utilities
export { ensureValidUrl } from './api/apiUtils';
export { getApiKey } from './api/apiBase';
export { 
  fetchRelatedKeywords, 
  fetchDataForSEOKeywords, 
  createDataForSEOKeywordTask, 
  getDataForSEOTaskResults,
  fetchKeywordsForMultipleKeywords 
} from './api/dataForSeoApi';
export { fetchGoogleKeywordInsights } from './api/googleKeywordApi';
export { fetchFallbackDomainKeywords } from './api/fallbackApi';

/**
 * Main function to fetch domain keywords using the best available API
 * This maintains the original behavior but delegates to the appropriate API modules
 */
export const fetchDomainKeywords = async (domainUrl: string): Promise<KeywordData[]> => {
  // Import functions from their respective modules
  const { fetchDataForSEOKeywords } = await import('./api/dataForSeoApi');
  const { fetchGoogleKeywordInsights } = await import('./api/googleKeywordApi');
  const { fetchFallbackDomainKeywords } = await import('./api/fallbackApi');
  
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
    const fallbackKeywords = await fetchFallbackDomainKeywords(domainUrl);
    console.log(`Successfully fetched ${fallbackKeywords.length} keywords from fallback API`);
    return fallbackKeywords;
  } catch (error) {
    console.error(`Error fetching domain keywords for ${domainUrl}:`, error);
    throw error;
  }
};
