
import { ApiStatusState, TestResultState, API_DETAILS } from "../types";
import { isPineconeConfigured, testPineconeConnection, STORAGE_KEYS } from "@/services/vector/pineconeService";
import { isGoogleAdsConfigured, testGoogleAdsConnection } from "@/services/keywords/providers/googleAdsApi";
import { fetchGoogleKeywordInsights } from "@/services/keywords/providers/googleKeywordApi";

export const testApi = async (
  apiId: string,
  apiStatus: ApiStatusState, 
  selectedModel: string,
  setTestResult: React.Dispatch<React.SetStateAction<TestResultState>>,
  checkApiHealthFn: () => Promise<void>
): Promise<void> => {
  setTestResult({ status: "loading" });
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!apiStatus[apiId].enabled) {
      const apiName = API_DETAILS.find(api => api.id === apiId)?.name;
      setTestResult({ 
        status: "error", 
        message: `${apiName} API is disabled. Enable it first.` 
      });
      return;
    }
    
    if (apiId === "dataforseo") {
      await testDataForSeo(setTestResult);
    } else if (apiId === "openai") {
      await testOpenAi(selectedModel, setTestResult);
    } else if (apiId === "googleKeyword") {
      await testGoogleKeyword(setTestResult);
    } else if (apiId === "pinecone") {
      await testPinecone(setTestResult);
    } else if (apiId === "google-ads") {
      await testGoogleAds(setTestResult);
    }
    
    checkApiHealthFn();
  } catch (error) {
    setTestResult({ 
      status: "error", 
      message: `Test failed with error: ${(error as Error).message}` 
    });
  }
};

const testDataForSeo = async (
  setTestResult: React.Dispatch<React.SetStateAction<TestResultState>>
): Promise<void> => {
  const hasErrors = localStorage.getItem('dataForSeoErrors');
  if (hasErrors) {
    setTestResult({ 
      status: "error", 
      message: `Test failed: DataForSEO API returned an error. ${hasErrors}` 
    });
  } else {
    setTestResult({ 
      status: "success", 
      message: "Test successful: DataForSEO API is responding correctly." 
    });
  }
};

const testOpenAi = async (
  selectedModel: string,
  setTestResult: React.Dispatch<React.SetStateAction<TestResultState>>
): Promise<void> => {
  const hasErrors = localStorage.getItem('openAiErrors');
  if (hasErrors) {
    setTestResult({ 
      status: "error", 
      message: `Test failed: OpenAI API returned an error using model "${selectedModel}". ${hasErrors}` 
    });
  } else {
    setTestResult({ 
      status: "success", 
      message: `Test successful: OpenAI API is responding correctly with "${selectedModel}" model.` 
    });
  }
};

const testGoogleKeyword = async (
  setTestResult: React.Dispatch<React.SetStateAction<TestResultState>>
): Promise<void> => {
  try {
    // Perform a real test request to the Google Keyword API
    const testDomain = "example.com";
    console.log("Testing Google Keyword API with domain:", testDomain);
    
    // Clear any previous errors
    localStorage.removeItem('googleKeywordErrors');
    
    const keywords = await fetchGoogleKeywordInsights(testDomain);
    console.log("Google Keyword API test result:", keywords);
    
    if (keywords && keywords.length > 0) {
      setTestResult({ 
        status: "success", 
        message: `Test successful: Google Keyword API returned ${keywords.length} keywords for example.com.` 
      });
    } else {
      setTestResult({
        status: "warning",
        message: "Test completed but returned no keywords. API may be working but found no data for example.com."
      });
    }
  } catch (error) {
    const errorMsg = (error as Error).message || "Unknown error";
    localStorage.setItem('googleKeywordErrors', errorMsg);
    
    setTestResult({ 
      status: "error", 
      message: `Test failed: Google Keyword API returned an error. ${errorMsg}` 
    });
  }
};

const testGoogleAds = async (
  setTestResult: React.Dispatch<React.SetStateAction<TestResultState>>
): Promise<void> => {
  if (isGoogleAdsConfigured()) {
    const connectionSuccess = await testGoogleAdsConnection();
    if (connectionSuccess) {
      setTestResult({
        status: "success",
        message: "Test successful: Google Ads API is properly configured and ready to use."
      });
    } else {
      const errorMessage = localStorage.getItem('googleAdsErrors') || "Unknown error";
      setTestResult({
        status: "error",
        message: `Test failed: Google Ads API returned an error. ${errorMessage}`
      });
    }
  } else {
    setTestResult({
      status: "error",
      message: "Test failed: Google Ads API is not fully configured. Check your Client ID, Client Secret and API Key."
    });
  }
};

const testPinecone = async (
  setTestResult: React.Dispatch<React.SetStateAction<TestResultState>>
): Promise<void> => {
  if (isPineconeConfigured()) {
    const connectionSuccess = await testPineconeConnection();
    if (connectionSuccess) {
      setTestResult({
        status: "success",
        message: "Test successful: Pinecone API is responding correctly and connected to your index."
      });
    } else {
      const errorMessage = localStorage.getItem(STORAGE_KEYS.ERRORS) || "Unknown error";
      setTestResult({
        status: "error",
        message: `Test failed: Pinecone API returned an error. ${errorMessage}`
      });
    }
  } else {
    setTestResult({
      status: "error",
      message: "Test failed: Pinecone is not configured. Configure it in Advanced Settings first."
    });
  }
};
