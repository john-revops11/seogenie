
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
import { fetchGoogleAdsKeywords, isGoogleAdsConfigured, testGoogleAdsConnection } from './providers/googleAdsApi';

// Main function to fetch domain keywords with fallback strategy
export const fetchDomainKeywords = async (domainUrl: string): Promise<KeywordData[]> => {
  const validUrl = ensureValidUrl(domainUrl);
  
  // Clear previous errors
  localStorage.removeItem('dataForSeoErrors');
  localStorage.removeItem('googleKeywordErrors');
  localStorage.removeItem('googleAdsErrors');
  
  // Log which URL we're processing
  console.log(`Fetching keywords for domain: ${validUrl}`);
  
  // Try the DataForSEO API first
  try {
    toast.info(`Trying DataForSEO API for ${validUrl}...`, { id: "dataforseo-api" });
    const dataForSEOKeywords = await fetchDataForSEOKeywords(validUrl);
    if (dataForSEOKeywords.length > 0) {
      console.log(`Successfully fetched ${dataForSEOKeywords.length} keywords from DataForSEO API`);
      return dataForSEOKeywords;
    } else {
      console.log("DataForSEO API returned no keywords, falling back to alternatives");
    }
  } catch (error) {
    console.error("Error with DataForSEO API, falling back to alternatives:", error);
    localStorage.setItem('dataForSeoErrors', (error as Error).message);
  }
  
  // Try Google Keyword Insight API next - prioritizing this based on your curl command
  try {
    console.log(`Trying Google Keyword Insight API for domain: ${validUrl}`);
    toast.info(`Trying Google Keyword Insight API for ${validUrl}...`, { id: "google-keyword-api" });
    
    const googleKeywords = await fetchGoogleKeywordInsights(validUrl);
    if (googleKeywords.length > 0) {
      console.log(`Successfully fetched ${googleKeywords.length} keywords from Google Keyword Insight API`);
      return googleKeywords;
    } else {
      console.log("Google Keyword Insight API returned no keywords, falling back to other alternatives");
    }
  } catch (error) {
    console.error("Error with Google Keyword Insight API, falling back to other alternatives:", error);
    localStorage.setItem('googleKeywordErrors', (error as Error).message);
  }
  
  // Try Google Ads API if configured
  if (isGoogleAdsConfigured()) {
    try {
      toast.info("Attempting to fetch keywords from Google Ads API...");
      console.log("Google Ads API is configured, attempting to fetch keywords...");
      
      // Check connection before attempting to fetch
      const connectionSuccess = await testGoogleAdsConnection();
      if (!connectionSuccess) {
        console.warn("Google Ads API connection test failed, skipping");
        toast.warning("Google Ads API connection test failed, trying alternative sources");
      } else {
        const googleAdsKeywords = await fetchGoogleAdsKeywords(validUrl);
        if (googleAdsKeywords.length > 0) {
          console.log(`Successfully fetched ${googleAdsKeywords.length} keywords from Google Ads API`);
          return googleAdsKeywords;
        } else {
          console.log("Google Ads API returned no keywords, falling back to alternatives");
        }
      }
    } catch (error) {
      console.error("Error with Google Ads API, falling back to alternatives:", error);
      localStorage.setItem('googleAdsErrors', (error as Error).message);
    }
  } else {
    console.log("Google Ads API is not configured, skipping");
  }
  
  // Fall back to the original API
  try {
    console.log(`Falling back to original API for domain: ${validUrl}`);
    toast.info(`Trying fallback keyword API for ${validUrl}...`, { id: "fallback-api" });
    
    const fallbackKeywords = await fetchFallbackKeywords(validUrl);
    if (fallbackKeywords.length > 0) {
      console.log(`Successfully fetched ${fallbackKeywords.length} keywords from fallback API`);
      return fallbackKeywords;
    } else {
      throw new Error("Fallback API returned no keywords");
    }
  } catch (error) {
    console.error(`Error fetching domain keywords for ${validUrl}:`, error);
    toast.error(`All keyword APIs failed for ${validUrl}. Using mock data.`, { id: "all-apis-failed" });
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
  testGoogleAdsConnection,
  ensureValidUrl
};
