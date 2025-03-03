
import { ApiStatusState } from "./types";
import { isPineconeConfigured, testPineconeConnection } from "@/services/vector/pineconeService";

export const saveApiStates = (newStates: ApiStatusState): void => {
  try {
    const enabledStates = Object.keys(newStates).reduce((acc, key) => {
      acc[key] = newStates[key].enabled;
      return acc;
    }, {} as Record<string, boolean>);
    
    localStorage.setItem('apiEnabledStates', JSON.stringify(enabledStates));
  } catch (error) {
    console.error("Error saving API states:", error);
  }
};

export const loadApiStates = (
  setApiStatus: React.Dispatch<React.SetStateAction<ApiStatusState>>
): void => {
  try {
    const savedStates = localStorage.getItem('apiEnabledStates');
    if (savedStates) {
      const enabledStates = JSON.parse(savedStates) as Record<string, boolean>;
      
      setApiStatus(prev => {
        const newStates = { ...prev };
        Object.keys(enabledStates).forEach(key => {
          if (newStates[key]) {
            newStates[key] = {
              ...newStates[key],
              enabled: enabledStates[key],
              status: enabledStates[key] ? newStates[key].status : "disconnected" as const
            };
          }
        });
        return newStates;
      });
    }
    
    const isPineconeReady = isPineconeConfigured();
    setApiStatus(prev => ({
      ...prev,
      pinecone: {
        ...prev.pinecone,
        enabled: isPineconeReady,
        status: isPineconeReady ? "checking" : "disconnected" as const
      }
    }));
  } catch (error) {
    console.error("Error loading API states:", error);
  }
};

export const saveSelectedModel = (model: string): void => {
  try {
    localStorage.setItem('selectedAiModel', model);
  } catch (error) {
    console.error("Error saving selected model:", error);
  }
};

export const loadSelectedModel = (
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>
): void => {
  try {
    const savedModel = localStorage.getItem('selectedAiModel');
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  } catch (error) {
    console.error("Error loading selected model:", error);
  }
};

export const calculateOverallHealth = (apiStatus: ApiStatusState): "healthy" | "degraded" | "critical" => {
  const enabledApis = Object.entries(apiStatus).filter(([_, data]) => data.enabled);
  
  if (enabledApis.length === 0) {
    return "critical";
  }
  
  const statuses = enabledApis.map(([_, data]) => data.status);
  
  if (statuses.some(status => status === "checking")) {
    return "degraded";
  }
  
  if (statuses.every(status => status === "connected")) {
    return "healthy";
  }
  
  if (statuses.filter(status => status === "error").length >= Math.ceil(enabledApis.length / 2)) {
    return "critical";
  }
  
  return "degraded";
};

export const checkApiHealth = async (
  apiStatus: ApiStatusState,
  setApiStatus: React.Dispatch<React.SetStateAction<ApiStatusState>>,
  setChecking: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> => {
  setChecking(true);
  
  setApiStatus(prev => {
    const newStatus = { ...prev };
    Object.keys(newStatus).forEach(key => {
      newStatus[key] = { 
        ...newStatus[key], 
        status: newStatus[key].enabled ? "checking" : "disconnected" as const
      };
    });
    return newStatus;
  });
  
  try {
    if (apiStatus.dataforseo.enabled) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const dataForSeoErrors = localStorage.getItem('dataForSeoErrors');
      setApiStatus(prev => ({
        ...prev,
        dataforseo: {
          ...prev.dataforseo,
          status: dataForSeoErrors ? "error" : "connected",
          lastChecked: new Date(),
          errorMessage: dataForSeoErrors ? "API key or rate limit issues" : undefined
        }
      }));
    }
    
    if (apiStatus.openai.enabled) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const openAiErrors = localStorage.getItem('openAiErrors');
      setApiStatus(prev => ({
        ...prev,
        openai: {
          ...prev.openai,
          status: openAiErrors ? "error" : "connected",
          lastChecked: new Date(),
          errorMessage: openAiErrors ? "API key or rate limit issues" : undefined
        }
      }));
    }
    
    if (apiStatus.googleKeyword.enabled) {
      await new Promise(resolve => setTimeout(resolve, 700));
      const googleKeywordErrors = localStorage.getItem('googleKeywordErrors');
      setApiStatus(prev => ({
        ...prev,
        googleKeyword: {
          ...prev.googleKeyword,
          status: googleKeywordErrors ? "error" : "disconnected",
          lastChecked: new Date(),
          errorMessage: googleKeywordErrors ? "Authentication error" : "Not connected"
        }
      }));
    }
    
    if (apiStatus.pinecone.enabled) {
      const isPineconeReady = isPineconeConfigured();
      
      if (isPineconeReady) {
        const connectionSuccess = await testPineconeConnection();
        const pineconeErrors = localStorage.getItem('pineconeErrors');
        
        setApiStatus(prev => ({
          ...prev,
          pinecone: {
            ...prev.pinecone,
            status: connectionSuccess ? "connected" : "error",
            lastChecked: new Date(),
            errorMessage: pineconeErrors || undefined
          }
        }));
      } else {
        setApiStatus(prev => ({
          ...prev,
          pinecone: {
            ...prev.pinecone,
            status: "disconnected",
            lastChecked: new Date(),
            errorMessage: "Not configured"
          }
        }));
      }
    }
  } catch (error) {
    console.error("Error checking API health:", error);
  } finally {
    setChecking(false);
  }
};

export const testApi = async (
  apiId: string,
  apiStatus: ApiStatusState, 
  selectedModel: string,
  setTestResult: React.Dispatch<React.SetStateAction<{ status: "idle" | "success" | "error" | "loading"; message?: string }>>,
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
    } else if (apiId === "openai") {
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
    } else if (apiId === "googleKeyword") {
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
    } else if (apiId === "pinecone") {
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
    }
    
    checkApiHealthFn();
  } catch (error) {
    setTestResult({ 
      status: "error", 
      message: `Test failed with error: ${(error as Error).message}` 
    });
  }
};
