
import React from "react";
import { Label } from "@/components/ui/label";
import { Settings, Database, FileText } from "lucide-react";
import { RagSettings } from "../RagSettings";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AdvancedTabContentProps {
  ragEnabled: boolean;
  onRagToggle: (enabled: boolean) => void;
  selectedKeywords?: string[];
}

export const AdvancedTabContent: React.FC<AdvancedTabContentProps> = ({
  ragEnabled,
  onRagToggle,
  selectedKeywords = [],
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-base">Advanced Settings</Label>
        <Settings className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <Alert className="bg-blue-50 border-blue-200">
        <FileText className="h-4 w-4" />
        <AlertTitle>SEO-Optimized Structured Content</AlertTitle>
        <AlertDescription className="text-xs">
          Content will be generated following SEO best practices with a clear structure: 
          H1 title, concise introduction, logical H2/H3 sections, properly formatted lists, real-world examples, 
          best practices, and a conclusion with next steps.
        </AlertDescription>
      </Alert>
      
      <RagSettings 
        enabled={ragEnabled} 
        onToggle={onRagToggle}
      />
      
      {selectedKeywords.length > 0 && (
        <div className="space-y-2 p-3 border rounded-md">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-muted-foreground" />
            <Label className="text-sm">RAG Knowledge Base Keywords</Label>
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedKeywords.map(keyword => (
              <Badge key={keyword} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            These keywords will be used to retrieve relevant knowledge from the vector database when RAG is enabled.
          </p>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground">
        These advanced settings help improve content quality and keyword organization
        by leveraging additional tools and technologies.
      </div>
    </div>
  );
};

export default AdvancedTabContent;

