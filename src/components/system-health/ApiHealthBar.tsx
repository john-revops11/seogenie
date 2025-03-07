
import React from "react";
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

const ApiHealthBar: React.FC = () => {
  const apiServices = [
    { 
      id: "openai", 
      name: "OpenAI", 
      icon: <MessageSquareText className="h-4 w-4" />,
      status: Boolean(getApiKey("openai")),
    },
    { 
      id: "gemini", 
      name: "Gemini", 
      icon: <Sparkles className="h-4 w-4" />,
      status: Boolean(getApiKey("gemini")),
    },
    { 
      id: "dataforseo", 
      name: "DataForSEO", 
      icon: <Search className="h-4 w-4" />,
      status: Boolean(getApiKey("dataforseo")),
    },
    { 
      id: "semrush", 
      name: "SemRush", 
      icon: <BarChart className="h-4 w-4" />,
      status: Boolean(getApiKey("semrush")),
    },
    { 
      id: "pinecone", 
      name: "Pinecone", 
      icon: <Database className="h-4 w-4" />,
      status: Boolean(getApiKey("pinecone")),
    }
  ];
  
  return (
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
                    "flex items-center gap-1.5 cursor-help transition-colors",
                    api.status 
                      ? "border-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-green-700"
                      : "border-gray-200 bg-gray-100 text-gray-500"
                  )}
                >
                  {api.icon}
                  <span className="text-xs">{api.name}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{api.status ? "Connected" : "Not Connected"}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ApiHealthBar;
