
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Activity, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { ApiStates } from "@/types/systemHealth";
import { ApiCardDetail } from "./system-health/ApiCardDetail";
import { ModelTestDialog } from "./system-health/ModelTestDialog";
import { 
  checkPineconeHealth, 
  checkOpenAIHealth, 
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
      { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai", capabilities: ["text", "vision", "function calling"] },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "openai", capabilities: ["text", "function calling"] },
      { id: "gpt-4o-2024-05-13", name: "GPT-4o (May 13)", provider: "openai", capabilities: ["text", "vision", "function calling"] },
      { id: "gpt-4-vision", name: "GPT-4 Vision", provider: "openai", capabilities: ["text", "vision"] },
      { id: "gpt-4o-1106", name: "GPT-4 O1", provider: "openai", capabilities: ["text", "vision", "function calling", "advanced reasoning"] },
      { id: "text-embedding-3-small", name: "Text Embedding v3 Small", provider: "openai", capabilities: ["embeddings"] },
      { id: "text-embedding-3-large", name: "Text Embedding v3 Large", provider: "openai", capabilities: ["embeddings"] },
    ] },
    googleAds: { status: "idle" },
    dataForSeo: { status: "idle" },
    rapidApi: { status: "idle" }
  });
  
  const [expanded, setExpanded] = useState(false);
  const [showModelDialog, setShowModelDialog] = useState(false);
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
    // Check Pinecone
    await checkPineconeHealth(setApiStates);
    
    // Check OpenAI
    await checkOpenAIHealth(setApiStates);
    
    // Check DataForSeo
    await checkDataForSeoHealth(setApiStates);
    
    // Check other APIs
    checkOtherApis(setApiStates);
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
  
  return (
    <Card className={cn(
      "transition-all duration-300", 
      expanded ? "max-w-md" : "max-w-xs"
    )}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between mb-2">
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
        
        <div className="space-y-3">
          {Object.entries(apiStates).map(([apiKey, apiState]) => {
            const api = apiKey as keyof ApiStates;
            return (
              <ApiCardDetail 
                key={apiKey}
                api={api}
                state={apiState}
                expanded={expanded}
                onRetry={retryApiConnection}
                onTestModels={api === "openai" ? () => setShowModelDialog(true) : undefined}
              />
            );
          })}
        </div>

        <ModelTestDialog
          open={showModelDialog}
          onOpenChange={setShowModelDialog}
          models={apiStates.openai.models}
          onTestModel={handleTestModel}
          testModelStatus={testModelStatus}
          testResponse={testResponse}
        />
      </CardContent>
    </Card>
  );
};

export default SystemHealthCard;
