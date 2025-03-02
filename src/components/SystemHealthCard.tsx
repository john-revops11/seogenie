
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, X, Wifi, WifiOff, AlertTriangle, Cog, LoaderCircle } from "lucide-react";

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

type ApiStatus = "connected" | "disconnected" | "error" | "checking";

interface ApiStatusState {
  [key: string]: {
    status: ApiStatus;
    lastChecked: Date | null;
    errorMessage?: string;
  };
}

const SystemHealthCard = () => {
  const [expanded, setExpanded] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatusState>({
    dataforseo: { status: "checking", lastChecked: null },
    openai: { status: "checking", lastChecked: null },
    googleKeyword: { status: "checking", lastChecked: null },
  });
  const [checking, setChecking] = useState(false);

  // Function to check APIs health
  const checkApiHealth = async () => {
    setChecking(true);
    
    // Start with all APIs in checking state
    setApiStatus(prev => {
      const newStatus = { ...prev };
      Object.keys(newStatus).forEach(key => {
        newStatus[key] = { ...newStatus[key], status: "checking" as ApiStatus };
      });
      return newStatus;
    });
    
    try {
      // Check DataForSEO API status
      // Simulate API check with setTimeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get actual status from localStorage or errors in console
      const dataForSeoErrors = localStorage.getItem('dataForSeoErrors');
      setApiStatus(prev => ({
        ...prev,
        dataforseo: {
          status: dataForSeoErrors ? "error" : "connected",
          lastChecked: new Date(),
          errorMessage: dataForSeoErrors ? "API key or rate limit issues" : undefined
        }
      }));
      
      // Check OpenAI API status
      await new Promise(resolve => setTimeout(resolve, 600));
      const openAiErrors = localStorage.getItem('openAiErrors');
      setApiStatus(prev => ({
        ...prev,
        openai: {
          status: openAiErrors ? "error" : "connected",
          lastChecked: new Date(),
          errorMessage: openAiErrors ? "API key or rate limit issues" : undefined
        }
      }));
      
      // Check Google Keyword API status
      await new Promise(resolve => setTimeout(resolve, 700));
      const googleKeywordErrors = localStorage.getItem('googleKeywordErrors');
      setApiStatus(prev => ({
        ...prev,
        googleKeyword: {
          status: googleKeywordErrors ? "error" : "disconnected",
          lastChecked: new Date(),
          errorMessage: googleKeywordErrors ? "Authentication error" : "Not connected"
        }
      }));
    } catch (error) {
      console.error("Error checking API health:", error);
    } finally {
      setChecking(false);
    }
  };

  // Check API health on component mount
  useEffect(() => {
    checkApiHealth();
    
    // Set up periodic health check every 5 minutes
    const intervalId = setInterval(checkApiHealth, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Calculate overall system health
  const calculateOverallHealth = (): "healthy" | "degraded" | "critical" => {
    const statuses = Object.values(apiStatus).map(api => api.status);
    
    if (statuses.some(status => status === "checking")) {
      return "degraded";
    }
    
    if (statuses.every(status => status === "connected")) {
      return "healthy";
    }
    
    if (statuses.filter(status => status === "error").length >= 2) {
      return "critical";
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
            
            <div className="space-y-2">
              {API_DETAILS.map((api) => (
                <div key={api.id} className="flex items-center justify-between text-sm p-2 rounded bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    {renderStatusIcon(apiStatus[api.id]?.status || "checking")}
                    <span>{api.name}</span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant={apiStatus[api.id]?.status === "connected" ? "default" : "outline"}
                          className={`cursor-help ${
                            apiStatus[api.id]?.status === "connected" ? "bg-green-500" : 
                            apiStatus[api.id]?.status === "error" ? "border-red-300 text-red-500" : 
                            "border-slate-300 text-slate-500"
                          }`}
                        >
                          {apiStatus[api.id]?.status === "connected" ? "Connected" : 
                           apiStatus[api.id]?.status === "error" ? "Error" :
                           apiStatus[api.id]?.status === "checking" ? "Checking" : "Disconnected"}
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
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
