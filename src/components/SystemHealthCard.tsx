
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Activity, X, ExternalLink, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { ApiStates } from "@/types/systemHealth";
import { ApiCardDetail } from "./system-health/ApiCardDetail";
import { ModelTestDialog } from "./system-health/ModelTestDialog";
import { 
  checkPineconeHealth, 
  checkOpenAIHealth,
  checkGeminiHealth,
  checkDataForSeoHealth, 
  checkOtherApis,
  testAiModel 
} from "@/utils/apiHealthCheck";
import { API_CHANGE_EVENT } from "@/utils/apiIntegrationEvents";

const SystemHealthCard = () => {
  const [apiStates, setApiStates] = useState<ApiStates>({
    pinecone: { status: "idle" },
    openai: { status: "idle", models: [
      { id: "gpt-4o", name: "GPT-4o", provider: "openai", capabilities: ["text", "vision", "function calling"] },
      { id: "gpt-4", name: "GPT-4", provider: "openai", capabilities: ["text", "function calling"] },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai", capabilities: ["text", "vision", "function calling"] },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "openai", capabilities: ["text", "function calling"] },
      { id: "text-embedding-3-small", name: "Text Embedding v3 Small", provider: "openai", capabilities: ["embeddings"] },
      { id: "text-embedding-3-large", name: "Text Embedding v3 Large", provider: "openai", capabilities: ["embeddings"] },
    ] },
    gemini: { status: "idle", models: [
      { id: "gemini-pro", name: "Gemini Pro", provider: "gemini", capabilities: ["text"] },
      { id: "gemini-pro-vision", name: "Gemini Pro Vision", provider: "gemini", capabilities: ["text", "vision"] }
    ] },
    googleAds: { status: "idle" },
    dataForSeo: { status: "idle" },
    rapidApi: { status: "idle" }
  });
  
  const [expanded, setExpanded] = useState(false);
  const [showModelDialog, setShowModelDialog] = useState(false);
  const [activeProvider, setActiveProvider] = useState<"openai" | "gemini">("openai");
  const [testModelStatus, setTestModelStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [testResponse, setTestResponse] = useState<string>("");
  
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
    
    // Check Pinecone
    await checkPineconeHealth(setApiStates);
    
    // Check OpenAI
    await checkOpenAIHealth(setApiStates);
    
    // Check Gemini
    await checkGeminiHealth(setApiStates);
    
    // Check DataForSeo
    await checkDataForSeoHealth(setApiStates);
    
    // Check other APIs
    checkOtherApis(setApiStates);
    
    console.log("API status check completed");
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

  const handleTestModel = async (modelId: string, prompt: string) => {
    await testAiModel(modelId, prompt, setTestModelStatus, setTestResponse);
  };
  
  const handleTestModels = (provider: "openai" | "gemini") => {
    setActiveProvider(provider);
    setShowModelDialog(true);
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
  
  const healthColor = {
    good: "text-green-500",
    warning: "text-amber-500",
    critical: "text-red-500"
  }[systemHealth];

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
      case "googleAds":
        docsUrl = "https://developers.google.com/google-ads/api/docs/start";
        break;
      case "rapidApi":
        docsUrl = "https://docs.rapidapi.com/";
        break;
      default:
        docsUrl = "";
    }
    
    if (docsUrl) {
      window.open(docsUrl, "_blank");
    }
  };
  
  return (
    <Card className={cn(
      "transition-all duration-300", 
      expanded ? "w-full" : "w-full"
    )}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Activity className={cn("h-5 w-5", healthColor)} />
            <h3 className="font-medium text-sm">System Health</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <X className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {Object.entries(apiStates).map(([apiKey, apiState]) => {
            const api = apiKey as keyof ApiStates;
            return (
              <div key={apiKey} className="flex-1 min-w-[150px]">
                <ApiCardDetail 
                  api={api}
                  state={apiState}
                  expanded={expanded}
                  onRetry={retryApiConnection}
                  onTestModels={
                    api === "openai" ? () => handleTestModels("openai") : 
                    api === "gemini" ? () => handleTestModels("gemini") : 
                    undefined
                  }
                  onOpenDocs={api !== "googleAds" && api !== "rapidApi" ? () => openDocsForApi(api) : undefined}
                />
              </div>
            );
          })}
        </div>

        <ModelTestDialog
          open={showModelDialog}
          onOpenChange={setShowModelDialog}
          models={apiStates[activeProvider].models}
          onTestModel={handleTestModel}
          testModelStatus={testModelStatus}
          testResponse={testResponse}
        />
      </CardContent>
    </Card>
  );
};

export default SystemHealthCard;
