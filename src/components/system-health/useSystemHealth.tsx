import { useState, useEffect } from "react";
import { ApiStates } from "@/types/systemHealth";
import { toast } from "sonner";
import { API_CHANGE_EVENT } from "@/utils/apiIntegrationEvents";
import { 
  checkPineconeHealth, 
  checkOpenAIHealth,
  checkGeminiHealth,
  checkDataForSeoHealth
} from "@/utils/apiHealthCheck";

export function useSystemHealth() {
  const [apiStates, setApiStates] = useState<ApiStates>({
    pinecone: { status: "idle" },
    openai: { status: "idle", models: [
      { id: "gpt-4o", name: "GPT-4o", provider: "openai", capabilities: ["text", "vision", "function calling"] },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai", capabilities: ["text", "vision", "function calling"] },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "openai", capabilities: ["text", "function calling"] },
      { id: "text-embedding-3-small", name: "Text Embedding v3 Small", provider: "openai", capabilities: ["embeddings"] },
    ] },
    gemini: { status: "idle", models: [
      { id: "gemini-pro", name: "Gemini Pro", provider: "gemini", capabilities: ["text"] },
      { id: "gemini-pro-vision", name: "Gemini Pro Vision", provider: "gemini", capabilities: ["text", "vision"] }
    ] },
    dataForSeo: { status: "idle" },
    googleAds: { status: "idle" },
    rapidApi: { status: "idle" }
  });
  
  const [expanded, setExpanded] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  
  useEffect(() => {
    checkApiStatuses();
    
    const handleApiChange = (event: CustomEvent) => {
      const { apiId, action } = event.detail;
      console.log(`API ${action} detected for ${apiId}, refreshing system health...`);
      checkApiStatuses();
    };
    
    window.addEventListener(API_CHANGE_EVENT, handleApiChange as EventListener);
    
    return () => {
      window.removeEventListener(API_CHANGE_EVENT, handleApiChange as EventListener);
    };
  }, []);
  
  const checkApiStatuses = async () => {
    console.log("Checking API statuses...");
    setIsChecking(true);
    
    try {
      // Check Pinecone
      await checkPineconeHealth(setApiStates);
      
      // Check OpenAI
      await checkOpenAIHealth(setApiStates);
      
      // Check Gemini
      await checkGeminiHealth(setApiStates);
      
      // Check DataForSEO API specifically
      try {
        const { testDataForSeoConnection } = await import('@/services/keywords/api/dataForSeo/testConnection');
        const isDataForSEOConnected = await testDataForSeoConnection();
        
        if (isDataForSEOConnected) {
          setApiStates(prev => ({
            ...prev,
            dataForSeo: { 
              status: "success",
              details: {
                verified: true,
                usingRealData: true
              }
            }
          }));
          
          window.dispatchEvent(new CustomEvent(API_CHANGE_EVENT, {
            detail: { apiId: "dataForSeo", action: "connected" }
          }));
        }
      } catch (dfError) {
        console.error("Error checking DataForSEO API:", dfError);
      }
      
      console.log("API status check completed");
    } catch (error) {
      console.error("Error checking API statuses:", error);
    } finally {
      setIsChecking(false);
    }
  };
  
  const retryApiConnection = (apiName: keyof ApiStates) => {
    toast.info(`Retrying ${apiName} connection...`);
    
    setApiStates(prev => ({
      ...prev,
      [apiName]: { 
        ...prev[apiName],
        status: "loading" 
      }
    }));
    
    setTimeout(() => {
      checkApiStatuses();
    }, 1000);
  };

  const allApiStatuses = Object.values(apiStates).map(api => api.status);
  const healthyApiCount = allApiStatuses.filter(status => status === "success").length;
  const totalApiCount = allApiStatuses.length;
  const healthPercentage = (healthyApiCount / totalApiCount) * 100;
  
  let systemHealth: "good" | "warning" | "critical";
  if (healthPercentage >= 70) {
    systemHealth = "good";
  } else if (healthPercentage >= 40) {
    systemHealth = "warning";
  } else {
    systemHealth = "critical";
  }

  const openDocsForApi = (api: keyof ApiStates) => {
    let docsUrl = "";
    
    switch(api) {
      case "openai":
        docsUrl = "https://platform.openai.com/docs/introduction";
        break;
      case "gemini":
        docsUrl = "https://ai.google.dev/docs";
        break;
      case "dataForSeo":
        docsUrl = "https://docs.dataforseo.com/";
        break;
      case "pinecone":
        docsUrl = "https://docs.pinecone.io/";
        break;
      default:
        docsUrl = "";
    }
    
    if (docsUrl) {
      window.open(docsUrl, "_blank");
    }
  };

  return {
    apiStates,
    expanded,
    setExpanded,
    systemHealth,
    retryApiConnection,
    openDocsForApi
  };
}
