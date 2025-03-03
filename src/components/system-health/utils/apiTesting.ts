
import { ApiStatusState, TestResultState, API_DETAILS } from "../types";
import { isPineconeConfigured, testPineconeConnection } from "@/services/vector/pineconeService";

export const testApi = async (
  apiId: string,
  apiStatus: ApiStatusState, 
  selectedModel: string,
  setTestResult: React.Dispatch<React.SetStateAction<TestResultState>>,
  checkApiHealthFn: () => Promise<void>
): Promise<void> => {
  setTestResult({ status: "loading" });
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
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
      message: "Test failed: DataForSEO API returned an error. Check your API key and limits." 
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
      message: `Test failed: OpenAI API returned an error using model "${selectedModel}". Check your API key and limits.` 
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
  const hasErrors = localStorage.getItem('googleKeywordErrors');
  if (hasErrors) {
    setTestResult({ 
      status: "error", 
      message: "Test failed: Google Keyword API returned an error. Check your API key and limits." 
    });
  } else {
    setTestResult({ 
      status: "success", 
      message: "Test successful: Google Keyword API is responding correctly." 
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
      const errorMessage = localStorage.getItem('pineconeErrors') || "Unknown error";
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
