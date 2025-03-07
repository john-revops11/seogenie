
import React, { useState } from "react";
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
import { defaultAIModels, AIModel, getModelsForProvider, AIProvider } from "@/types/aiModels";

const ApiHealthBar: React.FC = () => {
  const [selectedApi, setSelectedApi] = useState<ApiDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const apiServices = [
    { 
      id: "openai", 
      name: "OpenAI", 
      description: "AI models for content generation",
      icon: <MessageSquareText className="h-4 w-4" />,
      iconName: "messageSquareText",
      status: Boolean(getApiKey("openai")),
      isConfigured: Boolean(getApiKey("openai")),
      isActive: Boolean(getApiKey("openai")),
    },
    { 
      id: "gemini", 
      name: "Gemini", 
      description: "Google's AI models for content generation",
      icon: <Sparkles className="h-4 w-4" />,
      iconName: "sparkles",
      status: Boolean(getApiKey("gemini")),
      isConfigured: Boolean(getApiKey("gemini")),
      isActive: Boolean(getApiKey("gemini")),
    },
    { 
      id: "dataforseo", 
      name: "DataForSEO", 
      description: "SEO data and keyword research",
      icon: <Search className="h-4 w-4" />,
      iconName: "search",
      status: Boolean(getApiKey("dataforseo")),
      isConfigured: Boolean(getApiKey("dataforseo")),
      isActive: Boolean(getApiKey("dataforseo")),
    },
    { 
      id: "semrush", 
      name: "SemRush", 
      description: "Competitor research and keyword analytics",
      icon: <BarChart className="h-4 w-4" />,
      iconName: "barChart",
      status: Boolean(getApiKey("semrush")),
      isConfigured: Boolean(getApiKey("semrush")),
      isActive: Boolean(getApiKey("semrush")),
    },
    { 
      id: "pinecone", 
      name: "Pinecone", 
      description: "Vector database for semantic search",
      icon: <Database className="h-4 w-4" />,
      iconName: "database",
      status: Boolean(getApiKey("pinecone")),
      isConfigured: Boolean(getApiKey("pinecone")),
      isActive: Boolean(getApiKey("pinecone")),
    }
  ];
  
  const handleApiClick = (api: ApiDetails) => {
    setSelectedApi(api);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedApi(null);
  };
  
  return (
    <>
      <div className="bg-card border rounded-md shadow-sm p-2 flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">API Health:</span>
          <Progress 
            value={
              (apiServices.filter(api => api.status).length / apiServices.length) * 100
            } 
            className="w-24 h-2"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <TooltipProvider>
            {apiServices.map((api) => (
              <Tooltip key={api.id}>
                <TooltipTrigger asChild>
                  <Badge 
                    variant={api.status ? "outline" : "secondary"} 
                    className={cn(
                      "flex items-center gap-1.5 cursor-pointer transition-colors",
                      api.status 
                        ? "border-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-green-700"
                        : "border-gray-200 bg-gray-100 hover:bg-gray-200 text-gray-500"
                    )}
                    onClick={() => handleApiClick(api)}
                  >
                    {api.icon}
                    <span className="text-xs">{api.name}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{api.status ? "Connected" : "Not Connected"} - Click to configure</p>
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
