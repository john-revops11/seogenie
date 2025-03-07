
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Database, MessageSquareText, Search, BarChart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getApiKey } from "@/services/keywords/apiConfig";
import { ApiConfigDialog } from "./ApiConfigDialog";
import { ApiDetails } from "@/types/apiIntegration";
import { loadApisFromStorage } from "@/services/apiIntegrationService";

const ApiHealthBar: React.FC = () => {
  const [selectedApi, setSelectedApi] = useState<ApiDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [apis, setApis] = useState<ApiDetails[]>([]);

  // Load configured APIs from localStorage on component mount
  useEffect(() => {
    const storedApis = loadApisFromStorage();
    if (storedApis.length > 0) {
      setApis(storedApis);
    } else {
      // Default API services if none are in localStorage
      setApis([
        { 
          id: "openai", 
          name: "OpenAI", 
          description: "AI models for content generation",
          iconName: "messageSquareText",
          isConfigured: Boolean(getApiKey("openai")),
          isActive: Boolean(getApiKey("openai")),
        },
        { 
          id: "gemini", 
          name: "Gemini", 
          description: "Google's AI models for content generation",
          iconName: "sparkles",
          isConfigured: Boolean(getApiKey("gemini")),
          isActive: Boolean(getApiKey("gemini")),
        },
        { 
          id: "dataforseo", 
          name: "DataForSEO", 
          description: "SEO data and keyword research",
          iconName: "search",
          isConfigured: Boolean(getApiKey("dataforseo")),
          isActive: Boolean(getApiKey("dataforseo")),
        },
        { 
          id: "semrush", 
          name: "SemRush", 
          description: "Competitor research and keyword analytics",
          iconName: "barChart",
          isConfigured: Boolean(getApiKey("semrush")),
          isActive: Boolean(getApiKey("semrush")),
        },
        { 
          id: "pinecone", 
          name: "Pinecone", 
          description: "Vector database for semantic search",
          iconName: "database",
          isConfigured: Boolean(getApiKey("pinecone")),
          isActive: Boolean(getApiKey("pinecone")),
        }
      ]);
    }
  }, []);
  
  const handleApiClick = (api: ApiDetails) => {
    setSelectedApi(api);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedApi(null);
  };
  
  // Generate icons based on iconName
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "messageSquareText": return <MessageSquareText className="h-4 w-4" />;
      case "sparkles": return <Sparkles className="h-4 w-4" />;
      case "search": return <Search className="h-4 w-4" />;
      case "barChart": return <BarChart className="h-4 w-4" />;
      case "database": return <Database className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };
  
  return (
    <>
      <div className="bg-card border rounded-md shadow-sm p-2 flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">API Health:</span>
          <Progress 
            value={
              (apis.filter(api => api.isConfigured && api.isActive).length / apis.length) * 100
            } 
            className="w-24 h-2"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <TooltipProvider>
            {apis.map((api) => (
              <Tooltip key={api.id}>
                <TooltipTrigger asChild>
                  <Badge 
                    variant={api.isConfigured && api.isActive ? "outline" : "secondary"} 
                    className={cn(
                      "flex items-center gap-1.5 cursor-pointer transition-colors",
                      api.isConfigured && api.isActive
                        ? "border-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-green-700"
                        : "border-gray-200 bg-gray-100 hover:bg-gray-200 text-gray-500"
                    )}
                    onClick={() => handleApiClick(api)}
                  >
                    {getIconComponent(api.iconName || "")}
                    <span className="text-xs">{api.name}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{api.isConfigured && api.isActive ? "Connected" : "Not Connected"} - Click to configure</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>

      {selectedApi && (
        <ApiConfigDialog 
          isOpen={isDialogOpen} 
          onClose={handleCloseDialog} 
          api={selectedApi}
        />
      )}
    </>
  );
};

export default ApiHealthBar;
