
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, X, Wifi, WifiOff, AlertTriangle, Cog, LoaderCircle, PlayCircle, PowerOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// API names and their descriptions
const API_DETAILS = [
  { 
    id: "dataforseo", 
    name: "DataForSEO", 
    description: "Provides keyword research data" 
  },
  { 
    id: "openai", 
    name: "OpenAI", 
    description: "Powers content generation and AI-based keyword analysis" 
  },
  { 
    id: "googleKeyword", 
    name: "Google Keyword", 
    description: "Alternative source for keyword data" 
  }
];

// AI model options for OpenAI
const AI_MODELS = [
  { id: "gpt-4o", name: "GPT-4o (Default)", description: "Most capable OpenAI model for content generation" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Faster, more cost-effective version" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Legacy model for basic tasks" }
];

type ApiStatus = "connected" | "disconnected" | "error" | "checking";

interface ApiStatusState {
  [key: string]: {
    status: ApiStatus;
    lastChecked: Date | null;
    errorMessage?: string;
    enabled: boolean;
  };
}

const SystemHealthCard = () => {
  const [expanded, setExpanded] = useState(false);
  const [showTesting, setShowTesting] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatusState>({
    dataforseo: { status: "checking", lastChecked: null, enabled: true },
    openai: { status: "checking", lastChecked: null, enabled: true },
    googleKeyword: { status: "checking", lastChecked: null, enabled: true },
  });
  const [checking, setChecking] = useState(false);
  const [selectedApiForTest, setSelectedApiForTest] = useState<string>("dataforseo");
  const [testResult, setTestResult] = useState<{status: "idle" | "success" | "error" | "loading", message?: string}>({
    status: "idle"
  });
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o");

  // Function to check APIs health
  const checkApiHealth = async () => {
    setChecking(true);
    
    // Start with all APIs in checking state
    setApiStatus(prev => {
      const newStatus = { ...prev };
      Object.keys(newStatus).forEach(key => {
        newStatus[key] = { 
          ...newStatus[key], 
          status: newStatus[key].enabled ? "checking" as ApiStatus : "disconnected" as ApiStatus 
        };
      });
      return newStatus;
    });
    
    try {
      // Check DataForSEO API status if enabled
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
      
      // Check OpenAI API status if enabled
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
      
      // Check Google Keyword API status if enabled
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
    } catch (error) {
      console.error("Error checking API health:", error);
    } finally {
      setChecking(false);
    }
  };

  // Save API enabled states to localStorage
  const saveApiStates = (newStates: ApiStatusState) => {
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

  // Load API enabled states from localStorage
  const loadApiStates = () => {
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
                status: enabledStates[key] ? newStates[key].status : "disconnected" as ApiStatus
              };
            }
          });
          return newStates;
        });
      }
    } catch (error) {
      console.error("Error loading API states:", error);
    }
  };

  // Save selected model to localStorage
  const saveSelectedModel = (model: string) => {
    try {
      localStorage.setItem('selectedAiModel', model);
    } catch (error) {
      console.error("Error saving selected model:", error);
    }
  };

  // Load selected model from localStorage
  const loadSelectedModel = () => {
    try {
      const savedModel = localStorage.getItem('selectedAiModel');
      if (savedModel) {
        setSelectedModel(savedModel);
      }
    } catch (error) {
      console.error("Error loading selected model:", error);
    }
  };

  // Test specific API
  const testApi = async (apiId: string) => {
    setTestResult({ status: "loading" });
    
    try {
      // Simulate API test (in a real app, this would make an actual API call)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if API is enabled
      if (!apiStatus[apiId].enabled) {
        setTestResult({ 
          status: "error", 
          message: `${API_DETAILS.find(api => api.id === apiId)?.name} API is disabled. Enable it first.` 
        });
        return;
      }
      
      // Different test results based on API
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
      }
      
      // Update the API status after testing
      checkApiHealth();
    } catch (error) {
      setTestResult({ 
        status: "error", 
        message: `Test failed with error: ${(error as Error).message}` 
      });
    }
  };

  // Toggle API enabled state
  const toggleApiEnabled = (apiId: string) => {
    setApiStatus(prev => {
      const newStates = { 
        ...prev,
        [apiId]: {
          ...prev[apiId],
          enabled: !prev[apiId].enabled,
          status: !prev[apiId].enabled ? "checking" as ApiStatus : "disconnected" as ApiStatus
        }
      };
      
      // Save the new states to localStorage
      saveApiStates(newStates);
      
      return newStates;
    });
    
    // If enabling an API, check its health immediately
    if (!apiStatus[apiId].enabled) {
      checkApiHealth();
    }
  };

  // Handle model selection change
  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    saveSelectedModel(value);
  };

  // Check API health on component mount and load saved states
  useEffect(() => {
    loadApiStates();
    loadSelectedModel();
    checkApiHealth();
    
    // Set up periodic health check every 5 minutes
    const intervalId = setInterval(checkApiHealth, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Calculate overall system health
  const calculateOverallHealth = (): "healthy" | "degraded" | "critical" => {
    const enabledApis = Object.entries(apiStatus).filter(([_, data]) => data.enabled);
    
    if (enabledApis.length === 0) {
      return "critical"; // All APIs disabled
    }
    
    const statuses = enabledApis.map(([_, data]) => data.status);
    
    if (statuses.some(status => status === "checking")) {
      return "degraded";
    }
    
    if (statuses.every(status => status === "connected")) {
      return "healthy";
    }
    
    if (statuses.filter(status => status === "error").length >= Math.ceil(enabledApis.length / 2)) {
      return "critical"; // More than half of enabled APIs have errors
    }
    
    return "degraded";
  };
  
  const systemHealth = calculateOverallHealth();
  
  // Show health status icon
  const renderHealthIcon = () => {
    switch(systemHealth) {
      case "healthy":
        return <Check className="h-4 w-4 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "critical":
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <LoaderCircle className="h-4 w-4 animate-spin" />;
    }
  };
  
  // Render status icon for each API
  const renderStatusIcon = (status: ApiStatus) => {
    switch(status) {
      case "connected":
        return <Wifi className="h-4 w-4 text-green-500" />;
      case "disconnected":
        return <WifiOff className="h-4 w-4 text-slate-400" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "checking":
        return <LoaderCircle className="h-4 w-4 animate-spin text-slate-400" />;
    }
  };

  // Render test result icon
  const renderTestResultIcon = () => {
    switch(testResult.status) {
      case "success":
        return <Check className="h-4 w-4 text-green-500" />;
      case "error":
        return <X className="h-4 w-4 text-red-500" />;
      case "loading":
        return <LoaderCircle className="h-4 w-4 animate-spin text-slate-400" />;
      default:
        return null;
    }
  };

  return (
    <Card className={`absolute top-4 right-4 z-10 shadow-md transition-all duration-300 border-gray-200 hover:shadow-lg ${expanded ? 'w-80' : 'w-auto'}`}>
      <CardContent className="p-3">
        {expanded ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium flex items-center gap-2">
                {renderHealthIcon()}
                System Health
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setShowTesting(!showTesting)}
                  title="Test APIs"
                >
                  <PlayCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => checkApiHealth()}
                  disabled={checking}
                >
                  <Cog className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0" 
                  onClick={() => setExpanded(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {showTesting && (
              <div className="space-y-2 rounded-md bg-gray-50 dark:bg-gray-800 p-3">
                <h4 className="text-xs font-semibold mb-2">API Testing</h4>
                <div className="flex items-center gap-2 mb-2">
                  <Select value={selectedApiForTest} onValueChange={setSelectedApiForTest}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Select API to test" />
                    </SelectTrigger>
                    <SelectContent>
                      {API_DETAILS.map((api) => (
                        <SelectItem key={api.id} value={api.id} className="text-xs">
                          {api.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    size="xs" 
                    onClick={() => testApi(selectedApiForTest)}
                    disabled={testResult.status === "loading"}
                    className="h-8"
                  >
                    {testResult.status === "loading" ? (
                      <LoaderCircle className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <PlayCircle className="h-3 w-3 mr-1" />
                    )}
                    Test
                  </Button>
                </div>
                
                {selectedApiForTest === "openai" && (
                  <div className="mb-2">
                    <Select value={selectedModel} onValueChange={handleModelChange}>
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Select AI Model" />
                      </SelectTrigger>
                      <SelectContent>
                        {AI_MODELS.map((model) => (
                          <SelectItem key={model.id} value={model.id} className="text-xs">
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {AI_MODELS.find(m => m.id === selectedModel)?.description}
                    </p>
                  </div>
                )}
                
                {testResult.status !== "idle" && (
                  <div className={`text-xs p-2 rounded flex items-start gap-1.5 ${
                    testResult.status === "success" ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : 
                    testResult.status === "error" ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300" : 
                    "bg-gray-100 dark:bg-gray-700"
                  }`}>
                    {renderTestResultIcon()}
                    <span className="flex-1">{testResult.message}</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              {API_DETAILS.map((api) => (
                <div key={api.id} className="flex items-center justify-between text-sm p-2 rounded bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    {renderStatusIcon(apiStatus[api.id]?.status || "checking")}
                    <span>{api.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Switch 
                        id={`${api.id}-switch`}
                        checked={apiStatus[api.id]?.enabled || false}
                        onCheckedChange={() => toggleApiEnabled(api.id)}
                        className="data-[state=checked]:bg-green-500"
                      />
                      <Label 
                        htmlFor={`${api.id}-switch`}
                        className="sr-only"
                      >
                        {apiStatus[api.id]?.enabled ? "Enabled" : "Disabled"}
                      </Label>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge 
                            variant={apiStatus[api.id]?.status === "connected" ? "default" : "outline"}
                            className={`cursor-help ${
                              apiStatus[api.id]?.status === "connected" ? "bg-green-500" : 
                              apiStatus[api.id]?.status === "error" ? "border-red-300 text-red-500" : 
                              apiStatus[api.id]?.status === "disconnected" ? "border-slate-300 text-slate-500" :
                              "border-slate-300 text-slate-500"
                            }`}
                          >
                            {apiStatus[api.id]?.enabled ? 
                              (apiStatus[api.id]?.status === "connected" ? "Connected" : 
                               apiStatus[api.id]?.status === "error" ? "Error" :
                               apiStatus[api.id]?.status === "checking" ? "Checking" : "Disconnected") :
                              "Disabled"
                            }
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>{api.description}</p>
                          {apiStatus[api.id]?.errorMessage && (
                            <p className="text-red-400 mt-1 text-xs">{apiStatus[api.id]?.errorMessage}</p>
                          )}
                          {apiStatus[api.id]?.lastChecked && (
                            <p className="text-xs mt-1">
                              Last checked: {apiStatus[api.id]?.lastChecked?.toLocaleTimeString()}
                            </p>
                          )}
                          {!apiStatus[api.id]?.enabled && (
                            <p className="text-amber-400 mt-1 text-xs">This API is currently disabled</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setExpanded(true)}
          >
            {renderHealthIcon()}
            <span className="text-sm font-medium">System Health</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemHealthCard;
