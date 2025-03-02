
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { InfoIcon, Sparkles } from "lucide-react";
import { isPineconeConfigured } from "@/services/vector/pineconeService";
import PineconeConfigForm from "./PineconeConfigForm";

interface RagSettingsProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const RagSettings = ({ enabled, onToggle }: RagSettingsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isPineconeReady = isPineconeConfigured();
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <Label htmlFor="rag-toggle" className="text-sm font-medium">
              RAG-Enhanced Content
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-80 text-xs">
                    Retrieval Augmented Generation (RAG) uses Pinecone vector database 
                    to find related content and enhance keyword organization.
                    This improves content relevance and quality.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            {!isPineconeReady && (
              <Badge variant="outline" className="text-xs">
                Setup Required
              </Badge>
            )}
            {enabled && isPineconeReady && (
              <Badge variant="success" className="text-xs bg-green-600 text-white">
                Active
              </Badge>
            )}
            <Switch
              id="rag-toggle"
              checked={enabled && isPineconeReady}
              onCheckedChange={onToggle}
              disabled={!isPineconeReady}
            />
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground pl-6">
          {isPineconeReady
            ? "Organize keywords using vector similarity search for improved content quality."
            : "Configure Pinecone to enable RAG-enhanced content generation."}
        </p>
      </div>
      
      <div 
        className="underline text-xs text-muted-foreground cursor-pointer pl-6"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? "Hide configuration" : "Show configuration"}
      </div>
      
      {isExpanded && (
        <div className="pl-6 pt-2">
          <PineconeConfigForm />
        </div>
      )}
    </div>
  );
};

export default RagSettings;
