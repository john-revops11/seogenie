
/**
 * Google Ads API service
 */

import { toast } from "sonner";
import { KeywordData } from '../types';
import { 
  GOOGLE_ADS_API_KEY, 
  GOOGLE_ADS_CLIENT_ID, 
  GOOGLE_ADS_CLIENT_SECRET 
} from '../apiConfig';
import { getCompetitionLabel } from '../utils/credentialUtils';

// Check if Google Ads API is properly configured
export function isGoogleAdsConfigured(): boolean {
  return !!(
    GOOGLE_ADS_API_KEY && 
    GOOGLE_ADS_CLIENT_ID && 
    GOOGLE_ADS_CLIENT_SECRET
  );
}

// Fetch keywords from Google Ads API
export const fetchGoogleAdsKeywords = async (
  domainUrl: string,
  maxKeywords: number = 50
): Promise<KeywordData[]> => {
  try {
    if (!isGoogleAdsConfigured()) {
      console.warn("Google Ads API is not fully configured");
      throw new Error("Google Ads API is not fully configured");
    }
    
    toast.info(`Fetching keywords from Google Ads API for ${domainUrl}...`, { id: "google-ads-api" });
    
    // In a real implementation, this would make a call to Google Ads API
    // For now, we'll simulate a response
    console.log(`Would fetch Google Ads keywords for: ${domainUrl} using API key: ${GOOGLE_ADS_API_KEY.substring(0, 5)}...`);
    
    // Mock response - in a real implementation this would be replaced with actual API call
    const simulatedKeywords: KeywordData[] = Array.from({ length: 10 }).map((_, i) => ({
      keyword: `google ads keyword ${i + 1} for ${new URL(domainUrl).hostname}`,
      monthly_search: Math.floor(Math.random() * 1000) + 100,
      competition: getCompetitionLabel(Math.floor(Math.random() * 100)),
      competition_index: Math.floor(Math.random() * 100),
      cpc: Math.random() * 5 + 0.5,
      position: Math.random() > 0.3 ? Math.floor(Math.random() * 50) + 1 : null,
      rankingUrl: null,
    }));
    
    toast.success(`Google Ads API: Found ${simulatedKeywords.length} keywords`, { id: "google-ads-success" });
    return simulatedKeywords;
  } catch (error) {
    console.error(`Error fetching Google Ads keywords for ${domainUrl}:`, error);
    toast.warning(`Google Ads API failed: ${(error as Error).message}`, { id: "google-ads-error" });
    throw error;
  }
};
