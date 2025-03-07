
import React from "react";
import { Badge } from "@/components/ui/badge";
import { InfoIcon } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface ContentMetadataProps {
  contentType: string;
  generationMethod: string;
  ragInfo?: {
    chunksRetrieved: number;
    relevanceScore: number;
  };
}

const ContentMetadata: React.FC<ContentMetadataProps> = ({
  contentType,
  generationMethod,
  ragInfo
}) => {
  return (
    <div className="text-sm text-muted-foreground mb-4 flex flex-wrap gap-2 items-center">
      <div className="flex items-center">
        <span className="mr-2">Content Type:</span>
        <Badge variant="outline" className="capitalize">{contentType}</Badge>
      </div>
      
      <div className="flex items-center">
        <span className="mr-2">Generation:</span>
        <Badge 
          variant={generationMethod === 'rag' ? 'secondary' : 'outline'}
          className="capitalize"
        >
          {generationMethod === 'rag' ? 'RAG-Enhanced' : 'Standard'}
        </Badge>
      </div>
      
      {ragInfo && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-help">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <InfoIcon className="w-3 h-3" />
                  <span>RAG Info</span>
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Retrieved {ragInfo.chunksRetrieved} chunks</p>
              <p>Average relevance score: {ragInfo.relevanceScore.toFixed(2)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default ContentMetadata;
