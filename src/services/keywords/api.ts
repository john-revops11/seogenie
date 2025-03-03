
/**
 * Main keywords API service
 * This file coordinates all keyword provider APIs and handles fallbacks
 */

import { toast } from "sonner";
import { KeywordData } from './types';
import { ensureValidUrl } from './utils/urlUtils';

// Import provider APIs
import { fetchDataForSEOKeywords, fetchRelatedKeywords } from './providers/dataForSeoApi';
import { fetchGoogleKeywordInsights } from './providers/googleKeywordApi';
import { fetchFallbackKeywords } from './providers/fallbackApi';
import { fetchGoogleAdsKeywords, isGoogleAdsConfigured } from './providers/googleAdsApi';

// Main function to fetch domain keywords with fallback strategy
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
  
  // Try Google Ads API if configured
  if (isGoogleAdsConfigured()) {
    try {
      const googleAdsKeywords = await fetchGoogleAdsKeywords(domainUrl);
      if (googleAdsKeywords.length > 0) {
        console.log(`Successfully fetched ${googleAdsKeywords.length} keywords from Google Ads API`);
        return googleAdsKeywords;
      }
    } catch (error) {
      console.error("Error with Google Ads API, falling back to alternatives:", error);
    }
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
    const fallbackKeywords = await fetchFallbackKeywords(domainUrl);
    if (fallbackKeywords.length > 0) {
      console.log(`Successfully fetched ${fallbackKeywords.length} keywords from fallback API`);
      return fallbackKeywords;
    } else {
      throw new Error("Fallback API returned no keywords");
    }
  } catch (error) {
    console.error(`Error fetching domain keywords for ${domainUrl}:`, error);
    toast.error(`All keyword APIs failed for ${domainUrl}. Using mock data.`, { id: "all-apis-failed" });
    throw error;
  }
};

// Export functions from provider modules
export { 
  fetchRelatedKeywords,
  fetchDataForSEOKeywords,
  fetchGoogleKeywordInsights,
  fetchGoogleAdsKeywords,
  isGoogleAdsConfigured,
  ensureValidUrl
};
