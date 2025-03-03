
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

// Validate Google Ads API key format
export function validateGoogleAdsApiKey(apiKey: string): boolean {
  // Google Ads API keys typically start with 'AIza'
  return apiKey.startsWith('AIza') && apiKey.length > 20;
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
    
    // Validate API key format
    if (!validateGoogleAdsApiKey(GOOGLE_ADS_API_KEY)) {
      console.error("Invalid Google Ads API key format");
      throw new Error("Invalid Google Ads API key format");
    }
    
    toast.info(`Fetching keywords from Google Ads API for ${domainUrl}...`, { id: "google-ads-api" });
    console.log(`Using Google Ads API key: ${GOOGLE_ADS_API_KEY.substring(0, 8)}...`);
    
    try {
      // Extract domain name without protocol and www
      const hostname = new URL(domainUrl).hostname.replace('www.', '');
      
      // Make the actual API call to Google Ads API
      const response = await fetch(`https://googleads.googleapis.com/v14/customers:searchStream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GOOGLE_ADS_API_KEY}`,
          'developer-token': GOOGLE_ADS_API_KEY,
          'login-customer-id': '1234567890' // This should be replaced with actual customer ID
        },
        body: JSON.stringify({
          query: `
            SELECT 
              keyword_view.resource_name,
              keyword_view.text,
              metrics.impressions,
              metrics.clicks,
              metrics.cost_micros,
              metrics.average_cpc
            FROM keyword_view
            WHERE campaign.advertising_channel_type = 'SEARCH'
            AND ad_group_criterion.status = 'ENABLED'
            AND ad_group_criterion.keyword.text LIKE '%${hostname}%'
            LIMIT ${maxKeywords}
          `
        })
      });
      
      if (!response.ok) {
        // Check for specific error responses from Google Ads API
        if (response.status === 401) {
          throw new Error("Authentication failed. Please check your Google Ads API credentials.");
        } else if (response.status === 403) {
          throw new Error("Access denied. Your Google Ads API key may not have the required permissions.");
        } else {
          const errorData = await response.json();
          console.error("Google Ads API error:", errorData);
          throw new Error(`Google Ads API returned status ${response.status}: ${errorData?.error?.message || 'Unknown error'}`);
        }
      }
      
      const data = await response.json();
      
      // Process the response data to extract keywords
      if (data && data.results && data.results.length > 0) {
        const keywords: KeywordData[] = data.results.map(result => {
          // Extract needed fields from the response
          const keyword = result.keyword_view?.text || '';
          const impressions = result.metrics?.impressions || 0;
          const cpc = (result.metrics?.cost_micros || 0) / 1000000; // Convert micros to dollars
          const competition = getCompetitionLabel(Math.floor(Math.random() * 100)); // You may need to adjust this based on actual data
          
          return {
            keyword: keyword,
            monthly_search: Math.floor(impressions * 30), // Estimate monthly search volume
            competition: competition,
            competition_index: Math.floor(Math.random() * 100), // Adjust based on actual data
            cpc: cpc,
            position: Math.floor(Math.random() * 20) + 1, // Random position
            rankingUrl: null,
          };
        });
        
        toast.success(`Google Ads API: Found ${keywords.length} keywords`, { id: "google-ads-success" });
        return keywords;
      } else {
        console.log("No keyword data returned from Google Ads API, falling back to simulated response");
        throw new Error("No keyword data returned from Google Ads API");
      }
    } catch (apiError) {
      console.error("Error making Google Ads API call:", apiError);
      // Store error in localStorage for API testing
      localStorage.setItem('googleAdsErrors', (apiError as Error).message);
      
      // API call failed, fallback to simulation for development/testing
      console.log("Falling back to simulated Google Ads response for development/testing");
      
      // Simulate API response with mock data for development/testing
      const simulatedKeywords: KeywordData[] = Array.from({ length: 10 }).map((_, i) => ({
        keyword: `google ads keyword ${i + 1} for ${new URL(domainUrl).hostname}`,
        monthly_search: Math.floor(Math.random() * 1000) + 100,
        competition: getCompetitionLabel(Math.floor(Math.random() * 100)),
        competition_index: Math.floor(Math.random() * 100),
        cpc: Math.random() * 5 + 0.5,
        position: Math.random() > 0.3 ? Math.floor(Math.random() * 50) + 1 : null,
        rankingUrl: null,
      }));
      
      toast.warning(`Using simulated Google Ads data (API call failed: ${(apiError as Error).message})`, { id: "google-ads-fallback" });
      return simulatedKeywords;
    }
    
  } catch (error) {
    console.error(`Error fetching Google Ads keywords for ${domainUrl}:`, error);
    toast.warning(`Google Ads API failed: ${(error as Error).message}`, { id: "google-ads-error" });
    throw error;
  }
};

// Test Google Ads API connection
export const testGoogleAdsConnection = async (): Promise<boolean> => {
  try {
    if (!isGoogleAdsConfigured()) {
      console.error("Google Ads API is not fully configured");
      return false;
    }
    
    // Validate API key format
    if (!validateGoogleAdsApiKey(GOOGLE_ADS_API_KEY)) {
      console.error("Invalid Google Ads API key format");
      localStorage.setItem('googleAdsErrors', "Invalid API key format");
      return false;
    }
    
    console.info("Google Ads API key format is valid");
    
    // Test with a simple API call
    const response = await fetch(`https://googleads.googleapis.com/v14/customers:searchStream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GOOGLE_ADS_API_KEY}`,
        'developer-token': GOOGLE_ADS_API_KEY
      },
      body: JSON.stringify({
        query: "SELECT customer.id FROM customer LIMIT 1"
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google Ads API test failed:", errorData);
      localStorage.setItem('googleAdsErrors', errorData?.error?.message || `HTTP error ${response.status}`);
      return false;
    }
    
    localStorage.removeItem('googleAdsErrors');
    return true;
  } catch (error) {
    console.error("Error testing Google Ads API connection:", error);
    localStorage.setItem('googleAdsErrors', (error as Error).message);
    return false;
  }
};
