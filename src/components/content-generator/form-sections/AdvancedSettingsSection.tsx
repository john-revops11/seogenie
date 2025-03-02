
import React from "react";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import RagSettings from "../RagSettings";
import { isPineconeConfigured } from "@/services/vector/pineconeService";

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
      
      <div className="text-xs text-muted-foreground">
        These advanced settings help improve content quality and keyword organization
        by leveraging additional tools and technologies.
      </div>
    </div>
  );
};

export default AdvancedSettingsSection;
