
import { ApiStatusState, ApiStatusType } from "../types";
import { isPineconeConfigured, testPineconeConnection } from "@/services/vector/pineconeService";
import { isGoogleAdsConfigured, testGoogleAdsConnection } from "@/services/keywords/googleAds/googleAdsClient";

export const checkApiHealth = async (
  apiStatus: ApiStatusState,
  setApiStatus: React.Dispatch<React.SetStateAction<ApiStatusState>>,
  setChecking: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> => {
  setChecking(true);
  
  // Copy the current API status to update
  const updatedApiStatus = { ...apiStatus };
  
  // Start with setting all enabled APIs to checking
  Object.keys(updatedApiStatus).forEach(key => {
    if (updatedApiStatus[key].enabled) {
      updatedApiStatus[key] = {
        ...updatedApiStatus[key],
        status: "checking" as ApiStatusType
      };
    }
  });
  
  // Apply initial update to show checking status
  setApiStatus(updatedApiStatus);
  
  try {
    // Check Pinecone connection
    if (updatedApiStatus.pinecone?.enabled && isPineconeConfigured()) {
      const pineconeConnected = await testPineconeConnection();
      updatedApiStatus.pinecone = {
        ...updatedApiStatus.pinecone,
        status: pineconeConnected ? "connected" : "error",
        lastChecked: new Date(),
        errorMessage: pineconeConnected ? undefined : localStorage.getItem('pineconeErrors') || undefined
      };
    } else if (updatedApiStatus.pinecone) {
      updatedApiStatus.pinecone = {
        ...updatedApiStatus.pinecone,
        status: isPineconeConfigured() ? "disconnected" : "error",
        lastChecked: new Date(),
        errorMessage: isPineconeConfigured() ? undefined : "Pinecone is not configured"
      };
    }

    // Check Google Ads API connection
    if (updatedApiStatus.googleAds?.enabled && isGoogleAdsConfigured()) {
      const googleAdsConnected = await testGoogleAdsConnection();
      updatedApiStatus.googleAds = {
        ...updatedApiStatus.googleAds,
        status: googleAdsConnected ? "connected" : "error",
        lastChecked: new Date(),
        errorMessage: googleAdsConnected ? undefined : localStorage.getItem('googleAdsErrors') || undefined
      };
    } else if (updatedApiStatus.googleAds) {
      updatedApiStatus.googleAds = {
        ...updatedApiStatus.googleAds,
        status: isGoogleAdsConfigured() ? "disconnected" : "error",
        lastChecked: new Date(),
        errorMessage: isGoogleAdsConfigured() ? undefined : "Google Ads API is not fully configured"
      };
    }
    
    // Set mock statuses for other APIs for demo
    // In a real app, you would check these APIs properly
    
    // DataForSEO API
    if (updatedApiStatus.dataforseo?.enabled) {
      const hasErrors = localStorage.getItem('dataForSeoErrors');
      updatedApiStatus.dataforseo = {
        ...updatedApiStatus.dataforseo,
        status: hasErrors ? "error" : "connected",
        lastChecked: new Date(),
        errorMessage: hasErrors || undefined
      };
    }
    
    // OpenAI API
    if (updatedApiStatus.openai?.enabled) {
      const hasErrors = localStorage.getItem('openAiErrors');
      updatedApiStatus.openai = {
        ...updatedApiStatus.openai,
        status: hasErrors ? "error" : "connected",
        lastChecked: new Date(),
        errorMessage: hasErrors || undefined
      };
    }
    
    // Google Keyword API
    if (updatedApiStatus.googleKeyword?.enabled) {
      const hasErrors = localStorage.getItem('googleKeywordErrors');
      updatedApiStatus.googleKeyword = {
        ...updatedApiStatus.googleKeyword,
        status: hasErrors ? "error" : "connected",
        lastChecked: new Date(),
        errorMessage: hasErrors || undefined
      };
    }
    
    // Store the updated API status in localStorage
    localStorage.setItem('apiStatus', JSON.stringify(updatedApiStatus));
  } catch (error) {
    console.error("Error checking API health:", error);
  } finally {
    setApiStatus(updatedApiStatus);
    setChecking(false);
  }
};

// Export functions for module
export { calculateOverallHealth } from './healthCalculation';
