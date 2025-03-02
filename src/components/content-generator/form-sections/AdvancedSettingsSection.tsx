
import React from "react";
import { Label } from "@/components/ui/label";
import { Settings, ExternalLink } from "lucide-react";
import RagSettings from "../RagSettings";
import { isPineconeConfigured } from "@/services/vector/pineconeService";
import { Button } from "@/components/ui/button";

interface AdvancedSettingsSectionProps {
  ragEnabled: boolean;
  onRagToggle: (enabled: boolean) => void;
}

const AdvancedSettingsSection: React.FC<AdvancedSettingsSectionProps> = ({
  ragEnabled,
  onRagToggle
}) => {
  const isPineconeReady = isPineconeConfigured();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-base">Advanced Settings</Label>
        <Settings className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <RagSettings 
        ragEnabled={ragEnabled && isPineconeReady} 
        onRagToggle={onRagToggle}
      />
      
      {!isPineconeReady && (
        <div className="text-xs flex items-center justify-between">
          <span className="text-muted-foreground">
            Need a Pinecone account?
          </span>
          <Button 
            variant="link" 
            size="sm" 
            className="h-6 p-0 text-xs flex items-center gap-1"
            onClick={() => window.open("https://www.pinecone.io/", "_blank")}
          >
            Sign up for free <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground">
        These advanced settings help improve content quality and keyword organization
        by leveraging additional tools and technologies.
      </div>
    </div>
  );
};

export default AdvancedSettingsSection;
