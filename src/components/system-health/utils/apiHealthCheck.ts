
import { ApiStatusState } from "../types";
import { isPineconeConfigured, testPineconeConnection } from "@/services/vector/pineconeService";

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
    
    await checkPineconeHealth(apiStatus, setApiStatus);
  } catch (error) {
    console.error("Error checking API health:", error);
  } finally {
    setChecking(false);
  }
};

const checkPineconeHealth = async (
  apiStatus: ApiStatusState,
  setApiStatus: React.Dispatch<React.SetStateAction<ApiStatusState>>
): Promise<void> => {
  if (apiStatus.pinecone.enabled) {
    const isPineconeReady = isPineconeConfigured();
    
    if (isPineconeReady) {
      try {
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
      } catch (error) {
        console.error("Error testing Pinecone connection:", error);
        setApiStatus(prev => ({
          ...prev,
          pinecone: {
            ...prev.pinecone,
            status: "error",
            lastChecked: new Date(),
            errorMessage: (error as Error).message
          }
        }));
      }
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
};
