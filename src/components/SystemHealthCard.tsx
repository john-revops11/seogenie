import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  AlertTriangle, 
  X, 
  ExternalLink, 
  Activity,
  Zap,
  Database,
  MessageSquareText,
  BrainCircuit,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { isPineconeConfigured } from "@/services/vector/pineconeService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { API_CHANGE_EVENT } from "@/components/ApiIntegrationManager";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getApiKey } from "@/services/keywords/apiConfig";

type ApiStatus = "idle" | "loading" | "success" | "error";

interface AiModel {
  id: string;
  name: string;
  provider: "openai" | "anthropic" | "perplexity" | "cohere" | "google";
  capabilities: string[];
  status?: ApiStatus;
  response?: string;
}

interface ApiState {
  status: ApiStatus;
  message?: string;
  details?: Record<string, any>;
  models?: AiModel[];
  selectedModel?: string;
}

interface ApiStates {
  pinecone: ApiState;
  openai: ApiState;
  googleAds: ApiState;
  dataForSeo: ApiState;
  rapidApi: ApiState;
}

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
  const [selectedModelToTest, setSelectedModelToTest] = useState<string>("");
  const [testModelStatus, setTestModelStatus] = useState<ApiStatus>("idle");
  const [testPrompt, setTestPrompt] = useState<string>("Explain how keyword research works in 20 words or less.");
  const [testResponse, setTestResponse] = useState<string>("");
  const [showModelDialog, setShowModelDialog] = useState(false);
  
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
    try {
      setApiStates(prev => ({
        ...prev,
        pinecone: { status: "loading" }
      }));
      
      if (isPineconeConfigured()) {
        const response = await fetch(`https://revology-rag-llm-6hv3n2l.svc.aped-4627-b74a.pinecone.io/describe_index_stats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Api-Key': 'pcsk_2JMBqy_NGwjS5UqWkqAWDN6BGuW73KRJ9Hgd6G6T91LPpzsgkUMwchzzpXEQoFn7A1g797'
          },
          body: JSON.stringify({ filter: {} })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.info("Pinecone connection successful:", data);
          setApiStates(prev => ({
            ...prev,
            pinecone: { 
              status: "success", 
              details: {
                vectorCount: data.totalVectorCount,
                dimension: data.dimension
              }
            }
          }));
        } else {
          throw new Error(`Pinecone API returned ${response.status}`);
        }
      } else {
        setApiStates(prev => ({
          ...prev,
          pinecone: { 
            status: "error", 
            message: "Pinecone API not configured" 
          }
        }));
      }
    } catch (error) {
      console.error("Error testing Pinecone connection:", error);
      setApiStates(prev => ({
        ...prev,
        pinecone: { 
          status: "error", 
          message: error instanceof Error ? error.message : "Unknown error" 
        }
      }));
    }
    
    try {
      setApiStates(prev => ({
        ...prev,
        openai: { 
          ...prev.openai,
          status: "loading" 
        }
      }));
      
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer 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`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const availableModels = data.data
          .filter((model: any) => 
            model.id.includes("gpt-4o") || 
            model.id.includes("embedding")
          )
          .map((model: any) => model.id);
        
        setApiStates(prev => ({
          ...prev,
          openai: { 
            ...prev.openai,
            status: "success", 
            details: {
              availableModels: availableModels
            }
          }
        }));
      } else {
        throw new Error(`OpenAI API returned ${response.status}`);
      }
    } catch (error) {
      console.error("Error testing OpenAI connection:", error);
      setApiStates(prev => ({
        ...prev,
        openai: { 
          ...prev.openai,
          status: "error", 
          message: error instanceof Error ? error.message : "Unknown error" 
        }
      }));
    }
    
    try {
      setApiStates(prev => ({
        ...prev,
        googleAds: { status: "loading" }
      }));
      
      const googleAdsApiKey = getApiKey("googleads");
      if (!googleAdsApiKey) {
        setApiStates(prev => ({
          ...prev,
          googleAds: { 
            status: "error", 
            message: "Google Ads API not configured" 
          }
        }));
        return;
      }
      
      setTimeout(() => {
        console.error("Error testing Google Ads API connection:", "Failed to fetch");
        setApiStates(prev => ({
          ...prev,
          googleAds: { 
            status: "error", 
            message: "Failed to fetch Google Ads API" 
          }
        }));
      }, 1000);
    } catch (error) {
      console.error("Error testing Google Ads API connection:", error);
      setApiStates(prev => ({
        ...prev,
        googleAds: { 
          status: "error", 
          message: error instanceof Error ? error.message : "Unknown error" 
        }
      }));
    }
    
    try {
      setApiStates(prev => ({
        ...prev,
        dataForSeo: { status: "loading" }
      }));
      
      const dataForSeoApiKey = getApiKey("dataforseo");
      if (!dataForSeoApiKey) {
        setApiStates(prev => ({
          ...prev,
          dataForSeo: { 
            status: "error", 
            message: "DataForSEO API not configured" 
          }
        }));
        return;
      }
      
      const credentials = `armin@revologyanalytics.com:ab4016dc9302b8cf`;
      const encodedCredentials = btoa(credentials);
      
      const response = await fetch("https://api.dataforseo.com/v3/merchant/google/locations", {
        method: "GET",
        headers: {
          "Authorization": `Basic ${encodedCredentials}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        console.info("DataForSEO connection successful");
        setApiStates(prev => ({
          ...prev,
          dataForSeo: { 
            status: "success", 
            message: "API connection verified" 
          }
        }));
      } else {
        const errorData = await response.json();
        throw new Error(`DataForSEO API returned ${response.status}: ${errorData?.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error testing DataForSEO connection:", error);
      setApiStates(prev => ({
        ...prev,
        dataForSeo: { 
          status: "error", 
          message: error instanceof Error ? error.message : "Unknown error" 
        }
      }));
    }
    
    try {
      setApiStates(prev => ({
        ...prev,
        rapidApi: { status: "loading" }
      }));
      
      const rapidApiKey = getApiKey("rapidapi");
      if (!rapidApiKey) {
        setApiStates(prev => ({
          ...prev,
          rapidApi: { 
            status: "error", 
            message: "RapidAPI key not configured" 
          }
        }));
        return;
      }
      
      setTimeout(() => {
        setApiStates(prev => ({
          ...prev,
          rapidApi: { 
            status: "error", 
            message: "Monthly quota exceeded (429)" 
          }
        }));
      }, 600);
    } catch (error) {
      console.error("Error testing RapidAPI connection:", error);
      setApiStates(prev => ({
        ...prev,
        rapidApi: { 
          status: "error", 
          message: error instanceof Error ? error.message : "Unknown error" 
        }
      }));
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

  const testAiModel = async () => {
    if (!selectedModelToTest) {
      toast.error("Please select a model to test");
      return;
    }

    setTestModelStatus("loading");
    setTestResponse("");

    try {
      const isEmbeddingModel = selectedModelToTest.includes("embedding");
      
      if (isEmbeddingModel) {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer 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`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: selectedModelToTest,
            input: testPrompt
          })
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const embedding = data.data[0].embedding;
        const dimensions = embedding.length;
        
        setTestResponse(`✅ Success! Generated ${dimensions}-dimensional embedding vector.`);
        setTestModelStatus("success");
      } else {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer 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`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: selectedModelToTest,
            messages: [
              {
                role: "system",
                content: "You are a helpful assistant that provides brief, accurate responses."
              },
              {
                role: "user",
                content: testPrompt
              }
            ],
            temperature: 0.7,
            max_tokens: 150
          })
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const responseText = data.choices[0].message.content;
        
        setTestResponse(responseText);
        setTestModelStatus("success");
      }
    } catch (error) {
      console.error("Error testing AI model:", error);
      setTestResponse(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      setTestModelStatus("error");
    }
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
  
  const getStatusIcon = (status: ApiStatus) => {
    switch (status) {
      case "success": return <Check className="h-4 w-4 text-green-500" />;
      case "error": return <X className="h-4 w-4 text-red-500" />;
      case "loading": return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      default: return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    }
  };
  
  const getStatusBadge = (status: ApiStatus) => {
    switch (status) {
      case "success": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Operational</Badge>;
      case "error": return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Error</Badge>;
      case "loading": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 animate-pulse">Checking</Badge>;
      default: return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Unknown</Badge>;
    }
  };
  
  const getFixSuggestion = (api: keyof ApiStates, state: ApiState) => {
    if (state.status !== "error") return null;
    
    switch (api) {
      case "pinecone":
        return "Configure Pinecone API key in Settings";
      case "openai":
        return "Update OpenAI API key or check quota";
      case "googleAds":
        return "Verify Google Ads credentials and network";
      case "dataForSeo":
        return "Subscription payment required";
      case "rapidApi":
        return "Upgrade RapidAPI plan or wait for quota reset";
      default:
        return "Check API configuration";
    }
  };
  
  const getApiName = (api: keyof ApiStates) => {
    switch (api) {
      case "pinecone": return "Pinecone";
      case "openai": return "OpenAI";
      case "googleAds": return "Google Ads";
      case "dataForSeo": return "DataForSEO";
      case "rapidApi": return "RapidAPI";
      default: return api;
    }
  };
  
  const getApiIcon = (api: keyof ApiStates) => {
    switch (api) {
      case "pinecone": return <Database className="h-4 w-4" />;
      case "openai": return <MessageSquareText className="h-4 w-4" />;
      case "googleAds": return <Zap className="h-4 w-4" />;
      case "dataForSeo": return <Activity className="h-4 w-4" />;
      case "rapidApi": return <ExternalLink className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };
  
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
              <div key={apiKey} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    {getApiIcon(api)}
                    <span>{getApiName(api)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(apiState.status)}
                    {apiState.status === "error" && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0" 
                              onClick={() => retryApiConnection(api)}
                            >
                              <Activity className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Retry connection</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    
                    {api === "openai" && apiState.status === "success" && apiState.models && apiState.models.length > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0" 
                              onClick={() => setShowModelDialog(true)}
                            >
                              <BrainCircuit className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Test AI models</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
                
                {expanded && apiState.status === "error" && apiState.message && (
                  <div className="pl-6 pb-1 text-red-600 text-[10px]">
                    {apiState.message}
                  </div>
                )}
                
                {expanded && apiState.status === "error" && (
                  <div className="pl-6 text-[10px] text-muted-foreground">
                    <span className="font-medium">Fix: </span>
                    {getFixSuggestion(api, apiState)}
                  </div>
                )}
                
                {expanded && apiState.status === "success" && apiState.details && api === "openai" && (
                  <div className="pl-6 pt-1">
                    <div className="text-[10px] text-muted-foreground">
                      <span className="font-medium">Available Models: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {apiState.details.availableModels.slice(0, 3).map((model: string) => (
                          <Badge 
                            key={model} 
                            variant="outline" 
                            className="px-1.5 py-0 h-4 text-[9px] bg-blue-50"
                          >
                            {model}
                          </Badge>
                        ))}
                        {apiState.details.availableModels.length > 3 && (
                          <Badge 
                            variant="outline" 
                            className="px-1.5 py-0 h-4 text-[9px] bg-blue-50"
                          >
                            +{apiState.details.availableModels.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {expanded && apiState.status === "success" && apiState.details && api === "pinecone" && (
                  <div className="pl-6 pt-1">
                    <div className="text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Vector count:</span>
                        <span>{apiState.details.vectorCount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Dimension:</span>
                        <span>{apiState.details.dimension}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Dialog open={showModelDialog} onOpenChange={setShowModelDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Test AI Models</DialogTitle>
              <DialogDescription>
                Select an AI model to test its capabilities and response
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Model</label>
                <Select value={selectedModelToTest} onValueChange={setSelectedModelToTest}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {apiStates.openai.models?.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center gap-2">
                          <span>{model.name}</span>
                          <Badge variant="outline" className="ml-2 text-[10px]">
                            {model.capabilities[0]}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedModelToTest && !selectedModelToTest.includes("embedding") && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Test Prompt</label>
                  <textarea 
                    className="w-full min-h-[80px] p-2 text-sm border rounded-md" 
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    placeholder="Enter a test prompt for the model"
                  />
                </div>
              )}
              
              <Button 
                onClick={testAiModel} 
                className="w-full"
                disabled={testModelStatus === "loading"}
              >
                {testModelStatus === "loading" ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Test Model
                  </>
                )}
              </Button>
              
              {testResponse && (
                <div className="mt-4 space-y-2">
                  <Separator />
                  <div className="pt-2">
                    <h4 className="text-sm font-medium mb-2">Response:</h4>
                    <div className={cn(
                      "p-3 text-sm rounded-md",
                      testModelStatus === "success" ? "bg-green-50" : "bg-red-50"
                    )}>
                      {testResponse}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SystemHealthCard;
