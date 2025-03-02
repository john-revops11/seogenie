
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertCircle } from 'lucide-react';
import { isPineconeConfigured } from '@/services/vector/pineconeService';

interface RagSettingsProps {
  ragEnabled: boolean;
  onRagToggle: (enabled: boolean) => void;
}

const RagSettings: React.FC<RagSettingsProps> = ({ 
  ragEnabled,
  onRagToggle
}) => {
  const isPineconeAvailable = isPineconeConfigured();
  
  const handleToggle = (checked: boolean) => {
    if (checked && !isPineconeAvailable) {
      // Don't enable if Pinecone is not available
      return;
    }
    onRagToggle(checked);
  };
  
  if (!isPineconeAvailable) {
    return (
      <div className="p-3 border rounded-md bg-muted/10 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium cursor-pointer">RAG Enhancement</Label>
          </div>
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <AlertCircle className="h-3 w-3" /> Not Available
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Configure Pinecone in Settings to enable RAG-enhanced content generation
        </p>
      </div>
    );
  }
  
  return (
    <div className="p-3 border rounded-md bg-muted/10 space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <Label htmlFor="rag-toggle" className="text-sm font-medium cursor-pointer">
            RAG Enhancement
          </Label>
        </div>
        <Switch
          id="rag-toggle"
          checked={ragEnabled}
          onCheckedChange={handleToggle}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {ragEnabled 
          ? "Using vector database to enhance content with relevant context" 
          : "Enable to use Pinecone for enhanced content quality"}
      </p>
      {ragEnabled && (
        <Badge variant="outline" className="flex items-center gap-1 border-amber-500 text-amber-600">
          <Sparkles className="h-3 w-3" /> RAG Enabled
        </Badge>
      )}
    </div>
  );
};

export default RagSettings;
