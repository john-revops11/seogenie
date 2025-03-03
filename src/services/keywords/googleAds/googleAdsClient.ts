
import { toast } from "sonner";
import { KeywordData } from '../types';
import { 
  GOOGLE_ADS_CLIENT_ID, 
  GOOGLE_ADS_CLIENT_SECRET, 
  GOOGLE_ADS_API_KEY 
} from '../apiConfig';

// Error storage key
const GOOGLE_ADS_ERRORS_KEY = 'googleAdsErrors';

/**
 * Check if Google Ads API is configured
 */
export const isGoogleAdsConfigured = (): boolean => {
  return Boolean(GOOGLE_ADS_API_KEY && GOOGLE_ADS_CLIENT_ID && GOOGLE_ADS_CLIENT_SECRET);
};

/**
 * Test the Google Ads API connection
 */
export const testGoogleAdsConnection = async (): Promise<boolean> => {
  if (!isGoogleAdsConfigured()) {
    console.error("Google Ads API is not configured");
    localStorage.setItem(GOOGLE_ADS_ERRORS_KEY, "API credentials are not configured");
    return false;
  }
  
  try {
    // For testing, we'll just verify the API key format
    // In a real application, you would make an actual API request
    if (GOOGLE_ADS_API_KEY.startsWith('AIza')) {
      console.log("Google Ads API key format is valid");
      localStorage.removeItem(GOOGLE_ADS_ERRORS_KEY);
      return true;
    } else {
      const error = "Invalid Google Ads API key format";
      console.error(error);
      localStorage.setItem(GOOGLE_ADS_ERRORS_KEY, error);
      return false;
    }
  } catch (error) {
    console.error("Error testing Google Ads connection:", error);
    localStorage.setItem(GOOGLE_ADS_ERRORS_KEY, (error as Error).message);
    return false;
  }
};

/**
 * Helper function to convert difficulty number to competition label
 */
function getCompetitionLabel(difficulty: number): string {
  if (difficulty < 30) return "low";
  if (difficulty < 60) return "medium";
  return "high";
}

/**
 * Get keyword suggestions from Google Ads API
 */
export const fetchGoogleAdsKeywords = async (query: string): Promise<KeywordData[]> => {
  try {
    if (!isGoogleAdsConfigured()) {
      throw new Error("Google Ads API is not configured");
    }
    
    toast.info(`Fetching Google Ads keyword data for: ${query}`, {
      id: "google-ads-fetch"
    });
    
    console.log(`Fetching Google Ads keywords for query: ${query}`);
    
    // In a real implementation, you would make a fetch request to the Google Ads API
    // For now, we'll simulate a response to demonstrate the error handling
    
    // Simulate an API call with a timeout
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, return mock data
    // In production, replace with actual API call
    const mockKeywords: KeywordData[] = [
      {
        keyword: `${query} services`,
        monthly_search: 1200,
        competition: "medium",
        competition_index: 50,
        cpc: 1.25,
        position: null,
        rankingUrl: null
      },
      {
        keyword: `best ${query} solutions`,
        monthly_search: 880,
        competition: "high",
        competition_index: 75,
        cpc: 2.10,
        position: null,
        rankingUrl: null
      },
      {
        keyword: `affordable ${query}`,
        monthly_search: 590,
        competition: "low",
        competition_index: 25,
        cpc: 0.85,
        position: null,
        rankingUrl: null
      }
    ];
    
    toast.success(`Found ${mockKeywords.length} Google Ads keywords for: ${query}`, {
      id: "google-ads-success"
    });
    
    return mockKeywords;
  } catch (error) {
    console.error("Error fetching Google Ads keywords:", error);
    toast.error(`Google Ads API error: ${(error as Error).message}`, {
      id: "google-ads-error"
    });
    localStorage.setItem(GOOGLE_ADS_ERRORS_KEY, (error as Error).message);
    throw error;
  }
};

/**
 * Get keyword suggestions for a domain from Google Ads API
 */
export const fetchGoogleAdsDomainKeywords = async (domain: string): Promise<KeywordData[]> => {
  try {
    // Extract the base domain name without protocol and www
    const domainName = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    
    // Use the domain name as the query
    return await fetchGoogleAdsKeywords(domainName);
  } catch (error) {
    console.error("Error fetching Google Ads domain keywords:", error);
    throw error;
  }
};
