
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Info } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { isPineconeConfigured } from "@/services/vector/pineconeService";

interface RagToggleProps {
  ragEnabled: boolean;
  onRagToggle: (enabled: boolean) => void;
}

const RagToggle: React.FC<RagToggleProps> = ({ ragEnabled, onRagToggle }) => {
  const [isPineconeReady, setIsPineconeReady] = useState(false);
  
  useEffect(() => {
    // Check if Pinecone is configured
    setIsPineconeReady(isPineconeConfigured());
  }, []);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor="rag-toggle">Use RAG (Retrieval Augmented Generation)</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>RAG allows the AI to reference your website's existing content to create more accurate and consistent articles</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Switch
          id="rag-toggle"
          checked={ragEnabled && isPineconeReady}
          onCheckedChange={onRagToggle}
          disabled={!isPineconeReady}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {isPineconeReady 
          ? "Enhances content with relevant information from your website's existing content"
          : "Pinecone vector database not configured. RAG functionality is disabled."}
      </p>
    </div>
  );
};

export default RagToggle;
