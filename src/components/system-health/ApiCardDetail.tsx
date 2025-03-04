
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Activity, BrainCircuit } from "lucide-react";
import { ApiCardDetailProps } from "@/types/systemHealth";
import { getApiIcon, getApiName, getFixSuggestion } from "./ApiIcon";
import { getStatusBadge } from "./ApiStatusIndicator";

export const ApiCardDetail = ({ 
  api, 
  state, 
  expanded, 
  onRetry,
  onTestModels 
}: ApiCardDetailProps) => {
  return (
    <div className="text-xs">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-2">
          {getApiIcon(api)}
          <span>{getApiName(api)}</span>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(state.status)}
          {state.status === "error" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0" 
                    onClick={() => onRetry(api)}
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
          
          {api === "openai" && state.status === "success" && state.models && state.models.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0" 
                    onClick={onTestModels}
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
      
      {expanded && state.status === "error" && state.message && (
        <div className="pl-6 pb-1 text-red-600 text-[10px]">
          {state.message}
        </div>
      )}
      
      {expanded && state.status === "error" && (
        <div className="pl-6 text-[10px] text-muted-foreground">
          <span className="font-medium">Fix: </span>
          {getFixSuggestion(api, state.status)}
        </div>
      )}
      
      {expanded && state.status === "success" && state.details && api === "openai" && (
        <div className="pl-6 pt-1">
          <div className="text-[10px] text-muted-foreground">
            <span className="font-medium">Available Models: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {state.details.availableModels.slice(0, 3).map((model: string) => (
                <Badge 
                  key={model} 
                  variant="outline" 
                  className="px-1.5 py-0 h-4 text-[9px] bg-blue-50"
                >
                  {model}
                </Badge>
              ))}
              {state.details.availableModels.length > 3 && (
                <Badge 
                  variant="outline" 
                  className="px-1.5 py-0 h-4 text-[9px] bg-blue-50"
                >
                  +{state.details.availableModels.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}
      
      {expanded && state.status === "success" && state.details && api === "pinecone" && (
        <div className="pl-6 pt-1">
          <div className="text-[10px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-medium">Vector count:</span>
              <span>{state.details.vectorCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Dimension:</span>
              <span>{state.details.dimension}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
